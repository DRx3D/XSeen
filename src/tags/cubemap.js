/*
 * XSeen JavaScript library
 *
 * (c)2019, Daly Realism, Los Angeles
 *
 *
 */

 // Control Node definitions

/*
 * Loads an image texture from one or more files and constructs an internal cubemap for use
 *	by other nodes. For this to be used by other nodes, the value of 'id' attribute must be specified.
 *
 *	Both a cubemap and sphercal image map are created for use
 */ 

XSeen.Tags.cubemap = {
	'TextureSize'		: 1024,		// Must be a power of 2
	
	'_changeAttribute'	: function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				var type = XSeen.Tags.cubemap._saveAttributes (e);
				XSeen.Tags.cubemap._processChange (e);
			} else {
				XSeen.LogWarn("Re-parse of " + attributeName + " is invalid -- no change")
			}
		},

/*
 *	The photosphere geometry is set up, but made transparent. This ensures that it is in the 
 *	render tree
 *
 *	The method _processChange is called every time there is a change, either to the initial state
 *	or on attribute change.
 */
	'init'	: function (e, p) 
		{
			XSeen.Tags.cubemap._saveAttributes (e);
			e._xseen.cubemap = new THREE.CubeTexture();
			XSeen.Tags.cubemap._processChange (e);
		},
		
// Move modifyable attribute values to main node store
	'_saveAttributes'	: function (e)
		{
			e._xseen.format = e._xseen.attributes.format;
			e._xseen.src = e._xseen.attributes.src;
		},

	'_checkSrc'			: function (url) 
		{
			return (XSeen.isImage(url)) ? 'image' : 'path';
		},

/*
 *	Images can either be a cube-map image (1 image for each face of a cube) or
 *	a single equirectangular (photosphere) image of width = 2 x height. For any image, each dimension
 *	must be a power of 2. 
 *
 *	The attributes 'src' and 'npxyz' determine the image type. If both are present and not empty,
 *	then 'src' has precedence.
 *
 *	src		Specifies the equi-rectangular image that is converted into a cubemap.
 *	npxz	Specifies the path URL to the six cube-face images. The images must be px, py, pz, nx, ny, nz.
 *	format	Specified the file format. Must be a web format (JPEG or PNG).
 *
 */
 
	'_processChange'	: function (e)
		{
			// Parse src according the description above. 
			if (e._xseen.attributes.src != '') {
				e._xseen.equirectangular = new THREE.TextureLoader().load(e._xseen.src);
				var loader = new THREE.TextureLoader();
				loader.load(e._xseen.src, XSeen.Tags.cubemap.cubeLoadSuccess({'e':e, 'cube':false}));

			} else if (e._xseen.attributes.npxyz != '') {
				var urls=[], files=[];
				var files = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
				for (var ii=0;  ii<files.length; ii++) {
					urls[ii] = e._xseen.attributes.npxyz + '/' + files[ii] + '.' + e._xseen.format;
				}
				XSeen.LogDebug ('Loading image cubemap');
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', urls, '', XSeen.Tags.cubemap.cubeLoadSuccess({'e':e, 'cube':true}));
			} else {
				console.log ('No valid image specified for cubemap');
				return;
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'cubeLoadSuccess' : function (userdata)
		{
			var thisEle = userdata.e;
			var cube = userdata.cube;
			return function (texture)
			{
				if (cube) {
					console.log ('Successful load of cubemap to texture cube.');
				} else {
					console.log ('Successful load of cubemap to spherical texture.');
					var equiToCube = new EquirectangularToCubemap( XSeen.Runtime.Renderer );
					console.log ('Class for converter...');
					console.log (equiToCube);
					texture = equiToCube.convert( texture, XSeen.Tags.cubemap.TextureSize );
					console.log ('Converted texture');
					console.log (texture);
				}
				thisEle._xseen.processedUrl = true;
				thisEle._xseen.cubemap = texture;
				// Create event to indicate the XSeen has fully loaded. It is dispatched on the 
				//	this tag but bubbles up so it can be caught.
				////var newEv = new CustomEvent('xseen-assetchange', XSeen.Events.propertiesAssetChanged(XSeen.Runtime, 'texturecube'));
				////thisEle.dispatchEvent(newEv);
				XSeen.Events.loadComplete ('texturecube', thisEle);
				//thisEle._xseen.sceneInfo.SCENE.background = textureCube;
			}
		},
/*
	'loadProgress' : function (a)
		{
			console.log ('Loading cubemap textures...');
		},
	'loadFailure' : function (a)
		{
			//a._xseen.processedUrl = false;
			console.log ('Load failure - Failure to load cubemap textures.');
		},
*/
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'cubemap',
						'init'	: XSeen.Tags.cubemap.init,
						'fin'	: XSeen.Tags.cubemap.fin,
						'event'	: XSeen.Tags.cubemap.event,
						'tick'	: XSeen.Tags.cubemap.tick
						})
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'npxyz', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'format', dataType:'string', 'defaultValue':'jpg', 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.cubemap._changeAttribute}]})
		.addTag();
