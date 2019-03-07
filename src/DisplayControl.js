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

// Button no longer active, un-define event handlers
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
		button.style.backgroundImage	= 'url(https://XSeen.org/Logo/xseen-symbol-color.svg)';
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
		button.style.position			= 'fixed';
		//button.style.bottom				= '66px';
		button.style.top				= '80%';
		button.style.left				= '45%';
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
	
/*
 *	Add full screen button to display. Certain characteristics are set.
 *
 *	Parameters:
 *		button	A shadow-DOM HTML button that will be used as the 'Enter/Exit' full screen button. This
 *				includes display placement.
 *		node	The HTML tag to go full-screen. Only this tag and its children will be visible
 *		turnOffFull	An optional boolean that indicates that button should not be visible during full-screen. D=false
 */
	'buttonFullScreen'		: function (button, node, turnOffFull) {
		turnOffFull = (typeof(turnOffFull) == 'undefined') ? false : turnOffFull;
		turnOffFull = true;
		button.innerHTML		= "Enter FullScreen";
		button.style.width		= '9em';
		button.dataset._active	= true;			// button active
		button._fullScreenNode 	= node;
		button._offWhenFull		= turnOffFull;
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
				//console.log('Need to exit');
				// Check ._XSeenButton._offWhenFull to see if button needs to be not displayed
				if (document.documentElement._XSeenButton._offWhenFull) {
					document.documentElement._XSeenButton.style.display = 'hidden';
				}
				document.documentElement._XSeenButton.innerHTML = 'Exit FullScreen';
				if (XSeen.Runtime._deviceCameraElement != 0) {		// Connect camera
					XSeen.IW.connectCamera (XSeen.Runtime._deviceCameraElement);
				}
			
			} else {	// Exit from full screen
				//console.log('Need to enter');
				document.documentElement._XSeenButton.style.display = 'block';
				document.documentElement._XSeenButton.innerHTML = 'Enter FullScreen';
				document.documentElement._XSeenButton = null;
				if (XSeen.Runtime._deviceCameraElement != 0) {		// Disconnect camera
					XSeen.IW.disconnectCamera (XSeen.Runtime._deviceCameraElement);
				}
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
