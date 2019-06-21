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
 *	0.6.2: Fixed Camera and navigation bug
 *	0.6.3: Added Plane and Ring
 *	0.6.4: Fixed size determination bug
 *	0.6.5: Added Fog
 *	0.6.6: Added Metadata [Release]
 *	0.6.7: Added tknot (torus knot)
 *	0.6.8: Added PBR
 *	0.6.9: Preliminary fix for display size
 *	0.6.10: Fix for background urls not present
 *	0.6.11: Created common routine for loading texture cubes - fixed envMap for PBR.
 *	0.6.12: Simple animation (no way-points)
 *	0.6.13: Way point animation
 *	0.6.14: Mouse event creation
 *	0.6.15: Rotation animation
 *	0.6.16: Added Label tag
 *	0.6.17: Fixed a number of issues - asynchronous model loading, group, scene loading, camera
 *	0.6.18: Allowed user identified non-selectable geometry
 *	0.6.19: Fixed handling of skycolor in background
 *
 *	0.7.20: Added asset capability for Material
 *	0.7.21: Added axis-angle parsing for rotation
 *	0.7.22: Added additional color type f3 (fractional rgb - direct support for X3D)
 *	0.7.23: Added support for external XSeen files in XML format.
 *	0.7.24: Added support for device camera background use.
 *	0.7.25: Support device motion controlling object position
 *	0.7.26: Initial support for multiple cameras
 *	0.7.27: Spherical (photosphere) backgrounds
 *	0.7.28: Change event handling for background attributes
 *	0.7.29: Support indexed triangle sets. 
 *	0.7.30: Changed XSeen custom event names to xseen-touch (for all mouse-click) and xseen-render (for rendering) events
 *	0.7.31: Cleaned up some extra console output statements
 *	0.7.32: Support position attribute mutations for all 'solid' tags. (RC1)
 *	0.7.33: Camera switching API plus fix for leaving stereo camera. (RC1)
 *
 *	0.7.34:	Added geometry to asset tag capabilities
 *	0.7.35:	Added 'attribute' child tag so selected attribute values can be moved to content (TextNode)
 *	0.7.36:	Fix display size wrt browser window size
 *	0.7.37:	Create XSeen splash screen
 *	0.7.38:	Created stereographic/full-screen button and request support function
 *	0.7.39: Added support for wireframe switch to all solids
 *	0.7.40:	Added support for DOM changes to lights
 *	0.7.41:	Fixed use of color in fog
 *	0.7.42:	Fixed bug in label and leader dealing with not handling 'leadercolor' attribute.
 *	0.7.43:	Added mutation control of active, near, far in fog.
 *	0.7.44:	Removed a number of console log debug output statements from XSeen
 *
 *		Mostly events and support W3C Immersive Web AR display concepts
 *	0.8.45:	Created new file ($.js) for general purpose tag support functions
 *	0.8.46:	Added mutation support to 'group' tag
 *	0.8.47: Fixed 'animate delay="x" ...' to only introduce a delay on the initial animation
 *	0.8.48:	Added support for group mutation in 'solids.js'
 *	0.8.49:	Added support for 'emissive' color in 'solids.js'
 *	0.8.50: Cleaned up & refined splash screen placement
 *	0.8.51: Added camera and device normals to events
 *	0.8.52: Created XSeen drag (mousemove) event
 *	0.8.53:	Improved support for device camera (see TODO note below) to match W3C Immersive Web concepts (full-screen)
 *	0.8.54:	Multi-touch events
 *	0.8.55:	Added methods to mark/unmark object as Active
 *	0.8.56:	Disabled Orbit tracker if camera is not being used (mostly needed for device motion tracking)
 *	0.8.57:	Added methods to enable/disable cursor/mouse event handling (needed for Gesture handling)
 *	0.8.58:	Added method to perform Y-axis rotation
 *	0.8.59:	Added new attribute to XSeen that lets the developer specify a tag for full-screen
 *	0.8.60:	Added xseen-go event to indicate start of animation loop
 *	0.8.61:	Revised control state button handling
 *	0.8.62:	Added node to handle cubemaps as a resource
 *	0.8.63:	Fixed camera controls bug. controls broken with 0.8.56
 *	0.8.64:	Update 'model' and 'background' to use cubemaps with event handlers
 *	0.8.65:	Added getVideoFrame method to XSeen
 *	0.8.66:	Added events for asynchronous content loading (start, progress, complete, fail)
 *	0.8.67:	Added reporting of LOAD events with tag attribute (in progress)
 *	0.8.68:	Added ability to control logging from URL (?xseen_debug=<defined-level-string>)
 *	0.8.69:	Added (CSS) animation to initial wait
 
 *TODO:
 *	Update to latest THREE and various libraries (V0.9)
 *	Create event for parsing complete (xseen-parsecomplete). This potentially starts animation loop
 *	Resolve CAD positioning issue
 *	Additional PBR
 *	Fix for style3d (see embedded TODO)
 *	Audio (V0.9)
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
					'_Patch'		: 69,
					'_PreRelease'	: 'beta',	// Sets pre-release status (usually Greek letters)
					'_Release'		: 8,		// Release proceeded with '+'
					'_Version'		: '',
					'_RDate'		: '2019-06-19',
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
