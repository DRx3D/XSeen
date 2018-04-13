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

XSeen.Tags.scene = {
	'DEFAULT'	: {
			'Viewpoint'	: {
				'Position'		: [0, 0, 10],
				'Orientation'	: [0, 1, 0, 0],		// TODO: fix (and below) when handling orientation
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
	'init'	: function (e, p) 
		{
			e._xseen.sceneInfo.SCENE = new THREE.Scene();
			// Stereo viewing effect
			// from http://charliegerard.github.io/blog/Virtual-Reality-ThreeJs/
			var x_effect = new THREE.StereoEffect(e._xseen.sceneInfo.Renderer);

		},
	'fin'	: function (e, p) 
		{

/*
 *	Add an event listener to this node for resize events
 */
			window.addEventListener ('resize', XSeen.Runtime.Resize, false);
/*
 * TODO: Need to get current top-of-stack for all stack-bound nodes and set them as active.
 *	This only happens the initial time for each XSeen tag in the main HTML file
 *
 *	At this time, only Viewpoint is stack-bound. Probably need to stack just the <Viewpoint>._xseen object.
 *	Also, .fields.position is the initial specified location; not the navigated/animated one
 */

//			XSeen.LogInfo("Ready to kick off rendering loop");
//			XSeen.renderFrame();
			//RunTest (e._xseen.sceneInfo);
			if (e._xseen.attributes.cubetest) {
				XSeen.LogInfo("Kicking off THREE testing code and rendering");
				DoRestOfCubes (e._xseen.sceneInfo);
			} else {
				//XSeen.Runtime.SCENE.background = new THREE.Color(0xbb0000);
				//XSeen.Runtime.Renderer.animate( XSeen.RenderFrame() );
				XSeen.Runtime.Animate();
			}
		},
	'resize': function () {
			var thisTag = XSeen.Runtime.RootTag;
			XSeen.Runtime.Camera.aspect = thisTag.offsetWidth / thisTag.offsetHeight;
			XSeen.Runtime.Camera.updateProjectionMatrix();
			XSeen.Runtime.Renderer.setSize (thisTag.offsetWidth, thisTag.offsetHeight)
		},
	'addScene': function () {
			// Render all Children
			var e = XSeen.Runtime.RootTag;
			console.log ('Adding children to SCENE');
			e._xseen.children.forEach (function (child, ndx, wholeThing)
				{
					console.log('Adding child of type ' + child.type + ' (' + child.name + ') with ' + child.children.length + ' children to THREE scene');
					e._xseen.sceneInfo.SCENE.add(child);
					//console.log('Check for successful add');
				});
//			XSeen.LogDebug("Rendered all elements -- Starting animation");
		},
	'event'	: function (ev, attr)
		{
		},

	'tick'	: function (systemTime, deltaTime)
		{
		},
};


// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'scene',
						'init'	: XSeen.Tags.scene.init,
						'fin'	: XSeen.Tags.scene.fin,
						'event'	: XSeen.Tags.scene.event,
						'tick'	: XSeen.Tags.scene.tick
						})
		.defineAttribute ({'name':'cubetest', dataType:'boolean', 'defaultValue':false})
		.addTag();
