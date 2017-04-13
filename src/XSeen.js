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
        var xseens_unfiltered = document.getElementsByTagName('x-scene');
        var xseens = [];
		var sceneInfo

        // check if element already has been processed
        for (i=0; i < xseens_unfiltered.length; i++) {
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
        for (i=0; i < xseens.length; i++) {

            // default parameters
            settings.setProperty("showLog", xseens[i].getAttribute("showLog") || 'false');
            settings.setProperty("showLog", xseens[i].getAttribute("showLog") || 'true');
            settings.setProperty("showStat", xseens[i].getAttribute("showStat") || 'false');
            settings.setProperty("showProgress", xseens[i].getAttribute("showProgress") || 'true');
            settings.setProperty("PrimitiveQuality", xseens[i].getAttribute("PrimitiveQuality") || 'High');

            // for each param element inside the X3D element
            // add settings to properties object
            params = xseens[i].getElementsByTagName('PARAM');
            for (j=0; j < params.length; j++) {
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
                                "Revison <a href='https://github.com/x3dom/x3dom/tree/"+ xseen.versionInfo.revision +"'>"
                                + xseen.versionInfo.revision + "</a>, " +
                                "Date " + xseen.versionInfo.date);
        }
        
        xseen.debug.logInfo("Found " + xseen.length + " XSeen nodes");
        
        // Create a HTML canvas for every XSeen scene and wrap it with
        // an X3D canvas and load the content
        var x_element;
        var x_canvas;
        var altDiv, altP, aLnk, altImg;
        var t0, t1;

        for (i=0; i < xseens.length; i++)
        {
            x_element = xseens[i];

			// Need to replace with code that reference THREE
            x_canvas = new THREE.Scene(); // May need addtl info if multiple: xseen.X3DCanvas(x_element, xseen.canvases.length);
            xseen.canvases.push(x_canvas);
			// Need to handle failure to initialize?
            
            t0 = new Date().getTime();


			var divWidth = 640;
			var divHeight = 480;
			var divWidth = window.innerWidth/3;
			var divHeight =  window.innerHeight/3;
			var x_camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (divWidth, divHeight);
			x_element.appendChild (x_renderer.domElement);
			
			xseen.sceneInfo.push ({'scene' : x_canvas, 'renderer' : x_renderer, 'camera' : x_camera, 'element' : x_element});

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
		xseen.render();
		
		// for each X-Scene tag, parse and load the contents
		for (i=0; i<xseen.sceneInfo.length; i++) {
			xseen.Parse (xseen.sceneInfo[i].element, xseen.sceneInfo[i]);
		}
		window.setTimeout (function() { 
							loadContent(xseen.sceneInfo[0].scene, xseen.sceneInfo[0].camera); 
							}, 20 );
    };

	xseen.render = function () {
								requestAnimationFrame (xseen.render);
								xseen.sceneInfo[0].renderer.render (xseen.sceneInfo[0].scene, xseen.sceneInfo[0].camera);
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
