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

 // Node definition code (just stubs right now...)


xseen.node.core_NOOP = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.core_WorldInfo = {
	'init'	: function (e,p) {parsing('WorldInfo', e)},
	'fin'	: function (e,p) {}
};

function parsing (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.unk_Viewpoint = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints
			e._xseen.fields._radius0 = Math.sqrt(	e._xseen.fields.position[0]*e._xseen.fields.position[0] + 
													e._xseen.fields.position[1]*e._xseen.fields.position[1] + 
													e._xseen.fields.position[2]*e._xseen.fields.position[2]);
			if (!e._xseen.sceneInfo.tmp.activeViewpoint) {
				e._xseen.sceneInfo.stacks.Viewpoints.pushDown(e);
				e._xseen.sceneInfo.tmp.activeViewpoint = true;
			}
			
			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
		},
	'fin'	: function (e,p) {},

	'setactive'	: function (ev)
		{
			// TODO: This works, except when going from Stereo to Mono. Only the left half of the screen shows
			this.destination._xseen.sceneInfo.element._xseen.renderer.activeCamera = 
				this.destination._xseen.sceneInfo.element._xseen.renderer.cameras[this.destination._xseen.fields.type];
			this.destination._xseen.sceneInfo.element._xseen.renderer.activeRender = 
				this.destination._xseen.sceneInfo.element._xseen.renderer.renderEffects[this.destination._xseen.fields.type];
			//this.destination._xseen.animating.start();
		},
};

xseen.node.unk_Shape = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
//			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			if (typeof(e._xseen.materialProperty) !== 'undefined') {
				e._xseen.appearance.vertexColors = THREE.VertexColors;
				//e._xseen.appearance.vertexColors = THREE.FaceColors;
				e._xseen.appearance._needsUpdate = true;
				e._xseen.appearance.needsUpdate = true;
			}
			var mesh = new THREE.Mesh (e._xseen.geometry, e._xseen.appearance);
			mesh.userData = e;
			p._xseen.children.push(mesh);
			p._xseen.sceneInfo.selectable.push(mesh);
			mesh = null;
		}
};

xseen.node.grouping_Transform = {
	'init'	: function (e,p) 
		{
			var group = new THREE.Group();
			if (e.nodeName == "TRANSFORM") {
				var rotation = xseen.types.Rotation2Quat(e._xseen.fields.rotation);
				group.name = 'Transform children [' + e.id + ']';
				group.position.x	= e._xseen.fields.translation[0];
				group.position.y	= e._xseen.fields.translation[1];
				group.position.z	= e._xseen.fields.translation[2];
				group.scale.x		= e._xseen.fields.scale[0];
				group.scale.y		= e._xseen.fields.scale[1];
				group.scale.z		= e._xseen.fields.scale[2];
				group.quaternion.x	= rotation.x;
				group.quaternion.y	= rotation.y;
				group.quaternion.z	= rotation.z;
				group.quaternion.w	= rotation.w;

				e._xseen.animate['translation'] = group.position;
				e._xseen.animate['rotation'] = group.quaternion;
				e._xseen.animate['scale'] = group.scale;
			}
			e._xseen.sceneNode = group;
		},
	'fin'	: function (e,p)
		{
			// Apply transform to all objects in e._xseen.children
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					e._xseen.sceneNode.add(child);
				});
			p._xseen.children.push(e._xseen.sceneNode);
		}
};

xseen.node.lighting_Light = {
	'init'	: function (e,p) 
		{
			var color = xseen.types.Color3toInt (e._xseen.fields.color);
			var intensity = e._xseen.fields.intensity - 0;
			var lamp, type=e._xseen.fields.type.toLowerCase();
/*
			if (typeof(p._xseen.children) == 'undefined') {
				console.log('Parent of Light does not have children...');
				p._xseen.children = [];
			}
 */

			if (type == 'point') {
				// Ignored field -- e._xseen.fields.location
				lamp = new THREE.PointLight (color, intensity);
				lamp.distance = Math.max(0.0, e._xseen.fields.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.fields.attenuation[1]/2 + e._xseen.fields.attenuation[2]);

			} else if (type == 'spot') {
				lamp = new THREE.SpotLight (color, intensity);
				lamp.position.set(0-e._xseen.fields.direction[0], 0-e._xseen.fields.direction[1], 0-e._xseen.fields.direction[2]);
				lamp.distance = Math.max(0.0, e._xseen.fields.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.fields.attenuation[1]/2 + e._xseen.fields.attenuation[2]);
				lamp.angle = Math.max(0.0, Math.min(1.5707963267948966192313216916398, e._xseen.fields.cutoffangle));
				lamp.penumbra = 1 - Math.max(0.0, Math.min(lamp.angle, e._xseen.fields.beamwidth)) / lamp.angle;

			} else {											// DirectionalLight (by default)
				lamp = new THREE.DirectionalLight (color, intensity);
				lamp.position.x = 0-e._xseen.fields.direction[0];
				lamp.position.y = 0-e._xseen.fields.direction[1];
				lamp.position.z = 0-e._xseen.fields.direction[2];
			}
			p._xseen.children.push(lamp);
			lamp = null;
		}
		,
	'fin'	: function (e,p)
		{
		}
};

xseen.node.networking_Inline = {
	'init'	: function (e,p) 
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				var uri = xseen.parseUrl (e._xseen.fields.url);
				var type = uri.extension;
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Inline content [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				var userdata = {'requestType':'x3d', 'e':e, 'p':p}
				if (type.toLowerCase() == 'json') {
					userdata.requestType = 'json';
					xseen.loadMgr.loadJson (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, userdata);
				} else {
					xseen.loadMgr.loadXml (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, userdata);
				}
				e._xseen.requestedUrl = true;
			}
			//if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e,p)
		{
		},

	'loadSuccess' :
				function (response, userdata, xhr) {
					userdata.e._xseen.processedUrl = true;
					userdata.e._xseen.loadResponse = response;
					console.log("download successful for "+userdata.e.id);
					if (userdata.requestType == 'json') {
						var tmp = {'scene': response};
						response = null;
						response = (new JSONParser()).parseJavaScript(tmp);
					}
					var start = {'_xseen':0};
					var findSceneTag = function (fragment) {
						if (typeof(fragment._xseen) === 'undefined') {fragment._xseen = {'childCount': -1};}
						if (fragment.nodeName.toLowerCase() == 'scene') {
							start = fragment;
							return;
						} else if (fragment.children.length > 0) {
							for (fragment._xseen.childCount=0; fragment._xseen.childCount<fragment.children.length; fragment._xseen.childCount++) {
								findSceneTag(fragment.children[fragment._xseen.childCount]);
								if (start._xseen !== 0) {return;}
							}
						} else {
							return;
						}
					}
					findSceneTag (response);	// done this way because function is recursive
					if (start._xseen !== 0) {	// Found 'scene' tag. Need to parse and insert
						console.log("Found legal X3D file with 'scene' tag");
						while (start.children.length > 0) {
							userdata.e.appendChild(start.children[0]);
						}
						xseen.Parse(userdata.e, userdata.p, userdata.p._xseen.sceneInfo);
						userdata.e._xseen.children.forEach (function (child, ndx, wholeThing)
							{
								userdata.e._xseen.loadGroup.add(child);
console.log ('...Adding ' + child.type + ' (' + child.name + ') to Inline Group? with UUID ' + userdata.e._xseen.loadGroup.uuid + ' (' + userdata.e._xseen.loadGroup.name + ')');
							});
						userdata.p._xseen.sceneInfo.scene.updateMatrixWorld();
						//xseen.debug.logInfo("Complete work on Inline...");
					} else {
						console.log("Found illegal X3D file -- no 'scene' tag");
					}
					// Parse (start, userdata.p)...	
				}
};

/*
 * Most of this stuff is only done once per XSeen element. Loading of Inline contents should not
 * repeat the definitions and canvas creation
 */
xseen.node.core_Scene = {
	'init'	: function (e,p)
		{
			var width = e._xseen.sceneInfo.size.width;
			var height = e._xseen.sceneInfo.size.height;
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (width, height);
			var perspectiveCamera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			var orthoCamera = new THREE.OrthographicCamera( 75, width / height, 0.1, 1000 );
			perspectiveCamera.translateX(0).translateY(0).translateZ(10);	// Default position
			orthoCamera.translateX(0).translateY(0).translateZ(10);			// Default position

			// Stereo viewing effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(x_renderer);

			e.appendChild (x_renderer.domElement);
			e._xseen.renderer = {
						'canvas' 		: e._xseen.sceneInfo.scene,
						'width'			: width,
						'height'		: height,
						'cameras'		: {
									'perspective'	: perspectiveCamera,
									'ortho'			: orthoCamera,
									'stereo'		: perspectiveCamera,
											},		// Removed .sceneInfo camera because this node defines the camera
						'effects'		: x_effect,
						'renderEffects'	: {
									'normal'		: x_renderer,
									'perspective'	: x_renderer,
									'ortho'			: x_renderer,
									'stereo'		: x_effect,
											},
						'activeRender'	: {},
						'activeCamera'	: {},
						};
			e._xseen.renderer.activeRender = e._xseen.renderer.renderEffects.normal;
			e._xseen.renderer.activeCamera = e._xseen.renderer.cameras.perspective;
		},

/*
 * This appears now to be working!!!
 *
 * Late loading content is not getting inserted into the scene graph for rendering. Need to read
 * THREE docs about how to do that.
 * Camera will need to be redone. Existing camera is treated as a special child. A separate camera
 * should be established and Viewpoint nodes define "photostops" rather than a camera. The camera is 
 * in effect, parented to the "photostop". This probably needs to list of Viewpoints discussed in the
 * X3D specification.
 */
	'fin'	: function (e,p)
		{
			// Render all Children
			//xseen.renderNewChildren (e._xseen.children, e._xseen.renderer.canvas);
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					console.log('Adding child of type ' + child.type + ' (' + child.name + ')');
					e._xseen.renderer.canvas.add(child);
				});
			xseen.dumpSceneGraph ();
//			e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );
//			xseen.debug.logInfo("Rendered all elements -- Starting animation");
/*
 * TODO: Need to get current top-of-stack for all stack-bound nodes and set them as active.
 *	This only happens the initial time for each XSeen tag in the main HTML file
 *
 *	At this time, only Viewpoint is stack-bound. Probably need to stack just the <Viewpoint>._xseen object.
 *	Also, .fields.position is the initial specified location; not the navigated/animated one
 */
			var vp = xseen.sceneInfo[0].stacks.Viewpoints.getActive();
			var currentCamera = e._xseen.renderer.activeCamera;
			currentCamera.position.x = vp._xseen.fields.position[0];
			currentCamera.position.y = vp._xseen.fields.position[1];
			currentCamera.position.z = vp._xseen.fields.position[2];
			xseen.debug.logInfo("Ready to kick off rendering loop");
			xseen.renderFrame();
		},

};

xseen.node.env_Background = {
	'init'	: function (e,p) 
		{
			var color = new THREE.Color(e._xseen.fields.skycolor[0], e._xseen.fields.skycolor[1], e._xseen.fields.skycolor[2]);
			var textureCube = new THREE.CubeTextureLoader()
									.load ([e._xseen.fields.srcright,
											e._xseen.fields.srcleft,
											e._xseen.fields.srctop,
											e._xseen.fields.srcbottom,
											e._xseen.fields.srcfront,
											e._xseen.fields.srcback],
											this.loadSuccess({'e':e, 'p':p})
										);
			e._xseen.sceneInfo.scene.background = color;
/*
			var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
			var size = 1;
			//var geometry = new THREE.BoxGeometry(200, 200, 2);
			var geometry = new THREE.Geometry();
			geometry.vertices.push (
							new THREE.Vector3(-size, -size,  size),
							new THREE.Vector3( size, -size,  size),
							new THREE.Vector3( size, -size, -size),
							new THREE.Vector3(-size, -size, -size),
							new THREE.Vector3(-size,  size,  size),
							new THREE.Vector3( size,  size,  size),
							new THREE.Vector3( size,  size, -size),
							new THREE.Vector3(-size,  size, -size)
									);

			geometry.faces.push (	// external facing geometry
							new THREE.Face3(0, 1, 5),
							new THREE.Face3(0, 5, 4),
							new THREE.Face3(1, 2, 6),
							new THREE.Face3(1, 6, 5),
							new THREE.Face3(2, 3, 7),
							new THREE.Face3(2, 7, 6),
							new THREE.Face3(3, 0, 4),
							new THREE.Face3(3, 4, 7),
							new THREE.Face3(4, 5, 6),
							new THREE.Face3(4, 6, 7),
							new THREE.Face3(0, 2, 1),
							new THREE.Face3(0, 3, 2),
									);
			geometry.computeBoundingSphere();
			var mesh = new THREE.Mesh (geometry, material);
			e._xseen.sceneInfo.element._xseen.renderer.canvas.add(mesh);
*/
		},

	'fin'	: function (e,p)
		{
			p._xseen.appearance = e._xseen.material;
		},

	'loadSuccess' : function (userdata)
		{
			var e = userdata.e;
			var p  = userdata.p;
			return function (textureCube)
			{
				e._xseen.processedUrl = true;
				e._xseen.loadTexture = textureCube;
				e._xseen.sceneInfo.scene.background = textureCube;
			}
		},

};
