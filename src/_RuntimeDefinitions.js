/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * Some portions may be extracted from
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * The Namespace container for x3dom objects.
 * @namespace x3dom
 *
 *	Removed THREE loaders
	loaders:	{
					'file'	: new THREE.FileLoader(),
					'image'	: 0,
				},

 * */

xseen.updateOnLoad	: function ()
	{
		this.loader.Null			= this.loader.X3dLoader;
		this.loadMgr				= new LoadManager();
		this.loader.X3dLoader		= this.loadMgr;
		this.loader.ColladaLoader	= new THREE.ColladaLoader();
		this.loader.GltfLegacy		= new THREE.GLTFLoader();
		this.loader.GltfLoader		= new THREE.GLTF2Loader();
		this.loader.ObjLoader		= new THREE.OBJLoader2();
		this.loader.ImageLoader		= new THREE.TextureLoader();

// Base code from https://www.abeautifulsite.net/parsing-urls-in-javascript
		this.parseUrl		: function (url)
			{
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
		this.versionInfo = this.generateVersion();
	};
