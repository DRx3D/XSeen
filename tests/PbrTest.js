var clock = new THREE.Clock();
var container;
var scene, raycaster;

var room;
var geometry;
var isMouseDown = false;

var INTERSECTED;
var crosshair;
var removeId;
var target, trackObject, durationRange, durationMin, durationMedian, durationKick, removeId, totalRefresh;

var renderer = {};
var	scene = {};
var	camera = {};


function RunTest (sceneStuff) {

	renderer = XSeen.Runtime.Renderer;
	sceneDom = XSeen.Runtime.SceneDom;
	scene = XSeen.Runtime.SCENE;
	camera = XSeen.Runtime.Camera;

	init();
	//document.body.appendChild( WEBVR.createButton( renderer ) );
	if (typeof(renderer.animate) !== 'undefined') {
		//animate(renderer);
		XSeen.Runtime.Renderer.animate( render );
	} else {
		animate(XSeen.Runtime.RendererStandard);
	}
}

function init() {

	scene.background = new THREE.Color( 0x404040 );

	scene.add( camera );


	scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );
	
	var envMap = null;
	envMap = new THREE.CubeTextureLoader()
								.setPath('Resources/textures/')
								.load ([
										'desert_1_right.jpg',
										'desert_1_left.jpg',
										'desert_1_top.jpg',
										'desert_1_bottom.jpg',
										'desert_1_front.jpg',
										'desert_1_back.jpg',
								]);

	var parameters = {
//							'color'					: 0xa000a0,
							'color'					: 0xffffff,
							'emissive'				: 0x000000,
							'envMap'				: envMap,
							'side'					: THREE.FrontSide,
// General material properties
							'emissiveIntensity'		: 0,
							'opacity'				: 1.,
							'transparent'			: false,
// General material properties that only apply to Phong or PBR
							'reflectivity'			: .5,
							'refractionRatio'		: .98,
// PBR properties
							'metalness'				: 1,
							'roughness'				: .5,
							};
	var appearance = new THREE.MeshPhysicalMaterial(parameters);

	var geometry = new THREE.TorusKnotGeometry(
										2, 
										.3, 
										128, 
										128, 
										3, 
										5, 
									);

	var mesh = new THREE.Mesh (geometry, appearance);
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = -2;
	scene.add (mesh);

	return renderer;
}

function animate(rndr) {
	//renderer.animate( render );
	rndr.animate( render );
}


function render() {
	var delta = clock.getDelta() * 60;

	// find intersections

	//renderer.render( scene, camera );
	XSeen.Runtime.Renderer.render( XSeen.Runtime.SCENE, XSeen.Runtime.Camera );

}
