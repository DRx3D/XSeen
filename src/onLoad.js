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
	console.log ("'onLoad' method");
	
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
										},
								'showstat'	: {
									'name'		: 'showstat',
									'default'	: 'false',
									'type'		: 'boolean',
										},
								'showprogress'	: {
									'name'		: 'showprogress',
									'default'	: 'false',
									'type'		: 'boolean',
										},
								'cubetest'	: {
									'name'		: 'cubetest',
									'default'	: 'false',
									'type'		: 'boolean',
										},
								};
								
	Object.getOwnPropertyNames(attributeCharacteristics).forEach (function (prop) {
		value = XSeen.Runtime.RootTag.getAttribute(attributeCharacteristics[prop].name);
		if (value == '' || value === null || typeof(value) === 'undefined') {value = attributeCharacteristics[prop].default;}
		if (value != '') {
			XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value.toLowerCase(), attributeCharacteristics[prop].type);
		}
	});

	
	// Setup/define various characteristics for the runtime or display
	XSeen.Logging = XSeen.definitions.Logging.init (XSeen.Runtime.Attributes['showlog'], XSeen.Runtime.RootTag);
	XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);	// TODO: test
	XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height);
	XSeen.Runtime.Renderer.setPixelRatio( window.devicePixelRatio );

	XSeen.Runtime.Camera = new THREE.PerspectiveCamera( 75, XSeen.Runtime.Size.aspect, 0.1, 10000 );
	XSeen.Runtime.SceneDom = XSeen.Runtime.Renderer.domElement;
	XSeen.Runtime.RootTag.appendChild (XSeen.Runtime.SceneDom);
	if (typeof(XSeen.Runtime.RootTag._xseen) === 'undefined') {
		XSeen.Runtime.RootTag._xseen = {};
		XSeen.Runtime.RootTag._xseen.sceneInfo = XSeen.Runtime;
	}
	
	// Set up display characteristics, especially for VR
	navigator.getVRDisplays()
		.then( function ( displays ) {
			if ( displays.length > 0 ) {
				XSeen.Runtime.isVrCapable = true;
			} else {
				XSeen.Runtime.isVrCapable = false;
			}
		} );
/*
	// Stereo camera effect -- from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
	var x_effect = new THREE.StereoEffect(Renderer);
	Renderer.controls = {'update' : function() {return;}};
	
	// Mobile (device orientation) controls
	Renderer.controls = new THREE.DeviceOrientationControls(camera);
	
	// Not sure how to handle when both are requested since they both seem to go into
	//	the same address. Perhaps order is important since the stereographic control is null
 */
	XSeen.Runtime.hasDeviceOrientation = (window.orientation) ? true : false;
	XSeen.Runtime.hasVrImmersive = XSeen.Runtime.hasDeviceOrientation;

	
	// Define a few equivalences

	XSeen.LogInfo	= function (string) {XSeen.Logging.logInfo (string);}
	XSeen.LogDebug	= function (string) {XSeen.Logging.logDebug (string);}
	XSeen.LogWarn	= function (string) {XSeen.Logging.logWarn (string);}
	XSeen.LogError	= function (string) {XSeen.Logging.logError (string);}

 
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

// Parse the HTML tree starting at scenesToParse[0]. The method returns when there is no more to parse
	//XSeen.Parser.dumpTable();
	XSeen.Parser.Parse (XSeen.Runtime.RootTag, XSeen.Runtime.RootTag);
	
// TODO: Start rendering loop

	return;
};


// Find all XSeen root tag occurrences

XSeen.updateDisplaySize = function (sceneRoot) {
	var MinimumValue = 50;
	var size = Array();
	size.width = (sceneRoot.offsetWidth >= MinimumValue) ? sceneRoot.offsetWidth : MinimumValue;
	size.height = (sceneRoot.offsetHeight >= MinimumValue) ? sceneRoot.offsetHeight : MinimumValue;
	size.iwidth = 1.0 / size.width;
	size.iheight = 1.0 / size.height;
	size.aspect = size.width * size.iheight;
	return size;
}
