/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 // Node definition code for A-Frame nodes


xseen.node.x_Model = {
	'init'	: function (e,p)
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Exteranal Model [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				var uri = xseen.parseUrl (e._xseen.fields.src);
				var loader = xseen.loader[xseen.loadMime[uri.extension].loader];
				loader.load (e._xseen.fields.src, this.loadSuccess({'e':e, 'p':p}), xseen.loadProgress, xseen.loadError);
				e._xseen.requestedUrl = true;
			}
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},

	'fin'	: function (e,p)
		{
		},

					// Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
	'loadSuccess' : function (userdata) {
						var e = userdata.e;
						var p  = userdata.p;
						return function (response) {
							e._xseen.processedUrl = true;
							e._xseen.loadText = response;
							console.log("download successful for "+e.id);
							e._xseen.loadGroup.add(response.scene);		// This works for glTF
							p._xseen.sceneInfo.scene.updateMatrixWorld();
							if (response.animations !== null) {				// This is probably glTF specific
								e._xseen.mixer = new THREE.AnimationMixer (response.scene);
								e._xseen.sceneInfo.mixers.push (e._xseen.mixer);
							} else {
								e._xseen.mixer = null;
							}

							if (e._xseen.fields.playonload != '' && e._xseen.mixer !== null) {			// separate method?
								if (e._xseen.fields.playonload == '*') {			// Play all animations
									response.animations.forEach( function ( clip ) {
										//console.log('  starting animation for '+clip.name);
										if (e._xseen.fields.duration > 0) {clip.duration = e._xseen.fields.duration;}
										e._xseen.mixer.clipAction( clip ).play();
									} );
								} else {											// Play a specific animation
									var clip = THREE.AnimationClip.findByName(response.animations, e._xseen.fields.playonload);
									var action = e._xseen.mixer.clipAction (clip);
									action.play();
								}
							}
						}
					}
};


xseen.node.x_Route = {
	'init'	: function (e,p)
		{
			var dest = e._xseen.fields.destination;
			var externalHandler = false;
			if (e._xseen.fields.source == '' || e._xseen.fields.event == '' || 
				typeof(window[dest]) !== 'function' && (dest == '' || e._xseen.fields.event == '' || e._xseen.fields.field == '')) {
				xseen.debug.logError ('Route node missing field. No route setup. Source: '+e._xseen.fields.source+'.'+e._xseen.fields.event+'; Destination: '+dest+'.'+e._xseen.fields.field+';');
				return;
			} else if (typeof(window[dest]) === 'function') {
				externalHandler = true;
			}
			// Check existence of source and destination elements
			eSource = document.getElementById (e._xseen.fields.source);
			if (! externalHandler) {
				eDestination = document.getElementById (dest);
				if (typeof(eSource) === 'undefined' || typeof(eDestination) === 'undefined') {
					xseen.debug.logError ('Source or Destination node does not exist. No route setup');
					return;
				}
				// Get field information -- perhaps there is some use in the Animate node?
				fField = xseen.nodes._getFieldInfo (eDestination.nodeName, e._xseen.fields.field);
				if (typeof(fField) === 'undefined' || !fField.good) {
					xseen.debug.logError ('Destination field does not exist or incorrectly specified. No route setup');
					return;
				}
				// Set up listener on source node for specified event. The listener code is the 'set<field>' method for the
				// node. It is passed the DOM 'event' data structure. Since there may be more than one node of the type
				// specified by 'destination', the event handler is attached to the node in e._xseen.handlers. This is done
				// when the node is parsed
				xseen.Events.addHandler (e, eSource, e._xseen.fields.event, eDestination, fField);

			} else {			// External (to XSeen) event handler
				var handler = window[dest];
				eSource.addEventListener ('xseen', handler);
			}
		},

	'fin'	: function (e,p)
		{
		},
	'evHandler' : function (u)
		{
			var de = u.e;
			var df = u.f;
			return de._xseen.handlers[df.handlerName];
		},
};
