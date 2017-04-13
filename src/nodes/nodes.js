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


xseen.node = {};

xseen.node.core_NOOP = function (e) {};
xseen.node.core_WorldInfo = function (e) {parsing('WorldInfo', e)};
xseen.node.geometry3D_Box = function (e) {parsing('Box', e)};
xseen.node.geometry3D_Cone = function (e) {parsing('Cone', e)};
xseen.node.appearance_Material = function (e) {parsing('Material', e)};
xseen.node.unk_Shape = function (e) {parsing('Shape', e)};
xseen.node.grouping_Transform = function (e) {parsing('Transform', e)};
xseen.node.unk_Camera = function (e) {parsing('Camera', e)};
xseen.node.unk_Light = function (e) {parsing('Light', e)};

function parsing (s, e) {
	xseen.debug.logInfo ('Parsing stub for ' + s);
}

xseen.node.geometry3D_Box = function (e) {
	var size = xseen.types.Vector3 (e.getAttribute('size'), '1 1 1');
	e.geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
	xseen.debug.logInfo ('Creating Box of size: ' + size[0] +', ' + size[1] + ', ' + size[2]);
};
xseen.node.appearance_Material = function (e) {
	var colorDiffuse = xseen.types.Color3 (e.getAttribute('diffuseColor'), '.8 .8 .8');
	var colorEmisive  = xseen.types.Color3 (e.getAttribute('emisiveColor'), '0 0 0');
	colorEmisive = xseen.types.Color3toInt (colorEmisive);
	e.material = new THREE.MeshBasicMaterial( { color: colorEmisive } );
	xseen.debug.logInfo ('Creating Material of diffuse: [' + colorDiffuse[0] +', ' + colorDiffuse[1] + ', ' + colorDiffuse[2] + ']; emisive: ' + colorEmisive);
};


/*
 * xseen.types contains the datatype and conversion utilities. These convert one format to another.
 * Any method ending in 'toX' where 'X' is some datatype is a conversion to that type
 * Other methods convert from string with space-spearated values
 */
xseen.types = {};
xseen.types.Vector3 = function (value, defaultString) {
	if (value === null) {value = defaultString;}
	var v3 = value.split(' ');
	if (v3.length != 3 || Number.isNaN(v3[0]) || Number.isNaN(v3[1]) || Number.isNaN(v3[2])) {
		value = defaultString;
		v3 = value.split(' ');
	}
	return v3;
};
xseen.types.Color3 = function (value, defaultString) {
	var v3 = xseen.types.Vector3(value, defaultString);
	v3[0] = Math.min(Math.max(v3[0], 0.0), 1.0);
	v3[1] = Math.min(Math.max(v3[1], 0.0), 1.0);
	v3[2] = Math.min(Math.max(v3[2], 0.0), 1.0);
	return v3;
};
xseen.types.Color3toHex = function (c3) {
	var hr = Math.round(255*c3[0]).toString(16);
	var hg = Math.round(255*c3[1]).toString(16);
	var hb = Math.round(255*c3[2]).toString(16);
	if (hr.length < 2) {hr = "0" + hr;}
	if (hg.length < 2) {hg = "0" + hg;}
	if (hb.length < 2) {hb = "0" + hb;}
	var hex = '0x' + hr + hg + hb;
	return hex;
};
xseen.types.Color3toInt = function (c3) {
	var hr = Math.round(255*c3[0]) << 16;
	var hg = Math.round(255*c3[1]) << 8;
	var hb = Math.round(255*c3[2])
	return hr + hg + hb;
};