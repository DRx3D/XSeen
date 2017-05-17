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
	'init' : function (e,p) {}
};
xseen.node.core_WorldInfo = {
	'init' : function (e,p) {parsing('WorldInfo', e)}
};
xseen.node.unk_Light = {
	'init' : function (e,p) {parsing('Light', e)}
};

function parsing (s, e) {
	xseen.debug.logInfo ('Parsing init details stub for ' + s);
}

xseen.node.unk_Camera = {
	'init' : function (e,p) {	// This should really go in a separate push-down list for Viewpoints
		var location = xseen.types.Vector3 (e.getAttribute('position'), '0 0 10');
		var divWidth = window.innerWidth/3;
		var divHeight =  window.innerHeight/3;
		var camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
		camera.position.x = location[0];
		camera.position.y = location[1];
		camera.position.z = location[2];
		p._xseen.camera = camera;
	}
};

xseen.node.geometry3D_Box = {
	'init' : function (e,p) {
		var size = xseen.types.Vector3 (e.getAttribute('size'), '1 1 1');
		p._xseen.geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
	}
};

xseen.node.geometry3D_Cone = {
	'init' : function (e,p) {
		var bottomRadius = xseen.types.Scalar (e.getAttribute('bottomradius'), 1);
		var height = xseen.types.Scalar (e.getAttribute('height'), 2);
		p._xseen.geometry = new THREE.ConeGeometry(bottomRadius, height, 24, false, 0, 2*Math.PI);
		xseen.debug.logInfo ('New parsing for cone');
	}
};

xseen.node.appearance_Material = {
	'init' : function (e,p) {
		var colorDiffuse = xseen.types.Color3 (e.getAttribute('diffuseColor'), '.8 .8 .8');
		var colorEmisive  = xseen.types.Color3 (e.getAttribute('emisiveColor'), '0 0 0');
		colorEmisive = xseen.types.Color3toInt (colorEmisive);
		p._xseen.material = new THREE.MeshBasicMaterial( { color: colorEmisive } );
		xseen.debug.logInfo ('Creating Material of diffuse: [' + colorDiffuse[0] +', ' + colorDiffuse[1] + ', ' + colorDiffuse[2] + ']; emisive: ' + colorEmisive);
	}
};
xseen.node.appearance_Appearance = {
	'init' : function (e,p) {},

	'endParse' : function (e,p) {
		p._xseen.appearance = e._xseen.material;
		xseen.debug.logInfo ('Creating Appearance from Material');
	}
};
xseen.node.unk_Shape = {
	'init' : function (e,p) {},
	'endParse' : function (e,p) {
		var m = new THREE.Mesh(e._xseen.geometry, e._xseen.appearance );
		if (typeof(p._xseen.shape) == 'undefined') {p._xseen.shape = [];}
		p._xseen.shape.push(m);
	}
};

xseen.node.grouping_Transform = {
	'init' : function (e,p) {},
	'endParse' : function (e,p) {
		// Apply transform to all objects in e._xseen.shape
		if (typeof(p._xseen.shape) == 'undefined') {p._xseen.shape = [];}
		for (var i=0; i<e._xseen.shape.length; i++) {
			p._xseen.shape.push(e._xseen.shape[i]);
		}
	}
};

xseen.node.core_Scene = {
	'init' : function (e,p) {
		var width = window.innerWidth/3;
		var height = window.innerHeight/3;
		e._xseen.renderer = {
					'canvas' 	: e._sceneInfo.scene,
					'width'		: width,
					'height'	: height,
					'camera'	: e._sceneInfo.camera,
					'renderer'	: e._sceneInfo.renderer,
					};
		e._xseen.renderer.camera.position.x = 0;
		e._xseen.renderer.camera.position.z = 10;
		e._xseen.renderer.renderer.setSize (width, height);
	},
	'endParse' : function (e,p) {
		// Render all Shapes

		for (var i=0; i<e._xseen.shape.length; i++) {
			e._xseen.renderer.canvas.add(e._xseen.shape[i]);
		}

	//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	//var cube = new THREE.Mesh( geometry, material );
	//e._xseen.renderer.canvas.add( cube );
	//e._xseen.renderer.camera.position.x = 1;
	//e._xseen.renderer.camera.position.z = 5;
	//requestAnimationFrame( render );
	e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );

		xseen.debug.logInfo("Rendered all elements");
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
			return v3;
		},
	
	'Scalar'	: function (value, defaultString)
		{
			return this.SFFloat(value, defaultString);
		},

	'Vector3'	: function (value, defaultString)
		{
			return this.SFVec3f(value, defaultString);
		},

	'Color3'	: function (value, defaultString)
		{
			var v3 = xseen.types.Vector3(value, defaultString);
			v3[0] = Math.min(Math.max(v3[0], 0.0), 1.0);
			v3[1] = Math.min(Math.max(v3[1], 0.0), 1.0);
			v3[2] = Math.min(Math.max(v3[2], 0.0), 1.0);
			return v3;
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
