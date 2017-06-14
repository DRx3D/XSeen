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
