/*
 * For use with XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * Licensed under MIT or GNU in the same manner as XSeen
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * 
 */

/*
 *	Manages all download requests.
 *	Requests are queued up and processed to the maximum limit (.MaxRequests)
 *	Use this for processing text (X3D, XML, JSON, HTML) files. 
 *	Not really setup for binary files (.jpg, png, etc.)
 *
 *	Requires jQuery -- should work on removing that...
 *
 */

function LoadManager () {
	this.urlQueue = [];
	this.urlNext = -1;
	this.MaxRequests = 3;
	this.totalRequests = 0;
	this.totalResponses = 0;
	this.requestCount = 0;
	var lmThat = this;

	this.load = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadText = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'text', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadHtml = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'html', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadXml = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'xml', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadJson = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'json', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadImage = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'image', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.success = function (response, string, xhr) {
		if (typeof(xhr._loadManager.success) !== undefined) {
			xhr._loadManager.success (response, xhr._loadManager.userdata, xhr);
		}
	}

	this.failure = function (xhr) {
		if (typeof(xhr._loadManager.failure) !== undefined) {
			xhr._loadManager.failure (xhr._loadManager.userdata, xhr);
		}
	}

	this.requestComplete = function (event, xhr, settings) {
		lmThat.requestCount --;
		lmThat.totalResponses++;
		lmThat.loadNextUrl();
	}

	this.loadNextUrl = function () {
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
		this.urlQueue[this.urlNext] = null;
		this.urlNext ++;
		var x = jQuery.get(settings);		// Need to change this... Has impact throughout class
		x._loadManager = {'userdata': details.userdata, 'requestType':details.type, 'success':details.success, 'failure':details.failure};
		this.totalRequests++;
	}
}
/*
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
var xseen = {
    canvases		: [],
	sceneInfo		: [],
	nodeDefinitions	: {},
	parseTable		: {},
	node			: {},

	loadMgr			: new LoadManager(),
	loadProgress	: function (xhr) {
						if (xhr.total != 0) {
							console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
						}
					},
	loadError		: function (userdata, xhr) {
						console.error( 'An error happened on '+userdata.e.id);
					},

	
	timeStart		: (new Date()).getTime(),
	timeNow			: (new Date()).getTime(),

	versionInfo		: [],
    x3dNS    		: 'http://www.web3d.org/specifications/x3d-namespace',
    x3dextNS 		: 'http://philip.html5.org/x3d/ext',
    xsltNS   		: 'http://www.w3.org/1999/XSL/x3dom.Transform',
    xhtmlNS  		: 'http://www.w3.org/1999/xhtml',

	dumpChildren	: function (obj, indent, addstr)
						{
							console.log (indent + '> ' + obj.type + ' (' + obj.name + ')');
							for (var i=0; i<obj.children.length; i++) {
								var child = obj.children[i];
								this.dumpChildren(child, indent+addstr, addstr);
							}
						},

	dumpSceneGraph	: function () {this.dumpChildren (xseen.sceneInfo[0].scene, ' +', '--');},

};

xseen.versionInfo = {
	major	: 0,
	minor	: 1,
	revision	: 0,
	version	: '',
	date	: '2017-05-26',
	splashText		: "XSeen 3D Language parser.<br>\nAll X3D and A-Frame pre-defined solids, fixed camera, directional light, Material texture only<br>\nNext work<ul><li>Internal Documentation</li><li>Event Model/Animation</li><li>A-Frame Entities</li></ul>",
};
xseen.versionInfo.version = xseen.versionInfo.major + '.' + xseen.versionInfo.minor + '.' + xseen.versionInfo.revision;





/**
 * Important future work (not listed above)
 *	- Animations
 *	- A-Frame entities (limited)
 *	- Navigation
 *	- External geometry
 *	- Internal geometry (IndexedFaceSet, IndexedTriangleSet, ...)
 *
 */



/**
 * Function to add nodes to parser
 * see NodeDefinitions.js for details
 *
 * This function can be called multiple times. Duplicate entries overwrite previous ones.
 * */

/*
xseen.NodeActions = {};		// Nodes as defined
xseen.NodeActionsLC = {};	// Lowercase node names
xseen.NodeActionsD = {};	// Development lowercase node names
xseen.addNodes = function (nodes)
	{
		var ii;
		for (ii=0; ii<nodes.length; ii++) {
			xseen.NodeActions[nodes[ii].node] = nodes[ii].action;
			xseen.NodeActionsLC[(nodes[ii].node).toLowerCase()] = nodes[ii].action;
			xseen.NodeActionsD['x-'+(nodes[ii].node).toLowerCase()] = nodes[ii].action;
		}
	};
*/

// Define function for adding node to parsing tables
//	May need to verify 'newNode' is a legitamite JS property
xseen._defineNode = function (newNode, nodeMethod) {
	var namelc = newNode.toLowerCase();
	xseen.nodeDefinitions[namelc] = {'name' : newNode, 'namelc' : namelc, 'method' : nodeMethod};
}
//xseen._nodeDefinitions();


/**
 * The xseen.nodeTypes namespace.
 * @namespace xseen.nodeTypes
 * */
xseen.nodeTypes = {};

/**
 * The xseen.nodeTypesLC namespace. Stores nodetypes in lowercase
 * @namespace xseen.nodeTypesLC
 * */
xseen.nodeTypesLC = {};

/**
 * The xseen.components namespace.
 * @namespace xseen.components
 * */
xseen.components = {};

/** Cache for primitive nodes (Box, Sphere, etc.) */
xseen.geoCache = [];

/** Stores information about Browser and hardware capabilities */
xseen.caps = { PLATFORM: navigator.platform, AGENT: navigator.userAgent, RENDERMODE: "HARDWARE" };

/** Registers the node defined by @p nodeDef.

    The node is registered with the given @p nodeTypeName and @p componentName.

    @param nodeTypeName the name of the node type (e.g. Material, Shape, ...)
    @param componentName the name of the component the node type belongs to
    @param nodeDef the definition of the node type
 */
xseen.registerNodeType = function(nodeTypeName, componentName, nodeDef) {
    //console.log("Registering nodetype [" + nodeTypeName + "] in component [" + componentName + "]");
    if (xseen.components[componentName] === undefined) {
        xseen.components[componentName] = {};
    }
    nodeDef._typeName = nodeTypeName;
    nodeDef._compName = componentName;
    xseen.components[componentName][nodeTypeName] = nodeDef;
    xseen.nodeTypes[nodeTypeName] = nodeDef;
    xseen.nodeTypesLC[nodeTypeName.toLowerCase()] = nodeDef;
};

/** Test if node is registered X3D element */
xseen.isX3DElement = function(node) {
    // xseen.debug.logInfo("node=" + node + "node.nodeType=" + node.nodeType + ", node.localName=" + node.localName + ", ");
    var name = (node.nodeType === Node.ELEMENT_NODE && node.localName) ? node.localName.toLowerCase() : null;
    return (name && (xseen.nodeTypes[node.localName] || xseen.nodeTypesLC[name] ||
            name == "x3d" || name == "websg" || name == "route"));
};

/*
 *	Function: xseen.extend
 *
 *	Returns a prototype object suitable for extending the given class
 *	_f_. Rather than constructing a new instance of _f_ to serve as
 *	the prototype (which unnecessarily runs the constructor on the created
 *	prototype object, potentially polluting it), an anonymous function is
 *	generated internally that shares the same prototype:
 *
 *	Parameters:
 *   	f - Method f a constructor
 *
 *	Returns:
 * 		A suitable prototype object
 *
 *	See Also:
 *		Douglas Crockford's essay on <prototypical inheritance at http://javascript.crockford.com/prototypal.html>.
 */
// TODO; unify with defineClass, which does basically the same
xseen.extend = function(f) {
  function G() {}
  G.prototype = f.prototype || f;
  return new G();
};

/**
 * Function xseen.getStyle
 * 
 * Computes the value of the specified CSS property <tt>p</tt> on the
 * specified element <tt>e</tt>.
 *
 * Parameters:
 *     oElm       - The element on which to compute the CSS property
 *     strCssRule - The name of the CSS property
 *
 *	Returns:
 *
 * 		The computed value of the CSS property
 */
xseen.getStyle = function(oElm, strCssRule) {
    var strValue = "";
    var style = document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(oElm, null) : null;
    if (style) {
        strValue = style.getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){ return p1.toUpperCase(); });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
};


/** Utility function for defining a new class.

    @param parent the parent class of the new class
    @param ctor the constructor of the new class
    @param methods an object literal containing the methods of the new class
    @return the constructor function of the new class
  */
function defineClass(parent, ctor, methods) {
    if (parent) {
        function Inheritance() {}
        Inheritance.prototype = parent.prototype;

        ctor.prototype = new Inheritance();
        ctor.prototype.constructor = ctor;
        ctor.superClass = parent;
    }
    if (methods) {
        for (var m in methods) {
            ctor.prototype[m] = methods[m];
        }
    }
    return ctor;
}

/** Utility function for testing a node type.

    @param object the object to test
    @param clazz the type of the class
    @return true or false
  */
xseen.isa = function(object, clazz) {
    /*
	if (!object || !object.constructor || object.constructor.superClass === undefined) {
		return false;
	}
    if (object.constructor === clazz) {
        return true;
    }

    function f(c) {
        if (c === clazz) {
            return true;
        }
        if (c.prototype && c.prototype.constructor && c.prototype.constructor.superClass) {
            return f(c.prototype.constructor.superClass);
        }
        return false;
    }
    return f(object.constructor.superClass);
    */
    return (object instanceof clazz);
};


/// helper
xseen.getGlobal = function () {
    return (function () {
        return this;
    }).call(null);
};


/**
 * Load javascript file either by performing an synchronous jax request
 * an eval'ing the response or by dynamically creating a <script> tag.
 *
 * CAUTION: This function is a possible source for Cross-Site
 *          Scripting Attacks.
 *
 * @param  src  The location of the source file relative to
 *              path_prefix. If path_prefix is omitted, the
 *              current directory (relative to the HTML document)
 *              is used instead.
 * @param  path_prefix A prefix URI to add to the resource to be loaded.
 *                     The URI must be given in normalized path form ending in a
 *                     path separator (i.e. src/nodes/). It can be in absolute
 *                     URI form (http://somedomain.tld/src/nodes/)
 * @param  blocking    By default the lookup is done via blocking jax request.
 *                     set to false to use the script i
 */
xseen.loadJS = function(src, path_prefix, blocking) {
    blocking = (blocking === false) ? blocking : true;   // default to true

    if (blocking) {
        var url = (path_prefix) ? path_prefix.trim() + src : src;
        var req = new XMLHttpRequest();

        if (req) {
            // third parameter false = synchronous/blocking call
            // need this to load the JS before onload completes
            req.open("GET", url, false);
            req.send(null); // blocking

            // maybe consider global eval
            // http://perfectionkills.com/global-eval-what-are-the-options/#indirect_eval_call_examples
            eval(req.responseText);
        }
    } else {
        var head = document.getElementsByTagName('HEAD').item(0);
        var script = document.createElement("script");
        var loadpath = (path_prefix) ? path_prefix.trim() + src : src;
        if (head) {
            xseen.debug.logError("Trying to load external JS file: " + loadpath);
            //alert("Trying to load external JS file: " + loadpath);
            script.type = "text/javascript";
            script.src = loadpath;
            head.appendChild(script);
        } else {
            alert("No document object found. Can't load components!");
            //xseen.debug.logError("No document object found. Can't load components");
        }
    }
};

// helper
function array_to_object(a) {
  var o = {};
  for(var i=0;i<a.length;i++) {
    o[a[i]]='';
  }
  return o;
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 * https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
 */
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
    	   window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 16);
           };
})();

/**
 * Toggle full-screen mode
 */
xseen.toggleFullScreen = function() {
    if (document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen) {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
    else {
        var docElem = document.documentElement;
        if (docElem.requestFullScreen) {
            docElem.requestFullScreen();
        }
        else if (docElem.mozRequestFullScreen) {
            docElem.mozRequestFullScreen();
        }
        else if (docElem.webkitRequestFullScreen) {
            docElem.webkitRequestFullScreen();
        }
    }
};
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

xseen.debug = {

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
        
		// 
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
			msg = "Maximum number of log lines (=" + xseen.debug.maxLinesToLog + 
				  ") reached. Deactivating logging...";
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
			xseen.debug.doLog("Assertion failed in " + 
                    xseen.debug.assert.caller.name + ': ' + 
                    msg, xseen.debug.ERROR);
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
xseen.debug.setup();
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 * Removed code for
 * - ActiveX 
 * - Flash
 * 
 */

xseen.rerouteSetAttribute = function(node, browser) {
    // save old setAttribute method
    node._setAttribute = node.setAttribute;
    node.setAttribute = function(name, value) {
        var id = node.getAttribute("_xseenNode");
        var anode = browser.findNode(id);
        
        if (anode)
            return anode.parseField(name, value);
        else
            return 0;
    };

    for(var i=0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        xseen.rerouteSetAttribute(child, browser);
    }
};


// holds the UserAgent feature
/*xseen.userAgentFeature = {
    supportsDOMAttrModified: false
};
 */

(function loadXSeen() {
    "use strict";

    var onload = function() {
        var i,j;  // counters

        // Search all X-Scene elements in the page
		//alert ('Finding all x-scene tags...');
        var xseens_unfiltered = document.getElementsByTagName('scene');
        var xseens = [];
		var sceneInfo

        // check if element already has been processed
        for (var i=0; i < xseens_unfiltered.length; i++) {
            if (xseens_unfiltered[i].hasRuntime === undefined)
                xseens.push(xseens_unfiltered[i]);
        }

        // ~~ Components and params {{{ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var params;
        var settings = new xseen.Properties();  // stores the stuff in <param>
        var validParams = array_to_object([ 
            'showLog', 
            'showStat',
            'showProgress', 
            'PrimitiveQuality', 
            'components', 
            'loadpath', 
            'disableDoubleClick',
            'backend',
            'altImg',
            'runtimeEnabled',
            'keysEnabled',
            'showTouchpoints',
            'disableTouch',
            'maxActiveDownloads'
        ]);
        var components, prefix;
		var showLoggingConsole = false;

        // for each XSeens element
        for (var i=0; i < xseens.length; i++) {

            // default parameters
            settings.setProperty("showLog", xseens[i].getAttribute("showLog") || 'false');
            settings.setProperty("showLog", xseens[i].getAttribute("showLog") || 'true');
            settings.setProperty("showStat", xseens[i].getAttribute("showStat") || 'false');
            settings.setProperty("showProgress", xseens[i].getAttribute("showProgress") || 'true');
            settings.setProperty("PrimitiveQuality", xseens[i].getAttribute("PrimitiveQuality") || 'High');

            // for each param element inside the X3D element
            // add settings to properties object
            params = xseens[i].getElementsByTagName('PARAM');
            for (var j=0; j < params.length; j++) {
                if (params[j].getAttribute('name') in validParams) {
                    settings.setProperty(params[j].getAttribute('name'), params[j].getAttribute('value'));
                } else {
                    //xseen.debug.logError("Unknown parameter: " + params[j].getAttribute('name'));
                }
            }

            // enable log
            if (settings.getProperty('showLog') === 'true') {
				showLoggingConsole = true;
            }

            if (typeof X3DOM_SECURITY_OFF != 'undefined' && X3DOM_SECURITY_OFF === true) {
                // load components from params or default to x3d attribute
                components = settings.getProperty('components', xseens[i].getAttribute("components"));
                if (components) {
                    prefix = settings.getProperty('loadpath', xseens[i].getAttribute("loadpath"));
                    components = components.trim().split(',');
                    for (j=0; j < components.length; j++) {
                        xseen.loadJS(components[j] + ".js", prefix);
                    }
                }

                // src=foo.x3d adding inline node, not a good idea, but...
                if (xseens[i].getAttribute("src")) {
                    var _scene = document.createElement("scene");
                    var _inl = document.createElement("Inline");
                    _inl.setAttribute("url", xseens[i].getAttribute("src"));
                    _scene.appendChild(_inl);
                    xseens[i].appendChild(_scene);
                }
            }
        }
        // }}}
		
		if (showLoggingConsole == true) {
			xseen.debug.activate(true);
		} else {
			xseen.debug.activate(false);
		}

        // Convert the collection into a simple array (is this necessary?)
        xseens = Array.map(xseens, function (n) {
            n.hasRuntime = true;
            return n;
        });

        if (xseen.versionInfo !== undefined) {
            xseen.debug.logInfo("X3DOM version " + xseen.versionInfo.version + ", " +
                                "Revison " + xseen.versionInfo.revision + ", " +
                                "Date " + xseen.versionInfo.date);
            xseen.debug.logInfo(xseen.versionInfo.splashText);
        }
        
        //xseen.debug.logInfo("Found " + xseen.length + " XSeen nodes");
        	
		
        // Create a HTML canvas for every XSeen scene and wrap it with
        // an X3D canvas and load the content
        var x_element;
        var x_canvas;
        var altDiv, altP, aLnk, altImg;
        var t0, t1;

        for (var i=0; i < xseens.length; i++)
        {
            x_element = xseens[i];

			// Need to replace with code that reference THREE
            x_canvas = new THREE.Scene(); // May need addtl info if multiple: xseen.X3DCanvas(x_element, xseen.canvases.length);
            xseen.canvases.push(x_canvas);
			// Need to handle failure to initialize?
            
            t0 = new Date().getTime();


			var divWidth = x_element.getAttribute('width');
			var divHeight =  x_element.getAttribute('height');
			//var divWidth = window.innerWidth;
			//var divHeight =  window.innerHeight;
			var x_camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
			x_camera.position.x = 0;
			x_camera.position.z = 10;
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (divWidth, divHeight);
			x_element.appendChild (x_renderer.domElement);
			
			xseen.sceneInfo.push ({'size':{'width':divWidth, 'height':divHeight}, 'scene' : x_canvas, 'renderer' : x_renderer, 'camera' : [x_camera], 'element' : x_element});
			//x_element._xseen.sceneInfo = ({'scene' : x_canvas, 'renderer' : x_renderer, 'camera' : [x_camera], 'element' : x_element});
			x_element._xseen = {};
			x_element._xseen.children = [];
			x_element._xseen.sceneInfo = xseen.sceneInfo[xseen.sceneInfo.length-1];

			t1 = new Date().getTime() - t0;
            xseen.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
        }
		
        var ready = (function(eventType) {
            var evt = null;

            if (document.createEvent) {
                evt = document.createEvent("Events");    
                evt.initEvent(eventType, true, true);     
                document.dispatchEvent(evt);              
            } else if (document.createEventObject) {
                evt = document.createEventObject();
                // http://stackoverflow.com/questions/1874866/how-to-fire-onload-event-on-document-in-ie
                document.body.fireEvent('on' + eventType, evt);   
            }
        })('load');
		//xseen.render();
		
		// for each X-Scene tag, parse and load the contents
		var t=[];
		for (var i=0; i<xseen.sceneInfo.length; i++) {
			console.log("Processing 'scene' element #" + i);
			xseen.debug.logInfo("Processing 'scene' element #" + i);
			t[i] = new Date().getTime();
			xseen.Parse (xseen.sceneInfo[i].element, xseen.sceneInfo[i]);
			t1 = new Date().getTime() - t[i];
            xseen.debug.logInfo('Time for initial pass #' + i + ' parsing: ' + t1 + " ms.");
		
		}
/*
		window.setTimeout (function() { 
							loadContent(xseen.sceneInfo[0].scene, xseen.sceneInfo[0].camera); 
							}, 20 );
 */
    };
	xseen.render = function () {
								requestAnimationFrame (xseen.render);
						// This is not the way to do animation. Code should not be in the loop
						// Various objects needing animation should register for an event ... or something
						// Animate circling camera with a period (P) of 16 seconds (16000 milliseconds)
								var deltaT, radians, x, z, P;
								var nodeAframe = document.getElementById ('aframe_nodes');
								P = 16000;
								xseen.timeNow = (new Date()).getTime();
								deltaT = xseen.timeNow - xseen.timeStart;
								radians = deltaT/P * 2 * Math.PI;
								x = 8 * Math.sin(radians);
								z = 8 * Math.cos(radians);
								xseen.sceneInfo[0].element._xseen.renderer.camera.position.x = x;
								xseen.sceneInfo[0].element._xseen.renderer.camera.position.z = z;
								xseen.sceneInfo[0].element._xseen.renderer.camera.lookAt(xseen.types.Vector3([0,0,0]));
								nodeAframe._xseen.object.position.x = -x;
						// End of animation
								xseen.sceneInfo[0].renderer.render (xseen.sceneInfo[0].scene, xseen.sceneInfo[0].element._xseen.renderer.camera);
								};
    
	// Replace with code that calls THREE's unload methods
    var onunload = function() {
        if (xseen.canvases) {
			/*
            for (var i=0; i<xseen.canvases.length; i++) {
				xseen.canvases[i].doc.shutdown(xseen.canvases[i].gl);
            }
			*/
            xseen.canvases = [];
        }
    };
    
    /** Initializes an <x3d> root element that was added after document load. */
    xseen.reload = function() {
        onload();
    };
	
    /* FIX PROBLEM IN CHROME - HACK - searching for better solution !!! */
	if (navigator.userAgent.indexOf("Chrome") != -1) {
		document.__getElementsByTagName = document.getElementsByTagName;
		
		document.getElementsByTagName = function(tag) {
			var obj = [];
			var elems = this.__getElementsByTagName("*");

			if(tag =="*"){
				obj = elems;
			} else {
				tag = tag.toUpperCase();
				for (var i = 0; i < elems.length; i++) {
					var tagName = elems[i].tagName.toUpperCase();		
					if (tagName === tag) {
						obj.push(elems[i]);
					}
				}
			}
			
            return obj;
        };

		document.__getElementById = document.getElementById;
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.__getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
		
	} else { /* END OF HACK */
        document.__getElementById = document.getElementById;
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
	}
    
    if (window.addEventListener)  {
        window.addEventListener('load', onload, false);
        window.addEventListener('unload', onunload, false);
        window.addEventListener('reload', onunload, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', onload);
        window.attachEvent('onunload', onunload);
        window.attachEvent('onreload', onunload);
    }

    // Initialize if we were loaded after 'DOMContentLoaded' already fired.
    // This can happen if the script was loaded by other means.
    if (document.readyState === "complete") {
        window.setTimeout( function() { onload(); }, 20 );
    }
})();
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 * Removed code for
 * - ActiveX 
 * - Flash
 * 
 */
 

xseen.Parse = function (element, parent, sceneInfo) {
	var nodeName = element.localName.toLowerCase();
	//xseen.debug.logInfo("Parse " + nodeName);
	if (typeof(element._xseen) == 'undefined') {element._xseen = {};}
	if (typeof(element._xseen.children) == 'undefined') {element._xseen.children = [];}
	if (typeof(xseen.parseTable[nodeName]) == 'undefined') {
		xseen.debug.logInfo("Unknown node: " + nodeName);
	} else {
		xseen.nodes._parseFields (element, xseen.parseTable[nodeName]);
		xseen.node[xseen.parseTable[nodeName].method].init (element, parent);
	}
	
	for (element._xseen.parsingCount=0; element._xseen.parsingCount<element.childElementCount; element._xseen.parsingCount++) {
		element.children[element._xseen.parsingCount]._xseen = {};
		element.children[element._xseen.parsingCount]._xseen.children = [];
		element.children[element._xseen.parsingCount]._xseen.sceneInfo = element._xseen.sceneInfo;
		this.Parse (element.children[element._xseen.parsingCount], element, sceneInfo);
		//xseen.debug.logInfo(".return from Parse with current node |" + element.children[element._xseen.parsingCount].localName + "|");
	}

	if (typeof(xseen.parseTable[nodeName]) !== 'undefined') {
		xseen.node[xseen.parseTable[nodeName].method].fin (element, parent);
		//xseen.debug.logInfo("..parsing children data of |" + nodeName + "|");
		// --> xseen.node[xseen.nodeDefinitions[nodeName].method].endParse (element, parent);
	}
	//xseen.debug.logInfo("  reached bottom, heading back up from |" + nodeName + "|");
}
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


xseen.Properties = function() {
    this.properties = {};
};

xseen.Properties.prototype.setProperty = function(name, value) {
    xseen.debug.logInfo("Properties: Setting property '"+ name + "' to value '" + value + "'");
    this.properties[name] = value;
};

xseen.Properties.prototype.getProperty = function(name, def) {
    if (this.properties[name]) {
        return this.properties[name]
    } else {
        return def;
    }
};

xseen.Properties.prototype.merge = function(other) {
    for (var attrname in other.properties) {
        this.properties[attrname] = other.properties[attrname];
    }
};

xseen.Properties.prototype.toString = function() {
    var str = "";
    for (var name in this.properties) {
        str += "Name: " + name + " Value: " + this.properties[name] + "\n";
    }
    return str;
};
/*
 * xseen.types contains the datatype and conversion utilities. These convert one format to another.
 * Any method ending in 'toX' where 'X' is some datatype is a conversion to that type
 * Other methods convert from string with space-spearated values
 */
xseen.types = {
	'Deg2Rad'	: Math.PI / 180,

	'SFFloat'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFInt'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (Number.isNaN(value)) {return def};
			return Math.round(value);
		},

	'SFBool'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (value) {return true;}
			if (!value) {return false;}
			return def;
		},

	'SFVec3f'	: function (value, def)
		{
			if (value === null) {value = def;}
			var v3 = value.split(' ');
			if (v3.length != 3 || Number.isNaN(v3[0]) || Number.isNaN(v3[1]) || Number.isNaN(v3[2])) {
				value = def;
				v3 = value.split(' ');
			}
			return [v3[0]-0, v3[1]-0, v3[2]-0];
		},

	'SFVec2f'	: function (value, def)
		{
			if (value === null) {value = def;}
			var v2 = value.split(' ');
			if (v2.length != 2 || Number.isNaN(v2[0]) || Number.isNaN(v2[1])) {
				value = def;
				v2 = value.split(' ');
			}
			return [v2[0]-0, v2[1]-0];
		},

	'SFRotation'	: function (value, def)
		{
			if (value === null) {value = def;}
			var v4 = value.split(' ');
			if (v4.length != 4 || Number.isNaN(v4[0]) || Number.isNaN(v4[1]) || Number.isNaN(v4[2]) || Number.isNaN(v4[3])) {
				value = def;
				v4 = value.split(' ');
			}
			var result = {
							'vector'		: [v4[0], v4[1], v4[2], v4[3]],
							'axis_angle'	: [{'x': v4[0], 'y': v4[1], 'z': v4[2]}, v4[3]],
						};
			return result;
		},

	'SFColor'	: function (value, defaultString)
		{
			var v3 = this.SFVec3f(value, defaultString);
			v3[0] = Math.min(Math.max(v3[0], 0.0), 1.0);
			v3[1] = Math.min(Math.max(v3[1], 0.0), 1.0);
			v3[2] = Math.min(Math.max(v3[2], 0.0), 1.0);
			return v3;
		},
	
	'SFString'	: function (value, def)
		{
			if (value === null) {value = def;}
			return value;
		},

// A-Frame data types

// value can be any CSS color (#HHH, #HHHHHH, 24-bit Integer, name)
	'Color'	: function (value, defaultString)
		{
			return defaultString;
		},
	
// Conversion methods
	'Vector3'	: function (value)
		{
			return new THREE.Vector3(value[0], value[1], value[2]);
		},

	'Color3toHex' : function (c3)
		{
			var hr = Math.round(255*c3[0]).toString(16);
			var hg = Math.round(255*c3[1]).toString(16);
			var hb = Math.round(255*c3[2]).toString(16);
			if (hr.length < 2) {hr = "0" + hr;}
			if (hg.length < 2) {hg = "0" + hg;}
			if (hb.length < 2) {hb = "0" + hb;}
			var hex = '0x' + hr + hg + hb;
			return hex;
		},

	'Color3toInt' : function (c3)
		{
			var hr = Math.round(255*c3[0]) << 16;
			var hg = Math.round(255*c3[1]) << 8;
			var hb = Math.round(255*c3[2])
			return hr + hg + hb;
		},
	
	'Rotation2Quat' : function (rot)
		{
			var quat = new THREE.Quaternion();
			if (typeof(rot) === 'object' && Array.isArray(rot.axis_angle)) {
				quat.setFromAxisAngle(rot.axis_angle[0], rot.axis_angle[1]);
			} else if (typeof(rot) === 'object' && Array.isArray(rot.vector)) {
				quat.setFromAxisAngle(new THREE.Vector3(rot.vector[0],rot.vector[1],rot.vector[2]), rot.vector[3]);
			} else if (Array.isArray(rot)) {
				quat.setFromAxisAngle(new THREE.Vector3(rot[0],rot[1],rot[2]), rot[3]);
			} else {
				quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
			}
			return quat;
		},

// Convienence data types (should deprecate)
	'Scalar'	: function (value, defaultString)
		{
			return this.SFFloat(value, defaultString);
		},

	'Color3'	: function (value, defaultString)
		{
			return this.SFColor(value, defaultString);
		},
	
};
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

 
/*
 * xseen.nodes.<nodeName> is the definition of <nodeName>
 * All internal variables are stored in ._internal. All functions start with '_'
 *
 * This is a bare-bones setup. There is no error checking - missing arguments or
 * methods that do not exist (e.g., <nodeMethod>.init)
 *
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump (_dumpTable) would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 * Still need to determine how this thing is going to be internally stored.
 */

xseen.nodes = {
	'_defineNode' : function(nodeName, nodeComponent, nodeMethod) {
		methodBase = 'xseen.node.';
		methodBase = '';
		node = {
				'tag'		: nodeName,
				'taglc'		: nodeName.toLowerCase(),
				'component' : nodeComponent,
				'method'	: methodBase + nodeMethod,
				'fields'	: [],
				'fieldIndex': [],
				'addField'	: function (fieldName, fieldType, fieldDefault) {
					var newIndex = this.fields.length;
					var namelc = fieldName.toLowerCase();
					this.fieldIndex[namelc] = newIndex;
					this.fields[newIndex] = {
								'field'		: fieldName,
								'fieldlc'	: namelc,
								'type'		: fieldType,
								'default'	: fieldDefault
					};
					return this;
				},
				'addNode'	: function () {
					xseen.parseTable[this.taglc] = this;
				}
		}
		return node;
	},
	'_parseFields' : function(element, node) {
		element._xseen.fields = [];
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				value = this.getAttribute(field.fieldlc);
				value = xseen.types[field.type] (value, field.default);
				this._xseen.fields[field.fieldlc] = value;
			}, element);
	},

	'_dumpTable' : function() {
		var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
		console.log('Node parsing table (' + xseen.parseTable.length + ' nodes)\n' + jsonstr);
	}
};
	
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


/*
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object (_dumpTable) so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 */

xseen.nodes._defineNode('Cone', 'Geometry3D', 'geometry3D_Cone')
	.addField('bottomRadius', 'SFFloat', 1)
	.addField('height', 'SFFloat', 2)
	.addField('bottom', 'SFBool', true)
	.addField('side', 'SFBool', true)
	.addNode();

xseen.nodes._defineNode('Box', 'Geometry3D', 'geometry3D_Box')
	.addField('size', 'SFVec3f', '1 1 1')
	.addNode();
	
xseen.nodes._defineNode('Sphere', 'Geometry3D', 'geometry3D_Sphere')
	.addField('radius', 'SFFloat', '1')
	.addNode();
	
xseen.nodes._defineNode('Cylinder', 'Geometry3D', 'geometry3D_Cylinder')
	.addField('radius', 'SFFloat', 1)
	.addField('height', 'SFFloat', 2)
	.addField('bottom', 'SFBool', true)
	.addField('side', 'SFBool', true)
	.addField('top', 'SFBool', true)
	.addNode();
	
xseen.nodes._defineNode ('Material', 'Appearance', 'appearance_Material')
	.addField('diffuseColor', 'SFColor', '.8 .8 .8')
	.addField('emissiveColor', 'SFColor', '0 0 0')
	.addField('specularColor', 'SFColor', '0 0 0')
	.addField('transparency', 'SFFloat', '0')
	.addField('shininess', 'SFFloat', '0')
	.addNode();

xseen.nodes._defineNode ('Transform', 'Grouping', 'grouping_Transform')
	.addField('translation', 'SFVec3f', '0 0 0')
	.addField('scale', 'SFVec3f', '1 1 1')
	.addField('rotation', 'SFRotation', '0 1 0 0')
	.addNode();

xseen.nodes._defineNode ('Light', 'unknown', 'unk_Light')
	.addField('direction', 'SFVec3f', '0 0 -1')
	.addField('color', 'SFColor', '1 1 1')
	.addField('intensity', 'SFFloat', '1')
	.addNode();

xseen.nodes._defineNode ('Camera', 'Unknown', 'unk_Camera')
	.addField('position', 'SFVec3f', '0 0 10')
	.addNode();

xseen.nodes._defineNode ('Inline', 'Networking', 'networking_Inline')
	.addField('url', 'SFString', '')
	.addNode();

xseen.nodes._defineNode ('scene', 'Core', 'core_Scene')
	.addNode();
xseen.nodes._defineNode ('canvas', 'Core', 'core_NOOP')
	.addNode();
xseen.nodes._defineNode ('WorldInfo', 'Core', 'core_WorldInfo')
	.addNode();
xseen.nodes._defineNode ('Appearance', 'Appearance', 'appearance_Appearance')
	.addNode();
xseen.nodes._defineNode ('Shape', 'Shape', 'unk_Shape')
	.addNode();
xseen.nodes._defineNode ('Viewpoint', 'Unknown', 'unk_Camera')
	.addNode();
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


/*
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object (_dumpTable) so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 */

xseen._addAframeAppearance = function (node) {
	node
		.addField('ambient-occlusion-map', 'SFString', '')
		.addField('ambient-occlusion-map-intensity', 'SFFloat', 1)
		.addField('ambient-occlusion-texture-offset', 'SFVec2f', '0 0')
		.addField('ambient-occlusion-texture-repeat', 'SFVec2f', '1 1')
		.addField('color', 'Color', '#FFF')
		.addField('displacement-bias', 'SFFloat', 0.5)
		.addField('displacement-map', 'SFString', '')
		.addField('displacement-scale', 'SFFloat', 1)
		.addField('displacement-texture-offset', 'SFVec2f', '0 0')
		.addField('displacement-texture-repeat', 'SFVec2f', '1 1')
		.addField('env-map', 'SFString', '')
		.addField('fog', 'SFBool', true)
		.addField('metalness', 'SFFloat', 0)
		.addField('normal-map', 'SFString', '')
		.addField('normal-scale', 'SFVec2f', '1 1')
		.addField('normal-texture-offset', 'SFVec2f', '0 0')
		.addField('normal-texture-repeat', 'SFVec2f', '1 1')
		.addField('repeat', 'SFVec2f', '1 1')
		.addField('roughness', 'SFFloat', 0.5)
		.addField('spherical-env-map', 'SFString', '')
		.addField('src', 'SFString', '')
		.addField('wireframe', 'SFBool', false)
		.addField('wireframe-linewidth', 'SFInt', 2)
		.addNode();
}

xseen.nodes._defineNode('a-entity', 'A-Frame', 'af_Entity')
	.addField('geometry', 'SFString', '')
	.addField('material', 'SFString', '')
	.addField('light', 'SFString', '')
	.addNode();

var node;
node = xseen.nodes._defineNode('a-box', 'A-Frame', 'af_Box')
						.addField('depth', 'SFFloat', 1)
						.addField('height', 'SFFloat', 1)
						.addField('width', 'SFFloat', 512)
						.addField('segments-depth', 'SFInt', 1)
						.addField('segments-height', 'SFInt', 1)
						.addField('segments-width', 'SFInt', 1);
xseen._addAframeAppearance (node);

node = xseen.nodes._defineNode('a-cone', 'A-Frame', 'af_Cone')
					.addField('height', 'SFFloat', 1)
					.addField('radius', 'SFFloat', 1)
					.addField('open-ended', 'SFBool', false)
					.addField('theta-start', 'SFFloat', 0)
					.addField('theta-length', 'SFFloat', 360)
					.addField('segments-height', 'SFInt', 1)
					.addField('segments-radial', 'SFInt', 8);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-cylinder', 'A-Frame', 'af_Cylinder')
					.addField('height', 'SFFloat', 1)
					.addField('open-ended', 'SFBool', false)
					.addField('radius-bottom', 'SFFloat', 1)
					.addField('radius-top', 'SFFloat', 1)
					.addField('theta-start', 'SFFloat', 0)
					.addField('theta-length', 'SFFloat', 360)
					.addField('segments-height', 'SFInt', 1)
					.addField('segments-radial', 'SFInt', 8);
xseen._addAframeAppearance (node);

node = xseen.nodes._defineNode('a-dodecahedron', 'A-Frame', 'af_Dodecahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-icosahedron', 'A-Frame', 'af_Icosahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-octahedron', 'A-Frame', 'af_Octahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-sphere', 'A-Frame', 'af_Sphere')
					.addField('radius', 'SFFloat', 1)
					.addField('theta-start', 'SFFloat', 0)
					.addField('theta-length', 'SFFloat', 180)
					.addField('phi-start', 'SFFloat', 0)
					.addField('phi-length', 'SFFloat', 360)
					.addField('segments-height', 'SFInt', 18)
					.addField('segments-width', 'SFInt', 36);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-tetrahedron', 'A-Frame', 'af_Tetrahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);

node = xseen.nodes._defineNode('a-torus', 'A-Frame', 'af_Torus')
					.addField('radius', 'SFFloat', 2)
					.addField('tube', 'SFFloat', 1)
					.addField('arc', 'SFFloat', 360)
					.addField('segments-radial', 'SFInt', 8)
					.addField('segments-tubular', 'SFInt', 6);
xseen._addAframeAppearance (node);

// Dump parse table
//xseen.nodes._dumpTable();/*
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

 // Node definition code (just stubs right now...)


xseen.node.core_NOOP = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.core_WorldInfo = {
	'init'	: function (e,p) {parsing('WorldInfo', e)},
	'fin'	: function (e,p) {}
};

function parsing (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.unk_Camera = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints
		},
	'fin'	: function (e,p) {}
};

xseen.node.geometry3D_Box = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.BoxGeometry(e._xseen.fields.size[0], e._xseen.fields.size[1], e._xseen.fields.size[2]);
		},
	'fin'	: function (e,p) {}
};

xseen.node.geometry3D_Cone = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.ConeGeometry(e._xseen.fields.bottomradius, e._xseen.fields.height, 24, false, 0, 2*Math.PI);
		},
	'fin'	: function (e,p) {}
};
xseen.node.geometry3D_Sphere = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.SphereGeometry(e._xseen.fields.radius, 32, 32, 0, Math.PI*2, 0, Math.PI);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.geometry3D_Cylinder = {
	'init'	: function (e,p)
		{
			var noCaps = !(e._xseen.fields.bottom || e._xseen.fields.top);
			p._xseen.geometry = new THREE.CylinderGeometry(e._xseen.fields.radius, e._xseen.fields.radius, e._xseen.fields.height, 32, 1, noCaps, 0, Math.PI*2);
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_Material = {
	'init'	: function (e,p)
		{
			var transparency  = e._xseen.fields.transparency - 0;
			var shininess  = e._xseen.fields.shininess - 0;
			var colorDiffuse = xseen.types.Color3toInt (e._xseen.fields.diffusecolor);
			var colorEmissive = xseen.types.Color3toInt (e._xseen.fields.emissivecolor);
			var colorSpecular = xseen.types.Color3toInt (e._xseen.fields.specularcolor);
			p._xseen.material = new THREE.MeshPhongMaterial( {
//			p._xseen.material = new THREE.MeshBasicMaterial( {
						'color'		: colorDiffuse,
						'emissive'	: colorEmissive,
						'specular'	: colorSpecular,
						'shininess'	: shininess,
						'opacity'	: 1.0-transparency,
						'transparent'	: (transparency > 0.0) ? true : false
						} );
		},
	'fin'	: function (e,p) {}
};
xseen.node.appearance_Appearance = {
	'init'	: function (e,p) {},

	'fin'	: function (e,p)
		{
			p._xseen.appearance = e._xseen.material;
		}
};
xseen.node.unk_Shape = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			var m = new THREE.Mesh (e._xseen.geometry, e._xseen.appearance);
			p._xseen.children.push(m);
			m = null;
		}
};

xseen.node.grouping_Transform = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
			// Apply transform to all objects in e._xseen.children
			var rotation = xseen.types.Rotation2Quat(e._xseen.fields.rotation);
			var group = new THREE.Group();
			group.name = 'Transform children [' + e.id + ']';
			group.position.x	= e._xseen.fields.translation[0];
			group.position.y	= e._xseen.fields.translation[1];
			group.position.z	= e._xseen.fields.translation[2];
			group.scale.x		= e._xseen.fields.scale[0];
			group.scale.y		= e._xseen.fields.scale[1];
			group.scale.z		= e._xseen.fields.scale[2];
			group.quaternion.x	= rotation.x;
			group.quaternion.y	= rotation.y;
			group.quaternion.z	= rotation.z;
			group.quaternion.w	= rotation.w;
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					group.add(child);
				});
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
			e._xseen.object = group;
		}
};

xseen.node.unk_Light = {
	'init'	: function (e,p) 
		{
			var color = xseen.types.Color3toInt (e._xseen.fields.color);
			var intensity = e._xseen.fields.intensity - 0;
			var l = new THREE.DirectionalLight (color, intensity);
			l.position.x = 0-e._xseen.fields.direction[0];
			l.position.y = 0-e._xseen.fields.direction[1];
			l.position.z = 0-e._xseen.fields.direction[2];
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(l);
			l = null;
		}
		,
	'fin'	: function (e,p)
		{
		}
};

xseen.node.networking_Inline = {
	'init'	: function (e,p) 
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Inline content [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				xseen.loadMgr.loadXml (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, {'e':e, 'p':p});
				e._xseen.requestedUrl = true;
			}
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e,p)
		{
		},

	'loadSuccess' :
				function (response, userdata, xhr) {
					userdata.e._xseen.processedUrl = true;
					userdata.e._xseen.loadText = response;
					console.log("download successful for "+userdata.e.id);
					var start = {'_xseen':0};
					var findSceneTag = function (response) {
						if (typeof(response._xseen) === 'undefined') {response._xseen = {'childCount': -1};}
						if (response.nodeName == 'scene') {
							start = response;
							return;
						} else if (response.children.length > 0) {
							for (response._xseen.childCount=0; response._xseen.childCount<response.children.length; response._xseen.childCount++) {
								findSceneTag(response.children[response._xseen.childCount]);
								if (start._xseen !== 0) {return;}
							}
						} else {
							return;
						}
					}
					findSceneTag (response);	// done this way because function is recursive
					if (start._xseen !== 0) {	// Found 'scene' tag. Need to parse and insert
						console.log("Found legal X3D file with 'scene' tag");
						while (start.children.length > 0) {
							userdata.e.appendChild(start.children[0]);
						}
						xseen.Parse(userdata.e, userdata.p, userdata.p._xseen.sceneInfo);
						userdata.e._xseen.children.forEach (function (child, ndx, wholeThing)
							{
								userdata.e._xseen.loadGroup.add(child);
console.log ('...Adding ' + child.type + ' (' + child.name + ') to Inline Group? with UUID ' + userdata.e._xseen.loadGroup.uuid + ' (' + userdata.e._xseen.loadGroup.name + ')');
							});
						userdata.p._xseen.sceneInfo.scene.updateMatrixWorld();
						//xseen.debug.logInfo("Complete work on Inline...");
					} else {
						console.log("Found illegal X3D file -- no 'scene' tag");
					}
					// Parse (start, userdata.p)...	
				}
};

xseen.node.core_Scene = {
	'init'	: function (e,p)
		{
			var width = e._xseen.sceneInfo.size.width;
			var height = e._xseen.sceneInfo.size.height;
			e._xseen.renderer = {
						'canvas' 	: e._xseen.sceneInfo.scene,
						'width'		: width,
						'height'	: height,
						'camera'	: e._xseen.sceneInfo.camera[0],
						'renderer'	: e._xseen.sceneInfo.renderer,
						};
			e._xseen.renderer.renderer.setSize (width, height);
			var camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			camera.position.x = 0;		// hardwired for now...
			camera.position.y = 0;
			camera.position.z = 4;
			e._xseen.renderer.camera = camera;
		},

/*
 * This appears now to be working!!!
 *
 * Late loading content is not getting inserted into the scene graph for rendering. Need to read
 * THREE docs about how to do that.
 * Camera will need to be redone. Existing camera is treated as a special child. A separate camera
 * should be established and Viewpoint nodes define "photostops" rather than a camera. The camera is 
 * in effect, parented to the "photostop". This probably needs to list of Viewpoints discussed in the
 * X3D specification.
 */
	'fin'	: function (e,p)
		{
			// Render all Children
			//xseen.renderNewChildren (e._xseen.children, e._xseen.renderer.canvas);
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					console.log('Adding child of type ' + child.type + ' (' + child.name + ')');
					e._xseen.renderer.canvas.add(child);
				});
			xseen.dumpSceneGraph ();
			e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );
			xseen.debug.logInfo("Rendered all elements -- Starting animation");
			xseen.render();
		}
};
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

 // Node definition code for A-Frame nodes


xseen.node.core_NOOP = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.parsing = function (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.af_Entity = {
	'init'	: function (e,p)
		{	
			xseen.node.parsing('A-Frame Entity');
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Appearance = function (e) {
	console.log ('a-node Appearance: ' + e._xseen.fields);
/*
	var material = new THREE.MeshPhongMaterial( {
					'aoMap'					: e._xseen.fields['ambient-occlusion-map'],
					'aoMapIntensity'		: e._xseen.fields['ambient-occlusion-map-intensity'],
					'color'					: e._xseen.fields['color'],
					'displacementMap'		: e._xseen.fields['displacement-map'],
					'displacementScale'		: e._xseen.fields['displacement-scale'],
					'displacementBias'		: e._xseen.fields['displacement-bias'],
					'envMap'				: e._xseen.fields['env-map'],
					'normalMap'				: e._xseen.fields['normal-map'],
					'normalScale'			: e._xseen.fields['normal-scale'],
					'wireframe'				: e._xseen.fields['wireframe'],
					'wireframeLinewidth'	: e._xseen.fields['wireframe-linewidth'],
						} );
 */
	var parameters = {
					'aoMap'					: e._xseen.fields['ambient-occlusion-map'],
					'aoMapIntensity'		: e._xseen.fields['ambient-occlusion-map-intensity'],
					'color'					: e._xseen.fields['color'],
					'displacementMap'		: e._xseen.fields['displacement-map'],
					'displacementScale'		: e._xseen.fields['displacement-scale'],
					'displacementBias'		: e._xseen.fields['displacement-bias'],
					'envMap'				: e._xseen.fields['env-map'],
					'normalMap'				: e._xseen.fields['normal-map'],
					'normalScale'			: e._xseen.fields['normal-scale'],
					'wireframe'				: e._xseen.fields['wireframe'],
					'wireframeLinewidth'	: e._xseen.fields['wireframe-linewidth'],
						};
	var material = new THREE.MeshPhongMaterial(parameters);
	return material;
/*
 * === All Entries ===
.aoMap
.aoMapIntensity
.color
	.combine
.displacementMap
.displacementScale
.displacementBias
	.emissive
	.emissiveMap
	.emissiveIntensity
.envMap
	.lightMap
	.lightMapIntensity
	.map
	.morphNormals
	.morphTargets
.normalMap
.normalScale
	.reflectivity
	.refractionRatio
	.shininess
	.skinning
	.specular
	.specularMap
.wireframe
	.wireframeLinecap
	.wireframeLinejoin
.wireframeLinewidth 
///////////////////////////////////////////////////////////////////////////////
e._xseen.fields['ambient-occlusion-map']
e._xseen.fields['ambient-occlusion-map-intensity']
	e._xseen.fields['ambient-occlusion-texture-offset']
	e._xseen.fields['ambient-occlusion-texture-repeat']
e._xseen.fields['color']
e._xseen.fields['displacement-bias']
e._xseen.fields['displacement-map']
e._xseen.fields['displacement-scale']
	e._xseen.fields['displacement-texture-offset']
	e._xseen.fields['displacement-texture-repeat']
e._xseen.fields['env-map']
	e._xseen.fields['fog']
	e._xseen.fields['metalness']
e._xseen.fields['normal-map']
e._xseen.fields['normal-scale']
	e._xseen.fields['normal-texture-offset']
	e._xseen.fields['normal-texture-repeat']
	e._xseen.fields['repeat']
	e._xseen.fields['roughness']
	e._xseen.fields['spherical-env-map']
	e._xseen.fields['src']
e._xseen.fields['wireframe']
e._xseen.fields['wireframe-linewidth']

 * === Unused Entries ===
	.combine
	.emissive
	.emissiveMap
	.emissiveIntensity
	.lightMap
	.lightMapIntensity
	.map
	.morphNormals
	.morphTargets
	.reflectivity
	.refractionRatio
	.shininess
	.skinning
	.specular
	.specularMap
	.wireframeLinecap
	.wireframeLinejoin
///////////////////////////////////////////////////////////////////////////////
	e._xseen.fields['ambient-occlusion-texture-offset']
	e._xseen.fields['ambient-occlusion-texture-repeat']
	e._xseen.fields['displacement-texture-offset']
	e._xseen.fields['displacement-texture-repeat']
	e._xseen.fields['fog']
	e._xseen.fields['metalness']
	e._xseen.fields['normal-texture-offset']
	e._xseen.fields['normal-texture-repeat']
	e._xseen.fields['repeat']
	e._xseen.fields['roughness']
	e._xseen.fields['spherical-env-map']
	e._xseen.fields['src']
 */
}

xseen.node.af_Box = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.BoxGeometry(
										e._xseen.fields.width, 
										e._xseen.fields.height, 
										e._xseen.fields.depth,
										e._xseen.fields['segments-width'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['segments-depth']
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Cone = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.ConeGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.height, 
										e._xseen.fields['segments-radial'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['open-ended'], 
										e._xseen.fields['theta-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['theta-length'] * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Cylinder = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.CylinderGeometry(
										e._xseen.fields['radius-top'], 
										e._xseen.fields['radius-bottom'], 
										e._xseen.fields.height, 
										e._xseen.fields['segments-radial'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['open-ended'], 
										e._xseen.fields['theta-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['theta-length'] * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Dodecahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.DodecahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Icosahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.IcosahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Octahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.OctahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Sphere = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.SphereGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields['segments-width'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['phi-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['phi-length'] * xseen.types.Deg2Rad,
										e._xseen.fields['theta-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['theta-length'] * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Tetrahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TetrahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Torus = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TorusGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.tube, 
										e._xseen.fields['segments-radial'], 
										e._xseen.fields['segments-tubular'], 
										e._xseen.fields.arc * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
