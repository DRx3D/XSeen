/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *

 * NEXT: 
 Rewrite code for handling cubemap images to support both x-cubemap and solid geometry nodes
 Investigate failure of device mode tracking when in portrait mode
 
 *TODO:
 *	Fix viewing controls when AR requested but not capable
 *	Spherical harmonics environment map lighting
 *	Update to latest THREE and various libraries (V0.9)
 *	Audio (V0.9)
 * 	WebRTC?
 *	Create event for parsing complete (xseen-parsecomplete). This potentially starts animation loop
 *	Resolve CAD positioning issue
 *	Additional PBR
 *	Fix for style3d (see embedded TODO)
 *	Editor
 *	Events (add events as needed)
 *	Labeling (add space positioning)
 *	Fog needs mutation functionality
 *	Scene camera needs fixing when multiple cameras with different controls are in use
 *	Add Orthographic camera
 XX	Create event to start animation loop (xseen-readyanimate). This happens after multi-pass parsing is complete.
 XX	Check background image cube for proper orientation (done See starburst/[p|n][x|y|z].jpg)
 XX Create XSeen logo
 XX Stereo camera automatically adds button to go full screen. Add "text" attribute to allow custom text.
 * 
 */

XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
XSeen.Constants = {
					'_Major'		: 0,		// Creates version as Major.Minor.Patch
					'_Minor'		: 8,
					'_Patch'		: 71,
					'_PreRelease'	: 'beta',	// Sets pre-release status (usually Greek letters)
					'_Release'		: 8,		// Release proceeded with '+'
					'_Version'		: '',
					'_RDate'		: '2019-07-26',
					'_SplashText'	: ["XSeen 3D Language parser.", "XSeen <a href='https://xseen.org/index.php/documentation/' target='_blank'>Documentation</a>."],
					'tagPrefix'		: 'x-',
					'rootTag'		: 'scene',
					};
XSeen.CONST = XSeen.DefineConstants();
XSeen.Time =  {
					'start'		: (new Date()).getTime(),
					'now'		: (new Date()).getTime(),
				};
// Using the scheme at http://semver.org/
XSeen.Version = {
			'major'			: XSeen.Constants._Major,
			'minor'			: XSeen.Constants._Minor,
			'patch'			: XSeen.Constants._Patch,
			'preRelease'	: XSeen.Constants._PreRelease,
			'release'		: XSeen.Constants._Release,
			'version'		: XSeen.Constants._Major + '.' + XSeen.Constants._Minor + '.' + XSeen.Constants._Patch,
			'date'			: XSeen.Constants._RDate,
			'splashText'	: XSeen.Constants._SplashText,
			};
XSeen.Version.version += (XSeen.Version.preRelease != '') ? '-' + XSeen.Version.preRelease : '';
XSeen.Version.version += (XSeen.Version.release != '') ? '+' + XSeen.Version.release : '';

// Holds the list of onLoad callbacks
if (typeof(XSeen.onLoadCallBack) === 'undefined') {
	XSeen.onLoadCallBack = [];
}

// Holds all of the parsing information
XSeen.parseTable = [];

// Data object for Runtime
// Stereo viewing effect from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
//var StereoRenderer = new THREE.StereoEffect(Renderer);
XSeen.Runtime = {
			'currentTime'			: 0,			// Current time at start of frame rendering
			'deltaTime'				: 0,			// Time since last frame
			'frameNumber'			: 0,			// Number of frame about to be rendered
			'Time'					: new THREE.Clock(),
			'Renderer'				: {},			// Active renderer in current use.
			'RendererStandard'		: {},			// One of these two renderers are used. 'onLoad' declares 
			'RendererStereo'		: {},			// these and 'camera' chooses which one
			'Camera'				: {},			// Current camera in use
			'CameraControl'			: {},			// Camera control to be used in Renderer for various types
			'DefinedCameras'		: [],			// Array of defined cameras
			'ViewManager'			: XSeen.CameraManager,
			'Mixers'				: [],			// Internal animation mixer array
			'perFrame'				: [],			// List of methods with data to execute per frame
			'Animate'				: function() {	// XSeen animation loop control
										//console.log ('Rendering loop, isStereographic: ' + XSeen.Runtime.isStereographic);
										if (XSeen.Runtime.isStereographic) {
											requestAnimationFrame (XSeen.Runtime.Animate);
											XSeen.RenderFrame();
										} else {
											XSeen.Runtime.Renderer.animate (XSeen.RenderFrame);
										}
									},
			'TweenGroups'			: [],
			'Resize'				: function () {
										if (!XSeen.Runtime.isStereographic) {
											XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);
											XSeen.Runtime.Camera.aspect = XSeen.Runtime.Size.width / XSeen.Runtime.Size.height;
											XSeen.Runtime.Camera.updateProjectionMatrix();
											XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height)
										}
									},
			'rulesets'				: [],			// Style ruleset array structure
			'StyleRules'			: {				// Collection of style rulesets
				'ruleset'	: [],					// Specific ruleset
				'idLookup'	: []	},				// Cross-reference into 'rulesets' by 'id'
			'selectable'			: [],			// Selectable geometry elements
			'_deviceCameraElement'	: 0,			// Element for camera connection. May be deprecated
			'isVrCapable'			: false,		// WebVR ready to run && access to VR device 
			'hasDeviceOrientation'	: false,		// device has Orientation sensor
			'hasVrImmersive'		: false,		// hasDeviceOrientation && stereographic capable (=== TRUE)
			'useDeviceOrientation'	: false,		// display is using device's Orientation sensor
			'isStereographic'		: false,		// currently running stereographic display (not VR)
			'rendererHasControls'	: false,		// Renderer has built-in motion controls
			'isProcessingResize'	: false,		// semaphore for resizing processing
			'mediaAvailable'		: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),	// flag for device media availability
			'isTransparent'			: false,		// flag for XSeen transparent background
			'allowAR'				: false,		// flag for allowing AR (does not presume camera permission)
			};										// Need place-holder for xR scene (if any -- tbd)
			
XSeen.RenderFrame = function()
	{
		if (XSeen.Runtime.isProcessingResize) {return;}		// Only do one thing at a time

		if (XSeen.Runtime.frameNumber == 0) {		// TODO: Replace with 'dirty' flag. May not need loadingComplete
			if (XSeen.Loader.loadingComplete()) {	//	Code needs to set Runtime.nodeChange whenever nodes are added/removed
				XSeen.Tags.scene.addScene();
				document.getElementById('XSeen-Splash').style.display = 'none';
				console.log ('***Rendering first frame');
			} else {
				return;
			}
		}
		XSeen.Runtime.deltaTime = XSeen.Runtime.Time.getDelta();
		XSeen.Runtime.currentTime = XSeen.Runtime.Time.getElapsedTime();
		XSeen.Runtime.frameNumber ++;

		var newEv = new CustomEvent('xseen-render', XSeen.Events.propertiesRenderFrame(XSeen.Runtime));
		XSeen.Runtime.RootTag.dispatchEvent(newEv);
		
/*
 *	Do various subsystem updates. Order is potentially important. 
 *	First position/orient camera & frame size so any calculations done on that use the new position
 *	Mixes handle internal (within model) animations
 *	Tween handles user-requested (in code) animations
 */
		XSeen.Update.Camera (XSeen.Runtime);
		XSeen.Update.Mixers (XSeen.Runtime);
		XSeen.Update.Tween (XSeen.Runtime);
		if (XSeen.Runtime.frameNumber > 1) XSeen.Update.Ticks (XSeen.Runtime);

		XSeen.Runtime.Renderer.render( XSeen.Runtime.SCENE, XSeen.Runtime.Camera );
	};
	
XSeen.Update = {
	'Tween'		: function (Runtime)
		{
			TWEEN.update();
			if (typeof(Runtime.TweenGroups) != 'undefined') {
				for (var ii=0; ii<Runtime.TweenGroups.length; ii++) {
					Runtime.TweenGroups[ii].update();
				}
			}
		},
	'Mixers'	: function (Runtime)
		{
			if (typeof(Runtime.Mixers) === 'undefined') return;
			for (var i=0; i<Runtime.Mixers.length; i++) {
				Runtime.Mixers[i].update(Runtime.deltaTime);
			}
		},
	'Ticks'		: function (Runtime)
		{
			for (var i=0; i<Runtime.perFrame.length; i++) {
				Runtime.perFrame[i].method (Runtime, Runtime.perFrame[i].userdata);
			}

		},
	'Camera'	: function (Runtime)
		{
			if (!Runtime.rendererHasControls) {
				Runtime.CameraControl.update();
			}
		},
	}

// Run the 'onLoad' method when the page is fully loaded
window.document.addEventListener('DOMContentLoaded', XSeen.onLoad);

//window.document.addEventListener('DOMContentLoaded', XSeen.onLoadStartProcessing);
window.document.addEventListener('xseen-initialize', XSeen.onLoadStartProcessing);
