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
	'_changeAttribute'	: function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;
				//var type = XSeen.Tags.light._saveAttributes (e);
				XSeen.Tags.fog._processChange (e);
			} else {
				XSeen.LogWarn("Re-parse of " + attributeName + " is invalid -- no change")
			}
		},
	'_processChange'	: function (e, attributeName, value) {
			if (e._xseen.attributes.active) {
				var fog, color, near, far;
				fog = new THREE.Fog (
						 XSeen.Parser.Types.colorRgbInt(e._xseen.attributes.color),
						e._xseen.attributes.near,
						e._xseen.attributes.far);
				e._xseen.tagObject = fog;
				e._xseen.sceneInfo.SCENE.fog = fog;
			} else {
				e._xseen.sceneInfo.SCENE.fog = null;
			}
		},
		
		
		
	'init'	: function (e, p) 
		{
			
			console.log ('Creating FOG with color ' + XSeen.Parser.Types.colorRgbInt(e._xseen.attributes.color));
			console.log (e._xseen.attributes.color);
			var fog = new THREE.Fog (
						 XSeen.Parser.Types.colorRgbInt(e._xseen.attributes.color),
						e._xseen.attributes.near,
						e._xseen.attributes.far);

			e._xseen.tagObject = fog;
			if (e._xseen.attributes.active) {
				e._xseen.sceneInfo.SCENE.fog = fog;
			}
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
		.defineAttribute ({'name':'active', dataType:'boolean', 'defaultValue':'true'})
		.defineAttribute ({'name':'color', dataType:'color', 'defaultValue':'white'})
		.defineAttribute ({'name':'near', dataType:'float', 'defaultValue':'1'})
		.defineAttribute ({'name':'far', dataType:'float', 'defaultValue':'1'})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.fog._changeAttribute}]})
		.addTag();
