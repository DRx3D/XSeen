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

xseen.nodeDefinitions = [
		{node : 'WorldInfo',	action : 'core_WorldInfo'},
		{node : 'Box',			action : 'geometry3D_Box'},
		{node : 'Cone',			action : 'geometry3D_Cone'},
		{node : 'Material',		action : 'appearance_Material'},
		{node : 'Shape',		action : 'unk_Shape'},
		{node : 'Transform',	action : 'grouping_Transform'},
		{node : 'Camera',		action : 'unk_Camera'},
		{node : 'Light',		action : 'unk_Light'}
				];
	
xseen.addNodes (xseen.nodeDefinitions);