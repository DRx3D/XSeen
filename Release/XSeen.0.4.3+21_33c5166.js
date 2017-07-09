/*
 *  XSeen V0.4.3+21_33c5166
 *  Built Sun Jul  9 15:33:32 2017
 *

Dual licensed under the MIT and GPL licenses.

==[MIT]====================================================================
Copyright (c) 2017, Daly Realism

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


==[GPL]====================================================================

XSeen - Declarative 3D for HTML

Copyright (C) 2017, Daly Realism
                                                                       
This program is free software: you can redistribute it and/or modify   
it under the terms of the GNU General Public License as published by   
the Free Software Foundation, either version 3 of the License, or      
(at your option) any later version.                                    
                                                                       
This program is distributed in the hope that it will be useful,        
but WITHOUT ANY WARRANTY; without even the implied warranty of         
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          
GNU General Public License for more details.                           
                                                                       
You should have received a copy of the GNU General Public License      
along with this program.  If not, see <http://www.gnu.org/licenses/>.


=== COPYRIGHT +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Copyright (C) 2017, Daly Realism for XSeen
Copyright, Fraunhofer for X3DOM
Copyright, Mozilla for A-Frame
Copyright, THREE and Khronos for various parts of THREE.js
Copyright (C) 2017, John Carlson for JSON->XML converter (JSONParser.js)

===  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

 */
// File: utils/ColladaLoader.js
/**
* @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
* @author Tony Parisi / http://www.tonyparisi.com/
*/

THREE.ColladaLoader = function () {

	var COLLADA = null;
	var scene = null;
	var visualScene;
	var kinematicsModel;

	var readyCallbackFunc = null;

	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};
	var lights = {};

	var animData;
	var kinematics;
	var visualScenes;
	var kinematicsModels;
	var baseUrl;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y',

		// For reflective or refractive materials we'll use this cubemap
		defaultEnvMap: null

	};

	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;

	function load ( url, readyCallback, progressCallback, failCallback ) {

		var length = 0;

		if ( document.implementation && document.implementation.createDocument ) {

			var request = new XMLHttpRequest();

			request.onreadystatechange = function() {

				if ( request.readyState === 4 ) {

					if ( request.status === 0 || request.status === 200 ) {

						if ( request.response ) {

							readyCallbackFunc = readyCallback;
							parse( request.response, undefined, url );

						} else {

							if ( failCallback ) {

								failCallback( { type: 'error', url: url } );

							} else {

								console.error( "ColladaLoader: Empty or non-existing file (" + url + ")" );

							}

						}

					}else{

						if( failCallback ){

							failCallback( { type: 'error', url: url } );

						}else{

							console.error( 'ColladaLoader: Couldn\'t load "' + url + '" (' + request.status + ')' );

						}

					}

				} else if ( request.readyState === 3 ) {

					if ( progressCallback ) {

						if ( length === 0 ) {

							length = request.getResponseHeader( "Content-Length" );

						}

						progressCallback( { total: length, loaded: request.responseText.length } );

					}

				}

			};

			request.open( "GET", url, true );
			request.send( null );

		} else {

			alert( "Don't know how to parse XML!" );

		}

	}

	function parse( text, callBack, url ) {

		COLLADA = new DOMParser().parseFromString( text, 'text/xml' );
		callBack = callBack || readyCallbackFunc;

		if ( url !== undefined ) {

			var parts = url.split( '/' );
			parts.pop();
			baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		parseAsset();
		setUpConversion();
		images = parseLib( "library_images image", _Image, "image" );
		materials = parseLib( "library_materials material", Material, "material" );
		effects = parseLib( "library_effects effect", Effect, "effect" );
		geometries = parseLib( "library_geometries geometry", Geometry, "geometry" );
		cameras = parseLib( "library_cameras camera", Camera, "camera" );
		lights = parseLib( "library_lights light", Light, "light" );
		controllers = parseLib( "library_controllers controller", Controller, "controller" );
		animations = parseLib( "library_animations animation", Animation, "animation" );
		visualScenes = parseLib( "library_visual_scenes visual_scene", VisualScene, "visual_scene" );
		kinematicsModels = parseLib( "library_kinematics_models kinematics_model", KinematicsModel, "kinematics_model" );

		morphs = [];
		skins = [];

		visualScene = parseScene();
		scene = new THREE.Group();

		for ( var i = 0; i < visualScene.nodes.length; i ++ ) {

			scene.add( createSceneGraph( visualScene.nodes[ i ] ) );

		}

		// unit conversion
		scene.scale.multiplyScalar( colladaUnit );

		createAnimations();

		kinematicsModel = parseKinematicsModel();
		createKinematics();

		var result = {

			scene: scene,
			morphs: morphs,
			skins: skins,
			animations: animData,
			kinematics: kinematics,
			dae: {
				images: images,
				materials: materials,
				cameras: cameras,
				lights: lights,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				visualScene: visualScene,
				scene: visualScene,
				kinematicsModels: kinematicsModels,
				kinematicsModel: kinematicsModel
			}

		};

		if ( callBack ) {

			callBack( result );

		}

		return result;

	}

	function setPreferredShading ( shading ) {

		preferredShading = shading;

	}

	function parseAsset () {

		var elements = COLLADA.querySelectorAll('asset');

		var element = elements[0];

		if ( element && element.childNodes ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'unit':

						var meter = child.getAttribute( 'meter' );

						if ( meter ) {

							colladaUnit = parseFloat( meter );

						}

						break;

					case 'up_axis':

						colladaUp = child.textContent.charAt(0);
						break;

				}

			}

		}

	}

	function parseLib ( q, classSpec, prefix ) {

		var elements = COLLADA.querySelectorAll(q);

		var lib = {};

		var i = 0;

		var elementsLength = elements.length;

		for ( var j = 0; j < elementsLength; j ++ ) {

			var element = elements[j];
			var daeElement = ( new classSpec() ).parse( element );

			if ( !daeElement.id || daeElement.id.length === 0 ) daeElement.id = prefix + ( i ++ );
			lib[ daeElement.id ] = daeElement;

		}

		return lib;

	}

	function parseScene() {

		var sceneElement = COLLADA.querySelectorAll('scene instance_visual_scene')[0];

		if ( sceneElement ) {

			var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
			return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

		} else {

			return null;

		}

	}

	function parseKinematicsModel() {

		var kinematicsModelElement = COLLADA.querySelectorAll('instance_kinematics_model')[0];

		if ( kinematicsModelElement ) {

			var url = kinematicsModelElement.getAttribute( 'url' ).replace(/^#/, '');
			return kinematicsModels[ url.length > 0 ? url : 'kinematics_model0' ];

		} else {

			return null;

		}

	}

	function createAnimations() {

		animData = [];

		// fill in the keys
		recurseHierarchy( scene );

	}

	function recurseHierarchy( node ) {

		var n = visualScene.getChildById( node.colladaId, true ),
			newData = null;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push(newData);

			for ( var i = 0, il = n.keys.length; i < il; i ++ ) {

				newData.length = Math.max( newData.length, n.keys[i].time );

			}

		} else {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			}

		}

		for ( var i = 0, il = node.children.length; i < il; i ++ ) {

			var d = recurseHierarchy( node.children[i] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	}

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;
		var ID;
		for ( var id in animations ) {

			var animation = animations[ id ];
			ID = ID || animation.id;
			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];

				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start:start, end:end, frames:frames,ID:ID };

	}

	function createMorph ( geometry, ctrl ) {

		var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

		if ( !morphCtrl || !morphCtrl.morph ) {

			console.log("could not find morph controller!");
			return;

		}

		var morph = morphCtrl.morph;

		for ( var i = 0; i < morph.targets.length; i ++ ) {

			var target_id = morph.targets[ i ];
			var daeGeometry = geometries[ target_id ];

			if ( !daeGeometry.mesh ||
				 !daeGeometry.mesh.primitives ||
				 !daeGeometry.mesh.primitives.length ) {
				 continue;
			}

			var target = daeGeometry.mesh.primitives[ 0 ].geometry;

			if ( target.vertices.length === geometry.vertices.length ) {

				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

			}

		}

		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

	}

	function createSkin ( geometry, ctrl, applyBindShape ) {

		var skinCtrl = controllers[ ctrl.url ];

		if ( !skinCtrl || !skinCtrl.skin ) {

			console.log( "could not find skin controller!" );
			return;

		}

		if ( !ctrl.skeleton || !ctrl.skeleton.length ) {

			console.log( "could not find the skeleton for the skin!" );
			return;

		}

		var skin = skinCtrl.skin;
		var skeleton = visualScene.getChildById( ctrl.skeleton[ 0 ] );
		var hierarchy = [];

		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
		//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/

		if ( applyBindShape ) {

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				geometry.vertices[ i ].applyMatrix4( skin.bindShapeMatrix );

			}

		}

	}

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.localworld = node.localworld || new THREE.Matrix4();
		node.world.copy( node.matrix );
		node.localworld.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );
				node.localworld.copy(m);
				if (frame === 0)
					node.matrix.copy(m);
			}

		}

		if ( parent ) {

			node.world.multiplyMatrices( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	}

	function setupSkinningMatrices ( bones, skin ) {

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = -1;

			if ( bone.type != 'JOINT' ) continue;

			for ( var j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid === skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiplyMatrices(bone.world, inv); // (IBMi * JMi)
				bone.animatrix = new THREE.Matrix4();

				bone.animatrix.copy(bone.localworld);
				bone.weights = [];

				for ( var j = 0; j < skin.weights.length; j ++ ) {

					for (var k = 0; k < skin.weights[ j ].length; k ++ ) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint === found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				console.warn( "ColladaLoader: Could not find joint '" + bone.sid + "'." );

				bone.skinningMatrix = new THREE.Matrix4();
				bone.weights = [];

			}
		}

	}

	//Walk the Collada tree and flatten the bones into a list, extract the position, quat and scale from the matrix
	function flattenSkeleton(skeleton) {

		var list = [];
		var walk = function(parentid, node, list) {

			var bone = {};
			bone.name = node.sid;
			bone.parent = parentid;
			bone.matrix = node.matrix;
			var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
			bone.matrix.decompose(data[0], data[1], data[2]);

			bone.pos = [ data[0].x,data[0].y,data[0].z ];

			bone.scl = [ data[2].x,data[2].y,data[2].z ];
			bone.rotq = [ data[1].x,data[1].y,data[1].z,data[1].w ];
			list.push(bone);

			for (var i in node.nodes) {

				walk(node.sid, node.nodes[i], list);

			}

		};

		walk(-1, skeleton, list);
		return list;

	}

	//Move the vertices into the pose that is proper for the start of the animation
	function skinToBindPose(geometry,skeleton,skinController) {

		var bones = [];
		setupSkeleton( skeleton, bones, -1 );
		setupSkinningMatrices( bones, skinController.skin );
		var v = new THREE.Vector3();
		var skinned = [];

		for (var i = 0; i < geometry.vertices.length; i ++) {

			skinned.push(new THREE.Vector3());

		}

		for ( i = 0; i < bones.length; i ++ ) {

			if ( bones[ i ].type != 'JOINT' ) continue;

			for ( var j = 0; j < bones[ i ].weights.length; j ++ ) {

				var w = bones[ i ].weights[ j ];
				var vidx = w.index;
				var weight = w.weight;

				var o = geometry.vertices[vidx];
				var s = skinned[vidx];

				v.x = o.x;
				v.y = o.y;
				v.z = o.z;

				v.applyMatrix4( bones[i].skinningMatrix );

				s.x += (v.x * weight);
				s.y += (v.y * weight);
				s.z += (v.z * weight);
			}

		}

		for (var i = 0; i < geometry.vertices.length; i ++) {

			geometry.vertices[i] = skinned[i];

		}

	}

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];

		frame = frame !== undefined ? frame : 40;

		if ( !skinController || !skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( !instanceCtrl.skeleton || !instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = visualScene.getChildById( instanceCtrl.skeleton[0], true ) || visualScene.getChildBySid( instanceCtrl.skeleton[0], true );

		//flatten the skeleton into a list of bones
		var bonelist = flattenSkeleton(skeleton);
		var joints = skinController.skin.joints;

		//sort that list so that the order reflects the order in the joint list
		var sortedbones = [];
		for (var i = 0; i < joints.length; i ++) {

			for (var j = 0; j < bonelist.length; j ++) {

				if (bonelist[j].name === joints[i]) {

					sortedbones[i] = bonelist[j];

				}

			}

		}

		//hook up the parents by index instead of name
		for (var i = 0; i < sortedbones.length; i ++) {

			for (var j = 0; j < sortedbones.length; j ++) {

				if (sortedbones[i].parent === sortedbones[j].name) {

					sortedbones[i].parent = j;

				}

			}

		}


		var i, j, w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape
		for ( i = 0; i < geometry.vertices.length; i ++ ) {
			geometry.vertices[i].applyMatrix4( skinController.skin.bindShapeMatrix );
		}

		var skinIndices = [];
		var skinWeights = [];
		var weights = skinController.skin.weights;

		// hook up the skin weights
		// TODO - this might be a good place to choose greatest 4 weights
		for ( var i =0; i < weights.length; i ++ ) {

			var indicies = new THREE.Vector4(weights[i][0] ? weights[i][0].joint : 0,weights[i][1] ? weights[i][1].joint : 0,weights[i][2] ? weights[i][2].joint : 0,weights[i][3] ? weights[i][3].joint : 0);
			var weight = new THREE.Vector4(weights[i][0] ? weights[i][0].weight : 0,weights[i][1] ? weights[i][1].weight : 0,weights[i][2] ? weights[i][2].weight : 0,weights[i][3] ? weights[i][3].weight : 0);

			skinIndices.push(indicies);
			skinWeights.push(weight);

		}

		geometry.skinIndices = skinIndices;
		geometry.skinWeights = skinWeights;
		geometry.bones = sortedbones;
		// process animation, or simply pose the rig if no animation

		//create an animation for the animated bones
		//NOTE: this has no effect when using morphtargets
		var animationdata = { "name":animationBounds.ID,"fps":30,"length":animationBounds.frames / 30,"hierarchy":[] };

		for (var j = 0; j < sortedbones.length; j ++) {

			animationdata.hierarchy.push({ parent:sortedbones[j].parent, name:sortedbones[j].name, keys:[] });

		}

		console.log( 'ColladaLoader:', animationBounds.ID + ' has ' + sortedbones.length + ' bones.' );



		skinToBindPose(geometry, skeleton, skinController);


		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];
			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			for (var i = 0; i < bones.length; i ++) {

				for (var j = 0; j < animationdata.hierarchy.length; j ++) {

					if (animationdata.hierarchy[j].name === bones[i].sid) {

						var key = {};
						key.time = (frame / 30);
						key.matrix = bones[i].animatrix;

						if (frame === 0)
							bones[i].matrix = key.matrix;

						var data = [ new THREE.Vector3(),new THREE.Quaternion(),new THREE.Vector3() ];
						key.matrix.decompose(data[0], data[1], data[2]);

						key.pos = [ data[0].x,data[0].y,data[0].z ];

						key.scl = [ data[2].x,data[2].y,data[2].z ];
						key.rot = data[1];

						animationdata.hierarchy[j].keys.push(key);

					}

				}

			}

			geometry.animation = animationdata;

		}

	}

	function createKinematics() {

		if ( kinematicsModel && kinematicsModel.joints.length === 0 ) {
			kinematics = undefined;
			return;
		}

		var jointMap = {};

		var _addToMap = function( jointIndex, parentVisualElement ) {

			var parentVisualElementId = parentVisualElement.getAttribute( 'id' );
			var colladaNode = visualScene.getChildById( parentVisualElementId, true );
			var joint = kinematicsModel.joints[ jointIndex ];

			scene.traverse(function( node ) {

				if ( node.colladaId == parentVisualElementId ) {

					jointMap[ jointIndex ] = {
						node: node,
						transforms: colladaNode.transforms,
						joint: joint,
						position: joint.zeroPosition
					};

				}

			});

		};

		kinematics = {

			joints: kinematicsModel && kinematicsModel.joints,

			getJointValue: function( jointIndex ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					return jointData.position;

				} else {

					console.log( 'getJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			},

			setJointValue: function( jointIndex, value ) {

				var jointData = jointMap[ jointIndex ];

				if ( jointData ) {

					var joint = jointData.joint;

					if ( value > joint.limits.max || value < joint.limits.min ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ')' );

					} else if ( joint.static ) {

						console.log( 'setJointValue: joint ' + jointIndex + ' is static' );

					} else {

						var threejsNode = jointData.node;
						var axis = joint.axis;
						var transforms = jointData.transforms;

						var matrix = new THREE.Matrix4();
						var m1 = new THREE.Matrix4();

						for (i = 0; i < transforms.length; i ++ ) {

							var transform = transforms[ i ];

							// kinda ghetto joint detection

							if ( transform.sid && transform.sid.indexOf( 'joint' + jointIndex ) !== -1 ) {

								// apply actual joint value here
								switch ( joint.type ) {

									case 'revolute':

										matrix.multiply( m1.makeRotationAxis( axis, THREE.Math.degToRad(value) ) );
										break;

									case 'prismatic':

										matrix.multiply( m1.makeTranslation(axis.x * value, axis.y * value, axis.z * value ) );
										break;

									default:

										console.warn( 'setJointValue: unknown joint type: ' + joint.type );
										break;

								}

							} else {

								switch ( transform.type ) {

									case 'matrix':

										matrix.multiply( transform.obj );

										break;

									case 'translate':

										matrix.multiply( m1.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );

										break;

									case 'rotate':

										matrix.multiply( m1.makeRotationAxis( transform.obj, transform.angle ) );

										break;

								}
							}
						}

						// apply the matrix to the threejs node
						var elementsFloat32Arr = matrix.elements;
						var elements = Array.prototype.slice.call( elementsFloat32Arr );

						var elementsRowMajor = [
							elements[ 0 ],
							elements[ 4 ],
							elements[ 8 ],
							elements[ 12 ],
							elements[ 1 ],
							elements[ 5 ],
							elements[ 9 ],
							elements[ 13 ],
							elements[ 2 ],
							elements[ 6 ],
							elements[ 10 ],
							elements[ 14 ],
							elements[ 3 ],
							elements[ 7 ],
							elements[ 11 ],
							elements[ 15 ]
						];

						threejsNode.matrix.set.apply( threejsNode.matrix, elementsRowMajor );
						threejsNode.matrix.decompose( threejsNode.position, threejsNode.quaternion, threejsNode.scale );

						jointMap[ jointIndex ].position = value;

					}

				} else {

					console.log( 'setJointValue: joint ' + jointIndex + ' doesn\'t exist' );

				}

			}

		};

		var element = COLLADA.querySelector('scene instance_kinematics_scene');

		if ( element ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				if ( child.nodeType != 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_joint_axis':

						var visualTarget = child.getAttribute( 'target' ).split( '/' ).pop();
						var axis = child.querySelector('axis param').textContent;
						var jointIndex = parseInt( axis.split( 'joint' ).pop().split( '.' )[0] );
						var visualTargetElement = COLLADA.querySelector( '[sid="' + visualTarget + '"]' );

						if ( visualTargetElement ) {
							var parentVisualElement = visualTargetElement.parentElement;
							_addToMap(jointIndex, parentVisualElement);
						}

						break;

					default:

						break;

				}

			}
		}

	}

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
					//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							var inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

				default:
					break;

			}

		}

		// geometries

		var double_sided_materials = {};

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[ instance_geometry.url ];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( !geometry.mesh || !geometry.mesh.primitives )
					continue;

				if ( obj.name.length === 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;
						var material3js = shader.material;

						if ( geometry.doubleSided ) {

							if ( !( instance_material.symbol in double_sided_materials ) ) {

								var _copied_material = material3js.clone();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials[ instance_material.symbol ] = _copied_material;

							}

							material3js = double_sided_materials[ instance_material.symbol ];

						}

						material3js.opacity = !material3js.opacity ? 1 : material3js.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( material3js );
						first_material = material3js;
						first_material.name = mat.name === null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, side: geometry.doubleSided ? THREE.DoubleSide : THREE.FrontSide } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MultiMaterial( used_materials_array );

					for ( j = 0; j < geom.faces.length; j ++ ) {

						var face = geom.faces[ j ];
						face.materialIndex = used_materials[ face.daeMaterial ]

					}

				}

				if ( skinController !== undefined ) {


					applySkin( geom, skinController );

					if ( geom.morphTargets.length > 0 ) {

						material.morphTargets = true;
						material.skinning = false;

					} else {

						material.morphTargets = false;
						material.skinning = true;

					}


					mesh = new THREE.SkinnedMesh( geom, material, false );


					//mesh.skeleton = skinController.skeleton;
					//mesh.skinController = controllers[ skinController.url ];
					//mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;



					//mesh.animationHandle.setKey(0);
					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					if ( geom.isLineStrip === true ) {

						mesh = new THREE.Line( geom );

					} else {

						mesh = new THREE.Mesh( geom, material );

					}

				}

				obj.add(mesh);

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[i];
			var cparams = cameras[instance_camera.url];

			var cam = new THREE.PerspectiveCamera(cparams.yfov, parseFloat(cparams.aspect_ratio),
					parseFloat(cparams.znear), parseFloat(cparams.zfar));

			obj.add(cam);
		}

		for ( i = 0; i < node.lights.length; i ++ ) {

			var light = null;
			var instance_light = node.lights[i];
			var lparams = lights[instance_light.url];

			if ( lparams && lparams.technique ) {

				var color = lparams.color.getHex();
				var intensity = lparams.intensity;
				var distance = lparams.distance;
				var angle = lparams.falloff_angle;

				switch ( lparams.technique ) {

					case 'directional':

						light = new THREE.DirectionalLight( color, intensity, distance );
						light.position.set(0, 0, 1);
						break;

					case 'point':

						light = new THREE.PointLight( color, intensity, distance );
						break;

					case 'spot':

						light = new THREE.SpotLight( color, intensity, distance, angle );
						light.position.set(0, 0, 1);
						break;

					case 'ambient':

						light = new THREE.AmbientLight( color );
						break;

				}

			}

			if (light) {
				obj.add(light);
			}
		}

		obj.name = node.name || node.id || "";
		obj.colladaId = node.id || "";
		obj.layer = node.layer || "";
		obj.matrix = node.matrix;
		obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

		if ( options.centerGeometry && obj.geometry ) {

			var delta = obj.geometry.center();
			delta.multiply( obj.scale );
			delta.applyQuaternion( obj.quaternion );

			obj.position.sub( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[i], node ) );

		}

		return obj;

	}

	function getJointId( skin, id ) {

		for ( var i = 0; i < skin.joints.length; i ++ ) {

			if ( skin.joints[ i ] === id ) {

				return i;

			}

		}

	}

	function getLibraryNode( id ) {

		var nodes = COLLADA.querySelectorAll('library_nodes node');

		for ( var i = 0; i < nodes.length; i++ ) {

			var attObj = nodes[i].attributes.getNamedItem('id');

			if ( attObj && attObj.value === id ) {

				return nodes[i];

			}

		}

		return undefined;

	}

	function getChannelsForNode ( node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		for ( var id in animations ) {

			var animation = animations[id];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var id = channel.target.split('/')[0];

				if ( id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	}

	function calcFrameDuration( node ) {

		var minT = 10000000;

		for ( var i = 0; i < node.channels.length; i ++ ) {

			var sampler = node.channels[i].sampler;

			for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

				var t0 = sampler.input[ j ];
				var t1 = sampler.input[ j + 1 ];
				minT = Math.min( minT, t1 - t0 );

			}
		}

		return minT;

	}

	function calcMatrixAt( node, t ) {

		var animated = {};

		var i, j;

		for ( i = 0; i < node.channels.length; i ++ ) {

			var channel = node.channels[ i ];
			animated[ channel.sid ] = channel;

		}

		var matrix = new THREE.Matrix4();

		for ( i = 0; i < node.transforms.length; i ++ ) {

			var transform = node.transforms[ i ];
			var channel = animated[ transform.sid ];

			if ( channel !== undefined ) {

				var sampler = channel.sampler;
				var value;

				for ( j = 0; j < sampler.input.length - 1; j ++ ) {

					if ( sampler.input[ j + 1 ] > t ) {

						value = sampler.output[ j ];
						//console.log(value.flatten)
						break;

					}

				}

				if ( value !== undefined ) {

					if ( value instanceof THREE.Matrix4 ) {

						matrix.multiplyMatrices( matrix, value );

					} else {

						// FIXME: handle other types

						matrix.multiplyMatrices( matrix, transform.matrix );

					}

				} else {

					matrix.multiplyMatrices( matrix, transform.matrix );

				}

			} else {

				matrix.multiplyMatrices( matrix, transform.matrix );

			}

		}

		return matrix;

	}

	function bakeAnimations ( node ) {

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( var i = 0, il = node.channels.length; i < il; i ++ ) {

				var channel = node.channels[i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( var j = 0, jl = channel.arrIndices.length; j < jl; j ++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === -1 ) {

						sids.push( fullSid );

					}

					for ( var j = 0, jl = input.length; j < jl; j ++ ) {

						var time = input[j],
							data = sampler.getData( transform.type, j, member ),
							key = findKey( keys, time );

						if ( !key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx === -1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( var i = 0; i < sids.length; i ++ ) {

				var sid = sids[ i ];

				for ( var j = 0; j < keys.length; j ++ ) {

					var key = keys[ j ];

					if ( !key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	}

	function findKey ( keys, time) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal === null; i ++ ) {

			var key = keys[i];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	}

	function findTimeNdx ( keys, time) {

		var ndx = -1;

		for ( var i = 0, il = keys.length; i < il && ndx === -1; i ++ ) {

			var key = keys[i];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	}

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx - 1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx + 1 );

		if ( prevKey && nextKey ) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++ i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	}

	// Get next key with given sid

	function getNextKeyWith( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx ++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	// Get previous key with given sid

	function getPrevKeyWith( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx -- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	}

	function _Image() {

		this.id = "";
		this.init_from = "";

	}

	_Image.prototype.parse = function(element) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	}

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;

				default:
					break;

			}
		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	}

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					var source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			var source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}
		}

		return this;

	};

	Morph.prototype.parseInputs = function(element) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( (new Input()).parse(child) );
					break;

				default:
					break;
			}
		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	}

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats(child.textContent);
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse(child);
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}
		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic === 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic === 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( var i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[i];
			var vertex_weights = [];

			for ( var j = 0; j < numBones; j ++ ) {

				var influence = {};

				for ( var k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;
			}

			for ( var j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Group();

	}

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	}

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split("(");
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid === transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id === id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid === sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid === sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');
		this.layer = element.getAttribute('layer');

		this.type = this.type === 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.lights = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					this.lights.push( ( new InstanceLight() ).parse( child ) );
					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode )) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	}

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = THREE.Math.degToRad( this.data[3] );

			case 'translate':

				fixCoords( this.data, -1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function () {

		var m1 = new THREE.Matrix4();

		return function ( matrix ) {

			switch ( this.type ) {

				case 'matrix':

					matrix.multiply( this.obj );

					break;

				case 'translate':

					matrix.multiply( m1.makeTranslation( this.obj.x, this.obj.y, this.obj.z ) );

					break;

				case 'rotate':

					matrix.multiply( m1.makeRotationAxis( this.obj, this.angle ) );

					break;

				case 'scale':

					matrix.scale( this.obj );

					break;

			}

		};

	}();

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;

				} else {

					console.log('Incorrect addressing of matrix in transform.');

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	}

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace(/^#/, '') );
					break;

				case 'bind_material':

					var instances = child.querySelectorAll('instance_material');

					for ( var j = 0; j < instances.length; j ++ ) {

						var instance = instances[j];
						this.instance_material.push( (new InstanceMaterial()).parse(instance) );

					}


					break;

				case 'extra':
					break;

				default:
					break;

			}
		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	}

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	}

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName === 'bind_material' ) {

				var instances = child.querySelectorAll('instance_material');

				for ( var j = 0; j < instances.length; j ++ ) {

					var instance = instances[j];
					this.instance_material.push( (new InstanceMaterial()).parse(instance) );

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	}

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		extractDoubleSided( this, element );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = (new Mesh(this)).parse(child);
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}
		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	}

	Mesh.prototype.parse = function ( element ) {

		this.primitives = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'linestrips':

					this.primitives.push( ( new LineStrips().parse( child ) ) );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		if ( this.vertices === null ) {

			// TODO (mrdoob): Study case when this is null (carrier.dae)

			return this;

		}

		var vertexData = sources[ this.vertices.input['POSITION'].source ].data;

		for ( var i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( var i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		if ( this.geometry3js.calcNormals ) {

			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;

		}

		return this;

	};

	Mesh.prototype.handlePrimitive = function ( primitive, geom ) {

		if ( primitive instanceof LineStrips ) {

			// TODO: Handle indices. Maybe easier with BufferGeometry?

			geom.isLineStrip = true;
			return;

		}

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];

			var offset = input.offset + 1;
			maxOffset = (maxOffset < offset) ? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++ pCount ) {

			var p = pList[ pCount ], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = null;
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								ts = ts || { };
								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:

								break;

						}

					}

				}

				if ( ns.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					} else {

						geom.calcNormals = true;

					}

				}

				if ( !ts ) {

					ts = { };
					// check the vertices inputs
					input = this.vertices.input.TEXCOORD;

					if ( input ) {

						texture_sets.push( input.set );
						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							if ( ts[ input.set ] === undefined ) ts[ input.set ] = [ ];
							// invert the V
							ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

						}

					}

				}

				if ( cs.length === 0 ) {

					// check the vertices inputs
					input = this.vertices.input.COLOR;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx ++ ) {

							idx32 = vs[ ndx ] * numParams;
							cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[2], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[3], ns.length ? [ ns[0].clone(), ns[1].clone(), ns[3].clone() ] : [], cs.length ? [ cs[0], cs[1], cs[3] ] : new THREE.Color() ) );

					faces.push( new THREE.Face3( vs[1], vs[2], vs[3], ns.length ? [ ns[1].clone(), ns[2].clone(), ns[3].clone() ] : [], cs.length ? [ cs[1], cs[2], cs[3] ] : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s

					for ( k = 1; k < vcount - 1; ) {

						faces.push( new THREE.Face3( vs[0], vs[k], vs[k + 1], ns.length ? [ ns[0].clone(), ns[k ++].clone(), ns[k].clone() ] : [], clr ) );

					}

				}

				if ( faces.length ) {

					for ( var ndx = 0, len = faces.length; ndx < len; ndx ++ ) {

						face = faces[ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k ++ ) {

							uv = ts[ texture_sets[k] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[0], uv[ndx + 1], uv[ndx + 2] ];

							} else if ( vcount === 4 ) {

								if ( ndx === 0 ) {

									uvArr = [ uv[0], uv[1], uv[3] ];

								} else {

									uvArr = [ uv[1].clone(), uv[2], uv[3].clone() ];

								}

							} else {

								uvArr = [ uv[0], uv[1], uv[2] ];

							}

							if ( geom.faceVertexUvs[k] === undefined ) {

								geom.faceVertexUvs[k] = [];

							}

							geom.faceVertexUvs[k].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}

		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	}

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source === vertices.id ) {

				this.inputs[ i ].source = vertices.input[ 'POSITION' ].source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	}

	Polylist.prototype = Object.create( Polygons.prototype );
	Polylist.prototype.constructor = Polylist;

	function LineStrips() {

		Polygons.call( this );

		this.vcount = 1;

	}

	LineStrips.prototype = Object.create( Polygons.prototype );
	LineStrips.prototype.constructor = LineStrips;

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	}

	Triangles.prototype = Object.create( Polygons.prototype );
	Triangles.prototype.constructor = Triangles;

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	}

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName === 'param' ) {

				var param = {};
				param[ 'name' ] = child.getAttribute( 'name' );
				param[ 'type' ] = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	}

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[i].nodeName === 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	}

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);

		if ( this.semantic === 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	}

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName === 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}
					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

		var param = this.accessor.params[ 0 ];

			//console.log(param.name + " " + param.type);

		switch ( param.type ) {

			case 'IDREF':
			case 'Name': case 'name':
			case 'float':

				return this.data;

			case 'float4x4':

				for ( var j = 0; j < this.data.length; j += 16 ) {

					var s = this.data.slice( j, j + 16 );
					var m = getConvertedMat4( s );
					result.push( m );
				}

				break;

			default:

				console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
				break;

		}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	}

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color();
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	}

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture === null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture != null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		if (element.nodeName === 'transparent') {

			this.opaque = element.getAttribute('opaque');

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color();
					this.color.setRGB( rgba[0], rgba[1], rgba[2] );
					this.color.a = rgba[3];
					break;

				case 'texture':

					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[1] && element.childNodes[1].nodeName === 'extra' ) {

			element = element.childNodes[1];

			if ( element.childNodes[1] && element.childNodes[1].nodeName === 'technique' ) {

				element = element.childNodes[1];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );

					break;

				case 'wrapU':
				case 'wrapV':

					// some dae have a value of true which becomes NaN via parseInt

					if ( child.textContent.toUpperCase() === 'TRUE' ) {

						this.texOpts[ child.nodeName ] = 1;

					} else {

						this.texOpts[ child.nodeName ] = parseInt( child.textContent );

					}
					break;

				default:

					this.texOpts[ child.nodeName ] = child.textContent;

					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	}

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'bump':

					// If 'bumptype' is 'heightfield', create a 'bump' property
					// Else if 'bumptype' is 'normalmap', create a 'normal' property
					// (Default to 'bump')
					var bumpType = child.getAttribute( 'bumptype' );
					if ( bumpType ) {
						if ( bumpType.toLowerCase() === "heightfield" ) {
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
						} else if ( bumpType.toLowerCase() === "normalmap" ) {
							this[ 'normal' ] = ( new ColorOrTexture() ).parse( child );
						} else {
							console.error( "Shader.prototype.parse: Invalid value for attribute 'bumptype' (" + bumpType + ") - valid bumptypes are 'HEIGHTFIELD' and 'NORMALMAP' - defaulting to 'HEIGHTFIELD'" );
							this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
						}
					} else {
						console.warn( "Shader.prototype.parse: Attribute 'bumptype' missing from bump node - defaulting to 'HEIGHTFIELD'" );
						this[ 'bump' ] = ( new ColorOrTexture() ).parse( child );
					}

					break;

				case 'shininess':
				case 'reflectivity':
				case 'index_of_refraction':
				case 'transparency':

					var f = child.querySelectorAll('float');

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};

		var transparent = false;

		if (this['transparency'] !== undefined && this['transparent'] !== undefined) {
			// convert transparent color RBG to average value
			var transparentColor = this['transparent'];
			var transparencyLevel = (this.transparent.color.r + this.transparent.color.g + this.transparent.color.b) / 3 * this.transparency;

			if (transparencyLevel > 0) {
				transparent = true;
				props[ 'transparent' ] = true;
				props[ 'opacity' ] = 1 - transparencyLevel;

			}

		}

		var keys = {
			'diffuse':'map',
			'ambient':'lightMap',
			'specular':'specularMap',
			'emission':'emissionMap',
			'bump':'bumpMap',
			'normal':'normalMap'
			};

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'bump':
				case 'normal':

					var cot = this[ prop ];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							var samplerId = cot.texture;
							var sampler = this.effect.sampler[samplerId];

							if ( sampler !== undefined && sampler.source !== undefined ) {

								var surface = this.effect.surface[sampler.source];

								if ( surface !== undefined ) {

									var image = images[ surface.init_from ];

									if ( image ) {

										var url = baseUrl + image.init_from;

										var texture;
										var loader = THREE.Loader.Handlers.get( url );

										if ( loader !== null ) {

											texture = loader.load( url );

										} else {

											texture = new THREE.Texture();

											loadTextureImage( texture, url );

										}

										if ( sampler.wrap_s === "MIRROR" ) {

											texture.wrapS = THREE.MirroredRepeatWrapping;

										} else if ( sampler.wrap_s === "WRAP" || cot.texOpts.wrapU ) {

											texture.wrapS = THREE.RepeatWrapping;

										} else {

											texture.wrapS = THREE.ClampToEdgeWrapping;

										}

										if ( sampler.wrap_t === "MIRROR" ) {

											texture.wrapT = THREE.MirroredRepeatWrapping;

										} else if ( sampler.wrap_t === "WRAP" || cot.texOpts.wrapV ) {

											texture.wrapT = THREE.RepeatWrapping;

										} else {

											texture.wrapT = THREE.ClampToEdgeWrapping;

										}

										texture.offset.x = cot.texOpts.offsetU;
										texture.offset.y = cot.texOpts.offsetV;
										texture.repeat.x = cot.texOpts.repeatU;
										texture.repeat.y = cot.texOpts.repeatV;
										props[keys[prop]] = texture;

										// Texture with baked lighting?
										if (prop === 'emission') props['emissive'] = 0xffffff;

									}

								}

							}

						} else if ( prop === 'diffuse' || !transparent ) {

							if ( prop === 'emission' ) {

								props[ 'emissive' ] = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':

					props[ prop ] = this[ prop ];
					break;

				case 'reflectivity':

					props[ prop ] = this[ prop ];
					if ( props[ prop ] > 0.0 ) props['envMap'] = options.defaultEnvMap;
					props['combine'] = THREE.MixOperation;	//mix regular shading with reflective component
					break;

				case 'index_of_refraction':

					props[ 'refractionRatio' ] = this[ prop ]; //TODO: "index_of_refraction" becomes "refractionRatio" in shader, but I'm not sure if the two are actually comparable
					if ( this[ prop ] !== 1.0 ) props['envMap'] = options.defaultEnvMap;
					break;

				case 'transparency':
					// gets figured out up top
					break;

				default:
					break;

			}

		}

		props[ 'shading' ] = preferredShading;
		props[ 'side' ] = this.effect.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

		if ( props.diffuse !== undefined ) {

			props.color = props.diffuse;
			delete props.diffuse;

		}

		switch ( this.type ) {

			case 'constant':

				if (props.emissive != undefined) props.color = props.emissive;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				this.material = new THREE.MeshPhongMaterial( props );
				break;

			case 'lambert':
			default:

				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	}

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	}

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = {};
		this.sampler = {};

	}

	Effect.prototype.create = function () {

		if ( this.shader === null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		extractDoubleSided( this, element );

		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface[sid] = ( new Surface( this ) ).parse( child );
					break;

				case 'sampler2D':

					this.sampler[sid] = ( new Sampler2D( this ) ).parse( child );
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;
				case 'extra':
					this.parseExtra(child);
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtra = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique':
					this.parseExtraTechnique( child );
					break;
				default:
					break;

			}

		}

	};

	Effect.prototype.parseExtraTechnique = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bump':
					this.shader.parse( element );
					break;
				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	}

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	}

	Animation.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( var src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					var src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	}

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf(".") >= 0 );
		var arrSyntax = ( sid.indexOf("(") >= 0 );

		if ( dotSyntax ) {

			parts = sid.split(".");
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split("(");
			this.sid = arrIndices.shift();

			for (var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[j] = parseInt( arrIndices[j].replace(/\)/, '') );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	}

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( (new Input()).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log(input.semantic);
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 100000000;
			this.endTime = -100000000;

			for ( var i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx, member ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++ i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, -1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, -1 );

			}

		} else {

			data = this.output[ ndx ];

			if ( member && type === 'translate' ) {
				data = getConvertedTranslation( member, data );
			}

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	}

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			var target = this.targets[ i ];

			if ( !opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++ i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0, l = this.targets.length; i < l; i ++ ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				if ( scale < 0 ) scale = 0;
				if ( scale > 1 ) scale = 1;

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++ j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	// Camera
	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName === 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( var j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique === 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( var k = 0; k < perspective.childNodes.length; k ++ ) {

							var param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique === 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( var k = 0; k < orthographic.childNodes.length; k ++ ) {

							var param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}

			}

		}

		return this;

	};

	function InstanceCamera() {

		this.url = "";

	}

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	// Light

	function Light() {

		this.id = "";
		this.name = "";
		this.technique = "";

	}

	Light.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon( child );
					break;

				case 'technique':

					this.parseTechnique( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Light.prototype.parseCommon = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			switch ( element.childNodes[ i ].nodeName ) {

				case 'directional':
				case 'point':
				case 'spot':
				case 'ambient':

					this.technique = element.childNodes[ i ].nodeName;

					var light = element.childNodes[ i ];

					for ( var j = 0; j < light.childNodes.length; j ++ ) {

						var child = light.childNodes[j];

						switch ( child.nodeName ) {

							case 'color':

								var rgba = _floats( child.textContent );
								this.color = new THREE.Color(0);
								this.color.setRGB( rgba[0], rgba[1], rgba[2] );
								this.color.a = rgba[3];
								break;

							case 'falloff_angle':

								this.falloff_angle = parseFloat( child.textContent );
								break;

							case 'quadratic_attenuation':
								var f = parseFloat( child.textContent );
								this.distance = f ? Math.sqrt( 1 / f ) : 0;
						}

					}

			}

		}

		return this;

	};

	Light.prototype.parseTechnique = function ( element ) {

		this.profile = element.getAttribute( 'profile' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'intensity':

					this.intensity = parseFloat(child.textContent);
					break;

			}

		}

		return this;

	};

	function InstanceLight() {

		this.url = "";

	}

	InstanceLight.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	function KinematicsModel( ) {

		this.id = '';
		this.name = '';
		this.joints = [];
		this.links = [];

	}

	KinematicsModel.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.joints = [];
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'technique_common':

					this.parseCommon(child);
					break;

				default:
					break;

			}

		}

		return this;

	};

	KinematicsModel.prototype.parseCommon = function( element ) {

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( element.childNodes[ i ].nodeName ) {

				case 'joint':
					this.joints.push( (new Joint()).parse(child) );
					break;

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Joint( ) {

		this.sid = '';
		this.name = '';
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

	}

	Joint.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.axis = new THREE.Vector3();
		this.limits = {
			min: 0,
			max: 0
		};
		this.type = '';
		this.static = false;
		this.zeroPosition = 0.0;
		this.middlePosition = 0.0;

		var axisElement = element.querySelector('axis');
		var _axis = _floats(axisElement.textContent);
		this.axis = getConvertedVec3(_axis, 0);

		var min = element.querySelector('limits min') ? parseFloat(element.querySelector('limits min').textContent) : -360;
		var max = element.querySelector('limits max') ? parseFloat(element.querySelector('limits max').textContent) : 360;

		this.limits = {
			min: min,
			max: max
		};

		var jointTypes = [ 'prismatic', 'revolute' ];
		for (var i = 0; i < jointTypes.length; i ++ ) {

			var type = jointTypes[ i ];

			var jointElement = element.querySelector(type);

			if ( jointElement ) {

				this.type = type;

			}

		}

		// if the min is equal to or somehow greater than the max, consider the joint static
		if ( this.limits.min >= this.limits.max ) {

			this.static = true;

		}

		this.middlePosition = (this.limits.min + this.limits.max) / 2.0;
		return this;

	};

	function Link( ) {

		this.sid = '';
		this.name = '';
		this.transforms = [];
		this.attachments = [];

	}

	Link.prototype.parse = function( element ) {

		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.transforms = [];
		this.attachments = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'attachment_full':
					this.attachments.push( (new Attachment()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function Attachment( ) {

		this.joint = '';
		this.transforms = [];
		this.links = [];

	}

	Attachment.prototype.parse = function( element ) {

		this.joint = element.getAttribute('joint').split('/').pop();
		this.links = [];

		for (var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'link':
					this.links.push( (new Link()).parse(child) );
					break;

				case 'rotate':
				case 'translate':
				case 'matrix':

					this.transforms.push( (new Transform()).parse(child) );
					break;

				default:

					break;

			}

		}

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] != undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source(id )).parse( element );
		return sources[ id ];

	}

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix === "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	}

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( (raw[i] === 'true' || raw[i] === '1') ? true : false );

		}

		return data;

	}

	function _floats( str ) {

		var raw = _strings(str);
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	}

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	}

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	}

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	}

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	}

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10) ;

		} else {

			return defaultValue;

		}

	}

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	}

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while ( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	}

	function loadTextureImage ( texture, url ) {

		var loader = new THREE.ImageLoader();

		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

		} );

	}

	function extractDoubleSided( obj, element ) {

		obj.doubleSided = false;

		var node = element.querySelectorAll('extra double_sided')[0];

		if ( node ) {

			if ( node && parseInt( node.textContent, 10 ) === 1 ) {

				obj.doubleSided = true;

			}

		}

	}

	// Up axis conversion

	function setUpConversion() {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			upConversion = null;

		} else {

			switch ( colladaUp ) {

				case 'X':

					upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
					break;

				case 'Y':

					upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
					break;

				case 'Z':

					upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
					break;

			}

		}

	}

	function fixCoords( data, sign ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				var tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				var tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				var tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				var tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	}

	function getConvertedTranslation( axis, data ) {

		if ( options.convertUpAxis !== true || colladaUp === options.upAxis ) {

			return data;

		}

		switch ( axis ) {
			case 'X':
				data = upConversion === 'XtoY' ? data * -1 : data;
				break;
			case 'Y':
				data = upConversion === 'YtoZ' || upConversion === 'YtoX' ? data * -1 : data;
				break;
			case 'Z':
				data = upConversion === 'ZtoY' ? data * -1 : data ;
				break;
			default:
				break;
		}

		return data;
	}

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, -1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	}

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, -1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, -1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, -1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4().set(
			data[0], data[1], data[2], data[3],
			data[4], data[5], data[6], data[7],
			data[8], data[9], data[10], data[11],
			data[12], data[13], data[14], data[15]
			);

	}

	function getConvertedIndex( index ) {

		if ( index > -1 && index < 3 ) {

			var members = [ 'X', 'Y', 'Z' ],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;

	}

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	}

	return {

		load: load,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometries : geometries,
		options: options

	};

};
// File: utils/GLTF2Loader.js
/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 * @author Takahiro / https://github.com/takahirox
 * @author Don McCurdy / https://www.donmccurdy.com
 */

THREE.GLTF2Loader = ( function () {

	function GLTF2Loader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

	GLTF2Loader.prototype = {

		constructor: GLTF2Loader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			var path = this.path && ( typeof this.path === "string" ) ? this.path : THREE.Loader.prototype.extractUrlBase( url );

			var loader = new THREE.FileLoader( scope.manager );

			loader.setResponseType( 'arraybuffer' );

			loader.load( url, function ( data ) {

				scope.parse( data, onLoad, path );

			}, onProgress, onError );

		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;

		},

		setPath: function ( value ) {

			this.path = value;

		},

		parse: function ( data, callback, path ) {

			var content;
			var extensions = {};

			var magic = convertUint8ArrayToString( new Uint8Array( data, 0, 4 ) );

			if ( magic === BINARY_EXTENSION_HEADER_MAGIC ) {

				extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );
				content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;

			} else {

				content = convertUint8ArrayToString( new Uint8Array( data ) );

			}

			var json = JSON.parse( content );

			if ( json.extensionsUsed && json.extensionsUsed.indexOf( EXTENSIONS.KHR_MATERIALS_COMMON ) >= 0 ) {

				extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] = new GLTFMaterialsCommonExtension( json );

			}

			console.time( 'GLTF2Loader' );

			var parser = new GLTFParser( json, extensions, {

				path: path || this.path,
				crossOrigin: this.crossOrigin

			} );

			parser.parse( function ( scene, scenes, cameras, animations ) {

				console.timeEnd( 'GLTF2Loader' );

				var glTF = {
					"scene": scene,
					"scenes": scenes,
					"cameras": cameras,
					"animations": animations
				};

				callback( glTF );

			} );

		}

	};

	/* GLTFREGISTRY */

	function GLTFRegistry() {

		var objects = {};

		return	{

			get: function ( key ) {

				return objects[ key ];

			},

			add: function ( key, object ) {

				objects[ key ] = object;

			},

			remove: function ( key ) {

				delete objects[ key ];

			},

			removeAll: function () {

				objects = {};

			},

			update: function ( scene, camera ) {

				for ( var name in objects ) {

					var object = objects[ name ];

					if ( object.update ) {

						object.update( scene, camera );

					}

				}

			}

		};

	}

	/* GLTFSHADER */

	function GLTFShader( targetNode, allNodes ) {

		var boundUniforms = {};

		// bind each uniform to its source node

		var uniforms = targetNode.material.uniforms;

		for ( var uniformId in uniforms ) {

			var uniform = uniforms[ uniformId ];

			if ( uniform.semantic ) {

				var sourceNodeRef = uniform.node;

				var sourceNode = targetNode;

				if ( sourceNodeRef ) {

					sourceNode = allNodes[ sourceNodeRef ];

				}

				boundUniforms[ uniformId ] = {
					semantic: uniform.semantic,
					sourceNode: sourceNode,
					targetNode: targetNode,
					uniform: uniform
				};

			}

		}

		this.boundUniforms = boundUniforms;
		this._m4 = new THREE.Matrix4();

	}

	// Update - update all the uniform values
	GLTFShader.prototype.update = function ( scene, camera ) {

		var boundUniforms = this.boundUniforms;

		for ( var name in boundUniforms ) {

			var boundUniform = boundUniforms[ name ];

			switch ( boundUniform.semantic ) {

				case "MODELVIEW":

					var m4 = boundUniform.uniform.value;
					m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					break;

				case "MODELVIEWINVERSETRANSPOSE":

					var m3 = boundUniform.uniform.value;
					this._m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					m3.getNormalMatrix( this._m4 );
					break;

				case "PROJECTION":

					var m4 = boundUniform.uniform.value;
					m4.copy( camera.projectionMatrix );
					break;

				case "JOINTMATRIX":

					var m4v = boundUniform.uniform.value;

					for ( var mi = 0; mi < m4v.length; mi ++ ) {

						// So it goes like this:
						// SkinnedMesh world matrix is already baked into MODELVIEW;
						// transform joints to local space,
						// then transform using joint's inverse
						m4v[ mi ]
							.getInverse( boundUniform.sourceNode.matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.bones[ mi ].matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.boneInverses[ mi ] )
							.multiply( boundUniform.targetNode.bindMatrix );

					}

					break;

				default :

					console.warn( "Unhandled shader semantic: " + boundUniform.semantic );
					break;

			}

		}

	};

	/*********************************/
	/********** EXTENSIONS ***********/
	/*********************************/

	var EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF',
		KHR_MATERIALS_COMMON: 'KHR_materials_common'
	};

	/* MATERIALS COMMON EXTENSION */

	function GLTFMaterialsCommonExtension( json ) {

		this.name = EXTENSIONS.KHR_MATERIALS_COMMON;

		this.lights = {};

		var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) || {};
		var lights = extension.lights || {};

		for ( var lightId in lights ) {

			var light = lights[ lightId ];
			var lightNode;

			var lightParams = light[ light.type ];
			var color = new THREE.Color().fromArray( lightParams.color );

			switch ( light.type ) {

				case "directional":
					lightNode = new THREE.DirectionalLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;

				case "point":
					lightNode = new THREE.PointLight( color );
					break;

				case "spot":
					lightNode = new THREE.SpotLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;

				case "ambient":
					lightNode = new THREE.AmbientLight( color );
					break;

			}

			if ( lightNode ) {

				this.lights[ lightId ] = lightNode;

			}

		}

	}

	/* BINARY EXTENSION */

	var BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';
	var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
	var BINARY_EXTENSION_HEADER_LENGTH = 12;
	var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

	function GLTFBinaryExtension( data ) {

		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;

		var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );

		this.header = {
			magic: convertUint8ArrayToString( new Uint8Array( data.slice( 0, 4 ) ) ),
			version: headerView.getUint32( 4, true ),
			length: headerView.getUint32( 8, true )
		};

		if ( this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC ) {

			throw new Error( 'GLTF2Loader: Unsupported glTF-Binary header.' );

		} else if ( this.header.version < 2.0 ) {

			throw new Error( 'GLTF2Loader: Legacy binary file detected. Use GLTFLoader instead.' );

		}

		var chunkView = new DataView( data, BINARY_EXTENSION_HEADER_LENGTH );
		var chunkIndex = 0;

		while ( chunkIndex < chunkView.byteLength ) {

			var chunkLength = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			var chunkType = chunkView.getUint32( chunkIndex, true );
			chunkIndex += 4;

			if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

				var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
				this.content = convertUint8ArrayToString( contentArray );

			} else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

				var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice( byteOffset, byteOffset + chunkLength );

			}

			// Clients must ignore chunks with unknown types.

			chunkIndex += chunkLength;

		}

		if ( this.content === null ) {

			throw new Error( 'GLTF2Loader: JSON content not found.' );

		}

	}

	/*********************************/
	/********** INTERNALS ************/
	/*********************************/

	/* CONSTANTS */

	var WEBGL_CONSTANTS = {
		FLOAT: 5126,
		//FLOAT_MAT2: 35674,
		FLOAT_MAT3: 35675,
		FLOAT_MAT4: 35676,
		FLOAT_VEC2: 35664,
		FLOAT_VEC3: 35665,
		FLOAT_VEC4: 35666,
		LINEAR: 9729,
		REPEAT: 10497,
		SAMPLER_2D: 35678,
		TRIANGLES: 4,
		LINES: 1,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123,

		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632
	};

	var WEBGL_TYPE = {
		5126: Number,
		//35674: THREE.Matrix2,
		35675: THREE.Matrix3,
		35676: THREE.Matrix4,
		35664: THREE.Vector2,
		35665: THREE.Vector3,
		35666: THREE.Vector4,
		35678: THREE.Texture
	};

	var WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
	};

	var WEBGL_FILTERS = {
		9728: THREE.NearestFilter,
		9729: THREE.LinearFilter,
		9984: THREE.NearestMipMapNearestFilter,
		9985: THREE.LinearMipMapNearestFilter,
		9986: THREE.NearestMipMapLinearFilter,
		9987: THREE.LinearMipMapLinearFilter
	};

	var WEBGL_WRAPPINGS = {
		33071: THREE.ClampToEdgeWrapping,
		33648: THREE.MirroredRepeatWrapping,
		10497: THREE.RepeatWrapping
	};

	var WEBGL_TEXTURE_FORMATS = {
		6406: THREE.AlphaFormat,
		6407: THREE.RGBFormat,
		6408: THREE.RGBAFormat,
		6409: THREE.LuminanceFormat,
		6410: THREE.LuminanceAlphaFormat
	};

	var WEBGL_TEXTURE_DATATYPES = {
		5121: THREE.UnsignedByteType,
		32819: THREE.UnsignedShort4444Type,
		32820: THREE.UnsignedShort5551Type,
		33635: THREE.UnsignedShort565Type
	};

	var WEBGL_SIDES = {
		1028: THREE.BackSide,  // Culling front
		1029: THREE.FrontSide  // Culling back
		//1032: THREE.NoSide   // Culling front and back, what to do?
	};

	var WEBGL_DEPTH_FUNCS = {
		512: THREE.NeverDepth,
		513: THREE.LessDepth,
		514: THREE.EqualDepth,
		515: THREE.LessEqualDepth,
		516: THREE.GreaterEqualDepth,
		517: THREE.NotEqualDepth,
		518: THREE.GreaterEqualDepth,
		519: THREE.AlwaysDepth
	};

	var WEBGL_BLEND_EQUATIONS = {
		32774: THREE.AddEquation,
		32778: THREE.SubtractEquation,
		32779: THREE.ReverseSubtractEquation
	};

	var WEBGL_BLEND_FUNCS = {
		0: THREE.ZeroFactor,
		1: THREE.OneFactor,
		768: THREE.SrcColorFactor,
		769: THREE.OneMinusSrcColorFactor,
		770: THREE.SrcAlphaFactor,
		771: THREE.OneMinusSrcAlphaFactor,
		772: THREE.DstAlphaFactor,
		773: THREE.OneMinusDstAlphaFactor,
		774: THREE.DstColorFactor,
		775: THREE.OneMinusDstColorFactor,
		776: THREE.SrcAlphaSaturateFactor
		// The followings are not supported by Three.js yet
		//32769: CONSTANT_COLOR,
		//32770: ONE_MINUS_CONSTANT_COLOR,
		//32771: CONSTANT_ALPHA,
		//32772: ONE_MINUS_CONSTANT_COLOR
	};

	var WEBGL_TYPE_SIZES = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16
	};

	var PATH_PROPERTIES = {
		scale: 'scale',
		translation: 'position',
		rotation: 'quaternion'
	};

	var INTERPOLATION = {
		LINEAR: THREE.InterpolateLinear,
		STEP: THREE.InterpolateDiscrete
	};

	var STATES_ENABLES = {
		2884: 'CULL_FACE',
		2929: 'DEPTH_TEST',
		3042: 'BLEND',
		3089: 'SCISSOR_TEST',
		32823: 'POLYGON_OFFSET_FILL',
		32926: 'SAMPLE_ALPHA_TO_COVERAGE'
	};

	/* UTILITY FUNCTIONS */

	function _each( object, callback, thisObj ) {

		if ( !object ) {
			return Promise.resolve();
		}

		var results;
		var fns = [];

		if ( Object.prototype.toString.call( object ) === '[object Array]' ) {

			results = [];

			var length = object.length;

			for ( var idx = 0; idx < length; idx ++ ) {

				var value = callback.call( thisObj || this, object[ idx ], idx );

				if ( value ) {

					fns.push( value );

					if ( value instanceof Promise ) {

						value.then( function( key, value ) {

							results[ key ] = value;

						}.bind( this, idx ));

					} else {

						results[ idx ] = value;

					}

				}

			}

		} else {

			results = {};

			for ( var key in object ) {

				if ( object.hasOwnProperty( key ) ) {

					var value = callback.call( thisObj || this, object[ key ], key );

					if ( value ) {

						fns.push( value );

						if ( value instanceof Promise ) {

							value.then( function( key, value ) {

								results[ key ] = value;

							}.bind( this, key ));

						} else {

							results[ key ] = value;

						}

					}

				}

			}

		}

		return Promise.all( fns ).then( function() {

			return results;

		});

	}

	function resolveURL( url, path ) {

		// Invalid URL
		if ( typeof url !== 'string' || url === '' )
			return '';

		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) {

			return url;

		}

		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) {

			return url;

		}

		// Blob URL
		if ( /^blob:.*$/i.test( url ) ) {

			return url;

		}

		// Relative URL
		return ( path || '' ) + url;

	}

	// Avoid the String.fromCharCode.apply(null, array) shortcut, which
	// throws a "maximum call stack size exceeded" error for large arrays.
	function convertUint8ArrayToString( array ) {

		var s = '';

		for ( var i = 0; i < array.length; i ++ ) {

			s += String.fromCharCode( array[ i ] );

		}

		return s;

	}

	// Three.js seems too dependent on attribute names so globally
	// replace those in the shader code
	function replaceTHREEShaderAttributes( shaderText, technique ) {

		// Expected technique attributes
		var attributes = {};

		for ( var attributeId in technique.attributes ) {

			var pname = technique.attributes[ attributeId ];

			var param = technique.parameters[ pname ];
			var atype = param.type;
			var semantic = param.semantic;

			attributes[ attributeId ] = {
				type: atype,
				semantic: semantic
			};

		}

		// Figure out which attributes to change in technique

		var shaderParams = technique.parameters;
		var shaderAttributes = technique.attributes;
		var params = {};

		for ( var attributeId in attributes ) {

			var pname = shaderAttributes[ attributeId ];
			var shaderParam = shaderParams[ pname ];
			var semantic = shaderParam.semantic;
			if ( semantic ) {

				params[ attributeId ] = shaderParam;

			}

		}

		for ( var pname in params ) {

			var param = params[ pname ];
			var semantic = param.semantic;

			var regEx = new RegExp( "\\b" + pname + "\\b", "g" );

			switch ( semantic ) {

				case 'POSITION':

					shaderText = shaderText.replace( regEx, 'position' );
					break;

				case 'NORMAL':

					shaderText = shaderText.replace( regEx, 'normal' );
					break;

				case 'TEXCOORD_0':
				case 'TEXCOORD0':
				case 'TEXCOORD':

					shaderText = shaderText.replace( regEx, 'uv' );
					break;

				case 'TEXCOORD_1':

					shaderText = shaderText.replace( regEx, 'uv2' );
					break;

				case 'COLOR_0':
				case 'COLOR0':
				case 'COLOR':

					shaderText = shaderText.replace( regEx, 'color' );
					break;

				case 'WEIGHTS_0':
				case 'WEIGHT': // WEIGHT semantic deprecated.

					shaderText = shaderText.replace( regEx, 'skinWeight' );
					break;

				case 'JOINTS_0':
				case 'JOINT': // JOINT semantic deprecated.

					shaderText = shaderText.replace( regEx, 'skinIndex' );
					break;

			}

		}

		return shaderText;

	}

	function createDefaultMaterial() {

		return new THREE.MeshPhongMaterial( {
			color: 0x00000,
			emissive: 0x888888,
			specular: 0x000000,
			shininess: 0,
			transparent: false,
			depthTest: true,
			side: THREE.FrontSide
		} );

	}

	// Deferred constructor for RawShaderMaterial types
	function DeferredShaderMaterial( params ) {

		this.isDeferredShaderMaterial = true;

		this.params = params;

	}

	DeferredShaderMaterial.prototype.create = function () {

		var uniforms = THREE.UniformsUtils.clone( this.params.uniforms );

		for ( var uniformId in this.params.uniforms ) {

			var originalUniform = this.params.uniforms[ uniformId ];

			if ( originalUniform.value instanceof THREE.Texture ) {

				uniforms[ uniformId ].value = originalUniform.value;
				uniforms[ uniformId ].value.needsUpdate = true;

			}

			uniforms[ uniformId ].semantic = originalUniform.semantic;
			uniforms[ uniformId ].node = originalUniform.node;

		}

		this.params.uniforms = uniforms;

		return new THREE.RawShaderMaterial( this.params );

	};

	/* GLTF PARSER */

	function GLTFParser( json, extensions, options ) {

		this.json = json || {};
		this.extensions = extensions || {};
		this.options = options || {};

		// loader object cache
		this.cache = new GLTFRegistry();

	}

	GLTFParser.prototype._withDependencies = function ( dependencies ) {

		var _dependencies = {};

		for ( var i = 0; i < dependencies.length; i ++ ) {

			var dependency = dependencies[ i ];
			var fnName = "load" + dependency.charAt( 0 ).toUpperCase() + dependency.slice( 1 );

			var cached = this.cache.get( dependency );

			if ( cached !== undefined ) {

				_dependencies[ dependency ] = cached;

			} else if ( this[ fnName ] ) {

				var fn = this[ fnName ]();
				this.cache.add( dependency, fn );

				_dependencies[ dependency ] = fn;

			}

		}

		return _each( _dependencies, function ( dependency ) {

			return dependency;

		} );

	};

	GLTFParser.prototype.parse = function ( callback ) {

		var json = this.json;

		// Clear the loader cache
		this.cache.removeAll();

		// Fire the callback on complete
		this._withDependencies( [

			"scenes",
			"cameras",
			"animations"

		] ).then( function ( dependencies ) {

			var scenes = [];

			for ( var name in dependencies.scenes ) {

				scenes.push( dependencies.scenes[ name ] );

			}

			var scene = json.scene !== undefined ? dependencies.scenes[ json.scene ] : scenes[ 0 ];

			var cameras = [];

			for ( var name in dependencies.cameras ) {

				var camera = dependencies.cameras[ name ];
				cameras.push( camera );

			}

			var animations = [];

			for ( var name in dependencies.animations ) {

				animations.push( dependencies.animations[ name ] );

			}

			callback( scene, scenes, cameras, animations );

		} );

	};

	GLTFParser.prototype.loadShaders = function () {

		var json = this.json;
		var options = this.options;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.shaders, function ( shader ) {

				if ( shader.bufferView !== undefined ) {

					var bufferView = dependencies.bufferViews[ shader.bufferView ];
					var array = new Uint8Array( bufferView );
					return convertUint8ArrayToString( array );

				}

				return new Promise( function ( resolve ) {

					var loader = new THREE.FileLoader();
					loader.setResponseType( 'text' );
					loader.load( resolveURL( shader.uri, options.path ), function ( shaderText ) {

						resolve( shaderText );

					} );

				} );

			} );

		} );

	};

	GLTFParser.prototype.loadBuffers = function () {

		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;

		return _each( json.buffers, function ( buffer, name ) {

			if ( buffer.type === 'arraybuffer' || buffer.type === undefined ) {

				// If present, GLB container is required to be the first buffer.
				if ( buffer.uri === undefined && name === 0 ) {

					return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body;

				}

				return new Promise( function ( resolve ) {

					var loader = new THREE.FileLoader();
					loader.setResponseType( 'arraybuffer' );
					loader.load( resolveURL( buffer.uri, options.path ), function ( buffer ) {

						resolve( buffer );

					} );

				} );

			} else {

				console.warn( 'THREE.GLTF2Loader: ' + buffer.type + ' buffer type is not supported' );

			}

		} );

	};

	GLTFParser.prototype.loadBufferViews = function () {

		var json = this.json;

		return this._withDependencies( [

			"buffers"

		] ).then( function ( dependencies ) {

			return _each( json.bufferViews, function ( bufferView ) {

				var arraybuffer = dependencies.buffers[ bufferView.buffer ];

				var byteLength = bufferView.byteLength !== undefined ? bufferView.byteLength : 0;

				return arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + byteLength );

			} );

		} );

	};

	GLTFParser.prototype.loadAccessors = function () {

		var json = this.json;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.accessors, function ( accessor ) {

				var arraybuffer = dependencies.bufferViews[ accessor.bufferView ];
				var itemSize = WEBGL_TYPE_SIZES[ accessor.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessor.componentType ];

				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;

				var array;

				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( accessor.byteStride && accessor.byteStride !== itemBytes ) {

					// Use the full buffer if it's interleaved.
					array = new TypedArray( arraybuffer );

					// Integer parameters to IB/IBA are in array elements, not bytes.
					var ib = new THREE.InterleavedBuffer( array, accessor.byteStride / elementBytes );

					return new THREE.InterleavedBufferAttribute( ib, itemSize, accessor.byteOffset / elementBytes );

				} else {

					array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );

					return new THREE.BufferAttribute( array, itemSize );

				}

			} );

		} );

	};

	GLTFParser.prototype.loadTextures = function () {

		var json = this.json;
		var options = this.options;

		return this._withDependencies( [

			"bufferViews"

		] ).then( function ( dependencies ) {

			return _each( json.textures, function ( texture ) {

				if ( texture.source !== undefined ) {

					return new Promise( function ( resolve ) {

						var source = json.images[ texture.source ];
						var sourceUri = source.uri;

						var urlCreator;

						if ( source.bufferView !== undefined ) {

							var bufferView = dependencies.bufferViews[ source.bufferView ];
							var blob = new Blob( [ bufferView ], { type: source.mimeType } );
							urlCreator = window.URL || window.webkitURL;
							sourceUri = urlCreator.createObjectURL( blob );

						}

						var textureLoader = THREE.Loader.Handlers.get( sourceUri );

						if ( textureLoader === null ) {

							textureLoader = new THREE.TextureLoader();

						}

						textureLoader.setCrossOrigin( options.crossOrigin );

						textureLoader.load( resolveURL( sourceUri, options.path ), function ( _texture ) {

							if ( urlCreator !== undefined ) {

								urlCreator.revokeObjectURL( sourceUri );

							}

							_texture.flipY = false;

							if ( texture.name !== undefined ) _texture.name = texture.name;

							_texture.format = texture.format !== undefined ? WEBGL_TEXTURE_FORMATS[ texture.format ] : THREE.RGBAFormat;

							if ( texture.internalFormat !== undefined && _texture.format !== WEBGL_TEXTURE_FORMATS[ texture.internalFormat ] ) {

								console.warn( 'THREE.GLTF2Loader: Three.js doesn\'t support texture internalFormat which is different from texture format. ' +
								              'internalFormat will be forced to be the same value as format.' );

							}

							_texture.type = texture.type !== undefined ? WEBGL_TEXTURE_DATATYPES[ texture.type ] : THREE.UnsignedByteType;

							if ( texture.sampler !== undefined ) {

								var sampler = json.samplers[ texture.sampler ];

								_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || THREE.LinearFilter;
								_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || THREE.NearestMipMapLinearFilter;
								_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || THREE.RepeatWrapping;
								_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || THREE.RepeatWrapping;

							}

							resolve( _texture );

						}, undefined, function () {

							resolve();

						} );

					} );

				}

			} );

		} );

	};

	GLTFParser.prototype.loadMaterials = function () {

		var json = this.json;

		return this._withDependencies( [

			"shaders",
			"textures"

		] ).then( function ( dependencies ) {

			return _each( json.materials, function ( material ) {

				var materialType;
				var materialValues = {};
				var materialParams = {};

				var khr_material;

				if ( material.extensions && material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) {

					khr_material = material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ];

				}

				if ( khr_material ) {

					// don't copy over unused values to avoid material warning spam
					var keys = [ 'ambient', 'emission', 'transparent', 'transparency', 'doubleSided' ];

					switch ( khr_material.technique ) {

						case 'BLINN' :
						case 'PHONG' :
							materialType = THREE.MeshPhongMaterial;
							keys.push( 'diffuse', 'specular', 'shininess' );
							break;

						case 'LAMBERT' :
							materialType = THREE.MeshLambertMaterial;
							keys.push( 'diffuse' );
							break;

						case 'CONSTANT' :
						default :
							materialType = THREE.MeshBasicMaterial;
							break;

					}

					keys.forEach( function( v ) {

						if ( khr_material.values[ v ] !== undefined ) materialValues[ v ] = khr_material.values[ v ];

					} );

					if ( khr_material.doubleSided || materialValues.doubleSided ) {

						materialParams.side = THREE.DoubleSide;

					}

					if ( khr_material.transparent || materialValues.transparent ) {

						materialParams.transparent = true;
						materialParams.opacity = ( materialValues.transparency !== undefined ) ? materialValues.transparency : 1;

					}

				} else if ( material.technique === undefined ) {

					if ( material.pbrMetallicRoughness !== undefined )  {

						// specification
						// https://github.com/sbtron/glTF/blob/30de0b365d1566b1bbd8b9c140f9e995d3203226/specification/2.0/README.md#metallic-roughness-material

						materialType = THREE.MeshStandardMaterial;

						if ( material.pbrMetallicRoughness !== undefined ) {

							var metallicRoughness = material.pbrMetallicRoughness;

							materialParams.color = new THREE.Color( 1.0, 1.0, 1.0 );
							materialParams.opacity = 1.0;

							if ( Array.isArray( metallicRoughness.baseColorFactor ) ) {

								var array = metallicRoughness.baseColorFactor;

								materialParams.color.fromArray( array );
								materialParams.opacity = array[ 3 ];

							}

							if ( metallicRoughness.baseColorTexture !== undefined ) {

								materialParams.map = dependencies.textures[ metallicRoughness.baseColorTexture.index ];

							}

							if ( materialParams.opacity < 1.0 ||
							     ( materialParams.map !== undefined &&
							       ( materialParams.map.format === THREE.AlphaFormat ||
							         materialParams.map.format === THREE.RGBAFormat ||
							         materialParams.map.format === THREE.LuminanceAlphaFormat ) ) ) {

								materialParams.transparent = true;

							}

							materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
							materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

							if ( metallicRoughness.metallicRoughnessTexture !== undefined ) {

								var textureIndex = metallicRoughness.metallicRoughnessTexture.index;

								// Note that currently metalnessMap would be entirely ignored because
								// Three.js and glTF specification use different texture channels for metalness
								// (Blue: Three.js, Red: glTF).
								// But glTF specification team is discussing if they can change.
								// Let's keep an eye on it so far.
								//
								// https://github.com/KhronosGroup/glTF/issues/857
								materialParams.metalnessMap = dependencies.textures[ textureIndex ];
								materialParams.roughnessMap = dependencies.textures[ textureIndex ];

							}

						}

					} else {

						materialType = THREE.MeshPhongMaterial;

					}

					if ( material.normalTexture !== undefined ) {

						materialParams.normalMap = dependencies.textures[ material.normalTexture.index ];

					}

					if ( material.occlusionTexture !== undefined ) {

						materialParams.aoMap = dependencies.textures[ material.occlusionTexture.index ];

					}

					if ( material.emissiveTexture !== undefined ) {

						materialParams.emissiveMap = dependencies.textures[ material.emissiveTexture.index ];

					}

					materialParams.emissive = new THREE.Color( 0.0, 0.0, 0.0 );

					if ( material.emissiveFactor !== undefined ) {

						materialParams.emissive.fromArray( material.emissiveFactor );

					}

					Object.assign( materialValues, material.values );

				} else {

					materialType = DeferredShaderMaterial;

					var technique = json.techniques[ material.technique ];

					materialParams.uniforms = {};

					var program = json.programs[ technique.program ];

					if ( program ) {

						materialParams.fragmentShader = dependencies.shaders[ program.fragmentShader ];

						if ( ! materialParams.fragmentShader ) {

							console.warn( "ERROR: Missing fragment shader definition:", program.fragmentShader );
							materialType = THREE.MeshPhongMaterial;

						}

						var vertexShader = dependencies.shaders[ program.vertexShader ];

						if ( ! vertexShader ) {

							console.warn( "ERROR: Missing vertex shader definition:", program.vertexShader );
							materialType = THREE.MeshPhongMaterial;

						}

						// IMPORTANT: FIX VERTEX SHADER ATTRIBUTE DEFINITIONS
						materialParams.vertexShader = replaceTHREEShaderAttributes( vertexShader, technique );

						var uniforms = technique.uniforms;

						for ( var uniformId in uniforms ) {

							var pname = uniforms[ uniformId ];
							var shaderParam = technique.parameters[ pname ];

							var ptype = shaderParam.type;

							if ( WEBGL_TYPE[ ptype ] ) {

								var pcount = shaderParam.count;
								var value;

								if ( material.values !== undefined ) value = material.values[ pname ];

								var uvalue = new WEBGL_TYPE[ ptype ]();
								var usemantic = shaderParam.semantic;
								var unode = shaderParam.node;

								switch ( ptype ) {

									case WEBGL_CONSTANTS.FLOAT:

										uvalue = shaderParam.value;

										if ( pname == "transparency" ) {

											materialParams.transparent = true;

										}

										if ( value !== undefined ) {

											uvalue = value;

										}

										break;

									case WEBGL_CONSTANTS.FLOAT_VEC2:
									case WEBGL_CONSTANTS.FLOAT_VEC3:
									case WEBGL_CONSTANTS.FLOAT_VEC4:
									case WEBGL_CONSTANTS.FLOAT_MAT3:

										if ( shaderParam && shaderParam.value ) {

											uvalue.fromArray( shaderParam.value );

										}

										if ( value ) {

											uvalue.fromArray( value );

										}

										break;

									case WEBGL_CONSTANTS.FLOAT_MAT2:

										// what to do?
										console.warn( "FLOAT_MAT2 is not a supported uniform type" );
										break;

									case WEBGL_CONSTANTS.FLOAT_MAT4:

										if ( pcount ) {

											uvalue = new Array( pcount );

											for ( var mi = 0; mi < pcount; mi ++ ) {

												uvalue[ mi ] = new WEBGL_TYPE[ ptype ]();

											}

											if ( shaderParam && shaderParam.value ) {

												var m4v = shaderParam.value;
												uvalue.fromArray( m4v );

											}

											if ( value ) {

												uvalue.fromArray( value );

											}

										} else {

											if ( shaderParam && shaderParam.value ) {

												var m4 = shaderParam.value;
												uvalue.fromArray( m4 );

											}

											if ( value ) {

												uvalue.fromArray( value );

											}

										}

										break;

									case WEBGL_CONSTANTS.SAMPLER_2D:

										if ( value !== undefined ) {

											uvalue = dependencies.textures[ value ];

										} else if ( shaderParam.value !== undefined ) {

											uvalue = dependencies.textures[ shaderParam.value ];

										} else {

											uvalue = null;

										}

										break;

								}

								materialParams.uniforms[ uniformId ] = {
									value: uvalue,
									semantic: usemantic,
									node: unode
								};

							} else {

								throw new Error( "Unknown shader uniform param type: " + ptype );

							}

						}

						var states = technique.states || {};
						var enables = states.enable || [];
						var functions = states.functions || {};

						var enableCullFace = false;
						var enableDepthTest = false;
						var enableBlend = false;

						for ( var i = 0, il = enables.length; i < il; i ++ ) {

							var enable = enables[ i ];

							switch ( STATES_ENABLES[ enable ] ) {

								case 'CULL_FACE':

									enableCullFace = true;

									break;

								case 'DEPTH_TEST':

									enableDepthTest = true;

									break;

								case 'BLEND':

									enableBlend = true;

									break;

								// TODO: implement
								case 'SCISSOR_TEST':
								case 'POLYGON_OFFSET_FILL':
								case 'SAMPLE_ALPHA_TO_COVERAGE':

									break;

								default:

									throw new Error( "Unknown technique.states.enable: " + enable );

							}

						}

						if ( enableCullFace ) {

							materialParams.side = functions.cullFace !== undefined ? WEBGL_SIDES[ functions.cullFace ] : THREE.FrontSide;

						} else {

							materialParams.side = THREE.DoubleSide;

						}

						materialParams.depthTest = enableDepthTest;
						materialParams.depthFunc = functions.depthFunc !== undefined ? WEBGL_DEPTH_FUNCS[ functions.depthFunc ] : THREE.LessDepth;
						materialParams.depthWrite = functions.depthMask !== undefined ? functions.depthMask[ 0 ] : true;

						materialParams.blending = enableBlend ? THREE.CustomBlending : THREE.NoBlending;
						materialParams.transparent = enableBlend;

						var blendEquationSeparate = functions.blendEquationSeparate;

						if ( blendEquationSeparate !== undefined ) {

							materialParams.blendEquation = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 0 ] ];
							materialParams.blendEquationAlpha = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 1 ] ];

						} else {

							materialParams.blendEquation = THREE.AddEquation;
							materialParams.blendEquationAlpha = THREE.AddEquation;

						}

						var blendFuncSeparate = functions.blendFuncSeparate;

						if ( blendFuncSeparate !== undefined ) {

							materialParams.blendSrc = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 0 ] ];
							materialParams.blendDst = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 1 ] ];
							materialParams.blendSrcAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 2 ] ];
							materialParams.blendDstAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 3 ] ];

						} else {

							materialParams.blendSrc = THREE.OneFactor;
							materialParams.blendDst = THREE.ZeroFactor;
							materialParams.blendSrcAlpha = THREE.OneFactor;
							materialParams.blendDstAlpha = THREE.ZeroFactor;

						}

					}

				}

				if ( Array.isArray( materialValues.diffuse ) ) {

					materialParams.color = new THREE.Color().fromArray( materialValues.diffuse );

				} else if ( typeof( materialValues.diffuse ) === 'string' ) {

					materialParams.map = dependencies.textures[ materialValues.diffuse ];

				}

				delete materialParams.diffuse;

				if ( typeof( materialValues.reflective ) === 'string' ) {

					materialParams.envMap = dependencies.textures[ materialValues.reflective ];

				}

				if ( typeof( materialValues.bump ) === 'string' ) {

					materialParams.bumpMap = dependencies.textures[ materialValues.bump ];

				}

				if ( Array.isArray( materialValues.emission ) ) {

					if ( materialType === THREE.MeshBasicMaterial ) {

						materialParams.color = new THREE.Color().fromArray( materialValues.emission );

					} else {

						materialParams.emissive = new THREE.Color().fromArray( materialValues.emission );

					}

				} else if ( typeof( materialValues.emission ) === 'string' ) {

					if ( materialType === THREE.MeshBasicMaterial ) {

						materialParams.map = dependencies.textures[ materialValues.emission ];

					} else {

						materialParams.emissiveMap = dependencies.textures[ materialValues.emission ];

					}

				}

				if ( Array.isArray( materialValues.specular ) ) {

					materialParams.specular = new THREE.Color().fromArray( materialValues.specular );

				} else if ( typeof( materialValues.specular ) === 'string' ) {

					materialParams.specularMap = dependencies.textures[ materialValues.specular ];

				}

				if ( materialValues.shininess !== undefined ) {

					materialParams.shininess = materialValues.shininess;

				}

				var _material = new materialType( materialParams );
				if ( material.name !== undefined ) _material.name = material.name;

				return _material;

			} );

		} );

	};

	GLTFParser.prototype.loadMeshes = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors",
			"materials"

		] ).then( function ( dependencies ) {

			return _each( json.meshes, function ( mesh ) {

				var group = new THREE.Group();
				if ( mesh.name !== undefined ) group.name = mesh.name;

				if ( mesh.extras ) group.userData = mesh.extras;

				var primitives = mesh.primitives || [];

				for ( var name in primitives ) {

					var primitive = primitives[ name ];

					var material = primitive.material !== undefined ? dependencies.materials[ primitive.material ] : createDefaultMaterial();

					var geometry;

					var meshNode;

					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {

						geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( attributeEntry === undefined ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':

									geometry.addAttribute( 'position', bufferAttribute );
									break;

								case 'NORMAL':

									geometry.addAttribute( 'normal', bufferAttribute );
									break;

								case 'TEXCOORD_0':
								case 'TEXCOORD0':
								case 'TEXCOORD':

									geometry.addAttribute( 'uv', bufferAttribute );
									break;

								case 'TEXCOORD_1':

									geometry.addAttribute( 'uv2', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':

									geometry.addAttribute( 'color', bufferAttribute );
									break;

								case 'WEIGHTS_0':
								case 'WEIGHT': // WEIGHT semantic deprecated.

									geometry.addAttribute( 'skinWeight', bufferAttribute );
									break;

								case 'JOINTS_0':
								case 'JOINT': // JOINT semantic deprecated.

									geometry.addAttribute( 'skinIndex', bufferAttribute );
									break;

							}

						}

						if ( primitive.indices !== undefined ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

						}

						meshNode = new THREE.Mesh( geometry, material );
						meshNode.castShadow = true;

					} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {

						geometry = new THREE.BufferGeometry();

						var attributes = primitive.attributes;

						for ( var attributeId in attributes ) {

							var attributeEntry = attributes[ attributeId ];

							if ( ! attributeEntry ) return;

							var bufferAttribute = dependencies.accessors[ attributeEntry ];

							switch ( attributeId ) {

								case 'POSITION':
									geometry.addAttribute( 'position', bufferAttribute );
									break;

								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':
									geometry.addAttribute( 'color', bufferAttribute );
									break;

							}

						}

						if ( primitive.indices !== undefined ) {

							geometry.setIndex( dependencies.accessors[ primitive.indices ] );

							meshNode = new THREE.LineSegments( geometry, material );

						} else {

							meshNode = new THREE.Line( geometry, material );

						}

					} else {

						throw new Error( "Only triangular and line primitives are supported" );

					}

					if ( geometry.attributes.color !== undefined ) {

						material.vertexColors = THREE.VertexColors;
						material.needsUpdate = true;

					}

					meshNode.name = ( name === "0" ? group.name : group.name + name );

					if ( primitive.extras ) meshNode.userData = primitive.extras;

					group.add( meshNode );

				}

				return group;

			} );

		} );

	};

	GLTFParser.prototype.loadCameras = function () {

		var json = this.json;

		return _each( json.cameras, function ( camera ) {

			if ( camera.type == "perspective" && camera.perspective ) {

				var yfov = camera.perspective.yfov;
				var aspectRatio = camera.perspective.aspectRatio !== undefined ? camera.perspective.aspectRatio : 1;

				// According to COLLADA spec...
				// aspectRatio = xfov / yfov
				var xfov = yfov * aspectRatio;

				var _camera = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspectRatio, camera.perspective.znear || 1, camera.perspective.zfar || 2e6 );
				if ( camera.name !== undefined ) _camera.name = camera.name;

				if ( camera.extras ) _camera.userData = camera.extras;

				return _camera;

			} else if ( camera.type == "orthographic" && camera.orthographic ) {

				var _camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
				if ( camera.name !== undefined ) _camera.name = camera.name;

				if ( camera.extras ) _camera.userData = camera.extras;

				return _camera;

			}

		} );

	};

	GLTFParser.prototype.loadSkins = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors"

		] ).then( function ( dependencies ) {

			return _each( json.skins, function ( skin ) {

				var bindShapeMatrix = new THREE.Matrix4();

				if ( skin.bindShapeMatrix !== undefined ) bindShapeMatrix.fromArray( skin.bindShapeMatrix );

				var _skin = {
					bindShapeMatrix: bindShapeMatrix,
					jointNames: skin.jointNames,
					inverseBindMatrices: dependencies.accessors[ skin.inverseBindMatrices ]
				};

				return _skin;

			} );

		} );

	};

	GLTFParser.prototype.loadAnimations = function () {

		var json = this.json;

		return this._withDependencies( [

			"accessors",
			"nodes"

		] ).then( function ( dependencies ) {

			return _each( json.animations, function ( animation, animationId ) {

				var tracks = [];

				for ( var channelId in animation.channels ) {

					var channel = animation.channels[ channelId ];
					var sampler = animation.samplers[ channel.sampler ];

					if ( sampler ) {

						var target = channel.target;
						var name = target.node || target.id; // NOTE: target.id is deprecated.
						var input = animation.parameters !== undefined ? animation.parameters[ sampler.input ] : sampler.input;
						var output = animation.parameters !== undefined ? animation.parameters[ sampler.output ] : sampler.output;

						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];

						var node = dependencies.nodes[ name ];

						if ( node ) {

							node.updateMatrix();
							node.matrixAutoUpdate = true;

							var TypedKeyframeTrack = PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.rotation
								? THREE.QuaternionKeyframeTrack
								: THREE.VectorKeyframeTrack;

							var targetName = node.name ? node.name : node.uuid;
							var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : THREE.InterpolateLinear;

							// KeyframeTrack.optimize() will modify given 'times' and 'values'
							// buffers before creating a truncated copy to keep. Because buffers may
							// be reused by other tracks, make copies here.
							tracks.push( new TypedKeyframeTrack(
								targetName + '.' + PATH_PROPERTIES[ target.path ],
								THREE.AnimationUtils.arraySlice( inputAccessor.array, 0 ),
								THREE.AnimationUtils.arraySlice( outputAccessor.array, 0 ),
								interpolation
							) );

						}

					}

				}

				var name = animation.name !== undefined ? animation.name : "animation_" + animationId;

				return new THREE.AnimationClip( name, undefined, tracks );

			} );

		} );

	};

	GLTFParser.prototype.loadNodes = function () {

		var json = this.json;
		var extensions = this.extensions;
		var scope = this;

		return _each( json.nodes, function ( node ) {

			var matrix = new THREE.Matrix4();

			var _node;

			if ( node.jointName ) {

				_node = new THREE.Bone();
				_node.name = node.name !== undefined ? node.name : node.jointName;
				_node.jointName = node.jointName;

			} else {

				_node = new THREE.Object3D();
				if ( node.name !== undefined ) _node.name = node.name;

			}

			if ( node.extras ) _node.userData = node.extras;

			if ( node.matrix !== undefined ) {

				matrix.fromArray( node.matrix );
				_node.applyMatrix( matrix );

			} else {

				if ( node.translation !== undefined ) {

					_node.position.fromArray( node.translation );

				}

				if ( node.rotation !== undefined ) {

					_node.quaternion.fromArray( node.rotation );

				}

				if ( node.scale !== undefined ) {

					_node.scale.fromArray( node.scale );

				}

			}

			return _node;

		} ).then( function ( __nodes ) {

			return scope._withDependencies( [

				"meshes",
				"skins",
				"cameras"

			] ).then( function ( dependencies ) {

				return _each( __nodes, function ( _node, nodeId ) {

					var node = json.nodes[ nodeId ];

					var meshes;

					if ( node.mesh !== undefined) {

						meshes = [ node.mesh ];

					} else if ( node.meshes !== undefined ) {

						console.warn( 'GLTF2Loader: Legacy glTF file detected. Nodes may have no more than 1 mesh.' );

						meshes = node.meshes;

					}

					if ( meshes !== undefined ) {

						for ( var meshId in meshes ) {

							var mesh = meshes[ meshId ];
							var group = dependencies.meshes[ mesh ];

							if ( group === undefined ) {

								console.warn( 'GLTF2Loader: Couldn\'t find node "' + mesh + '".' );
								continue;

							}

							for ( var childrenId in group.children ) {

								var child = group.children[ childrenId ];

								// clone Mesh to add to _node

								var originalMaterial = child.material;
								var originalGeometry = child.geometry;
								var originalUserData = child.userData;
								var originalName = child.name;

								var material;

								if ( originalMaterial.isDeferredShaderMaterial ) {

									originalMaterial = material = originalMaterial.create();

								} else {

									material = originalMaterial;

								}

								switch ( child.type ) {

									case 'LineSegments':
										child = new THREE.LineSegments( originalGeometry, material );
										break;

									case 'LineLoop':
										child = new THREE.LineLoop( originalGeometry, material );
										break;

									case 'Line':
										child = new THREE.Line( originalGeometry, material );
										break;

									default:
										child = new THREE.Mesh( originalGeometry, material );

								}

								child.castShadow = true;
								child.userData = originalUserData;
								child.name = originalName;

								var skinEntry;

								if ( node.skin !== undefined ) {

									skinEntry = dependencies.skins[ node.skin ];

								}

								// Replace Mesh with SkinnedMesh in library
								if ( skinEntry ) {

									var getJointNode = function ( jointId ) {

										var keys = Object.keys( __nodes );

										for ( var i = 0, il = keys.length; i < il; i ++ ) {

											var n = __nodes[ keys[ i ] ];

											if ( n.jointName === jointId ) return n;

										}

										return null;

									};

									var geometry = originalGeometry;
									var material = originalMaterial;
									material.skinning = true;

									child = new THREE.SkinnedMesh( geometry, material, false );
									child.castShadow = true;
									child.userData = originalUserData;
									child.name = originalName;

									var bones = [];
									var boneInverses = [];

									for ( var i = 0, l = skinEntry.jointNames.length; i < l; i ++ ) {

										var jointId = skinEntry.jointNames[ i ];
										var jointNode = getJointNode( jointId );

										if ( jointNode ) {

											bones.push( jointNode );

											var m = skinEntry.inverseBindMatrices.array;
											var mat = new THREE.Matrix4().fromArray( m, i * 16 );
											boneInverses.push( mat );

										} else {

											console.warn( "WARNING: joint: '" + jointId + "' could not be found" );

										}

									}

									child.bind( new THREE.Skeleton( bones, boneInverses, false ), skinEntry.bindShapeMatrix );

									var buildBoneGraph = function ( parentJson, parentObject, property ) {

										var children = parentJson[ property ];

										if ( children === undefined ) return;

										for ( var i = 0, il = children.length; i < il; i ++ ) {

											var nodeId = children[ i ];
											var bone = __nodes[ nodeId ];
											var boneJson = json.nodes[ nodeId ];

											if ( bone !== undefined && bone.isBone === true && boneJson !== undefined ) {

												parentObject.add( bone );
												buildBoneGraph( boneJson, bone, 'children' );

											}

										}

									};

									buildBoneGraph( node, child, 'skeletons' );

								}

								_node.add( child );

							}

						}

					}

					if ( node.camera !== undefined ) {

						var camera = dependencies.cameras[ node.camera ];

						_node.add( camera );

					}

					if ( node.extensions
							 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ]
							 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ) {

						var extensionLights = extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].lights;
						var light = extensionLights[ node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ];

						_node.add( light );

					}

					return _node;

				} );

			} );

		} );

	};

	GLTFParser.prototype.loadScenes = function () {

		var json = this.json;

		// scene node hierachy builder

		function buildNodeHierachy( nodeId, parentObject, allNodes ) {

			var _node = allNodes[ nodeId ];
			parentObject.add( _node );

			var node = json.nodes[ nodeId ];

			if ( node.children ) {

				var children = node.children;

				for ( var i = 0, l = children.length; i < l; i ++ ) {

					var child = children[ i ];
					buildNodeHierachy( child, _node, allNodes );

				}

			}

		}

		return this._withDependencies( [

			"nodes"

		] ).then( function ( dependencies ) {

			return _each( json.scenes, function ( scene ) {

				var _scene = new THREE.Scene();
				if ( scene.name !== undefined ) _scene.name = scene.name;

				if ( scene.extras ) _scene.userData = scene.extras;

				var nodes = scene.nodes || [];

				for ( var i = 0, l = nodes.length; i < l; i ++ ) {

					var nodeId = nodes[ i ];
					buildNodeHierachy( nodeId, _scene, dependencies.nodes );

				}

				_scene.traverse( function ( child ) {

					// Register raw material meshes with GLTF2Loader.Shaders
					if ( child.material && child.material.isRawShaderMaterial ) {

						child.gltfShader = new GLTFShader( child, dependencies.nodes );
						child.onBeforeRender = function(renderer, scene, camera){
							this.gltfShader.update(scene, camera);
						};

					}

				} );

				return _scene;

			} );

		} );

	};

	return GLTF2Loader;

} )();
// File: utils/GLTFLoader.js
/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 * @author Takahiro / https://github.com/takahirox
 */

THREE.GLTFLoader = ( function () {
	function GLTFLoader( manager ) {
		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	}
	GLTFLoader.prototype = {
		constructor: GLTFLoader,
		load: function ( url, onLoad, onProgress, onError ) {
			var scope = this;
			var path = this.path && ( typeof this.path === "string" ) ? this.path : THREE.Loader.prototype.extractUrlBase( url );
			var loader = new THREE.FileLoader( scope.manager );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( data ) {
				scope.parse( data, onLoad, path );
			}, onProgress, onError );
		},
		setCrossOrigin: function ( value ) {
			this.crossOrigin = value;
		},
		setPath: function ( value ) {
			this.path = value;
		},
		parse: function ( data, callback, path ) {
			var content;
			var extensions = {};
			var magic = convertUint8ArrayToString( new Uint8Array( data, 0, 4 ) );
			if ( magic === BINARY_EXTENSION_HEADER_DEFAULTS.magic ) {
				extensions[ EXTENSIONS.KHR_BINARY_GLTF ] = new GLTFBinaryExtension( data );
				content = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].content;
			} else {
				content = convertUint8ArrayToString( new Uint8Array( data ) );
			}
			var json = JSON.parse( content );
			if ( json.extensionsUsed && json.extensionsUsed.indexOf( EXTENSIONS.KHR_MATERIALS_COMMON ) >= 0 ) {
				extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] = new GLTFMaterialsCommonExtension( json );
			}
			console.time( 'GLTFLoader' );
			var parser = new GLTFParser( json, extensions, {
				path: path || this.path,
				crossOrigin: this.crossOrigin
			} );
			parser.parse( function ( scene, scenes, cameras, animations ) {
				console.timeEnd( 'GLTFLoader' );
				var glTF = {
					"scene": scene,
					"scenes": scenes,
					"cameras": cameras,
					"animations": animations
				};
				callback( glTF );
			} );
		}
	};

	/* GLTFREGISTRY */
	function GLTFRegistry() {
		var objects = {};
		return	{
			get: function ( key ) {
				return objects[ key ];
			},
			add: function ( key, object ) {
				objects[ key ] = object;
			},
			remove: function ( key ) {
				delete objects[ key ];
			},
			removeAll: function () {
				objects = {};
			},
			update: function ( scene, camera ) {
				for ( var name in objects ) {
					var object = objects[ name ];
					if ( object.update ) {
						object.update( scene, camera );
					}
				}
			}
		};
	}

	/* GLTFSHADERS */
	GLTFLoader.Shaders = {
		update: function () {
			console.warn( 'THREE.GLTFLoader.Shaders has been deprecated, and now updates automatically.' );
		}
	};

	/* GLTFSHADER */
	function GLTFShader( targetNode, allNodes ) {
		var boundUniforms = {};
		// bind each uniform to its source node
		var uniforms = targetNode.material.uniforms;
		for ( var uniformId in uniforms ) {
			var uniform = uniforms[ uniformId ];
			if ( uniform.semantic ) {
				var sourceNodeRef = uniform.node;
				var sourceNode = targetNode;
				if ( sourceNodeRef ) {
					sourceNode = allNodes[ sourceNodeRef ];
				}
				boundUniforms[ uniformId ] = {
					semantic: uniform.semantic,
					sourceNode: sourceNode,
					targetNode: targetNode,
					uniform: uniform
				};
			}
		}
		this.boundUniforms = boundUniforms;
		this._m4 = new THREE.Matrix4();
	}
	// Update - update all the uniform values
	GLTFShader.prototype.update = function ( scene, camera ) {
		var boundUniforms = this.boundUniforms;
		for ( var name in boundUniforms ) {
			var boundUniform = boundUniforms[ name ];
			switch ( boundUniform.semantic ) {
				case "MODELVIEW":
					var m4 = boundUniform.uniform.value;
					m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					break;
				case "MODELVIEWINVERSETRANSPOSE":
					var m3 = boundUniform.uniform.value;
					this._m4.multiplyMatrices( camera.matrixWorldInverse, boundUniform.sourceNode.matrixWorld );
					m3.getNormalMatrix( this._m4 );
					break;
				case "PROJECTION":
					var m4 = boundUniform.uniform.value;
					m4.copy( camera.projectionMatrix );
					break;
				case "JOINTMATRIX":
					var m4v = boundUniform.uniform.value;
					for ( var mi = 0; mi < m4v.length; mi ++ ) {
						// So it goes like this:
						// SkinnedMesh world matrix is already baked into MODELVIEW;
						// transform joints to local space,
						// then transform using joint's inverse
						m4v[ mi ]
							.getInverse( boundUniform.sourceNode.matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.bones[ mi ].matrixWorld )
							.multiply( boundUniform.targetNode.skeleton.boneInverses[ mi ] )
							.multiply( boundUniform.targetNode.bindMatrix );
					}
					break;
				default :
					console.warn( "Unhandled shader semantic: " + boundUniform.semantic );
					break;
			}
		}
	};

	/* ANIMATION */
	GLTFLoader.Animations = {
		update: function () {
			console.warn( 'THREE.GLTFLoader.Animation has been deprecated. Use THREE.AnimationMixer instead.' );
		}
	};

	/*********************************/
	/********** EXTENSIONS ***********/
	/*********************************/
	var EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF',
		KHR_MATERIALS_COMMON: 'KHR_materials_common'
	};

	/* MATERIALS COMMON EXTENSION */
	function GLTFMaterialsCommonExtension( json ) {
		this.name = EXTENSIONS.KHR_MATERIALS_COMMON;
		this.lights = {};
		var extension = ( json.extensions && json.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) || {};
		var lights = extension.lights || {};
		for ( var lightId in lights ) {
			var light = lights[ lightId ];
			var lightNode;
			var lightParams = light[ light.type ];
			var color = new THREE.Color().fromArray( lightParams.color );
			switch ( light.type ) {
				case "directional":
					lightNode = new THREE.DirectionalLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;
				case "point":
					lightNode = new THREE.PointLight( color );
					break;
				case "spot":
					lightNode = new THREE.SpotLight( color );
					lightNode.position.set( 0, 0, 1 );
					break;
				case "ambient":
					lightNode = new THREE.AmbientLight( color );
					break;
			}
			if ( lightNode ) {
				this.lights[ lightId ] = lightNode;
			}
		}
	}

	/* BINARY EXTENSION */
	var BINARY_EXTENSION_BUFFER_NAME = 'binary_glTF';
	var BINARY_EXTENSION_HEADER_DEFAULTS = { magic: 'glTF', version: 1, contentFormat: 0 };
	var BINARY_EXTENSION_HEADER_LENGTH = 20;
	function GLTFBinaryExtension( data ) {
		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		var headerView = new DataView( data, 0, BINARY_EXTENSION_HEADER_LENGTH );
		var header = {
			magic: convertUint8ArrayToString( new Uint8Array( data.slice( 0, 4 ) ) ),
			version: headerView.getUint32( 4, true ),
			length: headerView.getUint32( 8, true ),
			contentLength: headerView.getUint32( 12, true ),
			contentFormat: headerView.getUint32( 16, true )
		};
		for ( var key in BINARY_EXTENSION_HEADER_DEFAULTS ) {
			var value = BINARY_EXTENSION_HEADER_DEFAULTS[ key ];
			if ( header[ key ] !== value ) {
				throw new Error( 'Unsupported glTF-Binary header: Expected "%s" to be "%s".', key, value );
			}
		}
		var contentArray = new Uint8Array( data, BINARY_EXTENSION_HEADER_LENGTH, header.contentLength );
		this.header = header;
		this.content = convertUint8ArrayToString( contentArray );
		this.body = data.slice( BINARY_EXTENSION_HEADER_LENGTH + header.contentLength, header.length );
	}
	GLTFBinaryExtension.prototype.loadShader = function ( shader, bufferViews ) {
		var bufferView = bufferViews[ shader.extensions[ EXTENSIONS.KHR_BINARY_GLTF ].bufferView ];
		var array = new Uint8Array( bufferView );
		return convertUint8ArrayToString( array );
	};
	GLTFBinaryExtension.prototype.loadTextureSourceUri = function ( source, bufferViews ) {
		var metadata = source.extensions[ EXTENSIONS.KHR_BINARY_GLTF ];
		var bufferView = bufferViews[ metadata.bufferView ];
		var stringData = convertUint8ArrayToString( new Uint8Array( bufferView ) );
		return 'data:' + metadata.mimeType + ';base64,' + btoa( stringData );
	};

	/*********************************/
	/********** INTERNALS ************/
	/*********************************/
	/* CONSTANTS */
	var WEBGL_CONSTANTS = {
		FLOAT: 5126,
		//FLOAT_MAT2: 35674,
		FLOAT_MAT3: 35675,
		FLOAT_MAT4: 35676,
		FLOAT_VEC2: 35664,
		FLOAT_VEC3: 35665,
		FLOAT_VEC4: 35666,
		LINEAR: 9729,
		REPEAT: 10497,
		SAMPLER_2D: 35678,
		TRIANGLES: 4,
		LINES: 1,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123,
		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632
	};
	var WEBGL_TYPE = {
		5126: Number,
		//35674: THREE.Matrix2,
		35675: THREE.Matrix3,
		35676: THREE.Matrix4,
		35664: THREE.Vector2,
		35665: THREE.Vector3,
		35666: THREE.Vector4,
		35678: THREE.Texture
	};
	var WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
	};
	var WEBGL_FILTERS = {
		9728: THREE.NearestFilter,
		9729: THREE.LinearFilter,
		9984: THREE.NearestMipMapNearestFilter,
		9985: THREE.LinearMipMapNearestFilter,
		9986: THREE.NearestMipMapLinearFilter,
		9987: THREE.LinearMipMapLinearFilter
	};
	var WEBGL_WRAPPINGS = {
		33071: THREE.ClampToEdgeWrapping,
		33648: THREE.MirroredRepeatWrapping,
		10497: THREE.RepeatWrapping
	};
	var WEBGL_TEXTURE_FORMATS = {
		6406: THREE.AlphaFormat,
		6407: THREE.RGBFormat,
		6408: THREE.RGBAFormat,
		6409: THREE.LuminanceFormat,
		6410: THREE.LuminanceAlphaFormat
	};
	var WEBGL_TEXTURE_DATATYPES = {
		5121: THREE.UnsignedByteType,
		32819: THREE.UnsignedShort4444Type,
		32820: THREE.UnsignedShort5551Type,
		33635: THREE.UnsignedShort565Type
	};
	var WEBGL_SIDES = {
		1028: THREE.BackSide,  // Culling front
		1029: THREE.FrontSide  // Culling back
		//1032: THREE.NoSide   // Culling front and back, what to do?
	};
	var WEBGL_DEPTH_FUNCS = {
		512: THREE.NeverDepth,
		513: THREE.LessDepth,
		514: THREE.EqualDepth,
		515: THREE.LessEqualDepth,
		516: THREE.GreaterEqualDepth,
		517: THREE.NotEqualDepth,
		518: THREE.GreaterEqualDepth,
		519: THREE.AlwaysDepth
	};
	var WEBGL_BLEND_EQUATIONS = {
		32774: THREE.AddEquation,
		32778: THREE.SubtractEquation,
		32779: THREE.ReverseSubtractEquation
	};
	var WEBGL_BLEND_FUNCS = {
		0: THREE.ZeroFactor,
		1: THREE.OneFactor,
		768: THREE.SrcColorFactor,
		769: THREE.OneMinusSrcColorFactor,
		770: THREE.SrcAlphaFactor,
		771: THREE.OneMinusSrcAlphaFactor,
		772: THREE.DstAlphaFactor,
		773: THREE.OneMinusDstAlphaFactor,
		774: THREE.DstColorFactor,
		775: THREE.OneMinusDstColorFactor,
		776: THREE.SrcAlphaSaturateFactor
		// The followings are not supported by Three.js yet
		//32769: CONSTANT_COLOR,
		//32770: ONE_MINUS_CONSTANT_COLOR,
		//32771: CONSTANT_ALPHA,
		//32772: ONE_MINUS_CONSTANT_COLOR
	};
	var WEBGL_TYPE_SIZES = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16
	};
	var PATH_PROPERTIES = {
		scale: 'scale',
		translation: 'position',
		rotation: 'quaternion'
	};
	var INTERPOLATION = {
		LINEAR: THREE.InterpolateLinear,
		STEP: THREE.InterpolateDiscrete
	};
	var STATES_ENABLES = {
		2884: 'CULL_FACE',
		2929: 'DEPTH_TEST',
		3042: 'BLEND',
		3089: 'SCISSOR_TEST',
		32823: 'POLYGON_OFFSET_FILL',
		32926: 'SAMPLE_ALPHA_TO_COVERAGE'
	};

	/* UTILITY FUNCTIONS */
	function _each( object, callback, thisObj ) {
		if ( !object ) {
			return Promise.resolve();
		}
		var results;
		var fns = [];
		if ( Object.prototype.toString.call( object ) === '[object Array]' ) {
			results = [];
			var length = object.length;
			for ( var idx = 0; idx < length; idx ++ ) {
				var value = callback.call( thisObj || this, object[ idx ], idx );
				if ( value ) {
					fns.push( value );
					if ( value instanceof Promise ) {
						value.then( function( key, value ) {
							results[ key ] = value;
						}.bind( this, idx ));
					} else {
						results[ idx ] = value;
					}
				}
			}
		} else {
			results = {};
			for ( var key in object ) {
				if ( object.hasOwnProperty( key ) ) {
					var value = callback.call( thisObj || this, object[ key ], key );
					if ( value ) {
						fns.push( value );
						if ( value instanceof Promise ) {
							value.then( function( key, value ) {
								results[ key ] = value;
							}.bind( this, key ));
						} else {
							results[ key ] = value;
						}
					}
				}
			}
		}
		return Promise.all( fns ).then( function() {
			return results;
		});
	}
	function resolveURL( url, path ) {
		// Invalid URL
		if ( typeof url !== 'string' || url === '' )
			return '';
		// Absolute URL http://,https://,//
		if ( /^(https?:)?\/\//i.test( url ) ) {
			return url;
		}
		// Data URI
		if ( /^data:.*,.*$/i.test( url ) ) {
			return url;
		}
		// Relative URL
		return ( path || '' ) + url;
	}
	// Avoid the String.fromCharCode.apply(null, array) shortcut, which
	// throws a "maximum call stack size exceeded" error for large arrays.
	function convertUint8ArrayToString( array ) {
		var s = '';
		for ( var i = 0; i < array.length; i ++ ) {
			s += String.fromCharCode( array[ i ] );
		}
		return s;
	}
	// Three.js seems too dependent on attribute names so globally
	// replace those in the shader code
	function replaceTHREEShaderAttributes( shaderText, technique ) {
		// Expected technique attributes
		var attributes = {};
		for ( var attributeId in technique.attributes ) {
			var pname = technique.attributes[ attributeId ];
			var param = technique.parameters[ pname ];
			var atype = param.type;
			var semantic = param.semantic;
			attributes[ attributeId ] = {
				type: atype,
				semantic: semantic
			};
		}
		// Figure out which attributes to change in technique
		var shaderParams = technique.parameters;
		var shaderAttributes = technique.attributes;
		var params = {};
		for ( var attributeId in attributes ) {
			var pname = shaderAttributes[ attributeId ];
			var shaderParam = shaderParams[ pname ];
			var semantic = shaderParam.semantic;
			if ( semantic ) {
				params[ attributeId ] = shaderParam;
			}
		}
		for ( var pname in params ) {
			var param = params[ pname ];
			var semantic = param.semantic;
			var regEx = new RegExp( "\\b" + pname + "\\b", "g" );
			switch ( semantic ) {
				case "POSITION":
					shaderText = shaderText.replace( regEx, 'position' );
					break;
				case "NORMAL":
					shaderText = shaderText.replace( regEx, 'normal' );
					break;
				case 'TEXCOORD_0':
				case 'TEXCOORD0':
				case 'TEXCOORD':
					shaderText = shaderText.replace( regEx, 'uv' );
					break;
				case 'TEXCOORD_1':
					shaderText = shaderText.replace( regEx, 'uv2' );
					break;
				case 'COLOR_0':
				case 'COLOR0':
				case 'COLOR':
					shaderText = shaderText.replace( regEx, 'color' );
					break;
				case "WEIGHT":
					shaderText = shaderText.replace( regEx, 'skinWeight' );
					break;
				case "JOINT":
					shaderText = shaderText.replace( regEx, 'skinIndex' );
					break;
			}
		}
		return shaderText;
	}
	function createDefaultMaterial() {
		return new THREE.MeshPhongMaterial( {
			color: 0x00000,
			emissive: 0x888888,
			specular: 0x000000,
			shininess: 0,
			transparent: false,
			depthTest: true,
			side: THREE.FrontSide
		} );
	}
	// Deferred constructor for RawShaderMaterial types
	function DeferredShaderMaterial( params ) {
		this.isDeferredShaderMaterial = true;
		this.params = params;
	}
	DeferredShaderMaterial.prototype.create = function () {
		var uniforms = THREE.UniformsUtils.clone( this.params.uniforms );
		for ( var uniformId in this.params.uniforms ) {
			var originalUniform = this.params.uniforms[ uniformId ];
			if ( originalUniform.value instanceof THREE.Texture ) {
				uniforms[ uniformId ].value = originalUniform.value;
				uniforms[ uniformId ].value.needsUpdate = true;
			}
			uniforms[ uniformId ].semantic = originalUniform.semantic;
			uniforms[ uniformId ].node = originalUniform.node;
		}
		this.params.uniforms = uniforms;
		return new THREE.RawShaderMaterial( this.params );
	};

	/* GLTF PARSER */
	function GLTFParser( json, extensions, options ) {
		this.json = json || {};
		this.extensions = extensions || {};
		this.options = options || {};
		// loader object cache
		this.cache = new GLTFRegistry();
	}
	GLTFParser.prototype._withDependencies = function ( dependencies ) {
		var _dependencies = {};
		for ( var i = 0; i < dependencies.length; i ++ ) {
			var dependency = dependencies[ i ];
			var fnName = "load" + dependency.charAt( 0 ).toUpperCase() + dependency.slice( 1 );
			var cached = this.cache.get( dependency );
			if ( cached !== undefined ) {
				_dependencies[ dependency ] = cached;
			} else if ( this[ fnName ] ) {
				var fn = this[ fnName ]();
				this.cache.add( dependency, fn );
				_dependencies[ dependency ] = fn;
			}
		}
		return _each( _dependencies, function ( dependency ) {
			return dependency;
		} );
	};
	GLTFParser.prototype.parse = function ( callback ) {
		var json = this.json;
		// Clear the loader cache
		this.cache.removeAll();
		// Fire the callback on complete
		this._withDependencies( [
			"scenes",
			"cameras",
			"animations"
		] ).then( function ( dependencies ) {
			var scenes = [];
			for ( var name in dependencies.scenes ) {
				scenes.push( dependencies.scenes[ name ] );
			}
			var scene = json.scene !== undefined ? dependencies.scenes[ json.scene ] : scenes[ 0 ];
			var cameras = [];
			for ( var name in dependencies.cameras ) {
				var camera = dependencies.cameras[ name ];
				cameras.push( camera );
			}
			var animations = [];
			for ( var name in dependencies.animations ) {
				animations.push( dependencies.animations[ name ] );
			}
			callback( scene, scenes, cameras, animations );
		} );
	};
	GLTFParser.prototype.loadShaders = function () {
		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;
		return this._withDependencies( [
			"bufferViews"
		] ).then( function ( dependencies ) {
			return _each( json.shaders, function ( shader ) {
				if ( shader.extensions && shader.extensions[ EXTENSIONS.KHR_BINARY_GLTF ] ) {
					return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].loadShader( shader, dependencies.bufferViews );
				}
				return new Promise( function ( resolve ) {
					var loader = new THREE.FileLoader();
					loader.setResponseType( 'text' );
					loader.load( resolveURL( shader.uri, options.path ), function ( shaderText ) {
						resolve( shaderText );
					} );
				} );
			} );
		} );
	};
	GLTFParser.prototype.loadBuffers = function () {
		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;
		return _each( json.buffers, function ( buffer, name ) {
			if ( name === BINARY_EXTENSION_BUFFER_NAME ) {
				return extensions[ EXTENSIONS.KHR_BINARY_GLTF ].body;
			}
			if ( buffer.type === 'arraybuffer' || buffer.type === undefined ) {
				return new Promise( function ( resolve ) {
					var loader = new THREE.FileLoader();
					loader.setResponseType( 'arraybuffer' );
					loader.load( resolveURL( buffer.uri, options.path ), function ( buffer ) {
						resolve( buffer );
					} );
				} );
			} else {
				console.warn( 'THREE.GLTFLoader: ' + buffer.type + ' buffer type is not supported' );
			}
		} );
	};
	GLTFParser.prototype.loadBufferViews = function () {
		var json = this.json;
		return this._withDependencies( [
			"buffers"
		] ).then( function ( dependencies ) {
			return _each( json.bufferViews, function ( bufferView ) {
				var arraybuffer = dependencies.buffers[ bufferView.buffer ];
				var byteLength = bufferView.byteLength !== undefined ? bufferView.byteLength : 0;
				return arraybuffer.slice( bufferView.byteOffset, bufferView.byteOffset + byteLength );
			} );
		} );
	};
	GLTFParser.prototype.loadAccessors = function () {
		var json = this.json;
		return this._withDependencies( [
			"bufferViews"
		] ).then( function ( dependencies ) {
			return _each( json.accessors, function ( accessor ) {
				var arraybuffer = dependencies.bufferViews[ accessor.bufferView ];
				var itemSize = WEBGL_TYPE_SIZES[ accessor.type ];
				var TypedArray = WEBGL_COMPONENT_TYPES[ accessor.componentType ];
				// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
				var elementBytes = TypedArray.BYTES_PER_ELEMENT;
				var itemBytes = elementBytes * itemSize;
				// The buffer is not interleaved if the stride is the item size in bytes.
				if ( accessor.byteStride && accessor.byteStride !== itemBytes ) {
					// Use the full buffer if it's interleaved.
					var array = new TypedArray( arraybuffer );
					// Integer parameters to IB/IBA are in array elements, not bytes.
					var ib = new THREE.InterleavedBuffer( array, accessor.byteStride / elementBytes );
					return new THREE.InterleavedBufferAttribute( ib, itemSize, accessor.byteOffset / elementBytes );
				} else {
					array = new TypedArray( arraybuffer, accessor.byteOffset, accessor.count * itemSize );
					return new THREE.BufferAttribute( array, itemSize );
				}
			} );
		} );
	};
	GLTFParser.prototype.loadTextures = function () {
		var json = this.json;
		var extensions = this.extensions;
		var options = this.options;
		return this._withDependencies( [
			"bufferViews"
		] ).then( function ( dependencies ) {
			return _each( json.textures, function ( texture ) {
				if ( texture.source ) {
					return new Promise( function ( resolve ) {
						var source = json.images[ texture.source ];
						var sourceUri = source.uri;
						if ( source.extensions && source.extensions[ EXTENSIONS.KHR_BINARY_GLTF ] ) {
							sourceUri = extensions[ EXTENSIONS.KHR_BINARY_GLTF ].loadTextureSourceUri( source, dependencies.bufferViews );
						}
						var textureLoader = THREE.Loader.Handlers.get( sourceUri );
						if ( textureLoader === null ) {
							textureLoader = new THREE.TextureLoader();
						}
						textureLoader.setCrossOrigin( options.crossOrigin );
						textureLoader.load( resolveURL( sourceUri, options.path ), function ( _texture ) {
							_texture.flipY = false;
							if ( texture.name !== undefined ) _texture.name = texture.name;
							_texture.format = texture.format !== undefined ? WEBGL_TEXTURE_FORMATS[ texture.format ] : THREE.RGBAFormat;
							if ( texture.internalFormat !== undefined && _texture.format !== WEBGL_TEXTURE_FORMATS[ texture.internalFormat ] ) {
								console.warn( 'THREE.GLTFLoader: Three.js doesn\'t support texture internalFormat which is different from texture format. ' +
															'internalFormat will be forced to be the same value as format.' );
							}
							_texture.type = texture.type !== undefined ? WEBGL_TEXTURE_DATATYPES[ texture.type ] : THREE.UnsignedByteType;
							if ( texture.sampler ) {
								var sampler = json.samplers[ texture.sampler ];
								_texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || THREE.LinearFilter;
								_texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || THREE.NearestMipMapLinearFilter;
								_texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || THREE.RepeatWrapping;
								_texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || THREE.RepeatWrapping;
							}
							resolve( _texture );
						}, undefined, function () {
							resolve();
						} );
					} );
				}
			} );
		} );
	};
	GLTFParser.prototype.loadMaterials = function () {
		var json = this.json;
		return this._withDependencies( [
			"shaders",
			"textures"
		] ).then( function ( dependencies ) {
			return _each( json.materials, function ( material ) {
				var materialType;
				var materialValues = {};
				var materialParams = {};
				var khr_material;
				if ( material.extensions && material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ] ) {
					khr_material = material.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ];
				}
				if ( khr_material ) {
					// don't copy over unused values to avoid material warning spam
					var keys = [ 'ambient', 'emission', 'transparent', 'transparency', 'doubleSided' ];
					switch ( khr_material.technique ) {
						case 'BLINN' :
						case 'PHONG' :
							materialType = THREE.MeshPhongMaterial;
							keys.push( 'diffuse', 'specular', 'shininess' );
							break;
						case 'LAMBERT' :
							materialType = THREE.MeshLambertMaterial;
							keys.push( 'diffuse' );
							break;
						case 'CONSTANT' :
						default :
							materialType = THREE.MeshBasicMaterial;
							break;
					}
					keys.forEach( function( v ) {
						if ( khr_material.values[ v ] !== undefined ) materialValues[ v ] = khr_material.values[ v ];
					} );
					if ( khr_material.doubleSided || materialValues.doubleSided ) {
						materialParams.side = THREE.DoubleSide;
					}
					if ( khr_material.transparent || materialValues.transparent ) {
						materialParams.transparent = true;
						materialParams.opacity = ( materialValues.transparency !== undefined ) ? materialValues.transparency : 1;
					}
				} else if ( material.technique === undefined ) {
					materialType = THREE.MeshPhongMaterial;
					Object.assign( materialValues, material.values );
				} else {
					materialType = DeferredShaderMaterial;
					var technique = json.techniques[ material.technique ];
					materialParams.uniforms = {};
					var program = json.programs[ technique.program ];
					if ( program ) {
						materialParams.fragmentShader = dependencies.shaders[ program.fragmentShader ];
						if ( ! materialParams.fragmentShader ) {
							console.warn( "ERROR: Missing fragment shader definition:", program.fragmentShader );
							materialType = THREE.MeshPhongMaterial;
						}
						var vertexShader = dependencies.shaders[ program.vertexShader ];
						if ( ! vertexShader ) {
							console.warn( "ERROR: Missing vertex shader definition:", program.vertexShader );
							materialType = THREE.MeshPhongMaterial;
						}
						// IMPORTANT: FIX VERTEX SHADER ATTRIBUTE DEFINITIONS
						materialParams.vertexShader = replaceTHREEShaderAttributes( vertexShader, technique );
						var uniforms = technique.uniforms;
						for ( var uniformId in uniforms ) {
							var pname = uniforms[ uniformId ];
							var shaderParam = technique.parameters[ pname ];
							var ptype = shaderParam.type;
							if ( WEBGL_TYPE[ ptype ] ) {
								var pcount = shaderParam.count;
								var value;
								if ( material.values !== undefined ) value = material.values[ pname ];
								var uvalue = new WEBGL_TYPE[ ptype ]();
								var usemantic = shaderParam.semantic;
								var unode = shaderParam.node;
								switch ( ptype ) {
									case WEBGL_CONSTANTS.FLOAT:
										uvalue = shaderParam.value;
										if ( pname == "transparency" ) {
											materialParams.transparent = true;
										}
										if ( value !== undefined ) {
											uvalue = value;
										}
										break;
									case WEBGL_CONSTANTS.FLOAT_VEC2:
									case WEBGL_CONSTANTS.FLOAT_VEC3:
									case WEBGL_CONSTANTS.FLOAT_VEC4:
									case WEBGL_CONSTANTS.FLOAT_MAT3:
										if ( shaderParam && shaderParam.value ) {
											uvalue.fromArray( shaderParam.value );
										}
										if ( value ) {
											uvalue.fromArray( value );
										}
										break;
									case WEBGL_CONSTANTS.FLOAT_MAT2:
										// what to do?
										console.warn( "FLOAT_MAT2 is not a supported uniform type" );
										break;
									case WEBGL_CONSTANTS.FLOAT_MAT4:
										if ( pcount ) {
											uvalue = new Array( pcount );
											for ( var mi = 0; mi < pcount; mi ++ ) {
												uvalue[ mi ] = new WEBGL_TYPE[ ptype ]();
											}
											if ( shaderParam && shaderParam.value ) {
												var m4v = shaderParam.value;
												uvalue.fromArray( m4v );
											}
											if ( value ) {
												uvalue.fromArray( value );
											}
										} else {
											if ( shaderParam && shaderParam.value ) {
												var m4 = shaderParam.value;
												uvalue.fromArray( m4 );
											}
											if ( value ) {
												uvalue.fromArray( value );
											}
										}
										break;
									case WEBGL_CONSTANTS.SAMPLER_2D:
										if ( value !== undefined ) {
											uvalue = dependencies.textures[ value ];
										} else if ( shaderParam.value !== undefined ) {
											uvalue = dependencies.textures[ shaderParam.value ];
										} else {
											uvalue = null;
										}
										break;
								}
								materialParams.uniforms[ uniformId ] = {
									value: uvalue,
									semantic: usemantic,
									node: unode
								};
							} else {
								throw new Error( "Unknown shader uniform param type: " + ptype );
							}
						}
						var states = technique.states || {};
						var enables = states.enable || [];
						var functions = states.functions || {};
						var enableCullFace = false;
						var enableDepthTest = false;
						var enableBlend = false;
						for ( var i = 0, il = enables.length; i < il; i ++ ) {
							var enable = enables[ i ];
							switch ( STATES_ENABLES[ enable ] ) {
								case 'CULL_FACE':
									enableCullFace = true;
									break;
								case 'DEPTH_TEST':
									enableDepthTest = true;
									break;
								case 'BLEND':
									enableBlend = true;
									break;
								// TODO: implement
								case 'SCISSOR_TEST':
								case 'POLYGON_OFFSET_FILL':
								case 'SAMPLE_ALPHA_TO_COVERAGE':
									break;
								default:
									throw new Error( "Unknown technique.states.enable: " + enable );
							}
						}
						if ( enableCullFace ) {
							materialParams.side = functions.cullFace !== undefined ? WEBGL_SIDES[ functions.cullFace ] : THREE.FrontSide;
						} else {
							materialParams.side = THREE.DoubleSide;
						}
						materialParams.depthTest = enableDepthTest;
						materialParams.depthFunc = functions.depthFunc !== undefined ? WEBGL_DEPTH_FUNCS[ functions.depthFunc ] : THREE.LessDepth;
						materialParams.depthWrite = functions.depthMask !== undefined ? functions.depthMask[ 0 ] : true;
						materialParams.blending = enableBlend ? THREE.CustomBlending : THREE.NoBlending;
						materialParams.transparent = enableBlend;
						var blendEquationSeparate = functions.blendEquationSeparate;
						if ( blendEquationSeparate !== undefined ) {
							materialParams.blendEquation = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 0 ] ];
							materialParams.blendEquationAlpha = WEBGL_BLEND_EQUATIONS[ blendEquationSeparate[ 1 ] ];
						} else {
							materialParams.blendEquation = THREE.AddEquation;
							materialParams.blendEquationAlpha = THREE.AddEquation;
						}
						var blendFuncSeparate = functions.blendFuncSeparate;
						if ( blendFuncSeparate !== undefined ) {
							materialParams.blendSrc = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 0 ] ];
							materialParams.blendDst = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 1 ] ];
							materialParams.blendSrcAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 2 ] ];
							materialParams.blendDstAlpha = WEBGL_BLEND_FUNCS[ blendFuncSeparate[ 3 ] ];
						} else {
							materialParams.blendSrc = THREE.OneFactor;
							materialParams.blendDst = THREE.ZeroFactor;
							materialParams.blendSrcAlpha = THREE.OneFactor;
							materialParams.blendDstAlpha = THREE.ZeroFactor;
						}
					}
				}
				if ( Array.isArray( materialValues.diffuse ) ) {
					materialParams.color = new THREE.Color().fromArray( materialValues.diffuse );
				} else if ( typeof( materialValues.diffuse ) === 'string' ) {
					materialParams.map = dependencies.textures[ materialValues.diffuse ];
				}
				delete materialParams.diffuse;
				if ( typeof( materialValues.reflective ) === 'string' ) {
					materialParams.envMap = dependencies.textures[ materialValues.reflective ];
				}
				if ( typeof( materialValues.bump ) === 'string' ) {
					materialParams.bumpMap = dependencies.textures[ materialValues.bump ];
				}
				if ( Array.isArray( materialValues.emission ) ) {
					if ( materialType === THREE.MeshBasicMaterial ) {
						materialParams.color = new THREE.Color().fromArray( materialValues.emission );
					} else {
						materialParams.emissive = new THREE.Color().fromArray( materialValues.emission );
					}
				} else if ( typeof( materialValues.emission ) === 'string' ) {
					if ( materialType === THREE.MeshBasicMaterial ) {
						materialParams.map = dependencies.textures[ materialValues.emission ];
					} else {
						materialParams.emissiveMap = dependencies.textures[ materialValues.emission ];
					}
				}
				if ( Array.isArray( materialValues.specular ) ) {
					materialParams.specular = new THREE.Color().fromArray( materialValues.specular );
				} else if ( typeof( materialValues.specular ) === 'string' ) {
					materialParams.specularMap = dependencies.textures[ materialValues.specular ];
				}
				if ( materialValues.shininess !== undefined ) {
					materialParams.shininess = materialValues.shininess;
				}
				var _material = new materialType( materialParams );
				if ( material.name !== undefined ) _material.name = material.name;
				return _material;
			} );
		} );
	};
	GLTFParser.prototype.loadMeshes = function () {
		var json = this.json;
		return this._withDependencies( [
			"accessors",
			"materials"
		] ).then( function ( dependencies ) {
			return _each( json.meshes, function ( mesh ) {
				var group = new THREE.Group();
				if ( mesh.name !== undefined ) group.name = mesh.name;
				if ( mesh.extras ) group.userData = mesh.extras;
				var primitives = mesh.primitives || [];
				for ( var name in primitives ) {
					var primitive = primitives[ name ];
					if ( primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === undefined ) {
						var geometry = new THREE.BufferGeometry();
						var attributes = primitive.attributes;
						for ( var attributeId in attributes ) {
							var attributeEntry = attributes[ attributeId ];
							if ( ! attributeEntry ) return;
							var bufferAttribute = dependencies.accessors[ attributeEntry ];
							switch ( attributeId ) {
								case 'POSITION':
									geometry.addAttribute( 'position', bufferAttribute );
									break;
								case 'NORMAL':
									geometry.addAttribute( 'normal', bufferAttribute );
									break;
								case 'TEXCOORD_0':
								case 'TEXCOORD0':
								case 'TEXCOORD':
									geometry.addAttribute( 'uv', bufferAttribute );
									break;
								case 'TEXCOORD_1':
									geometry.addAttribute( 'uv2', bufferAttribute );
									break;
								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':
									geometry.addAttribute( 'color', bufferAttribute );
									break;
								case 'WEIGHT':
									geometry.addAttribute( 'skinWeight', bufferAttribute );
									break;
								case 'JOINT':
									geometry.addAttribute( 'skinIndex', bufferAttribute );
									break;
							}
						}
						if ( primitive.indices ) {
							geometry.setIndex( dependencies.accessors[ primitive.indices ] );
						}
						var material = dependencies.materials !== undefined ? dependencies.materials[ primitive.material ] : createDefaultMaterial();
						var meshNode = new THREE.Mesh( geometry, material );
						meshNode.castShadow = true;
						meshNode.name = ( name === "0" ? group.name : group.name + name );
						if ( primitive.extras ) meshNode.userData = primitive.extras;
						group.add( meshNode );
					} else if ( primitive.mode === WEBGL_CONSTANTS.LINES ) {
						var geometry = new THREE.BufferGeometry();
						var attributes = primitive.attributes;
						for ( var attributeId in attributes ) {
							var attributeEntry = attributes[ attributeId ];
							if ( ! attributeEntry ) return;
							var bufferAttribute = dependencies.accessors[ attributeEntry ];
							switch ( attributeId ) {
								case 'POSITION':
									geometry.addAttribute( 'position', bufferAttribute );
									break;
								case 'COLOR_0':
								case 'COLOR0':
								case 'COLOR':
									geometry.addAttribute( 'color', bufferAttribute );
									break;
							}
						}
						var material = dependencies.materials[ primitive.material ];
						var meshNode;
						if ( primitive.indices ) {
							geometry.setIndex( dependencies.accessors[ primitive.indices ] );
							meshNode = new THREE.LineSegments( geometry, material );
						} else {
							meshNode = new THREE.Line( geometry, material );
						}
						meshNode.name = ( name === "0" ? group.name : group.name + name );
						if ( primitive.extras ) meshNode.userData = primitive.extras;
						group.add( meshNode );
					} else {
						console.warn( "Only triangular and line primitives are supported" );
					}
				}
				return group;
			} );
		} );
	};
	GLTFParser.prototype.loadCameras = function () {
		var json = this.json;
		return _each( json.cameras, function ( camera ) {
			if ( camera.type == "perspective" && camera.perspective ) {
				var yfov = camera.perspective.yfov;
				var aspectRatio = camera.perspective.aspectRatio !== undefined ? camera.perspective.aspectRatio : 1;
				// According to COLLADA spec...
				// aspectRatio = xfov / yfov
				var xfov = yfov * aspectRatio;
				var _camera = new THREE.PerspectiveCamera( THREE.Math.radToDeg( xfov ), aspectRatio, camera.perspective.znear || 1, camera.perspective.zfar || 2e6 );
				if ( camera.name !== undefined ) _camera.name = camera.name;
				if ( camera.extras ) _camera.userData = camera.extras;
				return _camera;
			} else if ( camera.type == "orthographic" && camera.orthographic ) {
				var _camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, camera.orthographic.znear, camera.orthographic.zfar );
				if ( camera.name !== undefined ) _camera.name = camera.name;
				if ( camera.extras ) _camera.userData = camera.extras;
				return _camera;
			}
		} );
	};
	GLTFParser.prototype.loadSkins = function () {
		var json = this.json;
		return this._withDependencies( [
			"accessors"
		] ).then( function ( dependencies ) {
			return _each( json.skins, function ( skin ) {
				var bindShapeMatrix = new THREE.Matrix4();
				if ( skin.bindShapeMatrix !== undefined ) bindShapeMatrix.fromArray( skin.bindShapeMatrix );
				var _skin = {
					bindShapeMatrix: bindShapeMatrix,
					jointNames: skin.jointNames,
					inverseBindMatrices: dependencies.accessors[ skin.inverseBindMatrices ]
				};
				return _skin;
			} );
		} );
	};
	GLTFParser.prototype.loadAnimations = function () {
		var json = this.json;
		return this._withDependencies( [
			"accessors",
			"nodes"
		] ).then( function ( dependencies ) {
			return _each( json.animations, function ( animation, animationId ) {
				var tracks = [];
				for ( var channelId in animation.channels ) {
					var channel = animation.channels[ channelId ];
					var sampler = animation.samplers[ channel.sampler ];
					if ( sampler ) {
						var target = channel.target;
						var name = target.id;
						var input = animation.parameters !== undefined ? animation.parameters[ sampler.input ] : sampler.input;
						var output = animation.parameters !== undefined ? animation.parameters[ sampler.output ] : sampler.output;
						var inputAccessor = dependencies.accessors[ input ];
						var outputAccessor = dependencies.accessors[ output ];
						var node = dependencies.nodes[ name ];
						if ( node ) {
							node.updateMatrix();
							node.matrixAutoUpdate = true;
							var TypedKeyframeTrack = PATH_PROPERTIES[ target.path ] === PATH_PROPERTIES.rotation
								? THREE.QuaternionKeyframeTrack
								: THREE.VectorKeyframeTrack;
							var targetName = node.name ? node.name : node.uuid;
							var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[ sampler.interpolation ] : THREE.InterpolateLinear;
							// KeyframeTrack.optimize() will modify given 'times' and 'values'
							// buffers before creating a truncated copy to keep. Because buffers may
							// be reused by other tracks, make copies here.
							tracks.push( new TypedKeyframeTrack(
								targetName + '.' + PATH_PROPERTIES[ target.path ],
								THREE.AnimationUtils.arraySlice( inputAccessor.array, 0 ),
								THREE.AnimationUtils.arraySlice( outputAccessor.array, 0 ),
								interpolation
							) );
						}
					}
				}
				var name = animation.name !== undefined ? animation.name : "animation_" + animationId;
				return new THREE.AnimationClip( name, undefined, tracks );
			} );
		} );
	};
	GLTFParser.prototype.loadNodes = function () {
		var json = this.json;
		var extensions = this.extensions;
		var scope = this;
		return _each( json.nodes, function ( node ) {
			var matrix = new THREE.Matrix4();
			var _node;
			if ( node.jointName ) {
				_node = new THREE.Bone();
				_node.name = node.name !== undefined ? node.name : node.jointName;
				_node.jointName = node.jointName;
			} else {
				_node = new THREE.Object3D();
				if ( node.name !== undefined ) _node.name = node.name;
			}
			if ( node.extras ) _node.userData = node.extras;
			if ( node.matrix !== undefined ) {
				matrix.fromArray( node.matrix );
				_node.applyMatrix( matrix );
			} else {
				if ( node.translation !== undefined ) {
					_node.position.fromArray( node.translation );
				}
				if ( node.rotation !== undefined ) {
					_node.quaternion.fromArray( node.rotation );
				}
				if ( node.scale !== undefined ) {
					_node.scale.fromArray( node.scale );
				}
			}
			return _node;
		} ).then( function ( __nodes ) {
			return scope._withDependencies( [
				"meshes",
				"skins",
				"cameras"
			] ).then( function ( dependencies ) {
				return _each( __nodes, function ( _node, nodeId ) {
					var node = json.nodes[ nodeId ];
					if ( node.meshes !== undefined ) {
						for ( var meshId in node.meshes ) {
							var mesh = node.meshes[ meshId ];
							var group = dependencies.meshes[ mesh ];
							if ( group === undefined ) {
								console.warn( 'GLTFLoader: Couldn\'t find node "' + mesh + '".' );
								continue;
							}
							for ( var childrenId in group.children ) {
								var child = group.children[ childrenId ];
								// clone Mesh to add to _node
								var originalMaterial = child.material;
								var originalGeometry = child.geometry;
								var originalUserData = child.userData;
								var originalName = child.name;
								var material;
								if ( originalMaterial.isDeferredShaderMaterial ) {
									originalMaterial = material = originalMaterial.create();
								} else {
									material = originalMaterial;
								}
								switch ( child.type ) {
									case 'LineSegments':
										child = new THREE.LineSegments( originalGeometry, material );
										break;
									case 'LineLoop':
										child = new THREE.LineLoop( originalGeometry, material );
										break;
									case 'Line':
										child = new THREE.Line( originalGeometry, material );
										break;
									default:
										child = new THREE.Mesh( originalGeometry, material );
								}
								child.castShadow = true;
								child.userData = originalUserData;
								child.name = originalName;
								var skinEntry;
								if ( node.skin ) {
									skinEntry = dependencies.skins[ node.skin ];
								}
								// Replace Mesh with SkinnedMesh in library
								if ( skinEntry ) {
									var getJointNode = function ( jointId ) {
										var keys = Object.keys( __nodes );
										for ( var i = 0, il = keys.length; i < il; i ++ ) {
											var n = __nodes[ keys[ i ] ];
											if ( n.jointName === jointId ) return n;
										}
										return null;
									};
									var geometry = originalGeometry;
									var material = originalMaterial;
									material.skinning = true;
									child = new THREE.SkinnedMesh( geometry, material, false );
									child.castShadow = true;
									child.userData = originalUserData;
									child.name = originalName;
									var bones = [];
									var boneInverses = [];
									for ( var i = 0, l = skinEntry.jointNames.length; i < l; i ++ ) {
										var jointId = skinEntry.jointNames[ i ];
										var jointNode = getJointNode( jointId );
										if ( jointNode ) {
											bones.push( jointNode );
											var m = skinEntry.inverseBindMatrices.array;
											var mat = new THREE.Matrix4().fromArray( m, i * 16 );
											boneInverses.push( mat );
										} else {
											console.warn( "WARNING: joint: '" + jointId + "' could not be found" );
										}
									}
									child.bind( new THREE.Skeleton( bones, boneInverses, false ), skinEntry.bindShapeMatrix );
									var buildBoneGraph = function ( parentJson, parentObject, property ) {
										var children = parentJson[ property ];
										if ( children === undefined ) return;
										for ( var i = 0, il = children.length; i < il; i ++ ) {
											var nodeId = children[ i ];
											var bone = __nodes[ nodeId ];
											var boneJson = json.nodes[ nodeId ];
											if ( bone !== undefined && bone.isBone === true && boneJson !== undefined ) {
												parentObject.add( bone );
												buildBoneGraph( boneJson, bone, 'children' );
											}
										}
									};
									buildBoneGraph( node, child, 'skeletons' );
								}
								_node.add( child );
							}
						}
					}
					if ( node.camera !== undefined ) {
						var camera = dependencies.cameras[ node.camera ];
						_node.add( camera );
					}
					if ( node.extensions
							 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ]
							 && node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ) {
						var extensionLights = extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].lights;
						var light = extensionLights[ node.extensions[ EXTENSIONS.KHR_MATERIALS_COMMON ].light ];
						_node.add( light );
					}
					return _node;
				} );
			} );
		} );
	};
	GLTFParser.prototype.loadScenes = function () {
		var json = this.json;
		// scene node hierachy builder
		function buildNodeHierachy( nodeId, parentObject, allNodes ) {
			var _node = allNodes[ nodeId ];
			parentObject.add( _node );
			var node = json.nodes[ nodeId ];
			if ( node.children ) {
				var children = node.children;
				for ( var i = 0, l = children.length; i < l; i ++ ) {
					var child = children[ i ];
					buildNodeHierachy( child, _node, allNodes );
				}
			}
		}
		return this._withDependencies( [
			"nodes"
		] ).then( function ( dependencies ) {
			return _each( json.scenes, function ( scene ) {
				var _scene = new THREE.Scene();
				if ( scene.name !== undefined ) _scene.name = scene.name;
				if ( scene.extras ) _scene.userData = scene.extras;
				var nodes = scene.nodes || [];
				for ( var i = 0, l = nodes.length; i < l; i ++ ) {
					var nodeId = nodes[ i ];
					buildNodeHierachy( nodeId, _scene, dependencies.nodes );
				}
				_scene.traverse( function ( child ) {
					// Register raw material meshes with GLTFLoader.Shaders
					if ( child.material && child.material.isRawShaderMaterial ) {
						child.gltfShader = new GLTFShader( child, dependencies.nodes );
						child.onBeforeRender = function(renderer, scene, camera){
							this.gltfShader.update(scene, camera);
						};
					}
				} );
				return _scene;
			} );
		} );
	};
	return GLTFLoader;
} )();
// File: utils/JSONParser.js
﻿"use strict";

var JSONParser = function(scene)
{
}

JSONParser.prototype.constructor = JSONParser;

	/**
	 * Load X3D JSON into an element.
	 * jsobj - the JavaScript object to convert to DOM.
	 */
JSONParser.prototype.parseJavaScript = function(jsobj) {
		var child = this.CreateElement('scene');
		this.ConvertToX3DOM(jsobj, "", child);
		// console.log(jsobj, child);
		return child;
	};

	// 'http://www.web3d.org/specifications/x3d-namespace'

	// Load X3D JavaScript object into XML or DOM

	/**
	 * Yet another way to set an attribute on an element.  does not allow you to
	 * set JSON schema or encoding.
	 */
JSONParser.prototype.elementSetAttribute = function(element, key, value) {
		if (key === 'SON schema') {
			// JSON Schema
		} else if (key === 'ncoding') {
			// encoding, UTF-8, UTF-16 or UTF-32
		} else {
			if (typeof element.setAttribute === 'function') {
				element.setAttribute(key, value);
			}
		}
	};

	/**
	 * converts children of object to DOM.
	 */
JSONParser.prototype.ConvertChildren = function(parentkey, object, element) {
		var key;

		for (key in object) {
			if (typeof object[key] === 'object') {
				if (isNaN(parseInt(key))) {
					this.ConvertObject(key, object, element, parentkey.substr(1));
				} else {
					this.ConvertToX3DOM(object[key], key, element, parentkey.substr(1));
				}
			}
		}
	};

	/**
	 * a method to create and element with tagnam key to DOM in a namespace.  If
	 * containerField is set, then the containerField is set in the elemetn.
	 */
JSONParser.prototype.CreateElement = function(key, containerField) {
		var child = document.createElement(key);
		if (typeof containerField !== 'undefined') {
			this.elementSetAttribute(child, 'containerField', containerField);
		}
		return child;
	};

	/**
	 * a way to create a CDATA function or script in HTML, by using a DOM parser.
	 */
JSONParser.prototype.CDATACreateFunction = function(document, element, str) {
		var y = str.replace(/\\"/g, "\\\"")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&");
		do {
			str = y;
			y = str.replace(/'([^'\r\n]*)\n([^']*)'/g, "'$1\\n$2'");
			if (str !== y) {
				console.log("CDATA Replacing",str,"with",y);
			}
		} while (y != str);
		var domParser = new DOMParser();
		var cdataStr = '<script> <![CDATA[ ' + y + ' ]]> </script>'; // has to be wrapped into an element
		var scriptDoc = domParser .parseFromString (cdataStr, 'application/xml');
		var cdata = scriptDoc .children[0] .childNodes[1]; // space after script is childNode[0]
		element .appendChild(cdata);
	};

	/**
	 * convert the object at object[key] to DOM.
	 */
JSONParser.prototype.ConvertObject = function(key, object, element, containerField) {
		var child;
		if (object !== null && typeof object[key] === 'object') {
			if (key.substr(0,1) === '@') {
				this.ConvertToX3DOM(object[key], key, element);
			} else if (key.substr(0,1) === '-') {
				this.ConvertChildren(key, object[key], element);
			} else if (key === '#comment') {
				for (var c in object[key]) {
					child = document.createComment(this.CommentStringToXML(object[key][c]));
					element.appendChild(child);
				}
			} else if (key === '#text') {
				child = document.createTextNode(object[key].join(""));
				element.appendChild(child);
			} else if (key === '#sourceText') {
				this.CDATACreateFunction(document, element, object[key].join("\r\n")+"\r\n");
			} else {
				if (key === 'connect' || key === 'fieldValue' || key === 'field' || key === 'meta' || key === 'component') {
					for (var childkey in object[key]) {  // for each field
						if (typeof object[key][childkey] === 'object') {
							child = this.CreateElement(key, containerField);
							this.ConvertToX3DOM(object[key][childkey], childkey, child);
							element.appendChild(child);
							element.appendChild(document.createTextNode("\n"));
						}
					}
				} else {
					child = this.CreateElement(key, containerField);
					this.ConvertToX3DOM(object[key], key, child);
					element.appendChild(child);
					element.appendChild(document.createTextNode("\n"));
				}
			}
		}
	};

	/**
	 * convert a comment string in JavaScript to XML.  Pass the string
	 */
JSONParser.prototype.CommentStringToXML = function(str) {
		var y = str;
		str = str.replace(/\\\\/g, '\\');
		if (y !== str) {
			console.log("X3DJSONLD <!-> replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * convert an SFString to XML.
	 */
JSONParser.prototype.SFStringToXML = function(str) {
		var y = str;
		/*
		str = (""+str).replace(/\\\\/g, '\\\\');
		str = str.replace(/\\\\\\\\/g, '\\\\');
		str = str.replace(/(\\+)"/g, '\\"');
		*/
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/"/g, '\\\"');
		if (y !== str) {
			console.log("X3DJSONLD [] replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * convert a JSON String to XML.
	 */
JSONParser.prototype.JSONStringToXML = function(str) {
		var y = str;
		str = str.replace(/\\/g, '\\\\');
		str = str.replace(/\n/g, '\\n');
		if (y !== str) {
			console.log("X3DJSONLD replacing", y, "with", str);
		}
		return str;
	};

	/**
	 * main routine for converting a JavaScript object to DOM.
	 * object is the object to convert.
	 * parentkey is the key of the object in the parent.
	 * element is the parent element.
	 * containerField is a possible containerField.
	 */
JSONParser.prototype.ConvertToX3DOM = function(object, parentkey, element, containerField) {
		var key;
		var localArray = [];
		var isArray = false;
		var arrayOfStrings = false;
		for (key in object) {
			if (isNaN(parseInt(key))) {
				isArray = false;
			} else {
				isArray = true;
			}
			if (isArray) {
				if (typeof object[key] === 'number') {
					localArray.push(object[key]);
				} else if (typeof object[key] === 'string') {
					localArray.push(object[key]);
					arrayOfStrings = true;
				} else if (typeof object[key] === 'boolean') {
					localArray.push(object[key]);
				} else if (typeof object[key] === 'object') {
					/*
					if (object[key] != null && typeof object[key].join === 'function') {
						localArray.push(object[key].join(" "));
					}
					*/
					this.ConvertToX3DOM(object[key], key, element);
				} else if (typeof object[key] === 'undefined') {
				} else {
					console.error("Unknown type found in array "+typeof object[key]);
				}
			} else if (typeof object[key] === 'object') {
				// This is where the whole thing starts
				if (key === 'scene') {
					this.ConvertToX3DOM(object[key], key, element);
				} else {
					this.ConvertObject(key, object, element);
				}
			} else if (typeof object[key] === 'number') {
				this.elementSetAttribute(element, key.substr(1),object[key]);
			} else if (typeof object[key] === 'string') {
				if (key === '#comment') {
					var child = document.createComment(this.CommentStringToXML(object[key]));
					element.appendChild(child);
				} else if (key === '#text') {
					var child = document.createTextNode(object[key]);
					element.appendChild(child);
				} else {
					// ordinary string attributes
					this.elementSetAttribute(element, key.substr(1), this.JSONStringToXML(object[key]));
				}
			} else if (typeof object[key] === 'boolean') {
				this.elementSetAttribute(element, key.substr(1),object[key]);
			} else if (typeof object[key] === 'undefined') {
			} else {
				console.error("Unknown type found in object "+typeof object[key]);
				console.error(object);
			}
		}
		if (isArray) {
			if (parentkey.substr(0,1) === '@') {
				if (arrayOfStrings) {
					arrayOfStrings = false;
					for (var str in localArray) {
						localArray[str] = this.SFStringToXML(localArray[str]);
					}
					this.elementSetAttribute(element, parentkey.substr(1),'"'+localArray.join('" "')+'"');
				} else {
					// if non string array
					this.elementSetAttribute(element, parentkey.substr(1),localArray.join(" "));
				}
			}
			isArray = false;
		}
		return element;
	};
// File: utils/LoadManager.js
/*
 * For use with XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * Licensed under MIT or GNU in the same manner as XSeen
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * 
 */

/*
 *	Manages all download requests.
 *	Requests are queued up and processed to the maximum limit (.MaxRequests)
 *	Use this for processing text (X3D, XML, JSON, HTML) files. 
 *	Not really setup for binary files (.jpg, png, etc.)
 *
 *	Requires jQuery -- should work on removing that...
 *
 */

function LoadManager () {
	this.urlQueue = [];
	this.urlNext = -1;
	this.MaxRequests = 3;
	this.totalRequests = 0;
	this.totalResponses = 0;
	this.requestCount = 0;
	var lmThat = this;

	this.load = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadText = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'text', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadHtml = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'html', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadXml = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'xml', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadJson = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'json', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadImage = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'image', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.success = function (response, string, xhr) {
		if (typeof(xhr._loadManager.success) !== undefined) {
			xhr._loadManager.success (response, xhr._loadManager.userdata, xhr);
		}
	}

	this.failure = function (xhr, errorCode, errorText) {
		if (typeof(xhr._loadManager.failure) !== undefined) {
			xhr._loadManager.failure (xhr, xhr._loadManager.userdata, errorCode, errorText);
		}
	}

	this.requestComplete = function (event, xhr, settings) {
		lmThat.requestCount --;
		lmThat.totalResponses++;
		lmThat.loadNextUrl();
	}

	this.loadNextUrl = function () {
		if (this.requestCount >= this.MaxRequests) {return; }
		if (this.urlNext >= this.urlQueue.length || this.urlNext < 0) {
			this.urlNext = -1;
			for (var i=0; i<this.urlQueue.length; i++) {
				if (this.urlQueue[i] !== null) {
					this.urlNext = i;
					break;
				}
			}
			if (this.urlNext < 0) {
				this.urlQueue = [];
				return;
			}
		}

		this.requestCount ++;
		var details = this.urlQueue[this.urlNext];
		var settings = {
						'url'		: details.url,
						'dataType'	: details.type,
						'complete'	: this.requestComplete,
						'success'	: this.success,
						'error'		: this.failure
						};
		if (settings.dataType == 'json') {
			settings['beforeSend'] = function(xhr){xhr.overrideMimeType("application/json");};
		}
		this.urlQueue[this.urlNext] = null;
		this.urlNext ++;
		var x = jQuery.get(settings);		// Need to change this... Has impact throughout class
		x._loadManager = {'userdata': details.userdata, 'requestType':details.type, 'success':details.success, 'failure':details.failure};
		this.totalRequests++;
	}
}
// File: utils/OBJLoader2.js
/**
  * @author Kai Salmen / https://kaisalmen.de
  * Development repository: https://github.com/kaisalmen/WWOBJLoader
  */

'use strict';

if ( THREE.OBJLoader2 === undefined ) { THREE.OBJLoader2 = {} }

/**
 * Use this class to load OBJ data from files or to parse OBJ data from arraybuffer or text
 * @class
 *
 * @param {THREE.DefaultLoadingManager} [manager] The loadingManager for the loader to use. Default is {@link THREE.DefaultLoadingManager}
 */
THREE.OBJLoader2 = (function () {

	var OBJLOADER2_VERSION = '1.2.1';

	function OBJLoader2( manager ) {
		console.log( "Using THREE.OBJLoader2 version: " + OBJLOADER2_VERSION );
		this.manager = Validator.verifyInput( manager, THREE.DefaultLoadingManager );

		this.path = '';
		this.fileLoader = new THREE.FileLoader( this.manager );

		this.meshCreator = new MeshCreator();
		this.parser = new Parser( this.meshCreator );

		this.validated = false;
	}

	/**
	 * Base path to use.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} path The basepath
	 */
	OBJLoader2.prototype.setPath = function ( path ) {
		this.path = Validator.verifyInput( path, this.path );
	};

	/**
	 * Set the node where the loaded objects will be attached.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.Object3D} sceneGraphBaseNode Scenegraph object where meshes will be attached
	 */
	OBJLoader2.prototype.setSceneGraphBaseNode = function ( sceneGraphBaseNode ) {
		this.meshCreator.setSceneGraphBaseNode( sceneGraphBaseNode );
	};

	/**
	 * Set materials loaded by MTLLoader or any other supplier of an Array of {@link THREE.Material}.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {THREE.Material[]} materials  Array of {@link THREE.Material} from MTLLoader
	 */
	OBJLoader2.prototype.setMaterials = function ( materials ) {
		this.meshCreator.setMaterials( materials );
	};

	/**
	 * Allows to set debug mode for the parser and the meshCreator.
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {boolean} parserDebug Internal Parser will produce debug output
	 * @param {boolean} meshCreatorDebug Internal MeshCreator will produce debug output
	 */
	OBJLoader2.prototype.setDebug = function ( parserDebug, meshCreatorDebug ) {
		this.parser.setDebug( parserDebug );
		this.meshCreator.setDebug( meshCreatorDebug );
	};

	/**
	 * Use this convenient method to load an OBJ file at the given URL. Per default the fileLoader uses an arraybuffer
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} url URL of the file to load
	 * @param {callback} onLoad Called after loading was successfully completed
	 * @param {callback} onProgress Called to report progress of loading. The argument will be the XmlHttpRequest instance, that contain {integer total} and {integer loaded} bytes.
	 * @param {callback} onError Called after an error occurred during loading
	 * @param {boolean} [useArrayBuffer=true] Set this to false to force string based parsing
	 */
	OBJLoader2.prototype.load = function ( url, onLoad, onProgress, onError, useArrayBuffer ) {
		this._validate();
		this.fileLoader.setPath( this.path );
		this.fileLoader.setResponseType( useArrayBuffer !== false ? 'arraybuffer' : 'text' );

		var scope = this;
		scope.fileLoader.load( url, function ( content ) {

			// only use parseText if useArrayBuffer is explicitly set to false
			onLoad( useArrayBuffer !== false ? scope.parse( content ) : scope.parseText( content ) );

		}, onProgress, onError );
	};

	/**
	 * Default parse function: Parses OBJ file content stored in arrayBuffer and returns the sceneGraphBaseNode
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
	 */
	OBJLoader2.prototype.parse = function ( arrayBuffer ) {
		// fast-fail on bad type
		if ( ! ( arrayBuffer instanceof ArrayBuffer || arrayBuffer instanceof Uint8Array ) ) {

			throw 'Provided input is not of type arraybuffer! Aborting...';

		}
		console.log( 'Parsing arrayBuffer...' );
		console.time( 'parseArrayBuffer' );

		this._validate();
		this.parser.parseArrayBuffer( arrayBuffer );
		var sceneGraphAttach = this._finalize();

		console.timeEnd( 'parseArrayBuffer' );

		return sceneGraphAttach;
	};

	/**
	 * Legacy parse function: Parses OBJ file content stored in string and returns the sceneGraphBaseNode
	 * @memberOf THREE.OBJLoader2
	 *
	 * @param {string} text OBJ data as string
	 */
	OBJLoader2.prototype.parseText = function ( text ) {
		// fast-fail on bad type
		if ( ! ( typeof( text ) === 'string' || text instanceof String ) ) {

			throw 'Provided input is not of type String! Aborting...';

		}
		console.log( 'Parsing text...' );
		console.time( 'parseText' );

		this._validate();
		this.parser.parseText( text );
		var sceneGraphBaseNode = this._finalize();

		console.timeEnd( 'parseText' );

		return sceneGraphBaseNode;
	};

	OBJLoader2.prototype._validate = function () {
		if ( this.validated ) return;

		this.fileLoader = Validator.verifyInput( this.fileLoader, new THREE.FileLoader( this.manager ) );
		this.parser.validate();
		this.meshCreator.validate();

		this.validated = true;
	};

	OBJLoader2.prototype._finalize = function () {
		console.log( 'Global output object count: ' + this.meshCreator.globalObjectCount );

		this.parser.finalize();
		this.fileLoader = null;
		var sceneGraphBaseNode = this.meshCreator.sceneGraphBaseNode;
		this.meshCreator.finalize();
		this.validated = false;

		return sceneGraphBaseNode;
	};

	/**
	 * Constants used by THREE.OBJLoader2
	 */
	var Consts = {
		CODE_LF: 10,
		CODE_CR: 13,
		CODE_SPACE: 32,
		CODE_SLASH: 47,
		STRING_LF: '\n',
		STRING_CR: '\r',
		STRING_SPACE: ' ',
		STRING_SLASH: '/',
		LINE_F: 'f',
		LINE_G: 'g',
		LINE_L: 'l',
		LINE_O: 'o',
		LINE_S: 's',
		LINE_V: 'v',
		LINE_VT: 'vt',
		LINE_VN: 'vn',
		LINE_MTLLIB: 'mtllib',
		LINE_USEMTL: 'usemtl',
		/*
		 * Build Face/Quad: first element in indexArray is the line identification, therefore offset of one needs to be taken into account
		 * N-Gons are not supported
		 * Quad Faces: FaceA: 0, 1, 2  FaceB: 2, 3, 0
		 *
		 * 0: "f vertex/uv/normal	vertex/uv/normal	vertex/uv/normal	(vertex/uv/normal)"
		 * 1: "f vertex/uv		  	vertex/uv		   	vertex/uv		   	(vertex/uv		 )"
		 * 2: "f vertex//normal	 	vertex//normal	  	vertex//normal	  	(vertex//normal  )"
		 * 3: "f vertex			 	vertex			  	vertex			  	(vertex		  	 )"
		 *
		 * @param indexArray
		 * @param faceType
		 */
		QUAD_INDICES_1: [ 1, 2, 3, 3, 4, 1 ],
		QUAD_INDICES_2: [ 1, 3, 5, 5, 7, 1 ],
		QUAD_INDICES_3: [ 1, 4, 7, 7, 10, 1 ]
	};

	var Validator = {
		/**
		 * If given input is null or undefined, false is returned otherwise true.
		 *
		 * @param input Anything
		 * @returns {boolean}
		 */
		isValid: function( input ) {
			return ( input !== null && input !== undefined );
		},
		/**
		 * If given input is null or undefined, the defaultValue is returned otherwise the given input.
		 *
		 * @param input Anything
		 * @param defaultValue Anything
		 * @returns {*}
		 */
		verifyInput: function( input, defaultValue ) {
			return ( input === null || input === undefined ) ? defaultValue : input;
		}
	};

	OBJLoader2.prototype._getValidator = function () {
		return Validator;
	};

	/**
	 * Parse OBJ data either from ArrayBuffer or string
	 * @class
	 */
	var Parser = (function () {

		function Parser( meshCreator ) {
			this.meshCreator = meshCreator;
			this.rawObject = null;
			this.inputObjectCount = 1;
			this.debug = false;
		}

		Parser.prototype.setDebug = function ( debug ) {
			if ( debug === true || debug === false ) this.debug = debug;
		};

		Parser.prototype.validate = function () {
			this.rawObject = new RawObject();
			this.inputObjectCount = 1;
		};

		/**
		 * Parse the provided arraybuffer
		 * @memberOf Parser
		 *
		 * @param {Uint8Array} arrayBuffer OBJ data as Uint8Array
		 */
		Parser.prototype.parseArrayBuffer = function ( arrayBuffer ) {
			var arrayBufferView = new Uint8Array( arrayBuffer );
			var length = arrayBufferView.byteLength;
			var buffer = new Array( 32 );
			var bufferPointer = 0;
			var slashes = new Array( 32 );
			var slashesPointer = 0;
			var reachedFaces = false;
			var code;
			var word = '';
			for ( var i = 0; i < length; i++ ) {

				code = arrayBufferView[ i ];
				switch ( code ) {
					case Consts.CODE_SPACE:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.CODE_SLASH:
						slashes[ slashesPointer++ ] = i;
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.CODE_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashes, slashesPointer, reachedFaces );
						slashesPointer = 0;
						bufferPointer = 0;
						break;

					case Consts.CODE_CR:
						break;

					default:
						word += String.fromCharCode( code );
						break;
				}
			}
		};

		/**
		 * Parse the provided text
		 * @memberOf Parser
		 *
		 * @param {string} text OBJ data as string
		 */
		Parser.prototype.parseText = function ( text ) {
			var length = text.length;
			var buffer = new Array( 32 );
			var bufferPointer = 0;
			var slashes = new Array( 32 );
			var slashesPointer = 0;
			var reachedFaces = false;
			var char;
			var word = '';
			for ( var i = 0; i < length; i++ ) {

				char = text[ i ];
				switch ( char ) {
					case Consts.STRING_SPACE:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.STRING_SLASH:
						slashes[ slashesPointer++ ] = i;
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						break;

					case Consts.STRING_LF:
						if ( word.length > 0 ) buffer[ bufferPointer++ ] = word;
						word = '';
						reachedFaces = this.processLine( buffer, bufferPointer, slashes, slashesPointer, reachedFaces );
						slashesPointer = 0;
						bufferPointer = 0;
						break;

					case Consts.STRING_CR:
						break;

					default:
						word += char;
				}
			}
		};

		Parser.prototype.processLine = function ( buffer, bufferPointer, slashes, slashesPointer, reachedFaces ) {
			if ( bufferPointer < 1 ) return reachedFaces;

			var bufferLength = bufferPointer - 1;
			switch ( buffer[ 0 ] ) {
				case Consts.LINE_V:

					// object complete instance required if reached faces already (= reached next block of v)
					if ( reachedFaces ) {

						this.processCompletedObject( null, this.rawObject.groupName );
						reachedFaces = false;

					}
					this.rawObject.pushVertex( buffer );
					break;

				case Consts.LINE_VT:
					this.rawObject.pushUv( buffer );
					break;

				case Consts.LINE_VN:
					this.rawObject.pushNormal( buffer );
					break;

				case Consts.LINE_F:
					reachedFaces = true;
					/*
					 * 0: "f vertex/uv/normal ..."
					 * 1: "f vertex/uv ..."
					 * 2: "f vertex//normal ..."
					 * 3: "f vertex ..."
					 */
					var haveQuad = bufferLength % 4 === 0;
					if ( slashesPointer > 1 && ( slashes[ 1 ] - slashes[ 0 ] ) === 1 ) {

						if ( haveQuad ) {
							this.rawObject.buildQuadVVn( buffer );
						} else {
							this.rawObject.buildFaceVVn( buffer );
						}

					} else if ( bufferLength === slashesPointer * 2 ) {

						if ( haveQuad ) {
							this.rawObject.buildQuadVVt( buffer );
						} else {
							this.rawObject.buildFaceVVt( buffer );
						}

					} else if ( bufferLength * 2 === slashesPointer * 3 ) {

						if ( haveQuad ) {
							this.rawObject.buildQuadVVtVn( buffer );
						} else {
							this.rawObject.buildFaceVVtVn( buffer );
						}

					} else {

						if ( haveQuad ) {
							this.rawObject.buildQuadV( buffer );
						} else {
							this.rawObject.buildFaceV( buffer );
						}

					}
					break;

				case Consts.LINE_L:
					if ( bufferLength === slashesPointer * 2 ) {

						this.rawObject.buildLineVvt( buffer );

					} else {

						this.rawObject.buildLineV( buffer );

					}
					break;

				case Consts.LINE_S:
					this.rawObject.pushSmoothingGroup( buffer[ 1 ] );
					break;

				case Consts.LINE_G:
					this.processCompletedGroup( buffer[ 1 ] );
					break;

				case Consts.LINE_O:
					if ( this.rawObject.vertices.length > 0 ) {

						this.processCompletedObject( buffer[ 1 ], null );
						reachedFaces = false;

					} else {

						this.rawObject.pushObject( buffer[ 1 ] );

					}
					break;

				case Consts.LINE_MTLLIB:
					this.rawObject.pushMtllib( buffer[ 1 ] );
					break;

				case Consts.LINE_USEMTL:
					this.rawObject.pushUsemtl( buffer[ 1 ] );
					break;

				default:
					break;
			}
			return reachedFaces;
		};

		Parser.prototype.processCompletedObject = function ( objectName, groupName ) {
			this.rawObject.finalize( this.meshCreator, this.inputObjectCount, this.debug );
			this.inputObjectCount++;
			this.rawObject = this.rawObject.newInstanceFromObject( objectName, groupName );
		};

		Parser.prototype.processCompletedGroup = function ( groupName ) {
			var notEmpty = this.rawObject.finalize( this.meshCreator, this.inputObjectCount, this.debug );
			if ( notEmpty ) {

				this.inputObjectCount ++;
				this.rawObject = this.rawObject.newInstanceFromGroup( groupName );

			} else {

				// if a group was set that did not lead to object creation in finalize, then the group name has to be updated
				this.rawObject.pushGroup( groupName );

			}
		};

		Parser.prototype.finalize = function () {
			this.rawObject.finalize( this.meshCreator, this.inputObjectCount, this.debug );
			this.inputObjectCount++;
		};

		return Parser;
	})();

	/**
	 * {@link RawObject} is only used by {@link Parser}.
	 * The user of OBJLoader2 does not need to care about this class.
	 * It is defined publicly for inclusion in web worker based OBJ loader ({@link THREE.OBJLoader2.WWOBJLoader2})
	 */
	var RawObject = (function () {

		function RawObject( objectName, groupName, mtllibName ) {
			this.globalVertexOffset = 1;
			this.globalUvOffset = 1;
			this.globalNormalOffset = 1;

			this.vertices = [];
			this.normals = [];
			this.uvs = [];

			// faces are stored according combined index of group, material and smoothingGroup (0 or not)
			this.mtllibName = Validator.verifyInput( mtllibName, 'none' );
			this.objectName = Validator.verifyInput( objectName, 'none' );
			this.groupName = Validator.verifyInput( groupName, 'none' );
			this.activeMtlName = 'none';
			this.activeSmoothingGroup = 1;

			this.mtlCount = 0;
			this.smoothingGroupCount = 0;

			this.rawObjectDescriptions = [];
			// this default index is required as it is possible to define faces without 'g' or 'usemtl'
			var index = this.buildIndex( this.activeMtlName, this.activeSmoothingGroup );
			this.rawObjectDescriptionInUse = new RawObjectDescription( this.objectName, this.groupName, this.activeMtlName, this.activeSmoothingGroup );
			this.rawObjectDescriptions[ index ] = this.rawObjectDescriptionInUse;
		}

		RawObject.prototype.buildIndex = function ( materialName, smoothingGroup) {
			return materialName + '|' + smoothingGroup;
		};

		RawObject.prototype.newInstanceFromObject = function ( objectName, groupName ) {
			var newRawObject = new RawObject( objectName, groupName, this.mtllibName );

			// move indices forward
			newRawObject.globalVertexOffset = this.globalVertexOffset + this.vertices.length / 3;
			newRawObject.globalUvOffset = this.globalUvOffset + this.uvs.length / 2;
			newRawObject.globalNormalOffset = this.globalNormalOffset + this.normals.length / 3;

			return newRawObject;
		};

		RawObject.prototype.newInstanceFromGroup = function ( groupName ) {
			var newRawObject = new RawObject( this.objectName, groupName, this.mtllibName );

			// keep current buffers and indices forward
			newRawObject.vertices = this.vertices;
			newRawObject.uvs = this.uvs;
			newRawObject.normals = this.normals;
			newRawObject.globalVertexOffset = this.globalVertexOffset;
			newRawObject.globalUvOffset = this.globalUvOffset;
			newRawObject.globalNormalOffset = this.globalNormalOffset;

			return newRawObject;
		};

		RawObject.prototype.pushVertex = function ( buffer ) {
			this.vertices.push( parseFloat( buffer[ 1 ] ) );
			this.vertices.push( parseFloat( buffer[ 2 ] ) );
			this.vertices.push( parseFloat( buffer[ 3 ] ) );
		};

		RawObject.prototype.pushUv = function ( buffer ) {
			this.uvs.push( parseFloat( buffer[ 1 ] ) );
			this.uvs.push( parseFloat( buffer[ 2 ] ) );
		};

		RawObject.prototype.pushNormal = function ( buffer ) {
			this.normals.push( parseFloat( buffer[ 1 ] ) );
			this.normals.push( parseFloat( buffer[ 2 ] ) );
			this.normals.push( parseFloat( buffer[ 3 ] ) );
		};

		RawObject.prototype.pushObject = function ( objectName ) {
			this.objectName = objectName;
		};

		RawObject.prototype.pushMtllib = function ( mtllibName ) {
			this.mtllibName = mtllibName;
		};

		RawObject.prototype.pushGroup = function ( groupName ) {
			this.groupName = groupName;
			this.verifyIndex();
		};

		RawObject.prototype.pushUsemtl = function ( mtlName ) {
			if ( this.activeMtlName === mtlName || ! Validator.isValid( mtlName ) ) return;
			this.activeMtlName = mtlName;
			this.mtlCount++;

			this.verifyIndex();
		};

		RawObject.prototype.pushSmoothingGroup = function ( activeSmoothingGroup ) {
			var normalized = activeSmoothingGroup === 'off' ? 0 : activeSmoothingGroup;
			if ( this.activeSmoothingGroup === normalized ) return;
			this.activeSmoothingGroup = normalized;
			this.smoothingGroupCount++;

			this.verifyIndex();
		};

		RawObject.prototype.verifyIndex = function () {
			var index = this.buildIndex( this.activeMtlName, ( this.activeSmoothingGroup === 0 ) ? 0 : 1 );
			this.rawObjectDescriptionInUse = this.rawObjectDescriptions[ index ];
			if ( ! Validator.isValid( this.rawObjectDescriptionInUse ) ) {

				this.rawObjectDescriptionInUse = new RawObjectDescription( this.objectName, this.groupName, this.activeMtlName, this.activeSmoothingGroup );
				this.rawObjectDescriptions[ index ] = this.rawObjectDescriptionInUse;

			}
		};

		RawObject.prototype.buildQuadVVtVn = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_3[ i ] ] );
				this.attachFaceVt( indexArray[ Consts.QUAD_INDICES_3[ i ] + 1 ] );
				this.attachFaceVn( indexArray[ Consts.QUAD_INDICES_3[ i ] + 2 ] );
			}
		};

		RawObject.prototype.buildQuadVVt = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_2[ i ] ] );
				this.attachFaceVt( indexArray[ Consts.QUAD_INDICES_2[ i ] + 1 ] );
			}
		};

		RawObject.prototype.buildQuadVVn = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_2[ i ] ] );
				this.attachFaceVn( indexArray[ Consts.QUAD_INDICES_2[ i ] + 1 ] );
			}
		};

		RawObject.prototype.buildQuadV = function ( indexArray ) {
			for ( var i = 0; i < 6; i ++ ) {
				this.attachFaceV_( indexArray[ Consts.QUAD_INDICES_1[ i ] ] );
			}
		};

		RawObject.prototype.buildFaceVVtVn = function ( indexArray ) {
			for ( var i = 1; i < 10; i += 3 ) {
				this.attachFaceV_( indexArray[ i ] );
				this.attachFaceVt( indexArray[ i + 1 ] );
				this.attachFaceVn( indexArray[ i + 2 ] );
			}
		};

		RawObject.prototype.buildFaceVVt = function ( indexArray ) {
			for ( var i = 1; i < 7; i += 2 ) {
				this.attachFaceV_( indexArray[ i ] );
				this.attachFaceVt( indexArray[ i + 1 ] );
			}
		};

		RawObject.prototype.buildFaceVVn = function ( indexArray ) {
			for ( var i = 1; i < 7; i += 2 ) {
				this.attachFaceV_( indexArray[ i ] );
				this.attachFaceVn( indexArray[ i + 1 ] );
			}
		};

		RawObject.prototype.buildFaceV = function ( indexArray ) {
			for ( var i = 1; i < 4; i ++ ) {
				this.attachFaceV_( indexArray[ i ] );
			}
		};

		RawObject.prototype.attachFaceV_ = function ( faceIndex ) {
			var faceIndexInt =  parseInt( faceIndex );
			var index = ( faceIndexInt - this.globalVertexOffset ) * 3;

			var rodiu = this.rawObjectDescriptionInUse;
			rodiu.vertices.push( this.vertices[ index++ ] );
			rodiu.vertices.push( this.vertices[ index++ ] );
			rodiu.vertices.push( this.vertices[ index ] );
		};

		RawObject.prototype.attachFaceVt = function ( faceIndex ) {
			var faceIndexInt =  parseInt( faceIndex );
			var index = ( faceIndexInt - this.globalUvOffset ) * 2;

			var rodiu = this.rawObjectDescriptionInUse;
			rodiu.uvs.push( this.uvs[ index++ ] );
			rodiu.uvs.push( this.uvs[ index ] );
		};

		RawObject.prototype.attachFaceVn = function ( faceIndex ) {
			var faceIndexInt =  parseInt( faceIndex );
			var index = ( faceIndexInt - this.globalNormalOffset ) * 3;

			var rodiu = this.rawObjectDescriptionInUse;
			rodiu.normals.push( this.normals[ index++ ] );
			rodiu.normals.push( this.normals[ index++ ] );
			rodiu.normals.push( this.normals[ index ] );
		};

		/*
		 * Support for lines with or without texture. irst element in indexArray is the line identification
		 * 0: "f vertex/uv		vertex/uv 		..."
		 * 1: "f vertex			vertex 			..."
		 */
		RawObject.prototype.buildLineVvt = function ( lineArray ) {
			var length = lineArray.length;
			for ( var i = 1; i < length; i ++ ) {
				this.vertices.push( parseInt( lineArray[ i ] ) );
				this.uvs.push( parseInt( lineArray[ i ] ) );
			}
		};

		RawObject.prototype.buildLineV = function ( lineArray ) {
			var length = lineArray.length;
			for ( var i = 1; i < length; i++ ) {
				this.vertices.push( parseInt( lineArray[ i ] ) );
			}
		};

		/**
		 * Clear any empty rawObjectDescription and calculate absolute vertex, normal and uv counts
		 */
		RawObject.prototype.finalize = function ( meshCreator, inputObjectCount, debug ) {
			var temp = this.rawObjectDescriptions;
			this.rawObjectDescriptions = [];
			var rawObjectDescription;
			var index = 0;
			var absoluteVertexCount = 0;
			var absoluteNormalCount = 0;
			var absoluteUvCount = 0;

			for ( var name in temp ) {

				rawObjectDescription = temp[ name ];
				if ( rawObjectDescription.vertices.length > 0 ) {

					if ( rawObjectDescription.objectName === 'none' ) rawObjectDescription.objectName = rawObjectDescription.groupName;
					this.rawObjectDescriptions[ index++ ] = rawObjectDescription;
					absoluteVertexCount += rawObjectDescription.vertices.length;
					absoluteUvCount += rawObjectDescription.uvs.length;
					absoluteNormalCount += rawObjectDescription.normals.length;

				}
			}

			// don not continue if no result
			var notEmpty = false;
			if ( index > 0 ) {

				if ( debug ) this.createReport( inputObjectCount, true );
				meshCreator.buildMesh(
					this.rawObjectDescriptions,
					inputObjectCount,
					absoluteVertexCount,
					absoluteNormalCount,
					absoluteUvCount
				);
				notEmpty = true;

			}
			return notEmpty;
		};

		RawObject.prototype.createReport = function ( inputObjectCount, printDirectly ) {
			var report = {
				name: this.objectName ? this.objectName : 'groups',
				mtllibName: this.mtllibName,
				vertexCount: this.vertices.length / 3,
				normalCount: this.normals.length / 3,
				uvCount: this.uvs.length / 2,
				smoothingGroupCount: this.smoothingGroupCount,
				mtlCount: this.mtlCount,
				rawObjectDescriptions: this.rawObjectDescriptions.length
			};

			if ( printDirectly ) {
				console.log( 'Input Object number: ' + inputObjectCount + ' Object name: ' + report.name );
				console.log( 'Mtllib name: ' + report.mtllibName );
				console.log( 'Vertex count: ' + report.vertexCount );
				console.log( 'Normal count: ' + report.normalCount );
				console.log( 'UV count: ' + report.uvCount );
				console.log( 'SmoothingGroup count: ' + report.smoothingGroupCount );
				console.log( 'Material count: ' + report.mtlCount );
				console.log( 'Real RawObjectDescription count: ' + report.rawObjectDescriptions );
				console.log( '' );
			}

			return report;
		};

		return RawObject;
	})();

	/**
	 * Descriptive information and data (vertices, normals, uvs) to passed on to mesh building function.
	 * @class
	 *
	 * @param {string} objectName Name of the mesh
	 * @param {string} groupName Name of the group
	 * @param {string} materialName Name of the material
	 * @param {number} smoothingGroup Normalized smoothingGroup (0: THREE.FlatShading, 1: THREE.SmoothShading)
	 */
	var RawObjectDescription = (function () {

		function RawObjectDescription( objectName, groupName, materialName, smoothingGroup ) {
			this.objectName = objectName;
			this.groupName = groupName;
			this.materialName = materialName;
			this.smoothingGroup = smoothingGroup;
			this.vertices = [];
			this.uvs = [];
			this.normals = [];
		}

		return RawObjectDescription;
	})();

	/**
	 * MeshCreator is used to transform RawObjectDescriptions to THREE.Mesh
	 *
	 * @class
	 */
	var MeshCreator = (function () {

		function MeshCreator() {
			this.sceneGraphBaseNode = null;
			this.materials = null;
			this.debug = false;
			this.globalObjectCount = 1;

			this.validated = false;
		}

		MeshCreator.prototype.setSceneGraphBaseNode = function ( sceneGraphBaseNode ) {
			this.sceneGraphBaseNode = Validator.verifyInput( sceneGraphBaseNode, this.sceneGraphBaseNode );
			this.sceneGraphBaseNode = Validator.verifyInput( this.sceneGraphBaseNode, new THREE.Group() );
		};

		MeshCreator.prototype.setMaterials = function ( materials ) {
			this.materials = Validator.verifyInput( materials, this.materials );
			this.materials = Validator.verifyInput( this.materials, { materials: [] } );
		};

		MeshCreator.prototype.setDebug = function ( debug ) {
			if ( debug === true || debug === false ) this.debug = debug;
		};

		MeshCreator.prototype.validate = function () {
			if ( this.validated ) return;

			this.setSceneGraphBaseNode( null );
			this.setMaterials( null );
			this.setDebug( null );
			this.globalObjectCount = 1;
		};

		MeshCreator.prototype.finalize = function () {
			this.sceneGraphBaseNode = null;
			this.materials = null;
			this.validated = false;
		};

		/**
		 * This is an internal function, but due to its importance to Parser it is documented.
		 * RawObjectDescriptions are transformed to THREE.Mesh.
		 * It is ensured that rawObjectDescriptions only contain objects with vertices (no need to check).
		 * This method shall be overridden by the web worker implementation
		 *
		 * @param {RawObjectDescription[]} rawObjectDescriptions Array of descriptive information and data (vertices, normals, uvs) about the parsed object(s)
		 * @param {number} inputObjectCount Number of objects already retrieved from OBJ
		 * @param {number} absoluteVertexCount Sum of all vertices of all rawObjectDescriptions
		 * @param {number} absoluteNormalCount Sum of all normals of all rawObjectDescriptions
		 * @param {number} absoluteUvCount Sum of all uvs of all rawObjectDescriptions
		 */
		MeshCreator.prototype.buildMesh = function ( rawObjectDescriptions, inputObjectCount, absoluteVertexCount, absoluteNormalCount, absoluteUvCount ) {

			if ( this.debug ) console.log( 'MeshCreator.buildRawMeshData:\nInput object no.: ' + inputObjectCount );

			var bufferGeometry = new THREE.BufferGeometry();
			var vertexBA = new THREE.BufferAttribute( new Float32Array( absoluteVertexCount ), 3 );
			bufferGeometry.addAttribute( 'position', vertexBA );

			var normalBA;
			if ( absoluteNormalCount > 0 ) {

				normalBA = new THREE.BufferAttribute( new Float32Array( absoluteNormalCount ), 3 );
				bufferGeometry.addAttribute( 'normal', normalBA );

			}
			var uvBA;
			if ( absoluteUvCount > 0 ) {

				uvBA = new THREE.BufferAttribute( new Float32Array( absoluteUvCount ), 2 );
				bufferGeometry.addAttribute( 'uv', uvBA );

			}

			if ( this.debug ) console.log( 'Creating Multi-Material for object no.: ' + this.globalObjectCount );

			var rawObjectDescription;
			var material;
			var materialName;
			var createMultiMaterial = rawObjectDescriptions.length > 1;
			var materials = [];
			var materialIndex = 0;
			var materialIndexMapping = [];
			var selectedMaterialIndex;

			var vertexBAOffset = 0;
			var vertexGroupOffset = 0;
			var vertexLength;
			var normalOffset = 0;
			var uvOffset = 0;

			for ( var oodIndex in rawObjectDescriptions ) {
				rawObjectDescription = rawObjectDescriptions[ oodIndex ];

				materialName = rawObjectDescription.materialName;
				material = this.materials[ materialName ];
				if ( ! material ) {

					material = this.materials[ 'defaultMaterial' ];
					if ( ! material ) {

						material = new THREE.MeshStandardMaterial( { color: 0xDCF1FF} );
						material.name = 'defaultMaterial';
						this.materials[ 'defaultMaterial' ] = material;

					}
					console.warn( 'object_group "' + rawObjectDescription.objectName + '_' + rawObjectDescription.groupName + '" was defined without material! Assigning "defaultMaterial".' );

				}
				// clone material in case flat shading is needed due to smoothingGroup 0
				if ( rawObjectDescription.smoothingGroup === 0 ) {

					materialName = material.name + '_flat';
					var materialClone = this.materials[ materialName ];
					if ( ! materialClone ) {

						materialClone = material.clone();
						materialClone.name = materialName;
						materialClone.shading = THREE.FlatShading;
						this.materials[ materialName ] = name;

					}

				}

				vertexLength = rawObjectDescription.vertices.length;
				if ( createMultiMaterial ) {

					// re-use material if already used before. Reduces materials array size and eliminates duplicates
					selectedMaterialIndex = materialIndexMapping[ materialName ];
					if ( ! selectedMaterialIndex ) {

						selectedMaterialIndex = materialIndex;
						materialIndexMapping[ materialName ] = materialIndex;
						materials.push( material );
						materialIndex++;

					}

					bufferGeometry.addGroup( vertexGroupOffset, vertexLength / 3, selectedMaterialIndex );
					vertexGroupOffset += vertexLength / 3;
				}

				vertexBA.set( rawObjectDescription.vertices, vertexBAOffset );
				vertexBAOffset += vertexLength;

				if ( normalBA ) {

					normalBA.set( rawObjectDescription.normals, normalOffset );
					normalOffset += rawObjectDescription.normals.length;

				}
				if ( uvBA ) {

					uvBA.set( rawObjectDescription.uvs, uvOffset );
					uvOffset += rawObjectDescription.uvs.length;

				}
				if ( this.debug ) this.printReport( rawObjectDescription, selectedMaterialIndex );

			}
			if ( ! normalBA ) bufferGeometry.computeVertexNormals();

			if ( createMultiMaterial ) material = materials;
			var mesh = new THREE.Mesh( bufferGeometry, material );
			this.sceneGraphBaseNode.add( mesh );

			this.globalObjectCount++;
		};

		MeshCreator.prototype.printReport = function ( rawObjectDescription, selectedMaterialIndex ) {
			console.log(
				' Output Object no.: ' + this.globalObjectCount +
				'\n objectName: ' + rawObjectDescription.objectName +
				'\n groupName: ' + rawObjectDescription.groupName +
				'\n materialName: ' + rawObjectDescription.materialName +
				'\n materialIndex: ' + selectedMaterialIndex +
				'\n smoothingGroup: ' + rawObjectDescription.smoothingGroup +
				'\n #vertices: ' + rawObjectDescription.vertices.length / 3 +
				'\n #uvs: ' + rawObjectDescription.uvs.length / 2 +
				'\n #normals: ' + rawObjectDescription.normals.length / 3
			);
		};

		return MeshCreator;
	})();

	OBJLoader2.prototype._buildWebWorkerCode = function ( funcBuildObject, funcBuildSingelton ) {
		var workerCode = '';
		workerCode += funcBuildObject( 'Consts', Consts );
		workerCode += funcBuildObject( 'Validator', Validator );
		workerCode += funcBuildSingelton( 'Parser', 'Parser', Parser );
		workerCode += funcBuildSingelton( 'RawObject', 'RawObject', RawObject );
		workerCode += funcBuildSingelton( 'RawObjectDescription', 'RawObjectDescription', RawObjectDescription );
		return workerCode;
	};

	return OBJLoader2;
})();
// File: init/Definitions.js
/*
 * XSeen JavaScript Library
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * The Namespace container for x3dom objects.
 * @namespace x3dom
 *
 *	Removed THREE loaders
	loaders:	{
					'file'	: new THREE.FileLoader(),
					'image'	: 0,
				},

 * */
var xseen = {
    canvases		: [],
	sceneInfo		: [],
	nodeDefinitions	: {},
	parseTable		: {},
	node			: {},
	utils			: {},
	eventManager	: {},
	Events			: {},
	Navigation		: {},

	loadMgr			: {},
	loader			: {
						'Null'			: '',
						'ColladaLoader'	: '',
						'GltfLegacy'	: '',
						'GltfLoader'	: '',
						'ObjLoader'		: '',
						'ImageLoader'	: '',
						'X3dLoader'		: '',
					},
	loadProgress	: function (xhr) {
						if (xhr.total != 0) {
							console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
						}
					},
	loadError		: function (xhr, userdata, code, message) {
						console.error('An error happened on '+userdata.e.id+'\n'+code+'\n'+message);
					},
	loadMime		: {
						''		: {name: 'Null', loader: 'Null'},
						'dae'	: {name: 'Collada', loader: 'ColladaLoader'},
						'glb'	: {name: 'glTF Binary', loader: 'GltfLoader'},
						'glbl'	: {name: 'glTF Binary', loader: 'GltfLegacy'},
						'gltf'	: {name: 'glTF JSON', loader: 'GltfLoader'},
						'obj'	: {name: 'OBJ', loader: 'ObjLoader'},
						'png'	: {name: 'PNG', loader: 'ImageLoader'},
						'jpg'	: {name: 'JPEG', loader: 'ImageLoader'},
						'jpeg'	: {name: 'JPEG', loader: 'ImageLoader'},
						'gif'	: {name: 'GIF', loader: 'ImageLoader'},
						'x3d'	: {name: 'X3D XML', loader: 'X3dLoader'},
					},
// helper
	array_to_object	: function (a) {
						var o = {};
						for(var i=0;i<a.length;i++) {
							o[a[i]]='';
						}
						return o;
					},


	
	timeStart		: (new Date()).getTime(),
	timeNow			: (new Date()).getTime(),

	tmp				: {},			// misc. out of the way storage

	versionInfo		: [],
    x3dNS    		: 'http://www.web3d.org/specifications/x3d-namespace',
    x3dextNS 		: 'http://philip.html5.org/x3d/ext',
    xsltNS   		: 'http://www.w3.org/1999/XSL/x3dom.Transform',
    xhtmlNS  		: 'http://www.w3.org/1999/xhtml',

	updateOnLoad	: 0,
	parseUrl		: 0,

	dumpSceneGraph	: function () {this._dumpChildren (xseen.sceneInfo[0].scene, ' +', '--');},
	_dumpChildren	: function (obj, indent, addstr)
						{
							console.log (indent + '> ' + obj.type + ' (' + obj.name + ')');
							for (var i=0; i<obj.children.length; i++) {
								var child = obj.children[i];
								this._dumpChildren(child, indent+addstr, addstr);
							}
						},
};
// File: init/XSeen.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 * Removed code for
 * - ActiveX 
 * - Flash
 * 
 */

xseen.rerouteSetAttribute = function(node, browser) {
    // save old setAttribute method
    node._setAttribute = node.setAttribute;
    node.setAttribute = function(name, value) {
        var id = node.getAttribute("_xseenNode");
        var anode = browser.findNode(id);
        
        if (anode)
            return anode.parseField(name, value);
        else
            return 0;
    };

    for(var i=0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        xseen.rerouteSetAttribute(child, browser);
    }
};


// holds the UserAgent feature
/*xseen.userAgentFeature = {
    supportsDOMAttrModified: false
};
 */

(function loadXSeen() {
    "use strict";

    var onload = function() {
		xseen.updateOnLoad();

        var i,j;  // counters

        // Search all X-Scene elements in the page
		//alert ('Finding all x-scene tags...');
        var xseens_unfiltered = document.getElementsByTagName('scene');
        var xseens = [];
		var sceneInfo

        // check if element already has been processed
        for (var i=0; i < xseens_unfiltered.length; i++) {
            if (typeof(xseens_unfiltered[i]._xseen) === 'undefined')
                xseens.push(xseens_unfiltered[i]);
        }

        // ~~ Components and params {{{ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var params;
        var settings = new xseen.Properties();  // stores the stuff in <param>
        var validParams = xseen.array_to_object([ 
            'showLog', 
            'showStat',
            'showProgress', 
            'PrimitiveQuality', 
            'components', 
            'loadpath', 
            'disableDoubleClick',
            'backend',
            'altImg',
            'runtimeEnabled',
            'keysEnabled',
            'showTouchpoints',
            'disableTouch',
            'maxActiveDownloads'
        ]);
        var components, prefix;
		var showLoggingConsole = false;

        // for each XSeens element
        for (var i=0; i < xseens.length; i++) {

            // default parameters
            settings.setProperty("showLog", xseens[i].getAttribute("showLog") || 'false');
            settings.setProperty("showLog", xseens[i].getAttribute("showLog") || 'true');
            settings.setProperty("showStat", xseens[i].getAttribute("showStat") || 'false');
            settings.setProperty("showProgress", xseens[i].getAttribute("showProgress") || 'true');
            settings.setProperty("PrimitiveQuality", xseens[i].getAttribute("PrimitiveQuality") || 'High');

            // for each param element inside the X3D element
            // add settings to properties object
            params = xseens[i].getElementsByTagName('PARAM');
            for (var j=0; j < params.length; j++) {
                if (params[j].getAttribute('name') in validParams) {
                    settings.setProperty(params[j].getAttribute('name'), params[j].getAttribute('value'));
                } else {
                    //xseen.debug.logError("Unknown parameter: " + params[j].getAttribute('name'));
                }
            }

            // enable log
            if (settings.getProperty('showLog') === 'true') {
				showLoggingConsole = true;
            }

            if (typeof X3DOM_SECURITY_OFF != 'undefined' && X3DOM_SECURITY_OFF === true) {
                // load components from params or default to x3d attribute
                components = settings.getProperty('components', xseens[i].getAttribute("components"));
                if (components) {
                    prefix = settings.getProperty('loadpath', xseens[i].getAttribute("loadpath"));
                    components = components.trim().split(',');
                    for (j=0; j < components.length; j++) {
                        xseen.loadJS(components[j] + ".js", prefix);
                    }
                }

                // src=foo.x3d adding inline node, not a good idea, but...
                if (xseens[i].getAttribute("src")) {
                    var _scene = document.createElement("scene");
                    var _inl = document.createElement("Inline");
                    _inl.setAttribute("url", xseens[i].getAttribute("src"));
                    _scene.appendChild(_inl);
                    xseens[i].appendChild(_scene);
                }
            }
        }
        // }}}
		
		if (showLoggingConsole == true) {
			xseen.debug.activate(true);
		} else {
			xseen.debug.activate(false);
		}

        // Convert the collection into a simple array (is this necessary?)
/* Don't think so -- commented out
        xseens = Array.map(xseens, function (n) {
            n.hasRuntime = true;
            return n;
        });
 */

        if (xseen.versionInfo !== undefined) {
            xseen.debug.logInfo("XSeen version " + xseen.versionInfo.version + ", " +
                                "Date " + xseen.versionInfo.date);
            xseen.debug.logInfo(xseen.versionInfo.splashText);
        }
        
        //xseen.debug.logInfo("Found " + xseen.length + " XSeen nodes");
        	
		
        // Create a HTML canvas for every XSeen scene and wrap it with
        // an X3D canvas and load the content
        var x_element;
        var x_canvas;
        var altDiv, altP, aLnk, altImg;
        var t0, t1;

        for (var i=0; i < xseens.length; i++)
        {
            x_element = xseens[i];		// The XSeen DOM element

            x_canvas = new THREE.Scene();	// May need addtl info if multiple: xseen.X3DCanvas(x_element, xseen.canvases.length);
            xseen.canvases.push(x_canvas);	// TODO: Need to handle failure to initialize?
            t0 = new Date().getTime();

/*
 * Handle opening tag attributes
 *	divHeight
 *	divWidth
 *	turntable	Indicates if view automatically rotates (independent of navigation)
 */

			var divWidth = x_element.getAttribute('width');
			var divHeight =  x_element.getAttribute('height');
			if (divHeight + divWidth < 100) {
				divHeight = 450;
				divWidth = 800;
			} else if (divHeight < 50) {
				divHeight = Math.floor(divWidth/2) + 50;
			} else if (divWidth < 50) {
				divWidth = divHeight * 2 - 100;
			}
			var turntable = (x_element.getAttribute('turntable') || '').toLowerCase();
			if (turntable == 'on' || turntable == 'yes' || turntable == 'y' || turntable == '1') {
				turntable = true;
			} else {
				turntable = false;
			}
/*
 *	Removed because camera is stored in the Scene node (x_element._xseen.renderer.camera
 *	Leave variable definition so other code works...
			var x_camera = new THREE.PerspectiveCamera( 75, divWidth / divHeight, 0.1, 1000 );
			x_camera.position.x = 0;
			x_camera.position.z = 10;
 */
			var x_camera = {};
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (divWidth, divHeight);
			//x_element.appendChild (x_renderer.domElement);
			
			// Stereo camera effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(x_renderer);

/*
 * Add event handler to XSeen tag (x_element)
 *	These handle all mouse/cursor/button controls when the cursor is
 *	in the XSeen region of the page
 */

			x_element.addEventListener ('dblclick', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('click', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('mousedown', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('mousemove', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('mouseup', xseen.Events.canvasHandler, true);	
			x_element.addEventListener ('xseen', xseen.Events.XSeenHandler);		// Last chance for XSeen handling of event
/*
	x_element.addEventListener ('mousedown', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
	x_element.addEventListener ('mouseup', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
	x_element.addEventListener ('mousemove', xseen.Events.XSeenDebugHandler, true);		// Early catch of 'change' event
 */
			xseen.sceneInfo.push ({
									'size'		: {'width':divWidth, 'height':divHeight},
									'scene'		: x_canvas, 
									'renderer'	: x_renderer,
									'effect'	: x_effect,
									'camera'	: [x_camera],
									'turntable'	: turntable,
									'mixers'	: [],
									'clock'		: new THREE.Clock(),
									'element'	: x_element,
									'selectable': [],
									'stacks'	: [],
									'tmp'		: {activeViewpoint:false},
									'xseen'		: xseen,
								});
			x_element._xseen = {};
			x_element._xseen.children = [];
			x_element._xseen.sceneInfo = xseen.sceneInfo[xseen.sceneInfo.length-1];

			t1 = new Date().getTime() - t0;
            xseen.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
        }
		
        var ready = (function(eventType) {
            var evt = null;

            if (document.createEvent) {
                evt = document.createEvent("Events");    
                evt.initEvent(eventType, true, true);     
                document.dispatchEvent(evt);              
            } else if (document.createEventObject) {
                evt = document.createEventObject();
                // http://stackoverflow.com/questions/1874866/how-to-fire-onload-event-on-document-in-ie
                document.body.fireEvent('on' + eventType, evt);   
            }
        })('load');
		
		// for each X-Scene tag, parse and load the contents
		var t=[];
		for (var i=0; i<xseen.sceneInfo.length; i++) {
			xseen.sceneInfo[i].ORIGIN = xseen.ORIGIN;
			xseen.sceneInfo[i].stacks['Viewpoints'] = new xseen.utils.StackHandler('Viewpoints');
			xseen.sceneInfo[i].stacks['Navigation'] = new xseen.utils.StackHandler('Navigation');
			console.log("Processing 'scene' element #" + i);
			xseen.debug.logInfo("Processing 'scene' element #" + i);
			t[i] = new Date().getTime();
			xseen.Parse (xseen.sceneInfo[i].element, xseen.sceneInfo[i]);
			t1 = new Date().getTime() - t[i];
            xseen.debug.logInfo('Time for initial pass #' + i + ' parsing: ' + t1 + " ms.");
		}
    };

/*
 * Animation/render function loop
 *
 *	Run each animation frame. 
 *	Various types of animation (anything that changes frame-to-frame) goes here
 *	.controls is for navigation. See example code at https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_orbit.html
 *	lines 75-80 + render loop
 */
	xseen.renderFrame = function () 
		{
			requestAnimationFrame (xseen.renderFrame);
/*
 *	This is not the way to do animation. Code should not be in the loop
 *	Various objects needing animation should register for an event ... or something
 *
 *	controls are not handling navigation. Currently only working with orbit controls.
 *	Don't know if the problem is events (not generating, not getting), not processing events, or not updating things
 */
			TWEEN.update();
			xseen.updateAnimation (xseen.sceneInfo[0]);
			xseen.updateCamera (xseen.sceneInfo[0]);
			
			var renderObj = xseen.sceneInfo[0].element._xseen.renderer;
			//renderObj.controls.update();

/*
 * Existing code moved to updateAnimation & updateCamera to better handle navigation
 *
			var deltaT, radians, x, y, z, P, radius, vp;
			var nodeAframe = document.getElementById ('aframe_nodes');
			P = 16000;
			deltaT = xseen.sceneInfo[0].clock.getDelta();
			for (var i=0; i<xseen.sceneInfo[0].mixers.length; i++) {
				xseen.sceneInfo[0].mixers[i].update(deltaT);
			}
			deltaT = (new Date()).getTime() - xseen.timeStart;
			radians = deltaT/P * 2 * Math.PI;
			vp = xseen.sceneInfo[0].stacks.Viewpoints.getActive();
			radius = vp._xseen.fields._radius0;
			y = vp._xseen.fields.position[1] * Math.cos(1.5*radians);
			var currentCamera = xseen.sceneInfo[0].element._xseen.renderer.activeCamera;
			currentCamera.position.y = y;		// This uses Viewpoint initial 'y' coordinate for range
			if (xseen.sceneInfo[0].turntable) {
				x = radius * Math.sin(radians);
				currentCamera.position.x = x;
				currentCamera.position.z = radius * Math.cos(radians);
				if (nodeAframe !== null) {nodeAframe._xseen.sceneNode.position.x = -x;}
			}
			//currentCamera.lookAt(xseen.types.Vector3([0,0,0]));
			currentCamera.lookAt(xseen.ORIGIN);
 */
			// End of animation (objects & camera/navigation)
			// StereoEffect renderer
			var activeRender = renderObj.activeRender;
			var currentCamera = renderObj.activeCamera;
			activeRender.render (xseen.sceneInfo[0].scene, currentCamera);
		};

	xseen.updateAnimation = function (scene)
		{
			var deltaT = scene.clock.getDelta();
			for (var i=0; i<scene.mixers.length; i++) {
				scene.mixers[i].update(deltaT);
			}
		};
	xseen.updateCamera = function (scene)
		{
			var deltaT
			deltaT = scene.clock.getDelta();
			var viewpoint = scene.stacks.Viewpoints.getActive();
			
			xseen.Navigation[viewpoint.motion] (viewpoint.motionspeed, deltaT, scene, scene.element._xseen.renderer.activeCamera);
		};
    
	// Replace with code that calls THREE's unload methods
    var onunload = function() {
        if (xseen.canvases) {
			/*
            for (var i=0; i<xseen.canvases.length; i++) {
				xseen.canvases[i].doc.shutdown(xseen.canvases[i].gl);
            }
			*/
            xseen.canvases = [];
        }
    };
    
    /** Initializes an <x3d> root element that was added after document load. */
    xseen.reload = function() {
        onload();
    };
	
    /* FIX PROBLEM IN CHROME - HACK - searching for better solution !!! */
	if (navigator.userAgent.indexOf("Chrome") != -1) {
		document.__getElementsByTagName = document.getElementsByTagName;
		
		document.getElementsByTagName = function(tag) {
			var obj = [];
			var elems = this.__getElementsByTagName("*");

			if(tag =="*"){
				obj = elems;
			} else {
				tag = tag.toUpperCase();
				for (var i = 0; i < elems.length; i++) {
					var tagName = elems[i].tagName.toUpperCase();		
					if (tagName === tag) {
						obj.push(elems[i]);
					}
				}
			}
			
            return obj;
        };

		document.__getElementById = document.getElementById;
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.__getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
		
	} else { /* END OF HACK */
        document.__getElementById = document.getElementById;
        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
	}
    
    if (window.addEventListener)  {
        window.addEventListener('load', onload, false);
        window.addEventListener('unload', onunload, false);
        window.addEventListener('reload', onunload, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', onload);
        window.attachEvent('onunload', onunload);
        window.attachEvent('onreload', onunload);
    }

    // Initialize if we were loaded after 'DOMContentLoaded' already fired.
    // This can happen if the script was loaded by other means.
    if (document.readyState === "complete") {
        window.setTimeout( function() { onload(); }, 20 );
    }
})();
// File: ./aRuntimeDefinitions.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * Some portions may be extracted from
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * The Namespace container for x3dom objects.
 * @namespace x3dom
 *
 *	Removed THREE loaders
	loaders:	{
					'file'	: new THREE.FileLoader(),
					'image'	: 0,
				},

 * */

xseen.updateOnLoad = function ()
	{
		this.loader.Null			= this.loader.X3dLoader;
		this.loadMgr				= new LoadManager();
		this.loader.X3dLoader		= this.loadMgr;
		this.loader.ColladaLoader	= new THREE.ColladaLoader();
		this.loader.GltfLegacy		= new THREE.GLTFLoader();
		this.loader.GltfLoader		= new THREE.GLTF2Loader();
		this.loader.ObjLoader		= new THREE.OBJLoader2();
		this.loader.ImageLoader		= new THREE.TextureLoader();
		this.ORIGIN					= xseen.types.Vector3([0,0,0])

// Base code from https://www.abeautifulsite.net/parsing-urls-in-javascript
		this.parseUrl = function (url)
			{
				var parser = document.createElement('a'),
				searchObject = {},
        		queries, split, i, pathFile, path, file, extension;
				// Let the browser do the work
				parser.href = url;
				// Convert query string to object
    			queries = parser.search.replace(/^\?/, '').split('&');
    			for( i = 0; i < queries.length; i++ ) {
					split = queries[i].split('=');
					searchObject[split[0]] = split[1];
				}
				pathFile = parser.pathname.split('/');
				file = pathFile[pathFile.length-1];
				pathFile.length --;
				path = '/' + pathFile.join('/');
				extension = file.split('.');
				extension = extension[extension.length-1];
    			return {
        			protocol:		parser.protocol,
        			host:			parser.host,
        			hostname:		parser.hostname,
        			port:			parser.port,
        			pathname:		parser.pathname,
					path:			path,
					file:			file,
					extension:		extension,
        			search:			parser.search,
        			searchObject:	searchObject,
        			hash:			parser.hash
    				};
			};
		this.versionInfo = this.generateVersion();

		this.Events = {
				MODE_NAVIGATION:	1,
				MODE_SELECT:		2,
				mode:				2,
				inNavigation: function () {return (this.mode == this.MODE_NAVIGATION) ? true : false;},
				inSelect: function () {return (this.mode == this.MODE_SELECT) ? true : false;},
				that: this,
				routes: [],
				redispatch: false,
				object: {},
				raycaster: new THREE.Raycaster(),
				mouse: new THREE.Vector2(),
				

/*
 * Handle user-generated events on the canvas. These include all mouse events (click, doubleClick, move, drag...)
 * Need to create new XSeen event (has event.xseen = true) that is essentially the same and dispatch the
 * event from the proper target (for selection mode). The proper target is selected with the help of WebGL to
 * find the first (closest) object in the scene that intersects a ray drawn from the cursor. May need to add a field
 * to THREE geometry that indicates if it is selectable.
 *
 * In NavigationMode, cursor movements tend to indicate navigation requests. This is the default mode. The system is
 * switched into SelectMode when the user "clicks" on geometry that is active (selectable).
 *
 * Need to clearly define event operations
 * Initially: [2017-06-27]
 * Regular mouse events are captured here. Perhaps initially should only capture mousedown
 * Check to see what (if any) selectable nodes (probably a subset of geometry) intersects a ray drawn from the cusor
 * If nothing, (background is not selectable), then switch to MODE_NAVIGATION; otherwise switch to MODE_SELECT
 * Establish event handlers for mouseup, leave canvas, mousemove, click, and double-click
 * Handlers act differently based on MODE
 * MODE_SELECT events are converted to 'xseen' CustomEvent and can bubble up past <xseen>
 * MODE_NAVIGATION events are 'captured' (not bubbled) and drive the camera position
 *
 * In MODE_SELECT
 *	mousedown	sets redispatch to TRUE
 *	click		Activates 
 *	dblclick	??
 *	mouseup		terminates select
 *	mousemove	sets redispatch to FALSE
 *	In all cases, recreate event as type='xseen' and dispatch from geometry when
 *	redispatch is TRUE. 
 */
				canvasHandler: function (ev)
					{
						//console.log ('Primary canvas event handler for event type: ' + ev.type);
						var sceneInfo = ev.currentTarget._xseen.sceneInfo;
						var localXseen = sceneInfo.xseen;
						var lEvents = localXseen.Events;
						var type = ev.type;
						if (type == 'mousedown') {
							lEvents.redispatch = true;
							lEvents.mode = lEvents.MODE_SELECT;
							lEvents.mouse.x = (ev.clientX / 800) * 2 -1;	// TODO: Use real XSeen display sizes
							lEvents.mouse.y = (ev.clientY / 450) * 2 -1;
							//
							lEvents.raycaster.setFromCamera(lEvents.mouse, sceneInfo.element._xseen.renderer.activeCamera);
							var hitGeometryList = lEvents.raycaster.intersectObjects (sceneInfo.selectable, true);
							if (hitGeometryList.length != 0) {
								lEvents.object = hitGeometryList[0];
							} else {
								lEvents.object = {};
								lEvents.redispatch = false;
								lEvents.mode = lEvents.MODE_NAVIGATION;
							}
						}
						if ((lEvents.redispatch || type == 'click' || type == 'dblclick') && typeof(lEvents.object.object) !== 'undefined') {
							// Generate an XSeen (Custom)Event of the same type and dispatch it
							var newEv = lEvents.createEvent (ev, lEvents.object);
							lEvents.object.object.userData.dispatchEvent(newEv);
							ev.stopPropagation();		// No propagation beyond this tag
						} else {
							//console.log ('Navigation mode...');
						}
						if (type == 'mouseup') {
							lEvents.redispatch = false;
							lEvents.mode = lEvents.MODE_NAVIGATION;
						}
					},

				createEvent: function (ev, selectedObject)
					{
						var properties = {
								'detail':		{					// This object contains all of the XSeen data
										'type':			ev.type,
										'originalType':	ev.type,
										'originator':	selectedObject.object.userData,
										'position': {
												'x': selectedObject.point.x,
												'y': selectedObject.point.y,
												'z': selectedObject.point.z,
												},
										'normal': {
												'x': 0,
												'y': 0,
												'z': 0,
												},
										'uv': {
												'x': selectedObject.uv.x,
												'y': selectedObject.uv.y,
												},
										'screenX':	ev.screenX,
										'screenY':	ev.screenY,
										'clientX':	ev.clientX,
										'clientY':	ev.clientY,
										'ctrlKey':	ev.ctrlKey,
										'shiftKey':	ev.shiftKey,
										'altKey': 	ev.altKey,
										'metaKey':	ev.metaKey,
										'button':	ev.button,
										'buttons':	ev.buttons,
												},
								'bubbles':		ev.bubbles,
								'cancelable':	ev.cancelable,
								'composed':		ev.composed,
							};

						var newEvent = new CustomEvent('xseen', properties);
						return newEvent;
					},
				// Uses method described in https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
				// to change 'this' for the handler method. Want 'this' to refer to the target node.
				addHandler: function (route, source, eventName, destination, field)
					{
						var handler = {};
						handler.route = route;					// Route element
						handler.source = source;				// Source element
						handler.type = eventName;				// Event type
						handler.destination = destination;		// Destination element
						handler.field = field;					// Destination field structure
						handler.handler = destination._xseen.handlers[field.handlerName];
						this.routes.push (handler);
						if (typeof(source._xseen) === 'undefined') {	// DOM event
							source.addEventListener (eventName, function(ev) {
								handler.handler(ev)
								});
						} else {								// XSeen event
							source.addEventListener ('xseen', function(ev) {
								handler.handler(ev)
								});
						}
					},

				// Generic notification handler for XSeen's canvas
				XSeenHandler: function (ev)
					{
						console.log ('XSeen DEBUG Event Bubble handler ('+ev.type+'/'+ev.eventPhase+').');
					},
				XSeenDebugHandler : function (ev)
					{
						console.log ('XSeen DEBUG Event Capture handler ('+ev.type+'/'+ev.eventPhase+').');
					},
			};

		this.debug = {
			INFO:       "INFO",
			WARNING:    "WARNING",
			ERROR:      "ERROR",
			EXCEPTION:  "EXCEPTION",
    
	// determines whether debugging/logging is active. If set to "false"
	// no debugging messages will be logged.
			isActive: false,

    // stores if firebug is available
			isFirebugAvailable: false,
    
    // stores if the xseen.debug object is initialized already
			isSetup: false,
	
	// stores if xseen.debug object is append already (Need for IE integration)
			isAppend: false,

    // stores the number of lines logged
			numLinesLogged: 0,
    
    // the maximum number of lines to log in order to prevent
    // the browser to slow down
			maxLinesToLog: 10000,

	// the container div for the logging messages
			logContainer: null,
    
    /** @brief Setup the xseen.debug object.

        Checks for firebug and creates the container div for the logging 
		messages.
      */
			setup: function() {
				// If debugging is already setup simply return
				if (xseen.debug.isSetup) { return; }

				// Check for firebug console
				try {
					if (window.console.firebug !== undefined) {
						xseen.debug.isFirebugAvailable = true;           
					}
				}
				catch (err) {
					xseen.debug.isFirebugAvailable = false;
				}
        
				xseen.debug.setupLogContainer();

				// setup should be setup only once, thus store if we done that already
				xseen.debug.isSetup = true;
			},
	
	/** @brief Activates the log
      */
			activate: function(visible) {
				xseen.debug.isActive = true;
		
        //var aDiv = document.createElement("div");
        //aDiv.style.clear = "both";
        //aDiv.appendChild(document.createTextNode("\r\n"));
        //aDiv.style.display = (visible) ? "block" : "none";
				xseen.debug.logContainer.style.display = (visible) ? "block" : "none";
		
		//Need this HACK for IE/Flash integration. IE don't have a document.body at this time when starting Flash-Backend
				if(!xseen.debug.isAppend) {
					if(navigator.appName == "Microsoft Internet Explorer") {
				//document.documentElement.appendChild(aDiv);
						xseen.debug.logContainer.style.marginLeft = "8px";
						document.documentElement.appendChild(xseen.debug.logContainer);
					}else{
				//document.body.appendChild(aDiv);
						document.body.appendChild(xseen.debug.logContainer);
					}
					xseen.debug.isAppend = true;
				}
			},

	/** @brief Inserts a container div for the logging messages into the HTML page
      */
			setupLogContainer: function() {
				xseen.debug.logContainer = document.createElement("div");
				xseen.debug.logContainer.id = "xseen_logdiv";
				xseen.debug.logContainer.setAttribute("class", "xseen-logContainer");
				xseen.debug.logContainer.style.clear = "both";
		//document.body.appendChild(xseen.debug.logContainer);
			},

	/** @brief Generic logging function which does all the work.

		@param msg the log message
		@param logType the type of the log message. One of INFO, WARNING, ERROR 
					   or EXCEPTION.
      */
			doLog: function(msg, logType) {

		// If logging is deactivated do nothing and simply return
				if (!xseen.debug.isActive) { return; }

		// If we have reached the maximum number of logged lines output
		// a warning message
				if (xseen.debug.numLinesLogged === xseen.debug.maxLinesToLog) {
					msg = "Maximum number of log lines (=" + xseen.debug.maxLinesToLog + ") reached. Deactivating logging...";
				}

		// If the maximum number of log lines is exceeded do not log anything
		// but simply return 
				if (xseen.debug.numLinesLogged > xseen.debug.maxLinesToLog) { return; }

		// Output a log line to the HTML page
				var node = document.createElement("p");
				node.style.margin = 0;
				switch (logType) {
					case xseen.debug.INFO:
						node.style.color = "#009900";
						break;
					case xseen.debug.WARNING:
						node.style.color = "#cd853f";
						break;
					case xseen.debug.ERROR:
						node.style.color = "#ff4500";
						break;
					case xseen.debug.EXCEPTION:
						node.style.color = "#ffff00";
						break;
					default: 
						node.style.color = "#009900";
						break;
				}
		
		// not sure if try/catch solves problem http://sourceforge.net/apps/trac/x3dom/ticket/52
		// but due to no avail of ATI gfxcard can't test
				try {
					node.innerHTML = logType + ": " + msg;
					xseen.debug.logContainer.insertBefore(node, xseen.debug.logContainer.firstChild);
				} catch (err) {
					if (window.console.firebug !== undefined) {
						window.console.warn(msg);
					}
				}
        
		// Use firebug's console if available
				if (xseen.debug.isFirebugAvailable) {
					switch (logType) {
						case xseen.debug.INFO:
							window.console.info(msg);
							break;
						case xseen.debug.WARNING:
							window.console.warn(msg);
							break;
						case xseen.debug.ERROR:
							window.console.error(msg);
							break;
						case xseen.debug.EXCEPTION:
							window.console.debug(msg);
							break;
						default: 
							break;
					}
				}
        
				xseen.debug.numLinesLogged++;
			},
    
    /** Log an info message. */
			logInfo: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.INFO);
			},
    
    /** Log a warning message. */
			logWarning: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.WARNING);
			},
    
    /** Log an error message. */
			logError: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.ERROR);
			},
    
    /** Log an exception message. */
			logException: function(msg) {
				xseen.debug.doLog(msg, xseen.debug.EXCEPTION);
			},

    /** Log an assertion. */
			assert: function(c, msg) {
				if (!c) {
					xseen.debug.doLog("Assertion failed in " + xseen.debug.assert.caller.name + ': ' + msg, xseen.debug.ERROR);
				}
			},
	
	/**
	 Checks the type of a given object.
	 
	 @param obj the object to check.
	 @returns one of; "boolean", "number", "string", "object",
	  "function", or "null".
	*/
			typeOf: function (obj) {
				var type = typeof obj;
				return type === "object" && !obj ? "null" : type;
			},

	/**
	 Checks if a property of a specified object has the given type.
	 
	 @param obj the object to check.
	 @param name the property name.
	 @param type the property type (optional, default is "function").
	 @returns true if the property exists and has the specified type,
	  otherwise false.
	*/
			exists: function (obj, name, type) {
				type = type || "function";
				return (obj ? this.typeOf(obj[name]) : "null") === type;
			},
	
	/**
	 Dumps all members of the given object.
	*/
			dumpFields: function (node) {
				var str = "";
				for (var fName in node) {
					str += (fName + ", ");
				}
				str += '\n';
				xseen.debug.logInfo(str);
				return str;
			}
		};
// Call the setup function to... umm, well, setup xseen.debug
		this.debug.setup();

	};
// File: ./Nav-Viewpoint.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * This is all new code.
 * Portions of XSeen extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * Dual licensed under the MIT and GPL
 */


/*
 * xseen.Navigation.<mode>(label);
 * Computes the new viewing location for the specific mode.
 *
 *	Each Navigation method takes the following parameters:
 *		speed	Floating point value indicating motion speed. 
 *				Units are distance per milli-second for linear motion or
 *				revolutions (2*pi) per milli-second for angular motion
 *		deltaT	Time since last update in milli-seconds
 *			TODO: This is not true for the Turntable class of camera motion -- which isn't really Navigation anyway
 *		scene	The 'sceneInfo' object for this HTML instance
 *		camera	The current (active) camera (aka scene.element._xseen.renderer.activeCamera)
 *
 * Navigation is the user-controlled process of moving in the 3D world.
 * 
 */

xseen.Navigation = {
	'TwoPi'		: 2 * Math.PI,
	'none'		: function () {},		// Does not allow user-controlled navigation
	
	'turntable'	: function (speed, deltaT, scene, camera)
		{
			var T, radians, radius, vp;
			T = (new Date()).getTime() - xseen.timeStart;
			radians = T * speed * this.TwoPi;
			vp = scene.stacks.Viewpoints.getActive();			// Convienence declaration
			radius = vp.fields._radius0;
			camera.position.x = radius * Math.sin(radians)
			camera.position.y = vp.fields.position[1] * Math.cos(1.5*radians);
			camera.position.z = radius * Math.cos(radians);
			camera.lookAt(scene.ORIGIN);
		},

	'tilt'		: function (speed, deltaT, scene, camera)
		{
			var T, radians, vp;
			T = (new Date()).getTime() - xseen.timeStart;
			radians = T * speed * this.TwoPi;
			vp = scene.stacks.Viewpoints.getActive();			// Convienence declaration
			camera.position.y = vp.fields.position[1] * Math.cos(1.5*radians);
			camera.lookAt(scene.ORIGIN);
		},
		
	'setup'		: {
		'none'		: function () {return null;},
		
		'orbit'		: function (camera, renderer)
			{
				var controls;
				controls = new THREE.OrbitControls( camera, renderer.domElement );
				//controls.addEventListener( 'change', render ); // remove when using animation loop
				// enable animation loop when using damping or autorotation
				//controls.enableDamping = true;
				//controls.dampingFactor = 0.25;
				controls.enableZoom = false;
				controls.enableZoom = true;
				return controls;
			},
		},
};
// File: ./NodeDefinitions.js
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
 * xseen.nodes.<nodeName> is the definition of <nodeName>
 * All internal variables are stored in ._internal. All functions start with '_'
 *
 * This is a bare-bones setup. There is no error checking - missing arguments or
 * methods that do not exist (e.g., <nodeMethod>.init)
 *
 * These are intended to be development support routines. It is anticipated that in
 * production systems the array dump (_dumpTable) would be loaded. As a result, it is necessary
 * to have a routine that dumps out the Object so it can be captured and saved. A routine
 * or documentation on how to load the Object would also be good. 
 *
 * Fields are added with the .addField method. It takes its values from the argument list
 * or an object passed as the first argument. The properties of the argument are:
 *	name - the name of the field. This is converted to lowercase before use
 *	datatype - the datatype of the field. There must be a method in xseen.types by this name
 *	defaultValue - the default value of the field to be used if the field is not present or incorrectly defined.
 *					If this argument is an array, then it is the set of allowed values. The first element is the default.
 *	enumerated - the list of allowed values when the datatype only allows specific values for this field (optional)
 *	animatable - Flag (T/F) indicating if the field is animatable. Generally speaking, enumerated fieles are not animatable
 */

xseen.nodes = {
	'_defineNode' : function(nodeName, nodeComponent, nodeMethod) {
		methodBase = 'xseen.node.';
		methodBase = '';
		node = {
				'tag'		: nodeName,
				'taglc'		: nodeName.toLowerCase(),
				'component' : nodeComponent,
				'method'	: methodBase + nodeMethod,
				'fields'	: [],
				'fieldIndex': [],
				'addField'	: function (fieldObj, datatype, defaultValue) {
					var fieldName, namelc, enumerated, animatable;
					if (typeof(fieldObj) === 'object') {
						fieldName		= fieldObj.name;
						datatype		= fieldObj.datatype;
						defaultValue	= fieldObj.defaultValue;
						enumerated		= (typeof(fieldObj.enumerated) === 'undefined') ? [] : fieldObj.enumerated;
						animatable		= (typeof(fieldObj.animatable) === 'undefined') ? false : fieldObj.animatable;
					} else {
						fieldName	= fieldObj;
						animatable	= false;
						if (typeof(defaultValue) == 'array') {
							enumerated	= defaultValue;
							defaultValue = enumerated[0];
						} else {
							enumerated = [];
						}
					}
					namelc = fieldName.toLowerCase();
					this.fields.push ({
								'field'			: fieldName,
								'fieldlc'		: namelc,
								'type'			: datatype,
								'default'		: defaultValue,
								'enumeration'	: enumerated,
								'animatable'	: animatable,
								'clone'			: this.cloneField,
								'setFieldName'	: this.setFieldName,
								});
					this.fieldIndex[namelc] = this.fields.length-1;
					return this;
				},
				'addNode'	: function () {
					xseen.parseTable[this.taglc] = this;
				},
				'cloneField'	: function () {
					var newFieldObject = {
								'field'			: this.field,
								'fieldlc'		: this.fieldlc,
								'type'			: this.type,
								'default'		: 0,
								'enumeration'	: [],
								'animatable'	: this.animatable,
								'clone'			: this.clone,
								'setFieldName'	: this.setFieldName,
					};
					for (var i=0; i<this.enumeration.length; i++) {
						newFieldObject.enumeration.push(this.enumeration[i]);
					}
					if (Array.isArray(this.default)) {
						newFieldObject.default = [];
						for (var i=0; i<this.default.length; i++) {
							newFieldObject.default.push(this.default[i]);
						}
					} else {
						newFieldObject.default = this.default;
					}
					return newFieldObject;
				},
				'setFieldName'	: function(newName) {
					this.field = newName;
					this.fieldlc = newName.toLowerCase();
					return this;
				},
		}
		return node;
	},
/*
 *	Returns all of the available information about a specified field in a given node. The
 *	property 'good' indicates that everything was found and could be handled. If 'good' is FALSE, then
 *	something went wrong or is missing.
 */
	'_getFieldInfo' : function (nodeName, fieldName) {
		var fieldInfo = {'good': false, 'nodeExists': false, 'fieldExists': false};
		if (typeof(nodeName) === 'undefined' || nodeName == '' || typeof(fieldName) === 'undefined' || fieldName == '') {return fieldInfo;}
		var nodeLC = nodeName.toLowerCase();
		if (typeof(xseen.parseTable[nodeLC]) === 'undefined') {
			return fieldInfo;
		}
		fieldInfo.nodeExists = true;
		var node = xseen.parseTable[nodeLC];
		var fieldLC = fieldName.toLowerCase();
		if (typeof(node.fieldIndex[fieldLC]) === 'undefined') {
			return fieldInfo;
		}
		fieldInfo.fieldExists = true;
		var field = node.fields[node.fieldIndex[fieldLC]];
		fieldInfo.node = node;
		fieldInfo.field = field;
		fieldInfo.handlerName = 'set' + field.field;
		fieldInfo.dataType = field.type;
		fieldInfo.good = true;
		return fieldInfo;
	},
/*
 *	Parse fields of an HTML tag (called element) using the field information from the defined 'node'
 *	If the first character of the field value is '#', then the remainder is treated as an ID and the
 *	field value is obtained from that HTML tag prior to parsing. The referenced tag's attribute name
 *	is the same name as the attribute of the parsed 'node'.
 *	If the field value is '*', then all attributes of the HTML tag are parsed as strings. Typically this is 
 *	only used for mixin assets.
 */
	'_parseFields' : function(element, node) {
		element._xseen.fields = [];		// fields for this node
		element._xseen.animate = [];	// animatable fields for this node
		element._xseen.animation = [];	// array of animations on this node
		element._xseen.parseAll = false;
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				var value = this._parseField (field, element);
				if (value == 'xseen.parse.all') {
					element._xseen.parseAll = true;
				} else {
					element._xseen.fields[field.fieldlc] = value;
					if (field.animatable) {element._xseen.animate[field.fieldlc] = null;}
				}
			}, this);
/*
		node.fields.forEach (function (field, ndx, wholeThing)
			{
				if (field.field == '*') {
					this._xseen.parseAll = true;
				} else {
					var value = this.getAttribute(field.fieldlc);
					if (value !== null && value.substr(0,1) == '#') {		// Asset reference
						var re = document.getElementById(value.substr(1,value.length));
						value = re._xseen.fields[field.fieldlc] || '';
					}
					value = xseen.types[field.type] (value, field.default);
					this._xseen.fields[field.fieldlc] = value;
				}
			}, element);
 */
		if (element._xseen.parseAll) {
			for (var i=0; i<element.attributes.length; i++) {
				if (typeof(element._xseen.fields[element.attributes[i].name]) === 'undefined') {
					element._xseen.fields[element.attributes[i].name.toLowerCase()] = element.attributes[i].value;
				}
			}
		}
	},
	
	'_parseField' : function (field, e) {
		if (field.field == '*') {
			return 'xseen.parse.all';
			//this._xseen.parseAll = true;
		} else {
			var value = e.getAttribute(field.fieldlc);
			if (value !== null && value.substr(0,1) == '#') {		// Asset reference
				var re = document.getElementById(value.substr(1,value.length));
				value = re._xseen.fields[field.fieldlc] || '';
			}
			value = xseen.types[field.type] (value, field.default, field.enumeration);
			return value;
		}
	},


	'_dumpTable' : function() {
		var jsonstr = JSON.stringify ({'nodes': xseen.parseTable}, null, '  ');
		console.log('Node parsing table (' + xseen.parseTable.length + ' nodes)\n' + jsonstr);
	}
};
	
// File: ./Parse.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Some pieces may be
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 *
 * Removed code for
 * - ActiveX 
 * - Flash
 * 
 */
 

xseen.Parse = function (element, parent, sceneInfo) {
	var nodeName = element.localName.toLowerCase();
	//xseen.debug.logInfo("Parse " + nodeName);
	if (typeof(element._xseen) == 'undefined') {element._xseen = {};}
	if (typeof(element._xseen.children) == 'undefined') {element._xseen.children = [];}
	if (typeof(xseen.parseTable[nodeName]) == 'undefined') {
		xseen.debug.logInfo("Unknown node: " + nodeName);
	} else {
		xseen.nodes._parseFields (element, xseen.parseTable[nodeName]);
		console.log ('Calling node: ' + nodeName + '. Method: ' + xseen.parseTable[nodeName].method + '.init (e,p)');
		xseen.node[xseen.parseTable[nodeName].method].init (element, parent);
	}
	
	for (element._xseen.parsingCount=0; element._xseen.parsingCount<element.childElementCount; element._xseen.parsingCount++) {
		element.children[element._xseen.parsingCount]._xseen = {};
		element.children[element._xseen.parsingCount]._xseen.children = [];
		element.children[element._xseen.parsingCount]._xseen.sceneInfo = element._xseen.sceneInfo;
		this.Parse (element.children[element._xseen.parsingCount], element, sceneInfo);
		//xseen.debug.logInfo(".return from Parse with current node |" + element.children[element._xseen.parsingCount].localName + "|");
	}

	if (typeof(xseen.parseTable[nodeName]) !== 'undefined') {
		xseen.node[xseen.parseTable[nodeName].method].fin (element, parent);
		//xseen.debug.logInfo("..parsing children data of |" + nodeName + "|");
		// --> xseen.node[xseen.nodeDefinitions[nodeName].method].endParse (element, parent);
	}
	//xseen.debug.logInfo("  reached bottom, heading back up from |" + nodeName + "|");
}
// File: ./Properties.js
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */


xseen.Properties = function() {
    this.properties = {};
};

xseen.Properties.prototype.setProperty = function(name, value) {
    xseen.debug.logInfo("Properties: Setting property '"+ name + "' to value '" + value + "'");
    this.properties[name] = value;
};

xseen.Properties.prototype.getProperty = function(name, def) {
    if (this.properties[name]) {
        return this.properties[name]
    } else {
        return def;
    }
};

xseen.Properties.prototype.merge = function(other) {
    for (var attrname in other.properties) {
        this.properties[attrname] = other.properties[attrname];
    }
};

xseen.Properties.prototype.toString = function() {
    var str = "";
    for (var name in this.properties) {
        str += "Name: " + name + " Value: " + this.properties[name] + "\n";
    }
    return str;
};
// File: ./StackHandler.js
/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * This is all new code.
 * Portions of XSeen extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * Dual licensed under the MIT and GPL
 */


/*
 * xseen.utlis.StackHandler(label);
 * Creates a new stack that is managed by this class
 * 
 * Note that the Push-Down stack (aka FILO) is implemented as a reverse list
 * so that the Array methods .push and .pop can be used. The end of the array
 * is the "top-most" element in the stack.
 */

xseen.utils.StackHandler = function (label) {
	this._internals				= {};		// Internal class storage
	this._internals.label		= label;	// Unique user-supplied name for this stack
	this._internals.stack		= [];		// Maintains the stack. Last entry on stack is active
	this._internals.active		= -1;		// Index of currently active list element
	this._internals.activeNode	= {};		// Entry of currently active list element
	this._internals.defaultNode	= {};		// The default entry to be active if nothing else is

	this._setActiveNode = function() {		// Sets the entry specified by nodeId as active
		this._internals.active = this._internals.stack.length-1;
		if (this._internals.active >= 0) {
			this._internals.activeNode = this._internals.stack[this._internals.active];
		} else {
			this._internals.activeNode = this._internals.defaultNode;
		}
	}

	this.init = function() {		// Clears existing stack
		this._internals.stack = [];
	}

	this.pushDown = function(node) {		// Push new node onto stack and make active
		this._internals.stack.push (node);
		this._setActiveNode();
	}

	this.popOff = function() {			// Pop node off stack and make next one active
		this._internals.stack.pop();
		this._setActiveNode();
	}

	this.getActive = function() {
		return this._internals.activeNode;
	}
	
	this.setDefault = function(node) {
		this._internals.defaultNode = node;
		if (Object.keys(this._internals.activeNode).length === 0) {
			this._internals.activeNode = this._internals.defaultNode;
		}
	}
}
// File: ./Types.js
/*
 * xseen.types contains the datatype and conversion utilities. These convert one format to another.
 * Any method ending in 'toX' where 'X' is some datatype is a conversion to that type
 * Other methods convert from string with space-spearated values
 */
xseen.types = {
	'Deg2Rad'	: Math.PI / 180,

	'SFFloat'	: function (value, def)
		{
			if (value === null) {return def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFInt'	: function (value, def)
		{
			if (value === null) {return def;}
			if (Number.isNaN(value)) {return def};
			return Math.round(value);
		},

	'SFBool'	: function (value, def)
		{
			if (value === null) {return def;}
			if (value) {return true;}
			if (!value) {return false;}
			return def;
		},

	'SFTime'	: function (value, def)
		{
			if (value === null) {return def;}
			if (Number.isNaN(value)) {return def};
			return value;
		},

	'SFVec3f'	: function (value, def)
		{
			if (value === null) {return def;}
			var v3 = value.split(' ');
			if (v3.length < 3 || Number.isNaN(v3[0]) || Number.isNaN(v3[1]) || Number.isNaN(v3[2])) {
				return def;
			}
			return [v3[0]-0, v3[1]-0, v3[2]-0];
		},

	'SFVec2f'	: function (value, def)
		{
			if (value === null) {return def;}
			var v2 = value.split(' ');
			if (v2.length != 2 || Number.isNaN(v2[0]) || Number.isNaN(v2[1])) {
				return def;
			}
			return [v2[0]-0, v2[1]-0];
		},

	'SFRotation'	: function (value, def)
		{
			if (value === null) {return def;}
			var v4 = value.split(' ');
			if (v4.length != 4 || Number.isNaN(v4[0]) || Number.isNaN(v4[1]) || Number.isNaN(v4[2]) || Number.isNaN(v4[3])) {
				return def;
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

//	For MF* types, a default of '' means to return an empty array on parsing error
	'MFFloat'	: function (value, def)
		{
			var defReturn = (def == '') ? [] : def;
			if (value === null) {return defReturn;}
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i++) {
				if (mi[i] == '') {continue;}
				if (Number.isNaN(mi[i])) {return defReturn};
				rv.push (mi[i]);
			}
			return rv;
		},

	'MFInt'		: function (value, def)
		{
			var defReturn = (def == '') ? [] : def;
			if (value === null) {return defReturn;}
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i++) {
				if (mi[i] == '') {continue;}
				if (Number.isNaN(mi[i])) {return defReturn};
				rv.push (Math.round(mi[i]));
			}
			return rv;
		},

	'MFVec3f'	: function (value, def)
		{
			var defReturn = (def == '') ? [] : def;
			if (value === null) {return defReturn;}
			value = value.trim().replace(/\s+/g, ' ');
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i=i+3) {
				if (Number.isNaN(mi[i])) {return defReturn};
				if (Number.isNaN(mi[i+1])) {return defReturn};
				if (Number.isNaN(mi[i+2])) {return defReturn};
				rv.push ([mi[i]-0, mi[i+1]-0, mi[i+2]-0]);
			}
			return rv;
		},

	'MFColor'	: function (value, def)
		{
			if (value === null) {return def;}
			value = value.trim().replace(/\s+/g, ' ');
			var mi = value.split(' ');
			var rv = [];
			for (var i=0; i<mi.length; i=i+3) {
				if (Number.isNaN(mi[i])) {return def};
				if (Number.isNaN(mi[i+1])) {return def};
				if (Number.isNaN(mi[i+2])) {return def};
				rv.push ([Math.min(Math.max(mi[i]-0, 0.0), 1.0), Math.min(Math.max(mi[i+1]-0, 0.0), 1.0), Math.min(Math.max(mi[i+2]-0, 0.0), 1.0)]);
			}
			return rv;
		},

// A-Frame data types

// value can be any CSS color (#HHH, #HHHHHH, 24-bit Integer, name)
	'Color'	: function (value, defaultString)
		{
			return defaultString;
		},
	
// XSeen data types
	'EnumerateString' : function (value, defString, choices)
		{
			value = this.SFString (value, defString);
			for (var i=0; i<choices.length; i++) {
				if (value == choices[i]) {return value;}
			}
			return defString;
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
// File: ./zVersion.js
/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 */

/*
 * Version Information for XSeen
 */
xseen.generateVersion = function () {
	var Major, Minor, Patch, PreRelease, Release, Date, SpashText;
	Major		= 0;
	Minor		= 4;
	Patch		= 3;
	PreRelease	= '';
	Release		= 21;
	Version		= '';
	Date		= '2017-07-09';
	SplashText	= ["XSeen 3D Language parser.", "XSeen <a href='http://tools.realism.com/specification/xseen' target='_blank'>Documentation</a>."];
/*
 * All X3D and A-Frame pre-defined solids, fixed camera, directional light, Material texture only, glTF model loader with animations, Assets and reuse, Viewpoint, Background, Lighting, Image Texture, [Indexed]TriangleSet, IndexedFaceSet, [Indexed]QuadSet<br>\nNext work<ul><li>Event Model/Animation</li><li>Extrusion</li><li>Navigation</li></ul>",
 *
 * All of the following are ALPHA releases for V0.4.x
 * V0.4.0+13 Feature -- events (from HTML to XSeen)
 * V0.4.1+14 Fix - minor text correction in xseen.node.geometry__TriangulateFix (nodes-x3d_Geometry.js)
 * V0.4.1+15 Modified build.pl to increase compression by removing block comments
 * V0.4.1+16 Feature -- XSeen events (from XSeen to HTML)
 * V0.4.2+17 Feature -- XSeen internals events (from XSeen to XSeen) with changes to fix previous event handling
 * V0.4.2+18 Feature -- Split screen VR display
 * V0.4.3+19 Rebuild and fix loading caused by new Stereo library
 * V0.4.3+20 Feature -- Navigation (rotate), including Stack update for Viewpoint and restructuring the rendering loop
 * V0.4.3+21 Feature -- Changed handling of Viewpoint to include camera motion
 *
 * In progress
 */
	var version = {
		major		: Major,
		minor		: Minor,
		patch		: Patch,
		preRelease	: PreRelease,
		release		: Release,
		version		: '',
		date		: Date,
		splashText	: SplashText
	};
// Using the scheme at http://semver.org/
	version.version = version.major + '.' + version.minor + '.' + version.patch;
	version.version += (version.preRelease != '') ? '-' + version.preRelease : '';
	version.version += (version.release != '') ? '+' + version.release : '';
	return version;
}
// File: nodes/nodes-af.js
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
xseen.node.af_Assets = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p) {}
};
xseen.node.af_AssetItem = {
	'init'	: function (e,p) 		// Only field is SRC.
		{
		},
	'fin'	: function (e,p) {}
};
xseen.node.af_Mixin = {
	'init'	: function (e,p) 		// Lots of fields -- all nebelous until used
		{
		},
	'fin'	: function (e,p) {}
};



xseen.node.af_Appearance = function (e) {
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
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
			mesh.userData = e;
			p._xseen.sceneInfo.selectable.push(mesh);
			var group = new THREE.Group();
			group.add (mesh);
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(group);
		},
	'fin'	: function (e,p) {}
};
// File: nodes/nodes-Viewing.js
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


xseen.node.unk_Viewpoint = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints
			e._xseen.fields._radius0 = Math.sqrt(	e._xseen.fields.position[0]*e._xseen.fields.position[0] + 
													e._xseen.fields.position[1]*e._xseen.fields.position[1] + 
													e._xseen.fields.position[2]*e._xseen.fields.position[2]);
			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.position = new THREE.Vector3(e._xseen.fields.position[0], e._xseen.fields.position[1], e._xseen.fields.position[2]);
			e._xseen.type = e._xseen.fields.cameratype;
			e._xseen.motion = e._xseen.fields.motion;
			e._xseen.motionspeed = e._xseen.fields.motionspeed * 1000;
			if (e._xseen.motion == 'turntable' || e._xseen.motion == 'tilt') {e._xseen.motionspeed = 1.0/e._xseen.motionspeed;}

			if (!e._xseen.sceneInfo.tmp.activeViewpoint) {
				e._xseen.sceneInfo.stacks.Viewpoints.pushDown(e._xseen);
				e._xseen.sceneInfo.tmp.activeViewpoint = true;
			}

			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
		},
	'fin'	: function (e,p) {},

	'setactive'	: function (ev)
		{
			var xseenNode = this.destination._xseen;
			xseenNode.sceneInfo.stacks.Viewpoints.pushDown(xseenNode);	// TODO: This is probably not the right way to change VP in the stack
			xseenNode.sceneInfo.element._xseen.renderer.activeCamera = 
				xseenNode.sceneInfo.element._xseen.renderer.cameras[xseenNode.fields.type];
			xseenNode.sceneInfo.element._xseen.renderer.activeRender = 
				xseenNode.sceneInfo.element._xseen.renderer.renderEffects[xseenNode.fields.type];
			if (xseenNode.fields.type != 'stereo') {
				xseenNode.sceneInfo.element._xseen.renderer.activeRender.setViewport( 0, 0, xseenNode.sceneInfo.size.width, this.destination._xseen.sceneInfo.size.height);
			}
		},
};

xseen.node.controls_Navigation = {
	'init'	: function (e,p)
		{	// This should really go in a separate push-down list for Viewpoints

			e._xseen.domNode = e;	// Back-link to node if needed later on
			e._xseen.speed = e._xseen.fields.speed;
			e._xseen.type = e._xseen.fields.type;
			e._xseen.type = 'none';
			e._xseen.setup = e._xseen.fields.type;
			if (!(e._xseen.type == 'none' || e._xseen.type == 'turntable' || e._xseen.type == 'tilt')) {e._xseen.type = 'none';}
			if (!(e._xseen.setup == 'orbit')) {e._xseen.setup = 'none';}

			if (!e._xseen.sceneInfo.tmp.activeNavigation) {
				e._xseen.sceneInfo.stacks.Navigation.pushDown(e._xseen);
				e._xseen.sceneInfo.tmp.activeNavigation = true;
			}
			
			e._xseen.handlers = {};
			e._xseen.handlers.setactive = this.setactive;
		},
	'fin'	: function (e,p) {},

	'setactive'	: function (ev)
		{
/*
			this.destination._xseen.sceneInfo.stacks.Viewpoints.pushDown(this.destination);	// TODO: This is probably not the right way to change VP in the stack
			this.destination._xseen.sceneInfo.element._xseen.renderer.activeCamera = 
				this.destination._xseen.sceneInfo.element._xseen.renderer.cameras[this.destination._xseen.fields.type];
			this.destination._xseen.sceneInfo.element._xseen.renderer.activeRender = 
				this.destination._xseen.sceneInfo.element._xseen.renderer.renderEffects[this.destination._xseen.fields.type];
			if (this.destination._xseen.fields.type != 'stereo') {
				this.destination._xseen.sceneInfo.element._xseen.renderer.activeRender.setViewport( 0, 0, this.destination._xseen.sceneInfo.size.width, this.destination._xseen.sceneInfo.size.height);
			}
 */
		},
};

xseen.node.lighting_Light = {
	'init'	: function (e,p) 
		{
			var color = xseen.types.Color3toInt (e._xseen.fields.color);
			var intensity = e._xseen.fields.intensity - 0;
			var lamp, type=e._xseen.fields.type.toLowerCase();
/*
			if (typeof(p._xseen.children) == 'undefined') {
				console.log('Parent of Light does not have children...');
				p._xseen.children = [];
			}
 */

			if (type == 'point') {
				// Ignored field -- e._xseen.fields.location
				lamp = new THREE.PointLight (color, intensity);
				lamp.distance = Math.max(0.0, e._xseen.fields.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.fields.attenuation[1]/2 + e._xseen.fields.attenuation[2]);

			} else if (type == 'spot') {
				lamp = new THREE.SpotLight (color, intensity);
				lamp.position.set(0-e._xseen.fields.direction[0], 0-e._xseen.fields.direction[1], 0-e._xseen.fields.direction[2]);
				lamp.distance = Math.max(0.0, e._xseen.fields.radius - 0);
				lamp.decay = Math.max (.1, e._xseen.fields.attenuation[1]/2 + e._xseen.fields.attenuation[2]);
				lamp.angle = Math.max(0.0, Math.min(1.5707963267948966192313216916398, e._xseen.fields.cutoffangle));
				lamp.penumbra = 1 - Math.max(0.0, Math.min(lamp.angle, e._xseen.fields.beamwidth)) / lamp.angle;

			} else {											// DirectionalLight (by default)
				lamp = new THREE.DirectionalLight (color, intensity);
				lamp.position.x = 0-e._xseen.fields.direction[0];
				lamp.position.y = 0-e._xseen.fields.direction[1];
				lamp.position.z = 0-e._xseen.fields.direction[2];
			}
			p._xseen.children.push(lamp);
			lamp = null;
		}
		,
	'fin'	: function (e,p)
		{
		}
};
// File: nodes/nodes-x3d_Appearance.js
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
			e._xseen.animate['diffusecolor'] = p._xseen.material.color;
			e._xseen.animate['emissivecolor'] = p._xseen.material.emissive;
			e._xseen.animate['specularcolor'] = p._xseen.material.specular;
			e._xseen.animate['transparency'] = p._xseen.material.opacity;
			e._xseen.animate['shininess'] = p._xseen.material.shininess;
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_ImageTexture = {
	'init'	: function (e,p)
		{
			p._xseen.texture = xseen.loader.ImageLoader.load(e._xseen.fields.url);
			p._xseen.texture.wrapS = (e._xseen.fields.repeats) ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			p._xseen.texture.wrapT = (e._xseen.fields.repeatt) ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
		},
	'fin'	: function (e,p) {}
};

xseen.node.appearance_Appearance = {
	'init'	: function (e,p) {},

	'fin'	: function (e,p)
		{
			if (typeof(e._xseen.texture) !== 'undefined' && e._xseen.texture !== null) {
				e._xseen.material.map = e._xseen.texture;
			}
			p._xseen.appearance = e._xseen.material;
		}
};
// File: nodes/nodes-x3d_Geometry.js
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
		console.log ('Too few ('+count+') vertices per triangle. No triangulation performed.');
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
// File: nodes/nodes-xseen.js
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


xseen.node.x_Model = {
	'init'	: function (e,p)
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Exteranal Model [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				var uri = xseen.parseUrl (e._xseen.fields.src);
				var loader = xseen.loader[xseen.loadMime[uri.extension].loader];
				loader.load (e._xseen.fields.src, this.loadSuccess({'e':e, 'p':p}), xseen.loadProgress, xseen.loadError);
				e._xseen.requestedUrl = true;
			}
			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},

	'fin'	: function (e,p)
		{
		},

					// Method for adding userdata from https://stackoverflow.com/questions/11997234/three-js-jsonloader-callback
	'loadSuccess' : function (userdata) {
						var e = userdata.e;
						var p  = userdata.p;
						return function (response) {
							e._xseen.processedUrl = true;
							e._xseen.loadText = response;
							console.log("download successful for "+e.id);
							e._xseen.loadGroup.add(response.scene);		// This works for glTF
							p._xseen.sceneInfo.scene.updateMatrixWorld();
							if (response.animations !== null) {				// This is probably glTF specific
								e._xseen.mixer = new THREE.AnimationMixer (response.scene);
								e._xseen.sceneInfo.mixers.push (e._xseen.mixer);
							} else {
								e._xseen.mixer = null;
							}

							if (e._xseen.fields.playonload != '' && e._xseen.mixer !== null) {			// separate method?
								if (e._xseen.fields.playonload == '*') {			// Play all animations
									response.animations.forEach( function ( clip ) {
										//console.log('  starting animation for '+clip.name);
										if (e._xseen.fields.duration > 0) {clip.duration = e._xseen.fields.duration;}
										e._xseen.mixer.clipAction( clip ).play();
									} );
								} else {											// Play a specific animation
									var clip = THREE.AnimationClip.findByName(response.animations, e._xseen.fields.playonload);
									var action = e._xseen.mixer.clipAction (clip);
									action.play();
								}
							}
						}
					}
};


xseen.node.x_Route = {
	'init'	: function (e,p)
		{
			var dest = e._xseen.fields.destination;
			var hand = e._xseen.fields.handler;
			var externalHandler = false;
			
			// Make sure sufficient data is provided
			if (e._xseen.fields.source == '' || 
				typeof(window[hand]) !== 'function' && 
					(dest == '' || e._xseen.fields.event == '' || e._xseen.fields.field == '')) {
				xseen.debug.logError ('Route node missing field. No route setup. Source: '+e._xseen.fields.source+'.'+e._xseen.fields.event+'; Destination: '+dest+'.'+e._xseen.fields.field+'; Handler: '+hand);
				return;
			} else if (typeof(window[hand]) === 'function') {
				externalHandler = true;
			}
			
			// For toNode routing, check existence of source and destination elements
			var eSource = document.getElementById (e._xseen.fields.source);
			if (! externalHandler) {
				eDestination = document.getElementById (dest);
				if (typeof(eSource) === 'undefined' || typeof(eDestination) === 'undefined') {
					xseen.debug.logError ('Source or Destination node does not exist. No route setup');
					return;
				}
				// Get field information -- perhaps there is some use in the Animate node?
				fField = xseen.nodes._getFieldInfo (eDestination.nodeName, e._xseen.fields.field);
				if (typeof(fField) === 'undefined' || !fField.good) {
					xseen.debug.logError ('Destination field does not exist or incorrectly specified. No route setup');
					return;
				}
				// Set up listener on source node for specified event. The listener code is the 'set<field>' method for the
				// node. It is passed the DOM 'event' data structure. Since there may be more than one node of the type
				// specified by 'destination', the event handler is attached to the node in e._xseen.handlers. This is done
				// when the node is parsed
				xseen.Events.addHandler (e, eSource, e._xseen.fields.event, eDestination, fField);

/*
 * External (to XSeen) event handler
 *	TODO: limit the events to those requested if e._xseen.fields.event != 'xseen'
 *	This probably requires an intermediatiary event handler 
 */
			} else {
				var handler = window[hand];
				eSource.addEventListener ('xseen', handler);
			}
		},

	'fin'	: function (e,p)
		{
		},
	'evHandler' : function (u)
		{
			var de = u.e;
			var df = u.f;
			return de._xseen.handlers[df.handlerName];
		},
};
// File: nodes/nodes.js
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


xseen.node.unk_Shape = {
	'init'	: function (e,p) {},
	'fin'	: function (e,p)
		{
//			if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			if (typeof(e._xseen.materialProperty) !== 'undefined') {
				e._xseen.appearance.vertexColors = THREE.VertexColors;
				//e._xseen.appearance.vertexColors = THREE.FaceColors;
				e._xseen.appearance._needsUpdate = true;
				e._xseen.appearance.needsUpdate = true;
			}
			var mesh = new THREE.Mesh (e._xseen.geometry, e._xseen.appearance);
			mesh.userData = e;
			p._xseen.children.push(mesh);
			p._xseen.sceneInfo.selectable.push(mesh);
			mesh = null;
		}
};

xseen.node.grouping_Transform = {
	'init'	: function (e,p) 
		{
			var group = new THREE.Group();
			if (e.nodeName == "TRANSFORM") {
				var rotation = xseen.types.Rotation2Quat(e._xseen.fields.rotation);
				group.name = 'Transform children [' + e.id + ']';
				group.position.x	= e._xseen.fields.translation[0];
				group.position.y	= e._xseen.fields.translation[1];
				group.position.z	= e._xseen.fields.translation[2];
				group.scale.x		= e._xseen.fields.scale[0];
				group.scale.y		= e._xseen.fields.scale[1];
				group.scale.z		= e._xseen.fields.scale[2];
				group.quaternion.x	= rotation.x;
				group.quaternion.y	= rotation.y;
				group.quaternion.z	= rotation.z;
				group.quaternion.w	= rotation.w;

				e._xseen.animate['translation'] = group.position;
				e._xseen.animate['rotation'] = group.quaternion;
				e._xseen.animate['scale'] = group.scale;
			}
			e._xseen.sceneNode = group;
		},
	'fin'	: function (e,p)
		{
			// Apply transform to all objects in e._xseen.children
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					e._xseen.sceneNode.add(child);
				});
			p._xseen.children.push(e._xseen.sceneNode);
		}
};

xseen.node.networking_Inline = {
	'init'	: function (e,p) 
		{
			if (typeof(e._xseen.processedUrl) === 'undefined' || !e._xseen.requestedUrl) {
				var uri = xseen.parseUrl (e._xseen.fields.url);
				var type = uri.extension;
				e._xseen.loadGroup = new THREE.Group();
				e._xseen.loadGroup.name = 'Inline content [' + e.id + ']';
				console.log ('Created Inline Group with UUID ' + e._xseen.loadGroup.uuid);
				var userdata = {'requestType':'x3d', 'e':e, 'p':p}
				if (type.toLowerCase() == 'json') {
					userdata.requestType = 'json';
					xseen.loadMgr.loadJson (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, userdata);
				} else {
					xseen.loadMgr.loadXml (e._xseen.fields.url, this.loadSuccess, xseen.loadProgress, xseen.loadError, userdata);
				}
				e._xseen.requestedUrl = true;
			}
			//if (typeof(p._xseen.children) == 'undefined') {p._xseen.children = [];}
			p._xseen.children.push(e._xseen.loadGroup);
			console.log ('Using Inline Group with UUID ' + e._xseen.loadGroup.uuid);
		},
	'fin'	: function (e,p)
		{
		},

	'loadSuccess' :
				function (response, userdata, xhr) {
					userdata.e._xseen.processedUrl = true;
					userdata.e._xseen.loadResponse = response;
					console.log("download successful for "+userdata.e.id);
					if (userdata.requestType == 'json') {
						var tmp = {'scene': response};
						response = null;
						response = (new JSONParser()).parseJavaScript(tmp);
					}
					var start = {'_xseen':0};
					var findSceneTag = function (fragment) {
						if (typeof(fragment._xseen) === 'undefined') {fragment._xseen = {'childCount': -1};}
						if (fragment.nodeName.toLowerCase() == 'scene') {
							start = fragment;
							return;
						} else if (fragment.children.length > 0) {
							for (fragment._xseen.childCount=0; fragment._xseen.childCount<fragment.children.length; fragment._xseen.childCount++) {
								findSceneTag(fragment.children[fragment._xseen.childCount]);
								if (start._xseen !== 0) {return;}
							}
						} else {
							return;
						}
					}
					findSceneTag (response);	// done this way because function is recursive
					if (start._xseen !== 0) {	// Found 'scene' tag. Need to parse and insert
						console.log("Found legal X3D file with 'scene' tag");
						while (start.children.length > 0) {
							userdata.e.appendChild(start.children[0]);
						}
						xseen.Parse(userdata.e, userdata.p, userdata.p._xseen.sceneInfo);
						userdata.e._xseen.children.forEach (function (child, ndx, wholeThing)
							{
								userdata.e._xseen.loadGroup.add(child);
console.log ('...Adding ' + child.type + ' (' + child.name + ') to Inline Group? with UUID ' + userdata.e._xseen.loadGroup.uuid + ' (' + userdata.e._xseen.loadGroup.name + ')');
							});
						userdata.p._xseen.sceneInfo.scene.updateMatrixWorld();
						//xseen.debug.logInfo("Complete work on Inline...");
					} else {
						console.log("Found illegal X3D file -- no 'scene' tag");
					}
					// Parse (start, userdata.p)...	
				}
};

/*
 * Most of this stuff is only done once per XSeen element. Loading of Inline contents should not
 * repeat the definitions and canvas creation
 */
xseen.node.core_Scene = {
	'DEFAULT'	: {
			'Viewpoint'	: {
				'Position'		: new THREE.Vector3 (0, 0, 10),
				'Orientation'	: '0 1 0 0',		// TODO: fix (and below) when handling orientation
				'Type'			: 'perpsective',
				'Motion'		: 'none',
				'MotionSpeed'	: 1.0,
			},
			'Navigation' : {
				'Speed'		: 1.0,		// 16 spr (1 revolution per 16 seconds), in mseconds.
				'Type'		: 'none',
				'Setup'		: 'none',
			}
		},
	'init'	: function (e,p)
		{
			// Create default Viewpoint and Navigation
			xseen.sceneInfo[0].stacks.Viewpoints.setDefault(
				{
					'position'	: this.DEFAULT.Viewpoint.Position,
					'type'		: this.DEFAULT.Viewpoint.Type,
					'motion'	: this.DEFAULT.Viewpoint.Motion,
					'motionspeed': this.DEFAULT.Viewpoint.MotionSpeed / 1000,
					'domNode'	: e,
					'fields'	: {},
				}
			);
			xseen.sceneInfo[0].stacks.Navigation.setDefault(
				{
					'speed'		: this.DEFAULT.Navigation.Speed / 1000,
					'type'		: this.DEFAULT.Navigation.Type,
					'setup'		: this.DEFAULT.Navigation.Setup,
					'domNode'	: e,
					'fields'	: {},
				}
			);

			var width = e._xseen.sceneInfo.size.width;
			var height = e._xseen.sceneInfo.size.height;
			var x_renderer = new THREE.WebGLRenderer();
			x_renderer.setSize (width, height);
			var perspectiveCamera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
			var orthoCamera = new THREE.OrthographicCamera( 75, width / height, 0.1, 1000 );
			//perspectiveCamera.translateX(this.DEFAULT.Viewpoint.Position.x).translateY(this.DEFAULT.Viewpoint.Position.y).translateZ(this.DEFAULT.Viewpoint.Position.z);	// Default position
			//orthoCamera.translateX(this.DEFAULT.Viewpoint.Position.x).translateY(this.DEFAULT.Viewpoint.Position.y).translateZ(this.DEFAULT.Viewpoint.Position.z);			// Default position
			perspectiveCamera.position.x = this.DEFAULT.Viewpoint.Position.x;	// Default position
			perspectiveCamera.position.y = this.DEFAULT.Viewpoint.Position.y;	// Default position
			perspectiveCamera.position.z = this.DEFAULT.Viewpoint.Position.z;	// Default position
			orthoCamera.position.x = this.DEFAULT.Viewpoint.Position.x;			// Default position
			orthoCamera.position.y = this.DEFAULT.Viewpoint.Position.y;			// Default position
			orthoCamera.position.z = this.DEFAULT.Viewpoint.Position.z;			// Default position

			// Stereo viewing effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(x_renderer);

			e.appendChild (x_renderer.domElement);
			e._xseen.renderer = {
						'canvas' 		: e._xseen.sceneInfo.scene,
						'width'			: width,
						'height'		: height,
						'cameras'		: {
									'perspective'	: perspectiveCamera,
									'ortho'			: orthoCamera,
									'stereo'		: perspectiveCamera,
											},		// Removed .sceneInfo camera because this node defines the camera
						'effects'		: x_effect,
						'renderEffects'	: {
									'normal'		: x_renderer,
									'perspective'	: x_renderer,
									'ortho'			: x_renderer,
									'stereo'		: x_effect,
											},
						'activeRender'	: {},
						'activeCamera'	: {},
						'controls'		: {},		// Used for navigation
						};
			e._xseen.renderer.activeRender = e._xseen.renderer.renderEffects.normal;
			e._xseen.renderer.activeCamera = e._xseen.renderer.cameras.perspective;
		},

/*
 * This appears now to be working!!!
 *
 * Late loading content is not getting inserted into the scene graph for rendering. Need to read
 * THREE docs about how to do that.
 * Camera will need to be redone. Existing camera is treated as a special child. A separate camera
 * should be established and Viewpoint nodes define "photostops" rather than a camera. The camera is 
 * in effect, parented to the "photostop". This probably needs to list of Viewpoints discussed in the
 * X3D specification.
 */
	'fin'	: function (e,p)
		{
			// Render all Children
			//xseen.renderNewChildren (e._xseen.children, e._xseen.renderer.canvas);
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					console.log('Adding child of type ' + child.type + ' (' + child.name + ')');
					e._xseen.renderer.canvas.add(child);
				});
			xseen.dumpSceneGraph ();
//			e._xseen.renderer.renderer.render( e._xseen.renderer.canvas, e._xseen.renderer.camera );
//			xseen.debug.logInfo("Rendered all elements -- Starting animation");
/*
 * TODO: Need to get current top-of-stack for all stack-bound nodes and set them as active.
 *	This only happens the initial time for each XSeen tag in the main HTML file
 *
 *	At this time, only Viewpoint is stack-bound. Probably need to stack just the <Viewpoint>._xseen object.
 *	Also, .fields.position is the initial specified location; not the navigated/animated one
 */
			var vp = xseen.sceneInfo[0].stacks.Viewpoints.getActive();
			var nav = xseen.sceneInfo[0].stacks.Navigation.getActive();
			var currentCamera = e._xseen.renderer.activeCamera;
			var currentRenderer = e._xseen.renderer.activeRender;
			currentCamera.position.x = vp.position.x;
			currentCamera.position.y = vp.position.y;
			currentCamera.position.z = vp.position.z;
			e._xseen.renderer.controls = xseen.Navigation.setup[nav.setup] (currentCamera, currentRenderer);
			xseen.debug.logInfo("Ready to kick off rendering loop");
			xseen.renderFrame();
		},

};

xseen.node.env_Background = {
	'init'	: function (e,p) 
		{
			var color = new THREE.Color(e._xseen.fields.skycolor[0], e._xseen.fields.skycolor[1], e._xseen.fields.skycolor[2]);
			var textureCube = new THREE.CubeTextureLoader()
									.load ([e._xseen.fields.srcright,
											e._xseen.fields.srcleft,
											e._xseen.fields.srctop,
											e._xseen.fields.srcbottom,
											e._xseen.fields.srcfront,
											e._xseen.fields.srcback],
											this.loadSuccess({'e':e, 'p':p})
										);
			e._xseen.sceneInfo.scene.background = color;
/*
			var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
			var size = 1;
			//var geometry = new THREE.BoxGeometry(200, 200, 2);
			var geometry = new THREE.Geometry();
			geometry.vertices.push (
							new THREE.Vector3(-size, -size,  size),
							new THREE.Vector3( size, -size,  size),
							new THREE.Vector3( size, -size, -size),
							new THREE.Vector3(-size, -size, -size),
							new THREE.Vector3(-size,  size,  size),
							new THREE.Vector3( size,  size,  size),
							new THREE.Vector3( size,  size, -size),
							new THREE.Vector3(-size,  size, -size)
									);

			geometry.faces.push (	// external facing geometry
							new THREE.Face3(0, 1, 5),
							new THREE.Face3(0, 5, 4),
							new THREE.Face3(1, 2, 6),
							new THREE.Face3(1, 6, 5),
							new THREE.Face3(2, 3, 7),
							new THREE.Face3(2, 7, 6),
							new THREE.Face3(3, 0, 4),
							new THREE.Face3(3, 4, 7),
							new THREE.Face3(4, 5, 6),
							new THREE.Face3(4, 6, 7),
							new THREE.Face3(0, 2, 1),
							new THREE.Face3(0, 3, 2),
									);
			geometry.computeBoundingSphere();
			var mesh = new THREE.Mesh (geometry, material);
			e._xseen.sceneInfo.element._xseen.renderer.canvas.add(mesh);
*/
		},

	'fin'	: function (e,p)
		{
			p._xseen.appearance = e._xseen.material;
		},

	'loadSuccess' : function (userdata)
		{
			var e = userdata.e;
			var p  = userdata.p;
			return function (textureCube)
			{
				e._xseen.processedUrl = true;
				e._xseen.loadTexture = textureCube;
				e._xseen.sceneInfo.scene.background = textureCube;
			}
		},

};
// File: nodes/nodes_Animate.js
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


xseen.node.x_Animate = {
	'init'	: function (e,p)
		{
			var delay = e._xseen.fields.delay * 1000;		// Convert to milliseconds
			var duration = e._xseen.fields.duration * 1000;	// Convert to milliseconds
			var repeat = (e._xseen.fields.repeat < 0) ? Infinity : e._xseen.fields.repeat;
			var interpolator = e._xseen.fields.interpolator;
			var easing = e._xseen.fields.easing;
			
			var fields = xseen.parseTable[p.localName.toLowerCase()].fields;
			var fieldIndex = xseen.parseTable[p.localName.toLowerCase()].fieldIndex;
			var toField = e._xseen.fields.field;
			var toFieldIndex = fieldIndex[toField];
			if (typeof(fields[toFieldIndex]) === 'undefined') {
				xseen.debug.logInfo("Field '" + toField + "' not found in parent (" + p.localName.toLowerCase() + "). No animation performed.");
				return;
			}
			var fieldObject = fields[toFieldIndex].clone().setFieldName('to');	// Parse table entry for 'toField'
			var to = xseen.nodes._parseField(fieldObject, e);	// Parsed data  -- need to convert to THREE format

// Convert 'to' to the datatype of 'field' and set interpolation type.
			var interpolation;
			if (fieldObject.type == 'SFVec3f') {
				interpolation = TWEEN.Interpolation.Linear;
				to = xseen.types.Vector3(to);
				xseen.debug.logInfo("Interpolating field '" + toField + "' as 3-space.");

			} else if (fieldObject.type == 'SFColor') {
				interpolation = this.Interpolator.color;
				to = new THREE.Color (xseen.types.Color3toInt(to));
				xseen.debug.logInfo("Interpolation field '" + toField + "' as color.");

			} else if (fieldObject.type == 'SFRotation') {
				interpolation = this.Interpolator.slerp;
				to = xseen.types.Rotation2Quat(to);
				xseen.debug.logInfo("Interpolation field '" + toField + "' as rotation.");

			} else {
				xseen.debug.logInfo("Field '" + toField + "' not converted to THREE format. No animation performed.");
				return;
			}
			var fieldTHREE = p._xseen.animate[toField];			// THREE field for animation

			var tween = new TWEEN.Tween(fieldTHREE)
								.to(to, duration)
								.delay(delay)
								.repeat(repeat)
								.interpolation(interpolation);
			var easingType = e._xseen.fields.easingtype;
			easingType = easingType.charAt(0).toUpperCase() + easingType.slice(1);
			easing = (easingType != 'Linear' && easing == '') ? 'inout' : easing;
			if (easing != '') {
				easing = easing.replace('in', 'In').replace('out', 'Out');
				easingType = (easingType == 'Linear') ? 'Quadratic' : easingType;
				e._xseen.fields.easing = easing;
				e._xseen.fields.easingtype = easingType;
				tween.easing(TWEEN.Easing[easingType][easing]);
			}

/*
 * Put animation-specific data in node (e._xseen) so it can be accessed on events (through 'this')
 *	This includes initial value and field
 *	All handlers (goes into .handlers)
 *	TWEEN object
 */
			e._xseen.initialValue = fieldTHREE.clone();
			e._xseen.animatingField = fieldTHREE;
			e._xseen.handlers = {};
			e._xseen.handlers.setstart = this.setstart;
			e._xseen.handlers.setstop = this.setstop;
			e._xseen.handlers.setpause = this.setpause;
			e._xseen.handlers.setresetstart = this.setresetstart;
			e._xseen.animating = tween;
			p._xseen.animation.push (tween);
			tween.start();
		},
	'fin'	: function (e,p) {},
	'setstart'	: function (ev)
		{
			console.log ('Starting animation');
			this.destination._xseen.animating.start();
		},
	'setstop'	: function (ev) 
		{
			console.log ('Stopping animation');
			this.destination._xseen.animating.stop();
		},
/*
 * TODO: Update TWEEN to support real pause & resume. 
 *	Pause needs to hold current position
 *	Resume needs to restart the timer to current time so there is no "jump"
 */
	'setpause'	: function (ev) 
		{
			console.log ('Pausing (really stopping) animation');
			this.destination._xseen.animating.stop();
		},
	'setresetstart'	: function (ev) 	// TODO: Create seperate 'reset' method
		{
			console.log ('Reset and start animation');
			this.destination._xseen.animatingField = this.destination._xseen.initialValue;
			this.destination._xseen.animating.start();
		},
	
/*
 * Various interpolator functions for use with different data types
 * All are designed to be used within TWEEN and take two arguments
 *	v	A vector of way points (key values) that define the interpolated path
 *	k	The interpolating factor that defines how far along the path for the current result
 *
 * Functions
 *	slerp - Linear in quaterian space (though not yet)
 *	color - Linear in color space (currently HSL as used by THREE)
 *
 */
	'Interpolator'	: {
		'slerp'	: function (v,k)
			{
				var m = v.length - 1;
				var f = m * k;
				var i = Math.floor(f);
	
				if (k < 0) {
					return v[0].slerp(v[1], f);
				}

				if (k > 1) {
					return v[m].slerp(v[m-1], m-f);
				}

				return v[i].slerp (v[i + 1 > m ? m : i + 1], f-i);
			},
		'color' : function (v,k)
			{
				var m = v.length - 1;
				var f = m * k;
				var i = Math.floor(f);
				var fn = this.slerpCompute;
	
				if (k < 0) {
					return v[0].lerp(v[1], f);
				}
				if (k > 1) {
					return v[m].lerp(v[m-1], m-f);
				}
				return v[i].lerp (v[i + 1 > m ? m : i + 1], f - i);
			},
	},
};
// File: nodes/_Definitions-aframe.js
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

/*
 * Asset management system nodes
 */
xseen.nodes._defineNode('a-assets', 'A-Frame', 'af_Assets')
					.addNode();
xseen.nodes._defineNode('a-asset-item', 'A-Frame', 'af_AssetItem')
					.addField('src', 'SFString', '')
					.addNode();
xseen.nodes._defineNode('a-mixin', 'A-Frame', 'af_Mixin')
					.addField('*', 'SFString', '')
					.addNode();
// File: nodes/_Definitions-x3d.js
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

xseen.nodes._defineNode ('Viewpoint', 'Controls', 'unk_Viewpoint')
	.addField('position', 'SFVec3f', '0 0 10')
	.addField('orientation', 'SFRotation', xseen.types.SFRotation('0 1 0 0',''))
	.addField('description', 'SFString', '')
	.addField({name:'cameratype', datatype:'EnumerateString', defaultValue:'perspective', enumerated:['perspective', 'stereo', 'orthographic'], animatable:false})
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'perspective', enumerated:['perspective', 'stereo', 'orthographic'], animatable:false})
	.addField({name:'motion', datatype:'EnumerateString', defaultValue:'none', enumerated:['none', 'turntable', 'tilt'], animatable:false})
	.addField('motionspeed', 'SFFloat', 16)
	.addField('active', 'SFBool', true)				// incoming event
	.addNode();
xseen.nodes._defineNode ('NavigationMode', 'Controls', 'controls_Navigation')
	.addField('speed', 'SFFloat', 1.)
	.addField({name:'type', datatype:'EnumerateString', defaultValue:'none', enumerated:['none', 'orbit', 'fly', 'examine', 'trackball'], animatable:false})
	.addNode();
xseen.nodes._defineNode ('Camera', 'Controls', 'unk_Viewpoint')
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
// File: nodes/_Definitions-xseen.js
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
	.addField('start', 'SFBool', true)				// incoming event, need to set timer trigger
	.addField('stop', 'SFBool', true)				// incoming event, need to set timer trigger
	.addField('resetstart', 'SFBool', true)			// incoming event, need to set timer trigger
	.addField('pause', 'SFBool', true)				// incoming event, need to set timer trigger
	.addNode();

xseen.nodes._defineNode('route', 'XSeen', 'x_Route')
	.addField('source', 'SFString', '')
	.addField('event', 'SFString', '')
	.addField('destination', 'SFString', '')
	.addField('field', 'SFString', '')
	.addField('handler', 'SFString', '')
	.addNode();


// Dump parse table
//xseen.nodes._dumpTable();