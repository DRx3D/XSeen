/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 * Removed code for
 * - ActiveX 
 * - Flash
 * 
 */

xseen.Parse = function (element, sceneInfo) {
	xseen.debug.logInfo("Parsing " + element.localName);
	for (element.xseenParsingCount=0; element.xseenParsingCount<element.childElementCount; element.xseenParsingCount++) {
		this.Parse (element.children[element.xseenParsingCount], sceneInfo);
	}
	var nodeF = '';
	if (element.localName in xseen.NodeActionsD) {
		nodeF = xseen.NodeActionsD[element.localName];
	} else if (element.localName in xseen.NodeActionsLC) {
		nodeF = xseen.NodeActionsLC[element.localName];
	} else if (element.localName in xseen.NodeActions) {
		nodeF = xseen.NodeActions[element.localName];
	} else {
		xseen.debug.logInfo("No parse action routine for " + element.localName);
	}
	if (nodeF != '') {
		xseen.node[nodeF](element);
	}
	xseen.debug.logInfo("Done parsing " + element.localName);
}
