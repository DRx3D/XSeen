/*
 * EquirectangularToCubemap.js
 *	from https://github.com/spite/THREE.EquirectangularToCubemap/blob/master/src/EquirectangularToCubemap.js
 *
 *	MIT licensed
 *	Copyright (C) 2016 Jaume Sanchez Elias, http://www.clicktorelease.com
 */
;(function() {

	"use strict";

	var root = this

	var has_require = typeof require !== 'undefined'

	var THREE = root.THREE || has_require && require('three')
	if( !THREE )
		throw new Error( 'EquirectangularToCubemap requires three.js' )

function EquirectangularToCubemap( renderer ) {

	this.renderer = renderer;
	this.scene = new THREE.Scene();

	var gl = this.renderer.getContext();
	this.maxSize = gl.getParameter( gl.MAX_CUBE_MAP_TEXTURE_SIZE )

	this.camera = new THREE.CubeCamera( 1, 100000, 1 );

	this.material = new THREE.MeshBasicMaterial( {
		map: null,
		side: THREE.BackSide
	} );

	this.mesh = new THREE.Mesh(
		new THREE.IcosahedronGeometry( 100, 4 ),
		this.material
	);
	this.scene.add( this.mesh );

}

EquirectangularToCubemap.prototype.convert = function( source, size ) {

	var mapSize = Math.min( size, this.maxSize );
	this.camera = new THREE.CubeCamera( 1, 100000, mapSize );
	this.material.map = source;

	this.camera.updateCubeMap( this.renderer, this.scene );

	return this.camera.renderTarget.texture;

}

if( typeof exports !== 'undefined' ) {
	if( typeof module !== 'undefined' && module.exports ) {
		exports = module.exports = EquirectangularToCubemap
	}
	exports.EquirectangularToCubemap = EquirectangularToCubemap
}
else {
	root.EquirectangularToCubemap = EquirectangularToCubemap
}

}).call(this);