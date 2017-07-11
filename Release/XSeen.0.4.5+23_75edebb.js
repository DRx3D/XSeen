/*
 *  XSeen V0.4.5+23_75edebb
 *  Built Mon Jul 10 20:41:35 2017
 *

Dual licensed under the MIT and GPL licenses.

==[MIT]====================================================================
Copyright (c) 2017, Daly Realism

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


==[GPL]====================================================================

XSeen - Declarative 3D for HTML

Copyright (C) 2017, Daly Realism
                                                                       
This program is free software: you can redistribute it and/or modify   
it under the terms of the GNU General Public License as published by   
the Free Software Foundation, either version 3 of the License, or      
(at your option) any later version.                                    
                                                                       
This program is distributed in the hope that it will be useful,        
but WITHOUT ANY WARRANTY; without even the implied warranty of         
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          
GNU General Public License for more details.                           
                                                                       
You should have received a copy of the GNU General Public License      
along with this program.  If not, see <http://www.gnu.org/licenses/>.


=== COPYRIGHT +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Copyright (C) 2017, Daly Realism for XSeen
Copyright, Fraunhofer for X3DOM
Copyright, Mozilla for A-Frame
Copyright, THREE and Khronos for various parts of THREE.js
Copyright (C) 2017, John Carlson for JSON->XML converter (JSONParser.js)

===  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

 */
// File: utils/JSONParser.js
﻿"use strict";

var JSONParser = function(scene)
{
}

JSONParser.prototype.constructor = JSONParser;

	/**
	 * Load X3D JSON into an element.
	 * jsobj - the JavaScript object to convert to DOM.
	 */
JSONParser.prototype.parseJavaScript = function(jsobj) {
		var child = this.CreateElement('scene');
		this.ConvertToX3DOM(jsobj, "", child);
		// console.log(jsobj, child);
		return child;
	};

	// 'http://www.web3d.org/specifications/x3d-namespace'

	// Load X3D JavaScript object into XML or DOM

	/**
	 * Yet another way to set an attribute on an element.  does not allow you to
	 * set JSON schema or encoding.
	 */
JSONParser.prototype.elementSetAttribute = function(element, key, value) {
		if (key === 'SON schema') {
			// JSON Schema
		} else if (key === 'ncoding') {
			// encoding, UTF-8, UTF-16 or UTF-32
		} else {
			if (typeof element.setAttribute === 'function') {
				element.setAttribute(key, value);
			}
		}
	};

	/**
	 * converts children of object to DOM.
	 */
JSONParser.prototype.ConvertChildren = function(parentkey, object, element) {
		var key;

		for (key in object) {
			if (typeof object[key] === 'object') {
				if (isNaN(parseInt(key))) {
					this.ConvertObject(key, object, element, parentkey.substr(1));
				} else {
					this.ConvertToX3DOM(object[key], key, element, parentkey.substr(1));
				}
			}
		}
	};

	/**
	 * a method to create and element with tagnam key to DOM in a namespace.  If
	 * containerField is set, then the containerField is set in the elemetn.
	 */
JSONParser.prototype.CreateElement = function(key, containerField) {
		var child = document.createElement(key);
		if (typeof containerField !== 'undefined') {
			this.elementSetAttribute(child, 'containerField', containerField);
		}
		return child;
	};

	/**
	 * a way to create a CDATA function or script in HTML, by using a DOM parser.
	 */
JSONParser.prototype.CDATACreateFunction = function(document, element, str) {
		var y = str.replace(/\\"/g, "\\\"")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&");
		do {
			str = y;
			y = str.replace(/'([^'\r\n]*)\n([^']*)'/g, "'$1\\n$2'");
			if (str !== y) {
				console.log("CDATA Replacing",str,"with",y);
			}
		} while (y != str);
		var domParser = new DOMParser();
		var cdataStr = '<script> <![CDATA[ ' + y + ' ]]> </script>'; // has to be wrapped into an element
		var scriptDoc = domParser .parseFromString (cdataStr, 'application/xml');
		var cdata = scriptDoc .children[0] .childNodes[1]; // space after script is childNode[0]
		element .appendChild(cdata);
	};

	/**
	 * convert the object at object[key] to DOM.
	 */
JSONParser.prototype.ConvertObject = function(key, object, element, containerField) {
		var child;
		if (object !== null && typeof object[key] === 'object') {
			if (key.substr(0,1) === '@') {
				this.ConvertToX3DOM(object[key], key, element);
			} else if (key.substr(0,1) === '-') {
				this.ConvertChildren(key, object[key], element);
			} else if (key === '#comment') {
				for (var c in object[key]) {
					child = document.createComment(this.CommentStringToXML(object[key][c]));
					element.appendChild(child);
				}
			} else if (key === '#text') {
				child = document.createTextNode(object[key].join(""));
				element.appendChild(child);
			} else if (key === '#sourceText') {
				this.CDATACreateFunction(document, element, object[key].join("\r\n")+"\r\n");
			} else {
				if (key === 'connect' || key === 'fieldValue' || key === 'field' || key === 'meta' || key === 'component') {
					for (var childkey in object[key]) {  // for each field
						if (typeof object[key][childkey] === 'object') {
							child = this.CreateElement(key, containerField);
							this.ConvertToX3DOM(object[key][childkey], childkey, child);
							element.appendChild(child);
							element.appendChild(document.createTextNode("\n"));
						}
					}
				} else {
					child = this.CreateElement(key, containerField);
					this.ConvertToX3DOM(object[key], key, child);
					element.appendChild(child);
					element.appendChild(document.createTextNode("\n"));
				}
			}
		}
	};

	/**
	 * convert a comment string in JavaScript to XML.  Pass the string
	 */
JSONParser.prototype.CommentStringToXML = function(str) {
		var y = str;
		str = str.replace(/\\\\/g, '\\');
		if (y !== str) {
			console.log("X3DJSONLD <!-> replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * convert an SFString to XML.
	 */
JSONParser.prototype.SFStringToXML = function(str) {
		var y = str;
		/*
		str = (""+str).replace(/\\\\/g, '\\\\');
		str = str.replace(/\\\\\\\\/g, '\\\\');
		str = str.replace(/(\\+)"/g, '\\"');
		*/
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/"/g, '\\\"');
		if (y !== str) {
			console.log("X3DJSONLD [] replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * convert a JSON String to XML.
	 */
JSONParser.prototype.JSONStringToXML = function(str) {
		var y = str;
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/\n/g, '\\n');
		if (y !== str) {
			console.log("X3DJSONLD replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * main routine for converting a JavaScript object to DOM.
	 * object is the object to convert.
	 * parentkey is the key of the object in the parent.
	 * element is the parent element.
	 * containerField is a possible containerField.
	 */
JSONParser.prototype.ConvertToX3DOM = function(object, parentkey, element, containerField) {
		var key;
		var localArray = [];
		var isArray = false;
		var arrayOfStrings = false;
		for (key in object) {
			if (isNaN(parseInt(key))) {
				isArray = false;
			} else {
				isArray = true;
			}
			if (isArray) {
				if (typeof object[key] === 'number') {
					localArray.push(object[key]);
				} else if (typeof object[key] === 'string') {
					localArray.push(object[key]);
					arrayOfStrings = true;
				} else if (typeof object[key] === 'boolean') {
					localArray.push(object[key]);
				} else if (typeof object[key] === 'object') {
					/*
					if (object[key] != null && typeof object[key].join === 'function') {
						localArray.push(object[key].join(" "));
					}
					*/
					this.ConvertToX3DOM(object[key], key, element);
				} else if (typeof object[key] === 'undefined') {
				} else {
					console.error("Unknown type found in array "+typeof object[key]);
				}
			} else if (typeof object[key] === 'object') {
				// This is where the whole thing starts
				if (key === 'scene') {
					this.ConvertToX3DOM(object[key], key, element);
				} else {
					this.ConvertObject(key, object, element);
				}
			} else if (typeof object[key] === 'number') {
				this.elementSetAttribute(element, key.substr(1),object[key]);
			} else if (typeof object[key] === 'string') {
				if (key === '#comment') {
					var child = document.createComment(this.CommentStringToXML(object[key]));
					element.appendChild(child);
				} else if (key === '#text') {
					var child = document.createTextNode(object[key]);
					element.appendChild(child);
				} else {
					// ordinary string attributes
					this.elementSetAttribute(element, key.substr(1), this.JSONStringToXML(object[key]));
				}
			} else if (typeof object[key] === 'boolean') {
				this.elementSetAttribute(element, key.substr(1),object[key]);
			} else if (typeof object[key] === 'undefined') {
			} else {
				console.error("Unknown type found in object "+typeof object[key]);
				console.error(object);
			}
		}
		if (isArray) {
			if (parentkey.substr(0,1) === '@') {
				if (arrayOfStrings) {
					arrayOfStrings = false;
					for (var str in localArray) {
						localArray[str] = this.SFStringToXML(localArray[str]);
					}
					this.elementSetAttribute(element, parentkey.substr(1),'"'+localArray.join('" "')+'"');
				} else {
					// if non string array
					this.elementSetAttribute(element, parentkey.substr(1),localArray.join(" "));
				}
			}
			isArray = false;
		}
		return element;
	};
// File: utils/LoadManager.js
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

	this.failure = function (xhr, errorCode, errorText) {
		if (typeof(xhr._loadManager.failure) !== undefined) {
			xhr._loadManager.failure (xhr, xhr._loadManager.userdata, errorCode, errorText);
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
		if (settings.dataType == 'json') {
			settings['beforeSend'] = function(xhr){xhr.overrideMimeType("application/json");};
		}
		this.urlQueue[this.urlNext] = null;
		this.urlNext ++;
		var x = jQuery.get(settings);		// Need to change this... Has impact throughout class
		x._loadManager = {'userdata': details.userdata, 'requestType':details.type, 'success':details.success, 'failure':details.failure};
		this.totalRequests++;
	}
}
// File: init/Definitions.js
/*
 * XSeen JavaScript Library
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
	utils			: {},
	eventManager	: {},
	Events			: {},
	Navigation		: {},

	loadMgr			: {},
	loader			: {
						'Null'			: '',
						'ColladaLoader'	: '',
						'GltfLegacy'	: '',
						'GltfLoader'	: '',
						'ObjLoader'		: '',
						'ImageLoader'	: '',
						'X3dLoader'		: '',
					},
	loadProgress	: function (xhr) {
						if (xhr.total != 0) {
							console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
						}
					},
	loadError		: function (xhr, userdata, code, message) {
						console.error('An error happened on '+userdata.e.id+'\n'+code+'\n'+message);
					},
	loadMime		: {
						''		: {name: 'Null', loader: 'Null'},
						'dae'	: {name: 'Collada', loader: 'ColladaLoader'},
						'glb'	: {name: 'glTF Binary', loader: 'GltfLoader'},
						'glbl'	: {name: 'glTF Binary', loader: 'GltfLegacy'},
						'gltf'	: {name: 'glTF JSON', loader: 'GltfLoader'},
						'obj'	: {name: 'OBJ', loader: 'ObjLoader'},
						'png'	: {name: 'PNG', loader: 'ImageLoader'},
						'jpg'	: {name: 'JPEG', loader: 'ImageLoader'},
						'jpeg'	: {name: 'JPEG', loader: 'ImageLoader'},
						'gif'	: {name: 'GIF', loader: 'ImageLoader'},
						'x3d'	: {name: 'X3D XML', loader: 'X3dLoader'},
					},
// helper
	array_to_object	: function (a) {
						var o = {};
						for(var i=0;i<a.length;i++) {
							o[a[i]]='';
						}
						return o;
					},


	
	timeStart		: (new Date()).getTime(),
	timeNow			: (new Date()).getTime(),

	tmp				: {},			// misc. out of the way storage

	versionInfo		: [],
    x3dNS    		: 'http://www.web3d.org/specifications/x3d-namespace',
    x3dextNS 		: 'http://philip.html5.org/x3d/ext',
    xsltNS   		: 'http://www.w3.org/1999/XSL/x3dom.Transform',
    xhtmlNS  		: 'http://www.w3.org/1999/xhtml',

	updateOnLoad	: 0,
	parseUrl		: 0,

	dumpSceneGraph	: function () {this._dumpChildren (xseen.sceneInfo[0].scene, ' +', '--');},
	_dumpChildren	: function (obj, indent, addstr)
						{
							console.log (indent + '> ' + obj.type + ' (' + obj.name + ')');
							for (var i=0; i<obj.children.length; i++) {
								var child = obj.children[i];
								this._dumpChildren(child, indent+addstr, addstr);
							}
						},
};
// File: init/XSeen.js
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
			turntable = false;
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
			x_renderer.controls = {'update' : function() {return;}};

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
	x_element.addEventListener ('change', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
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
			if (renderObj.controls !== null) {renderObj.controls.update();}

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
			var viewpoint = scene.stacks.Viewpoints.getActive();
			
			xseen.Navigation[viewpoint.motion] (viewpoint.motionspeed, deltaT, scene, scene.element._xseen.renderer.activeCamera);
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
// File: ./aRuntimeDefinitions.js
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
// File: ./Nav-Viewpoint.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * This is all new code.
 * Portions of XSeen extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * Dual licensed under the MIT and GPL
 */


/*
 * xseen.Navigation.<mode>(label);
 * Computes the new viewing location for the specific mode.
 *
 *	Each Navigation method takes the following parameters:
 *		speed	Floating point value indicating motion speed. 
 *				Units are distance per milli-second for linear motion or
 *				revolutions (2*pi) per milli-second for angular motion
 *		deltaT	Time since last update in milli-seconds
 *			TODO: This is not true for the Turntable class of camera motion -- which isn't really Navigation anyway
 *		scene	The 'sceneInfo' object for this HTML instance
 *		camera	The current (active) camera (aka scene.element._xseen.renderer.activeCamera)
 *
 * Navigation is the user-controlled process of moving in the 3D world.
 * 
 */

xseen.Navigation = {
	'TwoPi'		: 2 * Math.PI,
	'none'		: function () {},		// Does not allow user-controlled navigation
	
	'turntable'	: function (speed, deltaT, scene, camera)
		{
			var T, radians, radius, vp;
			T = (new Date()).getTime() - xseen.timeStart;
			radians = T * speed * this.TwoPi;
			vp = scene.stacks.Viewpoints.getActive();			// Convienence declaration
			radius = vp.fields._radius0;
			camera.position.x = radius * Math.sin(radians)
			camera.position.y = vp.fields.position[1] * Math.cos(1.5*radians);
			camera.position.z = radius * Math.cos(radians);
			camera.lookAt(scene.ORIGIN);
		},

	'tilt'		: function (speed, deltaT, scene, camera)
		{
			var T, radians, vp;
			T = (new Date()).getTime() - xseen.timeStart;
			radians = T * speed * this.TwoPi;
			vp = scene.stacks.Viewpoints.getActive();			// Convienence declaration
			camera.position.y = vp.fields.position[1] * Math.cos(1.5*radians);
			camera.lookAt(scene.ORIGIN);
		},
		
	'setup'		: {
		'none'		: function () {return null;},
		
		'orbit'		: function (camera, renderer)
			{
				var controls;
				controls = new THREE.OrbitControls( camera, renderer.domElement );
				//controls.addEventListener( 'change', render ); // remove when using animation loop
				// enable animation loop when using damping or autorotation
				//controls.enableDamping = true;
				//controls.dampingFactor = 0.25;
				controls.enableZoom = false;
				controls.enableZoom = true;
				return controls;
			},

		'trackball'		: function (camera, renderer)
			{
				var controls;
				controls = new THREE.TrackballControls(camera, renderer.domElement);

				// These are from the example code at https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_trackball.html
				controls.rotateSpeed = 1.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;
				controls.noZoom = false;
				controls.noPan = false;
				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;
				controls.keys = [ 65, 83, 68 ];

				// Render function is 'xseen.renderFrame'
				// remove when using animation loop
				//controls.addEventListener( 'change', xseen.renderFrame );
				return controls;
			},
		},
};
// File: ./NodeDefinitions.js
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
 * Fields are added with the .addField method. It takes its values from the argument list
 * or an object passed as the first argument. The properties of the argument are:
 *	name - the name of the field. This is converted to lowercase before use
 *	datatype - the datatype of the field. There must be a method in xseen.types by this name
 *	defaultValue - the default value of the field to be used if the field is not present or incorrectly defined.
 *					If this argument is an array, then it is the set of allowed values. The first element is the default.
 *	enumerated - the list of allowed values when the datatype only allows specific values for this field (optional)
 *	animatable - Flag (T/F) indicating if the field is animatable. Generally speaking, enumerated fieles are not animatable
 */

xseen.nodes = {
	'_defineNode' : function(nodeName, nodeComponent, nodeMethod) {
		//methodBase = 'xseen.node.';
		var methodBase = '';
		node = {
				'tag'		: nodeName,
				'taglc'		: nodeName.toLowerCase(),
				'component' : nodeComponent,
				'method'	: methodBase + nodeMethod,
				'fields'	: [],
				'fieldIndex': [],
				'addField'	: function (fieldObj, datatype, defaultValue) {
					var fieldName, namelc, enumerated, animatable;
					if (typeof(fieldObj) === 'object') {
						fieldName		= fieldObj.name;
						datatype		= fieldObj.datatype;
						defaultValue	= fieldObj.defaultValue;
						enumerated		= (typeof(fieldObj.enumerated) === 'undefined') ? [] : fieldObj.enumerated;
						animatable		= (typeof(fieldObj.animatable) === 'undefined') ? false : fieldObj.animatable;
					} else {
						fieldName	= fieldObj;
						animatable	= false;
						if (typeof(defaultValue) == 'array') {
							enumerated	= defaultValue;
							defaultValue = enumerated[0];
						} else {
							enumerated = [];
						}
					}
					namelc = fieldName.toLowerCase();
					this.fields.push ({
								'field'			: fieldName,
								'fieldlc'		: namelc,
								'type'			: datatype,
								'default'		: defaultValue,
								'enumeration'	: enumerated,
								'animatable'	: animatable,
								'clone'			: this.cloneField,
								'setFieldName'	: this.setFieldName,
								});
					this.fieldIndex[namelc] = this.fields.length-1;
					return this;
				},
				'addNode'	: function () {
					xseen.parseTable[this.taglc] = this;
				},
				'cloneField'	: function () {
					var newFieldObject = {
								'field'			: this.field,
								'fieldlc'		: this.fieldlc,
								'type'			: this.type,
								'default'		: 0,
								'enumeration'	: [],
								'animatable'	: this.animatable,
								'clone'			: this.clone,
								'setFieldName'	: this.setFieldName,
					};
					for (var i=0; i<this.enumeration.length; i++) {
						newFieldObject.enumeration.push(this.enumeration[i]);
					}
					if (Array.isArray(this.default)) {
						newFieldObject.default = [];
						for (var i=0; i<this.default.length; i++) {
							newFieldObject.default.push(this.default[i]);
						}
					} else {
						newFieldObject.default = this.default;
					}
					return newFieldObject;
				},
				'setFieldName'	: function(newName) {
					this.field = newName;
					this.fieldlc = newName.toLowerCase();
					return this;
				},
		}
		return node;
	},
/*
 *	Returns all of the available information about a specified field in a given node. The
 *	property 'good' indicates that everything was found and could be handled. If 'good' is FALSE, then
 *	something went wrong or is missing.
 */
	'_getFieldInfo' : function (nodeName, fieldName) {
		var fieldInfo = {'good': false, 'nodeExists': false, 'fieldExists': false};
		if (typeof(nodeName) === 'undefined' || nodeName == '' || typeof(fieldName) === 'undefined' || fieldName == '') {return fieldInfo;}
		var nodeLC = nodeName.toLowerCase();
		if (typeof(xseen.parseTable[nodeLC]) === 'undefined') {
			return fieldInfo;
		}
		fieldInfo.nodeExists = true;
		var node = xseen.parseTable[nodeLC];
		var fieldLC = fieldName.toLowerCase();
		if (typeof(node.fieldIndex[fieldLC]) === 'undefined') {
			return fieldInfo;
		}
		fieldInfo.fieldExists = true;
		var field = node.fields[node.fieldIndex[fieldLC]];
		fieldInfo.node = node;
		fieldInfo.field = field;
		fieldInfo.handlerName = 'set' + field.field;
		fieldInfo.dataType = field.type;
		fieldInfo.good = true;
		return fieldInfo;
	},
/*
 *	Parse fields of an HTML tag (called element) using the field information from the defined 'node'
 *	If the first character of the field value is '#', then the remainder is treated as an ID and the
 *	field value is obtained from that HTML tag prior to parsing. The referenced tag's attribute name
 *	is the same name as the attribute of the parsed 'node'.
 *	If the field value is '*', then all attributes of the HTML tag are parsed as strings. Typically this is 
 *	only used for mixin assets.
 */
	'_parseFields' : function(element, node) {
		element._xseen.fields = [];		// fields for this node
		element._xseen.animate = [];	// animatable fields for this node
		element._xseen.animation = [];	// array of animations on this node
		element._xseen.parseAll = false;
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				var value = this._parseField (field, element);
				if (value == 'xseen.parse.all') {
					element._xseen.parseAll = true;
				} else {
					element._xseen.fields[field.fieldlc] = value;
					if (field.animatable) {element._xseen.animate[field.fieldlc] = null;}
				}
			}, this);
/*
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				if (field.field == '*') {
					this._xseen.parseAll = true;
				} else {
					var value = this.getAttribute(field.fieldlc);
					if (value !== null && value.substr(0,1) == '#') {		// Asset reference
						var re = document.getElementById(value.substr(1,value.length));
						value = re._xseen.fields[field.fieldlc] || '';
					}
					value = xseen.types[field.type] (value, field.default);
					this._xseen.fields[field.fieldlc] = value;
				}
			}, element);
 */
		if (element._xseen.parseAll) {
			for (var i=0; i<element.attributes.length; i++) {
				if (typeof(element._xseen.fields[element.attributes[i].name]) === 'undefined') {
					element._xseen.fields[element.attributes[i].name.toLowerCase()] = element.attributes[i].value;
				}
			}
		}
	},
	
	'_parseField' : function (field, e) {
		if (field.field == '*') {
			return 'xseen.parse.all';
			//this._xseen.parseAll = true;
		} else {
			var value = e.getAttribute(field.fieldlc);
			if (value !== null && value.substr(0,1) == '#') {		// Asset reference
				var re = document.getElementById(value.substr(1,value.length));
				value = re._xseen.fields[field.fieldlc] || '';
			}
			value = xseen.types[field.type] (value, field.default, field.enumeration);
			return value;
		}
	},


	'_dumpTable' : function() {
		var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
		console.log('Node parsing table (' + xseen.parseTable.length + ' nodes)\n' + jsonstr);
	}
};
	
// File: ./Parse.js
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
		console.log ('Calling node: ' + nodeName + '. Method: ' + xseen.parseTable[nodeName].method + '.init (e,p)');
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
// File: ./Properties.js
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
// File: ./StackHandler.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * This is all new code.
 * Portions of XSeen extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * Dual licensed under the MIT and GPL
 */


/*
 * xseen.utlis.StackHandler(label);
 * Creates a new stack that is managed by this class
 * 
 * Note that the Push-Down stack (aka FILO) is implemented as a reverse list
 * so that the Array methods .push and .pop can be used. The end of the array
 * is the "top-most" element in the stack.
 */

xseen.utils.StackHandler = function (label) {
	this._internals				= {};		// Internal class storage
	this._internals.label		= label;	// Unique user-supplied name for this stack
	this._internals.stack		= [];		// Maintains the stack. Last entry on stack is active
	this._internals.active		= -1;		// Index of currently active list element
	this._internals.activeNode	= {};		// Entry of currently active list element
	this._internals.defaultNode	= {};		// The default entry to be active if nothing else is

	this._setActiveNode = function() {		// Sets the entry specified by nodeId as active
		this._internals.active = this._internals.stack.length-1;
		if (this._internals.active >= 0) {
			this._internals.activeNode = this._internals.stack[this._internals.active];
		} else {
			this._internals.activeNode = this._internals.defaultNode;
		}
	}

	this.init = function() {		// Clears existing stack
		this._internals.stack = [];
	}

	this.pushDown = function(node) {		// Push new node onto stack and make active
		this._internals.stack.push (node);
		this._setActiveNode();
	}

	this.popOff = function() {			// Pop node off stack and make next one active
		this._internals.stack.pop();
		this._setActiveNode();
	}

	this.getActive = function() {
		return this._internals.activeNode;
	}
	
	this.setDefault = function(node) {
		this._internals.defaultNode = node;
		if (Object.keys(this._internals.activeNode).length === 0) {
			this._internals.activeNode = this._internals.defaultNode;
		}
	}
}
// File: ./Types.js
/*
 * xseen.types contains the datatype and conversion utilities. These convert one format to another.
 * Any method ending in 'toX' where 'X' is some datatype is a conversion to that type
 * Other methods convert from string with space-spearated values
 */
xseen.types = {
	'Deg2Rad'	: Math.PI / 180,

	'SFFloat'	: function (value, def)
		{
			if (value === null) {return def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFInt'	: function (value, def)
		{
			if (value === null) {return def;}
			if (Number.isNaN(value)) {return def};
			return Math.round(value);
		},

	'SFBool'	: function (value, def)
		{
			if (value === null) {return def;}
			if (value) {return true;}
			if (!value) {return false;}
			return def;
		},

	'SFTime'	: function (value, def)
		{
			if (value === null) {return def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFVec3f'	: function (value, def)
		{
			if (value === null) {return def;}
			var v3 = value.split(' ');
			if (v3.length < 3 || Number.isNaN(v3[0]) || Number.isNaN(v3[1]) || Number.isNaN(v3[2])) {
				return def;
			}
			return [v3[0]-0, v3[1]-0, v3[2]-0];
		},

	'SFVec2f'	: function (value, def)
		{
			if (value === null) {return def;}
			var v2 = value.split(' ');
			if (v2.length != 2 || Number.isNaN(v2[0]) || Number.isNaN(v2[1])) {
				return def;
			}
			return [v2[0]-0, v2[1]-0];
		},

	'SFRotation'	: function (value, def)
		{
			if (value === null) {return def;}
			var v4 = value.split(' ');
			if (v4.length != 4 || Number.isNaN(v4[0]) || Number.isNaN(v4[1]) || Number.isNaN(v4[2]) || Number.isNaN(v4[3])) {
				return def;
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

//	For MF* types, a default of '' means to return an empty array on parsing error
	'MFFloat'	: function (value, def)
		{
			var defReturn = (def == '') ? [] : def;
			if (value === null) {return defReturn;}
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i++) {
				if (mi[i] == '') {continue;}
				if (Number.isNaN(mi[i])) {return defReturn};
				rv.push (mi[i]);
			}
			return rv;
		},

	'MFInt'		: function (value, def)
		{
			var defReturn = (def == '') ? [] : def;
			if (value === null) {return defReturn;}
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i++) {
				if (mi[i] == '') {continue;}
				if (Number.isNaN(mi[i])) {return defReturn};
				rv.push (Math.round(mi[i]));
			}
			return rv;
		},

	'MFVec3f'	: function (value, def)
		{
			var defReturn = (def == '') ? [] : def;
			if (value === null) {return defReturn;}
			value = value.trim().replace(/\s+/g, ' ');
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i=i+3) {
				if (Number.isNaN(mi[i])) {return defReturn};
				if (Number.isNaN(mi[i+1])) {return defReturn};
				if (Number.isNaN(mi[i+2])) {return defReturn};
				rv.push ([mi[i]-0, mi[i+1]-0, mi[i+2]-0]);
			}
			return rv;
		},

	'MFColor'	: function (value, def)
		{
			if (value === null) {return def;}
			value = value.trim().replace(/\s+/g, ' ');
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i=i+3) {
				if (Number.isNaN(mi[i])) {return def};
				if (Number.isNaN(mi[i+1])) {return def};
				if (Number.isNaN(mi[i+2])) {return def};
				rv.push ([Math.min(Math.max(mi[i]-0, 0.0), 1.0), Math.min(Math.max(mi[i+1]-0, 0.0), 1.0), Math.min(Math.max(mi[i+2]-0, 0.0), 1.0)]);
			}
			return rv;
		},

// A-Frame data types

// value can be any CSS color (#HHH, #HHHHHH, 24-bit Integer, name)
	'Color'	: function (value, defaultString)
		{
			return defaultString;
		},
	
// XSeen data types
	'EnumerateString' : function (value, defString, choices)
		{
			value = this.SFString (value, defString);
			for (var i=0; i<choices.length; i++) {
				if (value == choices[i]) {return value;}
			}
			return defString;
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
			hex = hex;
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
// File: ./zVersion.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 */

/*
 * Version Information for XSeen
 */
xseen.generateVersion = function () {
	var Major, Minor, Patch, PreRelease, Release, Version, RDate, SplashText;
	Major		= 0;
	Minor		= 4;
	Patch		= 5;
	PreRelease	= '';
	Release		= 23;
	Version		= '';
	RDate		= '2017-07-10';
	SplashText	= ["XSeen 3D Language parser.", "XSeen <a href='http://tools.realism.com/specification/xseen' target='_blank'>Documentation</a>."];
/*
 * All X3D and A-Frame pre-defined solids, fixed camera, directional light, Material texture only, glTF model loader with animations, Assets and reuse, Viewpoint, Background, Lighting, Image Texture, [Indexed]TriangleSet, IndexedFaceSet, [Indexed]QuadSet<br>\nNext work<ul><li>Event Model/Animation</li><li>Extrusion</li><li>Navigation</li></ul>",
 *
 * All of the following are ALPHA releases for V0.4.x
 * V0.4.0+13 Feature -- events (from HTML to XSeen)
 * V0.4.1+14 Fix - minor text correction in xseen.node.geometry__TriangulateFix (nodes-x3d_Geometry.js)
 * V0.4.1+15 Modified build.pl to increase compression by removing block comments
 * V0.4.1+16 Feature -- XSeen events (from XSeen to HTML)
 * V0.4.2+17 Feature -- XSeen internals events (from XSeen to XSeen) with changes to fix previous event handling
 * V0.4.2+18 Feature -- Split screen VR display
 * V0.4.3+19 Rebuild and fix loading caused by new Stereo library
 * V0.4.3+20 Feature -- Navigation (orbit), including Stack update for Viewpoint and restructuring the rendering loop
 * V0.4.3+21 Feature -- Changed handling of Viewpoint to include camera motion
 * V0.4.4+22 Fix -- Internal event handling in passing on events of the proper type
 * V0.4.5+23 Feature -- Navigation (trackball)
 * V0.4.5+24 Fix -- when there is no navigation
 *
 * In progress
 */
	var version = {
		major		: Major,
		minor		: Minor,
		patch		: Patch,
		preRelease	: PreRelease,
		release		: Release,
		version		: '',
		date		: RDate,
		splashText	: SplashText
	};
// Using the scheme at http://semver.org/
	version.version = version.major + '.' + version.minor + '.' + version.patch;
	version.version += (version.preRelease != '') ? '-' + version.preRelease : '';
	version.version += (version.release != '') ? '+' + version.release : '';
	return version;
}
// File: nodes/nodes-af.js
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
xseen.node.af_Assets = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.af_AssetItem = {
	'init'	: function (e,p) 		// Only field is SRC.
		{
		},
	'fin'	: function (e,p) {}
};
xseen.node.af_Mixin = {
	'init'	: function (e,p) 		// Lots of fields -- all nebelous until used
		{
		},
	'fin'	: function (e,p) {}
};



xseen.node.af_Appearance = function (e) {
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
// File: nodes/nodes-Viewing.js
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

 // Control Node definitions


xseen.node.unk_Viewpoint = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints
			e._xseen.fields._radius0 = Math.sqrt(	e._xseen.fields.position[0]*e._xseen.fields.position[0] + 
													e._xseen.fields.position[1]*e._xseen.fields.position[1] + 
													e._xseen.fields.position[2]*e._xseen.fields.position[2]);
			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.position = new THREE.Vector3(e._xseen.fields.position[0], e._xseen.fields.position[1], e._xseen.fields.position[2]);
			e._xseen.type = e._xseen.fields.cameratype;
			e._xseen.motion = e._xseen.fields.motion;
			e._xseen.motionspeed = e._xseen.fields.motionspeed * 1000;
			if (e._xseen.motion == 'turntable' || e._xseen.motion == 'tilt') {e._xseen.motionspeed = 1.0/e._xseen.motionspeed;}

			if (!e._xseen.sceneInfo.tmp.activeViewpoint) {
				e._xseen.sceneInfo.stacks.Viewpoints.pushDown(e._xseen);
				e._xseen.sceneInfo.tmp.activeViewpoint = true;
			}

			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
		},
	'fin'	: function (e,p) {},

	'setactive'	: function (ev)
		{
			var xseenNode = this.destination._xseen;
			xseenNode.sceneInfo.stacks.Viewpoints.pushDown(xseenNode);	// TODO: This is probably not the right way to change VP in the stack
			xseenNode.sceneInfo.element._xseen.renderer.activeCamera = 
				xseenNode.sceneInfo.element._xseen.renderer.cameras[xseenNode.fields.type];
			xseenNode.sceneInfo.element._xseen.renderer.activeRender = 
				xseenNode.sceneInfo.element._xseen.renderer.renderEffects[xseenNode.fields.type];
			if (xseenNode.fields.type != 'stereo') {
				xseenNode.sceneInfo.element._xseen.renderer.activeRender.setViewport( 0, 0, xseenNode.sceneInfo.size.width, this.destination._xseen.sceneInfo.size.height);
			}
		},
};

xseen.node.controls_Navigation = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints

			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.speed = e._xseen.fields.speed;
			if (e._xseen.setup == 'examine') {e._xseen.setup == 'trackball';}
			//e._xseen.type = e._xseen.fields.type;
			e._xseen.type = 'none';
			e._xseen.setup = e._xseen.fields.type;
			if (!(e._xseen.setup == 'orbit' || e._xseen.setup == 'trackball')) {e._xseen.setup = 'none';}

			if (!e._xseen.sceneInfo.tmp.activeNavigation) {
				e._xseen.sceneInfo.stacks.Navigation.pushDown(e._xseen);
				e._xseen.sceneInfo.tmp.activeNavigation = true;
			}
			
			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
		},
	'fin'	: function (e,p) {},

	'setactive'	: function (ev)
		{
/*
			this.destination._xseen.sceneInfo.stacks.Viewpoints.pushDown(this.destination);	// TODO: This is probably not the right way to change VP in the stack
			this.destination._xseen.sceneInfo.element._xseen.renderer.activeCamera = 
				this.destination._xseen.sceneInfo.element._xseen.renderer.cameras[this.destination._xseen.fields.type];
			this.destination._xseen.sceneInfo.element._xseen.renderer.activeRender = 
				this.destination._xseen.sceneInfo.element._xseen.renderer.renderEffects[this.destination._xseen.fields.type];
			if (this.destination._xseen.fields.type != 'stereo') {
				this.destination._xseen.sceneInfo.element._xseen.renderer.activeRender.setViewport( 0, 0, this.destination._xseen.sceneInfo.size.width, this.destination._xseen.sceneInfo.size.height);
			}
 */
		},
};

xseen.node.lighting_Light = {
	'init'	: function (e,p) 
		{
			var color = xseen.types.Color3toInt (e._xseen.fields.color);
			var intensity = e._xseen.fields.intensity - 0;
			var lamp, type=e._xseen.fields.type.toLowerCase();
/*
			if (typeof(p._xseen.children) == 'undefined') {
				console.log('Parent of Light does not have children...');
				p._xseen.children = [];
			}
 */

			if (type == 'point') {
				// Ignored field -- e._xseen.fields.location
				lamp = new THREE.PointLight (color, intensity);
				lamp.distance = Math.max(0.0, e._xseen.fields.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.fields.attenuation[1]/2 + e._xseen.fields.attenuation[2]);

			} else if (type == 'spot') {
				lamp = new THREE.SpotLight (color, intensity);
				lamp.position.set(0-e._xseen.fields.direction[0], 0-e._xseen.fields.direction[1], 0-e._xseen.fields.direction[2]);
				lamp.distance = Math.max(0.0, e._xseen.fields.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.fields.attenuation[1]/2 + e._xseen.fields.attenuation[2]);
				lamp.angle = Math.max(0.0, Math.min(1.5707963267948966192313216916398, e._xseen.fields.cutoffangle));
				lamp.penumbra = 1 - Math.max(0.0, Math.min(lamp.angle, e._xseen.fields.beamwidth)) / lamp.angle;

			} else {											// DirectionalLight (by default)
				lamp = new THREE.DirectionalLight (color, intensity);
				lamp.position.x = 0-e._xseen.fields.direction[0];
				lamp.position.y = 0-e._xseen.fields.direction[1];
				lamp.position.z = 0-e._xseen.fields.direction[2];
			}
			p._xseen.children.push(lamp);
			lamp = null;
		}
		,
	'fin'	: function (e,p)
		{
		}
};
// File: nodes/nodes-x3d_Appearance.js
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

 // Node definition code (just stubs right now...)


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
			e._xseen.animate['diffusecolor'] = p._xseen.material.color;
			e._xseen.animate['emissivecolor'] = p._xseen.material.emissive;
			e._xseen.animate['specularcolor'] = p._xseen.material.specular;
			e._xseen.animate['transparency'] = p._xseen.material.opacity;
			e._xseen.animate['shininess'] = p._xseen.material.shininess;
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_ImageTexture = {
	'init'	: function (e,p)
		{
			p._xseen.texture = xseen.loader.ImageLoader.load(e._xseen.fields.url);
			p._xseen.texture.wrapS = (e._xseen.fields.repeats) ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			p._xseen.texture.wrapT = (e._xseen.fields.repeatt) ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_Appearance = {
	'init'	: function (e,p) {},

	'fin'	: function (e,p)
		{
			if (typeof(e._xseen.texture) !== 'undefined' && e._xseen.texture !== null) {
				e._xseen.material.map = e._xseen.texture;
			}
			p._xseen.appearance = e._xseen.material;
		}
};
// File: nodes/nodes-x3d_Geometry.js
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

 // Node definition code (just stubs right now...)


xseen.node.geometry_Coordinate = {
	'init'	: function (e,p) 
		{
			var vertices = [];
			for (var i=0; i<e._xseen.fields.point.length; i++) {
				vertices.push (new THREE.Vector3 (e._xseen.fields.point[i][0], e._xseen.fields.point[i][1], e._xseen.fields.point[i][2]));
			}
			p._xseen.fields.vertices = vertices;
		},
	'fin'	: function (e,p) {}
}
xseen.node.geometry_Normal = {
	'init'	: function (e,p) 
		{
			var normals = [];
			for (var i=0; i<e._xseen.fields.vector.length; i++) {
				normals.push (new THREE.Vector3 (e._xseen.fields.vector[i][0], e._xseen.fields.vector[i][1], e._xseen.fields.vector[i][2]));
			}
			p._xseen.fields.normals = normals;
		},
	'fin'	: function (e,p) {}
}
xseen.node.geometry_Color = {
	'init'	: function (e,p) 
		{
			var colors = [];
			for (var i=0; i<e._xseen.fields.color.length; i++) {
				colors.push (new THREE.Color (e._xseen.fields.color[i][0], e._xseen.fields.color[i][1], e._xseen.fields.color[i][2]));
			}
			p._xseen.fields.color = colors;
		},
	'fin'	: function (e,p) {}
}

xseen.node.geometry_TriangleSet = {
	'init'	: function (e,p) {},
// Create default index (applies to coordinates, color, normals, and textures), then call _ITS; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var indices = [];
			for (var i=0; i<e._xseen.fields.vertices.length; i++) {
				indices[i] = i;
			}
			var geometry = xseen.node.geometry__Indexed3 (	indices,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};
xseen.node.geometry_QuadSet = {
	'init'	: function (e,p) {},
// Create default index (applies to coordinates, color, normals, and textures), then call _ITS; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var indices = [];
			for (var i=0; i<e._xseen.fields.vertices.length; i++) {
				indices[i] = i;
			}
			var triangles = xseen.node.geometry__TriangulateFixed (4, indices);
			var geometry = xseen.node.geometry__Indexed3 (	indices,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};

function v3toString(v3) {
	var s = v3.x + ', ' + v3.y + ', ' + v3.z;
	return s;
}
function ctoString(c) {
	var s = c.r + ', ' + c.g + ', ' + c.b;
	return s;
}
xseen.node.geometry_IndexedTriangleSet = {
	'init'	: function (e,p) {},
// Call _ITS with indices, coordinates, color, normals, and textures; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var geometry = xseen.node.geometry__Indexed3 (	e._xseen.fields.index,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};
xseen.node.geometry_IndexedQuadSet = {
	'init'	: function (e,p) {},
// Call _ITS with indices, coordinates, color, normals, and textures; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var triangles = xseen.node.geometry__TriangulateFixed (4, e._xseen.fields.index);
			var geometry = xseen.node.geometry__Indexed3 (	triangles,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};
xseen.node.geometry_IndexedFaceSet = {
	'init'	: function (e,p) {},
// Call _ITS with indices, coordinates, color, normals, and textures; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var triangles = xseen.node.geometry__TriangulateSentinel (e._xseen.fields.coordindex);
			var geometry = xseen.node.geometry__Indexed3 (	triangles,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};

/*
 *	Triangulate a set of indices
 *	Uses the value of -1 as a sentinel to indicate that a face definition is complete
 *
 *	Works by taking the first three indices for the first triangle. The second triangle
 *	starts at the first index, then to the last index of the previous triangle. The new 
 *	last index is the next index of the sequence. Triangulation ends when a -1 is encountered.
 *	It is an error if a face is defined with only two indices. There is no error checking.
 *
 *	Arguments:
 *		indices	- An array of numbers that represents the indices of faces.
 *
 *	Return:
 *		An array of numbers that represents the indices of the triangulated faces
 */
xseen.node.geometry__TriangulateSentinel = function(indices) {
	var first, last, mid;
	var ndx = 0;
	var triangles = [];
	while (ndx < indices.length) {
		first = indices[ndx++];
		mid = indices[ndx++];
		last = indices[ndx++];
		triangles.push(first, mid, last);
		while (ndx < indices.length && indices[ndx] != -1) {
			mid = last;
			last = indices[ndx++];
			triangles.push(first, mid, last);
		}
		if (ndx < indices.length && indices[ndx] == -1) {ndx++;}
	}
	return triangles;
};

/*
 *	Triangulate a set of indices
 *	Takes a fixed number of indices 
 *
 *	Works by taking the first three indices for the first triangle. The second triangle
 *	starts at the first index, then to the last index of the previous triangle. The new 
 *	last index is the next index of the sequence. Triangulation ends when a -1 is encountered.
 *	It is an error if a face is defined with only two indices. There is no error checking.
 *
 *	Arguments:
 *		count - An integer that is the number of indices making up a face throughout the entire 'indices' array.
 *		indices	- An array of numbers that represents the indices of faces.
 *
 *	Return:
 *		An array of numbers that represents the indices of the triangulated faces
 */
xseen.node.geometry__TriangulateFixed = function (count, indices) {
	var first, last, mid, cnt;
	var ndx = 0;
	var triangles = [];
	if (count < 3) {
		console.log ('Too few ('+count+') vertices per triangle. No triangulation performed.');
		return triangles;
	}
	if (indices.length % count != 0) {
		console.log ('Number of indices ('+indices.length+') not divisible by '+count+'. Some indices not used');
	}

	while (ndx < indices.length) {
		first = indices[ndx++];
		mid = indices[ndx++];
		last = indices[ndx++];
		cnt = 3;
		triangles.push(first, mid, last);
		while (ndx < indices.length && cnt < count) {
			mid = last;
			last = indices[ndx++];
			cnt ++;
			triangles.push(first, mid, last);
		}
	}
	return triangles;
};

/*
 *	Generalized indexed face geometry creation.
 *
 *	Arguments:
 *		indices - an array of integers >= 0 where each triple defines a triangle face. It is assumed that the 
 *					indices define the face in counter-clockwise order when looking at the face.
 *		vertices - an array of THREE.Vector3 points
 */
xseen.node.geometry__Indexed3 = function (indices, vertices, normals=[], color=[]) {
	var i, face, normal=[], faceCount=0, n;
	var useNormals	= (normals.length > 0) ? true : false;
	var useColor	= (color.length > 0) ? true : false;
	var maxIndex = Math.max.apply(null, indices);
	var minIndex = Math.min.apply(null, indices);
	if (maxIndex >= vertices.length) {
		console.log ('Maximum index ('+maxIndex+') exceeds vertex count ('+vertices.length+'). No geometry is created');
		return;
	}
	if (useNormals && maxIndex >= normals.length) {
		console.log ('Maximum index ('+maxIndex+') exceeds normal count ('+normals.length+'). No geometry is created');
		return;
	}
	if (useColor && maxIndex >= color.length) {
		console.log ('Maximum index ('+maxIndex+') exceeds color count ('+color.length+'). No geometry is created');
		return;
	}
	if (minIndex < 0) {
		console.log ('Minimum index ('+minIndex+') less than zero. No geometry is created');
		return;
	}
	if (indices.length % 3 != 0) {
		console.log ('Number of indices ('+indices.length+') not divisible by 3. No geometry is created');
		return;
	}

	var geometry = new THREE.Geometry();
	var normal_pz = new THREE.Vector3 (0, 0, 1);
	var normal_mz = new THREE.Vector3 (0, 0, -1);
	for (var i=0; i<vertices.length; i++) {
		geometry.vertices.push (vertices[i]);
	}
	for (var i=0; i<indices.length; i=i+3) {
		face = new THREE.Face3 (indices[i], indices[i+1], indices[i+2]);
		if (useNormals) {
			face.vertexNormals = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
			face.vertexNormals[0].copy(normals[indices[i]]);
			face.vertexNormals[1].copy(normals[indices[i+1]]);
			face.vertexNormals[2].copy(normals[indices[i+2]]);
			//xseen.debug.logInfo ('Face #' + (faceCount+1) + ': (' + v3toString(vertices[indices[i]]) + '); (' + v3toString(vertices[indices[i+1]]) + '); (' + v3toString(vertices[indices[i+2]]) + ')');
		}
		if (useColor) {
			face.vertexColors = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
			face.vertexColors[0].copy(color[indices[i]]);
			face.vertexColors[1].copy(color[indices[i+1]]);
			face.vertexColors[2].copy(color[indices[i+2]]);
			//xseen.debug.logInfo ('...Color: (' + ctoString(color[indices[i]]) + '); (' + ctoString(color[indices[i+1]]) + '); (' + ctoString(color[indices[i+2]]) + ')');
		}
		geometry.faces.push (face);
		faceCount++;
	}
	if (!useNormals) {
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
	}
	xseen.debug.logInfo('Created geometry with ' + faceCount + ' faces');
	geometry.colorsNeedUpdate = true;
	return geometry;
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
// File: nodes/nodes-xseen.js
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


xseen.node.x_Model = {
	'init'	: function (e,p)
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Exteranal Model [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				var uri = xseen.parseUrl (e._xseen.fields.src);
				var loader = xseen.loader[xseen.loadMime[uri.extension].loader];
				loader.load (e._xseen.fields.src, this.loadSuccess({'e':e, 'p':p}), xseen.loadProgress, xseen.loadError);
				e._xseen.requestedUrl = true;
			}
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},

	'fin'	: function (e,p)
		{
		},

					// Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
	'loadSuccess' : function (userdata) {
						var e = userdata.e;
						var p  = userdata.p;
						return function (response) {
							e._xseen.processedUrl = true;
							e._xseen.loadText = response;
							console.log("download successful for "+e.id);
							e._xseen.loadGroup.add(response.scene);		// This works for glTF
							p._xseen.sceneInfo.scene.updateMatrixWorld();
							if (response.animations !== null) {				// This is probably glTF specific
								e._xseen.mixer = new THREE.AnimationMixer (response.scene);
								e._xseen.sceneInfo.mixers.push (e._xseen.mixer);
							} else {
								e._xseen.mixer = null;
							}

							if (e._xseen.fields.playonload != '' && e._xseen.mixer !== null) {			// separate method?
								if (e._xseen.fields.playonload == '*') {			// Play all animations
									response.animations.forEach( function ( clip ) {
										//console.log('  starting animation for '+clip.name);
										if (e._xseen.fields.duration > 0) {clip.duration = e._xseen.fields.duration;}
										e._xseen.mixer.clipAction( clip ).play();
									} );
								} else {											// Play a specific animation
									var clip = THREE.AnimationClip.findByName(response.animations, e._xseen.fields.playonload);
									var action = e._xseen.mixer.clipAction (clip);
									action.play();
								}
							}
						}
					}
};


xseen.node.x_Route = {
	'init'	: function (e,p)
		{
			var dest = e._xseen.fields.destination;
			var hand = e._xseen.fields.handler;
			var externalHandler = false;
			
			// Make sure sufficient data is provided
			if (e._xseen.fields.source == '' || 
				typeof(window[hand]) !== 'function' && 
					(dest == '' || e._xseen.fields.event == '' || e._xseen.fields.field == '')) {
				xseen.debug.logError ('Route node missing field. No route setup. Source: '+e._xseen.fields.source+'.'+e._xseen.fields.event+'; Destination: '+dest+'.'+e._xseen.fields.field+'; Handler: '+hand);
				return;
			} else if (typeof(window[hand]) === 'function') {
				externalHandler = true;
			}
			
			// For toNode routing, check existence of source and destination elements
			var eSource = document.getElementById (e._xseen.fields.source);
			if (! externalHandler) {
				var eDestination = document.getElementById (dest);
				if (typeof(eSource) === 'undefined' || typeof(eDestination) === 'undefined') {
					xseen.debug.logError ('Source or Destination node does not exist. No route setup');
					return;
				}
				// Get field information -- perhaps there is some use in the Animate node?
				var fField = xseen.nodes._getFieldInfo (eDestination.nodeName, e._xseen.fields.field);
				if (typeof(fField) === 'undefined' || !fField.good) {
					xseen.debug.logError ('Destination field does not exist or incorrectly specified. No route setup');
					return;
				}
				// Set up listener on source node for specified event. The listener code is the 'set<field>' method for the
				// node. It is passed the DOM 'event' data structure. Since there may be more than one node of the type
				// specified by 'destination', the event handler is attached to the node in e._xseen.handlers. This is done
				// when the node is parsed
				xseen.Events.addHandler (e, eSource, e._xseen.fields.event, eDestination, fField);

/*
 * External (to XSeen) event handler
 *	TODO: limit the events to those requested if e._xseen.fields.event != 'xseen'
 *	This probably requires an intermediatiary event handler 
 */
			} else {
				var handler = window[hand];
				eSource.addEventListener ('xseen', handler);
			}
		},

	'fin'	: function (e,p)
		{
		},
	'evHandler' : function (u)
		{
			var de = u.e;
			var df = u.f;
			return de._xseen.handlers[df.handlerName];
		},
};
// File: nodes/nodes.js
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


xseen.node.unk_Shape = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
//			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			if (typeof(e._xseen.materialProperty) !== 'undefined') {
				e._xseen.appearance.vertexColors = THREE.VertexColors;
				//e._xseen.appearance.vertexColors = THREE.FaceColors;
				e._xseen.appearance._needsUpdate = true;
				e._xseen.appearance.needsUpdate = true;
			}
			var mesh = new THREE.Mesh (e._xseen.geometry, e._xseen.appearance);
			mesh.userData = e;
			p._xseen.children.push(mesh);
			p._xseen.sceneInfo.selectable.push(mesh);
			mesh = null;
		}
};

xseen.node.grouping_Transform = {
	'init'	: function (e,p) 
		{
			var group = new THREE.Group();
			if (e.nodeName == "TRANSFORM") {
				var rotation = xseen.types.Rotation2Quat(e._xseen.fields.rotation);
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

				e._xseen.animate['translation'] = group.position;
				e._xseen.animate['rotation'] = group.quaternion;
				e._xseen.animate['scale'] = group.scale;
			}
			e._xseen.sceneNode = group;
		},
	'fin'	: function (e,p)
		{
			// Apply transform to all objects in e._xseen.children
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					e._xseen.sceneNode.add(child);
				});
			p._xseen.children.push(e._xseen.sceneNode);
		}
};

xseen.node.networking_Inline = {
	'init'	: function (e,p) 
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				var uri = xseen.parseUrl (e._xseen.fields.url);
				var type = uri.extension;
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Inline content [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				var userdata = {'requestType':'x3d', 'e':e, 'p':p}
				if (type.toLowerCase() == 'json') {
					userdata.requestType = 'json';
					xseen.loadMgr.loadJson (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, userdata);
				} else {
					xseen.loadMgr.loadXml (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, userdata);
				}
				e._xseen.requestedUrl = true;
			}
			//if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e,p)
		{
		},

	'loadSuccess' :
				function (response, userdata, xhr) {
					userdata.e._xseen.processedUrl = true;
					userdata.e._xseen.loadResponse = response;
					console.log("download successful for "+userdata.e.id);
					if (userdata.requestType == 'json') {
						var tmp = {'scene': response};
						response = null;
						response = (new JSONParser()).parseJavaScript(tmp);
					}
					var start = {'_xseen':0};
					var findSceneTag = function (fragment) {
						if (typeof(fragment._xseen) === 'undefined') {fragment._xseen = {'childCount': -1};}
						if (fragment.nodeName.toLowerCase() == 'scene') {
							start = fragment;
							return;
						} else if (fragment.children.length > 0) {
							for (fragment._xseen.childCount=0; fragment._xseen.childCount<fragment.children.length; fragment._xseen.childCount++) {
								findSceneTag(fragment.children[fragment._xseen.childCount]);
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

/*
 * Most of this stuff is only done once per XSeen element. Loading of Inline contents should not
 * repeat the definitions and canvas creation
 */
xseen.node.core_Scene = {
	'DEFAULT'	: {
			'Viewpoint'	: {
				'Position'		: new THREE.Vector3 (0, 0, 10),
				'Orientation'	: '0 1 0 0',		// TODO: fix (and below) when handling orientation
				'Type'			: 'perpsective',
				'Motion'		: 'none',
				'MotionSpeed'	: 1.0,
			},
			'Navigation' : {
				'Speed'		: 1.0,		// 16 spr (1 revolution per 16 seconds), in mseconds.
				'Type'		: 'none',
				'Setup'		: 'none',
			}
		},
	'init'	: function (e,p)
		{
			// Create default Viewpoint and Navigation
			xseen.sceneInfo[0].stacks.Viewpoints.setDefault(
				{
					'position'	: this.DEFAULT.Viewpoint.Position,
					'type'		: this.DEFAULT.Viewpoint.Type,
					'motion'	: this.DEFAULT.Viewpoint.Motion,
					'motionspeed': this.DEFAULT.Viewpoint.MotionSpeed / 1000,
					'domNode'	: e,
					'fields'	: {},
				}
			);
			xseen.sceneInfo[0].stacks.Navigation.setDefault(
				{
					'speed'		: this.DEFAULT.Navigation.Speed / 1000,
					'type'		: this.DEFAULT.Navigation.Type,
					'setup'		: this.DEFAULT.Navigation.Setup,
					'domNode'	: e,
					'fields'	: {},
				}
			);

			var width = e._xseen.sceneInfo.size.width;
			var height = e._xseen.sceneInfo.size.height;
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (width, height);
			var perspectiveCamera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			var orthoCamera = new THREE.OrthographicCamera( 75, width / height, 0.1, 1000 );
			//perspectiveCamera.translateX(this.DEFAULT.Viewpoint.Position.x).translateY(this.DEFAULT.Viewpoint.Position.y).translateZ(this.DEFAULT.Viewpoint.Position.z);	// Default position
			//orthoCamera.translateX(this.DEFAULT.Viewpoint.Position.x).translateY(this.DEFAULT.Viewpoint.Position.y).translateZ(this.DEFAULT.Viewpoint.Position.z);			// Default position
			perspectiveCamera.position.x = this.DEFAULT.Viewpoint.Position.x;	// Default position
			perspectiveCamera.position.y = this.DEFAULT.Viewpoint.Position.y;	// Default position
			perspectiveCamera.position.z = this.DEFAULT.Viewpoint.Position.z;	// Default position
			orthoCamera.position.x = this.DEFAULT.Viewpoint.Position.x;			// Default position
			orthoCamera.position.y = this.DEFAULT.Viewpoint.Position.y;			// Default position
			orthoCamera.position.z = this.DEFAULT.Viewpoint.Position.z;			// Default position

			// Stereo viewing effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(x_renderer);

			e.appendChild (x_renderer.domElement);
			e._xseen.renderer = {
						'canvas' 		: e._xseen.sceneInfo.scene,
						'width'			: width,
						'height'		: height,
						'cameras'		: {
									'perspective'	: perspectiveCamera,
									'ortho'			: orthoCamera,
									'stereo'		: perspectiveCamera,
											},		// Removed .sceneInfo camera because this node defines the camera
						'effects'		: x_effect,
						'renderEffects'	: {
									'normal'		: x_renderer,
									'perspective'	: x_renderer,
									'ortho'			: x_renderer,
									'stereo'		: x_effect,
											},
						'activeRender'	: {},
						'activeCamera'	: {},
						'controls'		: {},		// Used for navigation
						};
			e._xseen.renderer.activeRender = e._xseen.renderer.renderEffects.normal;
			e._xseen.renderer.activeCamera = e._xseen.renderer.cameras.perspective;
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
//			e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );
//			xseen.debug.logInfo("Rendered all elements -- Starting animation");
/*
 * TODO: Need to get current top-of-stack for all stack-bound nodes and set them as active.
 *	This only happens the initial time for each XSeen tag in the main HTML file
 *
 *	At this time, only Viewpoint is stack-bound. Probably need to stack just the <Viewpoint>._xseen object.
 *	Also, .fields.position is the initial specified location; not the navigated/animated one
 */
			var vp = xseen.sceneInfo[0].stacks.Viewpoints.getActive();
			var nav = xseen.sceneInfo[0].stacks.Navigation.getActive();
			var currentCamera = e._xseen.renderer.activeCamera;
			var currentRenderer = e._xseen.renderer.activeRender;
			currentCamera.position.x = vp.position.x;
			currentCamera.position.y = vp.position.y;
			currentCamera.position.z = vp.position.z;
			e._xseen.renderer.controls = xseen.Navigation.setup[nav.setup] (currentCamera, currentRenderer);
			xseen.debug.logInfo("Ready to kick off rendering loop");
			xseen.renderFrame();
		},

};

xseen.node.env_Background = {
	'init'	: function (e,p) 
		{
			var color = new THREE.Color(e._xseen.fields.skycolor[0], e._xseen.fields.skycolor[1], e._xseen.fields.skycolor[2]);
			var textureCube = new THREE.CubeTextureLoader()
									.load ([e._xseen.fields.srcright,
											e._xseen.fields.srcleft,
											e._xseen.fields.srctop,
											e._xseen.fields.srcbottom,
											e._xseen.fields.srcfront,
											e._xseen.fields.srcback],
											this.loadSuccess({'e':e, 'p':p})
										);
			e._xseen.sceneInfo.scene.background = color;
/*
			var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
			var size = 1;
			//var geometry = new THREE.BoxGeometry(200, 200, 2);
			var geometry = new THREE.Geometry();
			geometry.vertices.push (
							new THREE.Vector3(-size, -size,  size),
							new THREE.Vector3( size, -size,  size),
							new THREE.Vector3( size, -size, -size),
							new THREE.Vector3(-size, -size, -size),
							new THREE.Vector3(-size,  size,  size),
							new THREE.Vector3( size,  size,  size),
							new THREE.Vector3( size,  size, -size),
							new THREE.Vector3(-size,  size, -size)
									);

			geometry.faces.push (	// external facing geometry
							new THREE.Face3(0, 1, 5),
							new THREE.Face3(0, 5, 4),
							new THREE.Face3(1, 2, 6),
							new THREE.Face3(1, 6, 5),
							new THREE.Face3(2, 3, 7),
							new THREE.Face3(2, 7, 6),
							new THREE.Face3(3, 0, 4),
							new THREE.Face3(3, 4, 7),
							new THREE.Face3(4, 5, 6),
							new THREE.Face3(4, 6, 7),
							new THREE.Face3(0, 2, 1),
							new THREE.Face3(0, 3, 2),
									);
			geometry.computeBoundingSphere();
			var mesh = new THREE.Mesh (geometry, material);
			e._xseen.sceneInfo.element._xseen.renderer.canvas.add(mesh);
*/
		},

	'fin'	: function (e,p)
		{
			p._xseen.appearance = e._xseen.material;
		},

	'loadSuccess' : function (userdata)
		{
			var e = userdata.e;
			var p  = userdata.p;
			return function (textureCube)
			{
				e._xseen.processedUrl = true;
				e._xseen.loadTexture = textureCube;
				e._xseen.sceneInfo.scene.background = textureCube;
			}
		},

};
// File: nodes/nodes_Animate.js
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

 // Node definition code (just stubs right now...)


xseen.node.x_Animate = {
	'init'	: function (e,p)
		{
			var delay = e._xseen.fields.delay * 1000;		// Convert to milliseconds
			var duration = e._xseen.fields.duration * 1000;	// Convert to milliseconds
			var repeat = (e._xseen.fields.repeat < 0) ? Infinity : e._xseen.fields.repeat;
			var interpolator = e._xseen.fields.interpolator;
			var easing = e._xseen.fields.easing;
			
			var fields = xseen.parseTable[p.localName.toLowerCase()].fields;
			var fieldIndex = xseen.parseTable[p.localName.toLowerCase()].fieldIndex;
			var toField = e._xseen.fields.field;
			var toFieldIndex = fieldIndex[toField];
			if (typeof(fields[toFieldIndex]) === 'undefined') {
				xseen.debug.logInfo("Field '" + toField + "' not found in parent (" + p.localName.toLowerCase() + "). No animation performed.");
				return;
			}
			var fieldObject = fields[toFieldIndex].clone().setFieldName('to');	// Parse table entry for 'toField'
			var to = xseen.nodes._parseField(fieldObject, e);	// Parsed data  -- need to convert to THREE format

// Convert 'to' to the datatype of 'field' and set interpolation type.
			var interpolation;
			if (fieldObject.type == 'SFVec3f') {
				interpolation = TWEEN.Interpolation.Linear;
				to = xseen.types.Vector3(to);
				xseen.debug.logInfo("Interpolating field '" + toField + "' as 3-space.");

			} else if (fieldObject.type == 'SFColor') {
				interpolation = this.Interpolator.color;
				to = new THREE.Color (xseen.types.Color3toInt(to));
				xseen.debug.logInfo("Interpolation field '" + toField + "' as color.");

			} else if (fieldObject.type == 'SFRotation') {
				interpolation = this.Interpolator.slerp;
				to = xseen.types.Rotation2Quat(to);
				xseen.debug.logInfo("Interpolation field '" + toField + "' as rotation.");

			} else {
				xseen.debug.logInfo("Field '" + toField + "' not converted to THREE format. No animation performed.");
				return;
			}
			var fieldTHREE = p._xseen.animate[toField];			// THREE field for animation

			var tween = new TWEEN.Tween(fieldTHREE)
								.to(to, duration)
								.delay(delay)
								.repeat(repeat)
								.interpolation(interpolation);
			var easingType = e._xseen.fields.easingtype;
			easingType = easingType.charAt(0).toUpperCase() + easingType.slice(1);
			easing = (easingType != 'Linear' && easing == '') ? 'inout' : easing;
			if (easing != '') {
				easing = easing.replace('in', 'In').replace('out', 'Out');
				easingType = (easingType == 'Linear') ? 'Quadratic' : easingType;
				e._xseen.fields.easing = easing;
				e._xseen.fields.easingtype = easingType;
				tween.easing(TWEEN.Easing[easingType][easing]);
			}

/*
 * Put animation-specific data in node (e._xseen) so it can be accessed on events (through 'this')
 *	This includes initial value and field
 *	All handlers (goes into .handlers)
 *	TWEEN object
 */
			e._xseen.initialValue = fieldTHREE.clone();
			e._xseen.animatingField = fieldTHREE;
			e._xseen.handlers = {};
			e._xseen.handlers.setstart = this.setstart;
			e._xseen.handlers.setstop = this.setstop;
			e._xseen.handlers.setpause = this.setpause;
			e._xseen.handlers.setresetstart = this.setresetstart;
			e._xseen.animating = tween;
			p._xseen.animation.push (tween);
			tween.start();
		},
	'fin'	: function (e,p) {},
	'setstart'	: function (ev)
		{
			console.log ('Starting animation');
			this.destination._xseen.animating.start();
		},
	'setstop'	: function (ev) 
		{
			console.log ('Stopping animation');
			this.destination._xseen.animating.stop();
		},
/*
 * TODO: Update TWEEN to support real pause & resume. 
 *	Pause needs to hold current position
 *	Resume needs to restart the timer to current time so there is no "jump"
 */
	'setpause'	: function (ev) 
		{
			console.log ('Pausing (really stopping) animation');
			this.destination._xseen.animating.stop();
		},
	'setresetstart'	: function (ev) 	// TODO: Create seperate 'reset' method
		{
			console.log ('Reset and start animation');
			this.destination._xseen.animatingField = this.destination._xseen.initialValue;
			this.destination._xseen.animating.start();
		},
	
/*
 * Various interpolator functions for use with different data types
 * All are designed to be used within TWEEN and take two arguments
 *	v	A vector of way points (key values) that define the interpolated path
 *	k	The interpolating factor that defines how far along the path for the current result
 *
 * Functions
 *	slerp - Linear in quaterian space (though not yet)
 *	color - Linear in color space (currently HSL as used by THREE)
 *
 */
	'Interpolator'	: {
		'slerp'	: function (v,k)
			{
				var m = v.length - 1;
				var f = m * k;
				var i = Math.floor(f);
	
				if (k < 0) {
					return v[0].slerp(v[1], f);
				}

				if (k > 1) {
					return v[m].slerp(v[m-1], m-f);
				}

				return v[i].slerp (v[i + 1 > m ? m : i + 1], f-i);
			},
		'color' : function (v,k)
			{
				var m = v.length - 1;
				var f = m * k;
				var i = Math.floor(f);
				var fn = this.slerpCompute;
	
				if (k < 0) {
					return v[0].lerp(v[1], f);
				}
				if (k > 1) {
					return v[m].lerp(v[m-1], m-f);
				}
				return v[i].lerp (v[i + 1 > m ? m : i + 1], f - i);
			},
	},
};
// File: nodes/_Definitions-aframe.js
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

/*
 * Asset management system nodes
 */
xseen.nodes._defineNode('a-assets', 'A-Frame', 'af_Assets')
					.addNode();
xseen.nodes._defineNode('a-asset-item', 'A-Frame', 'af_AssetItem')
					.addField('src', 'SFString', '')
					.addNode();
xseen.nodes._defineNode('a-mixin', 'A-Frame', 'af_Mixin')
					.addField('*', 'SFString', '')
					.addNode();
// File: nodes/_Definitions-x3d.js
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
	.addField('size', 'SFVec3f', [1,1,1])
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
	.addField({name:'diffuseColor', datatype:'SFColor', defaultValue:[.8,.8,.8], animatable:true})
	.addField({name:'emissiveColor',datatype: 'SFColor', defaultValue:[0,0,0], animatable:true})
	.addField({name:'specularColor', datatype:'SFColor', defaultValue:[0,0,0], animatable:true})
	.addField({name:'transparency', datatype:'SFFloat', defaultValue:'0', animatable:true})
	.addField({name:'shininess', datatype:'SFFloat', defaultValue:'0', animatable:true})
	.addNode();

xseen.nodes._defineNode ('Transform', 'Grouping', 'grouping_Transform')
	.addField({name:'translation', datatype:'SFVec3f', defaultValue:[0,0,0], animatable:true})
	.addField({name:'scale', datatype:'SFVec3f', defaultValue:[1,1,1], animatable:true})
	.addField({name:'rotation', datatype:'SFRotation', defaultValue:xseen.types.SFRotation('0 1 0 0',''), animatable:true})
	.addNode();
xseen.nodes._defineNode ('Group', 'Grouping', 'grouping_Transform')
	.addNode();

xseen.nodes._defineNode ('Light', 'Lighting', 'lighting_Light')
	.addField('direction', 'SFVec3f', [0,0,-1])									// DirectionalLight
	.addField('location', 'SFVec3f', [0,0,0])									// PointLight & SpotLight
	.addField('radius', 'SFFloat', '100')										// PointLight & SpotLight
	.addField('attenuation', 'SFVec3f', [1,0,0])								// PointLight & SpotLight
	.addField('beamWidth', 'SFFloat', '0.78539816339744830961566084581988')		// SpotLight
	.addField('cutOffAngle', 'SFFloat', '1.5707963267948966192313216916398')	// SpotLight
	.addField('color', 'SFColor', [1,1,1])										// General
	.addField('intensity', 'SFFloat', '1')										// General
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'Directional', enumerated:['Directional', 'Spot', 'Point'], animatable:true})
	.addNode();
xseen.nodes._defineNode ('DirectionalLight', 'Lighting', 'lighting_Light')
	.addField('direction', 'SFVec3f', [0,0,-1])
	.addField('color', 'SFColor', [1,1,1])
	.addField('intensity', 'SFFloat', '1')
	.addField('type', 'SFString', 'Directional')
	.addNode();
xseen.nodes._defineNode ('PointLight', 'Lighting', 'lighting_Light')
	.addField('location', 'SFVec3f', [0,0,0])
	.addField('radius', 'SFFloat', '100')
	.addField('attenuation', 'SFVec3f', [1,0,0])
	.addField('color', 'SFColor', [1,1,1])
	.addField('intensity', 'SFFloat', '1')
	.addField('type', 'SFString', 'Point')
	.addNode();
xseen.nodes._defineNode ('SpotLight', 'Lighting', 'lighting_Light')
	.addField('direction', 'SFVec3f', [0,0,-1])
	.addField('radius', 'SFFloat', '100')
	.addField('attenuation', 'SFVec3f', [1,0,0])
	.addField('beamWidth', 'SFFloat', '0.78539816339744830961566084581988')		// pi/4
	.addField('cutOffAngle', 'SFFloat', '1.5707963267948966192313216916398')	// pi/2
	.addField('color', 'SFColor', [1,1,1])
	.addField('intensity', 'SFFloat', '1')
	.addField('type', 'SFString', 'Spot')
	.addNode();

xseen.nodes._defineNode ('Viewpoint', 'Controls', 'unk_Viewpoint')
	.addField('position', 'SFVec3f', '0 0 10')
	.addField('orientation', 'SFRotation', xseen.types.SFRotation('0 1 0 0',''))
	.addField('description', 'SFString', '')
	.addField({name:'cameratype', datatype:'EnumerateString', defaultValue:'perspective', enumerated:['perspective', 'stereo', 'orthographic'], animatable:false})
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'perspective', enumerated:['perspective', 'stereo', 'orthographic'], animatable:false})
	.addField({name:'motion', datatype:'EnumerateString', defaultValue:'none', enumerated:['none', 'turntable', 'tilt'], animatable:false})
	.addField('motionspeed', 'SFFloat', 16)
	.addField('active', 'SFBool', true)				// incoming event
	.addNode();
xseen.nodes._defineNode ('NavigationMode', 'Controls', 'controls_Navigation')
	.addField('speed', 'SFFloat', 1.)
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'none', enumerated:['none', 'orbit', 'fly', 'examine', 'trackball'], animatable:false})
	.addNode();
xseen.nodes._defineNode ('Camera', 'Controls', 'unk_Viewpoint')
	.addField('position', 'SFVec3f', [0,0,10])
	.addField('orientation', 'SFRotation', xseen.types.SFRotation('0 1 0 0',''))
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
xseen.nodes._defineNode ('ImageTexture', 'Appearance', 'appearance_ImageTexture')
	.addField('url', 'SFString', '')
	.addField('repeatS', 'SFBool', true)
	.addField('repeatT', 'SFBool', true)
	.addNode();

xseen.nodes._defineNode ('Shape', 'Shape', 'unk_Shape')
	.addNode();
xseen.nodes._defineNode('Background', 'Environmental', 'env_Background')
	.addField('skyColor', 'SFColor', [0,0,0])
	.addField('srcFront', 'SFString', '')
	.addField('srcBack', 'SFString', '')
	.addField('srcTop', 'SFString', '')
	.addField('srcBottom', 'SFString', '')
	.addField('srcLeft', 'SFString', '')
	.addField('srcRight', 'SFString', '')
	.addField('backgroundIsCube', 'SFBool', 'true')
	.addNode();

xseen.nodes._defineNode('TriangleSet', 'Geometry', 'geometry_TriangleSet')
	.addField('ccw', 'SFBool', 'true')
	.addField('colorPerVertex', 'SFBool', 'true')
	.addField('solid', 'SFBool', 'true')
	.addNode();
xseen.nodes._defineNode('IndexedTriangleSet', 'Geometry', 'geometry_IndexedTriangleSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addField('index', 'MFInt', '')
	.addNode();
xseen.nodes._defineNode('Coordinate', 'Geometry', 'geometry_Coordinate')
	.addField('point', 'MFVec3f', [])
	.addNode();
xseen.nodes._defineNode('Normal', 'Geometry', 'geometry_Normal')
	.addField('vector', 'MFVec3f', [])
	.addNode();
xseen.nodes._defineNode('Color', 'Geometry', 'geometry_Color')
	.addField('color', 'MFColor', [])
	.addNode();
xseen.nodes._defineNode('IndexedFaceSet', 'Geometry', 'geometry_IndexedFaceSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addField('coordIndex', 'MFInt', '')
	.addNode();
xseen.nodes._defineNode('IndexedQuadSet', 'Geometry', 'geometry_IndexedQuadSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addField('index', 'MFInt', '')
	.addNode();
xseen.nodes._defineNode('QuadSet', 'Geometry', 'geometry_QuadSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addNode();

//xseen.nodes._dumpTable();
// File: nodes/_Definitions-xseen.js
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

xseen.nodes._defineNode('model', 'XSeen', 'x_Model')
	.addField('src', 'SFString', '')
	.addField('playonload', 'SFString', '')
	.addField('duration', 'SFFloat', '-1')
	.addNode();

xseen.nodes._defineNode('animate', 'XSeen', 'x_Animate')
	.addField('field', 'SFString', '')
	.addField('to', 'MFFloat', '')				// Needs to be 'field' datatype. That is not known until node-parse. For now insist on numeric array
	.addField('delay', 'SFTime', 0)
	.addField('duration', 'SFTime', 0)
	.addField('repeat', 'SFInt', 0)
	.addField({name:'interpolator', datatype:'EnumerateString', defaultValue:'position', enumerated:['position', 'rotation', 'color'], animatable:false})
	.addField({name:'Easing', datatype:'EnumerateString', defaultValue:'', enumerated:['', 'in', 'out', 'inout'], animatable:false})
	.addField({name:'EasingType', datatype:'EnumerateString', defaultValue:'linear', enumerated:['linear', 'quadratic', 'sinusoidal', 'exponential', 'elastic', 'bounce'], animatable:false})
	.addField('start', 'SFBool', true)				// incoming event, need to set timer trigger
	.addField('stop', 'SFBool', true)				// incoming event, need to set timer trigger
	.addField('resetstart', 'SFBool', true)			// incoming event, need to set timer trigger
	.addField('pause', 'SFBool', true)				// incoming event, need to set timer trigger
	.addNode();

xseen.nodes._defineNode('route', 'XSeen', 'x_Route')
	.addField('source', 'SFString', '')
	.addField('event', 'SFString', '')
	.addField('destination', 'SFString', '')
	.addField('field', 'SFString', '')
	.addField('handler', 'SFString', '')
	.addNode();


// Dump parse table
//xseen.nodes._dumpTable();