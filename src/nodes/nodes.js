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
	'DEFAULT'	: {
			'Viewpoint'	: {
				'Position'		: new THREE.Vector3 (0, 0, 10),
				'Orientation'	: '0 1 0 0',		// TODO: fix (and below) when handling orientation
				'Type'			: 'perpsective',
				'Motion'		: 'none',
				'MotionSpeed'	: 1.0,
			},
			'Navigation' : {
				'Speed'		: 1.0,		// 16 spr (1 revolution per 16 seconds), in mseconds.
				'Type'		: 'none',
				'Setup'		: 'none',
			}
		},
	'init'	: function (e,p)
		{
			// Create default Viewpoint and Navigation
			xseen.sceneInfo[0].stacks.Viewpoints.setDefault(
				{
					'position'	: this.DEFAULT.Viewpoint.Position,
					'type'		: this.DEFAULT.Viewpoint.Type,
					'motion'	: this.DEFAULT.Viewpoint.Motion,
					'motionspeed': this.DEFAULT.Viewpoint.MotionSpeed / 1000,
					'domNode'	: e,
					'fields'	: {},
				}
			);
			xseen.sceneInfo[0].stacks.Navigation.setDefault(
				{
					'speed'		: this.DEFAULT.Navigation.Speed / 1000,
					'type'		: this.DEFAULT.Navigation.Type,
					'setup'		: this.DEFAULT.Navigation.Setup,
					'domNode'	: e,
					'fields'	: {},
				}
			);

			var width = e._xseen.sceneInfo.size.width;
			var height = e._xseen.sceneInfo.size.height;
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (width, height);
			var perspectiveCamera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			var orthoCamera = new THREE.OrthographicCamera( 75, width / height, 0.1, 1000 );
			//perspectiveCamera.translateX(this.DEFAULT.Viewpoint.Position.x).translateY(this.DEFAULT.Viewpoint.Position.y).translateZ(this.DEFAULT.Viewpoint.Position.z);	// Default position
			//orthoCamera.translateX(this.DEFAULT.Viewpoint.Position.x).translateY(this.DEFAULT.Viewpoint.Position.y).translateZ(this.DEFAULT.Viewpoint.Position.z);			// Default position
			perspectiveCamera.position.x = this.DEFAULT.Viewpoint.Position.x;	// Default position
			perspectiveCamera.position.y = this.DEFAULT.Viewpoint.Position.y;	// Default position
			perspectiveCamera.position.z = this.DEFAULT.Viewpoint.Position.z;	// Default position
			orthoCamera.position.x = this.DEFAULT.Viewpoint.Position.x;			// Default position
			orthoCamera.position.y = this.DEFAULT.Viewpoint.Position.y;			// Default position
			orthoCamera.position.z = this.DEFAULT.Viewpoint.Position.z;			// Default position

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
						'controls'		: {},		// Used for navigation
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
			var nav = xseen.sceneInfo[0].stacks.Navigation.getActive();
			var currentCamera = e._xseen.renderer.activeCamera;
			var currentRenderer = e._xseen.renderer.activeRender;
			currentCamera.position.x = vp.position.x;
			currentCamera.position.y = vp.position.y;
			currentCamera.position.z = vp.position.z;
			e._xseen.renderer.controls = xseen.Navigation.setup[nav.setup] (currentCamera, currentRenderer);
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
