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

 // Control Node definitions

XSeen.Tags.group = {
	'init'	: function (e, p) 
		{
			var group = new THREE.Group();
			var rotation = {'x':0, 'y':0, 'z':0, 'w':0};
			//var rotation = XSeen.types.Rotation2Quat(e._XSeen.attributes.rotation);	TODO: Figure out rotations
			group.name = 'Transform children [' + e.id + ']';
			group.position.x	= e._xseen.attributes.translation[0];
			group.position.y	= e._xseen.attributes.translation[1];
			group.position.z	= e._xseen.attributes.translation[2];
			group.scale.x		= e._xseen.attributes.scale[0];
			group.scale.y		= e._xseen.attributes.scale[1];
			group.scale.z		= e._xseen.attributes.scale[2];
			group.setRotationFromQuaternion (e._xseen.attributes.rotation);
			
			var bx, by, bz, q, tx, ty, tz;
			q = group.quaternion;
			bx = new THREE.Vector3 (1, 0, 0);
			by = new THREE.Vector3 (0, 1, 0);
			bz = new THREE.Vector3 (0, 0, 1);
			bx = bx.applyQuaternion (q);
			by = by.applyQuaternion (q);
			bz = bz.applyQuaternion (q);
			
			e._xseen.properties = e._xseen.properties || [];
			e._xseen.properties['rotatex'] = Math.atan2 (bx.z, bx.y);
			e._xseen.properties['rotatey'] = Math.atan2 (by.z, by.x);
			e._xseen.properties['rotatez'] = Math.atan2 (bz.y, bz.x);
				
			e._xseen.animate['translation'] = group.position;
			e._xseen.animate['rotation'] = group.quaternion;
			e._xseen.animate['scale'] = group.scale;
			e._xseen.animate['rotatex'] = 'rotateX';
			e._xseen.animate['rotatey'] = 'rotateY';
			e._xseen.animate['rotatez'] = 'rotateZ';
			e._xseen.loadGroup = group;
			e._xseen.tagObject = e._xseen.loadGroup;
			e._xseen.update = XSeen.Tags.group.animateObject;
		},
	'fin'	: function (e, p) 
		{
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					e._xseen.loadGroup.add(child);
				});
			p._xseen.children.push(e._xseen.loadGroup);

		},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
	'setactive'	: function (ev) {},
	'animateObject'	: function (x, property, value) 
		{
			x.loadGroup[property](value);
			console.log (value);
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'group',
						'init'	: XSeen.Tags.group.init,
						'fin'	: XSeen.Tags.group.fin,
						'event'	: XSeen.Tags.group.event,
						'tick'	: XSeen.Tags.group.tick
						})
		.defineAttribute ({'name':'translation', dataType:'vec3', 'defaultValue':[0,0,0], 'isAnimatable':true})
		.defineAttribute ({'name':'scale', dataType:'vec3', 'defaultValue':[1,1,1], 'isAnimatable':true})
		.defineAttribute ({'name':'rotation', dataType:'rotation', 'defaultValue':'0 0 0', 'isAnimatable':true})
		.defineAttribute ({'name':'rotatex', dataType:'float', 'defaultValue':'0.0', 'isAnimatable':true})
		.defineAttribute ({'name':'rotatey', dataType:'float', 'defaultValue':'0.0', 'isAnimatable':true})
		.defineAttribute ({'name':'rotatez', dataType:'float', 'defaultValue':'0.0', 'isAnimatable':true})
		.addTag();
