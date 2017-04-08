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
