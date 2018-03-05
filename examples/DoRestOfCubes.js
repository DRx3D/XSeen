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

var N_BOXES = 100;
var BACKGROUND = Array(N_BOXES+1);

var renderer = {};
var	scene = {};
var	camera = {};


function DoRestOfCubes (sceneStuff) {

	renderer = XSeen.Runtime.Renderer;
	sceneDom = XSeen.Runtime.SceneDom;
	scene = XSeen.Runtime.SCENE;
	camera = XSeen.Runtime.Camera;

	for (ii=N_BOXES; ii>=0; ii--) {
		BACKGROUND[ii] = new THREE.Color(0x00000);
		if (ii > 0)				BACKGROUND[ii] = new THREE.Color(0x000099);
		if (ii > 2)				BACKGROUND[ii] = new THREE.Color(0x009900);
		if (ii > N_BOXES*.15)	BACKGROUND[ii] = new THREE.Color(0xbbbb00);
		if (ii > N_BOXES*.40)	BACKGROUND[ii] = new THREE.Color(0xbb4400);
		if (ii > N_BOXES*.75)	BACKGROUND[ii] = new THREE.Color(0xbb0000);
	}

	init();
	//document.body.appendChild( WEBVR.createButton( renderer ) );
	if (typeof(renderer.animate) !== 'undefined') {
		//animate(renderer);
		XSeen.Runtime.Renderer.animate( render );
	} else {
		animate(XSeen.Runtime.RendererStandard);
	}

	durationMin    =  100;		// Minimum time on target
	durationRange  = 1000;		// Range time on target
	durationMedian = durationRange/2 + durationMin;
	durationKick  = Math.floor(durationMedian * 1.6);
	totalRefresh  = 2 * durationKick * 200 / 10;
	console.log ('Box refresh rate: ' + totalRefresh/1000 + ' seconds');
	setInterval (function(){addMoreBoxes()}, totalRefresh);
}

function addBoxes (room, geometry, Number) {
	for ( var i = 0; i < Number; i ++ ) {
		var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		object.position.x = Math.random() * 4 - 2;
		object.position.y = Math.random() * 4 - 2;
		object.position.z = Math.random() * 4 - 2;
		object.rotation.x = Math.random() * 2 * Math.PI;
		object.rotation.y = Math.random() * 2 * Math.PI;
		object.rotation.z = Math.random() * 2 * Math.PI;
		object.scale.x = Math.random() + 0.5;
		object.scale.y = Math.random() + 0.5;
		object.scale.z = Math.random() + 0.5;
		object.userData.velocity = new THREE.Vector3();
		object.userData.velocity.x = Math.random() * 0.01 - 0.005;
		object.userData.velocity.y = Math.random() * 0.01 - 0.005;
		object.userData.velocity.z = Math.random() * 0.01 - 0.005;
		room.add( object );
	}
}

function addMoreBoxes () {
	//console.log ('Current box count ' + room.children.length);
	var maxNewBoxCount = (N_BOXES - room.children.length) * .75;
	var newBoxCount = Math.min (Math.floor(Math.random() * maxNewBoxCount), room.children.length);
	//console.log ('Adding ' + newBoxCount + ' boxes');
	if (newBoxCount > 0) {addBoxes (room, geometry, newBoxCount);}
}
			
function init() {

	scene.background = new THREE.Color( 0x404040 );

	scene.add( camera );

	crosshair = new THREE.Mesh(
		new THREE.RingGeometry( 0.02, 0.04, 32 ),
		new THREE.MeshBasicMaterial( {
			color: 0xffffff,
			opacity: 0.5,
			transparent: true
		} )
	);
	crosshair.position.z = - 2;
	camera.add( crosshair );

	room = new THREE.Mesh(
		new THREE.BoxGeometry( 6, 6, 6, 8, 8, 8 ),
		new THREE.MeshBasicMaterial( { color: 0x404040, wireframe: true } )
	);
	scene.add( room );

	scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

	geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
	addBoxes (room, geometry, N_BOXES);
	scene.background = BACKGROUND[room.children.length];
				
	raycaster = new THREE.Raycaster();

//	var renderer = new THREE.WebGLRenderer( { antialias: true } );
	//renderer.setPixelRatio( window.devicePixelRatio );
	//renderer.setSize( window.innerWidth, window.innerHeight );
//	renderer.vr.enabled = true;

	sceneDom.addEventListener( 'mousedown', onMouseDown, false );
	sceneDom.addEventListener( 'mouseup', onMouseUp, false );
	sceneDom.addEventListener( 'touchstart', onMouseDown, false );
	sceneDom.addEventListener( 'touchend', onMouseUp, false );

	window.addEventListener( 'resize', onWindowResize, false );

	//

	window.addEventListener( 'vrdisplaypointerrestricted', onPointerRestricted, false );
	window.addEventListener( 'vrdisplaypointerunrestricted', onPointerUnrestricted, false );
/*
	renderer.vr.enabled = true;
	document.body.appendChild( WEBVR.createButton( renderer ) );
 */
	return renderer;
}

function onMouseDown() {
	isMouseDown = true;
}

function onMouseUp() {
	isMouseDown = false;
}

function onPointerRestricted() {
	var pointerLockElement = sceneDom;
	if ( pointerLockElement && typeof(pointerLockElement.requestPointerLock) === 'function' ) {
		pointerLockElement.requestPointerLock();
	}
}

function onPointerUnrestricted() {
	var currentPointerLockElement = document.pointerLockElement;
	var expectedPointerLockElement = sceneDom;
	var expectedPointerLockElement = sceneDom;
	if ( currentPointerLockElement && currentPointerLockElement === expectedPointerLockElement && typeof(document.exitPointerLock) === 'function' ) {
		document.exitPointerLock();
	}
}

function onWindowResize() {
	XSeen.Runtime.Camera.aspect = window.innerWidth / window.innerHeight;
	XSeen.Runtime.Camera.updateProjectionMatrix();
	XSeen.Runtime.Renderer.setSize( window.innerWidth, window.innerHeight );
}

//

function animate(rndr) {
	//renderer.animate( render );
	rndr.animate( render );
}


function render() {
	var delta = clock.getDelta() * 60;
	if ( isMouseDown === true ) {
		var cube = room.children[ 0 ];
		if (room.children.length > 2) {room.remove( cube );}

		cube.position.set( 0, 0, - 0.75 );
		cube.position.applyQuaternion( camera.quaternion );
		cube.userData.velocity.x = ( Math.random() - 0.5 ) * 0.02 * delta;
		cube.userData.velocity.y = ( Math.random() - 0.5 ) * 0.02 * delta;
		cube.userData.velocity.z = ( Math.random() * 0.01 - 0.05 ) * delta;
		cube.userData.velocity.applyQuaternion( camera.quaternion );
		room.add( cube );
	}

	// find intersections

	raycaster.setFromCamera( { x: 0, y: 0 }, camera );

	var intersects = raycaster.intersectObjects( room.children );

	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object ) {
			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex( 0xff0000 );
			target = intersects[ 0 ].object;
			trackObject = intersects[ 0 ].object;

			duration = Math.floor(Math.random() * durationRange + durationMin);
			removeId = window.setTimeout (function(){room.remove(trackObject);}, duration);
			window.setTimeout (function(){
				var aimObject = target;
				window.setTimeout (function(){
					aimObject.userData.velocity.x = ( Math.random() - 0.5 ) * 0.04 * delta;
					aimObject.userData.velocity.y = ( Math.random() - 0.5 ) * 0.04 * delta;
					aimObject.userData.velocity.z = ( Math.random() - 0.5 ) * 0.04 * delta;
					}, durationKick);
				}, 0);
		}

	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
		INTERSECTED = undefined;
		clearTimeout (removeId);
		timerId = 0;
	}

// Keep cubes inside room

//				scene.background = new THREE.Color( BACKGROUND[room.children.length] );
	XSeen.Runtime.SCENE.background = BACKGROUND[room.children.length];
	for ( var i = 0; i < room.children.length; i ++ ) {
		var cube = room.children[ i ];
		cube.userData.velocity.multiplyScalar( 1 - ( 0.0005 * delta ) );
		cube.position.add( cube.userData.velocity );
		if ( cube.position.x < - 3 || cube.position.x > 3 ) {
			cube.position.x = THREE.Math.clamp( cube.position.x, - 3, 3 );
			cube.userData.velocity.x = - cube.userData.velocity.x;
		}

		if ( cube.position.y < - 3 || cube.position.y > 3 ) {
			cube.position.y = THREE.Math.clamp( cube.position.y, - 3, 3 );
			cube.userData.velocity.y = - cube.userData.velocity.y;
		}

		if ( cube.position.z < - 3 || cube.position.z > 3 ) {
			cube.position.z = THREE.Math.clamp( cube.position.z, - 3, 3 );
			cube.userData.velocity.z = - cube.userData.velocity.z;
		}

		cube.rotation.x += cube.userData.velocity.x * 2 * delta;
		cube.rotation.y += cube.userData.velocity.y * 2 * delta;
		cube.rotation.z += cube.userData.velocity.z * 2 * delta;
	}

	//renderer.render( scene, camera );
	XSeen.Runtime.Renderer.render( XSeen.Runtime.SCENE, XSeen.Runtime.Camera );

}
