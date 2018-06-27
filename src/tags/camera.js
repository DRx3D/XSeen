/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
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
			e._xseen.sceneInfo.Camera.position.set (
							e._xseen.attributes.position.x,
							e._xseen.attributes.position.y,
							e._xseen.attributes.position.z);
			e._xseen.sceneInfo.Camera.lookAt(0,0,0);		// Look at origin. Seems to be required for object type.
/*
 * Handle camera target. Target is an HTML id attribute value,
 * must exist, and be defined (and parsed) prior to the camera tag parsing.
 * This section handles the existence and gets the tagObject associated with the referenced tag.
 */
			e._xseen.target = null;
			if (e._xseen.attributes.target != '') {
				var tagElement = document.getElementById (e._xseen.attributes.target);
				if (typeof(tagElement) == 'object' && typeof(tagElement._xseen) != 'undefined' && typeof(tagElement._xseen.tagObject) != 'undefined') {
					e._xseen.target = tagElement._xseen.tagObject;
				}
			}
 
/*
 *	Handle the camera type and tracking capabilities
 *	The allowed types and capabilities are dependent on the display device
 *	(isVrCapable and hasDeviceOrientation). 
 *
 *	'orthographic'	==> all devices support and all manual tracking is allowed (no VR, no Device)
 *	'perspective'	==> all devices support and all manual tracking is allowed. Device tracking is allowed if hasDeviceOrientation
 *	'stereo'		==> all devices support and all manual tracking is allowed. Device tracking is allowed if hasDeviceOrientation
 *						Object tracking is allowed if hasDeviceOrientation and target != null
 *	'vr'			==> only allowed if isVrCapable
 *
 *	Rollbacks: If the requested type and/or tracking is not allowed the the following rollback is used:
 *
 *	'vr'		==> stereo/device OR stereo/target if hasDeviceOrientation
 *				==> perspective/orbit otherwise
 *	'device'	==> orbit if !hasDeviceOrientation
 */
 
			if (e._xseen.type == 'orthographic') {			// TODO: Orthographic projection
			
			} else if (e._xseen.type == 'perspective') {	// Perspective camera -- default
				if (e._xseen.track == 'device') {
					if (e._xseen.sceneInfo.hasDeviceOrientation) {
						e._xseen.track = (e._xseen.target === null) ? 'environment' : 'object'
						e._xseen.sceneInfo.useDeviceOrientation = true;
					} else {
						e._xseen.track = 'orbit';
						e._xseen.sceneInfo.useDeviceOrientation = false;
					}
				}
				
			} else if (e._xseen.type == 'stereo') {	// Stereo perspective cameras
				var track = (e._xseen.target === null) ? 'environment' : 'object'
				if (e._xseen.track == 'device' && !e._xseen.sceneInfo.hasDeviceOrientation) {track = 'orbit';}
				e._xseen.track = track;
				e._xseen.sceneInfo.Renderer = e._xseen.sceneInfo.RendererStereo;
				e._xseen.sceneInfo.rendererHasControls = false;
				e._xseen.sceneInfo.isStereographic = true;
				// Need to add a button to the display to go full screen
 
			} else if (e._xseen.type == 'vr') {	// Stereo perspective cameras
				if (e._xseen.sceneInfo.isVrCapable) {
					e._xseen.sceneInfo.Renderer.vr.enabled = true;
					e._xseen.sceneInfo.rendererHasControls = true;
					document.body.appendChild( WEBVR.createButton( e._xseen.sceneInfo.Renderer ) );
				} else if (e._xseen.sceneInfo.hasDeviceOrientation) {
					e._xseen.type = 'stereo';
					e._xseen.track = 'device';
					e._xseen.sceneInfo.Renderer = e._xseen.sceneInfo.RendererStereo;
					e._xseen.sceneInfo.rendererHasControls = false;
					e._xseen.sceneInfo.isStereographic = true;
					// Need to add a button to the display to go full screen
				} else {													// Flat screen
					e._xseen.type = 'perspective';
					e._xseen.track = 'orbit';
				}
			}

/*
 *	This code not needed because of login when handling _xseen.type above
 *
//	Now handle object tracking. Only allowed if stereo, hasDeviceOrientation, and target != null

			if (e._xseen.target !== null) {
				//if (e._xseen.type == 'stereo' && e._xseen.sceneInfo.hasDeviceOrientation) {
				if (e._xseen.sceneInfo.hasDeviceOrientation) {
					e._xseen.track = 'object';
				} else {
					e._xseen.target = null;
				}
			}
 */

/*
 *	Handle camera controls for (navigational) tracking. 
 *	This applies to stereo (device & object) and perspective with track != none.
 *	TODO: orthographic camera
 */
			if (!e._xseen.sceneInfo.rendererHasControls) {
				if (e._xseen.sceneInfo.useDeviceOrientation) {
					if (e._xseen.track == 'object') {	// tracking scene object
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.target, true);
					} else {							// tracking environment
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.sceneInfo.Camera);
					}

				} else {								// No device orientation control. Use something else
					if (e._xseen.track == 'orbit') {
						e._xseen.sceneInfo.CameraControl = new THREE.OrbitControls( e._xseen.sceneInfo.Camera, e._xseen.sceneInfo.RendererStandard.domElement );
					} else if (e._xseen.track == 'trackball') {
						//console.log ('Trackball');
					} else if (e._xseen.track == 'none') {
						//console.log ('No tracking');
						e._xseen.sceneInfo.rendererHasControls = true;
					} else {
						console.log ('Something else');
					}
				}
			}


/*
			if (e._xseen.sceneInfo.isStereographic && e._xseen.sceneInfo.hasDeviceOrientation) {
					if (e._xseen.track == 'object') {
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.target, true);
					} else {
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.sceneInfo.Camera);
					}
				} else if (e._xseen.sceneInfo.hasDeviceOrientation && e._xseen.track == 'object') {
					e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.target, true);
				} else if (e._xseen.track == 'orbit') {
					e._xseen.sceneInfo.CameraControl = new THREE.OrbitControls( e._xseen.sceneInfo.Camera, e._xseen.sceneInfo.RendererStandard.domElement );
				} else if (e._xseen.track == 'trackball') {
					//console.log ('Trackball');
				} else if (e._xseen.track == 'none') {
					//console.log ('No tracking');
					e._xseen.sceneInfo.rendererHasControls = true;
				} else {
					console.log ('Something else');
				}
			}
 */


/*
 * OLD code -- waiting for working confirmation of above
 *
			// Handle camera type (perspective, orthographic, vr, etc.)
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
					e._xseen.sceneInfo.isStereographic = true;
					e._xseen.sceneInfo.rendererHasControls = false;
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
			//console.log("Setting up controls...");
			//console.log (" - Renderer has controls: |"+e._xseen.sceneInfo.rendererHasControls+"|");
			//console.log (" - Device has orientation: |"+e._xseen.sceneInfo.hasDeviceOrientation+"|");
			//console.log (" - Track: |"+e._xseen.track+"|");
			XSeen.LogInfo("Renderer has controls: |"+e._xseen.sceneInfo.rendererHasControls+"|; Device has orientation: |"+e._xseen.sceneInfo.hasDeviceOrientation+"|");
			if (!e._xseen.sceneInfo.rendererHasControls) {
				if (e._xseen.sceneInfo.hasDeviceOrientation && e._xseen.track == 'device') {
					// TODO: check for proper enabling of DeviceControls
					//console.log ('Adding DeviceOrientationControls');
					if (typeof(e._xseen.target) != 'undefined' && e._xseen.target != null) {
						console.log ('Targeting controls to ' + e._xseen.target.name);
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.target, true);
					} else {
						console.log ('Targeting controls to camera');
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.sceneInfo.Camera);
					}
				} else if (e._xseen.track == 'orbit' || (e._xseen.track == 'device' && !e._xseen.sceneInfo.hasDeviceOrientation)) {
					//console.log ('Adding OrbitControls');
					e._xseen.sceneInfo.CameraControl = new THREE.OrbitControls( e._xseen.sceneInfo.Camera, e._xseen.sceneInfo.RendererStandard.domElement );
				} else if (e._xseen.track == 'trackball') {
					//console.log ('Trackball');
				} else if (e._xseen.track == 'none') {
					//console.log ('No tracking');
					e._xseen.sceneInfo.rendererHasControls = true;
				} else {
					console.log ('Something else');
				}
			} else {
				console.log ('Renderer has controls...');
			}
*/


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
		.defineAttribute ({'name':'target', dataType:'string', 'defaultValue':''})
		.addTag();
