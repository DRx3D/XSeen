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

 // Node definition code (just stubs right now...)


xseen.node = {};

xseen.node.core_NOOP = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.core_WorldInfo = {
	'init'	: function (e,p) {parsing('WorldInfo', e)},
	'fin'	: function (e,p) {}
};

function parsing (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.unk_Camera = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints
			var divWidth = window.innerWidth/3;
			var divHeight =  window.innerHeight/3;
			var camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
			camera.position.x = e._xseen.fields.position[0];
			camera.position.y = e._xseen.fields.position[1];
			camera.position.z = e._xseen.fields.position[2];
			e._xseen.sceneInfo.camera.push (camera);
			p._xseen.children.push(camera);
		},
	'fin'	: function (e,p) {}
};

xseen.node.geometry3D_Box = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.BoxGeometry(e._xseen.fields.size[0], e._xseen.fields.size[1], e._xseen.fields.size[2]);
		},
	'fin'	: function (e,p) {}
};

xseen.node.geometry3D_Cone = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.ConeGeometry(e._xseen.fields.bottomradius, e._xseen.fields.height, 24, false, 0, 2*Math.PI);
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_Material = {
	'init'	: function (e,p)
		{
			var transparency  = e._xseen.fields.transparency - 0;
			var shininess  = e._xseen.fields.shininess - 0;
			var colorDiffuse = xseen.types.Color3toInt (e._xseen.fields.diffusecolor);
			var colorEmissive = xseen.types.Color3toInt (e._xseen.fields.emissivecolor);
			var colorSpecular = xseen.types.Color3toInt (e._xseen.fields.specularcolor);
			p._xseen.material = new THREE.MeshPhongMaterial( {
//			p._xseen.material = new THREE.MeshBasicMaterial( {
						'color'		: colorDiffuse,
						'emissive'	: colorEmissive,
						'specular'	: colorSpecular,
						'shininess'	: shininess,
						'opacity'	: 1.0-transparency,
						'transparent'	: (transparency > 0.0) ? true : false
						} );
		},
	'fin'	: function (e,p) {}
};
xseen.node.appearance_Appearance = {
	'init'	: function (e,p) {},

	'fin'	: function (e,p)
		{
			p._xseen.appearance = e._xseen.material;
			xseen.debug.logInfo ('Creating Appearance from Material');
		}
};
xseen.node.unk_Shape = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			var m = new THREE.Mesh (e._xseen.geometry, e._xseen.appearance);
			p._xseen.children.push(m);
			m = null;
		}
};

xseen.node.grouping_Transform = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
			// Apply transform to all objects in e._xseen.children
			var offset = e._xseen.fields.translation;
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					child.position.x = offset[0];
					child.position.y = offset[1];
					child.position.z = offset[2];
					this.children.push(child);
				}, p._xseen);
			offset = null;
		}
};

xseen.node.unk_Light = {
	'init'	: function (e,p) 
		{
			var color = xseen.types.Color3toInt (e._xseen.fields.color);
			var intensity = e._xseen.fields.intensity - 0;
			var l = new THREE.DirectionalLight (color, intensity);
			l.position.x = 0-e._xseen.fields.direction[0];
			l.position.y = 0-e._xseen.fields.direction[1];
			l.position.z = 0-e._xseen.fields.direction[2];
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(l);
			l = null;
		}
		,
	'fin'	: function (e,p)
		{
		}
};

xseen.node.core_Scene = {
	'init'	: function (e,p)
		{
			var width = window.innerWidth/3;
			var height = window.innerHeight/3;
			e._xseen.renderer = {
						'canvas' 	: e._xseen.sceneInfo.scene,
						'width'		: width,
						'height'	: height,
						'camera'	: e._xseen.sceneInfo.camera[0],
						'renderer'	: e._xseen.sceneInfo.renderer,
						};
			e._xseen.renderer.renderer.setSize (width, height);
		},
	'fin'	: function (e,p)
		{
			// Render all Children

			var firstCamera = true;
			for (var i=0; i<e._xseen.children.length; i++) {
				if (e._xseen.children[i].type != 'PerspectiveCamera') {
					e._xseen.renderer.canvas.add(e._xseen.children[i]);
				} else if (firstCamera && e._xseen.children[i].isCamera) {
					xseen.debug.logInfo("..Using child #"+i+" as camera");
					e._xseen.renderer.camera = e._xseen.children[i];
				}
			}

			e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );
			xseen.debug.logInfo("Rendered all elements -- Starting animation");
			xseen.render();
		}
};



/*
 * xseen.types contains the datatype and conversion utilities. These convert one format to another.
 * Any method ending in 'toX' where 'X' is some datatype is a conversion to that type
 * Other methods convert from string with space-spearated values
 */
xseen.types = {
	'SFFloat'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFBool'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (value) {return true;}
			if (!value) {return false;}
			return def;
		},

	'SFVec3f'	: function (value, def)
		{
			if (value === null) {value = def;}
			var v3 = value.split(' ');
			if (v3.length != 3 || Number.isNaN(v3[0]) || Number.isNaN(v3[1]) || Number.isNaN(v3[2])) {
				value = def;
				v3 = value.split(' ');
			}
			return [v3[0]-0, v3[1]-0, v3[2]-0];
		},

	'SFColor'	: function (value, defaultString)
		{
			var v3 = this.SFVec3f(value, defaultString);
			v3[0] = Math.min(Math.max(v3[0], 0.0), 1.0);
			v3[1] = Math.min(Math.max(v3[1], 0.0), 1.0);
			v3[2] = Math.min(Math.max(v3[2], 0.0), 1.0);
			return v3;
		},
	
	'Scalar'	: function (value, defaultString)
		{
			return this.SFFloat(value, defaultString);
		},

	'Vector3'	: function (value)
		{
			return new THREE.Vector3(value[0], value[1], value[2]);
		},

	'Color3'	: function (value, defaultString)
		{
			return this.SFColor(value, defaultString);
		},
	
	'Color3toHex' : function (c3)
		{
			var hr = Math.round(255*c3[0]).toString(16);
			var hg = Math.round(255*c3[1]).toString(16);
			var hb = Math.round(255*c3[2]).toString(16);
			if (hr.length < 2) {hr = "0" + hr;}
			if (hg.length < 2) {hg = "0" + hg;}
			if (hb.length < 2) {hb = "0" + hb;}
			var hex = '0x' + hr + hg + hb;
			return hex;
		},

	'Color3toInt' : function (c3)
		{
			var hr = Math.round(255*c3[0]) << 16;
			var hg = Math.round(255*c3[1]) << 8;
			var hb = Math.round(255*c3[2])
			return hr + hg + hb;
		}
	
};
