/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 */

 // Control Node definitions

XSeen.Tags.label = {
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
			var labelElement, targetElement, targetPosition, labelPosition, positionedInSpace;
			var material;
			labelElement = e.getElementsByTagName('div')[0];
			labelPosition = new THREE.Vector3(0, 0, -1);	// center of near-clipping plane
			positionedInSpace = false;
			if (e._xseen.attributes.position.x != 0 || e._xseen.attributes.position.y != 0) {
				e._xseen.attributes.position.z = -1;
				positionedInSpace = true;
			}
			material = new THREE.LineBasicMaterial( {color: XSeen.Parser.Types.colorRgbInt(e._xseen.attributes['leadercolor']), } );

			e._xseen.labelObj = [];
			for (var ii=0; ii<e._xseen.targets.length; ii++) {
				targetElement = e._xseen.targets[ii];
				targetPosition = new THREE.Vector3();
				targetElement._xseen.tagObject.getWorldPosition(targetPosition);

				var geometry = new THREE.Geometry();
				var line = new THREE.Line( geometry, material );

				var labelObj = {
						'method'		: XSeen.Tags.label.tick,
						'position'		: XSeen.Tags.label['position_'+e._xseen.labelType],
						'node'			: e,
						'_xseen'		: e._xseen,
						'RunTime'		: e._xseen.sceneInfo,
						'target'		: targetElement,
						'targetWorld'	: new THREE.Vector3(),
						'label'			: labelElement,
						'labelWorld'	: new THREE.Vector3(0, 0, -1),
						'labelDelta'	: {x: 0, y: 0},
						'line'			: line,
						'initialized'	: false,
						'spacePosition'	: positionedInSpace,
				};
				targetElement._xseen.tagObject.getWorldPosition(labelObj.targetWorld);
				geometry.vertices.push(
						labelObj.targetWorld,
						labelObj.labelWorld);
				labelObj.line.geometry.verticesNeedUpdate = true;
				e._xseen.sceneInfo.perFrame.push ({'method':XSeen.Tags.label.tick, 'userdata':labelObj});
				e._xseen.tagObject.push (line);
				p._xseen.children.push (line);
			}

			// Set up event handlers
			e.addEventListener ('xseen', XSeen.Tags.label.tick, true);						// Render frame
			if (e._xseen.labelType == 'draggable') {
				labelElement.addEventListener ('mousedown', XSeen.Tags.label.MouseDown);	// label movement if type='draggable'
			}
		},
	'event'	: function (ev, attr) {},
	'tick'	: function (rt, label)
		{
			label.position (rt, label);
			label.target._xseen.tagObject.getWorldPosition(label.targetWorld);
			label.line.geometry.verticesNeedUpdate = true;
		},
		
// Event handler for mouse dragging of label
	'MouseDown' : function (ev)
		{
			XSeen.Tags.label.selectedLabel.state = 'down';
			XSeen.Tags.label.selectedLabel.element = ev.target;
			XSeen.Tags.label.selectedLabel.pointerOffset = [ev.x-this.offsetLeft, ev.y-this.offsetTop];
			this.addEventListener ('mousemove', XSeen.Tags.label.MouseMove);
			this.addEventListener ('mouseup', XSeen.Tags.label.MouseUp);
//			console.log ('Mouse Down on movable at Event: ' + ev.x + ', ' + ev.y + '; Offset [' + 
//					XSeen.Tags.label.selectedLabel.pointerOffset[0] + ', ' + 
//					XSeen.Tags.label.selectedLabel.pointerOffset[1] + ']');
		},
	'MouseUp'	: function (ev)
		{
			XSeen.Tags.label.selectedLabel.element.removeEventListener ('mousemove', XSeen.Tags.label.MouseMove);
			XSeen.Tags.label.selectedLabel.element.removeEventListener ('mouseup', XSeen.Tags.label.MouseUp);
			XSeen.Tags.label.selectedLabel.state = '';
			XSeen.Tags.label.selectedLabel.element = {};
			//console.log ('Mouse Up on movable at Event: ');
		},
	'MouseMove'	: function (ev)
		{
			XSeen.Tags.label.selectedLabel.state = 'move';
			this.style.left = ev.x - XSeen.Tags.label.selectedLabel.pointerOffset[0] + 'px';
			this.style.top  = ev.y - XSeen.Tags.label.selectedLabel.pointerOffset[1] + 'px';
			ev.cancelBubble = true;
			//console.log ('Mouse Move on movable at Event: ');
		},

// The 'position_*' methods correspond to the type attribute
	'position_draggable'	: function (rt, label)
		{
			label.position = XSeen.Tags.label.position_fixed;
			label.position (rt, label);
		},
	'position_fixed'	: function (rt, label)
		{
			label.labelWorld.x = 0 -1 + 2 * (label.label.offsetLeft + label.label.offsetWidth/2)   * rt.Size.iwidth;
			label.labelWorld.y = 0 +1 - 2 * (label.label.offsetTop  + label.label.offsetHeight/2) * rt.Size.iheight;
			label.labelWorld.z = -1;
			label.labelWorld = label.labelWorld.unproject (rt.Camera);
			label.labelWorld.initialized = true;
		},

	'position_tracking'	: function (rt, label)
		{
			var projected = label.targetWorld.clone();
			projected.project(rt.Camera);
			var w2, h2, labelx, labely;
			w2 = rt.Size.width / 2;
			h2 = rt.Size.height / 2;
			projected.x = w2 + (projected.x * w2);
			projected.y = h2 - (projected.y * h2);
			if (!label.initialized) {
				label.labelDelta.x = projected.x - label.label.offsetLeft;
				label.labelDelta.y = projected.y - label.label.offsetTop;
				label.initialized = true;
			}

			labelx = projected.x - label.labelDelta.x;
			labely = projected.y - label.labelDelta.y;
			label.label.style.left = labelx + 'px';
			label.label.style.top  = labely + 'px';

			XSeen.Tags.label.position_fixed (rt, label);
		},
	
};
XSeen.Tags.leader = {
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
XSeen.Parser.defineTag ({
						'name'	: 'label',
						'init'	: XSeen.Tags.label.init,
						'fin'	: XSeen.Tags.label.fin,
						'event'	: XSeen.Tags.label.event
						})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'fixed', enumeration:['fixed', 'draggable', 'tracking'], isCaseInsensitive:true, 'isAnimatable':false})
		.defineAttribute ({'name':'position', dataType:'xyz', 'defaultValue':{x:0, y:0, z:0}})
		.defineAttribute ({'name':'leadercolor', dataType:'color', 'defaultValue':{'r':1,'g':1,'b':0}})
		.addTag();
XSeen.Parser.defineTag ({
						'name'	: 'leader',
						'init'	: XSeen.Tags.leader.init,
						'fin'	: XSeen.Tags.leader.fin,
						'event'	: XSeen.Tags.leader.event
						})
		.defineAttribute ({'name':'target', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.addTag();
