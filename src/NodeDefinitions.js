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
 * Fields are added with the .addField method. It takes its values from the argument list
 * or an object passed as the first argument. The properties of the argument are:
 *	name - the name of the field. This is converted to lowercase before use
 *	datatype - the datatype of the field. There must be a method in xseen.types by this name
 *	defaultValue - the default value of the field to be used if the field is not present or incorrectly defined.
 *					If this argument is an array, then it is the set of allowed values. The first element is the default.
 *	enumerated - the list of allowed values when the datatype only allows specific values for this field (optional)
 *	animatable - Flag (T/F) indicating if the field is animatable. Generally speaking, enumerated fieles are not animatable
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
				'addField'	: function (fieldObj, datatype, defaultValue) {
					var fieldName, namelc, enumerated, animatable;
					if (typeof(fieldObj) === 'object') {
						fieldName		= fieldObj.name;
						datatype		= fieldObj.datatype;
						defaultValue	= fieldObj.defaultValue;
						enumerated		= (typeof(fieldObj.enumerated) === 'undefined') ? [] : fieldObj.enumerated;
						animatable		= (typeof(fieldObj.animatable) === 'undefined') ? false : fieldObj.animatable;
					} else {
						fieldName	= fieldObj;
						animatable	= false;
						if (typeof(defaultValue) == 'array') {
							enumerated	= defaultValue;
							defaultValue = enumerated[0];
						} else {
							enumerated = [];
						}
					}
					namelc = fieldName.toLowerCase();
					this.fields.push ({
								'field'			: fieldName,
								'fieldlc'		: namelc,
								'type'			: datatype,
								'default'		: defaultValue,
								'enumeration'	: enumerated,
								'animatable'	: animatable,
								'clone'			: this.cloneField,
								'setFieldName'	: this.setFieldName,
								});
					this.fieldIndex[namelc] = this.fields.length-1;
					return this;
				},
				'addNode'	: function () {
					xseen.parseTable[this.taglc] = this;
				},
				'cloneField'	: function () {
					var newFieldObject = {
								'field'			: this.field,
								'fieldlc'		: this.fieldlc,
								'type'			: this.type,
								'default'		: 0,
								'enumeration'	: [],
								'animatable'	: this.animatable,
								'clone'			: this.clone,
								'setFieldName'	: this.setFieldName,
					};
					for (var i=0; i<this.enumeration.length; i++) {
						newFieldObject.enumeration.push(this.enumeration[i]);
					}
					if (Array.isArray(this.default)) {
						newFieldObject.default = [];
						for (var i=0; i<this.default.length; i++) {
							newFieldObject.default.push(this.default[i]);
						}
					} else {
						newFieldObject.default = this.default;
					}
					return newFieldObject;
				},
				'setFieldName'	: function(newName) {
					this.field = newName;
					this.fieldlc = newName.toLowerCase();
					return this;
				},
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
		element._xseen.fields = [];		// fields for this node
		element._xseen.animate = [];	// animatable fields for this node
		element._xseen.animation = [];	// array of animations on this node
		element._xseen.parseAll = false;
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				var value = this._parseField (field, element);
				if (value == 'xseen.parse.all') {
					element._xseen.parseAll = true;
				} else {
					element._xseen.fields[field.fieldlc] = value;
					if (field.animatable) {element._xseen.animate[field.fieldlc] = null;}
				}
			}, this);
/*
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
 */
		if (element._xseen.parseAll) {
			for (var i=0; i<element.attributes.length; i++) {
				if (typeof(element._xseen.fields[element.attributes[i].name]) === 'undefined') {
					element._xseen.fields[element.attributes[i].name.toLowerCase()] = element.attributes[i].value;
				}
			}
		}
	},
	
	'_parseField' : function (field, e) {
		if (field.field == '*') {
			return 'xseen.parse.all';
			//this._xseen.parseAll = true;
		} else {
			var value = e.getAttribute(field.fieldlc);
			if (value !== null && value.substr(0,1) == '#') {		// Asset reference
				var re = document.getElementById(value.substr(1,value.length));
				value = re._xseen.fields[field.fieldlc] || '';
			}
			value = xseen.types[field.type] (value, field.default, field.enumeration);
			return value;
		}
	},


	'_dumpTable' : function() {
		var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
		console.log('Node parsing table (' + xseen.parseTable.length + ' nodes)\n' + jsonstr);
	}
};
	
