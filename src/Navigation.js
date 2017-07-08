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
				controls.addEventListener( 'change', render ); // remove when using animation loop
				// enable animation loop when using damping or autorotation
				//controls.enableDamping = true;
				//controls.dampingFactor = 0.25;
				controls.enableZoom = false;
				controls.enableZoom = true;
				return controls;
			},
		},
};
