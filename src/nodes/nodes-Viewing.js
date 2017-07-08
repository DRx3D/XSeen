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
			e._xseen.type = e._xseen.fields.type;
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
			e._xseen.type = e._xseen.fields.type;
			e._xseen.setup = e._xseen.fields.type;
			if (!(e._xseen.type == 'none' || e._xseen.type == 'turntable' || e._xseen.type == 'tilt')) {e._xseen.type = 'none';}
			if (!(e._xseen.setup == 'orbit')) {e._xseen.setup = 'none';}

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
