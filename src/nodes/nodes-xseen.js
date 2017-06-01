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
//							e._xseen.children.forEach (function (child, ndx, wholeThing)
//							{
//								e._xseen.loadGroup.add(child);
//	console.log ('...Adding ' + child.type + ' (' + child.name + ') to Inline Group? with UUID ' + userdata.e._xseen.loadGroup.uuid + ' (' + e._xseen.loadGroup.name + ')');
//							});
							p._xseen.sceneInfo.scene.updateMatrixWorld();
						}
					}
};
