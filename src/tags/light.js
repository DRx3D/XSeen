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
