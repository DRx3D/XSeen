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
 * XSeen.tags.<name> is the definition of <name>
 * All internal variables are stored in ._internal
 *
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump (_dumpTable) would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 * Attributes are added with the .defineAttribute method. It takes its values from the argument list
 * or an object passed as the first argument. The properties of the argument are:
 *	name - the name of the field. This is converted to lowercase before use
 *	datatype - the datatype of the field. There must be a method in XSeen.types by this name
 *	defaultValue - the default value of the field to be used if the field is not present or incorrectly defined.
 *					If this argument is an array, then it is the set of allowed values. The first element is the default.
 *	enumerated - the list of allowed values when the datatype only allows specific values for this field (optional)
 *	animatable - Flag (T/F) indicating if the field is animatable. Generally speaking, enumerated fieles are not animatable
 */

var XSeen = XSeen || {};
XSeen.Tags = {
	'_setSpace'		: function (object, spaceAttributes) {
						//if (1 === 1) return;
						if (object.isObject3D) {
							if (typeof(spaceAttributes.position) !== 'undefined') {
								object.position.x = spaceAttributes.position.x;
								object.position.y = spaceAttributes.position.y;
								object.position.z = spaceAttributes.position.z;
							}
							if (typeof(spaceAttributes.rotation) !== 'undefined') {
								object.setRotationFromQuaternion (spaceAttributes.rotation);
							}
							if (typeof(spaceAttributes.scale) !== 'undefined') {
								object.scale.x = spaceAttributes.scale.x;
								object.scale.y = spaceAttributes.scale.y;
								object.scale.z = spaceAttributes.scale.z;
							}
						}
					},
};
XSeen.Parser = {
	'Table'		: {},
	'_prefix'	: 'x-',
	'AttributeObserver'	: new MutationObserver(function(list) {
							for (var mutation of list) {
								var value = XSeen.Parser.reparseAttr (mutation.target, mutation.attributeName);
								var localName = mutation.target.localName;
								var handler = XSeen.Parser.Table[localName].eventHandlers.mutation.handler;
								handler (mutation.target, mutation.attributeName, value);
							}
						}),

	'defineTag' : function (tagObj, init, fin, events)
		{
			if (arguments.length != 1) {
				tagObj = {
						'name'		: tagObj,
						'init'		: init,
						'fin'		: fin,
						'events'	: events};		// Removed 'tick'
			}
			var tag = {
				'tag'			: XSeen.Parser._prefix + tagObj.name.toLowerCase(),
				'init'			: tagObj.init,
				'fin'			: tagObj.fin,
				'events'		: tagObj.events,
//				'tick'			: tagObj.tick,
				'attributes'	: [],
				'attrIndex'		: [],
				'eventHandlers'	: [],
				'addSceneSpace'	: function ()
					{
						var v = this
							.defineAttribute ({'name':'position', dataType:'xyz', 'defaultValue':{x:0, y:0, z:0}})
							.defineAttribute ({'name':'rotation', dataType:'rotation', 'defaultValue':[0,0,0]})
							.defineAttribute ({'name':'scale', dataType:'xyz', 'defaultValue':{x:1, y:1, z:1}});
						return v;
					},
				'defineAttribute'	: function (attrObj, dataType, defaultValue)
					{
						if (arguments.length != 1) {
							attrObj = {
										'name'				: attrObj,
										'dataType'			: dataType,
										'defaultValue'		: defaultValue,
										'isCaseInsensitive'	: true,
										'isAnimatable'		: false,
										'enumeration'		: []
									};
						}
						var name = attrObj.name.toLowerCase();
						var t = typeof(attrObj.isCaseInsensitive);
						attrObj.enumeration = (typeof(attrObj.enumeration) == 'object') ? attrObj.enumeration : [];
						attrObj.isCaseInsensitive = (typeof(attrObj.isCaseInsensitive) !== 'undefined') ? attrObj.isCaseInsensitive : false;
						if (attrObj.dataType != 'string') {attrObj.isCaseInsensitive = true;}
						this.attributes.push ({
								'attribute'			: name,
								'type'				: attrObj.dataType,
								'default'			: attrObj.defaultValue,
								'enumeration'		: attrObj.enumeration,
								'isCaseInsensitive'	: attrObj.isCaseInsensitive,
								'isAnimatable'		: (typeof(attrObj.isAnimatable) !== null) ? attrObj.isAnimatable : false,
								'isEnumerated'		: (attrObj.enumeration.length == 0) ? false : true,
								'clone'				: this.cloneAttribute,
								'setAttrName'		: this.setAttrName,
								});
						this.attributes[name] = this.attributes[this.attributes.length-1];
						this.attrIndex[name] = this.attributes.length-1;
						return this;
					},

			// TODO: expand as more events are added
				'addEvents'	: function (handlerObj)
					{
						if (typeof(handlerObj.mutation) !== 'unknown' && typeof(handlerObj.mutation[0].attributes) !== 'unknown') {
							this.eventHandlers['mutation'] = {
																'options'	: {'attributes':true},
																'handler'	: handlerObj.mutation[0].attributes,
															};
						}
						return this;
					},

				'addTag'	: function () {
						XSeen.Parser.Table[this.tag] = this;
						//console.log ('** Adding ' + this.tag + ' to parsing table');
					},

				'cloneAttribute'	: function () {
					var newAttrObject = {
								'attribute'			: this.name,
								'type'				: this.type,
								'default'			: this.default,
								'enumeration'		: [],
								'isCaseInsensitive'	: this.isCaseInsensitive,
								'isAnimatable'		: this.isAnimatable,
								'isEnumerated'		: this.isEnumerated,
								'clone'				: this.clone,
								'setAttrName'		: this.setAttrName,
					};
					for (var i=0; i<this.enumeration.length; i++) {
						newAttrObject.enumeration.push(this.enumeration[i]);
					}
					if (Array.isArray(this.default)) {
						newAttrObject.default = [];
						for (var i=0; i<this.default.length; i++) {
							newAttrObject.default.push(this.default[i]);
						}
					}
					return newAttrObject;
				},
				'setAttrName'	: function(newName) {
					this.attribute = newName;
					return this;
				},
			};
			return tag;
		},
		
	'getTag' : function (tagName)
		{
			if (typeof(tagName) == 'undefined' || tagName == '') {return null;}
			var tag = XSeen.Parser._prefix + tagName;
			if (typeof(XSeen.Parser.Table[tag]) == 'undefined') {return null;}
			return XSeen.Parser.Table[tag];
		},
		
// TODO: Debug element parse method
/*
 * This is called recursively starting with the first <x-scene> tag
 */
	'Parse'	: function (element, parent)
		{
			var tagName = element.localName.toLowerCase();		// Convenience declaration
			/*
			 *	If tag name is unknown, then print message; otherwise,
			 *	Create all XSeen additions un element._xseen
			 *	Parse provided attributes
			 *	Redefine DOM methods for accessing attributes
			 */
			var tagEntry;
			if (typeof(XSeen.Parser.Table[tagName]) == 'undefined') {
				XSeen.LogDebug("Unknown node: " + tagName + '. Skipping all children.');
				return;
			} else {
				tagEntry = XSeen.Parser.Table[tagName];
				if (typeof(element._xseen) == 'undefined') {element._xseen = {};}
				if (typeof(element._xseen.children) == 'undefined') {element._xseen.children = [];}
				this.parseAttrs (element, tagEntry);
				//console.log ('Calling node: ' + tagName + '. Method: ' + tagEntry.init + ' (e,p)');
				console.log('Calling node: ' + tagName + '. Method: init');
				XSeen.LogInfo('Calling node: ' + tagName + '. Method: init');
				tagEntry.init (element, parent);
			}

			// Parse all of the children in order
			for (element._xseen.parsingCount=0; element._xseen.parsingCount<element.childElementCount; element._xseen.parsingCount++) {
				element.children[element._xseen.parsingCount]._xseen = {};
				element.children[element._xseen.parsingCount]._xseen.children = [];
				element.children[element._xseen.parsingCount]._xseen.sceneInfo = element._xseen.sceneInfo;
				this.Parse (element.children[element._xseen.parsingCount], element);
			}

			if (typeof(tagEntry) !== 'undefined') {
				element.addEventListener ('XSeen', tagEntry.events);
				//XSeen.LogInfo('Calling node: ' + tagName + '. Method: fin');
				tagEntry.fin (element, parent);
				//XSeen.LogInfo('Return from node: ' + tagName + '. Method: fin');
				if (typeof(tagEntry.eventHandlers.mutation) !== 'undefined') {
					XSeen.Parser.AttributeObserver.observe (element, tagEntry.eventHandlers.mutation.options);
				}
			}
		},

/*
 *	Parse all defined attributes. The collection of classes is handled prior to the parsing
 *	of any attributes.
 *
// TODO: Handle ._xseen.rulesets in attribute parsing. Only applies if tag has attribute 'class3d' with a value
//			of an ID that is in the ruleset Object.
//	TODO: Expand the ruleset array to an object and provide a reverse lookup by ID to array index.
 *		StyleRules = {ruleset:[], idLookup:[]}
 *		where ruleset[idLookup['id']] is the ruleset defined by 'id'
 */

	'parseAttrs'	: function (element, tagObj)
		{
			element._xseen.attributes = [];	// attributes for this tag
			element._xseen.animate = [];	// animatable attributes for this tag
			element._xseen.animation = [];	// array of animations on this tag
			element._xseen.properties = [];	// array of properties (active attribute values) on this tag
			element._xseen.parseAll = false;
			var classt = element.getAttribute('class3d');					// Get list of class3d (really IDs)
			var classes3d = (classt === null) ? [] : classt.split(' ');		// and split it (if defined)
			element._xseen.class3d = [];
			for (var ii=0; ii<classes3d.length; ii++) {						// Attaching all referenced class definitions to tag
				element._xseen.class3d.push (element._xseen.sceneInfo.StyleRules.idLookup[classes3d[ii]]);
				//element._xseen.sceneInfo.mutation.useClass3d (element, classes3d[ii]);
			}
			tagObj.attributes.forEach (function (attr, ndx, wholeThing)
				{
					var value = this.parseAttr (attr, element, element._xseen.class3d);
					if (value == 'XSeen.parse.all') {
						element._xseen.parseAll = true;
					} else {
						element._xseen.attributes[attr.attribute] = value;
						if (attr.isAnimatable) {element._xseen.animate[attr.attribute] = null;}
					}
				}, this);
		},
		
// TODO: Debug/Test reparseAttr method -- used for runtime changes to declarations
	'reparseAttr'	: function (ele, attributeName)
		{
			if (typeof(XSeen.Parser.Table[ele.localName]) === 'undefined') {return null;}
			var tagObj = XSeen.Parser.Table[ele.localName];
			if (typeof(tagObj.attributes[attributeName]) === 'undefined') {return null; }
			var attr = tagObj.attributes[attributeName];
			var value = XSeen.Parser.parseAttr (attr, ele, ele._xseen.class3d);
			return value;
		},
	'parseAttr'		: function (attr, ele, class3d)			// Parse an individual attribute
		{
			var classValue = this.getClassAttributeValue (attr.attribute, class3d)
			var value = ele.getAttribute(attr.attribute);
			if (value === null || value == '') {value = classValue;}
			value = XSeen.Parser.Types[attr.type] (value, attr.default, attr.caseInsensitive, attr.enumeration);
			return value;
		},
	'getClassAttributeValue' : function (attribute, classList)
		{
			var classValue = null;
			if (classList === null) {return classValue;}
			for (var ii=0; ii<classList.length; ii++) {
				for (var jj=0; jj<classList[ii].declaration.length; jj++) {
					if (classList[ii].declaration[jj].property == attribute) {
						classValue = classList[ii].declaration[jj].value;
					}
				}
			}
			return classValue;
		},

/*
 *	Returns all of the available information about a specified field in a given tag. The
 *	property 'good' indicates that everything was found and could be handled. If 'good' is FALSE, then
 *	something went wrong or is missing.
 */
	'getAttrInfo' : function (tagName, attrName) {
		var attrInfo = {'good': false, 'tagExists': false, 'attrExists': false};
		if (typeof(tagName) === 'undefined' || tagName == '' || typeof(attrName) === 'undefined' || attrName == '') {return attrInfo;}
		var tagName = tagName.toLowerCase();
		if (typeof(XSeen.Parser.Table[tagName]) === 'undefined') {
			return attrInfo;
		}		// TODO: Need to convert all following from node => tag; field => attribute; and use new structures
		attrInfo.tagExists = true;
		var tag = XSeen.Parser.Table[tagName];
		var attrName = attrName.toLowerCase();
		if (typeof(tag.attrIndex[attrName]) === 'undefined') {
			return attrInfo;
		}
		attrInfo.attrExists = true;
		var attribute = tag.attributes[tag.attrIndex[attrName]];
		attrInfo.tag = tag;
		attrInfo.attribute = attribute;
		attrInfo.handlerName = tag.event;
		attrInfo.dataType = attribute.type;
		attrInfo.good = true;
		return attrInfo;
	},

// Utility methods for dealing with the entire parse table
	'dumpTable'	: function ()
		{
			var jsonstr = JSON.stringify ({'tags': XSeen.Parser.Table}, null, '  ');
			console.log('Node parsing table (' + XSeen.Parser.Table.length + ' tags)\n' + jsonstr);
			return jsonstr;
		},

// TODO: Write load function
	'loadTable'	: function (jsonstr)
		{
			var jsonstr = JSON.stringify ({'tags': XSeen.Parser.Table}, null, '  ');
			XSeen.Parser.Table = [];
		},
		
/*
 * DataType handlers. This convert from the user HTML to internal structure
 *	New types can be added in XSeen.Parser.Types.<new-name> = function (<attribute-value-string>, <attribute-default>, <value-caseInsensitive>, <attribute-enumeration-array>)
 *	The value returned is the parsed value in the requested datatype.
 *
 *	Only the string methods use 'insensitive'. Color is always converted to lower case.
 *	None of the vector or boolean methods use 'enumeration'
 */
	'Types'	: {
		'_checkEnumeration'	: function (value, def, enumeration)
			{
				for (var ii=0; ii<enumeration.length; ii++) {
					if (value == enumeration[ii]) {return value;}
				}
				if (enumeration.length == 0) {return value;}
				return def;
			},
		'_splitArray'	: function (value, def, minCount)
			{
				if (typeof(value) == 'object') {
					return (value.length < minCount) ? def : value;
				}
				//console.log('Splitting |'+value+'|');
				var arrayValue = value.split(' ');
				if (arrayValue.length < minCount) {return def;}
				return arrayValue;
			},

		'string'	: function(value, def, insensitive, enumeration) 
			{
				if (insensitive) {value = value.toLowerCase();}
				if (value === null) {return def;}
				return this._checkEnumeration (value, def, enumeration);
			},
		'integer'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				if (Number.isNaN(value)) {return def};
				return Math.round(this._checkEnumeration (value, def, enumeration));
			},
		'float'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				if (Number.isNaN(value)) {return def};
				return this._checkEnumeration (value, def, enumeration)-0;
			},
		'vec2'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				//console.log('vec2 need to split |'+value+'|');
				var arrayValue = this._splitArray (value, def, 2);
				var retValue = [this.float(arrayValue[0], def[0], false, []),
								this.float(arrayValue[1], def[1], false, [])];
				return retValue;
			},
		'vec3'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				//console.log('vec3 need to split |'+value+'|');
				var arrayValue = this._splitArray (value, def, 3);
				var retValue = [this.float(arrayValue[0], def[0], false, []),
								this.float(arrayValue[1], def[1], false, []),
								this.float(arrayValue[2], def[2], false, [])];
				return retValue;
			},
		'xyz'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				var arrayValue = this._splitArray (value, def, 3);
				var retValue = {x:this.float(arrayValue[0], def[0], false, []),
								y:this.float(arrayValue[1], def[1], false, []),
								z:this.float(arrayValue[2], def[2], false, [])};
				return retValue;
			},
		'vec4'		: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				var arrayValue = this._splitArray (value, def, 4);
				var retValue = [this.float(arrayValue[0], def[0], false, []),
								this.float(arrayValue[1], def[1], false, []),
								this.float(arrayValue[2], def[2], false, []),
								this.float(arrayValue[3], def[3], false, [])];
				return retValue;
			},
		'vector'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				var arrayValue = this._splitArray (value, def);
				return arrayValue;
			},
		'boolean'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) return def;
				if (value === '') return def;
				var svalue = value.toLowerCase();
				if (svalue == '') return def;
				if (svalue == 'f' || svalue == 'false' || svalue == '0') return false;
				var ivalue = Boolean (value);
				return ivalue;
/*
				if (value) {return true;}
				if (!value) {return false;}
				return def;
 */
			},
		'vecToFloat3'	: function (value, def)
			{
				var retValue = [
					this.float(value[0], def[0], false, []),
					this.float(value[1], def[1], false, []),
					this.float(value[2], def[2], false, []),
				];
				return retValue;
			},
		'vecToXYZ'	: function (value, def)
			{
				var retValue = {
					'x':this.float(value[0], def.x, false, []),
					'y':this.float(value[1], def.y, false, []),
					'z':this.float(value[2], def.z, false, []),
				};
				return retValue;
			},
		'rotation2Quat'	: function (value)		// Converts axis-angle (vec4) to quaternion
			{
				var quat = new THREE.Quaternion();
				quat.setFromAxisAngle (new THREE.Vector3(value[0], value[1], value[2]), value[3]);
				return quat;
			},

/*
 * Color parsing order
 *	<integer>; Integer [0-16777215]. Key interger within range.
 *	#HHHHHH	24-bit hex value indicating color. Key '#'
 *	rgba(r,g,b,a); where r,g,b are either byte-integers [0,255] or percent [0%-100%]; and a is [0.0-0.1] Key 'rgba' and '%'
 *	rgb(r,g,b); where r,g,b are either byte-integers [0,255] or percent [0%-100%]. Key 'rgb' and '%'
 *	hsla(h,s,l,a); where h is [0-360], s&l are [0-100%]. Key 'hsla'
 *	hsl(h,s,l); where h is [0-360], s&l are [0-100%]. Key 'hsl'
 *	<color-name>; One of the 140 predefined HTML color names. This is enumerable (but not yet)
 *	<default used>
 */
		'color'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {return def;}
				value = value.trim().toLowerCase();
				if (!Number.isNaN(value) && Math.round(value) == value && (value-0 <= 16777215) && (value-0 >= 0)) {return value;}

				if (value.substring(0,1) == '#') {
					value = '0x' + value.substring(1,value.length) - 0;
					if (Number.isNaN(value) || value < 0 || value > 16777215) {return def;}
					return value;
				}
				
				if (value.substring(0,3) == 'rgb') {
					XSeen.LogWarn("RGB[A] color not yet implemented");
				}
				if (value.substring(0,3) == 'hsl') {
					XSeen.LogWarn("HSL[A] color not yet implemented");
				}
				
				if (typeof(XSeen.CONST.Colors[value]) === 'undefined') {return def;}
				return XSeen.CONST.Colors[value];	// TODO: add check on enumeration
				//return def;
			},

/*
 * Rotation parsing order
 *	e(rx, ry, rz): Euler rotation about (in local order) X, Y, and Z axis
 *	q(x, y, z, w): Quaternion with 4 components
 *	h(x, y, z, t): Homogeneous rotation of 't' about the vector [x, y, z]
 *	The default is e(). The 'e' and parantheses are optional.
 *	The return value is always a quaternion
 *
 *	Only the Euler rotation without 'e(' and ')' is implemented. The default should be of the this type.
 */
		'rotation'	: function(value, def, insensitive, enumeration)
			{
				if (value === null) {value = def;}
				var eulerAngles = this.vec3 (value, def, true, []);
				var euler = new THREE.Euler();
				euler.fromArray (eulerAngles);
				var quat = new THREE.Quaternion();
				quat.setFromEuler (euler);
				
				return quat;
			},

	},		// End of 'Types' object
		
};
