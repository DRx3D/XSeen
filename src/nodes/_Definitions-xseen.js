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
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object (_dumpTable) so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 */

xseen.nodes._defineNode('model', 'XSeen', 'x_Model')
	.addField('src', 'SFString', '')
	.addField('playonload', 'SFString', '')
	.addField('duration', 'SFFloat', '-1')
	.addNode();

xseen.nodes._defineNode('animate', 'XSeen', 'x_Animate')
	.addField('field', 'SFString', '')
	.addField('to', 'MFFloat', '')				// Needs to be 'field' datatype. That is not known until node-parse. For now insist on numeric array
	.addField('delay', 'SFTime', 0)
	.addField('duration', 'SFTime', 0)
	.addField('repeat', 'SFInt', 0)
	.addField({name:'interpolator', datatype:'EnumerateString', defaultValue:'position', enumerated:['position', 'rotation', 'color'], animatable:false})
	.addField({name:'Easing', datatype:'EnumerateString', defaultValue:'', enumerated:['', 'in', 'out', 'inout'], animatable:false})
	.addField({name:'EasingType', datatype:'EnumerateString', defaultValue:'linear', enumerated:['linear', 'quadratic', 'sinusoidal', 'exponential', 'elastic', 'bounce'], animatable:false})
	.addField('start', 'SFTime', 0)				// incoming event, need to set timer trigger
	.addField('end', 'SFTime', 0)				// incoming event, need to set timer trigger
	.addNode();


// Dump parse table
//xseen.nodes._dumpTable();