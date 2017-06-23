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


xseen.node.geometry_Coordinate = {
	'init'	: function (e,p) 
		{
			var vertices = [];
			for (var i=0; i<e._xseen.fields.point.length; i++) {
				vertices.push (new THREE.Vector3 (e._xseen.fields.point[i][0], e._xseen.fields.point[i][1], e._xseen.fields.point[i][2]));
			}
			p._xseen.fields.vertices = vertices;
		},
	'fin'	: function (e,p) {}
}
xseen.node.geometry_Normal = {
	'init'	: function (e,p) 
		{
			var normals = [];
			for (var i=0; i<e._xseen.fields.vector.length; i++) {
				normals.push (new THREE.Vector3 (e._xseen.fields.vector[i][0], e._xseen.fields.vector[i][1], e._xseen.fields.vector[i][2]));
			}
			p._xseen.fields.normals = normals;
		},
	'fin'	: function (e,p) {}
}
xseen.node.geometry_Color = {
	'init'	: function (e,p) 
		{
			var colors = [];
			for (var i=0; i<e._xseen.fields.color.length; i++) {
				colors.push (new THREE.Color (e._xseen.fields.color[i][0], e._xseen.fields.color[i][1], e._xseen.fields.color[i][2]));
			}
			p._xseen.fields.color = colors;
		},
	'fin'	: function (e,p) {}
}

xseen.node.geometry_TriangleSet = {
	'init'	: function (e,p) {},
// Create default index (applies to coordinates, color, normals, and textures), then call _ITS; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var indices = [];
			for (var i=0; i<e._xseen.fields.vertices.length; i++) {
				indices[i] = i;
			}
			var geometry = xseen.node.geometry__Indexed3 (	indices,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};
xseen.node.geometry_QuadSet = {
	'init'	: function (e,p) {},
// Create default index (applies to coordinates, color, normals, and textures), then call _ITS; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var indices = [];
			for (var i=0; i<e._xseen.fields.vertices.length; i++) {
				indices[i] = i;
			}
			var triangles = xseen.node.geometry__TriangulateFixed (4, indices);
			var geometry = xseen.node.geometry__Indexed3 (	indices,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};

function v3toString(v3) {
	var s = v3.x + ', ' + v3.y + ', ' + v3.z;
	return s;
}
function ctoString(c) {
	var s = c.r + ', ' + c.g + ', ' + c.b;
	return s;
}
xseen.node.geometry_IndexedTriangleSet = {
	'init'	: function (e,p) {},
// Call _ITS with indices, coordinates, color, normals, and textures; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var geometry = xseen.node.geometry__Indexed3 (	e._xseen.fields.index,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};
xseen.node.geometry_IndexedQuadSet = {
	'init'	: function (e,p) {},
// Call _ITS with indices, coordinates, color, normals, and textures; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var triangles = xseen.node.geometry__TriangulateFixed (4, e._xseen.fields.index);
			var geometry = xseen.node.geometry__Indexed3 (	triangles,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};
xseen.node.geometry_IndexedFaceSet = {
	'init'	: function (e,p) {},
// Call _ITS with indices, coordinates, color, normals, and textures; and local ccw, colorPerVertex, and solid
	'fin'	: function (e,p) 
		{
			if (!e._xseen.fields.ccw) {
				xseen.debug.logWarning ('Support for clock-wise vertex order is not supported. No geometry is created');
				return;
			}
			if (!e._xseen.fields.solid) {
				xseen.debug.logWarning ('Support for non-solid geometry is not supported. No geometry is created');
				return;
			}
			var triangles = xseen.node.geometry__TriangulateSentinel (e._xseen.fields.coordindex);
			var geometry = xseen.node.geometry__Indexed3 (	triangles,
															e._xseen.fields.vertices,
															e._xseen.fields.normals,
															e._xseen.fields.color);
			if (typeof(geometry) !== 'undefined') {
				p._xseen.geometry = geometry;
				p._xseen.materialProperty = {'vertexColors' : THREE.VertexColors};
			}
		}
};

/*
 *	Triangulate a set of indices
 *	Uses the value of -1 as a sentinel to indicate that a face definition is complete
 *
 *	Works by taking the first three indices for the first triangle. The second triangle
 *	starts at the first index, then to the last index of the previous triangle. The new 
 *	last index is the next index of the sequence. Triangulation ends when a -1 is encountered.
 *	It is an error if a face is defined with only two indices. There is no error checking.
 *
 *	Arguments:
 *		indices	- An array of numbers that represents the indices of faces.
 *
 *	Return:
 *		An array of numbers that represents the indices of the triangulated faces
 */
xseen.node.geometry__TriangulateSentinel = function(indices) {
	var first, last, mid;
	var ndx = 0;
	var triangles = [];
	while (ndx < indices.length) {
		first = indices[ndx++];
		mid = indices[ndx++];
		last = indices[ndx++];
		triangles.push(first, mid, last);
		while (ndx < indices.length && indices[ndx] != -1) {
			mid = last;
			last = indices[ndx++];
			triangles.push(first, mid, last);
		}
		if (ndx < indices.length && indices[ndx] == -1) {ndx++;}
	}
	return triangles;
};

/*
 *	Triangulate a set of indices
 *	Takes a fixed number of indices 
 *
 *	Works by taking the first three indices for the first triangle. The second triangle
 *	starts at the first index, then to the last index of the previous triangle. The new 
 *	last index is the next index of the sequence. Triangulation ends when a -1 is encountered.
 *	It is an error if a face is defined with only two indices. There is no error checking.
 *
 *	Arguments:
 *		count - An integer that is the number of indices making up a face throughout the entire 'indices' array.
 *		indices	- An array of numbers that represents the indices of faces.
 *
 *	Return:
 *		An array of numbers that represents the indices of the triangulated faces
 */
xseen.node.geometry__TriangulateFixed = function (count, indices) {
	var first, last, mid, cnt;
	var ndx = 0;
	var triangles = [];
	if (count < 3) {
		console.log ('Two few ('+count+'vertices per triangle. No triangulation performed.');
		return triangles;
	}
	if (indices.length % count != 0) {
		console.log ('Number of indices ('+indices.length+') not divisible by '+count+'. Some indices not used');
	}

	while (ndx < indices.length) {
		first = indices[ndx++];
		mid = indices[ndx++];
		last = indices[ndx++];
		cnt = 3;
		triangles.push(first, mid, last);
		while (ndx < indices.length && cnt < count) {
			mid = last;
			last = indices[ndx++];
			cnt ++;
			triangles.push(first, mid, last);
		}
	}
	return triangles;
};

/*
 *	Generalized indexed face geometry creation.
 *
 *	Arguments:
 *		indices - an array of integers >= 0 where each triple defines a triangle face. It is assumed that the 
 *					indices define the face in counter-clockwise order when looking at the face.
 *		vertices - an array of THREE.Vector3 points
 */
xseen.node.geometry__Indexed3 = function (indices, vertices, normals=[], color=[]) {
	var i, face, normal=[], faceCount=0, n;
	var useNormals	= (normals.length > 0) ? true : false;
	var useColor	= (color.length > 0) ? true : false;
	var maxIndex = Math.max.apply(null, indices);
	var minIndex = Math.min.apply(null, indices);
	if (maxIndex >= vertices.length) {
		console.log ('Maximum index ('+maxIndex+') exceeds vertex count ('+vertices.length+'). No geometry is created');
		return;
	}
	if (useNormals && maxIndex >= normals.length) {
		console.log ('Maximum index ('+maxIndex+') exceeds normal count ('+normals.length+'). No geometry is created');
		return;
	}
	if (useColor && maxIndex >= color.length) {
		console.log ('Maximum index ('+maxIndex+') exceeds color count ('+color.length+'). No geometry is created');
		return;
	}
	if (minIndex < 0) {
		console.log ('Minimum index ('+minIndex+') less than zero. No geometry is created');
		return;
	}
	if (indices.length % 3 != 0) {
		console.log ('Number of indices ('+indices.length+') not divisible by 3. No geometry is created');
		return;
	}

	var geometry = new THREE.Geometry();
	var normal_pz = new THREE.Vector3 (0, 0, 1);
	var normal_mz = new THREE.Vector3 (0, 0, -1);
	for (var i=0; i<vertices.length; i++) {
		geometry.vertices.push (vertices[i]);
	}
	for (var i=0; i<indices.length; i=i+3) {
		face = new THREE.Face3 (indices[i], indices[i+1], indices[i+2]);
		if (useNormals) {
			face.vertexNormals = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
			face.vertexNormals[0].copy(normals[indices[i]]);
			face.vertexNormals[1].copy(normals[indices[i+1]]);
			face.vertexNormals[2].copy(normals[indices[i+2]]);
			//xseen.debug.logInfo ('Face #' + (faceCount+1) + ': (' + v3toString(vertices[indices[i]]) + '); (' + v3toString(vertices[indices[i+1]]) + '); (' + v3toString(vertices[indices[i+2]]) + ')');
		}
		if (useColor) {
			face.vertexColors = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
			face.vertexColors[0].copy(color[indices[i]]);
			face.vertexColors[1].copy(color[indices[i+1]]);
			face.vertexColors[2].copy(color[indices[i+2]]);
			//xseen.debug.logInfo ('...Color: (' + ctoString(color[indices[i]]) + '); (' + ctoString(color[indices[i+1]]) + '); (' + ctoString(color[indices[i+2]]) + ')');
		}
		geometry.faces.push (face);
		faceCount++;
	}
	if (!useNormals) {
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
	}
	xseen.debug.logInfo('Created geometry with ' + faceCount + ' faces');
	geometry.colorsNeedUpdate = true;
	return geometry;
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
xseen.node.geometry3D_Sphere = {
	'init'	: function (e,p)
		{
			p._xseen.geometry = new THREE.SphereGeometry(e._xseen.fields.radius, 32, 32, 0, Math.PI*2, 0, Math.PI);
		},
	'fin'	: function (e,p) {}
};
	
xseen.node.geometry3D_Cylinder = {
	'init'	: function (e,p)
		{
			var noCaps = !(e._xseen.fields.bottom || e._xseen.fields.top);
			p._xseen.geometry = new THREE.CylinderGeometry(e._xseen.fields.radius, e._xseen.fields.radius, e._xseen.fields.height, 32, 1, noCaps, 0, Math.PI*2);
		},
	'fin'	: function (e,p) {}
};
