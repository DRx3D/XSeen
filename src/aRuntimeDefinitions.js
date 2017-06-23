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

xseen.updateOnLoad = function ()
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
		this.parseUrl = function (url)
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
		
		this.debug = {
			INFO:       "INFO",
			WARNING:    "WARNING",
			ERROR:      "ERROR",
			EXCEPTION:  "EXCEPTION",
    
	// determines whether debugging/logging is active. If set to "false"
	// no debugging messages will be logged.
			isActive: false,

    // stores if firebug is available
			isFirebugAvailable: false,
    
    // stores if the xseen.debug object is initialized already
			isSetup: false,
	
	// stores if xseen.debug object is append already (Need for IE integration)
			isAppend: false,

    // stores the number of lines logged
			numLinesLogged: 0,
    
    // the maximum number of lines to log in order to prevent
    // the browser to slow down
			maxLinesToLog: 10000,

	// the container div for the logging messages
			logContainer: null,
    
    /** @brief Setup the xseen.debug object.

        Checks for firebug and creates the container div for the logging 
		messages.
      */
			setup: function() {
				// If debugging is already setup simply return
				if (xseen.debug.isSetup) { return; }

				// Check for firebug console
				try {
					if (window.console.firebug !== undefined) {
						xseen.debug.isFirebugAvailable = true;           
					}
				}
				catch (err) {
					xseen.debug.isFirebugAvailable = false;
				}
        
				xseen.debug.setupLogContainer();

				// setup should be setup only once, thus store if we done that already
				xseen.debug.isSetup = true;
			},
	
	/** @brief Activates the log
      */
			activate: function(visible) {
				xseen.debug.isActive = true;
		
        //var aDiv = document.createElement("div");
        //aDiv.style.clear = "both";
        //aDiv.appendChild(document.createTextNode("\r\n"));
        //aDiv.style.display = (visible) ? "block" : "none";
				xseen.debug.logContainer.style.display = (visible) ? "block" : "none";
		
		//Need this HACK for IE/Flash integration. IE don't have a document.body at this time when starting Flash-Backend
				if(!xseen.debug.isAppend) {
					if(navigator.appName == "Microsoft Internet Explorer") {
				//document.documentElement.appendChild(aDiv);
						xseen.debug.logContainer.style.marginLeft = "8px";
						document.documentElement.appendChild(xseen.debug.logContainer);
					}else{
				//document.body.appendChild(aDiv);
						document.body.appendChild(xseen.debug.logContainer);
					}
					xseen.debug.isAppend = true;
				}
			},

	/** @brief Inserts a container div for the logging messages into the HTML page
      */
			setupLogContainer: function() {
				xseen.debug.logContainer = document.createElement("div");
				xseen.debug.logContainer.id = "xseen_logdiv";
				xseen.debug.logContainer.setAttribute("class", "xseen-logContainer");
				xseen.debug.logContainer.style.clear = "both";
		//document.body.appendChild(xseen.debug.logContainer);
			},

	/** @brief Generic logging function which does all the work.

		@param msg the log message
		@param logType the type of the log message. One of INFO, WARNING, ERROR 
					   or EXCEPTION.
      */
			doLog: function(msg, logType) {

		// If logging is deactivated do nothing and simply return
				if (!xseen.debug.isActive) { return; }

		// If we have reached the maximum number of logged lines output
		// a warning message
				if (xseen.debug.numLinesLogged === xseen.debug.maxLinesToLog) {
					msg = "Maximum number of log lines (=" + xseen.debug.maxLinesToLog + ") reached. Deactivating logging...";
				}

		// If the maximum number of log lines is exceeded do not log anything
		// but simply return 
				if (xseen.debug.numLinesLogged > xseen.debug.maxLinesToLog) { return; }

		// Output a log line to the HTML page
				var node = document.createElement("p");
				node.style.margin = 0;
				switch (logType) {
					case xseen.debug.INFO:
						node.style.color = "#009900";
						break;
					case xseen.debug.WARNING:
						node.style.color = "#cd853f";
						break;
					case xseen.debug.ERROR:
						node.style.color = "#ff4500";
						break;
					case xseen.debug.EXCEPTION:
						node.style.color = "#ffff00";
						break;
					default: 
						node.style.color = "#009900";
						break;
				}
		
		// not sure if try/catch solves problem http://sourceforge.net/apps/trac/x3dom/ticket/52
		// but due to no avail of ATI gfxcard can't test
				try {
					node.innerHTML = logType + ": " + msg;
					xseen.debug.logContainer.insertBefore(node, xseen.debug.logContainer.firstChild);
				} catch (err) {
					if (window.console.firebug !== undefined) {
						window.console.warn(msg);
					}
				}
        
		// Use firebug's console if available
				if (xseen.debug.isFirebugAvailable) {
					switch (logType) {
						case xseen.debug.INFO:
							window.console.info(msg);
							break;
						case xseen.debug.WARNING:
							window.console.warn(msg);
							break;
						case xseen.debug.ERROR:
							window.console.error(msg);
							break;
						case xseen.debug.EXCEPTION:
							window.console.debug(msg);
							break;
						default: 
							break;
					}
				}
        
				xseen.debug.numLinesLogged++;
			},
    
    /** Log an info message. */
			logInfo: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.INFO);
			},
    
    /** Log a warning message. */
			logWarning: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.WARNING);
			},
    
    /** Log an error message. */
			logError: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.ERROR);
			},
    
    /** Log an exception message. */
			logException: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.EXCEPTION);
			},

    /** Log an assertion. */
			assert: function(c, msg) {
				if (!c) {
					xseen.debug.doLog("Assertion failed in " + xseen.debug.assert.caller.name + ': ' + msg, xseen.debug.ERROR);
				}
			},
	
	/**
	 Checks the type of a given object.
	 
	 @param obj the object to check.
	 @returns one of; "boolean", "number", "string", "object",
	  "function", or "null".
	*/
			typeOf: function (obj) {
				var type = typeof obj;
				return type === "object" && !obj ? "null" : type;
			},

	/**
	 Checks if a property of a specified object has the given type.
	 
	 @param obj the object to check.
	 @param name the property name.
	 @param type the property type (optional, default is "function").
	 @returns true if the property exists and has the specified type,
	  otherwise false.
	*/
			exists: function (obj, name, type) {
				type = type || "function";
				return (obj ? this.typeOf(obj[name]) : "null") === type;
			},
	
	/**
	 Dumps all members of the given object.
	*/
			dumpFields: function (node) {
				var str = "";
				for (var fName in node) {
					str += (fName + ", ");
				}
				str += '\n';
				xseen.debug.logInfo(str);
				return str;
			}
		};
// Call the setup function to... umm, well, setup xseen.debug
		this.debug.setup();

	};
