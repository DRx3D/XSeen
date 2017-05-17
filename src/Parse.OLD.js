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

xseen.Parse = function (element, parent, sceneInfo) {
	var nodeName = element.localName.toLowerCase();
	xseen.debug.logInfo("Parse " + nodeName);
	element._xseen = new Object();
	var t = xseen.nodeDefinitions[nodeName].method;
	if (typeof(xseen.node[xseen.nodeDefinitions[nodeName].method].init) !== 'undefined') {
		//xseen.debug.logInfo("..parsing attributes of |" + nodeName + "|");
		xseen.node[xseen.nodeDefinitions[nodeName].method].init (element, parent);
	} else {
		//xseen.debug.logInfo("..no parse init action routine for " + nodeName);
	}

	for (element._xseen.parsingCount=0; element._xseen.parsingCount<element.childElementCount; element._xseen.parsingCount++) {
		this.Parse (element.children[element._xseen.parsingCount], element, sceneInfo);
		//xseen.debug.logInfo(".return from Parse with current node |" + element.children[element._xseen.parsingCount].localName + "|");
	}

	if (typeof(xseen.node[xseen.nodeDefinitions[nodeName].method].endParse) !== 'undefined') {
		//xseen.debug.logInfo("..parsing children data of |" + nodeName + "|");
		xseen.node[xseen.nodeDefinitions[nodeName].method].endParse (element, parent);
	} else {
		//xseen.debug.logInfo("..no endParse action routine for " + nodeName);
	}
	//xseen.debug.logInfo("  reached bottom, heading back up from |" + nodeName + "|");
	if (nodeName == 'scene') {
		//xseen.debug.logInfo("Check Scene node");
	}
}
