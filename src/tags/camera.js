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

 // Control Node definitions

XSeen.Tags.camera = {
	'init'	: function (e, p) 
		{
			e._xseen.properties = {};
			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.type = e._xseen.attributes.type;
			e._xseen.track = e._xseen.attributes.track;
			if (e._xseen.track == 'examine') e._xseen.track = 'trackball';
			if (e._xseen.track == 'device' && !e._xseen.sceneInfo.hasDeviceOrientation) e._xseen.track = 'orbit';
			e._xseen.sceneInfo.Camera.position.set (
							e._xseen.attributes.position.x,
							e._xseen.attributes.position.y,
							e._xseen.attributes.position.z);
			if (e._xseen.type == 'perspective') {			// Already exists

			} else if (e._xseen.type == 'stereo') {			// TODO: need to implement
				e._xseen.sceneInfo.Renderer = e._xseen.sceneInfo.RendererStereo;
				e._xseen.sceneInfo.rendererHasControls = false;
				e._xseen.sceneInfo.isStereographic = true;

			} else if (e._xseen.type == 'orthographic') {	// TODO: need to implement -- change camera type

			} else if (e._xseen.type == 'vr') {
				if (e._xseen.sceneInfo.isVrCapable) {
					e._xseen.sceneInfo.Renderer.vr.enabled = true;
					e._xseen.sceneInfo.rendererHasControls = true;
					document.body.appendChild( WEBVR.createButton( e._xseen.sceneInfo.Renderer ) );
				} else {									// TODO: create split screen and navigation mode
					XSeen.LogWarn ('VR display requested, but not capable. Rolling over to stereographic');
					e._xseen.sceneInfo.Renderer = e._xseen.sceneInfo.RendererStereo;
					e._xseen.sceneInfo.rendererHasControls = false;
					e._xseen.sceneInfo.isStereographic = true;
					if (e._xseen.track != 'none') e._xseen.track = 'device';
					//e._xseen.sceneInfo.Renderer.controls = new THREE.DeviceOrientationControls(e._xseen.sceneInfo.Camera);
					//e._xseen.sceneInfo.Renderer.controls = new THREE.OrbitControls( e._xseen.sceneInfo.Camera, e._xseen.sceneInfo.Renderer.domElement );
					//controls.addEventListener( 'change', render ); // remove when using animation loop
					// enable animation loop when using damping or autorotation
					//controls.enableDamping = true;
					//controls.dampingFactor = 0.25;
					//controls.enableZoom = false;
					//e._xseen.sceneInfo.Renderer.controls.enableZoom = true;
				}
			}
			XSeen.LogInfo("Renderer has controls: |"+e._xseen.sceneInfo.rendererHasControls+"|; Device has orientation: |"+e._xseen.sceneInfo.hasDeviceOrientation+"|");
			if (!e._xseen.sceneInfo.rendererHasControls) {
				if (e._xseen.sceneInfo.hasDeviceOrientation && e._xseen.track == 'device') {
					// TODO: check for proper enabling of DeviceControls
					e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.sceneInfo.Camera);
				} else if (e._xseen.track == 'orbit') {
					e._xseen.sceneInfo.CameraControl = new THREE.OrbitControls( e._xseen.sceneInfo.Camera, e._xseen.sceneInfo.Renderer.domElement );
				} else if (e._xseen.track == 'trackball') {
				}
			}

/* For handling events
			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
 */
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr)
		{
		},

	'tick'	: function (systemTime, deltaTime)
		{
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'camera',
						'init'	: XSeen.Tags.camera.init,
						'fin'	: XSeen.Tags.camera.fin,
						'event'	: XSeen.Tags.camera.event,
						'tick'	: XSeen.Tags.camera.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'perspective', enumeration:['perspective','stereo','orthographic','vr'], isCaseInsensitive:true})
		.defineAttribute ({'name':'track', dataType:'string', 'defaultValue':'none', enumeration:['none', 'orbit', 'fly', 'examine', 'trackball', 'device'], isCaseInsensitive:true})
		.addTag();
