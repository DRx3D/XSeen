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
		xseen.updateOnLoad();

        var i,j;  // counters

        // Search all X-Scene elements in the page
		//alert ('Finding all x-scene tags...');
        var xseens_unfiltered = document.getElementsByTagName('scene');
        var xseens = [];
		var sceneInfo

        // check if element already has been processed
        for (var i=0; i < xseens_unfiltered.length; i++) {
            if (typeof(xseens_unfiltered[i]._xseen) === 'undefined')
                xseens.push(xseens_unfiltered[i]);
        }

        // ~~ Components and params {{{ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var params;
        var settings = new xseen.Properties();  // stores the stuff in <param>
        var validParams = xseen.array_to_object([ 
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
/* Don't think so -- commented out
        xseens = Array.map(xseens, function (n) {
            n.hasRuntime = true;
            return n;
        });
 */

        if (xseen.versionInfo !== undefined) {
            xseen.debug.logInfo("XSeen version " + xseen.versionInfo.version + ", " +
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

/*
 * Handle opening tag attributes
 *	divHeight
 *	divWidth
 *	turntable	Indicates if view automatically rotates (independent of navigation)
 */

			var divWidth = x_element.getAttribute('width');
			var divHeight =  x_element.getAttribute('height');
			if (divHeight + divWidth < 100) {
				divHeight = 450;
				divWidth = 800;
			} else if (divHeight < 50) {
				divHeight = Math.floor(divWidth/2) + 50;
			} else if (divWidth < 50) {
				divWidth = divHeight * 2 - 100;
			}
			var turntable = (x_element.getAttribute('turntable') || '').toLowerCase();
			if (turntable == 'on' || turntable == 'yes' || turntable == 'y' || turntable == '1') {
				turntable = true;
			} else {
				turntable = false;
			}
			var x_camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
			x_camera.position.x = 0;
			x_camera.position.z = 10;
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (divWidth, divHeight);
			x_element.appendChild (x_renderer.domElement);
			
			xseen.sceneInfo.push ({
									'size'		: {'width':divWidth, 'height':divHeight},
									'scene'		: x_canvas, 
									'renderer'	: x_renderer,
									'camera'	: [x_camera],
									'turntable'	: turntable,
									'mixers'	: [],
									'clock'		: new THREE.Clock(),
									'element'	: x_element,
									'stacks'	: [],
									'tmp'		: {activeViewpoint:false},
								});
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
			xseen.sceneInfo[i].stacks['Viewpoints'] = new xseen.utils.StackHandler('Viewpoints');
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

/*
 * Animation/render function loop
 *
 *	Run each animation frame. This is not well done as everything is tossed in here
 *	Most of the stuff belongs, but perhaps in separate functions/methods
 *	Camera animation should not be in here at all. That should be animated separately in XSeen code
 */
	xseen.render = function () 
		{
			requestAnimationFrame (xseen.render);
/*
 *	This is not the way to do animation. Code should not be in the loop
 *	Various objects needing animation should register for an event ... or something
 *	Animate circling camera with a period (P) of 16 seconds (16000 milliseconds)
 */
			var deltaT, radians, x, y, z, P, radius, vp;
			TWEEN.update();
			var nodeAframe = document.getElementById ('aframe_nodes');
			P = 16000;
			deltaT = xseen.sceneInfo[0].clock.getDelta();
			for (var i=0; i<xseen.sceneInfo[0].mixers.length; i++) {
				xseen.sceneInfo[0].mixers[i].update(deltaT);
			}
			deltaT = (new Date()).getTime() - xseen.timeStart;
			radians = deltaT/P * 2 * Math.PI;
			vp = xseen.sceneInfo[0].stacks.Viewpoints.getActive();
			radius = vp._xseen.fields._radius0;
			y = vp._xseen.fields.position[1] * Math.cos(1.5*radians);
			var currentCamera = xseen.sceneInfo[0].element._xseen.renderer.camera;
			currentCamera.position.y = y;		// This uses Viewpoint initial 'y' coordinate for range
			if (xseen.sceneInfo[0].turntable) {
				x = radius * Math.sin(radians);
				currentCamera.position.x = x;
				currentCamera.position.z = radius * Math.cos(radians);
				if (nodeAframe !== null) {nodeAframe._xseen.sceneNode.position.x = -x;}
			}
			currentCamera.lookAt(xseen.types.Vector3([0,0,0]));
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