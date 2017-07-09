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
            x_element = xseens[i];		// The XSeen DOM element

            x_canvas = new THREE.Scene();	// May need addtl info if multiple: xseen.X3DCanvas(x_element, xseen.canvases.length);
            xseen.canvases.push(x_canvas);	// TODO: Need to handle failure to initialize?
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
/*
 *	Removed because camera is stored in the Scene node (x_element._xseen.renderer.camera
 *	Leave variable definition so other code works...
			var x_camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
			x_camera.position.x = 0;
			x_camera.position.z = 10;
 */
			var x_camera = {};
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (divWidth, divHeight);
			//x_element.appendChild (x_renderer.domElement);
			
			// Stereo camera effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(x_renderer);

/*
 * Add event handler to XSeen tag (x_element)
 *	These handle all mouse/cursor/button controls when the cursor is
 *	in the XSeen region of the page
 */

			x_element.addEventListener ('dblclick', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('click', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('mousedown', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('mousemove', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('mouseup', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('xseen', xseen.Events.XSeenHandler);		// Last chance for XSeen handling of event
/*
	x_element.addEventListener ('mousedown', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
	x_element.addEventListener ('mouseup', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
	x_element.addEventListener ('mousemove', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
 */
			xseen.sceneInfo.push ({
									'size'		: {'width':divWidth, 'height':divHeight},
									'scene'		: x_canvas, 
									'renderer'	: x_renderer,
									'effect'	: x_effect,
									'camera'	: [x_camera],
									'turntable'	: turntable,
									'mixers'	: [],
									'clock'		: new THREE.Clock(),
									'element'	: x_element,
									'selectable': [],
									'stacks'	: [],
									'tmp'		: {activeViewpoint:false},
									'xseen'		: xseen,
								});
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
		
		// for each X-Scene tag, parse and load the contents
		var t=[];
		for (var i=0; i<xseen.sceneInfo.length; i++) {
			xseen.sceneInfo[i].ORIGIN = xseen.ORIGIN;
			xseen.sceneInfo[i].stacks['Viewpoints'] = new xseen.utils.StackHandler('Viewpoints');
			xseen.sceneInfo[i].stacks['Navigation'] = new xseen.utils.StackHandler('Navigation');
			console.log("Processing 'scene' element #" + i);
			xseen.debug.logInfo("Processing 'scene' element #" + i);
			t[i] = new Date().getTime();
			xseen.Parse (xseen.sceneInfo[i].element, xseen.sceneInfo[i]);
			t1 = new Date().getTime() - t[i];
            xseen.debug.logInfo('Time for initial pass #' + i + ' parsing: ' + t1 + " ms.");
		}
    };

/*
 * Animation/render function loop
 *
 *	Run each animation frame. 
 *	Various types of animation (anything that changes frame-to-frame) goes here
 *	.controls is for navigation. See example code at https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_orbit.html
 *	lines 75-80 + render loop
 */
	xseen.renderFrame = function () 
		{
			requestAnimationFrame (xseen.renderFrame);
/*
 *	This is not the way to do animation. Code should not be in the loop
 *	Various objects needing animation should register for an event ... or something
 *
 *	controls are not handling navigation. Currently only working with orbit controls.
 *	Don't know if the problem is events (not generating, not getting), not processing events, or not updating things
 */
			TWEEN.update();
			xseen.updateAnimation (xseen.sceneInfo[0]);
			xseen.updateCamera (xseen.sceneInfo[0]);
			
			var renderObj = xseen.sceneInfo[0].element._xseen.renderer;
			//renderObj.controls.update();

/*
 * Existing code moved to updateAnimation & updateCamera to better handle navigation
 *
			var deltaT, radians, x, y, z, P, radius, vp;
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
			var currentCamera = xseen.sceneInfo[0].element._xseen.renderer.activeCamera;
			currentCamera.position.y = y;		// This uses Viewpoint initial 'y' coordinate for range
			if (xseen.sceneInfo[0].turntable) {
				x = radius * Math.sin(radians);
				currentCamera.position.x = x;
				currentCamera.position.z = radius * Math.cos(radians);
				if (nodeAframe !== null) {nodeAframe._xseen.sceneNode.position.x = -x;}
			}
			//currentCamera.lookAt(xseen.types.Vector3([0,0,0]));
			currentCamera.lookAt(xseen.ORIGIN);
 */
			// End of animation (objects & camera/navigation)
			// StereoEffect renderer
			var activeRender = renderObj.activeRender;
			var currentCamera = renderObj.activeCamera;
			activeRender.render (xseen.sceneInfo[0].scene, currentCamera);
		};

	xseen.updateAnimation = function (scene)
		{
			var deltaT = scene.clock.getDelta();
			for (var i=0; i<scene.mixers.length; i++) {
				scene.mixers[i].update(deltaT);
			}
		};
	xseen.updateCamera = function (scene)
		{
			var deltaT
			deltaT = scene.clock.getDelta();
			var navigation = scene.stacks.Navigation.getActive();
			
			xseen.Navigation[navigation.type] (navigation.speed, deltaT, scene, scene.element._xseen.renderer.activeCamera);
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