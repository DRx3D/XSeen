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

 // Node definition code for A-Frame nodes


xseen.node.core_NOOP = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.parsing = function (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.af_Entity = {
	'init'	: function (e,p)
		{	
			xseen.node.parsing('A-Frame Entity');
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Appearance = function (e) {
	console.log ('a-node Appearance: ' + e._xseen.fields);
/*
	var material = new THREE.MeshPhongMaterial( {
					'aoMap'					: e._xseen.fields['ambient-occlusion-map'],
					'aoMapIntensity'		: e._xseen.fields['ambient-occlusion-map-intensity'],
					'color'					: e._xseen.fields['color'],
					'displacementMap'		: e._xseen.fields['displacement-map'],
					'displacementScale'		: e._xseen.fields['displacement-scale'],
					'displacementBias'		: e._xseen.fields['displacement-bias'],
					'envMap'				: e._xseen.fields['env-map'],
					'normalMap'				: e._xseen.fields['normal-map'],
					'normalScale'			: e._xseen.fields['normal-scale'],
					'wireframe'				: e._xseen.fields['wireframe'],
					'wireframeLinewidth'	: e._xseen.fields['wireframe-linewidth'],
						} );
 */
	var parameters = {
					'aoMap'					: e._xseen.fields['ambient-occlusion-map'],
					'aoMapIntensity'		: e._xseen.fields['ambient-occlusion-map-intensity'],
					'color'					: e._xseen.fields['color'],
					'displacementMap'		: e._xseen.fields['displacement-map'],
					'displacementScale'		: e._xseen.fields['displacement-scale'],
					'displacementBias'		: e._xseen.fields['displacement-bias'],
					'envMap'				: e._xseen.fields['env-map'],
					'normalMap'				: e._xseen.fields['normal-map'],
					'normalScale'			: e._xseen.fields['normal-scale'],
					'wireframe'				: e._xseen.fields['wireframe'],
					'wireframeLinewidth'	: e._xseen.fields['wireframe-linewidth'],
						};
	var material = new THREE.MeshPhongMaterial(parameters);
	return material;
/*
 * === All Entries ===
.aoMap
.aoMapIntensity
.color
	.combine
.displacementMap
.displacementScale
.displacementBias
	.emissive
	.emissiveMap
	.emissiveIntensity
.envMap
	.lightMap
	.lightMapIntensity
	.map
	.morphNormals
	.morphTargets
.normalMap
.normalScale
	.reflectivity
	.refractionRatio
	.shininess
	.skinning
	.specular
	.specularMap
.wireframe
	.wireframeLinecap
	.wireframeLinejoin
.wireframeLinewidth 
///////////////////////////////////////////////////////////////////////////////
e._xseen.fields['ambient-occlusion-map']
e._xseen.fields['ambient-occlusion-map-intensity']
	e._xseen.fields['ambient-occlusion-texture-offset']
	e._xseen.fields['ambient-occlusion-texture-repeat']
e._xseen.fields['color']
e._xseen.fields['displacement-bias']
e._xseen.fields['displacement-map']
e._xseen.fields['displacement-scale']
	e._xseen.fields['displacement-texture-offset']
	e._xseen.fields['displacement-texture-repeat']
e._xseen.fields['env-map']
	e._xseen.fields['fog']
	e._xseen.fields['metalness']
e._xseen.fields['normal-map']
e._xseen.fields['normal-scale']
	e._xseen.fields['normal-texture-offset']
	e._xseen.fields['normal-texture-repeat']
	e._xseen.fields['repeat']
	e._xseen.fields['roughness']
	e._xseen.fields['spherical-env-map']
	e._xseen.fields['src']
e._xseen.fields['wireframe']
e._xseen.fields['wireframe-linewidth']

 * === Unused Entries ===
	.combine
	.emissive
	.emissiveMap
	.emissiveIntensity
	.lightMap
	.lightMapIntensity
	.map
	.morphNormals
	.morphTargets
	.reflectivity
	.refractionRatio
	.shininess
	.skinning
	.specular
	.specularMap
	.wireframeLinecap
	.wireframeLinejoin
///////////////////////////////////////////////////////////////////////////////
	e._xseen.fields['ambient-occlusion-texture-offset']
	e._xseen.fields['ambient-occlusion-texture-repeat']
	e._xseen.fields['displacement-texture-offset']
	e._xseen.fields['displacement-texture-repeat']
	e._xseen.fields['fog']
	e._xseen.fields['metalness']
	e._xseen.fields['normal-texture-offset']
	e._xseen.fields['normal-texture-repeat']
	e._xseen.fields['repeat']
	e._xseen.fields['roughness']
	e._xseen.fields['spherical-env-map']
	e._xseen.fields['src']
 */
}

xseen.node.af_Box = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.BoxGeometry(
										e._xseen.fields.width, 
										e._xseen.fields.height, 
										e._xseen.fields.depth,
										e._xseen.fields['segments-width'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['segments-depth']
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Cone = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.ConeGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.height, 
										e._xseen.fields['segments-radial'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['open-ended'], 
										e._xseen.fields['theta-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['theta-length'] * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Cylinder = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.CylinderGeometry(
										e._xseen.fields['radius-top'], 
										e._xseen.fields['radius-bottom'], 
										e._xseen.fields.height, 
										e._xseen.fields['segments-radial'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['open-ended'], 
										e._xseen.fields['theta-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['theta-length'] * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Dodecahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.DodecahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Icosahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.IcosahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Octahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.OctahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Sphere = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.SphereGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields['segments-width'], 
										e._xseen.fields['segments-height'], 
										e._xseen.fields['phi-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['phi-length'] * xseen.types.Deg2Rad,
										e._xseen.fields['theta-start'] * xseen.types.Deg2Rad, 
										e._xseen.fields['theta-length'] * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.af_Tetrahedron = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TetrahedronGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.detail
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};

xseen.node.af_Torus = {
	'init'	: function (e,p)
		{
			var geometry = new THREE.TorusGeometry(
										e._xseen.fields.radius, 
										e._xseen.fields.tube, 
										e._xseen.fields['segments-radial'], 
										e._xseen.fields['segments-tubular'], 
										e._xseen.fields.arc * xseen.types.Deg2Rad
									);
			var appearance = xseen.node.af_Appearance (e);
			var mesh = new THREE.Mesh (geometry, appearance);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
