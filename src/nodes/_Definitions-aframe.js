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

xseen._addAframeAppearance = function (node) {
	node
		.addField('ambient-occlusion-map', 'SFString', '')
		.addField('ambient-occlusion-map-intensity', 'SFFloat', 1)
		.addField('ambient-occlusion-texture-offset', 'SFVec2f', '0 0')
		.addField('ambient-occlusion-texture-repeat', 'SFVec2f', '1 1')
		.addField('color', 'Color', '#FFF')
		.addField('displacement-bias', 'SFFloat', 0.5)
		.addField('displacement-map', 'SFString', '')
		.addField('displacement-scale', 'SFFloat', 1)
		.addField('displacement-texture-offset', 'SFVec2f', '0 0')
		.addField('displacement-texture-repeat', 'SFVec2f', '1 1')
		.addField('env-map', 'SFString', '')
		.addField('fog', 'SFBool', true)
		.addField('metalness', 'SFFloat', 0)
		.addField('normal-map', 'SFString', '')
		.addField('normal-scale', 'SFVec2f', '1 1')
		.addField('normal-texture-offset', 'SFVec2f', '0 0')
		.addField('normal-texture-repeat', 'SFVec2f', '1 1')
		.addField('repeat', 'SFVec2f', '1 1')
		.addField('roughness', 'SFFloat', 0.5)
		.addField('spherical-env-map', 'SFString', '')
		.addField('src', 'SFString', '')
		.addField('wireframe', 'SFBool', false)
		.addField('wireframe-linewidth', 'SFInt', 2)
		.addNode();
}

xseen.nodes._defineNode('a-entity', 'A-Frame', 'af_Entity')
	.addField('geometry', 'SFString', '')
	.addField('material', 'SFString', '')
	.addField('light', 'SFString', '')
	.addNode();

var node;
node = xseen.nodes._defineNode('a-box', 'A-Frame', 'af_Box')
						.addField('depth', 'SFFloat', 1)
						.addField('height', 'SFFloat', 1)
						.addField('width', 'SFFloat', 512)
						.addField('segments-depth', 'SFInt', 1)
						.addField('segments-height', 'SFInt', 1)
						.addField('segments-width', 'SFInt', 1);
xseen._addAframeAppearance (node);

node = xseen.nodes._defineNode('a-cone', 'A-Frame', 'af_Cone')
					.addField('height', 'SFFloat', 1)
					.addField('radius', 'SFFloat', 1)
					.addField('open-ended', 'SFBool', false)
					.addField('theta-start', 'SFFloat', 0)
					.addField('theta-length', 'SFFloat', 360)
					.addField('segments-height', 'SFInt', 1)
					.addField('segments-radial', 'SFInt', 8);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-cylinder', 'A-Frame', 'af_Cylinder')
					.addField('height', 'SFFloat', 1)
					.addField('open-ended', 'SFBool', false)
					.addField('radius-bottom', 'SFFloat', 1)
					.addField('radius-top', 'SFFloat', 1)
					.addField('theta-start', 'SFFloat', 0)
					.addField('theta-length', 'SFFloat', 360)
					.addField('segments-height', 'SFInt', 1)
					.addField('segments-radial', 'SFInt', 8);
xseen._addAframeAppearance (node);

node = xseen.nodes._defineNode('a-dodecahedron', 'A-Frame', 'af_Dodecahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-icosahedron', 'A-Frame', 'af_Icosahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-octahedron', 'A-Frame', 'af_Octahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-sphere', 'A-Frame', 'af_Sphere')
					.addField('radius', 'SFFloat', 1)
					.addField('theta-start', 'SFFloat', 0)
					.addField('theta-length', 'SFFloat', 180)
					.addField('phi-start', 'SFFloat', 0)
					.addField('phi-length', 'SFFloat', 360)
					.addField('segments-height', 'SFInt', 18)
					.addField('segments-width', 'SFInt', 36);
xseen._addAframeAppearance (node);
	
node = xseen.nodes._defineNode('a-tetrahedron', 'A-Frame', 'af_Tetrahedron')
					.addField('radius', 'SFFloat', 1)
					.addField('detail', 'SFFloat', 0);
xseen._addAframeAppearance (node);

node = xseen.nodes._defineNode('a-torus', 'A-Frame', 'af_Torus')
					.addField('radius', 'SFFloat', 2)
					.addField('tube', 'SFFloat', 1)
					.addField('arc', 'SFFloat', 360)
					.addField('segments-radial', 'SFInt', 8)
					.addField('segments-tubular', 'SFInt', 6);
xseen._addAframeAppearance (node);

// Dump parse table
//xseen.nodes._dumpTable();