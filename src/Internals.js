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
 * */
var xseen = {
    canvases : [],
	sceneInfo: [],
	nodeDefinitions: {},
	parseTable: {},
	
	timeStart	: (new Date()).getTime(),
	timeNow		: (new Date()).getTime(),

	versionInfo	: [],
    x3dNS    : 'http://www.web3d.org/specifications/x3d-namespace',
    x3dextNS : 'http://philip.html5.org/x3d/ext',
    xsltNS   : 'http://www.w3.org/1999/XSL/x3dom.Transform',
    xhtmlNS  : 'http://www.w3.org/1999/xhtml'
};

xseen.versionInfo = {
	major	: 0,
	minor	: 1,
	revision	: 0,
	version	: '',
	date	: '2017-05-15',
	splashText		: "XSeen 3D Language parser.<br>\nLimited pre-defined shapes, fixed camera, directional light, no rotation/scale, Material texture only",
};
xseen.versionInfo.version = xseen.versionInfo.major + '.' + xseen.versionInfo.minor + '.' + xseen.versionInfo.revision;

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
