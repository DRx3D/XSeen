/*
 * xseen.types contains the datatype and conversion utilities. These convert one format to another.
 * Any method ending in 'toX' where 'X' is some datatype is a conversion to that type
 * Other methods convert from string with space-spearated values
 */
xseen.types = {
	'Deg2Rad'	: Math.PI / 180,

	'SFFloat'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFInt'	: function (value, def)
		{
			if (value === null) {value = def;}
			if (Number.isNaN(value)) {return def};
			return Math.round(value);
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
			if (v3.length < 3 || Number.isNaN(v3[0]) || Number.isNaN(v3[1]) || Number.isNaN(v3[2])) {
				value = def;
				v3 = value.split(' ');
			}
			return [v3[0]-0, v3[1]-0, v3[2]-0];
		},

	'SFVec2f'	: function (value, def)
		{
			if (value === null) {value = def;}
			var v2 = value.split(' ');
			if (v2.length != 2 || Number.isNaN(v2[0]) || Number.isNaN(v2[1])) {
				value = def;
				v2 = value.split(' ');
			}
			return [v2[0]-0, v2[1]-0];
		},

	'SFRotation'	: function (value, def)
		{
			if (value === null) {value = def;}
			var v4 = value.split(' ');
			if (v4.length != 4 || Number.isNaN(v4[0]) || Number.isNaN(v4[1]) || Number.isNaN(v4[2]) || Number.isNaN(v4[3])) {
				value = def;
				v4 = value.split(' ');
			}
			var result = {
							'vector'		: [v4[0], v4[1], v4[2], v4[3]],
							'axis_angle'	: [{'x': v4[0], 'y': v4[1], 'z': v4[2]}, v4[3]],
						};
			return result;
		},

	'SFColor'	: function (value, defaultString)
		{
			var v3 = this.SFVec3f(value, defaultString);
			v3[0] = Math.min(Math.max(v3[0], 0.0), 1.0);
			v3[1] = Math.min(Math.max(v3[1], 0.0), 1.0);
			v3[2] = Math.min(Math.max(v3[2], 0.0), 1.0);
			return v3;
		},
	
	'SFString'	: function (value, def)
		{
			if (value === null) {value = def;}
			return value;
		},

// A-Frame data types

// value can be any CSS color (#HHH, #HHHHHH, 24-bit Integer, name)
	'Color'	: function (value, defaultString)
		{
			return defaultString;
		},
	
// Conversion methods
	'Vector3'	: function (value)
		{
			return new THREE.Vector3(value[0], value[1], value[2]);
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
			hex = hex;
			return hex;
		},

	'Color3toInt' : function (c3)
		{
			var hr = Math.round(255*c3[0]) << 16;
			var hg = Math.round(255*c3[1]) << 8;
			var hb = Math.round(255*c3[2])
			return hr + hg + hb;
		},
	
	'Rotation2Quat' : function (rot)
		{
			var quat = new THREE.Quaternion();
			if (typeof(rot) === 'object' && Array.isArray(rot.axis_angle)) {
				quat.setFromAxisAngle(rot.axis_angle[0], rot.axis_angle[1]);
			} else if (typeof(rot) === 'object' && Array.isArray(rot.vector)) {
				quat.setFromAxisAngle(new THREE.Vector3(rot.vector[0],rot.vector[1],rot.vector[2]), rot.vector[3]);
			} else if (Array.isArray(rot)) {
				quat.setFromAxisAngle(new THREE.Vector3(rot[0],rot[1],rot[2]), rot[3]);
			} else {
				quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
			}
			return quat;
		},

// Convienence data types (should deprecate)
	'Scalar'	: function (value, defaultString)
		{
			return this.SFFloat(value, defaultString);
		},

	'Color3'	: function (value, defaultString)
		{
			return this.SFColor(value, defaultString);
		},
	
};
