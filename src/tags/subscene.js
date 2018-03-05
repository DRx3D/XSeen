/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 */

 // Control Node definitions
 
/*
 * xxTODO: Update xseen... XSeen...
 * TODO: Add standard position, rotation, and scale fields with XSeen.Tags.setSpace method
 * TODO: Improve handling of file formats that the loaders cannot do version distinction (gltf)
 * xxTODO: Save current URL so any changes can be compared to increase performance
 * TODO: Add handling of changing model URL - need to stop & delete animations
 * TODO: Investigate how to add 'setValue' and 'getValue' to work with [s|g]etAttribute
 */

XSeen.Tags.subscene = {
	'init'	: function (e, p) 
		{
			e._xseen.processedUrl = false;
			e._xseen.loadGroup = new THREE.Group();
			e._xseen.loadGroup.name = 'External Scene [' + e.id + ']';
			XSeen.Tags._setSpace (e._xseen.loadGroup, e._xseen.attributes);
			console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
/*
			XSeen.Loader.load (e._xseen.attributes.src, '', XSeen.Tags.subscene.loadSuccess({'e':e, 'p':p}), XSeen.Tags.subscene.loadFailure, XSeen.Tags.subscene.loadProgress);
 */
			var loader = new THREE.ObjectLoader();
			loader.load (e._xseen.attributes.src, XSeen.Tags.subscene.loadSuccess({'e':e, 'p':p}), XSeen.Tags.subscene.loadProgress, XSeen.Tags.subscene.loadFailure);
			e._xseen.requestedUrl = true;
			e._xseen.tagObject = e._xseen.loadGroup;
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	
					// Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
	'loadProgress' : function (a1) {
		console.log ('Progress ('+a1.type+'): ' + a1.timeStamp);
	},
	'loadFailure' : function (a1) {
		console.log ('Failure ('+a1.type+'): ' + a1.timeStamp);
	},
	'loadSuccess' : function (userdata) {
						var e = userdata.e;
						var p  = userdata.p;
						return function (response) {
							e._xseen.processedUrl = true;
							e._xseen.requestedUrl = false;
							e._xseen.loadText = response;
							e._xseen.currentUrl = e._xseen.attributes.src;
							
							console.log ('Success');
							console.log("download successful for |"+e.id);
							//e._xseen.loadGroup.add(response.scene);		// This works for glTF
							e._xseen.loadGroup.add(response);		// What docs say for ObjectLoader
							p._xseen.sceneInfo.SCENE.updateMatrixWorld();

						}
					}
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'subscene',
						'init'	: XSeen.Tags.subscene.init,
						'fin'	: XSeen.Tags.subscene.fin,
						'event'	: XSeen.Tags.subscene.event,
						'tick'	: XSeen.Tags.subscene.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':''})
		.addTag();
