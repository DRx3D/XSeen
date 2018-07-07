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

/*
 * Single TODO to encompass all work
 *xx	1. Create function for determining source type (none, single image (image extension), image directory)
 *	2. Add attribute for image extension/type for use with (1)/directory
 *	3. Create function for determining background type based on supplied value. (1), and camera environment.
 *	4. Functions from (1) and (3) are used in the _changeAttribute method
 *	5. Update _changeAttribute to fully handle changes to all attributes (except geometry)
 *	6. Add color attribute to supersede skycolor
 *	7. Deprecate skycolor (not supported on change of attribute)
 */ 

XSeen.Tags.background = {
	'_changeAttribute'	: function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			// TODO: add handling of change to 'backgroundiscube' attribute. Need to tie this is an image format change.
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				var type = XSeen.Tags.background._saveAttributes (e);
				XSeen.Tags.background._processChange (e);
			} else {
				XSeen.LogWarn("Re-parse of " + attributeName + " is invalid -- no change")
			}
		},

/*
 *	Perform node initialization. This is done on the first encounter with each 'background' node.
 *	Some things are done "just in case". This includes setting up for a video background from device
 *	camera and creating photosphere geometry.
 *
 *	The video setup is only done if the device supports a camera. Note that no access to the camera 
 *	is requested until it is specified in the node (either on initial setting or attribute change
 *
 *	The photosphere geometry is set up, but made transparent. This ensures that it is in the 
 *	render tree
 *
 *	The method _processChange is called every time there is a change, either to the initial state
 *	or on attribute change.
 */
	'init'	: function (e, p) 
		{
			// This function doesn't really work because the 'enumerateDevices' method runs
			// asynchronously. Need to figure out some other way to check for existence.
			function cameraExists () {
				const constraints = {video: {facingMode: "environment"}};
				function handleError(error) {
					//console.error('Reeeejected!', error);
					console.log ('Device camera not available -- ignoring');
					exists = false;
				}

				var exists = false;
				navigator.mediaDevices.enumerateDevices(constraints)
					.then(gotDevices).catch(handleError);

				function gotDevices(deviceInfos) {
					for (var i = 0; i !== deviceInfos.length; ++i) {
						var deviceInfo = deviceInfos[i];
						console.log('Found a media device matching constraints of type: ' + deviceInfo.kind);
						exists = true;
					}
				}
				return true;
				return exists;
			}

			var t = e._xseen.attributes.radius;
			e._xseen.sphereRadius = (t <= 0) ? 500 : t;
			e._xseen.sphereDefined = false;
			e._xseen.videoState = 'undefined';
			
			// Need to declare photosphere here so that it can be put into the scene graph
			var geometry = new THREE.SphereBufferGeometry( e._xseen.sphereRadius, 60, 40 );
			// invert the geometry on the x-axis so that all of the faces point inward
			geometry.scale(-1, 1, 1);
			var material = new THREE.MeshBasicMaterial( {
											opacity: 0.0,
											transparent: true,
										} );
			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = 'photosphere surface R=' + t;
			e._xseen.sphereDefined = true;
			e._xseen.sphere = mesh;
			mesh = null;
			e.parentNode._xseen.children.push(e._xseen.sphere);
			
			// Define video support
			if (XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent && cameraExists()) {
				var video = document.createElement( 'video' );
				video.setAttribute("autoplay", "1"); 
				video.height			= XSeen.Runtime.SceneDom.height;
				video.width				= XSeen.Runtime.SceneDom.width;
				video.style.height		= video.height + 'px';
				video.style.width		= video.width + 'px';
				video.style.position	= 'absolute';
				video.style.top			= '0';
				video.style.left		= '0';
				video.style.zIndex		= -1;
				e._xseen.video			= video;
				XSeen.Runtime.RootTag.appendChild (video);
				video = null;
				e._xseen.videoState		= 'defined';
			}
			
			var type = XSeen.Tags.background._saveAttributes (e);
			XSeen.Tags.background._processChange (e);
		},
		
// Move modifyable attribute values to main node store
	'_saveAttributes'	: function (e)
		{
			var t = e._xseen.attributes.color;
			e._xseen.color = new THREE.Color (t.r, t.g, t.b);
			e._xseen.imageSource = e._xseen.attributes.src;
			e._xseen.srcExtension = e._xseen.attributes.srcextension;

			var type = e._xseen.attributes.background;
			e._xseen.src = e._xseen.attributes.src;
			e._xseen.srcType = XSeen.Tags.background._checkSrc (e._xseen.src);
			if (type == 'camera') {
				if (e._xseen.videoState == 'undefined') {			// Rollback mechanism
					console.log ('Device camera requested, but not available or defined.');
					type = 'sky';
				} else if (e._xseen.videoState == 'running') {
					console.log ('Device camera requested, but it is already running.');
				} else if (e._xseen.videoState == 'defined') {
					console.log ('Device camera requested, need to engage it.');
				} else {
					console.log ('Device camera requested, but it is XSeen cannot handled it -- No change to background.');
				}
			}

			e._xseen.backgroundType = type;
			return type;
		},

	'_checkSrc'			: function (url) 
		{
			return (XSeen.isImage(url)) ? 'image' : 'path';
		},
		
	'_processChange'	: function (e)
		{
			if (e._xseen.videoState == 'running') {
				// TODO: turn off/pause camera
			}
			if (e._xseen.backgroundType == 'sky') {
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;
				e._xseen.sceneInfo.SCENE.background = e._xseen.color;
			
			} else if (e._xseen.backgroundType == 'camera') {
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;
				e._xseen.sceneInfo.SCENE.background = null;
				XSeen.Tags.background._setupCamera(e);

			} else if (e._xseen.backgroundType == 'fixed') {
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;
				e._xseen.loadTexture = new THREE.TextureLoader().load (e._xseen.attributes.src);
				e._xseen.loadTexture.wrapS = THREE.ClampToEdgeWrapping;
				e._xseen.loadTexture.wrapT = THREE.ClampToEdgeWrapping;
				e._xseen.sceneInfo.SCENE.background = e._xseen.loadTexture;

			} else {
				XSeen.Tags.background._loadBackground (e);
			}
		},
		
/* TODO: Method needs better/proper handling on change
 *	Only create one 'video' tag
 *	Only try to access the camera on the first request
 *	When this is not the background, then pause video feed
 *	Perhaps impose limitation that a XSeen cannot change to a video background
 *	May require capability to turn on/off background node
 */
	'_setupCamera'		: function (e)
		{
			const constraints = {video: {facingMode: "environment"}};
			if (e._xseen.videoState != 'defined') {
				console.log ('Camera/video not correctly configured. Current state: ' + e._xseen.videoState);
				return;
			}
			function handleSuccess(stream) {
				e._xseen.video.srcObject = stream;
				e._xseen.videoState = 'running';
				console.log ('Camera/video engaged and connected to display.');
			}
			function handleError(error) {
				//console.error('Reeeejected!', error);
				console.log ('Device camera not available -- ignoring');
				e._xseen.videoState = 'error';
			}

/*
 *	Debugging only. Figure out what media devices are available
			navigator.mediaDevices.enumerateDevices()
				.then(gotDevices).catch(handleError);

			function gotDevices(deviceInfos) {
				var msgs = '';
				for (var i = 0; i !== deviceInfos.length; ++i) {
					var deviceInfo = deviceInfos[i];
					console.log('Found a media device of type: ' + deviceInfo.kind);
					msgs += 'Found a media device of type: ' + deviceInfo.kind + "(" + deviceInfo.deviceId + '; ' + deviceInfo.groupId + ")\n";
				}
				//alert (msgs);
			}
*/

			navigator.mediaDevices.getUserMedia(constraints).
				then(handleSuccess).catch(handleError);
			//}
		},

/*
 *	Background textures can either be a cube-map image (1 image for each face of a cube) or
 *	a single equirectangular (photosphere) image of width = 2 x height. For any image, each dimension
 *	must be a power of 2. 
 *
 *	The attribute 'backgroundiscube' determines whether the texture is cube- or sphere- mapped.
 *	backgroundiscube == false ==> sphere-mapped texture. These attributes are also allowed:
 *		radius		sets the radius of the sphere that is constructed for the texture. This can only be set once.
 *		src			The sphere-mapped texture.
 *	backgroundiscube == true ==> cube-mapped texture. These attributes are also allowed:
 *		src			The cube-mapped texture that can take any of the following forms (all proceeded by domain and path):
 *			<file>.<extension> loads the specified image. This is not yet functioning [TODO]
 *			...path/ loads the 6 textures in the specified directory. The files MUST be called [n|p][x|y|z].jpg
 *			<full-file> with single '*'. This substitutes (in -turn) ['right', 'left', 'top', 'bottom', 'front', 'back']
 *						for the wild card character to load the 6 cube textures.
 */
 /*
  *		Old code slated for removal...
  *
	'_loadBackground'	: function (attributes, e)
		{
			// Parse src according the description above. 
			if (attributes.backgroundiscube) {
				var urls=[], files=[], tail='', srcFile='';
				var src = attributes.src.split('*');
				var sides = ['right', 'left', 'top', 'bottom', 'front', 'back'];
				var files = [];
				if (src.length == 2) {
					tail = src[src.length-1];
					srcFile = src[0];
					files = sides;
				} else {					// Also requires 'src' ends in '/'
					tail = '.jpg';
					srcFile = src;
					files = ['px', 'nx', 'py', 'ny', 'px', 'nz'];
				}
				for (var ii=0;  ii<sides.length; ii++) {
					urls[sides[ii]] = srcFile + files[ii] + tail;
					urls[sides[ii]] = (attributes['src'+sides[ii]] != '') ? attributes['src'+sides[ii]] : urls[sides[ii]];
/*
 * Old code that reflected a very X3D-centric means of specifying textures
				if (urls[sides[ii]] == '' || urls[sides[ii]] == sides[ii]) {
					urls[sides[ii]] = null;
				} else {
					urls2load ++;
				}
* End of even older code...
				}

				console.log ('Loading background image cube');
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', [urls['right'],
												urls['left'],
												urls['top'],
												urls['bottom'],
												urls['front'],
												urls['back']], '', XSeen.Tags.background.cubeLoadSuccess({'e':e}));
*/
	'_loadBackground'	: function (e)
		{
			// Parse src according the description above. 
			if (e._xseen.backgroundType == 'cube' && e._xseen.srcType == 'path') {
				var urls=[], files=[];
				var files = ['px.', 'nx.', 'py.', 'ny.', 'pz.', 'nz.'];
				for (var ii=0;  ii<files.length; ii++) {
					urls[ii] = e._xseen.src + files[ii] + e._xseen.srcExtension;
				}

				console.log ('Loading background image cube');
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', urls, '', XSeen.Tags.background.cubeLoadSuccess({'e':e}));
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;

			} else {		// Sphere-mapped texture. Need to do all of things specified in the above description
				if (e._xseen.backgroundType == 'sphere' && e._xseen.srcType == 'image') {
					if (!e._xseen.sphereDefined) {
						var geometry = new THREE.SphereBufferGeometry( e._xseen.sphereRadius, 60, 40 );
						// invert the geometry on the x-axis so that all of the faces point inward
						geometry.scale(-1, 1, 1);
						var material = new THREE.MeshBasicMaterial( {
											map: new THREE.TextureLoader().load(e._xseen.src)
										} );

						var mesh = new THREE.Mesh( geometry, material );
						e._xseen.sphereDefined = true;
						e._xseen.sphere = mesh;
						mesh = null;
						e.parentNode._xseen.children.push(e._xseen.sphere);	// Doesn't work because nothing pushes this up further...
					} else {
						e._xseen.sphere.material.map = new THREE.TextureLoader().load(e._xseen.src);
						e._xseen.sphere.material.transparent = false;
						e._xseen.sphere.material.opacity = 1.0;
						e._xseen.sphere.material.needsUpdate = true;
						console.log (e._xseen.sphere.material);
					}
				}
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'cubeLoadSuccess' : function (userdata)
		{
			var thisEle = userdata.e;
			return function (textureCube)
			{
				thisEle._xseen.processedUrl = true;
				thisEle._xseen.loadTexture = textureCube;
				thisEle._xseen.sceneInfo.SCENE.background = textureCube;
				console.log ('Successful load of background texture cube.');
			}
		},
	'loadProgress' : function (a)
		{
			console.log ('Loading background textures...');
		},
	'loadFailure' : function (a)
		{
			//a._xseen.processedUrl = false;
			console.log ('Load failure');
			console.log ('Failure to load background textures.');
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'background',
						'init'	: XSeen.Tags.background.init,
						'fin'	: XSeen.Tags.background.fin,
						'event'	: XSeen.Tags.background.event,
						'tick'	: XSeen.Tags.background.tick
						})
		.defineAttribute ({'name':'color', dataType:'color', 'defaultValue':'black'})
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':500})
		.defineAttribute ({'name':'background', dataType:'string', 'defaultValue':'sky', enumeration:['sky', 'cube', 'sphere', 'fixed', 'camera'], isCaseInsensitive:true})
		.defineAttribute ({'name':'srcExtension', dataType:'string', 'defaultValue':'jpg', enumeration:['jpgsky', 'jpeg', 'png', 'gif'], isCaseInsensitive:true})
		.defineAttribute ({'name':'srcfront', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcback', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcleft', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcright', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srctop', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcbottom', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'backgroundiscube', dataType:'boolean', 'defaultValue':true})
		.defineAttribute ({'name':'fixed', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'usecamera', dataType:'boolean', 'defaultValue':'false', 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.background._changeAttribute}]})
		.addTag();
//	TODO: Convert backgroundiscube to backgroundtype with the values sky(D) | cube | sphere | fixed | camera. Remove 'fixed' and change logic throughout.
