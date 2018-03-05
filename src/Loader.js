/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen loader.
 * This object is the manager for all XSeen loading operations.
 *
 *
 *
 */

var XSeen = XSeen || {};

// Base code from https://www.abeautifulsite.net/parsing-urls-in-javascript
XSeen.parseUrl = function (url) {
		var parser = document.createElement('a'),
		searchObject = {},
        queries, split, i, pathFile, path, file, extension;
		// Let the browser do the work
		parser.href = url;
		// Convert query string to object
    	queries = parser.search.replace(/^\?/, '').split('&');
    	for( i = 0; i < queries.length; i++ ) {
			split = queries[i].split('=');
			searchObject[split[0]] = split[1];
		}
		pathFile = parser.pathname.split('/');
		file = pathFile[pathFile.length-1];
		pathFile.length --;
		path = '/' + pathFile.join('/');
		extension = file.split('.');
		extension = extension[extension.length-1];
    	return {
        	protocol:		parser.protocol,
        	host:			parser.host,
        	hostname:		parser.hostname,
        	port:			parser.port,
        	pathname:		parser.pathname,
			path:			path,
			file:			file,
			extension:		extension,
        	search:			parser.search,
        	searchObject:	searchObject,
        	hash:			parser.hash
    		};
};

XSeen.Loader = {
						// define internal variables
	'urlQueue'			: [],
	'urlNext'			: -1,
	'MaxRequests'		: 3,
	'totalRequests'		: 0,
	'totalResponses'	: 0,
	'requestCount'		: 0,
	'lmThat'			: this,
	'ContentType'		: {
							'jpg'	: 'image',
							'jpeg'	: 'image',
							'gif'	: 'image',
							'txt'	: 'text',
							'html'	: 'html',
							'htm'	: 'html',
							'xml'	: 'xml',
							'json'	: 'json',
							'dae'	: 'collada',
							'gltf'	: 'gltf',
							'glb'	: 'gltfLegacy',
							'obj'	: 'obj',
							'x3d'	: 'x3d',
						},
	'ContentLoaders'	: {},
	'internalLoader'	: function (url, success, failure, progress, userdata, type)
		{
			this.urlQueue.push( {'url':url, 'type':type, 'hint':hint, 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
			this.loadNextUrl();
		},

//var lmThat = this;

/*
 *	Sets up for loading an external resource. 
 *	The resource is loaded from a FIFO queue
 *	Loading happens asynchronously. The Loader parameter
 *	MaxRequests determines the maximum number of simoultaneous requests
 *
 *	Parameters:
 *		url			The URL of the resource
 *		hint		A hint to the loader to help it determine which specific loader to use. Most of the
 *					time the file extension is sufficient to determine the specific loader; however, some
 *					file extensions may be used for incompatible file formats (e.x., glTF V1.0, V1.1, and V2.0).
 *					The hint should contain the version number without 'V'.
 *		success		The callback function to call on successful load
 *		failure		The callback function to call on when the loading fails
 *		progress	The callback function to call while the loading is occurring
 *		userdata	A object to be included with all of the callbacks.
 */
	'load'		: function (url='', hint='', success, failure, progress, userdata)
		{
			var uri = XSeen.parseUrl (url);
			var type = (typeof(this.ContentType[uri.extension]) === 'undefined') ? this.ContentType['txt'] : this.ContentType[uri.extension];
			var MimeLoader = this.ContentLoaders[type];
			if (MimeLoader.needHint === true && hint == '') {
				console.log ('Hint require to load content type ' + type);
				return false;
			}
			
			if (MimeLoader.needHint) {
				if (type == 'gltf') {
					if (hint == '') {hint = 'Current';}
					type += hint;
					MimeLoader = this.ContentLoaders[type];
				}		// Other types go here
			}

			if (typeof(MimeLoader.loader) === 'undefined') {
				this.internalLoader (url, success, failure, progress, userdata, type);
			} else {
				MimeLoader.loader.load (url, success, progress, failure);
			}
		},
	


// TODO: These are copied from previous Loader. Need to make sure they still work & meet the right needs		
	'success'	: function (response, string, xhr)
		{
			if (typeof(xhr._loadManager.success) !== undefined) {
				xhr._loadManager.success (response, xhr._loadManager.userdata, xhr);
			}
		},
	'progress'	: function (xhr, errorCode, errorText)
		{
			if (typeof(xhr._loadManager.progress) !== undefined) {
				xhr._loadManager.progress (xhr, xhr._loadManager.userdata, errorCode, errorText);
			}
		},
	'failure'	: function (xhr, errorCode, errorText)
		{
			if (typeof(xhr._loadManager.failure) !== undefined) {
				xhr._loadManager.failure (xhr, xhr._loadManager.userdata, errorCode, errorText);
			}
		},

	'requestComplete'	: function (event, xhr, settings)
		{
			this.lmThat.requestCount --;
			this.lmThat.totalResponses++;
			this.lmThat.loadNextUrl();
		},

	'loadNextUrl'		: function ()
		{
			if (this.requestCount >= this.MaxRequests) {return; }
			if (this.urlNext >= this.urlQueue.length || this.urlNext < 0) {
				this.urlNext = -1;
				for (var i=0; i<this.urlQueue.length; i++) {
					if (this.urlQueue[i] !== null) {
						this.urlNext = i;
						break;
					}
				}
				if (this.urlNext < 0) {
					this.urlQueue = [];
					return;
				}
			}

			this.requestCount ++;
			var details = this.urlQueue[this.urlNext];
			var settings = {
							'url'		: details.url,
							'dataType'	: details.type,
							'complete'	: this.requestComplete,
							'success'	: this.success,
							'error'		: this.failure
							};
			if (settings.dataType == 'json') {
				settings['beforeSend'] = function(xhr){xhr.overrideMimeType("application/json");};
			}
			this.urlQueue[this.urlNext] = null;
			this.urlNext ++;
			var x = jQuery.get(settings);		// Need to change this... Has impact throughout class
			x._loadManager = {'userdata': details.userdata, 'requestType':details.type, 'success':details.success, 'failure':details.failure};
			this.totalRequests++;
		},
};

XSeen.Loader.onLoad = function() {
	XSeen.Loader.ContentLoaders = {
							'image'		: {'loader': null, needHint: false, },
							'text'		: {'loader': null, needHint: false, },
							'html'		: {'loader': null, needHint: false, },
							'xml'		: {'loader': null, needHint: false, },
							'json'		: {'loader': null, needHint: false, },
							'gltf'		: {'loader': null, needHint: 2, },
							'collada'	: {'loader': new THREE.ColladaLoader(), needHint: false, },
							'obj'		: {'loader': new THREE.OBJLoader2(), needHint: false, },
							'x3d'		: {'loader': new THREE.ColladaLoader(), needHint: false, },
							'gltfCurrent'	: {'loader': new THREE.GLTFLoader(), needHint: false, }, 
							'gltfLegacy'	: {'loader': new THREE.LegacyGLTFLoader(), needHint: false, }, 
						};
	console.log ('Created ContentLoaders object');
};
if (typeof(XSeen.onLoadCallBack) === 'undefined') {
	XSeen.onLoadCallBack = [];
}
XSeen.onLoadCallBack.push (XSeen.Loader.onLoad);

