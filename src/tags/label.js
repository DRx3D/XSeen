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

xseen.Tags.label = {
	'selectedLabel'	: {},
	'init'	: function (e, p) 
		{
			var type = e._xseen.attributes.type;
			if (!(type == 'fixed' || type == 'tracking' || type == 'draggable')) {type = 'fixed';}
			e._xseen.labelType = type;
			e._xseen.targets = [];
			e._xseen.tagObject = [];
		},
	
	'fin'	: function (e, p)
		{
			var labelElement, targetElement, targetPosition, labelPosition;
			var material;
			labelElement = e.getElementsByTagName('div')[0];
			labelPosition = new THREE.Vector3(0, 0, -1);	// center of near-clipping plane
			material = new THREE.LineBasicMaterial( {color: 0xffff00, } );

			e._xseen.labelObj = [];
			for (var ii=0; ii<e._xseen.targets.length; ii++) {
				targetElement = e._xseen.targets[ii];
				targetPosition = new THREE.Vector3();
				targetElement._xseen.tagObject.getWorldPosition(targetPosition);

				var geometry = new THREE.Geometry();
				var line = new THREE.Line( geometry, material );

				var labelObj = {
						'method'		: xseen.Tags.label.tick,
						'position'		: xseen.Tags.label['position_'+e._xseen.labelType],
						'_xseen'		: e._xseen,
						'target'		: targetElement,
						'targetWorld'	: new THREE.Vector3(),
						'label'			: labelElement,
						'labelWorld'	: new THREE.Vector3(0, 0, -1),
						'labelDelta'	: {x: 0, y: 0},
						'line'			: line,
						'initialized'	: false,
				};
				targetElement._xseen.tagObject.getWorldPosition(labelObj.targetWorld);
				geometry.vertices.push(
						labelObj.targetWorld,
						labelObj.labelWorld);
				labelObj.line.geometry.verticesNeedUpdate = true;
				p._xseen.sceneInfo.ticks.push (labelObj);
				e._xseen.tagObject.push (line);
				p._xseen.children.push (line);
			}

			// Set up event handler for label movement if type='draggable'
			labelElement.addEventListener ('mousedown', xseen.Tags.label.MouseDown);
		},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime, label)
		{
			label.position (label);
			label.target._xseen.tagObject.getWorldPosition(label.targetWorld);
			label.line.geometry.verticesNeedUpdate = true;
		},
		
// Event handler for mouse dragging of label
	'MouseDown' : function (ev)
		{
			xseen.Tags.label.selectedLabel.state = 'down';
			xseen.Tags.label.selectedLabel.element = ev.target;
			xseen.Tags.label.selectedLabel.pointerOffset = [ev.x-this.offsetLeft, ev.y-this.offsetTop];
			this.addEventListener ('mousemove', xseen.Tags.label.MouseMove);
			this.addEventListener ('mouseup', xseen.Tags.label.MouseUp);
//			console.log ('Mouse Down on movable at Event: ' + ev.x + ', ' + ev.y + '; Offset [' + 
//					xseen.Tags.label.selectedLabel.pointerOffset[0] + ', ' + 
//					xseen.Tags.label.selectedLabel.pointerOffset[1] + ']');
		},
	'MouseUp'	: function (ev)
		{
			xseen.Tags.label.selectedLabel.element.removeEventListener ('mousemove', xseen.Tags.label.MouseMove);
			xseen.Tags.label.selectedLabel.element.removeEventListener ('mouseup', xseen.Tags.label.MouseUp);
			xseen.Tags.label.selectedLabel.state = '';
			xseen.Tags.label.selectedLabel.element = {};
			//console.log ('Mouse Up on movable at Event: ');
		},
	'MouseMove'	: function (ev)
		{
			xseen.Tags.label.selectedLabel.state = 'move';
			this.style.left = ev.x - xseen.Tags.label.selectedLabel.pointerOffset[0] + 'px';
			this.style.top  = ev.y - xseen.Tags.label.selectedLabel.pointerOffset[1] + 'px';
			ev.cancelBubble = true;
			//console.log ('Mouse Move on movable at Event: ');
		},

// The 'position_*' methods correspond to the type attribute
	'position_fixed'	: function (label)
		{
			var camera = label._xseen.sceneInfo.element._xseen.renderer.activeCamera;
			label.labelWorld.x = 0 -1 + 2 * (label.label.offsetLeft + label.label.offsetWidth/2)  / label._xseen.sceneInfo.size.width;
			label.labelWorld.y = 0 +1 - 2 * (label.label.offsetTop  + label.label.offsetHeight/2) / label._xseen.sceneInfo.size.height;
			label.labelWorld.z = -1;
			label.labelWorld = label.labelWorld.unproject (camera);
			label.labelWorld.initialized = true;
		},

	'position_tracking'	: function (label)
		{
			var camera = label._xseen.sceneInfo.element._xseen.renderer.activeCamera;
			var projected = label.targetWorld.clone();
			projected.project(camera);
			var w2, h2, labelx, labely;
			w2 = label._xseen.sceneInfo.size.width / 2;
			h2 = label._xseen.sceneInfo.size.height / 2;
			projected.x = (projected.x * w2)   + w2;
			projected.y = - (projected.y * h2) + h2;
			if (!label.initialized) {
				label.labelDelta.x = projected.x - label.label.offsetLeft;
				label.labelDelta.y = projected.y - label.label.offsetTop;
				label.initialized = true;
			}

			labelx = projected.x - label.labelDelta.x;
			labely = projected.y - label.labelDelta.y;
			label.label.style.left = labelx + 'px';
			label.label.style.top  = labely + 'px';

			xseen.Tags.label.position_fixed (label);
		},
	
};
xseen.Tags.leader = {
	'init'	: function (e, p) 
		{
			var targetElement = document.getElementById (e._xseen.attributes.target);
			if (typeof(targetElement) === 'undefined' || targetElement === null) {return;}
			p._xseen.targets.push (targetElement);
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
};

// Add tag and attributes to Parsing table
xseen.Parser.defineTag ({
						'name'	: 'label',
						'init'	: xseen.Tags.label.init,
						'fin'	: xseen.Tags.label.fin,
						'event'	: xseen.Tags.label.event
						})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'fixed', enumeration:['fixed', 'draggable', 'tracking'], isCaseInsensitive:true, 'isAnimatable':false})
		.addTag();
xseen.Parser.defineTag ({
						'name'	: 'leader',
						'init'	: xseen.Tags.leader.init,
						'fin'	: xseen.Tags.leader.fin,
						'event'	: xseen.Tags.leader.event
						})
		.defineAttribute ({'name':'target', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.addTag();
