/*
 * XSeen JavaScript library
 *
 * (c)2018, Daly Realism, Los Angeles
 *
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen Camera Manager.
 * This object is the manager for all XSeen cameras.
 *
 * provides method for the addition and selection of a camera for scene viewing
 *
 *
 *
 */

var XSeen = XSeen || {};
XSeen.CameraManager = {
		'PRIORITY_MINIMUM'	: 0,
		'PRIORITY_DEFAULT'	: 1,
		'FOV'				: 50,		// Vertical field-of-view
		'NearClip'			: 0.1,
		'FarClip'			: 10000,
		'DefinedCameras'	: [],		// Contains references to camera nodes ...[priority][order]
		'CurrentNode'		: null,
		
/*
 * Create or reset the standard XSeen camera from THREE
 */
		'create'			: function (aspectRatio)
					{
						camera = new THREE.PerspectiveCamera( this.FOV, aspectRatio, this.NearClip, this.FarClip );
						return camera;
					},
		'reset'				: function (camera, aspectRatio)
					{
						camera.aspect = aspectRatio;
						camera.far = this.FarClip;
						camera.fov = this.FOV;
						camera.near = this.NearClip;
						camera.updateProjectionMatrix ();
						return camera;
					},
/*
 * Add an XSene camera. This is really a set of parameters defined by the 'camera' tag.
 */
		'add'				: function (camera)
					{
						console.log ('Adding camera#' + camera.id + ' to the list');
						if (typeof(this.DefinedCameras[camera._xseen.priority]) == 'undefined') {this.DefinedCameras[camera._xseen.priority] = [];}
						this.DefinedCameras[camera._xseen.priority].push (camera);
						camera._xseen.ndxCamera = this.DefinedCameras[camera._xseen.priority].length - 1;
						camera.setActive = function() {
							camera._xseen.sceneInfo.ViewManager.setActive (this);
						}
						console.log ('.. returning from camera.add');
					},

/*
 * Returns the currently available highest priority camera.
 *	This always returns a camera because the DEFAULT camera is always available
 */
		'next'				: function ()
					{
						for (var p=this.DefinedCameras.length-1; p>=this.PRIORITY_MINIMUM; p--) {
							if (typeof(this.DefinedCameras[p]) != 'undefined') {
								for (var ii=0; ii<this.DefinedCameras[p].length; ii++) {
									if (this.DefinedCameras[p][ii]._xseen.available) {return this.DefinedCameras[p][ii];}
								}
							}
						}
						return this.DefinedCameras[this.PRIORITY_MINIMUM][0];	// System default
					},

/*
 * Activate a specific camera
 *	camera - The DOM element for the 'camera' tag to be activated
 *
 *	This method "knows" about the structure of XSeen's Runtime object
 */
		'setActive'			: function (cameraElement)
					{
						if (cameraElement === null) {return;}
						if (this.CurrentNode !== null) {this.CurrentNode._xseen.active = false;}
						cameraElement._xseen.active = true;
						var xRuntime = cameraElement._xseen.sceneInfo;
						this.reset (xRuntime.Camera, xRuntime.Size.aspect);
						
						if (cameraElement._xseen.isStereographic) {
							xRuntime.Renderer = xRuntime.RendererStereo;
							xRuntime.rendererHasControls = false;
							xRuntime.isStereographic = true;
							// Need to add a button to the display to go full screen
						} else {
							xRuntime.Renderer = xRuntime.RendererStandard;
							xRuntime.rendererHasControls = cameraElement._xseen.rendererHasControls;
							xRuntime.isStereographic = false;

							xRuntime.Renderer.setScissorTest( false );
							var size = xRuntime.Renderer.getSize();
							xRuntime.Renderer.setScissor( 0, 0, size.width, size.height );
							xRuntime.Renderer.setViewport( 0, 0, size.width, size.height );
							if (cameraElement._xseen.track == 'orbit') {
								cameraElement._xseen.sceneInfo.CameraControl.enabled = true;	// Enable ORBIT controls access to events
							}
							//xRuntime.Renderer.render( scene, xRuntime.Camera );
							// Need to remove any 'full screen' button
						}
						
						xRuntime.Camera.position.set (
									cameraElement._xseen.attributes.position.x,
									cameraElement._xseen.attributes.position.y,
									cameraElement._xseen.attributes.position.z);
						xRuntime.Camera.lookAt(0,0,0);		// Look at origin. Seems to be required for object type.
						xRuntime.Camera.fov = cameraElement._xseen.attributes.fov;


						// TODO: A number of other things need to be set/changed (tracking, type, etc.)
						xRuntime.useDeviceOrientation = cameraElement._xseen.useDeviceOrientation;
						

						if (!cameraElement._xseen.rendererHasControls) {
							if (xRuntime.useDeviceOrientation) {	// Device controls camera. Set focus point
								if (cameraElement._xseen.track == 'object') {	// tracking scene object
									xRuntime.CameraControl = new THREE.DeviceOrientationControls(cameraElement._xseen.target, true);
								} else {							// tracking environment
									xRuntime.CameraControl = new THREE.DeviceOrientationControls(xRuntime.Camera);
								}

							} else {											// No device orientation control. Use something else
								if (cameraElement._xseen.track == 'orbit') {
									xRuntime.CameraControl = new THREE.OrbitControls( xRuntime.Camera, xRuntime.RendererStandard.domElement );
								} else if (cameraElement._xseen.track == 'trackball') {
									//console.log ('Trackball');
								} else if (cameraElement._xseen.track == 'none') {
									//console.log ('No tracking');
									xRuntime.rendererHasControls = true;
								} else {
									console.log ('Something else');
								}
							}
						}
						xRuntime.Camera.updateProjectionMatrix();
						console.log ('Setting active camera to ' + cameraElement.id);
						this.CurrentNode = cameraElement;
					},
					
		'setNext'			: function ()
					{
						var camera = this.next();
						this.setActive (camera);
						
						console.log ('Activating camera ID: ' + camera.id + ' with controls: ' + camera._xseen.sceneInfo.rendererHasControls);
						//this.CurrentNode = camera;
					}
};
