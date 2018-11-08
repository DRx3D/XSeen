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
			
			console.log ('Creating FOG with color ' + XSeen.Parser.Types.colorRgbInt(e._xseen.attributes.color));
			console.log (e._xseen.attributes.color);
			var fog = new THREE.Fog (
						 XSeen.Parser.Types.colorRgbInt(e._xseen.attributes.color),
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
