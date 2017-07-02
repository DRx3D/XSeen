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

xseen.nodes._defineNode('Cone', 'Geometry3D', 'geometry3D_Cone')
	.addField('bottomRadius', 'SFFloat', 1)
	.addField('height', 'SFFloat', 2)
	.addField('bottom', 'SFBool', true)
	.addField('side', 'SFBool', true)
	.addNode();

xseen.nodes._defineNode('Box', 'Geometry3D', 'geometry3D_Box')
	.addField('size', 'SFVec3f', [1,1,1])
	.addNode();
	
xseen.nodes._defineNode('Sphere', 'Geometry3D', 'geometry3D_Sphere')
	.addField('radius', 'SFFloat', '1')
	.addNode();
	
xseen.nodes._defineNode('Cylinder', 'Geometry3D', 'geometry3D_Cylinder')
	.addField('radius', 'SFFloat', 1)
	.addField('height', 'SFFloat', 2)
	.addField('bottom', 'SFBool', true)
	.addField('side', 'SFBool', true)
	.addField('top', 'SFBool', true)
	.addNode();
	
xseen.nodes._defineNode ('Material', 'Appearance', 'appearance_Material')
	.addField({name:'diffuseColor', datatype:'SFColor', defaultValue:[.8,.8,.8], animatable:true})
	.addField({name:'emissiveColor',datatype: 'SFColor', defaultValue:[0,0,0], animatable:true})
	.addField({name:'specularColor', datatype:'SFColor', defaultValue:[0,0,0], animatable:true})
	.addField({name:'transparency', datatype:'SFFloat', defaultValue:'0', animatable:true})
	.addField({name:'shininess', datatype:'SFFloat', defaultValue:'0', animatable:true})
	.addNode();

xseen.nodes._defineNode ('Transform', 'Grouping', 'grouping_Transform')
	.addField({name:'translation', datatype:'SFVec3f', defaultValue:[0,0,0], animatable:true})
	.addField({name:'scale', datatype:'SFVec3f', defaultValue:[1,1,1], animatable:true})
	.addField({name:'rotation', datatype:'SFRotation', defaultValue:xseen.types.SFRotation('0 1 0 0',''), animatable:true})
	.addNode();
xseen.nodes._defineNode ('Group', 'Grouping', 'grouping_Transform')
	.addNode();

xseen.nodes._defineNode ('Light', 'Lighting', 'lighting_Light')
	.addField('direction', 'SFVec3f', [0,0,-1])									// DirectionalLight
	.addField('location', 'SFVec3f', [0,0,0])									// PointLight & SpotLight
	.addField('radius', 'SFFloat', '100')										// PointLight & SpotLight
	.addField('attenuation', 'SFVec3f', [1,0,0])								// PointLight & SpotLight
	.addField('beamWidth', 'SFFloat', '0.78539816339744830961566084581988')		// SpotLight
	.addField('cutOffAngle', 'SFFloat', '1.5707963267948966192313216916398')	// SpotLight
	.addField('color', 'SFColor', [1,1,1])										// General
	.addField('intensity', 'SFFloat', '1')										// General
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'Directional', enumerated:['Directional', 'Spot', 'Point'], animatable:true})
	.addNode();
xseen.nodes._defineNode ('DirectionalLight', 'Lighting', 'lighting_Light')
	.addField('direction', 'SFVec3f', [0,0,-1])
	.addField('color', 'SFColor', [1,1,1])
	.addField('intensity', 'SFFloat', '1')
	.addField('type', 'SFString', 'Directional')
	.addNode();
xseen.nodes._defineNode ('PointLight', 'Lighting', 'lighting_Light')
	.addField('location', 'SFVec3f', [0,0,0])
	.addField('radius', 'SFFloat', '100')
	.addField('attenuation', 'SFVec3f', [1,0,0])
	.addField('color', 'SFColor', [1,1,1])
	.addField('intensity', 'SFFloat', '1')
	.addField('type', 'SFString', 'Point')
	.addNode();
xseen.nodes._defineNode ('SpotLight', 'Lighting', 'lighting_Light')
	.addField('direction', 'SFVec3f', [0,0,-1])
	.addField('radius', 'SFFloat', '100')
	.addField('attenuation', 'SFVec3f', [1,0,0])
	.addField('beamWidth', 'SFFloat', '0.78539816339744830961566084581988')		// pi/4
	.addField('cutOffAngle', 'SFFloat', '1.5707963267948966192313216916398')	// pi/2
	.addField('color', 'SFColor', [1,1,1])
	.addField('intensity', 'SFFloat', '1')
	.addField('type', 'SFString', 'Spot')
	.addNode();

xseen.nodes._defineNode ('Camera', 'Unknown', 'unk_Viewpoint')
	.addField('position', 'SFVec3f', [0,0,10])
	.addField('orientation', 'SFRotation', xseen.types.SFRotation('0 1 0 0',''))
	.addNode();

xseen.nodes._defineNode ('Inline', 'Networking', 'networking_Inline')
	.addField('url', 'SFString', '')
	.addNode();

xseen.nodes._defineNode ('scene', 'Core', 'core_Scene')
	.addNode();
xseen.nodes._defineNode ('canvas', 'Core', 'core_NOOP')
	.addNode();
xseen.nodes._defineNode ('WorldInfo', 'Core', 'core_WorldInfo')
	.addNode();
xseen.nodes._defineNode ('Appearance', 'Appearance', 'appearance_Appearance')
	.addNode();
xseen.nodes._defineNode ('ImageTexture', 'Appearance', 'appearance_ImageTexture')
	.addField('url', 'SFString', '')
	.addField('repeatS', 'SFBool', true)
	.addField('repeatT', 'SFBool', true)
	.addNode();

xseen.nodes._defineNode ('Shape', 'Shape', 'unk_Shape')
	.addNode();
xseen.nodes._defineNode ('Viewpoint', 'Unknown', 'unk_Viewpoint')
	.addField('position', 'SFVec3f', '0 0 10')
	.addField('orientation', 'SFRotation', xseen.types.SFRotation('0 1 0 0',''))
	.addField('description', 'SFString', '')
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'perspective', enumerated:['perspective', 'stereo', 'orthographic'], animatable:false})
	.addField('active', 'SFBool', true)				// incoming event
	.addNode();
xseen.nodes._defineNode('Background', 'Environmental', 'env_Background')
	.addField('skyColor', 'SFColor', [0,0,0])
	.addField('srcFront', 'SFString', '')
	.addField('srcBack', 'SFString', '')
	.addField('srcTop', 'SFString', '')
	.addField('srcBottom', 'SFString', '')
	.addField('srcLeft', 'SFString', '')
	.addField('srcRight', 'SFString', '')
	.addField('backgroundIsCube', 'SFBool', 'true')
	.addNode();

xseen.nodes._defineNode('TriangleSet', 'Geometry', 'geometry_TriangleSet')
	.addField('ccw', 'SFBool', 'true')
	.addField('colorPerVertex', 'SFBool', 'true')
	.addField('solid', 'SFBool', 'true')
	.addNode();
xseen.nodes._defineNode('IndexedTriangleSet', 'Geometry', 'geometry_IndexedTriangleSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addField('index', 'MFInt', '')
	.addNode();
xseen.nodes._defineNode('Coordinate', 'Geometry', 'geometry_Coordinate')
	.addField('point', 'MFVec3f', [])
	.addNode();
xseen.nodes._defineNode('Normal', 'Geometry', 'geometry_Normal')
	.addField('vector', 'MFVec3f', [])
	.addNode();
xseen.nodes._defineNode('Color', 'Geometry', 'geometry_Color')
	.addField('color', 'MFColor', [])
	.addNode();
xseen.nodes._defineNode('IndexedFaceSet', 'Geometry', 'geometry_IndexedFaceSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addField('coordIndex', 'MFInt', '')
	.addNode();
xseen.nodes._defineNode('IndexedQuadSet', 'Geometry', 'geometry_IndexedQuadSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addField('index', 'MFInt', '')
	.addNode();
xseen.nodes._defineNode('QuadSet', 'Geometry', 'geometry_QuadSet')
	.addField('ccw', 'SFBool', true)
	.addField('colorPerVertex', 'SFBool', true)
	.addField('solid', 'SFBool', true)
	.addNode();

//xseen.nodes._dumpTable();