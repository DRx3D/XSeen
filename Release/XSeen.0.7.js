/*
 *  XSeen V0.7.32-rc1+7_2851318
 *  Built Sat Jul 14 20:51:34 2018
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
// File: ./CameraManager.js
/*
 * XSeen JavaScript library
 *
 * (c)2018, Daly Realism, Los Angeles
 *
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen Camera Manager.
 * This object is the manager for all XSeen cameras.
 *
 * provides method for the addition and selection of a camera for scene viewing
 *
 *
 *
 */

var XSeen = XSeen || {};
XSeen.CameraManager = {
		'PRIORITY_MINIMUM'	: 0,
		'PRIORITY_DEFAULT'	: 1,
		'DefinedCameras'	: [],		// Contains references to camera nodes ...[priority][order]
		'CurrentNode'		: null,
		
/*
 *
 */
		'add'				: function (camera)
					{
						console.log ('Adding camera#' + camera.id + ' to the list');
						if (typeof(this.DefinedCameras[camera._xseen.priority]) == 'undefined') {this.DefinedCameras[camera._xseen.priority] = [];}
						this.DefinedCameras[camera._xseen.priority].push (camera);
						camera._xseen.ndxCamera = this.DefinedCameras[camera._xseen.priority].length - 1;
					},
					
		'next'				: function ()
					{
						for (var p=this.DefinedCameras.length-1; p>=this.PRIORITY_MINIMUM; p--) {
							if (typeof(this.DefinedCameras[p]) != 'undefined') {
								for (var ii=0; ii<this.DefinedCameras[p].length; ii++) {
									if (this.DefinedCameras[p][ii]._xseen.available) {return this.DefinedCameras[p][ii];}
								}
							}
						}
						return this.DefinedCameras[this.PRIORITY_MINIMUM][0];	// System default
					},
					
		'setNext'			: function ()
					{
						var camera = this.next();
						if (this.CurrentNode !== null) {this.CurrentNode._xseen.active = false;}
						camera._xseen.active = true;
						camera._xseen.sceneInfo.Camera.position.set (
									camera._xseen.attributes.position.x,
									camera._xseen.attributes.position.y,
									camera._xseen.attributes.position.z);
						camera._xseen.sceneInfo.Camera.lookAt(0,0,0);		// Look at origin. Seems to be required for object type.
						// TODO: A number of other things need to be set/changed (tracking, type, etc.)
						this.CurrentNode = camera;
					}
};
// File: ./Constants.js
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
 *	Define various constants for use within XSeen.
 *	Constants include conversion factors and colors (official color names with their hex equivalents)
 *	ColorsCS is the case sensitive (official) version
 *	Colors is the lowercase version
 */

XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
XSeen.DefineConstants = function () {
	var ColorsCS = new Object(), Colors = new Object();
	ColorsCS = {
		'AliceBlue'			: 0xF0F8FF,
		'AntiqueWhite'		: 0xFAEBD7,
		'Aqua'				: 0x00FFFF,
		'Aquamarine'		: 0x7FFFD4,
		'Azure'				: 0xF0FFFF,
		'Beige'				: 0xF5F5DC,
		'Bisque'			: 0xFFE4C4,
		'Black'				: 0x000000,
		'BlanchedAlmond'	: 0xFFEBCD,
		'Blue'				: 0x0000FF,
		'BlueViolet'		: 0x8A2BE2,
		'Brown'				: 0xA52A2A,
		'BurlyWood'			: 0xDEB887,
		'CadetBlue'			: 0x5F9EA0,
		'Chartreuse'		: 0x7FFF00,
		'Chocolate'			: 0xD2691E,
		'Coral'				: 0xFF7F50,
		'CornflowerBlue'	: 0x6495ED,
		'Cornsilk'			: 0xFFF8DC,
		'Crimson'			: 0xDC143C,
		'Cyan'				: 0x00FFFF,
		'DarkBlue'			: 0x00008B,
		'DarkCyan'			: 0x008B8B,
		'DarkGoldenRod'		: 0xB8860B,
		'DarkGray'			: 0xA9A9A9,
		'DarkGrey'			: 0xA9A9A9,
		'DarkGreen'			: 0x006400,
		'DarkKhaki'			: 0xBDB76B,
		'DarkMagenta'		: 0x8B008B,
		'DarkOliveGreen'	: 0x556B2F,
		'DarkOrange'		: 0xFF8C00,
		'DarkOrchid'		: 0x9932CC,
		'DarkRed'			: 0x8B0000,
		'DarkSalmon'		: 0xE9967A,
		'DarkSeaGreen'		: 0x8FBC8F,
		'DarkSlateBlue'		: 0x483D8B,
		'DarkSlateGray'		: 0x2F4F4F,
		'DarkSlateGrey'		: 0x2F4F4F,
		'DarkTurquoise'		: 0x00CED1,
		'DarkViolet'		: 0x9400D3,
		'DeepPink'			: 0xFF1493,
		'DeepSkyBlue'		: 0x00BFFF,
		'DimGray'			: 0x696969,
		'DimGrey'			: 0x696969,
		'DodgerBlue'		: 0x1E90FF,
		'FireBrick'			: 0xB22222,
		'FloralWhite'		: 0xFFFAF0,
		'ForestGreen'		: 0x228B22,
		'Fuchsia'			: 0xFF00FF,
		'Gainsboro'			: 0xDCDCDC,
		'GhostWhite'		: 0xF8F8FF,
		'Gold'				: 0xFFD700,
		'GoldenRod'			: 0xDAA520,
		'Gray'				: 0x808080,
		'Grey'				: 0x808080,
		'Green'				: 0x008000,
		'GreenYellow'		: 0xADFF2F,
		'HoneyDew'			: 0xF0FFF0,
		'HotPink'			: 0xFF69B4,
		'IndianRed '		: 0xCD5C5C,
		'Indigo '			: 0x4B0082,
		'Ivory'				: 0xFFFFF0,
		'Khaki'				: 0xF0E68C,
		'Lavender'			: 0xE6E6FA,
		'LavenderBlush'		: 0xFFF0F5,
		'LawnGreen'			: 0x7CFC00,
		'LemonChiffon'		: 0xFFFACD,
		'LightBlue'			: 0xADD8E6,
		'LightCoral'		: 0xF08080,
		'LightCyan'			: 0xE0FFFF,
		'LightGoldenRodYellow'	: 0xFAFAD2,
		'LightGray'			: 0xD3D3D3,
		'LightGrey'			: 0xD3D3D3,
		'LightGreen'		: 0x90EE90,
		'LightPink'			: 0xFFB6C1,
		'LightSalmon'		: 0xFFA07A,
		'LightSeaGreen'		: 0x20B2AA,
		'LightSkyBlue'		: 0x87CEFA,
		'LightSlateGray'	: 0x778899,
		'LightSlateGrey'	: 0x778899,
		'LightSteelBlue'	: 0xB0C4DE,
		'LightYellow'		: 0xFFFFE0,
		'Lime'				: 0x00FF00,
		'LimeGreen'			: 0x32CD32,
		'Linen'				: 0xFAF0E6,
		'Magenta'			: 0xFF00FF,
		'Maroon'			: 0x800000,
		'MediumAquaMarine'	: 0x66CDAA,
		'MediumBlue'		: 0x0000CD,
		'MediumOrchid'		: 0xBA55D3,
		'MediumPurple'		: 0x9370DB,
		'MediumSeaGreen'	: 0x3CB371,
		'MediumSlateBlue'	: 0x7B68EE,
		'MediumSpringGreen'	: 0x00FA9A,
		'MediumTurquoise'	: 0x48D1CC,
		'MediumVioletRed'	: 0xC71585,
		'MidnightBlue'		: 0x191970,
		'MintCream'			: 0xF5FFFA,
		'MistyRose'			: 0xFFE4E1,
		'Moccasin'			: 0xFFE4B5,
		'NavajoWhite'		: 0xFFDEAD,
		'Navy'				: 0x000080,
		'OldLace'			: 0xFDF5E6,
		'Olive'				: 0x808000,
		'OliveDrab'			: 0x6B8E23,
		'Orange'			: 0xFFA500,
		'OrangeRed'			: 0xFF4500,
		'Orchid'			: 0xDA70D6,
		'PaleGoldenRod'		: 0xEEE8AA,
		'PaleGreen'			: 0x98FB98,
		'PaleTurquoise'		: 0xAFEEEE,
		'PaleVioletRed'		: 0xDB7093,
		'PapayaWhip'		: 0xFFEFD5,
		'PeachPuff'			: 0xFFDAB9,
		'Peru'				: 0xCD853F,
		'Pink'				: 0xFFC0CB,
		'Plum'				: 0xDDA0DD,
		'PowderBlue'		: 0xB0E0E6,
		'Purple'			: 0x800080,
		'RebeccaPurple'		: 0x663399,
		'Red'				: 0xFF0000,
		'RosyBrown'			: 0xBC8F8F,
		'RoyalBlue'			: 0x4169E1,
		'SaddleBrown'		: 0x8B4513,
		'Salmon'			: 0xFA8072,
		'SandyBrown'		: 0xF4A460,
		'SeaGreen'			: 0x2E8B57,
		'SeaShell'			: 0xFFF5EE,
		'Sienna'			: 0xA0522D,
		'Silver'			: 0xC0C0C0,
		'SkyBlue'			: 0x87CEEB,
		'SlateBlue'			: 0x6A5ACD,
		'SlateGray'			: 0x708090,
		'SlateGrey'			: 0x708090,
		'Snow'				: 0xFFFAFA,
		'SpringGreen'		: 0x00FF7F,
		'SteelBlue'			: 0x4682B4,
		'Tan'				: 0xD2B48C,
		'Teal'				: 0x008080,
		'Thistle'			: 0xD8BFD8,
		'Tomato'			: 0xFF6347,
		'Turquoise'			: 0x40E0D0,
		'Violet'			: 0xEE82EE,
		'Wheat'				: 0xF5DEB3,
		'White'				: 0xFFFFFF,
		'WhiteSmoke'		: 0xF5F5F5,
		'Yellow'			: 0xFFFF00,
		'YellowGreen'		: 0x9ACD32,
	};
/*
	ColorsCS.forEach (function(key, value) {
		Colors{key.toLowerCase()} = value;
	});
 */
	var key, value;
	for (const key in ColorsCS) {
		Colors[key.toLowerCase()] = ColorsCS[key];
	}
	return {
			'Deg2Rad'	: Math.PI / 180,
			'Rad2Deg'	: 180.0 / Math.PI,
			'ColorsCS'	: ColorsCS,
			'Colors'	: Colors,
			};		
}
// File: ./DisplayControl.js
/**
 * Handles creation and action of User Interface controls for display changes that require
 * user input/action. This includes FullScreen and VR.
 *
 * Some of the designs can be overridden by adding user-defined method by calling XSeen.DisplayControl.UserButton (tbd).
 * The user-defined method is called with one arguments - an HTML 'div' element that is the button to be
 * displayed. No child elements may be added as these methods set innerHTML according to the request, device, and
 * current state. See 'stylizeElement' for the list of styles that are set/defined.
 *
 * @author DrxR / http://xseen.org
 *
 *  Copied, extracted, and inspired by previous
 * @author mrdoob / http://mrdoob.com
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Based on @tojiro's vr-samples-utils.js
 *
 *	Downloaded 2017-11-02 @13:31
 *	Redeveloped for XSeen 2018-06-15
 */

XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
XSeen.DisplayControl = {
	
/*
 * Primary entry for handling buttons. This is only called when the device supports the requested
 *	functionality. If an HTML element is supplied, that is modified rather than a new element being created.
 *	The text associated with this element is always appropriate for the requested functionality. This can be
 *	modified prior to adding the element to the HTML document.
 */
	'buttonCreate'			: function (buttonType, node, button) {
		var button = document.createElement( 'div' );
		//button.style.display = 'none';
		button.innerHTML = "Requesting '"  + buttonType + "'";
		button.style.width += 6 + buttonType.length/2 + 'em';
		this.stylizeElement( button );
		if (buttonType == 'fullscreen') {
			this.buttonFullScreen (button, node);
		} else if (buttonType == 'vr') {
			this.buttonVR (button, node);
		}
		
		button._checkButtonActive = this._checkButtonActive;
		button._checkButtonActive (button);

		return button;
	},
	
	// Requested UX does not exist (within this interface/API)
	'buttonNotSupported'	: function (buttonType, button) {
		var response = document.createElement( 'div' );
		this.stylizeElement( response );
		response.innerHTML = buttonType.toUpperCase() + ' is not supported';
		response.style.width = '13em'
		response.style.cursor = 'default';
		return response;
	},
	
	// Of the button is active, handle the ':hover' pseudo-class
	'_checkButtonActive'	: function (button) {
		if (button.dataset._active != 'false') {
			button.onmouseenter = function(event) {
					event.currentTarget.style.opacity = 1.0;
				};
			button.onmouseleave = function(event) {
					event.currentTarget.style.opacity = 0.5;
				};

// Button no longer active, undefine event handlers
		} else {
			button.onmouseenter = null;
			button.onmouseleave = null;
			button.style.opacity = 0.5;
		}
	},

	
/*
 * Code for creating stylized button. This can be overridden
 * Many of these parameters are sized for the XSeen image. They need to remain coordinated
 * Only text color is supported for CusorOver (hover)
 * The width of this element changes depending on the inserted text
 */
	'stylizeElement'	: function (button) {
		button.style.backgroundColor	= '#212214';
		button.style.height				= '24px';
		button.style.backgroundImage	= 'url(XSeen-64x24.png)';
		button.style.backgroundRepeat	= 'no-repeat';
		button.style.paddingLeft		= '70px';
		button.style.borderRadius		= '4px';
		//button.style.width				= '6em';
		button.style.cursor				= 'pointer';
		button.style.fontFamily			= 'Arial,Helvetica,"sans serif"';
		button.style.fontSize			= '18px';
		button.style.textAlign			= 'center';
		button.style.opacity			= 0.5;
		//button.dataset._colorHighlight	= '#fff';			// on CursorOver (hover)
		button.dataset._colorDefault	= '#aaa';			// default color
		button.dataset._active			= false;			// button not active
		button.style.color				= button.dataset._colorDefault;
	},

// Add features necessary to make the transition to VR	
	'buttonVR'				: function (button, node) {
		
		showEnterVR = function (button, display ) {
			button.innerHTML		= "Enter VR";
			button.style.width		= '7em';
			button.style.cursor		= 'pointer';
			button.dataset._active	= true;			// button active
			button._checkButtonActive (button);		

/*
 * Set up click event handler for entering or exiting VR
 * When clicked, if in VR, the system will exit.
 * If not in VR, then it will set up everything to do so.
 *
 * renderer is the THREE (or some other) renderer object with the following elements
 * renderer.domElement is the Canvas element
 * renderer.vr is the VR element (needs .vr.setDevice() method)
 */
			
			if (display && button) {	// Display & button defined, so go ahead and create event handler
				button.onclick = function(ev) {
					console.log ('Currently Presenting VR: |' + display.isPresenting + '|');
					display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: renderer.domElement } ] );
					renderer.vr.setDevice( display );
					console.log ('VR state changed');
				};
			}
		}

		showVRNotFound = function () {
			button.innerHTML		= "VR Not Found";
			button.style.width		= '7em';
			button.style.cursor		= 'default';
			button.dataset._active	= false;			// button active
			button._checkButtonActive (button);			

			button.onmouseenter = null;
			button.onmouseleave = null;
			button.onclick = null;
			//renderer.vr.setDevice( null );
		}

/*
 * Define event handlers for various VR display events
 *
 *	'vrdisplayconnect'			The browser connects to a VR device (show Enter)
 *	'vrdisplaydisconnect'		A VR device disconnects from the browser (show Not Found)
 *	'vrdisplaypresentchange'	The presentation state of a VR device changes (show Enter/Exit as appropriate)
 */
		window.addEventListener( 'vrdisplayconnect', function ( event ) {
			showEnterVR( event.display );		// Problematic because need to locate 'button'
		}, false );

		window.addEventListener( 'vrdisplaydisconnect', function ( event ) {
			showVRNotFound();
		}, false );

		window.addEventListener( 'vrdisplaypresentchange', function ( event ) {
			button.innerHTML = event.display.isPresenting ? 'EXIT VR' : 'ENTER VR';	// See above
		}, false );

/*
 * Determine if system is currently capable of going into VR.
 * If so, display enter button. If not, display not available
 *
 */ 
		navigator.getVRDisplays()
			.then( function ( displays ) {
				if (true ||  displays.length > 0 ) {
					console.log ("Showing 'Enter VR'");
					button.dataset._active	= true;			// button active
					showEnterVR(button, null);
					//showEnterVR(button, displays[ 0 ] );
					return true;

				} else {
					showVRNotFound ();
					console.log ("Showing 'VR Not Found'");
					return false;
				}
			} );
		return button;

	},
	
	'buttonFullScreen'		: function (button, node) {
		button.innerHTML		= "Enter FullScreen";
		button.style.width		= '9em';
		button.dataset._active	= true;			// button active
		button._fullScreenNode 	= node;
		node._requestFullscreen	= this._requestFullscreen;
		node._exitFullscreen	= this._exitFullscreen;
		node._fullscreenButton	= button;
		document.documentElement._isFullScreen		= function () {
			var fullScreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
			if (typeof(fullScreenElement) != 'undefined') {return true;}
			return false;
		};
		document.documentElement._fullScreenElement	= function () {
			return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
		};
		

/*
 * Create event listener for button click. 
 * The polyfill document function (document..._isFullScreen()) determines what to do
 */
		button.addEventListener( 'click', function ( event ) {
			var e = document.documentElement._fullScreenElement();
			if (document.documentElement._isFullScreen()) {
				event.currentTarget._fullScreenNode._exitFullscreen.call(document);
			} else {
				event.currentTarget._fullScreenNode._requestFullscreen();
				document.documentElement._XSeenButton = event.currentTarget;	// Save the button for changing the label
			}
		}, false );
/*
 * Catch the fullscreen event (browser-specific) and make the necessary changes
 */
		document.addEventListener( this._fullscreenEventName, function ( event ) {
			if ( document.documentElement._isFullScreen() ) {
				console.log('Need to exit');
				document.documentElement._XSeenButton.innerHTML = 'Exit FullScreen';
			
			} else {	// Exit from full screen
				console.log('Need to enter');
				document.documentElement._XSeenButton.innerHTML = 'Enter FullScreen';
				document.documentElement._XSeenButton = null;
			}
		}, false );
	},

/*
 * Polyfill for browser differences for handling full screen requests, events, and elements
 */
	'_requestFullscreen'	: document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen || document.documentElement.mozRequestFullScreen || document.documentElement.msRequestFullscreen,
	'_exitFullscreen'		: document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen,
	'_fullscreenEventName'	: 
			(typeof(document.documentElement.requestFullscreen)			!= 'undefined') ? 'fullscreenchange' :
			(typeof(document.documentElement.webkitRequestFullscreen)	!= 'undefined') ? 'webkitfullfullscreenchange' :
			(typeof(document.documentElement.mozRequestFullScreen)		!= 'undefined') ? 'mozfullscreenchange' :
			(typeof(document.documentElement.msRequestFullscreen)		!= 'undefined') ? 'msfullscreenchange' : '',
	'_supportFullscreen'	: (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) ? true : false,
	
/*
 * Determine if the device supports the request
 */
	'_deviceSupportsType'	: function (buttonType) {
		if (buttonType == 'fullscreen') {
			return this._supportFullscreen;
			
		} else if (buttonType == 'vr') {
			if ( 'getVRDisplays' in navigator ) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	},
	
/*
 * Creates and returns HTML element. If the device supports the requested change, then the necessary
 *		Event handlers are created to execute the action on user-initiated requests
 *		If the requested action is not supported, an appropriate HTML element is returned without event handlers.
 *
 *	Parameters:
 *		type		The type of requested action. All values are case insensitive. The only supported values are:
 *				'fullscreen'	Set the display full screen
 *				'vr'			Set the display to VR mode
 *		node		The HTML document element to go full screen
 *		renderer	The rendering object. This is required for type='vr' and ignored for other types.
 *		button		An optional user-created HTML element. If present, then this is modified to supply the appropriate 
 *					innerHTML value. If not present or not an HTML element with innerHTML field, then one will be created.
 */
	'createButton'			: function (type, node, renderer, button) {
		var buttonType, response;
		buttonType = type.toLowerCase();
		if (this._deviceSupportsType(buttonType)) {	// Device supports requested feature (VR or FullScreen)
			response = this.buttonCreate (buttonType, node, button);
		
		} else {								// Device does not support requested feature (VR or FullScreen)
			response = this.buttonNotSupported (buttonType, button);
		}
		return response;
	},
};
		
/*
		if ( 'getVRDisplays' in navigator ) {

			var button = document.createElement( 'button' );
			button.style.display = 'none';

			stylizeElement( button );

			window.addEventListener( 'vrdisplayconnect', function ( event ) {

				showEnterVR( event.display );

			}, false );

			window.addEventListener( 'vrdisplaydisconnect', function ( event ) {

				showVRNotFound();

			}, false );

			window.addEventListener( 'vrdisplaypresentchange', function ( event ) {

				button.textContent = event.display.isPresenting ? 'EXIT VR' : 'ENTER VR';

			}, false );

			navigator.getVRDisplays()
				.then( function ( displays ) {

					if ( displays.length > 0 ) {

						showEnterVR( displays[ 0 ] );

					} else {

						showVRNotFound();

					}

				} );

			return button;

		} else {

			var message = document.createElement( 'a' );
			message.href = 'https://webvr.info';
			message.innerHTML = 'WEBVR NOT SUPPORTED';

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}
	}
}
	
//var WEBVR = {

	createButton: function ( renderer ) {}

		function showEnterVR( display ) {

			button.style.display = '';

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 50px)';
			button.style.width = '100px';

			button.textContent = 'ENTER VR';

			button.onmouseenter = function () { button.style.opacity = '1.0'; };
			button.onmouseleave = function () { button.style.opacity = '0.5'; };
			(jQuery)('#HUD-text').prepend ('in showEnterVR. renderer.vr.custom = |' + renderer.vr.custom + '|<br>');
			console.log ('in showEnterVR. renderer.vr.custom = |' + renderer.vr.custom + '|<br>');
			renderer.vr._RequestStart = false;

			button.onclick = function () {

/*
 *	display == VRDisplay object. .displayName: "Google, Inc. Daydream View"
 *	renderer.domElement ==
 *				canvas object (HTML element). .nodeName = 'CANVAS'
 */
//				display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: renderer.domElement } ] );
/*
				if (display.isPresenting) {
					(jQuery)('#HUD-text').prepend ('Curently VRpresenting, now exiting<br>');
					console.log ('Curently VRpresenting, now exiting<br>');
					display.exitPresent();
					renderer.vr._RequestStart = false;
				} else {
					renderer.vr._RequestStart = true;
					(jQuery)('#HUD-text').prepend ('Starting VRpresenting<br>');
					(jQuery)('#HUD-text').prepend (' renderer.vr.custom = |' + renderer.vr.custom + '|<br>');
					console.log ('Starting VRpresenting<br>');
					console.log (' renderer.vr.custom = |' + renderer.vr.custom + '|<br>');
					var st = display.requestPresent( [ { source: renderer.domElement } ] );
					console.log ('VR request response = ' + st);
					(jQuery)('#HUD-text').prepend ('Start requestPresent return = |' + JSON.stringify(st) + '|<br>');
					console.log ('Start requestPresent return = |' + JSON.stringify(st) + '|<br>');
				}

			};

//				display.isPresenting ? display.exitPresent() : display.requestPresent( [ { source: renderer.domElement } ] );
//				renderer.vr.setDevice( display );

		}

		function showVRNotFound() {

			button.style.display = '';

			button.style.cursor = 'auto';
			button.style.left = 'calc(50% - 75px)';
			button.style.width = '150px';

			button.textContent = 'VR NOT FOUND';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

			renderer.vr.setDevice( null );

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = 'transparent';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

		if ( 'getVRDisplays' in navigator ) {

			var button = document.createElement( 'button' );
			button.style.display = 'none';

			stylizeElement( button );

			window.addEventListener( 'vrdisplayconnect', function ( event ) {

				showEnterVR( event.display );

			}, false );

			window.addEventListener( 'vrdisplaydisconnect', function ( event ) {

				showVRNotFound();

			}, false );

			window.addEventListener( 'vrdisplaypresentchange', function ( event ) {

				button.textContent = event.display.isPresenting ? 'EXIT VR' : 'ENTER VR';

			}, false );

			navigator.getVRDisplays()
				.then( function ( displays ) {

					if ( displays.length > 0 ) {

						showEnterVR( displays[ 0 ] );

					} else {

						showVRNotFound();

					}

				} );

			return button;

		} else {

			var message = document.createElement( 'a' );
			message.href = 'https://webvr.info';
			message.innerHTML = 'WEBVR NOT SUPPORTED';

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	},

	// DEPRECATED

	checkAvailability: function () {
		console.warn( 'WEBVR.checkAvailability has been deprecated.' );
		return new Promise( function () {} );
	},

	getMessageContainer: function () {
		console.warn( 'WEBVR.getMessageContainer has been deprecated.' );
		return document.createElement( 'div' );
	},

	getButton: function () {
		console.warn( 'WEBVR.getButton has been deprecated.' );
		return document.createElement( 'div' );
	},

	getVRDisplay: function () {
		console.warn( 'WEBVR.getVRDisplay has been deprecated.' );
	}
*/
// File: ./Events.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen events.
 * This object is the manager for all XSeen events. Individual nodes may handle events directed to
 * the node (e.g., change an attribute's value).
 *
 *
 * provides method for the creation of events and the general-purpose handler for the XSEEN tag
 * The General Purpose handler mostly captures the event and regenerates a new XSeen event
 *
 *
 *	Note: Cursor events on objects are not automatically generated by the system as they would be
 *		for "regular" HTML objects. It is necessary to cast a ray into the scene and see which objects
 *		(if any) it hits. The closest object to the viewer that allows tracking is used in the event
 *
 * This class supports the creation of the following events
 *	Beginning of each animation frame
 *	Change to the display size
 *	Change to the scene graph (tags & attributes)
 *	An object that intersects the ray from the observer through the scene
 *	User "button" click
 *
 */

var XSeen = XSeen || {};
XSeen.Events = {
		'MODE_NAVIGATE'		: 1,
		'MODE_SELECT'		: 2,
		'mode'				: 1,
		'inNavigation'		: function () {return (this.mode == this.MODE_NAVIGATION) ? true : false;},
		'inSelect'			: function () {return (this.mode == this.MODE_SELECT) ? true : false;},
		'redispatch'		: false,
		'object'			: {},
		'tag'				: {},
		'raycaster'			: new THREE.Raycaster(),
		'cursorScreen'		: new THREE.Vector2(),
		
/*
 * General XSeen event handler. All XSeen events get processed here during the CAPTURE phase
 *	The main types of events are mousedown, mouseup, and mousemove. All click events are proceeded by mousedown
 *
 *	If the cusor is used for navigation and selection, then a mousedown event can switch the mode to selection 
 *	(MODE_SELECT). A mouseup event will switch the mode to navigation (MODE_NAVIGATE). If event mode is locked
 *	then cursor events do not change the mode.
 *
 *	The mode is switched to selection if the cursor is over a selectable object on mousedown.
 *	The mode is switched to navigation on mouseup.
 *	The mousemove event does not change the mode.
 *
 *	TODO: Locked Mode
 *
 */
		'xseen'				: function (ev)
					{
						//console.log ('XSeen event handler - ' + ev.type);
						//console.log ('... ' + ev.x + ', ' + ev.y);
						var xEvents = XSeen.Events;
						var Runtime = ev.currentTarget._xseen.sceneInfo;
						if (ev.type == 'mousedown') {
							xEvents.redispatch = true;
							xEvents.mode = xEvents.MODE_SELECT;
							xEvents.cursorScreen.x = ev.clientX * Runtime.Size.iwidth  * 2 - 1;
							xEvents.cursorScreen.y = -ev.clientY * Runtime.Size.iheight * 2 + 1;

							xEvents.raycaster.setFromCamera(xEvents.cursorScreen, Runtime.Camera);
							var hitGeometryList = xEvents.raycaster.intersectObjects (Runtime.selectable, true);
							if (hitGeometryList.length != 0) {
/**
 * TODO: Need to correctly handle hit item and object for dispatch
 * xEvents.hitObject = hitGeometryList[0]
 * hitNode = hitGeometryList[0].object
 *	unless hitGeometryList[0].object.userdata.root defined
 * Use of xEvents.object is discontinued
 */
								xEvents.object = hitGeometryList[0];
								xEvents.tag = xEvents.object.object.userData;
								if (typeof(xEvents.object.object.userData) != 'undefined' && typeof(xEvents.object.object.userData.root) != 'undefined') {
									xEvents.tag = xEvents.tag.root;
								}
								// TODO: Create mousemove listener on root tag
							} else {
								xEvents.object = {};
								xEvents.redispatch = false;
								xEvents.mode = xEvents.MODE_NAVIGATION;
							}
						}
						//console.log ('Type, redispatch = ' + ev.type + ', ' + xEvents.redispatch);
						if ((xEvents.redispatch || ev.type == 'click' || ev.type == 'dblclick') && typeof(xEvents.object.object) !== 'undefined') {
							//console.log ('Repropigate event');
							// Generate an XSeen (Custom)Event of the same type and dispatch it
							var newEv = new CustomEvent('xseen-touch', xEvents.propertiesCursor(ev, xEvents.object));
							xEvents.tag.dispatchEvent(newEv);
							ev.stopPropagation();		// No propagation beyond this tag
						} else {
							//console.log ('Navigation mode...');
						}
						if (ev.type == 'mouseup') {
							xEvents.redispatch = false;
							xEvents.mode = xEvents.MODE_NAVIGATION;
						}
					},

		'propertiesCursor'	: function (ev, selectedObject)
					{
						var properties = {
								'detail':		{					// This object contains all of the XSeen data
										'type':			ev.type,
										'originalType':	ev.type,
										'originator':	selectedObject.object.userData,
										'name':			selectedObject.object.name,
										'distance':		selectedObject.distance,
										'target':		selectedObject,
										'position': {
												'x': selectedObject.point.x,
												'y': selectedObject.point.y,
												'z': selectedObject.point.z,
												},
										'normal': {
												'x': selectedObject.face.normal.x,
												'y': selectedObject.face.normal.y,
												'z': selectedObject.face.normal.z,
												},
										'uv': {
												'x': 0.0,		// selectedObject.uv.x,
												'y': 0.0,		// selectedObject.uv.y,
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
						return  properties;
					},

		'propertiesRenderFrame'	: function (Runtime)
					{
						var properties = {
								'detail':		{					// This object contains all of the XSeen data
										'type'			: 'renderframe',
										'originalType'	: 'renderframe',
										'originator'	: Runtime.RootTag,			// Reference to scene object
										'name'			: Runtime.RootTag.name,		// Name of scene object
										'currentTime'	: Runtime.currentTime,		// Current time at start of frame rendering
										'deltaTime'		: Runtime.deltaTime,		// Time since last frame
										'frameNumber'	: Runtime.frameNumber,		// Number of frame about to be rendered
										'Runtime'		: Runtime					// Reference to Runtime object
												},
								'bubbles':		true,
								'cancelable':	true,
								'composed':		true,
							};
						return  properties;
					},

};
/*
Events

Events are created for all user interactions and changes to the DOM scene graph
Unless there is already a system event name (mouseover, click, etc.), all events are Custom
All nodes create event handlers for the following:
  1) Attribute changes
  2) Children changes
  3) Changes to all style nodes used
Changes to styles that have run-time impact (those with non-empty 'selector' value) are pushed to the node

For example a Group (Transform) node defines an event handler for (https://developer.mozilla.org/en-US/docs/Web/Events)
  1) changes to any attribute value
	DOMAttrModified
  2) changes to children
	DOMNodeInserted
	DOMNodeRemoved
	DOMSubtreeModified
  3)[1] for style elements (nodes)
  
In addition the XSEEN node also receives events for all 
 * mouse/cursor/pointer(?) motions
 * clicks & presses
 * full-screen
 * keyboard
 * window/element resize
 
Node events are handled with the 'events' method that is automatically created during node definition.

The event structure contains the initiating node/action and a reference to the target node

It is the responsibility of the node to make all necessary changes. If the event is ignored, then the node should
pass on the event. If it is fully handled, then it should capture it.
 */
// File: ./Loader.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen loader.
 * This object is the manager for all XSeen loading operations.
 *
 *
 *
 */

var XSeen = XSeen || {};

// Base code from https://www.abeautifulsite.net/parsing-urls-in-javascript
XSeen.parseUrl = function (url) {
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

XSeen.isImage = function (url) {
		var u = XSeen.parseUrl (url);
		var ext = u.extension.toLowerCase();
		if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') {return true;}
		return false;
};

XSeen.Loader = {
						// define internal variables
	'urlQueue'			: [],
	'urlNext'			: -1,
	'MaxRequests'		: 3,
	'totalRequests'		: 0,
	'totalResponses'	: 0,
	'requestCount'		: 0,
	'lmThat'			: this,
	'manager'			: new THREE.LoadingManager(),
	'loadersComplete'	: true,
	'ContentType'		: {
							'jpg'	: 'image',
							'jpeg'	: 'image',
							'gif'	: 'image',
							'txt'	: 'text',
							'html'	: 'html',
							'htm'	: 'html',
							'xml'	: 'xml',
							'json'	: 'json',
							'dae'	: 'collada',
							'gltf'	: 'gltf',
							'glb'	: 'gltfLegacy',
							'obj'	: 'obj',
							'x3d'	: 'x3d',
						},
	'ContentLoaders'	: {},
	'internalLoader'	: function (url, success, failure, progress, userdata, type)
		{
			this.urlQueue.push( {'url':url, 'type':type, 'hint':hint, 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
			this.loadNextUrl();
		},
/*
 * Asynchronously loads a texture cube and saves the result
 *	Arguments:
 *		pathUrl		The URL to the directory. This may be empty.
 *		filenames	An array of six URLs/filenames - one for each cube face. The order is 
 *					+X, -X, +Y, -Y, +Z, -Z. If pathUrl is non-empty, then it is prepended 
 *					to each of these elements. If an element is empty (''), or the entire array 
 *					is undefined; then the face name (px, nx, py, ny, pz, nz) is used. 
 *					If 'pathUrl' and 'filesnames' are undefined, then no texture is loaded.
 *		filetypes	The type of the image file. It can either be a single value or an array of six values.
 *					Each value must start with the character after the file name (e.g., '.').
 *					It is appended to the URL for each face.
 *		Success		User-provided call-back. This is called when all textures are successfully loaded.
 *					The function is called with one argument - the texture cube.
 *		cube		Where the loaded texture cube is stored
 *		dirtyFlag	Set when the texture is loaded so the rendering system can incorporate the result
 */
	'TextureCube'		: function (pathUri, filenames, filetypes, Success)
		{
			var urlTypes=Array(6), urls=Array(6), textureCube;
			var _Success = function (data) {
				var texture = data.cube, dirty;
				if (typeof(data.dirty) !== undefined) {dirty = dirtyFlag;}
				return function (textureCube) {
					texture = textureCube;
					if (typeof(dirty) !== 'undefined') {dirty = true;}
					console.log ('Successful load of background textures.');
				}
			};
			var _Progress = function (a) {
				console.log ('Loading background textures...');
			};
			var _Failure = function (a) {
				console.log ('Load failure');
				console.log ('Failure to load background textures.');
			};

			if (typeof(filetypes) == 'string') {
				urlTypes = [filetypes, filetypes, filetypes, filetypes, filetypes, filetypes];
			} else if (filetypes.length == 6) {
				urlTypes = filetypes;
			} else {
				return;
			}
			if (pathUri == '' && (filenames.length != 6 ||
					(filesnames[0] == '' || filesnames[1] == '' || filesnames[2] == '' || filesnames[3] == '' || filesnames[4] == '' || filesnames[5] == ''))) {return;}
			urls[0] = pathUri + ((filenames.length >= 1 && filenames[0] != '') ? filenames[0] : 'px') + urlTypes[0];
			urls[1] = pathUri + ((filenames.length >= 2 && filenames[1] != '') ? filenames[1] : 'nx') + urlTypes[1];
			urls[2] = pathUri + ((filenames.length >= 3 && filenames[2] != '') ? filenames[2] : 'py') + urlTypes[2];
			urls[3] = pathUri + ((filenames.length >= 4 && filenames[3] != '') ? filenames[3] : 'ny') + urlTypes[3];
			urls[4] = pathUri + ((filenames.length >= 5 && filenames[4] != '') ? filenames[4] : 'pz') + urlTypes[4];
			urls[5] = pathUri + ((filenames.length >= 6 && filenames[5] != '') ? filenames[5] : 'nz') + urlTypes[5];

			console.log('Loading cube-map texture...');

			textureCube = new THREE.CubeTextureLoader(XSeen.Loader.manager)
//									.setPath ('./')
									.load (urls, Success, _Progress, _Failure);
		},

//var lmThat = this;

/*
 *	Sets up for loading an external resource. 
 *	The resource is loaded from a FIFO queue
 *	Loading happens asynchronously. The Loader parameter
 *	MaxRequests determines the maximum number of simoultaneous requests
 *
 *	Parameters:
 *		url			The URL of the resource
 *		hint		A hint to the loader to help it determine which specific loader to use. Most of the
 *					time the file extension is sufficient to determine the specific loader; however, some
 *					file extensions may be used for incompatible file formats (e.x., glTF V1.0, V1.1, and V2.0).
 *					The hint should contain the version number without 'V'.
 *		success		The callback function to call on successful load
 *		failure		The callback function to call on when the loading fails
 *		progress	The callback function to call while the loading is occurring
 *		userdata	A object to be included with all of the callbacks.
 */
	'load'		: function (url='', hint='', success, failure, progress, userdata)
		{
			var uri = XSeen.parseUrl (url);
			var type = (typeof(this.ContentType[uri.extension]) === 'undefined') ? this.ContentType['txt'] : this.ContentType[uri.extension];
			var MimeLoader = this.ContentLoaders[type];
			if (MimeLoader.needHint === true && hint == '') {
				console.log ('Hint require to load content type ' + type);
				return false;
			}
			
			if (MimeLoader.needHint) {
				if (type == 'gltf') {
					if (hint == '') {hint = 'Current';}
					type += hint;
					MimeLoader = this.ContentLoaders[type];
				}		// Other types go here
			}

			if (typeof(MimeLoader.loader) === 'undefined') {
				this.internalLoader (url, success, failure, progress, userdata, type);
			} else {
				MimeLoader.loader.load (url, success, progress, failure);
				XSeen.Loader.loadersComplete = false;
			}
		},
	


// TODO: These are copied from previous Loader. Need to make sure they still work & meet the right needs		
	'success'	: function (response, string, xhr)
		{
			if (typeof(xhr._loadManager.success) !== undefined) {
				xhr._loadManager.success (response, xhr._loadManager.userdata, xhr);
			}
		},
	'progress'	: function (xhr, errorCode, errorText)
		{
			if (typeof(xhr._loadManager.progress) !== undefined) {
				xhr._loadManager.progress (xhr, xhr._loadManager.userdata, errorCode, errorText);
			}
		},
	'failure'	: function (xhr, errorCode, errorText)
		{
			if (typeof(xhr._loadManager.failure) !== undefined) {
				xhr._loadManager.failure (xhr, xhr._loadManager.userdata, errorCode, errorText);
			}
		},

	'requestComplete'	: function (event, xhr, settings)
		{
			this.lmThat.requestCount --;
			this.lmThat.totalResponses++;
			this.lmThat.loadNextUrl();
		},

	'loadNextUrl'		: function ()
		{
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
		},
};

XSeen.Loader.onLoad = function() {
	var mgr = XSeen.Loader.manager;
	XSeen.Loader.ContentLoaders = {
							'image'		: {'loader': null, needHint: false, },
							'text'		: {'loader': null, needHint: false, },
							'html'		: {'loader': null, needHint: false, },
							'xml'		: {'loader': null, needHint: false, },
							'json'		: {'loader': null, needHint: false, },
							'gltf'		: {'loader': null, needHint: 2, },
							'collada'	: {'loader': new THREE.ColladaLoader(mgr), needHint: false, },
							'obj'		: {'loader': new THREE.OBJLoader2(mgr), needHint: false, },
							'x3d'		: {'loader': new THREE.ColladaLoader(mgr), needHint: false, },
							'gltfCurrent'	: {'loader': new THREE.GLTFLoader(mgr), needHint: false, }, 
							'gltfLegacy'	: {'loader': new THREE.LegacyGLTFLoader(mgr), needHint: false, }, 
						};
	console.log ('Created ContentLoaders object');
	mgr.onLoad = function() {XSeen.Loader.loadersComplete = true;}
};
XSeen.Loader.loadingComplete = function() {
	if (XSeen.Loader.urlQueue.length == 0 && XSeen.Loader.loadersComplete) return true;
	return false;
}
if (typeof(XSeen.onLoadCallBack) === 'undefined') {
	XSeen.onLoadCallBack = [];
}
XSeen.onLoadCallBack.push (XSeen.Loader.onLoad);

// File: ./Logging.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * 
 */
if (typeof(XSeen) === 'undefined') {var XSeen = {};}
if (typeof(XSeen.definitions) === 'undefined') {XSeen.definitions = {};}

/*
 *	Logging object for handling all logging of messages
 *
 *	init is used to initialize and return the object. 
 */
 
XSeen.definitions.Logging = {
	'levels'	: ['Info', 'Debug', 'Warn', 'Error'],
	'Data'		: {
					'Levels' : {
						'Info'	: {'class':'xseen-log xseen-logInfo', 'level':7, label:'INFO'},
						'Debug'	: {'class':'xseen-log xseen-logInfo', 'level':5, label:'DEBUG'},
						'Warn'	: {'class':'xseen-log xseen-logInfo', 'level':3, label:'WARN'},
						'Error'	: {'class':'xseen-log xseen-logInfo', 'level':1, label:'ERROR'},
					},
					'maximumLevel'		: 9,
					'defaultLevel'		: 'Error',
					'active'			: false,
					'init'				: false,
					'maxLinesLogged'	: 10000,
					'lineCount'			: 0,
					'logContainer'		: null,
				},
	'init'		: function (show, element) {

		// 	If initialized, return this
		if (this.Data.init) {return this; }
	
		// Setup container
		if (document.getElementById('XSeenLog') === null) {
			this.Data.logContainer = document.createElement("div");
			this.Data.logContainer.id = "xseen_logdiv";
			this.Data.logContainer.setAttribute("class", "xseen-logContainer");
			this.Data.logContainer.style.clear = "both";
			element.parentElement.appendChild (this.Data.logContainer);
		} else {
			this.Data.logContainer = document.getElementById('XSeenLog');
			this.Data.logContainer.classList.add ("xseen-logContainer");
		}
		this.Data.init = true;
		if (!show) {this.LogOff()}
		return this;
	},
	
	'LogOn'		: function () {this.active = true;},
	'LogOff'	: function () {this.active = false;},

	'logLog'	: function (message, level) {
		if (this.Data.active && this.Data.Levels[level].level <= this.Data.maximumLevel) {
			if (this.Data.lineCount >= this.Data.maxLinesLogged) {
				message = "Maximum number of log lines (=" + this.Data.maxLinesLogged + ") reached. Deactivating logging...";
				this.Data.active = false;
				level = 'Error'
			}
			// if level not in this.levels, then set to this.Data.defaultLevel
			var node = document.createElement("p");
			node.setAttribute("class", this.Data.Levels[level].class);
			node.innerHTML = this.Data.Levels[level].label + ": " + message;
			this.Data.logContainer.insertBefore(node, this.Data.logContainer.firstChild);
			console.log (node.innerHTML);
		}
	},

	'logInfo'	: function (string) {this.logLog (string, 'Info');},
	'logDebug'	: function (string) {this.logLog (string, 'Debug');},
	'logWarn'	: function (string) {
		this.logLog (string, 'Warn');
		console.log ('Warning: ' + string);
	},
	'logError'	: function (string) {
		this.logLog (string, 'Error');
		console.log ('*** Error: ' + string);
	},
}
// File: ./onLoad.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * 
 */
 
var XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;

XSeen.Convert = {
	'fromString'	: function (v, t)
	{
		if (t == 'boolean') {
			if (v == '' || v == 'f' || v == '0' || v == 'false') {return false;}
			return true;
		}
		return v;
	},
};

/*
 * Partially designed to process all scenes; however, only the first one is actually processed
 */
XSeen.onLoad = function() {
	//console.log ("onLoad method");


	loadExternal = function(url, domElement) {
                                       // Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
                                       //
			var xseenCode = '';
        	loadExternalSuccess = function (userdata) {
                	var e = userdata.e;
					return function (response) {
							console.log('Loading of external XSeen complete');
							var parser = new DOMParser();
							var xmlDoc = parser.parseFromString(response,"text/xml");
							var rootNode = xmlDoc.getElementsByTagName('x-scene');
							var nodes = rootNode[0].children;
							while (nodes.length > 0) {
								console.log('Adding external node: ' + nodes[0].nodeName);
								e.appendChild(nodes[0]);
							}
					}
			};

			//if (url != 'test') {
			//console.log ('External loads not yet supported for ' + url);
			var loader = new THREE.FileLoader();
			loader.load (url, 
						loadExternalSuccess({'e':domElement}),
						// onProgress callback
						function ( xhr ) {
							console.log('External source loader: ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
						},
						// onError callback
						function ( err ) {
							console.log ('Response Code: ' + err.target.status);
							console.log ('Response URL: ' + err.target.responseURL);
							console.log ('Response Text\n' + err.target.responseText);
							console.error( 'External source loader: An error happened' );
						}
			);

/*
                } else {
	        	xseenCode = '' +
   "<x-class3d id='geometry'>\n" +
   "        <x-style3d property='radius' value='1'></x-style3d>\n" +
   "        <x-style3d property='tube' value='.4'></x-style3d>\n" +
   "        <x-style3d property='segments-radial' value='16'></x-style3d>\n" +
   "        <x-style3d property='segments-tubular' value='128'></x-style3d>\n" +
   "</x-class3d>\n" +
   "<x-class3d id='material'>\n" +
   "        <x-style3d property='type' value='pbr'></x-style3d>\n" +
   "        <x-style3d property='color' value='#00ffff'></x-style3d>\n" +
   "        <x-style3d property='emissive' value='#000000'></x-style3d>\n" +
   "        <x-style3d property='env-map' value='forest'></x-style3d>\n" +
   "</x-class3d>\n" +
   "<x-group rotation='0 3.14 0'>\n" +
   "        <x-tknot class3d='geometry material' type='phong' position='0 10 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='0' roughness='0' position='-5 5 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='.5' roughness='0' position='0 5 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='1.' roughness='0' position='5 5 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='0' roughness='.5' position='-5 0 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='.5' roughness='.5' position='0 0 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='1.' roughness='.5' position='5 0 0'></x-tknot>\n" +
   "        <x-tknot class3d='geometry material' metalness='1.' roughness='1' position='5 -5 0'></x-tknot>\n" +
   "</x-group>";
		xseenCode = '<x-group>' + xseenCode + '</x-group>';
		console.log ('Adding inline-generated nodes');
		domElement.insertAdjacentHTML('afterbegin', xseenCode);
            }
 */
	};
	
	var sceneOccurrences, ii;
	if (typeof(XSeen._Scenes) === 'undefined') {XSeen._Scenes = [];}

	sceneOccurrences = document.getElementsByTagName (XSeen.Constants.tagPrefix + XSeen.Constants.rootTag);
	for (ii=0; ii<sceneOccurrences.length; ii++) {
		if (typeof(sceneOccurrences[ii]._xseen) === 'undefined') {
			XSeen._Scenes.push(sceneOccurrences[ii]);
		}
	}
	if (XSeen._Scenes.length < 1) {return;}
	XSeen.Runtime.RootTag = XSeen._Scenes[0];
	XSeen.Runtime.Attributes = [];

	var allowedAttributes, defaultValues, value, attributeCharacteristics;
	allowedAttributes = ['src', 'showlog', 'showstat', 'showprogress', 'cubetest'];
	defaultValues = {'src':'', 'showlog':false, 'showstat':false, 'showprogress':false, 'cubetest':false};
	attributeCharacteristics = {
								'src'	: {
									'name'		: 'src',
									'default'	: '',
									'type'		: 'string',
									'case'		: 'sensitive' ,
										},
								'usecamera'	: {						// deprecated
									'name'		: 'usecamera',
									'default'	: 'false',
									'type'		: 'boolean',
										},
								'showstat'	: {
									'name'		: 'showstat',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'showprogress'	: {
									'name'		: 'showprogress',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'transparent'	: {
									'name'		: 'transparent',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								'cubetest'	: {
									'name'		: 'cubetest',
									'default'	: 'false',
									'type'		: 'boolean',
									'case'		: 'insensitive' ,
										},
								};
								
	Object.getOwnPropertyNames(attributeCharacteristics).forEach (function (prop) {
		value = XSeen.Runtime.RootTag.getAttribute(attributeCharacteristics[prop].name);
		if (value == '' || value === null || typeof(value) === 'undefined') {value = attributeCharacteristics[prop].default;}
		//console.log ('Checking XSEEN attribute: ' + prop + '; with value: ' + value);
		if (value != '') {
			if (attributeCharacteristics[prop].case != 'sensitive') {
				XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value.toLowerCase(), attributeCharacteristics[prop].type);
			} else {
				XSeen.Runtime.Attributes[attributeCharacteristics[prop].name] = XSeen.Convert.fromString (value, attributeCharacteristics[prop].type);
			}
		}
	});

	if (!(typeof(XSeen.Runtime.Attributes.src) == 'undefined' || XSeen.Runtime.Attributes.src == '')) {
		console.log ('*** external SRC file specified ... |'+XSeen.Runtime.Attributes.src+'|');
		loadExternal (XSeen.Runtime.Attributes.src, XSeen.Runtime.RootTag);
	}

	

/** Setup/define various characteristics for the runtime or display
 *
 * Define Renderer and StereoRenderer
 *	This was formerly in XSeen, but moved here to support a transparent
 *	background request either by style or explicit attribute
 */
	var Renderer;
	if (XSeen.Runtime.Attributes.transparent) {
		XSeen.Runtime.isTransparent = true;
	} else {
		XSeen.Runtime.isTransparent = false;
	}
	if (XSeen.Runtime.isTransparent) {
		Renderer = new THREE.WebGLRenderer({'alpha':true,});		// Sets transparent WebGL canvas
		console.log ('Creating a transparent rendering canvas.');
	} else {
		Renderer = new THREE.WebGLRenderer();
		console.log ('Creating a opaque rendering canvas.');
	}
	XSeen.Runtime.Renderer			= Renderer,
	XSeen.Runtime.RendererStandard	= Renderer,
	XSeen.Runtime.RendererStereo	= new THREE.StereoEffect(Renderer);
	Renderer = null;
	
	XSeen.Logging = XSeen.definitions.Logging.init (XSeen.Runtime.Attributes['showlog'], XSeen.Runtime.RootTag);
	XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);	// TODO: test
	//XSeen.Runtime.Renderer.setPixelRatio( window.devicePixelRatio );	// See https://stackoverflow.com/questions/31407778/display-scene-at-lower-resolution-in-three-js
	XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height);

//	XSeen.Runtime.Camera = new THREE.PerspectiveCamera( 75, XSeen.Runtime.Size.aspect, 0.1, 10000 );
	XSeen.Runtime.Camera = new THREE.PerspectiveCamera( 50, XSeen.Runtime.Size.aspect, 0.1, 10000 );
	XSeen.Runtime.SceneDom = XSeen.Runtime.Renderer.domElement;
	XSeen.Runtime.RootTag.appendChild (XSeen.Runtime.SceneDom);
	
	XSeen.Runtime.mediaAvailable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);	// flag for device media availability


/*
 *	Experimental code for device camera
 *
 *	From: https://www.html5rocks.com/en/tutorials/getusermedia/intro/
 *		https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 *
 *	Revision plans:
 *	1.	Remove 'usecamera' x-scene attribute and use element transparency instead.
 *		a. This is a one-time setting and can't be changed
 *		b. Camera not allowed unless this is set
 *	2.	Renderer, StereoRenderer definitions need to go in onLoad
 *	3.	Runtime definition remains, but many items are populated in onLoad
 *	4.	x-background specified use of camera
 *	5.	This code would need to go there
 *	6.	If camera is operational, skycolor or any other background is disabled
 *	7.	Create separate object for dealing with camera
 */
	if (XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent) {
/*
		var video = document.createElement( 'video' );
		//if (XSeen.Runtime.Attributes.usecamera) {
			video.setAttribute("autoplay", "1"); 
			video.height			= XSeen.Runtime.SceneDom.height;
			video.width				= XSeen.Runtime.SceneDom.width;
			video.style.height		= video.height + 'px';
			video.style.width		= video.width + 'px';
			video.style.position	= 'absolute';
			video.style.top			= '0';
			video.style.left		= '0';
			video.style.zIndex		= -1;
			const constraints = {video: {facingMode: "environment"}};

			function handleSuccess(stream) {
				XSeen.Runtime.RootTag.appendChild (video);
				video.srcObject = stream;
			}
			function handleError(error) {
				//console.error('Reeeejected!', error);
				console.log ('Device camera not available -- ignoring');
			}

			navigator.mediaDevices.enumerateDevices()
				.then(gotDevices);
//				.then(gotDevices).then(getStream).catch(handleError);

			function gotDevices(deviceInfos) {
				var msgs = '';
				for (var i = 0; i !== deviceInfos.length; ++i) {
					var deviceInfo = deviceInfos[i];
					console.log('Found a media device of type: ' + deviceInfo.kind);
					msgs += 'Found a media device of type: ' + deviceInfo.kind + "(" + deviceInfo.deviceId + '; ' + deviceInfo.groupId + ")\n";
				}
				//alert (msgs);
			}

			navigator.mediaDevices.getUserMedia(constraints).
				then(handleSuccess).catch(handleError);
*/
	} else {
		console.log ('Device Media support is not available or NOT requested ('+XSeen.Runtime.isTransparent+')');
	}
// End of experimental code


	//console.log ('Checking _xseen');
	if (typeof(XSeen.Runtime.RootTag._xseen) === 'undefined') {
		//console.log ('Defining _xseen');
		XSeen.Runtime.RootTag._xseen = {					// Duplicated from Tag.js\%line202
									'children'		: [],	// Children of this tag
									'Metadata'		: [],	// Metadata for this tag
									'tmp'			: [],	// tmp working space
									'attributes'	: [],	// attributes for this tag
									'animate'		: [],	// animatable attributes for this tag
									'animation'		: [],	// array of animations on this tag
									'properties'	: [],	// array of properties (active attribute values) on this tag
									'class3d'		: [],	// 3D classes for this tag
									'sceneInfo'		: XSeen.Runtime,	// Runtime data added to each tag
									};
	}
	
	// Set up display characteristics, especially for VR
	if (navigator.getVRDisplays) {
		navigator.getVRDisplays()
			.then( function ( displays ) {
				if ( displays.length > 0 ) {
					XSeen.Runtime.isVrCapable = true;
				} else {
					XSeen.Runtime.isVrCapable = false;
				}
			} );
	}
/*
	// Stereo camera effect -- from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
	var x_effect = new THREE.StereoEffect(Renderer);
	Renderer.controls = {'update' : function() {return;}};
	
	// Mobile (device orientation) controls
	Renderer.controls = new THREE.DeviceOrientationControls(camera);
	
	// Not sure how to handle when both are requested since they both seem to go into
	//	the same address. Perhaps order is important since the stereographic control is null
 */
	XSeen.Runtime.hasDeviceOrientation = (window.orientation) ? true : false;
	XSeen.Runtime.hasVrImmersive = XSeen.Runtime.hasDeviceOrientation;

	
	// Define a few equivalences

	XSeen.LogInfo	= function (string) {XSeen.Logging.logInfo (string);}
	XSeen.LogDebug	= function (string) {XSeen.Logging.logDebug (string);}
	XSeen.LogWarn	= function (string) {XSeen.Logging.logWarn (string);}
	XSeen.LogError	= function (string) {XSeen.Logging.logError (string);}
	
/*
 *	Create default camera by adding a first-child node to x-scene
 *		<x-camera position='0 0 10' type='perspective' track='orbit' priority='0' active='true' />
 */
	defaultCamera = "<x-camera id='XSeen__DefaultCamera' position='0 0 10' type='perspective' track='orbit' priority='0' active='true' /></x-camera>";
	var tmp = document.createElement('div');
	tmp.innerHTML = defaultCamera;
	XSeen.Runtime.RootTag.prepend (tmp.firstChild);

	
// Introduce things
	XSeen.Logging.logInfo ("XSeen version " + XSeen.Version.version + ", " + "Date " + XSeen.Version.date);
	XSeen.LogInfo(XSeen.Version.splashText);
	//XSeen.LogDebug ("Debug line");
	//XSeen.LogWarn ("Warn line");
	//XSeen.LogError ("Error line");
	
// Load all other onLoad methods
	for (var ii=0; ii<XSeen.onLoadCallBack.length; ii++) {
		XSeen.onLoadCallBack[ii]();
	}

// Create XSeen event listeners
	XSeen.Runtime.RootTag.addEventListener ('mouseover', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mouseout', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mousedown', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('mouseup', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('click', XSeen.Events.xseen, true);
	XSeen.Runtime.RootTag.addEventListener ('dblclick', XSeen.Events.xseen, true);

// Parse the HTML tree starting at scenesToParse[0]. The method returns when there is no more to parse
	//XSeen.Parser.dumpTable();
	console.log ('Starting Parse...');
	XSeen.Parser.Parse (XSeen.Runtime.RootTag, XSeen.Runtime.RootTag);
	
// TODO: Start rendering loop

	return;
};


// Determine the size of the XSeen display area

XSeen.updateDisplaySize = function (sceneRoot) {
	var MinimumValue = 50;
	var size = Array();
	size.width = sceneRoot.offsetWidth;
	size.height = sceneRoot.offsetHeight;
	if (size.width < MinimumValue) {
		var t = sceneRoot.getAttribute('width');
		if (t < MinimumValue) {t = MinimumValue;}
		size.width = t;
	}
	if (size.height < MinimumValue) {
		var t = sceneRoot.getAttribute('height');
		if (t < MinimumValue) {t = MinimumValue;}
		size.height = t;
	}
	size.iwidth = 1.0 / size.width;
	size.iheight = 1.0 / size.height;
	size.aspect = size.width * size.iheight;
	return size;
}
// File: ./Tag.js
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
 * XSeen.tags.<name> is the definition of <name>
 * All internal variables are stored in ._internal
 *
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump (_dumpTable) would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 * Attributes are added with the .defineAttribute method. It takes its values from the argument list
 * or an object passed as the first argument. The properties of the argument are:
 *	name - the name of the field. This is converted to lowercase before use
 *	datatype - the datatype of the field. There must be a method in XSeen.types by this name
 *	defaultValue - the default value of the field to be used if the field is not present or incorrectly defined.
 *					If this argument is an array, then it is the set of allowed values. The first element is the default.
 *	enumerated - the list of allowed values when the datatype only allows specific values for this field (optional)
 *	animatable - Flag (T/F) indicating if the field is animatable. Generally speaking, enumerated fieles are not animatable
 */

var XSeen = XSeen || {};
XSeen.Tags = {
	'_setSpace'		: function (object, spaceAttributes) {
						//if (1 === 1) return;
						if (object.isObject3D) {
							if (typeof(spaceAttributes.position) !== 'undefined') {
								object.position.x = spaceAttributes.position.x;
								object.position.y = spaceAttributes.position.y;
								object.position.z = spaceAttributes.position.z;
							}
							if (typeof(spaceAttributes.rotation) !== 'undefined') {
								object.setRotationFromQuaternion (spaceAttributes.rotation);
							}
							if (typeof(spaceAttributes.scale) !== 'undefined') {
								object.scale.x = spaceAttributes.scale.x;
								object.scale.y = spaceAttributes.scale.y;
								object.scale.z = spaceAttributes.scale.z;
							}
						}
					},
};
XSeen.Parser = {
	'Table'		: {},
	'_prefix'	: 'x-',
	'AttributeObserver'	: new MutationObserver(function(list) {
							for (var mutation of list) {
								var value = XSeen.Parser.reparseAttr (mutation.target, mutation.attributeName);
								var localName = mutation.target.localName;
								var handler = XSeen.Parser.Table[localName].eventHandlers.mutation.handler;
								handler (mutation.target, mutation.attributeName, value);
							}
						}),
/*
 * Observer for tag/child changes/additions
 */
	'ChildObserver'	: new MutationObserver(function(list) {
				for (var mutation of list) {
					console.log ('Child mutation element');
                              		mutation.addedNodes[0]._xseen = {
                                                           'children'              : [],   // Children of this tag
                                                           'Metadata'              : [],   // Metadata for this tag
                                                           'tmp'                   : [],   // tmp working space
                                                           'attributes'    : [],   // attributes for this tag
                                                           'animate'               : [],   // animatable attributes for this tag
                                                           'animation'             : [],   // array of animations on this tag
                                                           'properties'    : [],   // array of properties (active attribute values) on this tag
                                                           'class3d'               : [],   // 3D classes for this tag
                                                           'parseComplete' : false,        // tag has been completely parsed
                                                           'sceneInfo'             : mutation.target._xseen.sceneInfo,     // Runtime...
                                                                        };
					XSeen.Parser.Parse (mutation.addedNodes[0], mutation.target);
					if (mutation.target.localName == 'x-scene') {
						XSeen.Tags.scene.addScene();		// Not the most elegant way to do this... :-(
						XSeen.Runtime.ViewManager.setNext();	// Update the camera
					}
							}
						}),


	'TypeInfo'		: {
						'string'	: {'isNumeric':false, 'arrayAllowed':false, parseElements:false, numElements:1, },
						'boolean'	: {'isNumeric':false, 'arrayAllowed':false, parseElements:false, numElements:1, },
						'integer'	: {'isNumeric':false, 'arrayAllowed':true, parseElements:true, numElements:1, },
						'color'		: {'isNumeric':true, 'arrayAllowed':false, parseElements:true, numElements:-1, },
						'float'		: {'isNumeric':true, 'arrayAllowed':true, parseElements:true, numElements:1, },
						'vec2'		: {'isNumeric':true, 'arrayAllowed':true, parseElements:true, numElements:2, },
						'vec3'		: {'isNumeric':true, 'arrayAllowed':true, parseElements:true, numElements:3, },
						'xyz'		: {'isNumeric':true, 'arrayAllowed':true, parseElements:true, numElements:3, },
						'vec4'		: {'isNumeric':true, 'arrayAllowed':true, parseElements:true, numElements:4, },
						'rotation'	: {'isNumeric':true, 'arrayAllowed':false, parseElements:true, numElements:-1, },
						'vector'	: {'isNumeric':true, 'arrayAllowed':true, parseElements:true, numElements:0, },
					},

	'defineTag' : function (tagObj, init, fin, events)
		{
			if (arguments.length != 1) {
				tagObj = {
						'name'		: tagObj,
						'init'		: init,
						'fin'		: fin,
						'events'	: events};		// Removed 'tick'
			}
			var tag = {
				'tag'			: XSeen.Parser._prefix + tagObj.name.toLowerCase(),
				'init'			: tagObj.init,
				'fin'			: tagObj.fin,
				'events'		: tagObj.events,
//				'tick'			: tagObj.tick,
				'attributes'	: [],
				'attrIndex'		: [],
				'eventHandlers'	: [],
				'addSceneSpace'	: function ()
					{
						var v = this
							.defineAttribute ({'name':'position', dataType:'xyz', 'defaultValue':{x:0, y:0, z:0}})
							.defineAttribute ({'name':'rotation', dataType:'rotation', 'defaultValue':[0,0,0]})
							.defineAttribute ({'name':'rotate-x', dataType:'float', 'defaultValue':0})
							.defineAttribute ({'name':'rotate-y', dataType:'float', 'defaultValue':0})
							.defineAttribute ({'name':'rotate-z', dataType:'float', 'defaultValue':0})
							.defineAttribute ({'name':'scale', dataType:'xyz', 'defaultValue':{x:1, y:1, z:1}});
						return v;
					},
				'defineAttribute'	: function (attrObj, dataType, defaultValue)
					{
						if (arguments.length != 1) {
							attrObj = {
										'name'				: attrObj,
										'dataType'			: dataType,
										'defaultValue'		: defaultValue,
										'isCaseInsensitive'	: true,
										'isAnimatable'		: null,
										'enumeration'		: [],
										'isArray'			: false,
									};
						}
						//console.log ('Data type of ' + attrObj.name + ' is ' + attrObj.dataType);
						if (typeof(attrObj.isAnimatable) == 'undefined') {
							attrObj.isAnimatable = (XSeen.Parser.TypeInfo[attrObj.dataType].isNumeric) ? true : false;
						}
						if (typeof(attrObj.elementCount) == 'undefined') {
							attrObj.elementCount = XSeen.Parser.TypeInfo[attrObj.dataType].numElements;
						} else {
							attrObj.elementCount = Math.max (XSeen.Parser.TypeInfo[attrObj.dataType].numElements, attrObj.elementCount);
						}
						var name = attrObj.name.toLowerCase();
						attrObj.enumeration = (typeof(attrObj.enumeration) == 'object') ? attrObj.enumeration : [];
						attrObj.isCaseInsensitive = (typeof(attrObj.isCaseInsensitive) !== 'undefined') ? attrObj.isCaseInsensitive : false;
						if (attrObj.dataType != 'string') {
							attrObj.isCaseInsensitive = true;
						} else {
							attrObj.isArray = false;
						}
						this.attributes.push ({
								'attribute'			: name,
								'type'				: attrObj.dataType,
								'default'			: attrObj.defaultValue,
								'enumeration'		: attrObj.enumeration,
								'elementCount'		: attrObj.elementCount,
								'isCaseInsensitive'	: attrObj.isCaseInsensitive,
								'isAnimatable'		: (typeof(attrObj.isAnimatable) !== null) ? attrObj.isAnimatable : false,
								'isEnumerated'		: (attrObj.enumeration.length == 0) ? false : true,
								'isArray'			: (typeof(attrObj.isArray) !== null) ? attrObj.isArray : false,
								'clone'				: this.cloneAttribute,
								'setAttrName'		: this.setAttrName,
								});
						this.attributes[name] = this.attributes[this.attributes.length-1];
						this.attrIndex[name] = this.attributes.length-1;
						return this;
					},

			// TODO: expand as more events are added
				'addEvents'	: function (handlerObj)
					{
						if (typeof(handlerObj.mutation) !== 'unknown' && typeof(handlerObj.mutation[0].attributes) !== 'unknown') {
							this.eventHandlers['mutation'] = {
																'options'	: {'attributes':true},
																'handler'	: handlerObj.mutation[0].attributes,
															};
						}
						return this;
					},

				'addTag'	: function () {
						XSeen.Parser.Table[this.tag] = this;
						//console.log ('** Adding ' + this.tag + ' to parsing table');
					},

				'cloneAttribute'	: function () {
					var newAttrObject = {
								'attribute'			: this.name,
								'type'				: this.type,
								'default'			: this.default,
								'enumeration'		: [],
								'isCaseInsensitive'	: this.isCaseInsensitive,
								'isAnimatable'		: this.isAnimatable,
								'isEnumerated'		: this.isEnumerated,
								'isArray'			: this.isArray,
								'clone'				: this.clone,
								'setAttrName'		: this.setAttrName,
					};
					for (var i=0; i<this.enumeration.length; i++) {
						newAttrObject.enumeration.push(this.enumeration[i]);
					}
					if (Array.isArray(this.default)) {
						newAttrObject.default = [];
						for (var i=0; i<this.default.length; i++) {
							newAttrObject.default.push(this.default[i]);
						}
					}
					return newAttrObject;
				},
				'setAttrName'	: function(newName) {
					this.attribute = newName;
					return this;
				},
			};
			return tag;
		},
		
	'getTag' : function (tagName)
		{
			if (typeof(tagName) == 'undefined' || tagName == '') {return null;}
			var tag = XSeen.Parser._prefix + tagName;
			if (typeof(XSeen.Parser.Table[tag]) == 'undefined') {return null;}
			return XSeen.Parser.Table[tag];
		},
		
// TODO: Debug element parse method
/*
 * This is called recursively starting with the first <x-scene> tag
 */
	'Parse'	: function (element, parent)
		{
			var tagName = element.localName.toLowerCase();		// Convenience declaration
			//console.log ('Found ' + tagName);
			/*
			 *	If tag name is unknown, then print message; otherwise,
			 *	if element._xseen is defined, then node has already been parsed so ignore; otherwise,
			 *	Create all XSeen additions un element._xseen
			 *	Parse provided attributes
			 *	Redefine DOM methods for accessing attributes
			 */
			var tagEntry;
			if (typeof(XSeen.Parser.Table[tagName]) == 'undefined') {
				XSeen.LogDebug("Unknown node: " + tagName + '. Skipping all children.');
				console.log ("DEBUG: Unknown node: " + tagName + '. Skipping all children.');
				return;
			} else if (element._xseen.parseComplete) {	// tag already parsed. Display messge and ignore tag
				XSeen.LogDebug("Tag already parsed: " + tagName + '. Skipping all children.');
                                console.log ("DEBUG: Tag already parsed: " + tagName + '. Skipping all children.');
			} else {
				tagEntry = XSeen.Parser.Table[tagName];
				if (typeof(element._xseen) == 'undefined') {
					element._xseen = {
									'children'		: [],	// Children of this tag
									'Metadata'		: [],	// Metadata for this tag
									'tmp'			: [],	// tmp working space
									'attributes'	: [],	// attributes for this tag
									'animate'		: [],	// animatable attributes for this tag
									'animation'		: [],	// array of animations on this tag
									'properties'	: [],	// array of properties (active attribute values) on this tag
									'class3d'		: [],	// 3D classes for this tag
									'parseComplete'	: false,	// tag has benn completely parsed
									};
				}
			XSeen.Parser.ChildObserver.observe (element, {'childList':true});
				this.parseAttrs (element, tagEntry);
				//console.log ('Calling node: ' + tagName + '. Method: ' + tagEntry.init + ' (e,p)');
				//console.log('Calling node: ' + tagName + '. Method: init');
				XSeen.LogInfo('Calling node: ' + tagName + '. Method: init');
				tagEntry.init (element, parent);
			}

			// Parse all of the children in order
			for (element._xseen.parsingCount=0; element._xseen.parsingCount<element.childElementCount; element._xseen.parsingCount++) {
				element.children[element._xseen.parsingCount]._xseen = {
									'children'		: [],	// Children of this tag
									'Metadata'		: [],	// Metadata for this tag
									'tmp'			: [],	// tmp working space
									'attributes'	: [],	// attributes for this tag
									'animate'		: [],	// animatable attributes for this tag
									'animation'		: [],	// array of animations on this tag
									'properties'	: [],	// array of properties (active attribute values) on this tag
									'class3d'		: [],	// 3D classes for this tag
									'parseComplete'	: false,	// tag has been completely parsed
									'sceneInfo'		: element._xseen.sceneInfo,	// Runtime...
									};
				this.Parse (element.children[element._xseen.parsingCount], element);
			}

			if (typeof(tagEntry) !== 'undefined') {
				element.addEventListener ('XSeen', tagEntry.events);
				//XSeen.LogInfo('Calling node: ' + tagName + '. Method: fin');
				tagEntry.fin (element, parent);
				if (typeof(element._xseen.tmp.meta) !== 'undefined' && element._xseen.tmp.meta.length != 0) {
					element._xseen.Metadata = element._xseen.tmp.meta;
					element._xseen.tmp.meta = [];
				}
				//XSeen.LogInfo('Return from node: ' + tagName + '. Method: fin');
				if (typeof(tagEntry.eventHandlers.mutation) !== 'undefined') {
					XSeen.Parser.AttributeObserver.observe (element, tagEntry.eventHandlers.mutation.options);
				}
				element._xseen.parseComplete = true;
			}
		},

/*
 *	Parse all defined attributes. The collection of classes is handled prior to the parsing
 *	of any attributes.
 *
// TODO: Handle ._xseen.rulesets in attribute parsing. Only applies if tag has attribute 'class3d' with a value
//			of an ID that is in the ruleset Object.
//	TODO: Expand the ruleset array to an object and provide a reverse lookup by ID to array index.
 *		StyleRules = {ruleset:[], idLookup:[]}
 *		where ruleset[idLookup['id']] is the ruleset defined by 'id'
 */

	'parseAttrs'	: function (element, tagObj)
		{
			element._xseen.parseAll = false;
			var classt = element.getAttribute('class3d');					// Get list of class3d (really IDs)
			var classes3d = (classt === null) ? [] : classt.split(' ');		// and split it (if defined)
			for (var ii=0; ii<classes3d.length; ii++) {						// Attaching all referenced class definitions to tag
				element._xseen.class3d.push (element._xseen.sceneInfo.StyleRules.idLookup[classes3d[ii]]);
				//element._xseen.sceneInfo.mutation.useClass3d (element, classes3d[ii]);
			}
			tagObj.attributes.forEach (function (attr, ndx, wholeThing)
				{
					var value = this.parseAttr (attr, element, element._xseen.class3d);
					if (value == 'XSeen.parse.all') {
						element._xseen.parseAll = true;
					} else {
						element._xseen.attributes[attr.attribute] = value;
						if (attr.isAnimatable) {element._xseen.animate[attr.attribute] = null;}
					}
				}, this);
		},
		
// TODO: Debug/Test reparseAttr method -- used for runtime changes to declarations
	'reparseAttr'	: function (ele, attributeName)
		{
			if (typeof(XSeen.Parser.Table[ele.localName]) === 'undefined') {return null;}
			var tagObj = XSeen.Parser.Table[ele.localName];
			if (typeof(tagObj.attributes[attributeName]) === 'undefined') {return null; }
			var attr = tagObj.attributes[attributeName];
			var value = XSeen.Parser.parseAttr (attr, ele, ele._xseen.class3d);
			return value;
		},
	'parseAttr'		: function (attr, ele, class3d)			// Parse an individual attribute
		{
			var classValue = this.getClassAttributeValue (attr.attribute, class3d)
			var value = ele.getAttribute(attr.attribute);
			if (value === null || value == '') {value = classValue;}
			//var valueParser = XSeen.Parser.Types[attr.type];
			if (attr.isArray) {
/*
 * TODO: Add another field to indicate if the value is an array. 'type' contains to be the basic data type in the array
 *	The return 'value' is an array of elements each of which is type 'type'
 *	Need to think how to parse the string to get the desired results
 *	Changes also needed above to accept the new input field 'isArray' (boolean)
 *
 *	1) Preprocessing value by removing all of the following characters: (),[]
 *	and converting all white space to a single space (this may apply to all value parsing)
 *	2) Get # of components array element
 *	3) Parse each array element individually, storing the parsed value into an array
 *	4) Not sure how to handle an parse (character sequence) error
 *	5) JavaScript Regex parser can split a string into elements <regex>.split(<string>)
 *		[+-]?\d* for decimal integers
 *		[+-]?\d*\.?\d* for floating point (non-exponential)
 *		[+-]?\d*\.?\d*[eE][+-]\d+ for floating point (exponential)
 *	  Need hex and octal integers. Does not support non-numeric color or rotation formats 
 *	Method for (2) can return an array containing the component grouping for parsing
 *	It needs the value data type and value string
 *
 */
				function getElementsFromArray (ea, ndx, increment) {
					var ev = [];
					for (var ii=ndx; ii<ndx+increment; ii++) {
						ev.push(ea[ii]);
					}
					return ev;
				}
				// Illegal datatype for an array. Return default
				if (!XSeen.Parser.TypeInfo[attr.type].arrayAllowed || attr.elementCount < 1) {
					if (value == '') {value = attr.default;}
					return value;
				}

				// Pass entire elementArray into <dataType> parser. It returns the parsed object
				// Somehow need to get #elements per parsed value XSeen.Parser.TypeInfo[<dataType>].numElements
				// Need to do something similar for regular elements. Perhaps check datatype,
				//	if string then call _elementSplit; otherwise use it
				var elementArray = XSeen.Parser.Types._elementSplit (value);
				var increment = attr.elementCount;
				var collectionCount = increment / XSeen.Parser.TypeInfo[attr.type].numElements;
				var ndx = 0;
				var valueArray=[], elementValues=[], tmp;
				while (ndx < elementArray.length) {
					tmp = [];
					for (var jj=0; jj<collectionCount; jj++) {
						elementValues = getElementsFromArray (elementArray, ndx, XSeen.Parser.TypeInfo[attr.type].numElements);
						ndx += XSeen.Parser.TypeInfo[attr.type].numElements;
						tmp.push (XSeen.Parser.Types[attr.type](elementValues, attr.default, false, attr.enumeration));
					}
					if (collectionCount == 1) {
						valueArray.push (tmp[0]);
					} else {
						valueArray.push (tmp);
					}
					//ndx += increment;
				}
				return valueArray;

			} else {
				//value = XSeen.Parser.Types[attr.type] (value, attr.default, attr.caseInsensitive, attr.enumeration);
				value = XSeen.Parser.Types[attr.type] (value, attr.default, attr.caseInsensitive, attr.enumeration);
			}
			return value;
		},
	'getClassAttributeValue' : function (attribute, classList)
		{
			var classValue = null;
			if (classList === null) {return classValue;}
			for (var ii=0; ii<classList.length; ii++) {
				for (var jj=0; jj<classList[ii].declaration.length; jj++) {
					if (classList[ii].declaration[jj].property == attribute) {
						classValue = classList[ii].declaration[jj].value;
					}
				}
			}
			return classValue;
		},


/*
 *	Returns all of the available information about a specified field in a given tag. The
 *	property 'good' indicates that everything was found and could be handled. If 'good' is FALSE, then
 *	something went wrong or is missing.
 */
	'getAttrInfo' : function (tagName, attrName) {
		var attrInfo = {'good': false, 'tagExists': false, 'attrExists': false};
		if (typeof(tagName) === 'undefined' || tagName == '' || typeof(attrName) === 'undefined' || attrName == '') {return attrInfo;}
		var tagName = tagName.toLowerCase();
		if (typeof(XSeen.Parser.Table[tagName]) === 'undefined') {
			return attrInfo;
		}		// TODO: Need to convert all following from node => tag; field => attribute; and use new structures
		attrInfo.tagExists = true;
		var tag = XSeen.Parser.Table[tagName];
		var attrName = attrName.toLowerCase();
		if (typeof(tag.attrIndex[attrName]) === 'undefined') {
			return attrInfo;
		}
		attrInfo.attrExists = true;
		var attribute = tag.attributes[tag.attrIndex[attrName]];
		attrInfo.tag = tag;
		attrInfo.attribute = attribute;
		attrInfo.handlerName = tag.event;
		attrInfo.dataType = attribute.type;
		attrInfo.good = true;
		return attrInfo;
	},

// Utility methods for dealing with the entire parse table
	'dumpTable'	: function ()
		{
			var jsonstr = JSON.stringify ({'tags': XSeen.Parser.Table}, null, '  ');
			console.log('Node parsing table (' + XSeen.Parser.Table.length + ' tags)\n' + jsonstr);
			return jsonstr;
		},

// TODO: Write load function
	'loadTable'	: function (jsonstr)
		{
			var jsonstr = JSON.stringify ({'tags': XSeen.Parser.Table}, null, '  ');
			XSeen.Parser.Table = [];
		},
		
/*
 * DataType handlers. This convert from the user HTML to internal structure
 *	New types can be added in XSeen.Parser.Types.<new-name> = function (<attribute-value-string>, <attribute-default>, <value-caseInsensitive>, <attribute-enumeration-array>)
 *	The value returned is the parsed value in the requested datatype.
 *
 *	Only the string methods use 'insensitive'. Color is always converted to lower case.
 *	None of the vector or boolean methods use 'enumeration'
 */
	'Types'	: {
		'_checkEnumeration'	: function (value, def, enumeration)
			{
				for (var ii=0; ii<enumeration.length; ii++) {
					if (value == enumeration[ii]) {return value;}
				}
				if (enumeration.length == 0) {return value;}
				return def;
			},
/*
 *	Splits a string on white space, comma, paranthese, brackets; after triming for same
 *	Designed for a serialized collection of numeric values as an vector.
 *	Output is the array of split values
 */
		'_elementSplit'	: function(string) 
			{
				myRe = /[\s,\(\[\]\)]+/;
				return string.replace(/^[\s,\(\[\]\)]+|[\s,\(\[\]\)]+$/g, '').split (myRe);
			},

		'_splitArray'	: function (value, def, minCount)
			{
				if (typeof(value) == 'object') {
					return (value.length < minCount) ? def : value;
				}
				//console.log('Splitting |'+value+'|');
				var arrayValue = value.split(' ');
				if (arrayValue.length < minCount) {return def;}
				return arrayValue;
			},

		'string'	: function(value, def, insensitive, enumeration) 
			{
				if (insensitive) {value = value.toLowerCase();}
				if (value === null) {return def;}
				return this._checkEnumeration (value, def, enumeration);
			},
		'integer'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				if (Number.isNaN(value)) {return def};
				return Math.round(this._checkEnumeration (value, def, enumeration));
			},
		'float'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				if (Number.isNaN(value)) {return def};
				return this._checkEnumeration (value, def, enumeration)-0;
			},
		'vec2'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				//console.log('vec2 need to split |'+value+'|');
				var arrayValue = this._splitArray (value, def, 2);
				var retValue = [this.float(arrayValue[0], def[0], false, []),
								this.float(arrayValue[1], def[1], false, [])];
				return retValue;
			},
		'vec3'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				//console.log('vec3 need to split |'+value+'|');
				var arrayValue = this._splitArray (value, def, 3);
				var retValue = [this.float(arrayValue[0], def[0], false, []),
								this.float(arrayValue[1], def[1], false, []),
								this.float(arrayValue[2], def[2], false, [])];
				return retValue;
			},
		'xyz'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				var arrayValue = this._splitArray (value, def, 3);
				var retValue = {x:this.float(arrayValue[0], def[0], false, []),
								y:this.float(arrayValue[1], def[1], false, []),
								z:this.float(arrayValue[2], def[2], false, [])};
				return retValue;
			},
		'vec4'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				var arrayValue = this._splitArray (value, def, 4);
				var retValue = [this.float(arrayValue[0], def[0], false, []),
								this.float(arrayValue[1], def[1], false, []),
								this.float(arrayValue[2], def[2], false, []),
								this.float(arrayValue[3], def[3], false, [])];
				return retValue;
			},
		'vector'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				var arrayValue = this._splitArray (value, def);
				return arrayValue;
			},
		'boolean'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) return def;
				if (value === '') return def;
				var svalue = value.toLowerCase();
				if (svalue == '') return def;
				if (svalue == 'f' || svalue == 'false' || svalue == '0') return false;
				var ivalue = Boolean (value);
				return ivalue;
			},
		'vecToFloat3'	: function (value, def)
			{
				var retValue = [
					this.float(value[0], def[0], false, []),
					this.float(value[1], def[1], false, []),
					this.float(value[2], def[2], false, []),
				];
				return retValue;
			},
		'vecToXYZ'	: function (value, def)
			{
				var retValue = {
					'x':this.float(value[0], def.x, false, []),
					'y':this.float(value[1], def.y, false, []),
					'z':this.float(value[2], def.z, false, []),
				};
				return retValue;
			},
		'rotation2Quat'	: function (value)		// Converts axis-angle (vec4) to quaternion
			{
				var quat = new THREE.Quaternion();
				quat.setFromAxisAngle (new THREE.Vector3(value[0], value[1], value[2]), value[3]);
				return quat;
			},

/*
 * Color parsing order
 *	<integer>; Integer [0-16777215]. Key integer within range.
 *	#HHHHHH	24-bit hex value indicating color. Key '#'
 *	rgba(r g b a): where r,g,b are either byte-integers [0,255] or percent [0%-100%]; and a is [0.0-0.1] Key 'rgba(' and '%'
 *	rgb(r g b): where r,g,b are either byte-integers [0,255] or percent [0%-100%]. Key 'rgb(' and '%'
 *	f3(r g b): where r,g,b are fraction color values [0,1]. Key 'f3('
 *	f4(r g b a): where r,g,b are fraction color values [0,1]; and a is [0.0-0.1] Key 'f4(' 
 *	hsla(h,s,l,a): where h is [0-360], s&l are [0-100%]. Key 'hsla('
 *	hsl(h,s,l): where h is [0-360], s&l are [0-100%]. Key 'hsl('
 *	<color-name>: One of the 140 predefined HTML color names. This is enumerable (but not yet)
 *	<default used>
 */
		'color'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				value = value.trim().toLowerCase();
				if (!Number.isNaN(value) && Math.round(value) == value && (value-0 <= 16777215) && (value-0 >= 0)) {return this.colorIntRgb(value);}

				if (value.substring(0,1) == '#') {
					value = '0x' + value.substring(1,value.length) - 0;
					if (Number.isNaN(value) || value < 0 || value > 16777215) {return def;}
					return this.colorIntRgb(value);
				}
				
				if (value.substring(0,3) == 'rgb') {
					XSeen.LogWarn("RGB[A] color not yet implemented");
					console.log ("WARN: RGB[A] color not yet implemented");
				}
				if (value.substring(0,3) == 'hsl') {
					XSeen.LogWarn("HSL[A] color not yet implemented");
					console.log ("WARN: HSL[A] color not yet implemented");
				}
				if (value.substring(0,3) == 'f3(') {
					XSeen.LogWarn("HSL[A] color not yet implemented");
					console.log ("WARN: HSL[A] color not yet implemented");
					if (value.substring(value.length-1,value.length) != ')') {
						XSeen.LogWarn ("WARN: Illegal syntax for f3 color -- no closing ')'");
						console.log ("WARN: Illegal syntax for f3 color -- no closing ')'");
					} else {
						var colorString = value.substring(3,value.length-1);
						var colors = colorString.split(' ');
						return {'r':colors[0], 'g':colors[1], 'b':colors[2]};
					}
				}
				if (value.substring(0,3) == 'f4(') {
					XSeen.LogWarn("F4 color not yet implemented");
					console.log ("WARN: F4 color not yet implemented");
				}
				
				if (typeof(XSeen.CONST.Colors[value]) === 'undefined') {return def;}
				return this.colorIntRgb(XSeen.CONST.Colors[value]);	// TODO: add check on enumeration
				//return def;
			},
		'colorIntRgb' : function (colorInt)
			{
				var r = (colorInt & 0xff0000) >>> 16;
				var g = (colorInt & 0x00ff00) >>> 8;
				var b = (colorInt & 0x0000ff);
				return {'r':r/255., 'g':g/255., 'b':b/255.};
			},
		'colorRgbInt' : function (color)
			{
				if (typeof (color) !== 'object') return 0;
				var colorInt =	(Math.round(color.r*255) << 16) |
								(Math.round(color.g*255) << 8) |
								(Math.round(color.b*255));
				return colorInt;
			},

/*
 * Rotation parsing order
 *	e(rx ry rz): Euler rotation about (in local order) X, Y, and Z axis
 *	q(x y z w): Quaternion with 4 components
 *	h(x y z t): Homogeneous rotation of 't' about the vector [x, y, z]
 *	The default is e(). The 'e' and parantheses are optional. Case and spacing are important.
 *	The return value is always a quaternion
 *
 *	Only the following formats are implementated:
 *	1) Euler rotation without 'e(' and ')'
 *	2) Euler rotation with 'e(' and ')'
 *	3) Homogeneous (axis-angle) rotation with 'h(' and ')'
 */
		'rotation'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {value = def;}
				if (value == '') {value = def;}
				var eulerAngles, processed = false;
				var quat = new THREE.Quaternion();

				if (typeof(value) == 'string') {
					if (value.substring(0,2) == 'h(') {
						processed = true;
						value = value.substring(2,value.length-1);
						var axisAngle = this.vec4 (value, def, true, [0, 1, 0, 0]);
						quat = this.rotation2Quat (axisAngle);
						
					} else if (value.substring(0,2) == 'q(') {
						console.log ('No support yet for quaternion form of rotation');
						value = def;
						eulerAngles = this.vec3 (value, def, true, []);
	
					} else if (value.substring(0,2) == 'e(') {
						value = value.substring(2,value.length-1);
						eulerAngles = this.vec3 (value, def, true, []);

					} else {
						eulerAngles = this.vec3 (value, def, true, []);
					}
					
				} else {
					eulerAngles = value;
				}
				if (!processed) {
					var euler = new THREE.Euler();
					euler.fromArray (eulerAngles);
					quat.setFromEuler (euler);
				}
				return quat;
			},

	},		// End of 'Types' object
		
};
// File: ./XSeen.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 *	0.6.2: Fixed Camera and navigation bug
 *	0.6.3: Added Plane and Ring
 *	0.6.4: Fixed size determination bug
 *	0.6.5: Added Fog
 *	0.6.6: Added Metadata [Release]
 *	0.6.7: Added tknot (torus knot)
 *	0.6.8: Added PBR
 *	0.6.9: Preliminary fix for display size
 *	0.6.10: Fix for background urls not present
 *	0.6.11: Created common routine for loading texture cubes - fixed envMap for PBR.
 *	0.6.12: Simple animation (no way-points)
 *	0.6.13: Way point animation
 *	0.6.14: Mouse event creation
 *	0.6.15: Rotation animation
 *	0.6.16: Added Label tag
 *	0.6.17: Fixed a number of issues - asynchronous model loading, group, scene loading, camera
 *	0.6.18: Allowed user identified non-selectable geometry
 *	0.6.19: Fixed handling of skycolor in background
 *
 *	0.7.20: Added asset capability for Material
 *	0.7.21: Added axis-angle parsing for rotation
 *	0.7.22: Added additional color type f3 (fractional rgb - direct support for X3D)
 *	0.7.23: Added support for external XSeen files in XML format.
 *	0.7.24: Added support for device camera background use.
 *	0.7.25: Support device motion controlling object position
 *	0.7.26: Initial support for multiple cameras
 *	0.7.27: Spherical (photosphere) backgrounds
 *	0.7.28: Change event handling for background attributes
 *	0.7.29: Support indexed triangle sets. 
 *	0.7.30: Changed XSeen custom event names to xseen-touch (for all mouse-click) and xseen-render (for rendering) events
 *	0.7.31: Cleaned up some extra console output statements
 *	0.7.32: Support position attribute mutations for all 'solid' tags. (RC1)
 *	
 *	Resolve CAD positioning issue
 *	Stereo camera automatically adds button to go full screen. Add "text" attribute to allow custom text.
 *	Fix display size wrt browser window size
 *	Check background image cube for proper orientation (done See starburst/[p|n][x|y|z].jpg)
 *	--	Above is desired for 0.7 release
 *	Add geometry to asset tag
 *	Additional PBR
 *	Fix for style3d (see embedded TODO)
 *	Audio
 *	Editor
 *	Events (add events as needed)
 *	Labeling (add space positioning)
 * 
 */

//var Renderer = new THREE.WebGLRenderer();
//var Renderer = new THREE.WebGLRenderer({'alpha':true,});		// Sets transparent WebGL canvas

XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
XSeen.Constants = {
					'_Major'		: 0,
					'_Minor'		: 7,
					'_Patch'		: 32,
					'_PreRelease'	: 'rc1',
					'_Release'		: 7,
					'_Version'		: '',
					'_RDate'		: '2018-07-14',
					'_SplashText'	: ["XSeen 3D Language parser.", "XSeen <a href='https://xseen.org/index.php/documentation/' target='_blank'>Documentation</a>."],
					'tagPrefix'		: 'x-',
					'rootTag'		: 'scene',
					};
XSeen.CONST = XSeen.DefineConstants();
XSeen.Time =  {
					'start'		: (new Date()).getTime(),
					'now'		: (new Date()).getTime(),
				};
// Using the scheme at http://semver.org/
XSeen.Version = {
			'major'			: XSeen.Constants._Major,
			'minor'			: XSeen.Constants._Minor,
			'patch'			: XSeen.Constants._Patch,
			'preRelease'	: XSeen.Constants._PreRelease,
			'release'		: XSeen.Constants._Release,
			'version'		: XSeen.Constants._Major + '.' + XSeen.Constants._Minor + '.' + XSeen.Constants._Patch,
			'date'			: XSeen.Constants._RDate,
			'splashText'	: XSeen.Constants._SplashText,
			};
XSeen.Version.version += (XSeen.Version.preRelease != '') ? '-' + XSeen.Version.preRelease : '';
XSeen.Version.version += (XSeen.Version.release != '') ? '+' + XSeen.Version.release : '';

// Holds the list of onLoad callbacks
if (typeof(XSeen.onLoadCallBack) === 'undefined') {
	XSeen.onLoadCallBack = [];
}

// Holds all of the parsing information
XSeen.parseTable = [];

// Data object for Runtime
// Stereo viewing effect from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
//var StereoRenderer = new THREE.StereoEffect(Renderer);
XSeen.Runtime = {
			'currentTime'			: 0,			// Current time at start of frame rendering
			'deltaTime'				: 0,			// Time since last frame
			'frameNumber'			: 0,			// Number of frame about to be rendered
			'Time'					: new THREE.Clock(),
			'Renderer'				: {},
			'RendererStandard'		: {},			// One of these two renderers are used. 'onLoad' declares 
			'RendererStereo'		: {},			// these and 'camera' chooses which one
			'Camera'				: {},			// Current camera in use
			'CameraControl'			: {},			// Camera control to be used in Renderer for various types
			'DefinedCameras'		: [],			// Array of defined cameras
			'ViewManager'			: XSeen.CameraManager,
			'Mixers'				: [],			// Internal animation mixer array
			'perFrame'				: [],			// List of methods with data to execute per frame
			'Animate'				: function() {	// XSeen animation loop control
										//console.log ('Rendering loop, isStereographic: ' + XSeen.Runtime.isStereographic);
										if (XSeen.Runtime.isStereographic) {
											requestAnimationFrame (XSeen.Runtime.Animate);
											XSeen.RenderFrame();
										} else {
											XSeen.Runtime.Renderer.animate (XSeen.RenderFrame);
										}
									},
			'TweenGroups'			: [],
			'Resize'				: function () {
										if (!XSeen.Runtime.isStereographic) {
											XSeen.Runtime.Size = XSeen.updateDisplaySize (XSeen.Runtime.RootTag);
											XSeen.Runtime.Camera.aspect = XSeen.Runtime.Size.width / XSeen.Runtime.Size.height;
											XSeen.Runtime.Camera.updateProjectionMatrix();
											XSeen.Runtime.Renderer.setSize (XSeen.Runtime.Size.width, XSeen.Runtime.Size.height)
										}
									},
			'rulesets'				: [],			// Style ruleset array structure
			'StyleRules'			: {				// Collection of style rulesets
				'ruleset'	: [],					// Specific ruleset
				'idLookup'	: []	},				// Cross-reference into 'rulesets' by 'id'
			'selectable'			: [],			// Selectable geometry elements
			'isVrCapable'			: false,		// WebVR ready to run && access to VR device 
			'hasDeviceOrientation'	: false,		// device has Orientation sensor
			'hasVrImmersive'		: false,		// hasDeviceOrientation && stereographic capable (=== TRUE)
			'useDeviceOrientation'	: false,		// display is using device's Orientation sensor
			'isStereographic'		: false,		// currently running stereographic display (not VR)
			'rendererHasControls'	: false,		// Renderer has built-in motion controls
			'isProcessingResize'	: false,		// semaphore for resizing processing
			'mediaAvailable'		: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),	// flag for device media availability
			'isTransparent'			: false,		// flag for XSeen transparent background
			};										// Need place-holder for xR scene (if any -- tbd)
			
XSeen.RenderFrame = function()
	{
		if (XSeen.Runtime.isProcessingResize) {return;}		// Only do one thing at a time

		if (XSeen.Runtime.frameNumber == 0) {		// TODO: Replace with 'dirty' flag. May not need loadingComplete
			if (XSeen.Loader.loadingComplete()) {	//	Code needs to set Runtime.nodeChange whenever nodes are added/removed
				XSeen.Tags.scene.addScene();
			} else {
				return;
			}
		}
		XSeen.Runtime.deltaTime = XSeen.Runtime.Time.getDelta();
		XSeen.Runtime.currentTime = XSeen.Runtime.Time.getElapsedTime();
		XSeen.Runtime.frameNumber ++;

		var newEv = new CustomEvent('xseen-render', XSeen.Events.propertiesRenderFrame(XSeen.Runtime));
		XSeen.Runtime.RootTag.dispatchEvent(newEv);
		
/*
 *	Do various subsystem updates. Order is potentially important. 
 *	First position/orient camera & frame size so any calculations done on that use the new position
 *	Mixes handle internal (within model) animations
 *	Tween handles user-requested (in code) animations
 */
		XSeen.Update.Camera (XSeen.Runtime);
		XSeen.Update.Mixers (XSeen.Runtime);
		XSeen.Update.Tween (XSeen.Runtime);
		if (XSeen.Runtime.frameNumber > 1) XSeen.Update.Ticks (XSeen.Runtime);

		XSeen.Runtime.Renderer.render( XSeen.Runtime.SCENE, XSeen.Runtime.Camera );
	};
	
XSeen.Update = {
	'Tween'		: function (Runtime)
		{
			TWEEN.update();
			if (typeof(Runtime.TweenGroups) != 'undefined') {
				for (var ii=0; ii<Runtime.TweenGroups.length; ii++) {
					Runtime.TweenGroups[ii].update();
				}
			}
		},
	'Mixers'	: function (Runtime)
		{
			if (typeof(Runtime.Mixers) === 'undefined') return;
			for (var i=0; i<Runtime.Mixers.length; i++) {
				Runtime.Mixers[i].update(Runtime.deltaTime);
			}
		},
	'Ticks'		: function (Runtime)
		{
			for (var i=0; i<Runtime.perFrame.length; i++) {
				Runtime.perFrame[i].method (Runtime, Runtime.perFrame[i].userdata);
			}

		},
	'Camera'	: function (Runtime)
		{
			if (!Runtime.rendererHasControls) {
				Runtime.CameraControl.update();
			}
		},
	}

// Run the 'onLoad' method when the page is fully loaded
window.document.addEventListener('DOMContentLoaded', XSeen.onLoad);
// File: tags/animate.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 */

 // Tag definition code for animate

/*
 * <animate ...> tag with <key> child
 *	animate defines overall properties. It is possible to define animation without key.
 *	'key' provides the individual key frames. If the only key frames are the beginning and end,
 *	it is not necessary to use <key> children.
 *
 *	If duration attribute is '0' (or converts to it or is blank), then the value of <key duration> is used
 *	to compute the total duration (>0)
 *	The value of 'when' is the fraction [0,1] where that key frame occurs. keys with when <0 or when >1 are ignored
 *
 *	Each key may describe the animation curve and ease-in/out from when it starts for its duration.
 */

XSeen.Tags.animate = {
	'cnv'	: {		/* Insures that the correct case is used */
			'style' : {'in':'In', 'out':'Out', 'inout': 'InOut'},
			'type': {'linear':'Linear', 'quadratic':'Quadratic', 'sinusoidal':'Sinusoidal', 'exponential':'Exponential', 'elastic':'Elastic', 'bounce':'Bounce'},
			},
	'_easeCheck' : function (direction, type, store)
		{
			direction = (type != 'linear' && direction == '') ? 'inout' : direction;
			if (direction != '') {
				type = (type == 'linear') ? 'quadratic' : type;
				direction = XSeen.Tags.animate.cnv.style[direction];
				type = XSeen.Tags.animate.cnv.type[type];
			} else {
				direction = 'None';
				type = 'Linear';
			}
			store.easing = direction;
			store.easingtype = type;
		},
	_getTo: function (e, attrObject, toAttribute)
		{
			var to, interpolation, startingValue;
			to = XSeen.Parser.parseAttr(attrObject, e, []);	// Parsed data  -- need to convert to THREE format
			if (attrObject.type == 'float') {
				interpolation = TWEEN.Interpolation.Linear;
				to = XSeen.Parser.Types.float(to, 0.0, false, []);
				startingValue = 0;	// TODO: Only should be 0 if cannot get value from object
				XSeen.LogInfo("Interpolating field '" + toAttribute + "' as float.");

			} else if (attrObject.type == 'vec3') {
				interpolation = TWEEN.Interpolation.Linear;
				to = XSeen.Parser.Types.vecToXYZ(to, {'x':0,'y':0,'z':0});
				XSeen.LogInfo("Interpolating field '" + toAttribute + "' as 3-space.");

			} else if (attrObject.type == 'xyz') {				// No parsing necessary
				interpolation = TWEEN.Interpolation.Linear;
				XSeen.LogInfo("Interpolating field '" + toAttribute + "' as 3-space (no parse).");

			} else if (attrObject.type == 'color') {
				interpolation = XSeen.Tags.animate.Interpolator.color;
				if (typeof(to) == 'string') {to = new THREE.Color (XSeen.Parser.Types.color(to));}
				XSeen.LogInfo("Interpolation field '" + toAttribute + "' as color.");

			} else if (attrObject.type == 'vec4' || attrObject.type == 'rotation') {
				interpolation = XSeen.Tags.animate.Interpolator.slerp;
				//to = XSeen.types.Rotation2Quat(to);
				XSeen.LogInfo("Interpolation field '" + toAttribute + "' as rotation.");

			} else {
				XSeen.LogInfo("Field '" + toAttribute + "' not converted to THREE format. No animation performed.");
				return {'to':null, 'interpolation':null};
			}
			return {'to':to, 'interpolation':interpolation};
		},

	/*
	 *	The attribute maps to internal variables as follows (e._xseen):
	 *	delay ==> .delay -- Initial delay of animation
	 *	duration <= 0 ==> .keyFraction = false
	 *	duration > 0 ==> .keyFraction = true
	 *	duration ==> .duration (must be >= 0;otherwise ==0)
	 *	yoyo ==> .yoyo
	 *	repeat ==> .repeat (>= 0), Infinity (<0)
	 *	easing ==> .easing
	 *	easingType ==> .easingType
	 *	key[keyFrame_1{}, keyFrame_2{}, keyFrame_3{}, ...]
	 *
	 *	Each 'key' child provides the following
	 *	if !.keyFraction, then p._xseen.duration += e._xseen.duration
	 *	if .keyFraction && (when < 0 || when > 1) then ignore tag
	 *	p._xseen.key.push ({duration:, easing:, easingType, to:}) 
	 */
	'init'	: function (e,p) 
		{
			if (e._xseen.attributes.duration > 0) {
				e._xseen.keyFraction = true;
			} else {
				e._xseen.keyFraction = false;
				e._xseen.attributes.duration = 0;
			}
			XSeen.Tags.animate._easeCheck (e._xseen.attributes.easing, e._xseen.attributes.easingtype, e._xseen.attributes);
			e._xseen.key = [];
			
//	Save parent attribute object for requested field
			var toAttribute = e._xseen.attributes.attribute;
			var attributes = XSeen.Parser.Table[p.localName.toLowerCase()].attributes;
			e._xseen.attrObject = attributes[toAttribute].clone().setAttrName('to');	// Parse table entry for 'toAttribute'
			e._xseen.tagObject = new TWEEN.Group();
			
//	Revise code below here
/*
			var interpolator = e._xseen.attributes.interpolator;	// Not used (yet?)
			
			var attributes = XSeen.Parser.Table[p.localName.toLowerCase()].attributes;
			var attrIndex = XSeen.Parser.Table[p.localName.toLowerCase()].attrIndex;
			var toAttribute = e._xseen.attributes.attribute;
			var toAttrIndex = attrIndex[toAttribute];
			if (typeof(attributes[toAttrIndex]) === 'undefined') {
				XSeen.LogInfo("Field '" + toAttribute + "' not found in parent (" + p.localName.toLowerCase() + "). No animation performed.");
				return;
			}
			var attrObject = attributes[toAttrIndex].clone().setAttrName('to');	// Parse table entry for 'toAttribute'
 */
		},

	'fin'	: function (e,p)
		{
			console.log ('Check e._xseen.key for correct values');

			var duration = e._xseen.attributes.duration * 1000;	// TEMP: Convert to milliseconds
			var delay = e._xseen.attributes.delay * 1000;		// Convert to milliseconds
			//TEMP//var duration = e._xseen.attributes.duration * 1000;	// Convert to milliseconds
			var yoyo = e._xseen.attributes.yoyo;
			var repeat = (e._xseen.attributes.repeat < 0) ? Infinity : e._xseen.attributes.repeat;
			
/*
 * Convert 'to' to the datatype of 'field' and set interpolation type.
 *	interpolation is the type of interpolator (space, color space, rotational space)
 *	startingValue is the initial value of the field to be interpolated. The interpolation will update this field
 *		during animation. If the scene field needs a setter method, then use a local value. 
 *
 * TODO: Make sure local value is not overwritten on subsequent calls
 *	Really have no idea how to do this. Would like to have field.sub-field cause all sorts of 
 *	neat things to happen from a user perspective. I am not seeing how to do this for a general case.
 *	May need to handle things separately for each animation type.
 */
			var interpolation, startingValue;
			var attrObject = e._xseen.attrObject;
			var toAttribute = e._xseen.attributes.attribute;
			console.log ('Check for keyframes ... count: ' + e._xseen.key.length);
			if (e._xseen.key.length == 0) {		// Block handles no key frames
				var target = XSeen.Tags.animate._getTo (e, e._xseen.attrObject, e._xseen.attributes.attribute);
				if (target.to === null) {return; }
			
/*
 * Method when attribute value is handled via setter
 *	The attribute is a function rather than an object. The function handles the
 *	computation of the interpolant and updating of results. It is the argument
 *	of the .onUpdate method of Tween. The function takes the TweenData object as 
 *	an argument and updates the necessary field.
 */

				var fieldTHREE, useUpdate, tween, startingValue;
				if (typeof(p._xseen.animate[toAttribute]) == 'function') { 
					fieldTHREE = p._xseen.attributes[toAttribute];		// THREE field for animation
					var setter = {'from':fieldTHREE, 'current':fieldTHREE, 'attribute':toAttribute};
					useUpdate = true;
					tween = new TWEEN.Tween (setter, e._xseen.tagObject)
										.to({'current':target.to}, duration)
										.onUpdate(p._xseen.animate[toAttribute]);
					startingValue = fieldTHREE;

				} else {
					fieldTHREE = p._xseen.animate[toAttribute];			// THREE field for animation
																// TODO: The 'animate' array needs to be populated
																//	with the field in the tag object
																//	(._xseen.tagObject) that uses this label.
																//	The population MUST be done in the tag method
																//	as it is the only place it is defined. There is
																//	a problem if the object is not yet build :-(
					useUpdate = false;
					tween = new TWEEN.Tween(fieldTHREE, e._xseen.tagObject).to(target.to, duration);
					startingValue = fieldTHREE.clone();
				}
				e._xseen.initialValue = startingValue;

			
				tween	.delay(delay)
						.repeat(repeat)
						.interpolation(target.interpolation)
						.yoyo(yoyo);
				var easingType = e._xseen.attributes.easingtype;
				var easing = e._xseen.attributes.easing;
				if (easing != '') {
					tween.easing(TWEEN.Easing[easingType][easing]);
				}
				e._xseen.animating = tween;
				p._xseen.animation.push (tween);
				e._xseen.sceneInfo.TweenGroups.push (e._xseen.tagObject);
				tween.start();
/*
 *	Handle key frames.
 *	Use the provided keys (e._xseen.key[]) to construct TWEEN animations
 *	Each key creates one TWEEN. All Tweens are chained togeter (in order)
 *	Many <animate> attributes are ignored: interpolator, easing, easingtype, yoyo
 *	duration now contains the total duration of the animation, but it (the total) is also ignored
 *	repeat is either on (-1) or not (anything else). If it is on, then a chain is created from the last Tween to the first
 *
 *	TODO: At this time only deal with direct animation of THREE properties. 
 */
			} else {
				var fieldTHREE = p._xseen.animate[toAttribute];			// THREE field for animation
				var startingValue = fieldTHREE.clone();
				e._xseen.initialValue = startingValue;

				var tween0, tweenP, tween;
				tween0 = new TWEEN.Tween(fieldTHREE, e._xseen.tagObject);
				tween0	.to(e._xseen.key[0].to, duration)
						.delay(delay)
						.interpolation(e._xseen.key[0].interpolation)
						.easing(TWEEN.Easing[e._xseen.key[0].easingType][e._xseen.key[0].easing]);
				tweenP = tween0;
				for (var ii=1; ii<e._xseen.key.length; ii++) {
					tween = new TWEEN.Tween(fieldTHREE, e._xseen.tagObject);
					tween	.to(e._xseen.key[ii].to, duration)
							.delay(delay)
							.interpolation(e._xseen.key[ii].interpolation)
							.easing(TWEEN.Easing[e._xseen.key[ii].easingType][e._xseen.key[ii].easing]);
					tweenP.chain(tween);
					tweenP = tween;
				}
				if (repeat === Infinity) {
					console.log ('test');
					tween.chain(tween0);
				}
				tween0.start();
				e._xseen.animating = e._xseen.tagObject;
				p._xseen.animation.push (e._xseen.tagObject);
				e._xseen.sceneInfo.TweenGroups.push (e._xseen.tagObject);
			}

/*
 *	TODO: This section needs to be thought through. It may not apply or need to be changed if animation a 
 *	field of an attribute
 *
 * Put animation-specific data in node (e._xseen) so it can be accessed on events (through 'XSeen.Tags.animate')
 *	This includes initial value and field
 *	All handlers (goes into .handlers)
 *	TWEEN object
 */
			console.log ('Close up shop for animate...');
			e._xseen.handlers = {};
			e._xseen.handlers.setstart = XSeen.Tags.animate.setstart;
			e._xseen.handlers.setstop = XSeen.Tags.animate.setstop;
			e._xseen.handlers.setpause = XSeen.Tags.animate.setpause;
			e._xseen.handlers.setresetstart = XSeen.Tags.animate.setresetstart;
		},

	'event'	: function (ev, attr)
		{
			console.log ('Handling event ... for ' + attr);
		},


	'setstart'	: function (ev)
		{
			console.log ('Starting animation');
			XSeen.Tags.animate.destination._xseen.animating.start();
		},
	'setstop'	: function (ev) 
		{
			console.log ('Stopping animation');
			XSeen.Tags.animate.destination._xseen.animating.stop();
		},
/*
 * TODO: Update TWEEN to support real pause & resume. 
 *	Pause needs to hold current position
 *	Resume needs to restart the timer to current time so there is no "jump"
 */
	'setpause'	: function (ev) 
		{
			console.log ('Pausing (really stopping) animation');
			XSeen.Tags.animate.destination._xseen.animating.stop();
		},
	'setresetstart'	: function (ev) 	// TODO: Create seperate 'reset' method
		{
			console.log ('Reset and start animation');
			XSeen.Tags.animate.destination._xseen.animatingField = XSeen.Tags.animate.destination._xseen.initialValue;
			XSeen.Tags.animate.destination._xseen.animating.start();
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
				var fn = this.slerpCompute;		// TODO: not sure this is needed
	
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

XSeen.Tags.key = {
	/*
	 *	Each 'key' child provides the following
	 *	if !.keyFraction, then p._xseen.duration += e._xseen.duration
	 *	if .keyFraction && (when < 0 || when > 1) then ignore tag
	 *	p._xseen.key.push ({duration:, easing:, easingType, to:}) 
	 */
	'init'	: function (e,p) 
		{
			if (p.nodeName != 'X-ANIMATE') {return; }
			var duration = e._xseen.attributes.duration;
			if (!p._xseen.keyFraction) {
				if (duration <= 0) {return; }
				p._xseen.attributes.duration += duration;
			} else {
				if (duration <= 0 || duration > 1) {return; }
				duration *= p._xseen.attributes.duration;
			}
			XSeen.Tags.animate._easeCheck (e._xseen.attributes.easing, e._xseen.attributes.easingtype, e._xseen.attributes);
			var target = XSeen.Tags.animate._getTo (e, p._xseen.attrObject, p._xseen.attributes.attribute);
			p._xseen.key.push ({duration:duration, to:target.to, interpolation:target.interpolation, easing:e._xseen.attributes.easing, easingType:e._xseen.attributes.easingtype}) 
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr)
		{
			console.log ('Handling event ... for ' + attr);
		},
};



// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'animate',
						'init'	: XSeen.Tags.animate.init,
						'fin'	: XSeen.Tags.animate.fin,
						'event'	: XSeen.Tags.animate.event
//						'tick'	: XSeen.Tags.animate.tick
						})
		.defineAttribute ({'name':'attribute', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'to', dataType:'vector', 'defaultValue':[]})
		.defineAttribute ({'name':'delay', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'duration', dataType:'float', 'defaultValue':0.0})	// 0.0 ==> key time in seconds
		.defineAttribute ({'name':'repeat', dataType:'integer', 'defaultValue':0})

		.defineAttribute ({'name':'interpolator', dataType:'string', 'defaultValue':'position', enumeration:['position', 'rotation', 'color'], isCaseInsensitive:true})
		.defineAttribute ({'name':'easing', dataType:'string', 'defaultValue':'', enumeration:['', 'in', 'out', 'inout'], isCaseInsensitive:true})
		.defineAttribute ({'name':'easingtype', dataType:'string', 'defaultValue':'linear', enumeration:['linear', 'quadratic', 'sinusoidal', 'exponential', 'elastic', 'bounce'], isCaseInsensitive:true})
		.defineAttribute ({'name':'yoyo', dataType:'boolean', 'defaultValue':false})

		.defineAttribute ({'name':'start', dataType:'boolean', 'defaultValue':true})		// incoming event
		.defineAttribute ({'name':'stop', dataType:'boolean', 'defaultValue':true})			// incoming event
		.defineAttribute ({'name':'resetstart', dataType:'boolean', 'defaultValue':true})	// incoming event
		.defineAttribute ({'name':'pause', dataType:'boolean', 'defaultValue':true})		// incoming event
		.addTag();
XSeen.Parser.defineTag ({
						'name'	: 'key',
						'init'	: XSeen.Tags.key.init,
						'fin'	: XSeen.Tags.key.fin,
						'event'	: XSeen.Tags.key.event
						})
		.defineAttribute ({'name':'to', dataType:'vector', 'defaultValue':[]})
		.defineAttribute ({'name':'duration', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'easing', dataType:'string', 'defaultValue':'', enumeration:['', 'in', 'out', 'inout'], isCaseInsensitive:true})
		.defineAttribute ({'name':'easingtype', dataType:'string', 'defaultValue':'linear', enumeration:['linear', 'quadratic', 'sinusoidal', 'exponential', 'elastic', 'bounce'], isCaseInsensitive:true})
		.addTag();
// File: tags/asset.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 */

 // Control Node definitions

XSeen.Tags.asset = {
	'init'	: function (e, p) 
		{
		},
	'fin'	: function (e, p) 
		{
		},
	'event'	: function (ev, attr) {},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'asset',
						'init'	: XSeen.Tags.asset.init,
						'fin'	: XSeen.Tags.asset.fin,
						'event'	: XSeen.Tags.asset.event
						})
		.addTag();
// File: tags/background.js
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

/*
 * Single TODO to encompass all work
 *xx	1. Create function for determining source type (none, single image (image extension), image directory)
 *	2. Add attribute for image extension/type for use with (1)/directory
 *	3. Create function for determining background type based on supplied value. (1), and camera environment.
 *	4. Functions from (1) and (3) are used in the _changeAttribute method
 *	5. Update _changeAttribute to fully handle changes to all attributes (except geometry)
 *	6. Add color attribute to supersede skycolor
 *	7. Deprecate skycolor (not supported on change of attribute)
 */ 

XSeen.Tags.background = {
	'_changeAttribute'	: function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			// TODO: add handling of change to 'backgroundiscube' attribute. Need to tie this is an image format change.
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				var type = XSeen.Tags.background._saveAttributes (e);
				XSeen.Tags.background._processChange (e);
			} else {
				XSeen.LogWarn("Re-parse of " + attributeName + " is invalid -- no change")
			}
		},

/*
 *	Perform node initialization. This is done on the first encounter with each 'background' node.
 *	Some things are done "just in case". This includes setting up for a video background from device
 *	camera and creating photosphere geometry.
 *
 *	The video setup is only done if the device supports a camera. Note that no access to the camera 
 *	is requested until it is specified in the node (either on initial setting or attribute change
 *
 *	The photosphere geometry is set up, but made transparent. This ensures that it is in the 
 *	render tree
 *
 *	The method _processChange is called every time there is a change, either to the initial state
 *	or on attribute change.
 */
	'init'	: function (e, p) 
		{
			// This function doesn't really work because the 'enumerateDevices' method runs
			// asynchronously. Need to figure out some other way to check for existence.
			function cameraExists () {
				const constraints = {video: {facingMode: "environment"}};
				function handleError(error) {
					//console.error('Reeeejected!', error);
					console.log ('Device camera not available -- ignoring');
					exists = false;
				}

				var exists = false;
				navigator.mediaDevices.enumerateDevices(constraints)
					.then(gotDevices).catch(handleError);

				function gotDevices(deviceInfos) {
					for (var i = 0; i !== deviceInfos.length; ++i) {
						var deviceInfo = deviceInfos[i];
						console.log('Found a media device matching constraints of type: ' + deviceInfo.kind);
						exists = true;
					}
				}
				return true;
				//return exists;			// Function not working...
			}

			var t = e._xseen.attributes.radius;
			e._xseen.sphereRadius = (t <= 0) ? 500 : t;
			e._xseen.sphereDefined = false;
			e._xseen.videoState = 'undefined';
			
			// Need to declare photosphere here so that it can be put into the scene graph
			var geometry = new THREE.SphereBufferGeometry( e._xseen.sphereRadius, 60, 40 );
			// invert the geometry on the x-axis so that all of the faces point inward
			geometry.scale(-1, 1, 1);
			var material = new THREE.MeshBasicMaterial( {
											opacity: 0.0,
											transparent: true,
										} );
			var mesh = new THREE.Mesh( geometry, material );
			mesh.name = 'photosphere surface R=' + t;
			e._xseen.sphereDefined = true;
			e._xseen.sphere = mesh;
			mesh = null;
			e.parentNode._xseen.children.push(e._xseen.sphere);
			
			// Define video support
			if (XSeen.Runtime.mediaAvailable && XSeen.Runtime.isTransparent && cameraExists()) {
				var video = document.createElement( 'video' );
				video.setAttribute("autoplay", "1"); 
				video.height			= XSeen.Runtime.SceneDom.height;
				video.width				= XSeen.Runtime.SceneDom.width;
				video.style.height		= video.height + 'px';
				video.style.width		= video.width + 'px';
				video.style.position	= 'absolute';
				video.style.top			= '0';
				video.style.left		= '0';
				video.style.zIndex		= -1;
				e._xseen.video			= video;
				XSeen.Runtime.RootTag.appendChild (video);
				video = null;
				e._xseen.videoState		= 'defined';
			}
			
			var type = XSeen.Tags.background._saveAttributes (e);
			XSeen.Tags.background._processChange (e);
		},
		
// Move modifyable attribute values to main node store
	'_saveAttributes'	: function (e)
		{
			var t = e._xseen.attributes.color;
			e._xseen.color = new THREE.Color (t.r, t.g, t.b);
			e._xseen.imageSource = e._xseen.attributes.src;
			e._xseen.srcExtension = e._xseen.attributes.srcextension;

			var type = e._xseen.attributes.background;
			e._xseen.src = e._xseen.attributes.src;
			e._xseen.srcType = XSeen.Tags.background._checkSrc (e._xseen.src);
			if (type == 'camera') {
				if (e._xseen.videoState == 'undefined') {			// Rollback mechanism
					console.log ('Device camera requested, but not available or defined.');
					type = 'sky';
				} else if (e._xseen.videoState == 'running') {
					console.log ('Device camera requested, but it is already running.');
				} else if (e._xseen.videoState == 'defined') {
					console.log ('Device camera requested, need to engage it.');
				} else {
					console.log ('Device camera requested, but it is XSeen cannot handled it -- No change to background.');
				}
			}

			e._xseen.backgroundType = type;
			return type;
		},

	'_checkSrc'			: function (url) 
		{
			return (XSeen.isImage(url)) ? 'image' : 'path';
		},
		
	'_processChange'	: function (e)
		{
			if (e._xseen.videoState == 'running') {
				// TODO: turn off/pause camera
			}
			if (e._xseen.backgroundType == 'sky') {
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;
				e._xseen.sceneInfo.SCENE.background = e._xseen.color;
			
			} else if (e._xseen.backgroundType == 'camera') {
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;
				e._xseen.sceneInfo.SCENE.background = null;
				XSeen.Tags.background._setupCamera(e);

			} else if (e._xseen.backgroundType == 'fixed') {
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;
				e._xseen.loadTexture = new THREE.TextureLoader().load (e._xseen.attributes.src);
				e._xseen.loadTexture.wrapS = THREE.ClampToEdgeWrapping;
				e._xseen.loadTexture.wrapT = THREE.ClampToEdgeWrapping;
				e._xseen.sceneInfo.SCENE.background = e._xseen.loadTexture;

			} else {
				XSeen.Tags.background._loadBackground (e);
			}
		},
		
/* TODO: Method needs better/proper handling on change
 *	Only create one 'video' tag
 *	Only try to access the camera on the first request
 *	When this is not the background, then pause video feed
 *	Perhaps impose limitation that a XSeen cannot change to a video background
 *	May require capability to turn on/off background node
 */
	'_setupCamera'		: function (e)
		{
			const constraints = {video: {facingMode: "environment"}};
			if (e._xseen.videoState != 'defined') {
				console.log ('Camera/video not correctly configured. Current state: ' + e._xseen.videoState);
				return;
			}
			function handleSuccess(stream) {
				e._xseen.video.srcObject = stream;
				e._xseen.videoState = 'running';
				console.log ('Camera/video engaged and connected to display.');
			}
			function handleError(error) {
				//console.error('Reeeejected!', error);
				console.log ('Device camera not available -- ignoring');
				e._xseen.videoState = 'error';
			}

/*
 *	Debugging only. Figure out what media devices are available
			navigator.mediaDevices.enumerateDevices()
				.then(gotDevices).catch(handleError);

			function gotDevices(deviceInfos) {
				var msgs = '';
				for (var i = 0; i !== deviceInfos.length; ++i) {
					var deviceInfo = deviceInfos[i];
					console.log('Found a media device of type: ' + deviceInfo.kind);
					msgs += 'Found a media device of type: ' + deviceInfo.kind + "(" + deviceInfo.deviceId + '; ' + deviceInfo.groupId + ")\n";
				}
				//alert (msgs);
			}
*/

			navigator.mediaDevices.getUserMedia(constraints).
				then(handleSuccess).catch(handleError);
			//}
		},

/*
 *	Background textures can either be a cube-map image (1 image for each face of a cube) or
 *	a single equirectangular (photosphere) image of width = 2 x height. For any image, each dimension
 *	must be a power of 2. 
 *
 *	The attribute 'backgroundiscube' determines whether the texture is cube- or sphere- mapped.
 *	backgroundiscube == false ==> sphere-mapped texture. These attributes are also allowed:
 *		radius		sets the radius of the sphere that is constructed for the texture. This can only be set once.
 *		src			The sphere-mapped texture.
 *	backgroundiscube == true ==> cube-mapped texture. These attributes are also allowed:
 *		src			The cube-mapped texture that can take any of the following forms (all proceeded by domain and path):
 *			<file>.<extension> loads the specified image. This is not yet functioning [TODO]
 *			...path/ loads the 6 textures in the specified directory. The files MUST be called [n|p][x|y|z].jpg
 *			<full-file> with single '*'. This substitutes (in -turn) ['right', 'left', 'top', 'bottom', 'front', 'back']
 *						for the wild card character to load the 6 cube textures.
 */
 /*
  *		Old code slated for removal...
  *
	'_loadBackground'	: function (attributes, e)
		{
			// Parse src according the description above. 
			if (attributes.backgroundiscube) {
				var urls=[], files=[], tail='', srcFile='';
				var src = attributes.src.split('*');
				var sides = ['right', 'left', 'top', 'bottom', 'front', 'back'];
				var files = [];
				if (src.length == 2) {
					tail = src[src.length-1];
					srcFile = src[0];
					files = sides;
				} else {					// Also requires 'src' ends in '/'
					tail = '.jpg';
					srcFile = src;
					files = ['px', 'nx', 'py', 'ny', 'px', 'nz'];
				}
				for (var ii=0;  ii<sides.length; ii++) {
					urls[sides[ii]] = srcFile + files[ii] + tail;
					urls[sides[ii]] = (attributes['src'+sides[ii]] != '') ? attributes['src'+sides[ii]] : urls[sides[ii]];
/*
 * Old code that reflected a very X3D-centric means of specifying textures
				if (urls[sides[ii]] == '' || urls[sides[ii]] == sides[ii]) {
					urls[sides[ii]] = null;
				} else {
					urls2load ++;
				}
* End of even older code...
				}

				console.log ('Loading background image cube');
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', [urls['right'],
												urls['left'],
												urls['top'],
												urls['bottom'],
												urls['front'],
												urls['back']], '', XSeen.Tags.background.cubeLoadSuccess({'e':e}));
*/
	'_loadBackground'	: function (e)
		{
			// Parse src according the description above. 
			if (e._xseen.backgroundType == 'cube' && e._xseen.srcType == 'path') {
				var urls=[], files=[];
				var files = ['px.', 'nx.', 'py.', 'ny.', 'pz.', 'nz.'];
				for (var ii=0;  ii<files.length; ii++) {
					urls[ii] = e._xseen.src + files[ii] + e._xseen.srcExtension;
				}

				console.log ('Loading background image cube');
				var dirtyFlag;
				XSeen.Loader.TextureCube ('./', urls, '', XSeen.Tags.background.cubeLoadSuccess({'e':e}));
				e._xseen.sphere.material.transparent = true;
				e._xseen.sphere.material.opacity = 0.0;

			} else {		// Sphere-mapped texture. Need to do all of things specified in the above description
				if (e._xseen.backgroundType == 'sphere' && e._xseen.srcType == 'image') {
					if (!e._xseen.sphereDefined) {
						var geometry = new THREE.SphereBufferGeometry( e._xseen.sphereRadius, 60, 40 );
						// invert the geometry on the x-axis so that all of the faces point inward
						geometry.scale(-1, 1, 1);
						var material = new THREE.MeshBasicMaterial( {
											map: new THREE.TextureLoader().load(e._xseen.src)
										} );

						var mesh = new THREE.Mesh( geometry, material );
						e._xseen.sphereDefined = true;
						e._xseen.sphere = mesh;
						mesh = null;
						e.parentNode._xseen.children.push(e._xseen.sphere);	// Doesn't work because nothing pushes this up further...
					} else {
						e._xseen.sphere.material.map = new THREE.TextureLoader().load(e._xseen.src);
						e._xseen.sphere.material.transparent = false;
						e._xseen.sphere.material.opacity = 1.0;
						e._xseen.sphere.material.needsUpdate = true;
						console.log (e._xseen.sphere.material);
					}
				}
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'cubeLoadSuccess' : function (userdata)
		{
			var thisEle = userdata.e;
			return function (textureCube)
			{
				thisEle._xseen.processedUrl = true;
				thisEle._xseen.loadTexture = textureCube;
				thisEle._xseen.sceneInfo.SCENE.background = textureCube;
				console.log ('Successful load of background texture cube.');
			}
		},
	'loadProgress' : function (a)
		{
			console.log ('Loading background textures...');
		},
	'loadFailure' : function (a)
		{
			//a._xseen.processedUrl = false;
			console.log ('Load failure');
			console.log ('Failure to load background textures.');
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'background',
						'init'	: XSeen.Tags.background.init,
						'fin'	: XSeen.Tags.background.fin,
						'event'	: XSeen.Tags.background.event,
						'tick'	: XSeen.Tags.background.tick
						})
		.defineAttribute ({'name':'color', dataType:'color', 'defaultValue':'black'})
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':500})
		.defineAttribute ({'name':'background', dataType:'string', 'defaultValue':'sky', enumeration:['sky', 'cube', 'sphere', 'fixed', 'camera'], isCaseInsensitive:true})
		.defineAttribute ({'name':'srcExtension', dataType:'string', 'defaultValue':'jpg', enumeration:['jpgsky', 'jpeg', 'png', 'gif'], isCaseInsensitive:true})
		.defineAttribute ({'name':'srcfront', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcback', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcleft', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcright', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srctop', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'srcbottom', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'backgroundiscube', dataType:'boolean', 'defaultValue':true})
		.defineAttribute ({'name':'fixed', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'usecamera', dataType:'boolean', 'defaultValue':'false', 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.background._changeAttribute}]})
		.addTag();
//	TODO: Convert backgroundiscube to backgroundtype with the values sky(D) | cube | sphere | fixed | camera. Remove 'fixed' and change logic throughout.
// File: tags/camera.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * Dual licensed under the MIT and GPL
 */

 // Control Node definitions

XSeen.Tags.camera = {
	'init'	: function (e, p) 
		{
			e._xseen.properties = {};
			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.type = e._xseen.attributes.type;
			e._xseen.track = e._xseen.attributes.track;
			if (e._xseen.track == 'examine') e._xseen.track = 'trackball';
/*
 *	These are now set in the Camera Manager
			e._xseen.sceneInfo.Camera.position.set (
							e._xseen.attributes.position.x,
							e._xseen.attributes.position.y,
							e._xseen.attributes.position.z);
			e._xseen.sceneInfo.Camera.lookAt(0,0,0);		// Look at origin. Seems to be required for object type.
 */
			e._xseen.priority = e._xseen.attributes.priority;
			if (e._xseen.priority < 0) {e._xseen.priority = 1;}
			e._xseen.available = e._xseen.attributes.available;
/*
 * Handle camera target. Target is an HTML id attribute value,
 * must exist, and be defined (and parsed) prior to the camera tag parsing.
 * This section handles the existence and gets the tagObject associated with the referenced tag.
 */
			e._xseen.target = null;
			if (e._xseen.attributes.target != '') {
				var tagElement = document.getElementById (e._xseen.attributes.target);
				if (typeof(tagElement) == 'object' && typeof(tagElement._xseen) != 'undefined' && typeof(tagElement._xseen.tagObject) != 'undefined') {
					e._xseen.target = tagElement._xseen.tagObject;
				}
			}
 
/*
 *	Handle the camera type and tracking capabilities
 *	The allowed types and capabilities are dependent on the display device
 *	(isVrCapable and hasDeviceOrientation). 
 *
 *	'orthographic'	==> all devices support and all manual tracking is allowed (no VR, no Device)
 *	'perspective'	==> all devices support and all manual tracking is allowed. Device tracking is allowed if hasDeviceOrientation
 *	'stereo'		==> all devices support and all manual tracking is allowed. Device tracking is allowed if hasDeviceOrientation
 *						Object tracking is allowed if hasDeviceOrientation and target != null
 *	'vr'			==> only allowed if isVrCapable
 *
 *	Rollbacks: If the requested type and/or tracking is not allowed the the following rollback is used:
 *
 *	'vr'		==> stereo/device OR stereo/target if hasDeviceOrientation
 *				==> perspective/orbit otherwise
 *	'device'	==> orbit if !hasDeviceOrientation
 */
 
			if (e._xseen.type == 'orthographic') {			// TODO: Orthographic projection
			
			} else if (e._xseen.type == 'perspective') {	// Perspective camera -- default
				if (e._xseen.track == 'device') {
					if (e._xseen.sceneInfo.hasDeviceOrientation) {
						e._xseen.track = (e._xseen.target === null) ? 'environment' : 'object'
						e._xseen.sceneInfo.useDeviceOrientation = true;
					} else {
						e._xseen.track = 'orbit';
						e._xseen.sceneInfo.useDeviceOrientation = false;
					}
				}
				
			} else if (e._xseen.type == 'stereo') {	// Stereo perspective cameras
				var track = (e._xseen.target === null) ? 'environment' : 'object'
				if (e._xseen.track == 'device' && !e._xseen.sceneInfo.hasDeviceOrientation) {track = 'orbit';}
				e._xseen.track = track;
				e._xseen.sceneInfo.Renderer = e._xseen.sceneInfo.RendererStereo;
				e._xseen.sceneInfo.rendererHasControls = false;
				e._xseen.sceneInfo.isStereographic = true;
				// Need to add a button to the display to go full screen
 
			} else if (e._xseen.type == 'vr') {	// Stereo perspective cameras
				if (e._xseen.sceneInfo.isVrCapable) {
					e._xseen.sceneInfo.Renderer.vr.enabled = true;
					e._xseen.sceneInfo.rendererHasControls = true;
					document.body.appendChild( WEBVR.createButton( e._xseen.sceneInfo.Renderer ) );
				} else if (e._xseen.sceneInfo.hasDeviceOrientation) {
					e._xseen.type = 'stereo';
					e._xseen.track = 'device';
					e._xseen.sceneInfo.Renderer = e._xseen.sceneInfo.RendererStereo;
					e._xseen.sceneInfo.rendererHasControls = false;
					e._xseen.sceneInfo.isStereographic = true;
					// Need to add a button to the display to go full screen
				} else {													// Flat screen
					e._xseen.type = 'perspective';
					e._xseen.track = 'orbit';
				}
			}

/*
 *	TODO: support multiple cameras
 *	If multiple cameras are to be allowed, then the above processing needs to occur for each
 *	camera. What follows is for the camera in use because it sets the specific controls. Note
 *	that above the 'stereographic' and 'vr' modes set the renderer. Other modes may set a scene
 *	variable. This needs to be "re-factored" into setup and use. All 'setup' processing and
 *	definitions are stored in the node. The 'use' phase determines which camera will be active
 *	and extracts the details from the node. This sounds like a data array that references each camera
 *	so the 'use' phase can get to the right information. There will also need to be a mechanism for
 *	determining which camera is active or active next. Perhaps a 'priority' field with cameras at
 *	the same priority being handled in declared order. An 'active' event would allow the designated camera
 *	to become the next active camera. The process would also inactivate the current camera. The other
 *	choice would be a stack of some sort.
 *
 *	Data structures:
 *	 In XSeen.Runtime:
 *		add cameras = sparse array of arrays. The hash is accessed in reverse numerical order and is the priority
 *			of the camera. Each inner array contains references to all cameras at that priority. Each 
 *			outer array element is an array with at least one element.
 *		add currentCamera as a reference to the active camera (not possible to have no active cameras)
 *	 XSeen automatically creates a priority 0 camera (normal priorities > 0; highest priority camera is next-active)
 *	 Store above parameters (track, isStereographic, etc.) in node
 *	 Add event to activate camera. This has no effect as an attribute.
 *	 When a camera activates, data in the node (element._xseen...) is retrieved and used to determine the 
 *		renderer and other system camera parameters. Note that if a target is specified, then it needs to be
 *		checked when the camera is activated. Activating a camera causes the current active camera to deactivate.
 *	 No special processing is required for deactivating a camera.
 *
 *	A viewpoint list can be constructed with the x-class3d tag setting the same camera parameters and each 
 *	x-camera node having different position/rotation attributes.
 *
 *	None of this should change the animation of a camera, though I don't know if the existing mechanisms
 *	correctly handle orientation change.
 *
 *	Motivation for multiple cameras:
 *	When loading an external XSeen source it may be necessary to include a camera in the external file to
 *	handle 'target'. It is necessary to include a camera (at least XSeen default) so that the first frame can
 *	be rendered. 
 *
 */
 
/*
 *	Handle camera controls for (navigational) tracking. 
 *	This applies to stereo (device & object) and perspective with track != none.
 *	TODO: orthographic camera
 */
			if (!e._xseen.sceneInfo.rendererHasControls) {
				if (e._xseen.sceneInfo.useDeviceOrientation) {
					if (e._xseen.track == 'object') {	// tracking scene object
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.target, true);
					} else {							// tracking environment
						e._xseen.sceneInfo.CameraControl = new THREE.DeviceOrientationControls(e._xseen.sceneInfo.Camera);
					}

				} else {								// No device orientation control. Use something else
					if (e._xseen.track == 'orbit') {
						e._xseen.sceneInfo.CameraControl = new THREE.OrbitControls( e._xseen.sceneInfo.Camera, e._xseen.sceneInfo.RendererStandard.domElement );
					} else if (e._xseen.track == 'trackball') {
						//console.log ('Trackball');
					} else if (e._xseen.track == 'none') {
						//console.log ('No tracking');
						e._xseen.sceneInfo.rendererHasControls = true;
					} else {
						console.log ('Something else');
					}
				}
			}

			e._xseen.sceneInfo.ViewManager.add (e);
			//if (typeof(e._xseen.sceneInfo.DefinedCameras[e._xseen.priority]) == 'undefined') {e._xseen.sceneInfo.DefinedCameras[e._xseen.priority] = [];}
			//e._xseen.sceneInfo.DefinedCameras[e._xseen.priority].push (e);
			//e._xseen.ndxCamera = e._xseen.sceneInfo.DefinedCameras.length - 1;
			//e._xseen.sceneInfo.DefinedCameras[e._xseen.priority].push ('Defined ' + e._xseen.type + ' camera#' + e.id + ' at (' + e._xseen.attributes.position.x + ', ' + e._xseen.attributes.position.y + ', ' + e._xseen.attributes.position.z + ')');
			//console.log ('Adding camera at priority ' + e._xseen.priority);
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr)
		{
		},

	'tick'	: function (systemTime, deltaTime)
		{
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'camera',
						'init'	: XSeen.Tags.camera.init,
						'fin'	: XSeen.Tags.camera.fin,
						'event'	: XSeen.Tags.camera.event,
						'tick'	: XSeen.Tags.camera.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'perspective', enumeration:['perspective','stereo','orthographic','vr'], isCaseInsensitive:true})
		.defineAttribute ({'name':'track', dataType:'string', 'defaultValue':'none', enumeration:['none', 'orbit', 'fly', 'examine', 'trackball', 'device'], isCaseInsensitive:true})
		.defineAttribute ({'name':'priority', dataType:'integer', 'defaultValue':1})
		.defineAttribute ({'name':'available', dataType:'boolean', 'defaultValue':true})
		.defineAttribute ({'name':'target', dataType:'string', 'defaultValue':''})
		.addTag();
// File: tags/fog.js
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

XSeen.Tags.fog = {
	'init'	: function (e, p) 
		{
			var fog = new THREE.Fog (
						e._xseen.attributes.color,
						e._xseen.attributes.near,
						e._xseen.attributes.far);

			e._xseen.tagObject = fog;
			e._xseen.sceneInfo.SCENE.fog = fog;
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr)
		{
		},

	'tick'	: function (systemTime, deltaTime)
		{
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'fog',
						'init'	: XSeen.Tags.fog.init,
						'fin'	: XSeen.Tags.fog.fin,
						'event'	: XSeen.Tags.fog.event,
						'tick'	: XSeen.Tags.fog.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'color', dataType:'color', 'defaultValue':'white'})
		.defineAttribute ({'name':'near', dataType:'float', 'defaultValue':'1'})
		.defineAttribute ({'name':'far', dataType:'float', 'defaultValue':'1'})
		.addTag();
// File: tags/group.js
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

XSeen.Tags.group = {
	'init'	: function (e, p) 
		{
			var group = new THREE.Group();
			var rotation = {'x':0, 'y':0, 'z':0, 'w':0};
			//var rotation = XSeen.types.Rotation2Quat(e._XSeen.attributes.rotation);	TODO: Figure out rotations
			group.name = 'Transform children [' + e.id + ']';
			group.position.x	= e._xseen.attributes.position.x;
			group.position.y	= e._xseen.attributes.position.y;
			group.position.z	= e._xseen.attributes.position.z;
			group.scale.x		= e._xseen.attributes.scale.x;
			group.scale.y		= e._xseen.attributes.scale.y;
			group.scale.z		= e._xseen.attributes.scale.z;
			group.setRotationFromQuaternion (e._xseen.attributes.rotation);
			
			var bx, by, bz, q, tx, ty, tz;
			q = group.quaternion;
			bx = new THREE.Vector3 (1, 0, 0);
			by = new THREE.Vector3 (0, 1, 0);
			bz = new THREE.Vector3 (0, 0, 1);
			bx = bx.applyQuaternion (q);
			by = by.applyQuaternion (q);
			bz = bz.applyQuaternion (q);
			
			e._xseen.properties = e._xseen.properties || [];
			e._xseen.properties['rotatex'] = Math.atan2 (bx.z, bx.y);
			e._xseen.properties['rotatey'] = Math.atan2 (by.z, by.x);
			e._xseen.properties['rotatez'] = Math.atan2 (bz.y, bz.x);
				
			//e._xseen.animate['translation'] = group.position;
			e._xseen.animate['rotation'] = group.quaternion;
			//e._xseen.animate['scale'] = group.scale;
			e._xseen.animate['rotatex'] = 'rotateX';
			e._xseen.animate['rotatey'] = 'rotateY';
			e._xseen.animate['rotatez'] = 'rotateZ';
			
			e._xseen.animate['position']	= group.position;
			e._xseen.animate['scale']		= group.scale;
			e._xseen.animate['rotate-x']	= XSeen.Tags.Solids._animateRotation (group, 'rotateX');
			e._xseen.animate['rotate-y']	= XSeen.Tags.Solids._animateRotation (group, 'rotateY');
			e._xseen.animate['rotate-z']	= XSeen.Tags.Solids._animateRotation (group, 'rotateZ');

			e._xseen.loadGroup = group;
			e._xseen.tagObject = e._xseen.loadGroup;
			e._xseen.update = XSeen.Tags.group.animateObject;
		},
	'fin'	: function (e, p) 
		{
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					e._xseen.loadGroup.add(child);
				});
			p._xseen.children.push(e._xseen.loadGroup);

		},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'setactive'	: function (ev) {},
	'animateObject'	: function (x, property, value) 
		{
			x.loadGroup[property](value);
			console.log (value);
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'group',
						'init'	: XSeen.Tags.group.init,
						'fin'	: XSeen.Tags.group.fin,
						'event'	: XSeen.Tags.group.event,
						'tick'	: XSeen.Tags.group.tick
						})
		.addSceneSpace()
		.addTag();

/*
		.defineAttribute ({'name':'translation', dataType:'vec3', 'defaultValue':[0,0,0], 'isAnimatable':true})
		.defineAttribute ({'name':'scale', dataType:'vec3', 'defaultValue':[1,1,1], 'isAnimatable':true})
		.defineAttribute ({'name':'rotation', dataType:'rotation', 'defaultValue':'0 0 0', 'isAnimatable':true})
		.defineAttribute ({'name':'rotatex', dataType:'float', 'defaultValue':'0.0', 'isAnimatable':true})
		.defineAttribute ({'name':'rotatey', dataType:'float', 'defaultValue':'0.0', 'isAnimatable':true})
		.defineAttribute ({'name':'rotatez', dataType:'float', 'defaultValue':'0.0', 'isAnimatable':true})
 */
// File: tags/label.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 */

 // Control Node definitions

XSeen.Tags.label = {
	'selectedLabel'	: {},
	'init'	: function (e, p) 
		{
			var type = e._xseen.attributes.type;
			if (!(type == 'fixed' || type == 'tracking' || type == 'draggable')) {type = 'fixed';}
			e._xseen.labelType = type;
			e._xseen.targets = [];
			e._xseen.tagObject = [];
		},
	
	'fin'	: function (e, p)
		{
			var labelElement, targetElement, targetPosition, labelPosition, positionedInSpace;
			var material;
			labelElement = e.getElementsByTagName('div')[0];
			labelPosition = new THREE.Vector3(0, 0, -1);	// center of near-clipping plane
			positionedInSpace = false;
			if (e._xseen.attributes.position.x != 0 || e._xseen.attributes.position.y != 0) {
				e._xseen.attributes.position.z = -1;
				positionedInSpace = true;
			}
			material = new THREE.LineBasicMaterial( {color: XSeen.Parser.Types.colorRgbInt(e._xseen.attributes['leadercolor']), } );

			e._xseen.labelObj = [];
			for (var ii=0; ii<e._xseen.targets.length; ii++) {
				targetElement = e._xseen.targets[ii];
				targetPosition = new THREE.Vector3();
				targetElement._xseen.tagObject.getWorldPosition(targetPosition);

				var geometry = new THREE.Geometry();
				var line = new THREE.Line( geometry, material );

				var labelObj = {
						'method'		: XSeen.Tags.label.tick,
						'position'		: XSeen.Tags.label['position_'+e._xseen.labelType],
						'node'			: e,
						'_xseen'		: e._xseen,
						'RunTime'		: e._xseen.sceneInfo,
						'target'		: targetElement,
						'targetWorld'	: new THREE.Vector3(),
						'label'			: labelElement,
						'labelWorld'	: new THREE.Vector3(0, 0, -1),
						'labelDelta'	: {x: 0, y: 0},
						'line'			: line,
						'initialized'	: false,
						'spacePosition'	: positionedInSpace,
				};
				targetElement._xseen.tagObject.getWorldPosition(labelObj.targetWorld);
				geometry.vertices.push(
						labelObj.targetWorld,
						labelObj.labelWorld);
				labelObj.line.geometry.verticesNeedUpdate = true;
				e._xseen.sceneInfo.perFrame.push ({'method':XSeen.Tags.label.tick, 'userdata':labelObj});
				e._xseen.tagObject.push (line);
				p._xseen.children.push (line);
			}

			// Set up event handlers
			e.addEventListener ('xseen', XSeen.Tags.label.tick, true);						// Render frame
			if (e._xseen.labelType == 'draggable') {
				labelElement.addEventListener ('mousedown', XSeen.Tags.label.MouseDown);	// label movement if type='draggable'
			}
		},
	'event'	: function (ev, attr) {},
	'tick'	: function (rt, label)
		{
			label.position (rt, label);
			label.target._xseen.tagObject.getWorldPosition(label.targetWorld);
			label.line.geometry.verticesNeedUpdate = true;
		},
		
// Event handler for mouse dragging of label
	'MouseDown' : function (ev)
		{
			XSeen.Tags.label.selectedLabel.state = 'down';
			XSeen.Tags.label.selectedLabel.element = ev.target;
			XSeen.Tags.label.selectedLabel.pointerOffset = [ev.x-this.offsetLeft, ev.y-this.offsetTop];
			this.addEventListener ('mousemove', XSeen.Tags.label.MouseMove);
			this.addEventListener ('mouseup', XSeen.Tags.label.MouseUp);
//			console.log ('Mouse Down on movable at Event: ' + ev.x + ', ' + ev.y + '; Offset [' + 
//					XSeen.Tags.label.selectedLabel.pointerOffset[0] + ', ' + 
//					XSeen.Tags.label.selectedLabel.pointerOffset[1] + ']');
		},
	'MouseUp'	: function (ev)
		{
			XSeen.Tags.label.selectedLabel.element.removeEventListener ('mousemove', XSeen.Tags.label.MouseMove);
			XSeen.Tags.label.selectedLabel.element.removeEventListener ('mouseup', XSeen.Tags.label.MouseUp);
			XSeen.Tags.label.selectedLabel.state = '';
			XSeen.Tags.label.selectedLabel.element = {};
			//console.log ('Mouse Up on movable at Event: ');
		},
	'MouseMove'	: function (ev)
		{
			XSeen.Tags.label.selectedLabel.state = 'move';
			this.style.left = ev.x - XSeen.Tags.label.selectedLabel.pointerOffset[0] + 'px';
			this.style.top  = ev.y - XSeen.Tags.label.selectedLabel.pointerOffset[1] + 'px';
			ev.cancelBubble = true;
			//console.log ('Mouse Move on movable at Event: ');
		},

// The 'position_*' methods correspond to the type attribute
	'position_draggable'	: function (rt, label)
		{
			label.position = XSeen.Tags.label.position_fixed;
			label.position (rt, label);
		},
	'position_fixed'	: function (rt, label)
		{
			label.labelWorld.x = 0 -1 + 2 * (label.label.offsetLeft + label.label.offsetWidth/2)   * rt.Size.iwidth;
			label.labelWorld.y = 0 +1 - 2 * (label.label.offsetTop  + label.label.offsetHeight/2) * rt.Size.iheight;
			label.labelWorld.z = -1;
			label.labelWorld = label.labelWorld.unproject (rt.Camera);
			label.labelWorld.initialized = true;
		},

	'position_tracking'	: function (rt, label)
		{
			var projected = label.targetWorld.clone();
			projected.project(rt.Camera);
			var w2, h2, labelx, labely;
			w2 = rt.Size.width / 2;
			h2 = rt.Size.height / 2;
			projected.x = w2 + (projected.x * w2);
			projected.y = h2 - (projected.y * h2);
			if (!label.initialized) {
				label.labelDelta.x = projected.x - label.label.offsetLeft;
				label.labelDelta.y = projected.y - label.label.offsetTop;
				label.initialized = true;
			}

			labelx = projected.x - label.labelDelta.x;
			labely = projected.y - label.labelDelta.y;
			label.label.style.left = labelx + 'px';
			label.label.style.top  = labely + 'px';

			XSeen.Tags.label.position_fixed (rt, label);
		},
	
};
XSeen.Tags.leader = {
	'init'	: function (e, p) 
		{
			var targetElement = document.getElementById (e._xseen.attributes.target);
			if (typeof(targetElement) === 'undefined' || targetElement === null) {return;}
			p._xseen.targets.push (targetElement);
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'label',
						'init'	: XSeen.Tags.label.init,
						'fin'	: XSeen.Tags.label.fin,
						'event'	: XSeen.Tags.label.event
						})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'fixed', enumeration:['fixed', 'draggable', 'tracking'], isCaseInsensitive:true, 'isAnimatable':false})
		.defineAttribute ({'name':'position', dataType:'xyz', 'defaultValue':{x:0, y:0, z:0}})
		.defineAttribute ({'name':'leadercolor', dataType:'color', 'defaultValue':{'r':1,'g':1,'b':0}})
		.addTag();
XSeen.Parser.defineTag ({
						'name'	: 'leader',
						'init'	: XSeen.Tags.leader.init,
						'fin'	: XSeen.Tags.leader.fin,
						'event'	: XSeen.Tags.leader.event
						})
		.defineAttribute ({'name':'target', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.addTag();
// File: tags/light.js
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

 // Tag definition code for light


XSeen.Tags.light = {
	'init'	: function (e,p) 
		{
			var color = e._xseen.attributes.color;
			var intensity = e._xseen.attributes.intensity - 0;
			var lamp, type=e._xseen.attributes.type;

			if (type == 'point') {
				// Ignored field -- e._xseen.attributes.location
				lamp = new THREE.PointLight (color, intensity);
				lamp.distance = Math.max(0.0, e._xseen.attributes.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.attributes.attenuation[1]/2 + e._xseen.attributes.attenuation[2]);

			} else if (type == 'spot') {
				lamp = new THREE.SpotLight (color, intensity);
				lamp.position.set(0-e._xseen.attributes.direction[0], 0-e._xseen.attributes.direction[1], 0-e._xseen.attributes.direction[2]);
				lamp.distance = Math.max(0.0, e._xseen.attributes.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.attributes.attenuation[1]/2 + e._xseen.attributes.attenuation[2]);
				lamp.angle = Math.max(0.0, Math.min(1.5707963267948966192313216916398, e._xseen.attributes.cutoffangle));
				lamp.penumbra = 1 - Math.max(0.0, Math.min(lamp.angle, e._xseen.attributes.beamwidth)) / lamp.angle;

			} else {											// DirectionalLight (by default)
				lamp = new THREE.DirectionalLight (color, intensity);
				lamp.position.x = 0-e._xseen.attributes.direction[0];
				lamp.position.y = 0-e._xseen.attributes.direction[1];
				lamp.position.z = 0-e._xseen.attributes.direction[2];
			}
			lamp.name = 'Light: ' + e.id;
			e._xseen.tagObject = lamp;
			p._xseen.children.push(lamp);
			lamp = null;
		},

	'fin'	: function (e,p)
		{
		},

	'event'	: function (ev, attr)
		{
		},

	'tick'	: function (systemTime, deltaTime)
		{
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'light',
						'init'	: XSeen.Tags.light.init,
						'fin'	: XSeen.Tags.light.fin,
						'event'	: XSeen.Tags.light.event,
						'tick'	: XSeen.Tags.light.tick
						})
		.defineAttribute ({'name':'on', dataType:'boolean', 'defaultValue':true})
		.defineAttribute ({'name':'color', dataType:'color', 'defaultValue':0xFFFFFF, 'isAnimatable':true})
		.defineAttribute ({'name':'intensity', dataType:'float', 'defaultValue':1.0, 'isAnimatable':true})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'directional', enumeration:['directional','spot','point'], isCaseInsensitive:true, 'isAnimatable':false})
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':100, 'isAnimatable':true})
		.defineAttribute ({'name':'attenuation', dataType:'vec3', 'defaultValue':[1,0,0], 'isAnimatable':false})
		.defineAttribute ({'name':'direction', dataType:'vec3', 'defaultValue':[0,0,-1], 'isAnimatable':true})
		.defineAttribute ({'name':'cutoffangle', dataType:'float', 'defaultValue':3.14, 'isAnimatable':true})
		.defineAttribute ({'name':'beamwidth', dataType:'float', 'defaultValue':1.57, 'isAnimatable':true})
		.addTag();
// File: tags/metadata.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 */

/*
 * The metadata tag defines metadata for an XSeen tag. Each metadata tag can define an individual value
 * or a collection of values stored as children elements. Metadata tags do not contain values.
 * A metadata structure is created by nesting additional metadata tags as children of a metadata tag.
 * All global HTML attributes are supported (and ignored).
 *
 * Changes to any metadata tag causes the entire metadata structure to be rebuilt and resaved
 * to the parent tag's data structure.
 *
 * Metadata is accessible with the getMetadata method called on the XSeen tag. It optionally
 * takes the name of the top-level metadata element name. Metadata tags without the 'name'
 * attribute create ascending array elements (using <object>.push).
 *
 */

 
/*
 * Need to parse out name and save it. Creation of the metadata structure is not done until 'fin' to
 * allow for children
 *
 *	Goal is to end up with a structure that for each child level there is an array element for each metadata tag
 *	and if 'name' is defined, there is exist a reference to that array element. Parent tag contains the entire
 *	structure of their children.
 *	<[parent] ...>
 *		<metadata name='c1' value='1'></metadata>
 *		<metadata name='c2'>
 *			<metadata name='c2.1' value='-1'></metadata>
 *			<metadata name='c2.2' value='test'></metadata>
 *			<metadata value='no name'></metadata>
 *		</metadata>
 *		<metadata name='c3' value='label1'></metadata>
 *			<metadata name='c3.1' value='-1'></metadata>
 *			<metadata name='c3.2' value='test'></metadata>
 *		</metadata>
 *	</[parent]>
 *
 * produces:
 *	[parent].Metadata(
 *						[0]		=> '1',
 *						[1]		=> (
 *									[0]		=> '',
 *									[1]		=> '-1',
 *									[2]		=> 'test',
 *									[3]		=> 'no name',
 *									['c2.1']=> (-->[1]),
 *									['c2.2']=> (-->[2])
 *									)
 *						[2]		=> (
 *									[0]		=> 'label1'
 *									[1]		=> '-1',
 *									[2]		=> 'test',
 *									['c3.1']=> (-->[1]),
 *									['c3.2']=> (-->[2])
 *									)
 *						['c1']	=> (-->[0]),
 *						['c2']	=> (-->[1]),
 *						['c3']	=> (-->[2])
 *					]
 * Metadata init
 */
XSeen.Tags.metadata = {
	'init'	: function (e, p) 
		{
			// Get name, value, and type
			// Parse value according to 'type'
			// Save this value in e._xseen.Metadata['name' : value]
			e._xseen.tmp.meta = [];
			e._xseen.tmp.meta.push (e._xseen.attributes.value);
			if (typeof(p._xseen.tmp.meta) == 'undefined') {p._xseen.tmp.meta = [];}
		},
	'fin'	: function (e, p) 
		{
			if (e._xseen.tmp.meta.length == 1) {		// this is a leaf tag
				p._xseen.tmp.meta.push (e._xseen.tmp.meta[0]);
				e._xseen.Metadata.push (e._xseen.tmp.meta[0]);
			} else {
				p._xseen.tmp.meta.push (e._xseen.tmp.meta);
				e._xseen.Metadata.push (e._xseen.tmp.meta);
			}
			if (e._xseen.attributes.name != '') {p._xseen.tmp.meta[e._xseen.attributes.name] = p._xseen.tmp.meta[p._xseen.tmp.meta.length-1];}
			e._xseen.tmp.meta = [];
		},
	'event'	: function (ev, attr) {},
	'changeValue'	: function (ev, attr) 
		{
			// Change this value and reparse Metadata tree
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'metadata',
						'init'	: XSeen.Tags.metadata.init,
						'fin'	: XSeen.Tags.metadata.fin,
						'event'	: XSeen.Tags.metadata.event
						})
		.defineAttribute ({'name':'name', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'value', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'string', enumeration:['string','integer', 'float', 'vector', 'object'], isCaseInsensitive:true, 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.metadata.changeValue}]})
		.addTag();
// File: tags/model.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 */

 // Control Node definitions
 
/*
 * xxTODO: Update xseen... XSeen...
 * DONE:  TODO: Add standard position, rotation, and scale fields with XSeen.Tags.setSpace method
 * DONE:  TODO: Improve handling of file formats that the loaders cannot do version distinction (gltf)
 * DONE:  TODO: Save current URL so any changes can be compared to increase performance
 * TODO: Add handling of changing model URL - need to stop & delete animations
 * TODO: Investigate how to add 'setValue' and 'getValue' to work with [s|g]etAttribute
 * TODO: Implement default path/URL for loader.
 */

XSeen.Tags.model = {
	'init'	: function (e, p) 
		{
			e._xseen.processedUrl = false;
			e._xseen.tmpGroup = new THREE.Group();
			e._xseen.tmpGroup.name = 'External Model [' + e.id + ']';
			e._xseen.loadGroup = new THREE.Group();
			e._xseen.loadGroup.name = 'External Model [' + e.id + ']';
			e._xseen.loadGroup.name = 'Parent of |' + e._xseen.tmpGroup.name  + '|';
			e._xseen.loadGroup.add (e._xseen.tmpGroup);
			//XSeen.Tags._setSpace (e._xseen.loadGroup, e._xseen.attributes);
			XSeen.Tags._setSpace (e._xseen.tmpGroup, e._xseen.attributes);
			//console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
			XSeen.Loader.load (e._xseen.attributes.src, e._xseen.attributes.hint, XSeen.Tags.model.loadSuccess({'e':e, 'p':p}), XSeen.Tags.model.loadFailure, XSeen.Tags.model.loadProgress);
			e._xseen.requestedUrl = true;
			e._xseen.tagObject = e._xseen.loadGroup;
			p._xseen.children.push(e._xseen.loadGroup);
			//console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	
					// Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
	'loadProgress' : function (a1) {
		if (a1.total == 0) {
			console.log ('Progress loading '+a1.type);
		} else {
			console.log ('Progress ('+a1.type+'): ' + a1.loaded/a1.total * 100 + '%');
		}
	},
	'loadFailure' : function (a1) {
		console.log ('Failure ('+a1.type+'): ' + a1.timeStamp);
	},
	'loadSuccess' : function (userdata) {
						var e = userdata.e;
						var p  = userdata.p;
						return function (response) {
							e._xseen.processedUrl = true;
							e._xseen.requestedUrl = false;
							e._xseen.loadText = response;
							e._xseen.currentUrl = e._xseen.attributes.src;

// Something is not loading into the scene. It may be a synchronization issue.
							console.log("Successful download for |"+e.id+'|');
							//e._xseen.loadGroup.add(response.scene);		// This works for glTF
							e._xseen.tmpGroup.add(response.scene);		// This works for glTF
							//p._xseen.children.push(e._xseen.loadGroup);
							console.log ('glTF loading complete and inserted into parent');
							//p._xseen.children.push(mesh);
/*
 ** TODO: Need to go deeper into the structure
 * See https://stackoverflow.com/questions/26202064/how-to-select-a-root-object3d-using-raycaster
 *
 * Reference to 'root' may be incorrect. See Events.js for details as to how it is used.
 */
							XSeen.Tags.model.addReferenceToRoot (response.scene, e);
							p._xseen.sceneInfo.selectable.push(response.scene)
							p._xseen.sceneInfo.SCENE.updateMatrixWorld();
							if (response.animations !== null) {				// This is probably glTF specific
								e._xseen.mixer = new THREE.AnimationMixer (response.scene);
								e._xseen.sceneInfo.Mixers.push (e._xseen.mixer);
							} else {
								e._xseen.mixer = null;
							}

							if (e._xseen.attributes.playonload != '' && e._xseen.mixer !== null) {			// separate method?
								if (e._xseen.attributes.playonload == '*') {			// Play all animations
									response.animations.forEach( function ( clip ) {
										console.log('  starting animation for '+clip.name);
										if (e._xseen.attributes.duration > 0) {clip.duration = e._xseen.attributes.duration;}
										e._xseen.mixer.clipAction( clip ).play();
									} );
								} else {											// Play a specific animation
									var clip = THREE.AnimationClip.findByName(response.animations, e._xseen.attributes.playonload);
									var action = e._xseen.mixer.clipAction (clip);
									action.play();
								}
							}
						}
					},

	'addReferenceToRoot' : function (ele, root)
		{
			//console.log ('addReferenceToRoot -- |' + ele.name + '|');
			//if (ele.isObject) {
				ele.userData.root = root;
			//}
			ele.children.forEach (function(elm) {
				//p._xseen.sceneInfo.selectable.push(elm);
				XSeen.Tags.model.addReferenceToRoot (elm, root);
			});
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'model',
						'init'	: XSeen.Tags.model.init,
						'fin'	: XSeen.Tags.model.fin,
						'event'	: XSeen.Tags.model.event,
						'tick'	: XSeen.Tags.model.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'hint', dataType:'string', 'defaultValue':''})	// loader hint - typically version #
		.defineAttribute ({'name':'playonload', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'duration', dataType:'float', 'defaultValue':-1, 'isAnimatable':false})
		.addTag();
// File: tags/scene.js
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

XSeen.Tags.scene = {
	'DEFAULT'	: {
			'Viewpoint'	: {
				'Position'		: [0, 0, 10],
				'Orientation'	: [0, 1, 0, 0],		// TODO: fix (and below) when handling orientation
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
	'init'	: function (e, p) 
		{
			e._xseen.sceneInfo.SCENE = new THREE.Scene();
			// Stereo viewing effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(e._xseen.sceneInfo.Renderer);

		},
	'fin'	: function (e, p) 
		{

/*
 *	Add an event listener to this node for resize events
 */
			window.addEventListener ('resize', XSeen.Runtime.Resize, false);
/*
 * TODO: Need to get current top-of-stack for all stack-bound nodes and set them as active.
 *	This only happens the initial time for each XSeen tag in the main HTML file
 *
 *	At this time, only Viewpoint is stack-bound. Probably need to stack just the <Viewpoint>._xseen object.
 *	Also, .fields.position is the initial specified location; not the navigated/animated one
 */

//			XSeen.LogInfo("Ready to kick off rendering loop");
//			XSeen.renderFrame();
			//RunTest (e._xseen.sceneInfo);
// Configure current camera
			e._xseen.sceneInfo.ViewManager.setNext();
			
			if (e._xseen.attributes.cubetest) {
				XSeen.LogInfo("Kicking off THREE testing code and rendering");
				DoRestOfCubes (e._xseen.sceneInfo);
			} else {
				//XSeen.Runtime.SCENE.background = new THREE.Color(0xbb0000);
				//XSeen.Runtime.Renderer.animate( XSeen.RenderFrame() );
				XSeen.Runtime.Animate();
			}
		},
	'resize': function () {
			var thisTag = XSeen.Runtime.RootTag;
			XSeen.Runtime.Camera.aspect = thisTag.offsetWidth / thisTag.offsetHeight;
			XSeen.Runtime.Camera.updateProjectionMatrix();
			XSeen.Runtime.Renderer.setSize (thisTag.offsetWidth, thisTag.offsetHeight)
		},
	'addScene': function () {
			// Render all Children
			var e = XSeen.Runtime.RootTag;
			console.log ('Adding children to SCENE');
			e._xseen.idReference = e._xseen.idReference || Array();
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					if (e._xseen.idReference[child.id] === undefined) {
						console.log('Adding child of type ' + child.type + ' (' + child.name + '/' + child.id + ') with ' + child.children.length + ' children to THREE scene');
						e._xseen.sceneInfo.SCENE.add(child);
						e._xseen.idReference[child.id] = child;
						//console.log('Check for successful add');
					}
				});
//			XSeen.LogDebug("Rendered all elements -- Starting animation");

		},
	'event'	: function (ev, attr)
		{
		},

	'tick'	: function (systemTime, deltaTime)
		{
		},
};


// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'scene',
						'init'	: XSeen.Tags.scene.init,
						'fin'	: XSeen.Tags.scene.fin,
						'event'	: XSeen.Tags.scene.event,
						'tick'	: XSeen.Tags.scene.tick
						})
		.defineAttribute ({'name':'cubetest', dataType:'boolean', 'defaultValue':false})
		.addTag();
// File: tags/solids.js
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

 // Tag definition code for light

XSeen.Tags.Solids = {};
XSeen.Tags._appearance = function (e) {
			e._xseen.texture = null;
			if (e._xseen.attributes['map'] !== '') {
				console.log ('Loading texture: |'+e._xseen.attributes['map']+'|');
				e._xseen.texture = new THREE.TextureLoader().load (e._xseen.attributes['map']);
				e._xseen.texture.wrapS = THREE.ClampToEdgeWrapping;
				e._xseen.texture.wrapT = THREE.ClampToEdgeWrapping;
			}
			e._xseen.properties['side'] = THREE.FrontSide;
			if (e._xseen.attributes['side'] == 'back') e._xseen.properties['side'] = THREE.BackSide;
			if (e._xseen.attributes['side'] == 'both') e._xseen.properties['side'] = THREE.DoubleSide;

			var parameters, appearance;
			if (e._xseen.attributes.material != '') {
				var ele = document.getElementById (e._xseen.attributes.material);
				if (typeof(ele) != 'undefined') {
					appearance = ele._xseen.tagObject;
				} else {
					console.log ('Reference to undeclared material: ' + e._xseen.attributes.material);
					appearance = {};
				}
			} else if (e._xseen.attributes.type == 'phong') {
				parameters = {
							'aoMap'					: e._xseen.attributes['ambient-occlusion-map'],
							'aoMapIntensity'		: e._xseen.attributes['ambient-occlusion-map-intensity'],
							'color'					: XSeen.Parser.Types.colorRgbInt (e._xseen.attributes['color']),
							'displacementMap'		: e._xseen.attributes['displacement-map'],
							'displacementScale'		: e._xseen.attributes['displacement-scale'],
							'displacementBias'		: e._xseen.attributes['displacement-bias'],
							'emissive'				: e._xseen.attributes['emissive'],
							'map'					: e._xseen.texture,
							'normalMap'				: e._xseen.attributes['normal-map'],
							'normalScale'			: e._xseen.attributes['normal-scale'],
							'side'					: e._xseen.properties['side'],
							'wireframe'				: e._xseen.attributes['wireframe'],
							'wireframeLinewidth'	: e._xseen.attributes['wireframe-linewidth'],
// General material properties
							'emissiveIntensity'		: e._xseen.attributes['emissive-intensity'],
							'opacity'				: e._xseen.attributes['opacity'],
							'transparent'			: e._xseen.attributes['transparent'],
// General material properties that only apply to Phong or PBR
							'reflectivity'			: e._xseen.attributes['reflectivity'],
							'refractionRatio'		: e._xseen.attributes['refraction-ratio'],
// Phong properties
							'shininess'				: e._xseen.attributes['shininess'],
							'specular'				: e._xseen.attributes['specular'],
							};
				appearance = new THREE.MeshPhongMaterial(parameters);
			} else if (e._xseen.attributes.type == 'pbr') {
				parameters = {
							'aoMap'					: e._xseen.attributes['ambient-occlusion-map'],
							'aoMapIntensity'		: e._xseen.attributes['ambient-occlusion-map-intensity'],
							'color'					: XSeen.Parser.Types.colorRgbInt (e._xseen.attributes['color']),
							'displacementMap'		: e._xseen.attributes['displacement-map'],
							'displacementScale'		: e._xseen.attributes['displacement-scale'],
							'displacementBias'		: e._xseen.attributes['displacement-bias'],
							'emissive'				: e._xseen.attributes['emissive'],
							'map'					: e._xseen.texture,
							'normalMap'				: e._xseen.attributes['normal-map'],
							'normalScale'			: e._xseen.attributes['normal-scale'],
							'side'					: e._xseen.properties['side'],
							'wireframe'				: e._xseen.attributes['wireframe'],
							'wireframeLinewidth'	: e._xseen.attributes['wireframe-linewidth'],
// General material properties
							'emissiveIntensity'		: e._xseen.attributes['emissive-intensity'],
							'opacity'				: e._xseen.attributes['opacity'],
							'transparent'			: e._xseen.attributes['transparent'],
// General material properties that only apply to Phong or PBR
							'reflectivity'			: e._xseen.attributes['reflectivity'],
							'refractionRatio'		: e._xseen.attributes['refraction-ratio'],
// PBR properties
							'metalness'				: e._xseen.attributes['metalness'],
							'roughness'				: e._xseen.attributes['roughness'],
							};
				appearance = new THREE.MeshPhysicalMaterial(parameters);
			} else {
				parameters = {
							'aoMap'					: e._xseen.attributes['ambient-occlusion-map'],
							'aoMapIntensity'		: e._xseen.attributes['ambient-occlusion-map-intensity'],
							'color'					: XSeen.Parser.Types.colorRgbInt (e._xseen.attributes['color']),
							'displacementMap'		: e._xseen.attributes['displacement-map'],
							'displacementScale'		: e._xseen.attributes['displacement-scale'],
							'displacementBias'		: e._xseen.attributes['displacement-bias'],
							'emissive'				: e._xseen.attributes['emissive'],
							'map'					: e._xseen.texture,
							'normalMap'				: e._xseen.attributes['normal-map'],
							'normalScale'			: e._xseen.attributes['normal-scale'],
							'side'					: e._xseen.properties['side'],
							'wireframe'				: e._xseen.attributes['wireframe'],
							'wireframeLinewidth'	: e._xseen.attributes['wireframe-linewidth'],
// General material properties
							'emissiveIntensity'		: e._xseen.attributes['emissive-intensity'],
							'opacity'				: e._xseen.attributes['opacity'],
							'transparent'			: e._xseen.attributes['transparent'],
							};
				appearance = new THREE.MeshBasicMaterial(parameters);
			}
			return appearance;
}
XSeen.Tags._solid = function (e, p, geometry) {
			var appearance = XSeen.Tags._appearance (e);

			//geometry.needsUpdate = true;
	
			// Create mesh, set userData and animateable fields
			var mesh = new THREE.Mesh (geometry, appearance);
			mesh.userData = e;
			XSeen.Tags._setSpace(mesh, e._xseen.attributes);

			e._xseen.animate['position']			= mesh.position;
			e._xseen.animate['scale']				= mesh.scale;
			e._xseen.animate['rotate-x']			= XSeen.Tags.Solids._animateRotation (mesh, 'rotateX');
			e._xseen.animate['rotate-y']			= XSeen.Tags.Solids._animateRotation (mesh, 'rotateY');
			e._xseen.animate['rotate-z']			= XSeen.Tags.Solids._animateRotation (mesh, 'rotateZ');
			e._xseen.animate['color']				= mesh.material.color;
			e._xseen.animate['emissive']			= mesh.material.emissive;
			e._xseen.animate['normalScale']			= mesh.material.normalScale;
			e._xseen.animate['wireframeLinewidth']	= mesh.material.wireframeLinewidth;
			e._xseen.animate['emissiveIntensity']	= mesh.material.emissiveIntensity;
			e._xseen.animate['opacity']				= XSeen.Tags.Solids._animateScalar (mesh.material, 'opacity');
			e._xseen.animate['reflectivity']		= mesh.material.reflectivity;
			e._xseen.animate['refractionRatio']		= mesh.material.refractionRatio;
			e._xseen.animate['shininess']			= mesh.material.shininess;
			e._xseen.animate['specular']			= mesh.material.specular;
			e._xseen.animate['displacementScale']	= mesh.material.displacementScale;
			e._xseen.animate['displacementBias']	= mesh.material.displacementBias;
			e._xseen.animate['emissive']			= mesh.material.emissive;
			e._xseen.animate['normalScale']			= mesh.material.normalScale;
			e._xseen.animate['metalness']			= mesh.material.metalness;
			e._xseen.animate['roughness']			= mesh.material.roughness;

			if (e._xseen.attributes.selectable) p._xseen.sceneInfo.selectable.push(mesh);
			mesh.name = 'Solid: ' + e.id;
			
			e._xseen.tagObject = mesh;
			p._xseen.children.push(mesh);
			e._xseen.properties.envMap = XSeen.Tags.Solids._envMap(e, e._xseen.attributes['env-map']);
};
XSeen.Tags.Solids._animateScalar = function (obj, field) {
	var target = {'obj':obj, 'field':field};
	return function (td) {
		target.obj[target.field] = td.current;
		//console.log ('_animateScalar return function for populating "' + target.field + '" with ' + td.current);
	};
}
// Rotation is difference because it is an incremental value that needs to be put into a method
//	td.current (used in _animateScalar) is the current interpolant. Need to find the difference between
//	td.current (now) and td.current (previous).
XSeen.Tags.Solids._animateRotation = function (obj, field) {
	if (typeof(obj.userData.previousRotation) == 'undefined') {obj.userData.previousRotation = {'x':0, 'y':0, 'z':0};}
	var target = {'obj':obj, 'field':field};
	if (field == 'rotateX') {
		return function (td) {
			var rotation = td.current - target.obj.userData.previousRotation.x;
			target.obj.rotateX(rotation);
			target.obj.userData.previousRotation.x = td.current;
		};
	}
	if (field == 'rotateY') {
		return function (td) {
			var rotation = td.current - target.obj.userData.previousRotation.y;
			target.obj.rotateY(rotation);
			target.obj.userData.previousRotation.y = td.current;
		};
	}
	if (field == 'rotateZ') {
		return function (td) {
			var rotation = td.current - target.obj.userData.previousRotation.z;
			target.obj.rotateZ(rotation);
			target.obj.userData.previousRotation.z = td.current;
		};
	}
}

XSeen.Tags.Solids._changeAttribute = function (e, attributeName, value) {
			//console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				if (attributeName == 'color') {				// Different operation for each attribute
					e._xseen.tagObject.material.color.setHex(value);	// Solids are stored in a 'group' of the tagObject
					e._xseen.tagObject.material.needsUpdate = true;
				} else if (attributeName == 'env-map') {				// Different operation for each attribute
					//console.log ('Changing envMap to |' + value + '|');
					e._xseen.properties.envMap = XSeen.Tags.Solids._envMap(e, value);
				} else if (attributeName == 'metalness') {
					//console.log ('Setting metalness to ' + value);
					e._xseen.tagObject.material.metalness = value;
				} else if (attributeName == 'roughness') {
					//console.log ('Setting roughness to ' + value);
					e._xseen.tagObject.material.roughness = value;
				} else if (attributeName == 'position') {
					console.log ('Setting position to ' + value);
					e._xseen.tagObject.position.x = value.x;
					e._xseen.tagObject.position.y = value.y;
					e._xseen.tagObject.position.z = value.z;
				} else {
					XSeen.LogWarn('No support for updating ' + attributeName);
				}
			} else {
				XSeen.LogWarn("Reparse of " + attributeName + " is invalid -- no change")
			}
};

// TODO: This is very specific and only for debug/development purposes. Needs to be fixed.
XSeen.Tags.Solids._envMap = function (e, envMapUrl) {
			var envMap, basePath = 'Resources/textures/';
			if (envMapUrl == 'desert') {
				XSeen.Loader.TextureCube (basePath + 'desert_1/', [], '.jpg', XSeen.Tags.Solids.loadSuccess({'e':e}));

			} else if (envMapUrl == 'forest') {
				XSeen.Loader.TextureCube (basePath + 'forest_1/', [], '.jpg', XSeen.Tags.Solids.loadSuccess({'e':e}));

			} else if (envMapUrl == 'gray') {
				XSeen.Loader.TextureCube (basePath + 'gray99/', [], '.jpg', XSeen.Tags.Solids.loadSuccess({'e':e}));
/*				envMap = new THREE.CubeTextureLoader()
											.setPath('Resources/textures/')
											.load ([
													'gray99-right.png',
													'gray99-left.png',
													'gray99-top.png',
													'gray99-bottom.png',
													'gray99-front.png',
													'gray99-back.png',
											]);
 */
			} else if (envMapUrl == 'color') {
				XSeen.Loader.TextureCube (basePath + 'starburst/', [], '.jpg', XSeen.Tags.Solids.loadSuccess({'e':e}));

			} else {
				envMap = null;
			}
			return envMap;
};

// This method assumes that the target is an environment map in a material in a mesh. It won't
// for a material-only node. Perhaps I need a new field that is a reference to the environment map
// location
XSeen.Tags.Solids.loadSuccess = function (userdata) {
	var thisEle = userdata.e;
	return function (textureCube)
	{
		//thisEle._xseen.processedUrl = true;
		if (thisEle._xseen.tagObject.type == 'Material') {
			thisEle._xseen.tagObject.envMap = textureCube;
			thisEle._xseen.tagObject.needsUpdate = true;
		} else {
			thisEle._xseen.tagObject.material.envMap = textureCube;
			thisEle._xseen.tagObject.material.needsUpdate = true;
		}
		console.log ('Successful load of environment textures.');
	}
};

XSeen.Tags.material = {
	'init'	: function (e,p)
		{
			var material = XSeen.Tags._appearance (e);
			e._xseen.tagObject = material;
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

XSeen.Tags.box = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.BoxGeometry(
										e._xseen.attributes.width, 
										e._xseen.attributes.height, 
										e._xseen.attributes.depth,
										e._xseen.attributes['segments-width'], 
										e._xseen.attributes['segments-height'], 
										e._xseen.attributes['segments-depth']
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

XSeen.Tags.cone = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.ConeGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.height, 
										e._xseen.attributes['segments-radial'], 
										e._xseen.attributes['segments-height'], 
										e._xseen.attributes['open-ended'], 
										e._xseen.attributes['theta-start'] * XSeen.CONST.Deg2Rad, 
										e._xseen.attributes['theta-length'] * XSeen.CONST.Deg2Rad
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};
	
XSeen.Tags.cylinder = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.CylinderGeometry(
										e._xseen.attributes['radius-top'], 
										e._xseen.attributes['radius-bottom'], 
										e._xseen.attributes.height, 
										e._xseen.attributes['segments-radial'], 
										e._xseen.attributes['segments-height'], 
										e._xseen.attributes['open-ended'], 
										e._xseen.attributes['theta-start'] * XSeen.CONST.Deg2Rad, 
										e._xseen.attributes['theta-length'] * XSeen.CONST.Deg2Rad
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

XSeen.Tags.dodecahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.DodecahedronGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.detail
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};
	
XSeen.Tags.icosahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.IcosahedronGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.detail
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};
	
XSeen.Tags.octahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.OctahedronGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.detail
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};
	
XSeen.Tags.sphere = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.SphereGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes['segments-width'], 
										e._xseen.attributes['segments-height'], 
										e._xseen.attributes['phi-start'] * XSeen.CONST.Deg2Rad, 
										e._xseen.attributes['phi-length'] * XSeen.CONST.Deg2Rad,
										e._xseen.attributes['theta-start'] * XSeen.CONST.Deg2Rad, 
										e._xseen.attributes['theta-length'] * XSeen.CONST.Deg2Rad
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};
	
XSeen.Tags.tetrahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TetrahedronGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.detail
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

XSeen.Tags.torus = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TorusGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.tube, 
										e._xseen.attributes['segments-radial'], 
										e._xseen.attributes['segments-tubular'], 
										e._xseen.attributes.arc * XSeen.CONST.Deg2Rad
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

XSeen.Tags.tknot = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TorusKnotGeometry(
										e._xseen.attributes.radius, 
										e._xseen.attributes.tube, 
										e._xseen.attributes['segments-tubular'], 
										e._xseen.attributes['segments-radial'], 
										e._xseen.attributes['wind-p'], 
										e._xseen.attributes['wind-q'], 
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

/*
 * 2D Shapes
 */
 
XSeen.Tags.plane = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.PlaneGeometry(
										e._xseen.attributes.width, 
										e._xseen.attributes.height, 
										e._xseen.attributes['segments-width'], 
										e._xseen.attributes['segments-height'], 
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

XSeen.Tags.ring = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.RingGeometry(
										e._xseen.attributes['radius-inner'], 
										e._xseen.attributes['radius-outer'], 
										e._xseen.attributes['segments-theta'], 
										e._xseen.attributes['segments-radial'], 
										e._xseen.attributes['theta-start'] * XSeen.CONST.Deg2Rad, 
										e._xseen.attributes['theta-length'] * XSeen.CONST.Deg2Rad
									);
			XSeen.Tags._solid (e, p, geometry);
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};

/*
 * Methods for handling triangles
 *
 *	The 'triangles' tag requires at least child 'points' to function. Geometry
 *	definition is done on the way up ('fin' method).
 *
 * 'points' and 'normals' do not have any effect except as children of 'triangles'
 *
 * TODO: Need to expand parser vocabulary to include array(Vec3) and array(Integer)
 */
 
XSeen.Tags.triangles = {
	'init'	: function (e,p) 
		{
			e._xseen.geometry = new THREE.Geometry();
		},
	'fin'	: function (e,p) 
		{
/*
 * Create geometry
 *	Use vertices from e._xseen.vertices and e._xseen.attributes.index
 *	If normals are defined (e._xseen.normalsDefined), then use those; otherwise, compute them
 */
			var face;
			e._xseen.attributes.index.forEach (function(faceIndex) {
				face = new THREE.Face3 (faceIndex[0], faceIndex[1], faceIndex[2]); // , normal/normal3, color/color3, materialIndex
				e._xseen.geometry.faces.push(face); 
			});
			e._xseen.geometry.computeFaceNormals();
			e._xseen.geometry.computeVertexNormals();
			XSeen.Tags._solid (e, p, e._xseen.geometry);
		},
	'event'	: function (ev, attr) {},
};
XSeen.Tags.points = {
	'init'	: function (e,p)
		{
			if (typeof(p._xseen.geometry) != 'undefined') {
				e._xseen.attributes.vertices.forEach (function(vertex) {
					//console.log ('Adding vertex: ' + vertex);
					p._xseen.geometry.vertices.push (vertex);
				});
			}
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};
XSeen.Tags.normals = {
	'init'	: function (e,p)
		{
			if (count(e._xseen.attributes.vectors) >= 1) {
				p._xseen.normals = e._xseen.attributes.vectors;
				p._xseen.normalsDefined = true;
			} else {
				p._xseen.normals = [];
				p._xseen.normalsDefined = false;
			}
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr) {},
};


/*
 * ===================================================================================
 * Parsing definitions
 *
 * //1 ==> Commented out during PBR development
 */
XSeen.Parser._addStandardAppearance = function (tag) {
	tag
		.defineAttribute ({'name':'selectable', dataType:'boolean', 'defaultValue':true, enumeration:[true,false], isCaseInsensitive:true})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'phong', enumeration:['phong','pbr'], isCaseInsensitive:true})
		.defineAttribute ({'name':'material', dataType:'string', 'defaultValue':'', isCaseInsensitive:false})

// General material properties
		.defineAttribute ({'name':'emissive-intensity', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'opacity', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'transparent', dataType:'boolean', 'defaultValue':false})

// General material properties that only apply to Phong or PBR
		.defineAttribute ({'name':'reflectivity', dataType:'float', 'defaultValue':0.5})
		.defineAttribute ({'name':'refraction-ratio', dataType:'float', 'defaultValue':0.98})

// PBR properties
		.defineAttribute ({'name':'metalness', dataType:'float', 'defaultValue':0.5})
		.defineAttribute ({'name':'roughness', dataType:'float', 'defaultValue':0.5})

// Phong properties
		.defineAttribute ({'name':'shininess', dataType:'float', 'defaultValue':30})
		.defineAttribute ({'name':'specular', dataType:'color', 'defaultValue':'#111111'})

// Uncategorized properties
		.defineAttribute ({'name':'ambient-occlusion-map', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'ambient-occlusion-map-intensity', dataType:'float', 'defaultValue':1.0})
//1		.defineAttribute ({'name':'ambient-occlusion-texture-offset', dataType:'vec2', 'defaultValue':[0,0]})
//1		.defineAttribute ({'name':'ambient-occlusion-texture-repeat', dataType:'vec2', 'defaultValue':[1,1]})
		.defineAttribute ({'name':'color', dataType:'color', 'defaultValue':'white'})
		.defineAttribute ({'name':'displacement-bias', dataType:'float', 'defaultValue':0.5})
		.defineAttribute ({'name':'displacement-map', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'displacement-scale', dataType:'float', 'defaultValue':1.0})
//1		.defineAttribute ({'name':'displacement-texture-offset', dataType:'vec2', 'defaultValue':[0,0]})
//1		.defineAttribute ({'name':'displacement-texture-repeat', dataType:'vec2', 'defaultValue':[1,1]})
		.defineAttribute ({'name':'emissive', dataType:'color', 'defaultValue':'black'})
		.defineAttribute ({'name':'env-map', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'fog', dataType:'boolean', 'defaultValue':true})
		.defineAttribute ({'name':'map', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'metalness', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'normal-map', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'normal-scale', dataType:'vec2', 'defaultValue':[1,1]})
//1		.defineAttribute ({'name':'normal-texture-offset', dataType:'vec2', 'defaultValue':[0,0]})
//1		.defineAttribute ({'name':'normal-texture-repeat', dataType:'vec2', 'defaultValue':[1,1]})
//1		.defineAttribute ({'name':'repeat', dataType:'vec2', 'defaultValue':[1,1]})
		.defineAttribute ({'name':'side', dataType:'string', 'defaultValue':'front', enumeration:['front','back','both'], isCaseInsensitive:true})
//1		.defineAttribute ({'name':'spherical-env-map', dataType:'string', 'defaultValue':''})
//1		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'wireframe', dataType:'boolean', 'defaultValue':false})
		.defineAttribute ({'name':'wireframe-linewidth', dataType:'integer', 'defaultValue':2})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.Solids._changeAttribute}]})
		.addTag();
};
		
var tag;
tag = XSeen.Parser.defineTag ({
						'name'	: 'box',
						'init'	: XSeen.Tags.box.init,
						'fin'	: XSeen.Tags.box.fin,
						'event'	: XSeen.Tags.box.event,
						'tick'	: XSeen.Tags.box.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'depth', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'height', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'width', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'segments-depth', dataType:'integer', 'defaultValue':1})
		.defineAttribute ({'name':'segments-height', dataType:'integer', 'defaultValue':1})
		.defineAttribute ({'name':'segments-width', dataType:'integer', 'defaultValue':1});
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'cone',
						'init'	: XSeen.Tags.cone.init,
						'fin'	: XSeen.Tags.cone.fin,
						'event'	: XSeen.Tags.cone.event,
						'tick'	: XSeen.Tags.cone.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'height', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'open-ended', dataType:'boolean', 'defaultValue':false})
		.defineAttribute ({'name':'theta-start', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'theta-length', dataType:'float', 'defaultValue':360.0})
		.defineAttribute ({'name':'segments-height', dataType:'integer', 'defaultValue':1})
		.defineAttribute ({'name':'segments-radial', dataType:'integer', 'defaultValue':8});
XSeen.Parser._addStandardAppearance (tag);
	
tag = XSeen.Parser.defineTag ({
						'name'	: 'cylinder',
						'init'	: XSeen.Tags.cylinder.init,
						'fin'	: XSeen.Tags.cylinder.fin,
						'event'	: XSeen.Tags.cylinder.event,
						'tick'	: XSeen.Tags.cylinder.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'height', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'open-ended', dataType:'boolean', 'defaultValue':false})
		.defineAttribute ({'name':'radius-bottom', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'radius-top', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'theta-start', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'theta-length', dataType:'float', 'defaultValue':360.0})
		.defineAttribute ({'name':'segments-height', dataType:'integer', 'defaultValue':1})
		.defineAttribute ({'name':'segments-radial', dataType:'integer', 'defaultValue':8});
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'dodecahedron',
						'init'	: XSeen.Tags.dodecahedron.init,
						'fin'	: XSeen.Tags.dodecahedron.fin,
						'event'	: XSeen.Tags.dodecahedron.event,
						'tick'	: XSeen.Tags.dodecahedron.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'detail', dataType:'float', 'defaultValue':0.0});
XSeen.Parser._addStandardAppearance (tag);
	
tag = XSeen.Parser.defineTag ({
						'name'	: 'icosahedron',
						'init'	: XSeen.Tags.icosahedron.init,
						'fin'	: XSeen.Tags.icosahedron.fin,
						'event'	: XSeen.Tags.icosahedron.event,
						'tick'	: XSeen.Tags.icosahedron.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'detail', dataType:'float', 'defaultValue':0.0});
XSeen.Parser._addStandardAppearance (tag);
	
tag = XSeen.Parser.defineTag ({
						'name'	: 'octahedron',
						'init'	: XSeen.Tags.octahedron.init,
						'fin'	: XSeen.Tags.octahedron.fin,
						'event'	: XSeen.Tags.octahedron.event,
						'tick'	: XSeen.Tags.octahedron.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'detail', dataType:'float', 'defaultValue':0.0});
XSeen.Parser._addStandardAppearance (tag);
	
tag = XSeen.Parser.defineTag ({
						'name'	: 'sphere',
						'init'	: XSeen.Tags.sphere.init,
						'fin'	: XSeen.Tags.sphere.fin,
						'event'	: XSeen.Tags.sphere.event,
						'tick'	: XSeen.Tags.sphere.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'theta-start', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'theta-length', dataType:'float', 'defaultValue':180.0})
		.defineAttribute ({'name':'phi-start', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'phi-length', dataType:'float', 'defaultValue':360.0})
		.defineAttribute ({'name':'segments-height', dataType:'integer', 'defaultValue':18})
		.defineAttribute ({'name':'segments-width', dataType:'integer', 'defaultValue':36});
XSeen.Parser._addStandardAppearance (tag);
	
tag = XSeen.Parser.defineTag ({
						'name'	: 'tetrahedron',
						'init'	: XSeen.Tags.tetrahedron.init,
						'fin'	: XSeen.Tags.tetrahedron.fin,
						'event'	: XSeen.Tags.tetrahedron.event,
						'tick'	: XSeen.Tags.tetrahedron.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'detail', dataType:'float', 'defaultValue':0.0});
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'torus',
						'init'	: XSeen.Tags.torus.init,
						'fin'	: XSeen.Tags.torus.fin,
						'event'	: XSeen.Tags.torus.event,
						'tick'	: XSeen.Tags.torus.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':2.0})
		.defineAttribute ({'name':'tube', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'arc', dataType:'float', 'defaultValue':360})
		.defineAttribute ({'name':'segments-radial', dataType:'integer', 'defaultValue':8})
		.defineAttribute ({'name':'segments-tubular', dataType:'integer', 'defaultValue':6});
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'tknot',
						'init'	: XSeen.Tags.tknot.init,
						'fin'	: XSeen.Tags.tknot.fin,
						'event'	: XSeen.Tags.tknot.event
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'tube', dataType:'float', 'defaultValue':0.4})
		.defineAttribute ({'name':'segments-radial', dataType:'integer', 'defaultValue':8})
		.defineAttribute ({'name':'segments-tubular', dataType:'integer', 'defaultValue':64})
		.defineAttribute ({'name':'wind-p', dataType:'integer', 'defaultValue':2})
		.defineAttribute ({'name':'wind-q', dataType:'integer', 'defaultValue':3});
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'plane',
						'init'	: XSeen.Tags.plane.init,
						'fin'	: XSeen.Tags.plane.fin,
						'event'	: XSeen.Tags.plane.event,
						'tick'	: XSeen.Tags.plane.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'height', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'width', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'segments-height', dataType:'integer', 'defaultValue':1})
		.defineAttribute ({'name':'segments-width', dataType:'integer', 'defaultValue':1});
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'ring',
						'init'	: XSeen.Tags.ring.init,
						'fin'	: XSeen.Tags.ring.fin,
						'event'	: XSeen.Tags.ring.event,
						'tick'	: XSeen.Tags.ring.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'radius-inner', dataType:'float', 'defaultValue':0.5})
		.defineAttribute ({'name':'radius-outer', dataType:'float', 'defaultValue':1.0})
		.defineAttribute ({'name':'theta-start', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'theta-length', dataType:'float', 'defaultValue':360.0})
		.defineAttribute ({'name':'segments-theta', dataType:'integer', 'defaultValue':8})
		.defineAttribute ({'name':'segments-radial', dataType:'integer', 'defaultValue':8});
XSeen.Parser._addStandardAppearance (tag);

//	TODO: New tag for 'triangles'
/*
 * Define a Triangle node that allows geometry to be created from user-defined triangles
 *	Initial simple case only supports
 *	1) Indexed triangle sets (a collection of vertices that are referenced by index to form the triangle collection)
 *	2) Normals per vertex
 *	3) No special additions to material - supports single solid color, texture maps, etc. No color by face or vertex
 *
 * As with all other solid nodes, once the geometry is created it cannot be manipulated
 *
 */
tag = XSeen.Parser.defineTag ({
						'name'	: 'triangles',
						'init'	: XSeen.Tags.triangles.init,
						'fin'	: XSeen.Tags.triangles.fin,
						'event'	: XSeen.Tags.triangles.event,
						'tick'	: XSeen.Tags.triangles.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'index', dataType:'integer', 'defaultValue':[], isArray:true, elementCount:3, });
XSeen.Parser._addStandardAppearance (tag);

tag = XSeen.Parser.defineTag ({
						'name'	: 'points',
						'init'	: XSeen.Tags.points.init,
						'fin'	: XSeen.Tags.points.fin,
						'event'	: XSeen.Tags.points.event,
						'tick'	: XSeen.Tags.points.tick
						})
		.defineAttribute ({'name':'vertices', dataType:'xyz', 'defaultValue':[], isArray:true, })
		.addTag();
//XSeen.Parser.dumpTable();

tag = XSeen.Parser.defineTag ({
						'name'	: 'normals',
						'init'	: XSeen.Tags.normals.init,
						'fin'	: XSeen.Tags.normals.fin,
						'event'	: XSeen.Tags.normals.event,
						'tick'	: XSeen.Tags.normals.tick
						})
		.defineAttribute ({'name':'vectors', dataType:'xyz', 'defaultValue':[], isArray:true, })
		.addTag();

//	Tags for assets. These should only be used as children of <asset>
tag = XSeen.Parser.defineTag ({
						'name'	: 'material',
						'init'	: XSeen.Tags.material.init,
						'fin'	: XSeen.Tags.material.fin,
						'event'	: XSeen.Tags.material.event,
						'tick'	: XSeen.Tags.material.tick
						})
XSeen.Parser._addStandardAppearance (tag);

// File: tags/style3d.js
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
 * style3d is a single definition of a style attribute. Multiple style attributes can be
 * grouped together as children of a class3d tag. These still express a rule set.
 *
 * Each rule set defines a single selector (usable with jQuery) and a number of property/value
 * pairs where the property is the name of a XSeen attribute for some XSeen tag and the value
 * is a legal value for that attribute. 
 *
 * If no selector is defined, then the style will have no effect at runtime if the value in the
 * 'style3d' tag is changed.
 *
 * If the rule set has an id attribute (in the 'class3d' tag for the collection, or in the 'style3d'
 * tag for a single expression), then that style can be referenced by a node using the style3d attribute.
 * The styles are applied prior to any attributes specifically included in the node.
 *
 * If a 'style3d' tag is a child of a 'class3d' tag, then the selector is ignored.
 *
 * Runtime application of a style overrides any current value associated with the node.
 *
 * TODO: add support in 'class3d' for external files to define the style3d
 *
 */

 XSeen.Tags.Style3d = {};
 XSeen.Tags.Style3d._changeAttribute = function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				var ruleset, nodeAttributes, styleValue, styleProperty, changeSelector;

/*
 * TODO: This is not set up right. The local node (e) ruleset is not complete when
 * changing the style from DOM and the parent node's (e.parentNode) attributes do
 * not appear to be defined. The end result is the selector is properly applied,
 * but the attribute and value are empty.
 *
 * Another issue is all of the style attributes are applied, even if they are no
 * different from before. This is a problem if the target element has attributes
 * that are changed in a different manner than styles (e.g., animation). Reapplying
 * the entire set of styles would unexpected change those fields.
 */
				if (e._xseen.ruleset.complete) {
					ruleset = e._xseen.ruleset;
					nodeAttributes = e._xseen.attributes;
				} else {
					ruleset = e.parentNode._xseen.ruleset;
					nodeAttributes = e.parentNode._xseen.attributes;
				}

				if (attributeName == 'property') {
					if (nodeAttributes.property != '') {
						var oldProperty = nodeAttributes.property;
						for (var ii=0; ii<ruleset.declaration.length; ii++) {
							if (ruleset.declaration[ii].property == oldProperty) {
								ruleset.declaration[ii].property = value;
								styleValue = nodeAttributes.value;
								styleProperty = oldProperty;
							}
						}
					}
					changeSelector = false;

				} else if (attributeName == 'value') {
					if (nodeAttributes.property != '') {
						for (var ii=0; ii<ruleset.declaration.length; ii++) {
							if (ruleset.declaration[ii].property == nodeAttributes.property) {
								ruleset.declaration[ii].value = value;
								styleValue = value;
								styleProperty = nodeAttributes.property;
							}
						}
					}
					changeSelector = false;

				} else if (attributeName == 'selector') {
					ruleset.selector = value;
					nodeAttributes.selector = value;
					changeSelector = true;
				}
				e._xseen.attributes[attributeName] = value;

				var eles = document.querySelectorAll (ruleset.selector);
				eles.forEach (function(item) {
					for (var ii=0; ii<ruleset.declaration.length; ii++) {
						item.setAttribute(ruleset.declaration[ii].property, ruleset.declaration[ii].value);
					}
				});
			} else {
				XSeen.LogWarn("Reparse of " + attributeName + " is invalid -- no change")
			}

};

XSeen.Tags._style = 
	function (property, value, selector, id, ruleParent) {
		if (typeof(ruleParent) === 'undefined' || typeof(ruleParent._xseen.styleDefinition) === 'undefined') {
			this.id				= id || '';
			this.selector		= selector;
			this.complete		= true;
			this.declaration	= [];
			if (property != '') this.declaration.push({'property':property, 'value':value});
		} else {
			this.complete 		= false;
			ruleParent._xseen.ruleset.declaration.push({'property':property, 'value':value});
		}
		return this;
	};
	
	
XSeen.Tags.style3d = {
	'init'	: function (e, p) 
		{
			e._xseen.ruleset = new XSeen.Tags._style (e._xseen.attributes.property, e._xseen.attributes.value, e._xseen.attributes.selector, e.id, p);
			if (e._xseen.ruleset.complete) {
				e._xseen.sceneInfo.StyleRules.ruleset.push (e._xseen.ruleset);
				if (e.id != '') e._xseen.sceneInfo.StyleRules.idLookup[e.id] = e._xseen.ruleset;
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
};
XSeen.Tags.class3d = {
	'init'	: function (e, p) 
		{
			e._xseen.styleDefinition = true;
			e._xseen.ruleset = new XSeen.Tags._style ('', '', e._xseen.attributes.selector, e.id);
		},
	'fin'	: function (e, p) 
		{
			e._xseen.sceneInfo.StyleRules.ruleset.push (e._xseen.ruleset);
			if (e.id != '') e._xseen.sceneInfo.StyleRules.idLookup[e.id] = e._xseen.ruleset;
			
/*
			if (e._xseen.attributes.dump) {
				var class3d, msg = '<table border="1"><tr><th>Class</th><th>ID</th><th>Property</th><th>Value</th></tr>\n', ii, jj;
				
				for (ii=0; ii<e._xseen.sceneInfo.classes.length; ii++) {
					var className = e._xseen.sceneInfo.classes[ii].class3d;
					for (var jj=0; jj<e._xseen.sceneInfo.classes[ii].style.length; jj++) {
						class3d = e._xseen.sceneInfo.classes[ii].style[jj];
						msg += "<tr><td>" + className + "</td><td>" + class3d.id + '</td><td>' + class3d.name + '</td><td>' + class3d.string + "</td></tr>\n";
					}
				}
				msg += '</table>';
				XSeen.LogDebug(msg);
			}
 */
		},
	'event'	: function (ev, attr) {},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'style3d',
						'init'	: XSeen.Tags.style3d.init,
						'fin'	: XSeen.Tags.style3d.fin,
						'event'	: XSeen.Tags.style3d.event
						})
		.defineAttribute ({'name':'selector', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'property', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'value', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
//		.defineAttribute ({'name':'waitforload', dataType:'boolean', 'defaultValue':false, 'isAnimatable':false})
//		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'value', enumeration:['value','external'], isCaseInsensitive:true, 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.Style3d._changeAttribute}]})
		.addTag();
XSeen.Parser.defineTag ({
						'name'	: 'class3d',
						'init'	: XSeen.Tags.class3d.init,
						'fin'	: XSeen.Tags.class3d.fin,
						'event'	: XSeen.Tags.class3d.event
						})
		.defineAttribute ({'name':'selector', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'dump', dataType:'boolean', 'defaultValue':false, 'isAnimatable':false})
		.addTag();

		
// File: tags/subscene.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 */

 // Control Node definitions
 
/*
 * xxTODO: Update xseen... XSeen...
 * TODO: Add standard position, rotation, and scale fields with XSeen.Tags.setSpace method
 * TODO: Improve handling of file formats that the loaders cannot do version distinction (gltf)
 * xxTODO: Save current URL so any changes can be compared to increase performance
 * TODO: Add handling of changing model URL - need to stop & delete animations
 * TODO: Investigate how to add 'setValue' and 'getValue' to work with [s|g]etAttribute
 */

XSeen.Tags.subscene = {
	'init'	: function (e, p) 
		{
			e._xseen.processedUrl = false;
			e._xseen.loadGroup = new THREE.Group();
			e._xseen.loadGroup.name = 'External Scene [' + e.id + ']';
			XSeen.Tags._setSpace (e._xseen.loadGroup, e._xseen.attributes);
			console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
/*
			XSeen.Loader.load (e._xseen.attributes.src, '', XSeen.Tags.subscene.loadSuccess({'e':e, 'p':p}), XSeen.Tags.subscene.loadFailure, XSeen.Tags.subscene.loadProgress);
 */
			var loader = new THREE.ObjectLoader();
			loader.load (e._xseen.attributes.src, XSeen.Tags.subscene.loadSuccess({'e':e, 'p':p}), XSeen.Tags.subscene.loadProgress, XSeen.Tags.subscene.loadFailure);
			e._xseen.requestedUrl = true;
			e._xseen.tagObject = e._xseen.loadGroup;
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	
					// Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
	'loadProgress' : function (a1) {
		console.log ('Progress ('+a1.type+'): ' + a1.timeStamp);
	},
	'loadFailure' : function (a1) {
		console.log ('Failure ('+a1.type+'): ' + a1.timeStamp);
	},
	'loadSuccess' : function (userdata) {
						var e = userdata.e;
						var p  = userdata.p;
						return function (response) {
							e._xseen.processedUrl = true;
							e._xseen.requestedUrl = false;
							e._xseen.loadText = response;
							e._xseen.currentUrl = e._xseen.attributes.src;
							
							console.log ('Success');
							console.log("download successful for |"+e.id);
							//e._xseen.loadGroup.add(response.scene);		// This works for glTF
							e._xseen.loadGroup.add(response);		// What docs say for ObjectLoader
							p._xseen.sceneInfo.SCENE.updateMatrixWorld();

						}
					}
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'subscene',
						'init'	: XSeen.Tags.subscene.init,
						'fin'	: XSeen.Tags.subscene.fin,
						'event'	: XSeen.Tags.subscene.event,
						'tick'	: XSeen.Tags.subscene.tick
						})
		.addSceneSpace()
		.defineAttribute ({'name':'src', dataType:'string', 'defaultValue':''})
		.addTag();