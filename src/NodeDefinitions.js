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
	'_parseFields' : function(element, node) {
		element._xseen.fields = [];
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				value = this.getAttribute(field.fieldlc);
				value = xseen.types[field.type] (value, field.default);
				this._xseen.fields[field.fieldlc] = value;
			}, element);
	},

	'_dumpTable' : function() {
		var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
		console.log('Node parsing table (' + xseen.parseTable.length + ' nodes)\n' + jsonstr);
	}
};
	
