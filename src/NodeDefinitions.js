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

// Definition of nodes. Each definition is a name and an action routine. The routine is called when
// the node is found. 
// Each node name is converted to lowercase prior to comparison during parsing. 
// Each action routine name is prepended with 'xseen.node.' to help control name scoping.
// If 'z' is an action routine, then it is called as xseen.node.z(HTMLemenent);
// The return value for each action routine is...
// Since these are HTML tags in development, lower-case tag names can be proceeded with 'x-'. That is automatically handled

/*
xseen._defineNode ('scene',			'core_Scene');
xseen._defineNode ('canvas',		'core_NOOP');
xseen._defineNode ('WorldInfo',		'core_WorldInfo');
xseen._defineNode ('Box',			'geometry3D_Box');
xseen._defineNode ('Cone',			'geometry3D_Cone');
xseen._defineNode ('Material',		'appearance_Material');
xseen._defineNode ('Appearance',	'appearance_Appearance');
xseen._defineNode ('Shape',			'unk_Shape');
xseen._defineNode ('Transform',		'grouping_Transform');
xseen._defineNode ('Camera',		'unk_Camera');
xseen._defineNode ('Viewpoint',		'unk_Camera');
xseen._defineNode ('Light',			'unk_Light');
 */
 
/*
 * xseen.nodes.<nodeName> is the definition of <nodeName>
 * All internal variables are stored in ._internal. All functions start with '_'
 *
 * This is a bare-bones setup. There is no error checking - missing arguments or
 * methods that do not exist (e.g., <nodeMethod>.init)
 *
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 * Still need to determine how this thing is going to be internally stored.
 */
xseenNodes = {};

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
	}
};
	
xseen.nodes._defineNode('Cone', 'Geometry3D', 'geometry3D_Cone')
	.addField('bottomRadius', 'SFFloat', 1)
	.addField('height', 'SFFloat', 2)
	.addField('bottom', 'SFBool', true)
	.addField('side', 'SFBool', true)
	.addNode();

xseen.nodes._defineNode('Box', 'Geometry3D', 'geometry3D_Box')
	.addField('size', 'SFVec3f', '1 1 1')
	.addNode();
	
xseen.nodes._defineNode ('Material', 'Appearance', 'appearance_Material')
	.addField('diffuseColor', 'SFColor', '.8 .8 .8')
	.addField('emissiveColor', 'SFColor', '0 0 0')
	.addField('specularColor', 'SFColor', '0 0 0')
	.addField('transparency', 'SFFloat', '0')
	.addField('shininess', 'SFFloat', '0')
	.addNode();

xseen.nodes._defineNode ('Transform', 'Grouping', 'grouping_Transform')
	.addField('translation', 'SFVec3f', '0 0 0')
	.addField('scale', 'SFVec3f', '1 1 1')
	.addNode();

xseen.nodes._defineNode ('Light', 'unknown', 'unk_Light')
	.addField('direction', 'SFVec3f', '0 0 -1')
	.addField('color', 'SFColor', '1 1 1')
	.addField('intensity', 'SFFloat', '1')
	.addNode();

xseen.nodes._defineNode ('Camera', 'Unknown', 'unk_Camera')
	.addField('position', 'SFVec3f', '0 0 10')
	.addNode();

xseen.nodes._defineNode ('scene', 'Core', 'core_Scene')
	.addNode();
xseen.nodes._defineNode ('canvas', 'Core', 'core_NOOP')
	.addNode();
xseen.nodes._defineNode ('WorldInfo', 'Core', 'core_WorldInfo')
	.addNode();
xseen.nodes._defineNode ('Appearance', 'Appearance', 'appearance_Appearance')
	.addNode();
xseen.nodes._defineNode ('Shape', 'Shape', 'unk_Shape')
	.addNode();
xseen.nodes._defineNode ('Viewpoint', 'Unknown', 'unk_Camera')
	.addNode();


xseen.debug.logInfo("New Node Definition Table");
var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
//console.log(jsonstr);
//xseen.debug.logInfo("<pre>"+jsonstr+"</pre>");

	