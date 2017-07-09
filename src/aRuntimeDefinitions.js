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
		this.ORIGIN					= xseen.types.Vector3([0,0,0])

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

		this.Events = {
				MODE_NAVIGATION:	1,
				MODE_SELECT:		2,
				mode:				2,
				inNavigation: function () {return (this.mode == this.MODE_NAVIGATION) ? true : false;},
				inSelect: function () {return (this.mode == this.MODE_SELECT) ? true : false;},
				that: this,
				routes: [],
				redispatch: false,
				object: {},
				raycaster: new THREE.Raycaster(),
				mouse: new THREE.Vector2(),
				

/*
 * Handle user-generated events on the canvas. These include all mouse events (click, doubleClick, move, drag...)
 * Need to create new XSeen event (has event.xseen = true) that is essentially the same and dispatch the
 * event from the proper target (for selection mode). The proper target is selected with the help of WebGL to
 * find the first (closest) object in the scene that intersects a ray drawn from the cursor. May need to add a field
 * to THREE geometry that indicates if it is selectable.
 *
 * In NavigationMode, cursor movements tend to indicate navigation requests. This is the default mode. The system is
 * switched into SelectMode when the user "clicks" on geometry that is active (selectable).
 *
 * Need to clearly define event operations
 * Initially: [2017-06-27]
 * Regular mouse events are captured here. Perhaps initially should only capture mousedown
 * Check to see what (if any) selectable nodes (probably a subset of geometry) intersects a ray drawn from the cusor
 * If nothing, (background is not selectable), then switch to MODE_NAVIGATION; otherwise switch to MODE_SELECT
 * Establish event handlers for mouseup, leave canvas, mousemove, click, and double-click
 * Handlers act differently based on MODE
 * MODE_SELECT events are converted to 'xseen' CustomEvent and can bubble up past <xseen>
 * MODE_NAVIGATION events are 'captured' (not bubbled) and drive the camera position
 *
 * In MODE_SELECT
 *	mousedown	sets redispatch to TRUE
 *	click		Activates 
 *	dblclick	??
 *	mouseup		terminates select
 *	mousemove	sets redispatch to FALSE
 *	In all cases, recreate event as type='xseen' and dispatch from geometry when
 *	redispatch is TRUE. 
 */
				canvasHandler: function (ev)
					{
						//console.log ('Primary canvas event handler for event type: ' + ev.type);
						var sceneInfo = ev.currentTarget._xseen.sceneInfo;
						var localXseen = sceneInfo.xseen;
						var lEvents = localXseen.Events;
						var type = ev.type;
						if (type == 'mousedown') {
							lEvents.redispatch = true;
							lEvents.mode = lEvents.MODE_SELECT;
							lEvents.mouse.x = (ev.clientX / 800) * 2 -1;	// TODO: Use real XSeen display sizes
							lEvents.mouse.y = (ev.clientY / 450) * 2 -1;
							//
							lEvents.raycaster.setFromCamera(lEvents.mouse, sceneInfo.element._xseen.renderer.activeCamera);
							var hitGeometryList = lEvents.raycaster.intersectObjects (sceneInfo.selectable, true);
							if (hitGeometryList.length != 0) {
								lEvents.object = hitGeometryList[0];
							} else {
								lEvents.object = {};
								lEvents.redispatch = false;
								lEvents.mode = lEvents.MODE_NAVIGATION;
							}
						}
						if ((lEvents.redispatch || type == 'click' || type == 'dblclick') && typeof(lEvents.object.object) !== 'undefined') {
							// Generate an XSeen (Custom)Event of the same type and dispatch it
							var newEv = lEvents.createEvent (ev, lEvents.object);
							lEvents.object.object.userData.dispatchEvent(newEv);
							ev.stopPropagation();		// No propagation beyond this tag
						} else {
							//console.log ('Navigation mode...');
						}
						if (type == 'mouseup') {
							lEvents.redispatch = false;
							lEvents.mode = lEvents.MODE_NAVIGATION;
						}
					},

				createEvent: function (ev, selectedObject)
					{
						var properties = {
								'detail':		{					// This object contains all of the XSeen data
										'type':			ev.type,
										'originalType':	ev.type,
										'originator':	selectedObject.object.userData,
										'position': {
												'x': selectedObject.point.x,
												'y': selectedObject.point.y,
												'z': selectedObject.point.z,
												},
										'normal': {
												'x': 0,
												'y': 0,
												'z': 0,
												},
										'uv': {
												'x': selectedObject.uv.x,
												'y': selectedObject.uv.y,
												},
										'screenX':	ev.screenX,
										'screenY':	ev.screenY,
										'clientX':	ev.clientX,
										'clientY':	ev.clientY,
										'ctrlKey':	ev.ctrlKey,
										'shiftKey':	ev.shiftKey,
										'altKey': 	ev.altKey,
										'metaKey':	ev.metaKey,
										'button':	ev.button,
										'buttons':	ev.buttons,
												},
								'bubbles':		ev.bubbles,
								'cancelable':	ev.cancelable,
								'composed':		ev.composed,
							};

						var newEvent = new CustomEvent('xseen', properties);
						return newEvent;
					},
				// Uses method described in https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
				// to change 'this' for the handler method. Want 'this' to refer to the target node.
				addHandler: function (route, source, eventName, destination, field)
					{
						var handler = {};
						handler.route = route;					// Route element
						handler.source = source;				// Source element
						handler.type = eventName;				// Event type
						handler.destination = destination;		// Destination element
						handler.field = field;					// Destination field structure
						handler.handler = destination._xseen.handlers[field.handlerName];
						this.routes.push (handler);
						if (typeof(source._xseen) === 'undefined') {	// DOM event
							source.addEventListener (eventName, function(ev) {
								handler.handler(ev)
								});
						} else {								// XSeen event
							source.addEventListener ('xseen', function(ev) {
								//console.log ('New event of original type: |'+ev.detail.originalType+'|; Desired type: |'+handler.type+'|');
								if (ev.detail.originalType == handler.type) {
									handler.handler(ev)
								}
								});
						}
					},

				// Generic notification handler for XSeen's canvas
				XSeenHandler: function (ev)
					{
						//console.log ('XSeen DEBUG Event Bubble handler ('+ev.type+'/'+ev.eventPhase+').');
					},
				XSeenDebugHandler : function (ev)
					{
						console.log ('XSeen DEBUG Event Capture handler ('+ev.type+'/'+ev.eventPhase+').');
					},
			};

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
