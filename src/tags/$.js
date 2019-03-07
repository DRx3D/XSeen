// General Tag support functions

XSeen.Tags._changeAttribute = function (e, attributeName, value) {
			//console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				e._xseen.attributes[attributeName] = value;

// Set standard reference for base object based on stored type
				var baseMaterial, baseGeometry, baseMesh, baseType='';
				if (e._xseen.tagObject.isMesh) {
					baseMaterial	= e._xseen.tagObject.material;
					baseGeometry	= e._xseen.tagObject.geometry;
					baseMesh		= e._xseen.tagObject;
					baseType		= 'mesh';
				} else if (e._xseen.tagObject.isMaterial) {
					baseMaterial	= e._xseen.tagObject;
					baseType		= 'material';
				} else if (e._xseen.tagObject.isGeometry) {
					baseGeometry	= e._xseen.tagObject;
					baseType		= 'geometry';
				} else if (e._xseen.tagObject.isGroup) {
					baseMesh		= e._xseen.tagObject;
					baseType		= 'group';
				}
					
				if (attributeName == 'color') {				// Different operation for each attribute
					baseMaterial.color.setHex(value);	// Solids are stored in a 'group' of the tagObject
					baseMaterial.needsUpdate = true;
				} else if (attributeName == 'env-map') {				// Different operation for each attribute
					//console.log ('Changing envMap to |' + value + '|');
					e._xseen.properties.envMap = XSeen.Tags.Solids._envMap(e, value);
				} else if (attributeName == 'metalness') {
					//console.log ('Setting metalness to ' + value);
					baseMaterial.metalness = value;
				} else if (attributeName == 'roughness') {
					//console.log ('Setting roughness to ' + value);
					baseMaterial.roughness = value;
				} else if (attributeName == 'position') {
					//console.log ('Setting position to ' + value);
					baseMesh.position.x = value.x;
					baseMesh.position.y = value.y;
					baseMesh.position.z = value.z;
				} else if (attributeName == 'rotation') {
					//console.log ('Setting rotation to ' + value);
					if (typeof(value.w) != 'undefinedd') {
						baseMesh.setRotationFromQuaternion (value);
					} else {
						baseMesh.rotation.x = value.x;
						baseMesh.rotation.y = value.y;
						baseMesh.rotation.z = value.z;
					}
				} else if (attributeName == 'material') {
					var ele = document.getElementById (value);
					if (typeof(ele) != 'undefined') {
						console.log ('Changing to asset material: ' + value);
						e._xseen.tagObject.material = ele._xseen.tagObject;
					} else {
						console.log ('No material asset: |'+value+'|');
					}
				} else if (attributeName == 'visible') {
					baseMesh.visible = value;
				} else {
					XSeen.LogWarn('No support for updating ' + attributeName);
				}
			} else {
				XSeen.LogWarn("Reparse of " + attributeName + " is invalid -- no change")
			}
};
