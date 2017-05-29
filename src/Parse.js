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
	//xseen.debug.logInfo("Parse " + nodeName);
	if (typeof(element._xseen) == 'undefined') {element._xseen = {};}
	if (typeof(element._xseen.children) == 'undefined') {element._xseen.children = [];}
	if (typeof(xseen.parseTable[nodeName]) == 'undefined') {
		xseen.debug.logInfo("Unknown node: " + nodeName);
	} else {
		xseen.nodes._parseFields (element, xseen.parseTable[nodeName]);
		xseen.node[xseen.parseTable[nodeName].method].init (element, parent);
	}
	
	for (element._xseen.parsingCount=0; element._xseen.parsingCount<element.childElementCount; element._xseen.parsingCount++) {
		element.children[element._xseen.parsingCount]._xseen = {};
		element.children[element._xseen.parsingCount]._xseen.children = [];
		element.children[element._xseen.parsingCount]._xseen.sceneInfo = element._xseen.sceneInfo;
		this.Parse (element.children[element._xseen.parsingCount], element, sceneInfo);
		//xseen.debug.logInfo(".return from Parse with current node |" + element.children[element._xseen.parsingCount].localName + "|");
	}

	if (typeof(xseen.parseTable[nodeName]) !== 'undefined') {
		xseen.node[xseen.parseTable[nodeName].method].fin (element, parent);
		//xseen.debug.logInfo("..parsing children data of |" + nodeName + "|");
		// --> xseen.node[xseen.nodeDefinitions[nodeName].method].endParse (element, parent);
	}
	//xseen.debug.logInfo("  reached bottom, heading back up from |" + nodeName + "|");
}
