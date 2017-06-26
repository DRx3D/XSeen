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
