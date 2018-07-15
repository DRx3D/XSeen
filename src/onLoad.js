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
							console.log('Loading of external XSeen complete');
							var parser = new DOMParser();
							var xmlDoc = parser.parseFromString(response,"text/xml");
							var rootNode = xmlDoc.getElementsByTagName('x-scene');
							var nodes = rootNode[0].children;
							while (nodes.length > 0) {
								console.log('Adding external node: ' + nodes[0].nodeName);
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
							console.log ('Response Code: ' + err.target.status);
							console.log ('Response URL: ' + err.target.responseURL);
							console.log ('Response Text\n' + err.target.responseText);
							console.error( 'External source loader: An error happened' );
						}
			);

/*
                } else {
	        	xseenCode = '' +
   "<x-class3d id='geometry'>\n" +
   "        <x-style3d property='radius' value='1'></x-style3d>\n" +
   "        <x-style3d property='tube' value='.4'></x-style3d>\n" +
   "        <x-style3d property='segments-radial' value='16'></x-style3d>\n" +
   "        <x-style3d property='segments-tubular' value='128'></x-style3d>\n" +
   "</x-class3d>\n" +
   "<x-class3d id='material'>\n" +
   "        <x-style3d property='type' value='pbr'></x-style3d>\n" +
   "        <x-style3d property='color' value='#00ffff'></x-style3d>\n" +
   "        <x-style3d property='emissive' value='#000000'></x-style3d>\n" +
   "        <x-style3d property='env-map' value='forest'></x-style3d>\n" +
   "</x-class3d>\n" +
   "<x-group rotation='0 3.14 0'>\n" +
   "        <x-tknot class3d='geometry material' type='phong' position='0 10 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='0' roughness='0' position='-5 5 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='.5' roughness='0' position='0 5 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='1.' roughness='0' position='5 5 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='0' roughness='.5' position='-5 0 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='.5' roughness='.5' position='0 0 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='1.' roughness='.5' position='5 0 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='1.' roughness='1' position='5 -5 0'></x-tknot>\n" +
   "</x-group>";
		xseenCode = '<x-group>' + xseenCode + '</x-group>';
		console.log ('Adding inline-generated nodes');
		domElement.insertAdjacentHTML('afterbegin', xseenCode);
            }
 */
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
								'usecamera'	: {						// deprecated
									'name'		: 'usecamera',
									'default'	: 'false',
									'type'		: 'boolean',
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
								'cubetest'	: {
									'name'		: 'cubetest',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								};
								
	Object.getOwnPropertyNames(attributeCharacteristics).forEach (function (prop) {
		value = XSeen.Runtime.RootTag.getAttribute(attributeCharacteristics[prop].name);
		if (value == '' || value === null || typeof(value) === 'undefined') {value = attributeCharacteristics[prop].default;}
		//console.log ('Checking XSEEN attribute: ' + prop + '; with value: ' + value);
		if (value != '') {
			if (attributeCharacteristics[prop].case != 'sensitive') {
				XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value.toLowerCase(), attributeCharacteristics[prop].type);
			} else {
				XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value, attributeCharacteristics[prop].type);
			}
		}
	});

	if (!(typeof(XSeen.Runtime.Attributes.src) == 'undefined' || XSeen.Runtime.Attributes.src == '')) {
		console.log ('*** external SRC file specified ... |'+XSeen.Runtime.Attributes.src+'|');
		loadExternal (XSeen.Runtime.Attributes.src, XSeen.Runtime.RootTag);
	}

	

/** Setup/define various characteristics for the runtime or display
 *
 * Define Renderer and StereoRenderer
 *	This was formerly in XSeen, but moved here to support a transparent
 *	background request either by style or explicit attribute
 */
	var Renderer;
	if (XSeen.Runtime.Attributes.transparent) {
		XSeen.Runtime.isTransparent = true;
	} else {
		XSeen.Runtime.isTransparent = false;
	}
	if (XSeen.Runtime.isTransparent) {
		Renderer = new THREE.WebGLRenderer({'alpha':true,});		// Sets transparent WebGL canvas
		console.log ('Creating a transparent rendering canvas.');
	} else {
		Renderer = new THREE.WebGLRenderer();
		console.log ('Creating a opaque rendering canvas.');
	}
	XSeen.Runtime.Renderer			= Renderer,
	XSeen.Runtime.RendererStandard	= Renderer,
	XSeen.Runtime.RendererStereo	= new THREE.StereoEffect(Renderer);
	Renderer = null;
	
	XSeen.Logging = XSeen.definitions.Logging.init (XSeen.Runtime.Attributes['showlog'], XSeen.Runtime.RootTag);
	XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);	// TODO: test
	//XSeen.Runtime.Renderer.setPixelRatio( window.devicePixelRatio );	// See https://stackoverflow.com/questions/31407778/display-scene-at-lower-resolution-in-three-js
	XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height);

//	XSeen.Runtime.Camera = new THREE.PerspectiveCamera( 75, XSeen.Runtime.Size.aspect, 0.1, 10000 );
	XSeen.Runtime.Camera = new THREE.PerspectiveCamera( 50, XSeen.Runtime.Size.aspect, 0.1, 10000 );
	XSeen.Runtime.SceneDom = XSeen.Runtime.Renderer.domElement;
	XSeen.Runtime.RootTag.appendChild (XSeen.Runtime.SceneDom);
	
	XSeen.Runtime.mediaAvailable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);	// flag for device media availability


/*
 *	Experimental code for device camera
 *
 *	From: https://www.html5rocks.com/en/tutorials/getusermedia/intro/
 *		https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 *
 *	Revision plans:
 *	1.	Remove 'usecamera' x-scene attribute and use element transparency instead.
 *		a. This is a one-time setting and can't be changed
 *		b. Camera not allowed unless this is set
 *	2.	Renderer, StereoRenderer definitions need to go in onLoad
 *	3.	Runtime definition remains, but many items are populated in onLoad
 *	4.	x-background specified use of camera
 *	5.	This code would need to go there
 *	6.	If camera is operational, skycolor or any other background is disabled
 *	7.	Create separate object for dealing with camera
 */
	if (XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent) {
/*
		var video = document.createElement( 'video' );
		//if (XSeen.Runtime.Attributes.usecamera) {
			video.setAttribute("autoplay", "1"); 
			video.height			= XSeen.Runtime.SceneDom.height;
			video.width				= XSeen.Runtime.SceneDom.width;
			video.style.height		= video.height + 'px';
			video.style.width		= video.width + 'px';
			video.style.position	= 'absolute';
			video.style.top			= '0';
			video.style.left		= '0';
			video.style.zIndex		= -1;
			const constraints = {video: {facingMode: "environment"}};

			function handleSuccess(stream) {
				XSeen.Runtime.RootTag.appendChild (video);
				video.srcObject = stream;
			}
			function handleError(error) {
				//console.error('Reeeejected!', error);
				console.log ('Device camera not available -- ignoring');
			}

			navigator.mediaDevices.enumerateDevices()
				.then(gotDevices);
//				.then(gotDevices).then(getStream).catch(handleError);

			function gotDevices(deviceInfos) {
				var msgs = '';
				for (var i = 0; i !== deviceInfos.length; ++i) {
					var deviceInfo = deviceInfos[i];
					console.log('Found a media device of type: ' + deviceInfo.kind);
					msgs += 'Found a media device of type: ' + deviceInfo.kind + "(" + deviceInfo.deviceId + '; ' + deviceInfo.groupId + ")\n";
				}
				//alert (msgs);
			}

			navigator.mediaDevices.getUserMedia(constraints).
				then(handleSuccess).catch(handleError);
*/
	} else {
		console.log ('Device Media support is not available or NOT requested ('+XSeen.Runtime.isTransparent+')');
	}
// End of experimental code


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
	
/*
 *	Create default camera by adding a first-child node to x-scene
 *		<x-camera position='0 0 10' type='perspective' track='orbit' priority='0' active='true' />
 */
	defaultCamera = "<x-camera id='XSeen__DefaultCamera' position='0 0 10' type='perspective' track='orbit' priority='0' active='true' /></x-camera>";
	var tmp = document.createElement('div');
	tmp.innerHTML = defaultCamera;
	XSeen.Runtime.RootTag.prepend (tmp.firstChild);

	
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
	XSeen.Runtime.RootTag.addEventListener ('mouseover', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mouseout', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mousedown', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mouseup', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('click', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('dblclick', XSeen.Events.xseen, true);

// Parse the HTML tree starting at scenesToParse[0]. The method returns when there is no more to parse
	//XSeen.Parser.dumpTable();
	console.log ('Starting Parse...');
	XSeen.Parser.Parse (XSeen.Runtime.RootTag, XSeen.Runtime.RootTag);
	
// TODO: Start rendering loop

	return;
};


// Determine the size of the XSeen display area

XSeen.updateDisplaySize = function (sceneRoot) {
	var MinimumValue = 50;
	var size = Array();
	size.width = sceneRoot.offsetWidth;
	size.height = sceneRoot.offsetHeight;
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
	return size;
}
