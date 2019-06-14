/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * 
 */
 
var XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;

XSeen.Convert = {
	'fromString'	: function (v, t)
	{
		if (t == 'boolean') {
			if (v == '' || v == 'f' || v == '0' || v == 'false') {return false;}
			return true;
		}
		return v;
	},
};

/*
 * Partially designed to process all scenes; however, only the first one is actually processed
 */
XSeen.onLoad = function() {
	//console.log ("onLoad method");


	loadExternal = function(url, domElement) {
                                       // Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
                                       //
			var xseenCode = '';
        	loadExternalSuccess = function (userdata) {
                	var e = userdata.e;
					return function (response) {
							console.log('INFO: Loading of external XSeen complete');
							var parser = new DOMParser();
							var xmlDoc = parser.parseFromString(response,"text/xml");
							var rootNode = xmlDoc.getElementsByTagName('x-scene');
							var nodes = rootNode[0].children;
							while (nodes.length > 0) {
								//console.log('Info: Adding external node: ' + nodes[0].nodeName);
								e.appendChild(nodes[0]);
							}
					}
			};

			//if (url != 'test') {
			//console.log ('External loads not yet supported for ' + url);
			var loader = new THREE.FileLoader();
			loader.load (url, 
						loadExternalSuccess({'e':domElement}),
						// onProgress callback
						function ( xhr ) {
							console.log('External source loader: ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
						},
						// onError callback
						function ( err ) {
							console.log ('WARN: Response Code: ' + err.target.status);
							console.log ('WARN: Response URL: ' + err.target.responseURL);
							console.log ('WARN: Response Text\n' + err.target.responseText);
							console.error( 'WARN: External source loader: An error happened' );
						}
			);
	};
	
	var sceneOccurrences, ii;
	if (typeof(XSeen._Scenes) === 'undefined') {XSeen._Scenes = [];}

	sceneOccurrences = document.getElementsByTagName (XSeen.Constants.tagPrefix + XSeen.Constants.rootTag);
	for (ii=0; ii<sceneOccurrences.length; ii++) {
		if (typeof(sceneOccurrences[ii]._xseen) === 'undefined') {
			XSeen._Scenes.push(sceneOccurrences[ii]);
		}
	}
	if (XSeen._Scenes.length < 1) {return;}
	XSeen.Runtime.RootTag = XSeen._Scenes[0];
	XSeen.Runtime.Attributes = [];

	var allowedAttributes, defaultValues, value, attributeCharacteristics;
	allowedAttributes = ['src', 'showlog', 'showstat', 'showprogress', 'cubetest'];
	defaultValues = {'src':'', 'showlog':false, 'showstat':false, 'showprogress':false, 'cubetest':false};
	attributeCharacteristics = {
								'src'	: {
									'name'		: 'src',
									'default'	: '',
									'type'		: 'string',
									'case'		: 'sensitive' ,
										},
		// Sets the operation mode. AR ==> (transparent, fullscreen) & allows use of device camera
								'mode'	: {
									'name'		: 'mode',
									'default'	: 'vr',
									'type'		: 'string',
									'case'		: 'insensitive' ,
									'enumeration': ['ar', 'vr'],
										},
		// Turns off XSeen button creation (FullScreen, VR)
								'_no-xseen-buttons' : {
									'name'		: '_no-xseen-buttons',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'_debug'	: {
									'name'		: '_debug',
									'default'	: 'none',
									'type'		: 'string',
									'case'		: 'insensitive' ,
									'enumeration': ['', 'url', 'none', 'load', 'info', 'debug', 'warn', 'error'],
										},
								'showstat'	: {
									'name'		: 'showstat',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'showprogress'	: {
									'name'		: 'showprogress',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'transparent'	: {
									'name'		: 'transparent',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'fullscreen'	: {
									'name'		: 'fullscreen',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'fullscreenid'	: {
									'name'		: 'fullscreenid',
									'default'	: '',
									'type'		: 'string',
									'case'		: 'sensitive' ,
										},
		// TESTing mode only
								'cubetest'	: {
									'name'		: 'cubetest',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
		// Deprecated
								'usecamera'	: {						// deprecated
									'name'		: 'usecamera',
									'default'	: 'false',
									'type'		: 'boolean',
										},
								};
								
	Object.getOwnPropertyNames(attributeCharacteristics).forEach (function (prop) {
		value = XSeen.Runtime.RootTag.getAttribute(attributeCharacteristics[prop].name);
		if (value == '' || value === null || typeof(value) === 'undefined') {value = attributeCharacteristics[prop].default;}
		//console.log ('INFO: Checking XSEEN attribute: ' + prop + '; with value: ' + value);
		if (value != '') {
			if (attributeCharacteristics[prop].case != 'sensitive') {
				XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value.toLowerCase(), attributeCharacteristics[prop].type);
			} else {
				XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value, attributeCharacteristics[prop].type);
			}
		}
	});

	if (!(typeof(XSeen.Runtime.Attributes.src) == 'undefined' || XSeen.Runtime.Attributes.src == '')) {
		console.log ('INFO: *** external SRC file specified ... |'+XSeen.Runtime.Attributes.src+'|');
		loadExternal (XSeen.Runtime.Attributes.src, XSeen.Runtime.RootTag);
	}

	

/*
 * Setup/define various characteristics for the runtime or display
 *
 * IF AR mode is requested, make sure device has sufficient capabilities before entering; otherwise, ignore request
 *
 * Define Renderer and StereoRenderer
 *	This was formerly in XSeen, but moved here to support a transparent
 *	background request either by style or explicit attribute
 */
	var Renderer;
	if (XSeen.Runtime.Attributes.mode == 'ar') {
		XSeen.Runtime.mediaAvailable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);	// flag for device media availability
		if (XSeen.Runtime.mediaAvailable) {
			XSeen.Runtime.allowAR = true;
			XSeen.Runtime.Attributes.transparent = true;
			XSeen.Runtime.Attributes.fullscreen = true;
		} else {
			XSeen.Runtime.allowAR = false;
		}
		// TODO: A permission/notification screen may be needed here
	} else {
		XSeen.Runtime.mediaAvailable = false;
		XSeen.Runtime.allowAR = false;
	}

	if (XSeen.Runtime.Attributes.transparent) {
		XSeen.Runtime.isTransparent = true;
	} else {
		XSeen.Runtime.isTransparent = false;
	}
	if (XSeen.Runtime.isTransparent) {
		Renderer = new THREE.WebGLRenderer({'alpha':true,});		// Sets transparent WebGL canvas
		//console.log ('INFO: Creating a transparent rendering canvas.');
	} else {
		Renderer = new THREE.WebGLRenderer();
		//console.log ('INFO: Creating a opaque rendering canvas.');
	}
	XSeen.Runtime.RendererStandard	= Renderer;
	XSeen.Runtime.RendererStereo	= new THREE.StereoEffect(Renderer);
	XSeen.Runtime.Renderer			= XSeen.Runtime.RendererStandard;
	Renderer = null;
	
	XSeen.Logging = XSeen.definitions.Logging.init (XSeen.Runtime.Attributes['showlog'], XSeen.Runtime.RootTag);
	XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);	// TODO: test
	XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height);

	XSeen.Runtime.Camera = XSeen.Runtime.ViewManager.create (XSeen.Runtime.Size.aspect);
	XSeen.Runtime.SceneDom = XSeen.Runtime.Renderer.domElement;
	XSeen.Runtime.RootTag.appendChild (XSeen.Runtime.SceneDom);
//	document.body.appendChild (XSeen.Runtime.SceneDom);
	

	if (XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent) {
	} else {
		console.log ('Device Media support is not available or NOT requested ('+XSeen.Runtime.isTransparent+')');
	}

	
	// Set up display characteristics, especially for VR
	if (navigator.getVRDisplays) {
		navigator.getVRDisplays()
			.then( function ( displays ) {
				if ( displays.length > 0 ) {
					XSeen.Runtime.isVrCapable = true;
				} else {
					XSeen.Runtime.isVrCapable = false;
				}
			} );
	}
/*
 * Stereo camera effect and device orientation controls are set on each camera
 */
	XSeen.Runtime.hasDeviceOrientation = (window.orientation) ? true : false;
	XSeen.Runtime.hasVrImmersive = XSeen.Runtime.hasDeviceOrientation;

	
	// Define a few equivalences

	XSeen.LogInfo	= function (string) {XSeen.Logging.logInfo (string);}
	XSeen.LogDebug	= function (string) {XSeen.Logging.logDebug (string);}
	XSeen.LogWarn	= function (string) {XSeen.Logging.logWarn (string);}
	XSeen.LogError	= function (string) {XSeen.Logging.logError (string);}
	
/*
 * Handle debug settings.
 *	Most are done through event handlers to a specific output target
 */
	var _debug = XSeen.Runtime.Attributes._debug;
	if (_debug == 'url') {
		let params = new URLSearchParams(document.location.search.substring(1));
		_debug = params.get("xseen_debug") || '';
	}
	if (_debug != '') XSeen.Logging.setLoggingLevel (_debug, XSeen.Runtime.RootTag);

/*
 * Create XSeen default elements
 *	Default camera by adding a first-child node to x-scene
 *		<x-camera position='0 0 10' type='perspective' track='orbit' priority='0' active='true' />
 *	Splash screen
 *		<img src='logo.svg' width='100%'>
 */
	var defaultCamera = "<x-camera id='XSeen__DefaultCamera' position='0 0 10' type='perspective' track='orbit' priority='0' active='true' /></x-camera>";
	var tmp = document.createElement('div');
	tmp.innerHTML = defaultCamera;
	XSeen.Runtime.RootTag.prepend (tmp.firstChild);
	var splashScreen = '<img id="XSeen-Splash" src="https://XSeen.org/Resources/logo.svg" style="z-index:999; position:absolute; top:0; left:25%; max-width:50%; background-color:white; " width="'+XSeen.Runtime.Size.width+'">';
	tmp.innerHTML = splashScreen;
	XSeen.Runtime.RootTag.prepend (tmp.firstChild);
	
// Set up control screen (FullScreen / Splitscreen / VR) buttons
	if (!XSeen.Runtime.Attributes['_no-xseen-buttons'] && XSeen.Runtime.Attributes.fullscreen) {
		fullscreenElement = XSeen.Runtime.RootTag;
		if (XSeen.Runtime.Attributes.fullscreenid != '') {
			var ele = document.getElementById(XSeen.Runtime.Attributes.fullscreenid);
			if (ele !== null) fullscreenElement = ele;
		}
		var fs_button = XSeen.DisplayControl.buttonCreate ('fullscreen', fullscreenElement, null);
		var result = fullscreenElement.appendChild (fs_button);
	}

	
// Introduce things
	XSeen.Logging.logInfo ("XSeen version " + XSeen.Version.version + ", " + "Date " + XSeen.Version.date);
	XSeen.LogInfo(XSeen.Version.splashText);
	//XSeen.LogDebug ("Debug line");
	//XSeen.LogWarn ("Warn line");
	//XSeen.LogError ("Error line");
	
// Load all other onLoad methods
	for (var ii=0; ii<XSeen.onLoadCallBack.length; ii++) {
		XSeen.onLoadCallBack[ii]();
	}
	
// Create XSeen event listeners
//	*move events are not included because they are added after the initiating event (touchstart/mousedown)
	XSeen.Events.enableEventHandling();
/*
	XSeen.Runtime.RootTag.addEventListener ('mouseover', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mouseout', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mousedown', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mouseup', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('click', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('dblclick', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('touchstart', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('touchend', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('touchcancel', XSeen.Events.xseen, true);
*/

/*
 * Define event handlers for content loading
 *	These uniformly handle the display of asynchronous loading of all content
 */
XSeen.Runtime.RootTag.addEventListener('xseen-loadstart', XSeen.Loader.Reporting);
XSeen.Runtime.RootTag.addEventListener('xseen-loadcomplete', XSeen.Loader.Reporting);
XSeen.Runtime.RootTag.addEventListener('xseen-loadprogress', XSeen.Loader.Reporting);
XSeen.Runtime.RootTag.addEventListener('xseen-loadfail', XSeen.Loader.Reporting);



// Create event to indicate the XSeen has fully loaded. It is dispatched on the 
//	<x-scene> tag but bubbles up so it can be caught.
	var newEv = new CustomEvent('xseen-initialize', XSeen.Events.propertiesReadyGo(XSeen.Runtime, 'initialize'));
	XSeen.Runtime.RootTag.dispatchEvent(newEv);
	return;
}
	

/*
 * All initializations complete. Start parsing scene
 */
XSeen.onLoadStartProcessing = function() {

	//console.log ('Checking _xseen');
	if (typeof(XSeen.Runtime.RootTag._xseen) === 'undefined') {
		//console.log ('Defining _xseen');
		XSeen.Runtime.RootTag._xseen = {					// Duplicated from Tag.js\%line202
									'children'		: [],	// Children of this tag
									'Metadata'		: [],	// Metadata for this tag
									'tmp'			: [],	// tmp working space
									'attributes'	: [],	// attributes for this tag
									'animate'		: [],	// animatable attributes for this tag
									'animation'		: [],	// array of animations on this tag
									'properties'	: [],	// array of properties (active attribute values) on this tag
									'class3d'		: [],	// 3D classes for this tag
									'sceneInfo'		: XSeen.Runtime,	// Runtime data added to each tag
									};
	}
// Parse the HTML tree starting at scenesToParse[0]. The method returns when there is no more to parse
	//XSeen.Parser.dumpTable();
	//console.log ('Starting Parse...');
	XSeen.Parser.Parse (XSeen.Runtime.RootTag, XSeen.Runtime.RootTag);
	
	var newEv = new CustomEvent('xseen-go', XSeen.Events.propertiesReadyGo(XSeen.Runtime, 'render'));
	XSeen.Runtime.RootTag.dispatchEvent(newEv);

	return;
};


// Determine the size of the XSeen display area

XSeen.updateDisplaySize = function (sceneRoot) {
	var MinimumValue = 50;
	var size = Array();
	size.width = sceneRoot.offsetWidth;
	size.height = Math.floor(sceneRoot.offsetHeight -5);	// Firefox requires 5 less for an unknown reason
	if (size.width < MinimumValue) {
		var t = sceneRoot.getAttribute('width');
		if (t < MinimumValue) {t = MinimumValue;}
		size.width = t;
	}
	if (size.height < MinimumValue) {
		var t = sceneRoot.getAttribute('height');
		if (t < MinimumValue) {t = MinimumValue;}
		size.height = t;
	}
	size.iwidth = 1.0 / size.width;
	size.iheight = 1.0 / size.height;
	size.aspect = size.width * size.iheight;
	//console.log ('Display size: ' + size.width + ' x ' + size.height);
	return size;
};

/*
 * Return a frame of camera data
 *
 *	If the camera is running (XSeen.Runtime._deviceCameraElement._xseen.videoState  defined and == 'running')
 *	return an ImageData object from a canvas read operation. This does not interfere with the usual 3D display
 *
 *	If the camera is not running, then return null
 */
XSeen.getVideoFrame = function() {
	if (XSeen.Runtime._deviceCameraElement !== null &&
		XSeen.Runtime._deviceCameraElement != 0 &&
		typeof(XSeen.Runtime._deviceCameraElement._xseen.videoState) != 'undefined' &&
		XSeen.Runtime._deviceCameraElement._xseen.videoState == 'running') {
			var qrImage, canvas, context, height, width;
			canvas = document.createElement('canvas');
			context = canvas.getContext('2d');

			video = (jQuery)('x-scene video')[0];
			//video = (jQuery)('#TEST')[0];
			height = video.height;
			width = video.width;
			canvas.width = width;
			canvas.height = height;
			//sh = Math.floor(height/4);
			//sw = Math.floor(width/4);
			//eh = Math.floor(3*height/4);
			//ew = Math.floor(3*width/4);
			sh = 0;
			sw = 0;
			eh = height;
			ew = width;
			context.drawImage(video, 0, 0 );
			var dataUrl = canvas.toDataURL('image/png');
			//return dataUrl;
			qrImage = context.getImageData(sw, sh, ew, eh);
			
			return qrImage;
		}
};

