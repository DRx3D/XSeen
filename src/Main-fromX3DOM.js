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
 */

xseen
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
xseen.userAgentFeature = {
    supportsDOMAttrModified: false
};


(function loadBasx3D() {
    "use strict";

    var onload = function() {
        var i,j;  // counters

        // Search all X-Scene elements in the page
        var xscenes_unfiltered = document.getElementsByTagName('x-scene');
        var xscenes = [];

        // check if element already has been processed
        for (i=0; i < xscenes_unfiltered.length; i++) {
            if (xscenes_unfiltered[i].hasRuntime === undefined)
                xscenes.push(xscenes_unfiltered[i]);
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
            'flashrenderer',
            'swfpath',
            'runtimeEnabled',
            'keysEnabled',
            'showTouchpoints',
            'disableTouch',
            'maxActiveDownloads'
        ]);
        var components, prefix;
		var showLoggingConsole = false;

        // for each X3D element
        for (i=0; i < xscenes.length; i++) {

            // default parameters
            settings.setProperty("showLog", xscenes[i].getAttribute("showLog") || 'false');
            settings.setProperty("showStat", xscenes[i].getAttribute("showStat") || 'false');
            settings.setProperty("showProgress", xscenes[i].getAttribute("showProgress") || 'true');
            settings.setProperty("PrimitiveQuality", xscenes[i].getAttribute("PrimitiveQuality") || 'High');

            // for each param element inside the X3D element
            // add settings to properties object
            params = xscenes[i].getElementsByTagName('PARAM');
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
                components = settings.getProperty('components', xscenes[i].getAttribute("components"));
                if (components) {
                    prefix = settings.getProperty('loadpath', xscenes[i].getAttribute("loadpath"));
                    components = components.trim().split(',');
                    for (j=0; j < components.length; j++) {
                        xseen.loadJS(components[j] + ".js", prefix);
                    }
                }

                // src=foo.x3d adding inline node, not a good idea, but...
                if (xscenes[i].getAttribute("src")) {
                    var _scene = document.createElement("scene");
                    var _inl = document.createElement("Inline");
                    _inl.setAttribute("url", xscenes[i].getAttribute("src"));
                    _scene.appendChild(_inl);
                    xscenes[i].appendChild(_scene);
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
        xscenes = Array.map(xscenes, function (n) {
            n.hasRuntime = true;
            return n;
        });

        var w3sg = document.getElementsByTagName('webSG');	// THINKABOUTME: shall we still support exp. WebSG?!

        for (i=0; i<w3sg.length; i++) {
            w3sg[i].hasRuntime = false;
            xscenes.push(w3sg[i]);
        }

        if (xseen.versionInfo !== undefined) {
            xseen.debug.logInfo("X3DOM version " + xseen.versionInfo.version + ", " +
                                "Revison <a href='https://github.com/x3dom/x3dom/tree/"+ xseen.versionInfo.revision +"'>"
                                + xseen.versionInfo.revision + "</a>, " +
                                "Date " + xseen.versionInfo.date);
        }
        
        xseen.debug.logInfo("Found " + (xscenes.length - w3sg.length) + " X3D and " + 
                            w3sg.length + " (experimental) WebSG nodes...");
        
        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        var x3d_element;
        var x3dcanvas;
        var altDiv, altP, aLnk, altImg;
        var t0, t1;

        for (i=0; i < xscenes.length; i++)
        {
            x3d_element = xscenes[i];

            // http://www.howtocreate.co.uk/wrongWithIE/?chapter=navigator.plugins
            if (xseen.detectActiveX()) {
                xseen.insertActiveX(x3d_element);
                continue;
            }

            x3dcanvas = new xseen.X3DCanvas(x3d_element, xseen.canvases.length);

            xseen.canvases.push(x3dcanvas);

            if (x3dcanvas.gl === null) {

                altDiv = document.createElement("div");
                altDiv.setAttribute("class", "xseen-nox3d");
                altDiv.setAttribute("id", "xseen-nox3d");

                altP = document.createElement("p");
                altP.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));
                aLnk = document.createElement("a");
                aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");
                aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));
                
                altDiv.appendChild(altP);
                altDiv.appendChild(aLnk);
                
                x3dcanvas.x3dElem.appendChild(altDiv);

                // remove the stats div (it's not added when WebGL doesn't work)
                if (x3dcanvas.stateViewer) { 
                    x3d_element.removeChild(x3dcanvas.stateViewer.viewer);
                }

                continue;
            }
            
            t0 = new Date().getTime();

            xscenes[i].runtime = new xseen.Runtime(xscenes[i], x3dcanvas);
            xscenes[i].runtime.initialize(xscenes[i], x3dcanvas);

            if (xseen.runtime.ready) {
                xscenes[i].runtime.ready = xseen.runtime.ready;
            }
            
            // no backend found method system wide call
            if (x3dcanvas.backend == '') {
                xseen.runtime.noBackendFound();
            }
            
            x3dcanvas.load(xscenes[i], i, settings);

            // show or hide statistics based on param/x3d attribute settings
            if (settings.getProperty('showStat') === 'true') {
                xscenes[i].runtime.statistics(true);
            } else {
                xscenes[i].runtime.statistics(false);
            }

            if (settings.getProperty('showProgress') === 'true') {
                if (settings.getProperty('showProgress') === 'bar'){
                    x3dcanvas.progressDiv.setAttribute("class", "xseen-progress bar");
                }
                xscenes[i].runtime.processIndicator(true);
            } else {
                xscenes[i].runtime.processIndicator(false);
            }

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
        })('load');
            }
    };
    
    var onunload = function() {
        if (xseen.canvases) {
            for (var i=0; i<xseen.canvases.length; i++) {
                xseen.canvases[i].doc.shutdown(xseen.canvases[i].gl);
            }
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
