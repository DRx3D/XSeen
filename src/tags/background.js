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

XSeen.Tags.background = {
	'_changeAttribute'	: function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			// TODO: add handling of change to 'backgroundiscube' attribute. Need to tie this is an image format change.
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				if (attributeName == 'skycolor') {				// Different operation for each attribute
					e._xseen.sceneInfo.SCENE.background = new THREE.Color(value);

				} else if (attributeName.substr(0,3) == 'src') {
					XSeen.Tags.background._loadBackground (e._xseen.attributes, e);
					
				} else {
					XSeen.LogWarn('No support for updating ' + attributeName);
				}
			} else {
				XSeen.LogWarn("Re-parse of " + attributeName + " is invalid -- no change")
			}
		},

	'init'	: function (e, p) 
		{
			var r = e._xseen.attributes.radius;
			e._xseen.sphereRadius = (r <= 0) ? 500 : r;
			e._xseen.sphereDefined = false;
			var t = e._xseen.attributes.skycolor;
			e._xseen.sceneInfo.SCENE.background = new THREE.Color (t.r, t.g, t.b);
			console.log ("value for 'usecamera' is |"+e._xseen.attributes.usecamera+"|");
			if (e._xseen.attributes.usecamera && XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent) {
				console.log ('Background: using device camera');
				e._xseen.sceneInfo.SCENE.background = null;
				XSeen.Tags.background._setupCamera();
			} else if (e._xseen.attributes.fixed != '') {
				console.log ('Loading background fixed texture');
				e._xseen.loadTexture = new THREE.TextureLoader().load (e._xseen.attributes.fixed);
				e._xseen.loadTexture.wrapS = THREE.ClampToEdgeWrapping;
				e._xseen.loadTexture.wrapT = THREE.ClampToEdgeWrapping;
				e._xseen.sceneInfo.SCENE.background = e._xseen.loadTexture;
			} else {
				XSeen.Tags.background._loadBackground (e._xseen.attributes, e);
			}
		},
		
	'_setupCamera'		: function ()
		{
			//if (XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent) {
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
				.then(gotDevices).catch(handleError);
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
*/
				}

				console.log ('Loading background image cube');
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', [urls['right'],
												urls['left'],
												urls['top'],
												urls['bottom'],
												urls['front'],
												urls['back']], '', XSeen.Tags.background.cubeLoadSuccess({'e':e}));

			} else {		// Sphere-mapped texture. Need to do all of things specified in the above description
				if (!e._xseen.sphereDefined) {
					var geometry = new THREE.SphereBufferGeometry( e._xseen.sphereRadius, 60, 40 );
					// invert the geometry on the x-axis so that all of the faces point inward
					geometry.scale(-1, 1, 1);

					var material = new THREE.MeshBasicMaterial( {
						map: new THREE.TextureLoader().load(attributes.src)
					} );

					var mesh = new THREE.Mesh( geometry, material );
					e._xseen.sphereDefined = true;
					e._xseen.sphere = mesh;
					mesh = null;
				}
				e.parentNode._xseen.children.push(e._xseen.sphere);
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
		.defineAttribute ({'name':'skycolor', dataType:'color', 'defaultValue':'black'})
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcfront', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcback', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcleft', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcright', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srctop', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcbottom', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'backgroundiscube', dataType:'boolean', 'defaultValue':true})
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':500})
		.defineAttribute ({'name':'fixed', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'usecamera', dataType:'boolean', 'defaultValue':'false', 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.background._changeAttribute}]})
		.addTag();
//	TODO: Convert backgroundiscube to backgroundtype with the values cube(D) | sphere | fixed. Remove 'fixed' and change logic throughout.
