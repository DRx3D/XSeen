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

 
/*
 * xseen.nodes.<nodeName> is the definition of <nodeName>
 * All internal variables are stored in ._internal. All functions start with '_'
 *
 * This is a bare-bones setup. There is no error checking - missing arguments or
 * methods that do not exist (e.g., <nodeMethod>.init)
 *
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump (_dumpTable) would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 * Still need to determine how this thing is going to be internally stored.
 */

xseen.nodes = {
	'_defineNode' : function(nodeName, nodeComponent, nodeMethod) {
		methodBase = 'xseen.node.';
		methodBase = '';
		node = {
				'tag'		: nodeName,
				'taglc'		: nodeName.toLowerCase(),
				'component' : nodeComponent,
				'method'	: methodBase + nodeMethod,
				'fields'	: [],
				'fieldIndex': [],
				'addField'	: function (fieldName, fieldType, fieldDefault) {
					var newIndex = this.fields.length;
					var namelc = fieldName.toLowerCase();
					this.fieldIndex[namelc] = newIndex;
					this.fields[newIndex] = {
								'field'		: fieldName,
								'fieldlc'	: namelc,
								'type'		: fieldType,
								'default'	: fieldDefault
					};
					return this;
				},
				'addNode'	: function () {
					xseen.parseTable[this.taglc] = this;
				}
		}
		return node;
	},
/*
 *	Parse fields of an HTML tag (called element) using the field information from the defined 'node'
 *	If the first character of the field value is '#', then the remainder is treated as an ID and the
 *	field value is obtained from that HTML tag prior to parsing. The referenced tag's attribute name
 *	is the same name as the attribute of the parsed 'node'.
 *	If the field value is '*', then all attributes of the HTML tag are parsed as strings. Typically this is 
 *	only used for mixin assets.
 */
	'_parseFields' : function(element, node) {
		element._xseen.fields = [];
		element._xseen.parseAll = false;
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				if (field.field == '*') {
					this._xseen.parseAll = true;
				} else {
					var value = this.getAttribute(field.fieldlc);
					if (value !== null && value.substr(0,1) == '#') {		// Asset reference
						var re = document.getElementById(value.substr(1,value.length));
						value = re._xseen.fields[field.fieldlc] || '';
					}
					value = xseen.types[field.type] (value, field.default);
					this._xseen.fields[field.fieldlc] = value;
				}
			}, element);
		if (element._xseen.parseAll) {
			for (var i=0; i<element.attributes.length; i++) {
				if (typeof(element._xseen.fields[element.attributes[i].name]) === 'undefined') {
					element._xseen.fields[element.attributes[i].name.toLowerCase()] = element.attributes[i].value;
				}
			}
		}
	},

	'_dumpTable' : function() {
		var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
		console.log('Node parsing table (' + xseen.parseTable.length + ' nodes)\n' + jsonstr);
	}
};
	
