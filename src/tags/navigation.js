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

xseen.Tags.navigation = {
	'init'	: function (e, p) 
		{	// This should really go in a separate push-down list for Viewpoints

			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.speed = e._xseen.attributes.speed;
			e._xseen.setup = e._xseen.attributes.type;
			if (e._xseen.setup == 'examine') {e._xseen.setup = 'trackball';}
			e._xseen.type = 'none';
			if (!(e._xseen.setup == 'orbit' || e._xseen.setup == 'trackball' || e._xseen.setup == 'mobile'))
				{e._xseen.setup = 'none';}

			if (!e._xseen.sceneInfo.tmp.activeNavigation) {
				e._xseen.sceneInfo.stacks.Navigation.pushDown(e._xseen);
				e._xseen.sceneInfo.tmp.activeNavigation = true;
			}
			
			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
		},
	'fin'	: function (e, p) 
		{
			if (e._xseen.attributes.type == 'vr') {
				if (navigator.getVRDisplays === undefined) {
					xseen.debug.logInfo('navigation: nvaigator reports no "getVRDisplays" function');
				} else {
					e._xseen.sceneInfo.renderer.vr.enable = true;
					e._xseen.sceneInfo.renderer.vr.custom = 'Set for debugging';
					xseen.debug.logInfo('navigation:VR rendering state: ' + e._xseen.sceneInfo.renderer.vr.enable);
/*
				WEBVR.checkAvailability().catch( function( message ) {
					console.log ('WebVR: ' + message);
					xseen.debug.logInfo('navigation:WebVR: ' + message);
					document.body.appendChild( WEBVR.getMessageContainer( message ) );
				} );
				renderer.vr.enabled = true;
 */
				}
/*
				WEBVR.getVRDisplay( function ( display ) {
					renderer.vr.setDevice( display );
					document.body.appendChild( WEBVR.getButton( display, renderer.domElement ) );
				} );
*/
			}
			xseen.debug.logInfo('navigation: Completed node definition');
		},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'setactive'	: function (ev) {},
};

// Add tag and attributes to Parsing table
xseen.Parser.defineTag ({
						'name'	: 'navigation',
						'init'	: xseen.Tags.navigation.init,
						'fin'	: xseen.Tags.navigation.fin,
						'event'	: xseen.Tags.navigation.event,
						'tick'	: xseen.Tags.navigation.tick
						})
		.defineAttribute ({'name':'active', dataType:'boolean', 'defaultValue':false})
		.defineAttribute ({'name':'speed', dataType:'float', 'defaultValue':1, 'isAnimatable':false})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'none', enumeration:['none', 'orbit', 'fly', 'examine', 'trackball', 'mobile', 'vr'], isCaseInsensitive:true})
		.addTag();
