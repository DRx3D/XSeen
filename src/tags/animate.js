/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 */

 // Tag definition code for animate

/*
 * <animate ...> tag with <key> child
 *	animate defines overall properties. It is possible to define animation without key.
 *	'key' provides the individual key frames. If the only key frames are the beginning and end,
 *	it is not necessary to use <key> children.
 *
 *	If duration attribute is '0' (or converts to it or is blank), then the value of <key duration> is used
 *	to compute the total duration (>0)
 *	The value of 'when' is the fraction [0,1] where that key frame occurs. keys with when <0 or when >1 are ignored
 *
 *	Each key may describe the animation curve and ease-in/out from when it starts for its duration.
 */

XSeen.Tags.animate = {
	'cnv'	: {		/* Insures that the correct case is used */
			'style' : {'in':'In', 'out':'Out', 'inout': 'InOut'},
			'type': {'linear':'Linear', 'quadratic':'Quadratic', 'sinusoidal':'Sinusoidal', 'exponential':'Exponential', 'elastic':'Elastic', 'bounce':'Bounce'},
			},
	'_easeCheck' : function (direction, type, store)
		{
			direction = (type != 'linear' && direction == '') ? 'inout' : direction;
			if (direction != '') {
				type = (type == 'linear') ? 'quadratic' : type;
				direction = XSeen.Tags.animate.cnv.style[direction];
				type = XSeen.Tags.animate.cnv.type[type];
			} else {
				direction = 'None';
				type = 'Linear';
			}
			store.easing = direction;
			store.easingtype = type;
		},
	_getTo: function (e, attrObject, toAttribute)
		{
			var to, interpolation, startingValue;
			to = XSeen.Parser.parseAttr(attrObject, e, []);	// Parsed data  -- need to convert to THREE format
			if (attrObject.type == 'float') {
				interpolation = TWEEN.Interpolation.Linear;
				to = XSeen.Parser.Types.float(to, 0.0, false, []);
				startingValue = 0;	// TODO: Only should be 0 if cannot get value from object
				XSeen.LogInfo("Interpolating field '" + toAttribute + "' as float.");

			} else if (attrObject.type == 'vec3') {
				interpolation = TWEEN.Interpolation.Linear;
				to = XSeen.Parser.Types.vecToXYZ(to, {'x':0,'y':0,'z':0});
				XSeen.LogInfo("Interpolating field '" + toAttribute + "' as 3-space.");

			} else if (attrObject.type == 'xyz') {				// No parsing necessary
				interpolation = TWEEN.Interpolation.Linear;
				XSeen.LogInfo("Interpolating field '" + toAttribute + "' as 3-space (no parse).");

			} else if (attrObject.type == 'color') {
				interpolation = XSeen.Tags.animate.Interpolator.color;
				if (typeof(to) == 'string') {to = new THREE.Color (XSeen.Parser.Types.color(to));}
				XSeen.LogInfo("Interpolation field '" + toAttribute + "' as color.");

			} else if (attrObject.type == 'vec4' || attrObject.type == 'rotation') {
				interpolation = XSeen.Tags.animate.Interpolator.slerp;
				//to = XSeen.types.Rotation2Quat(to);
				XSeen.LogInfo("Interpolation field '" + toAttribute + "' as rotation.");

			} else {
				XSeen.LogInfo("Field '" + toAttribute + "' not converted to THREE format. No animation performed.");
				return {'to':null, 'interpolation':null};
			}
			return {'to':to, 'interpolation':interpolation};
		},

	/*
	 *	The attribute maps to internal variables as follows (e._xseen):
	 *	delay ==> .delay -- Initial delay of animation
	 *	duration <= 0 ==> .keyFraction = false
	 *	duration > 0 ==> .keyFraction = true
	 *	duration ==> .duration (must be >= 0;otherwise ==0)
	 *	yoyo ==> .yoyo
	 *	repeat ==> .repeat (>= 0), Infinity (<0)
	 *	easing ==> .easing
	 *	easingType ==> .easingType
	 *	key[keyFrame_1{}, keyFrame_2{}, keyFrame_3{}, ...]
	 *
	 *	Each 'key' child provides the following
	 *	if !.keyFraction, then p._xseen.duration += e._xseen.duration
	 *	if .keyFraction && (when < 0 || when > 1) then ignore tag
	 *	p._xseen.key.push ({duration:, easing:, easingType, to:}) 
	 */
	'init'	: function (e,p) 
		{
			if (e._xseen.attributes.duration > 0) {
				e._xseen.keyFraction = true;
			} else {
				e._xseen.keyFraction = false;
				e._xseen.attributes.duration = 0;
			}
			XSeen.Tags.animate._easeCheck (e._xseen.attributes.easing, e._xseen.attributes.easingtype, e._xseen.attributes);
			e._xseen.key = [];
			
//	Save parent attribute object for requested field
			var toAttribute = e._xseen.attributes.attribute;
			var attributes = XSeen.Parser.Table[p.localName.toLowerCase()].attributes;
			e._xseen.attrObject = attributes[toAttribute].clone().setAttrName('to');	// Parse table entry for 'toAttribute'
			e._xseen.tagObject = new TWEEN.Group();
			
//	Revise code below here
/*
			var interpolator = e._xseen.attributes.interpolator;	// Not used (yet?)
			
			var attributes = XSeen.Parser.Table[p.localName.toLowerCase()].attributes;
			var attrIndex = XSeen.Parser.Table[p.localName.toLowerCase()].attrIndex;
			var toAttribute = e._xseen.attributes.attribute;
			var toAttrIndex = attrIndex[toAttribute];
			if (typeof(attributes[toAttrIndex]) === 'undefined') {
				XSeen.LogInfo("Field '" + toAttribute + "' not found in parent (" + p.localName.toLowerCase() + "). No animation performed.");
				return;
			}
			var attrObject = attributes[toAttrIndex].clone().setAttrName('to');	// Parse table entry for 'toAttribute'
 */
		},

	'fin'	: function (e,p)
		{
			console.log ('Check e._xseen.key for correct values');

			var duration = e._xseen.attributes.duration * 1000;	// TEMP: Convert to milliseconds
			var delay = e._xseen.attributes.delay * 1000;		// Convert to milliseconds
			//TEMP//var duration = e._xseen.attributes.duration * 1000;	// Convert to milliseconds
			var yoyo = e._xseen.attributes.yoyo;
			var repeat = (e._xseen.attributes.repeat < 0) ? Infinity : e._xseen.attributes.repeat;
			
/*
 * Convert 'to' to the datatype of 'field' and set interpolation type.
 *	interpolation is the type of interpolator (space, color space, rotational space)
 *	startingValue is the initial value of the field to be interpolated. The interpolation will update this field
 *		during animation. If the scene field needs a setter method, then use a local value. 
 *
 * TODO: Make sure local value is not overwritten on subsequent calls
 *	Really have no idea how to do this. Would like to have field.sub-field cause all sorts of 
 *	neat things to happen from a user perspective. I am not seeing how to do this for a general case.
 *	May need to handle things separately for each animation type.
 */
			var interpolation, startingValue;
			var attrObject = e._xseen.attrObject;
			var toAttribute = e._xseen.attributes.attribute;
			console.log ('Check for keyframes ... count: ' + e._xseen.key.length);
			if (e._xseen.key.length == 0) {		// Block handles no key frames
				var target = XSeen.Tags.animate._getTo (e, e._xseen.attrObject, e._xseen.attributes.attribute);
				if (target.to === null) {return; }
			
/*
 * Method when attribute value is handled via setter
 *	The attribute is a function rather than an object. The function handles the
 *	computation of the interpolant and updating of results. It is the argument
 *	of the .onUpdate method of Tween. The function takes the TweenData object as 
 *	an argument and updates the necessary field.
 */

				var fieldTHREE, useUpdate, tween, startingValue;
				if (typeof(p._xseen.animate[toAttribute]) == 'function') { 
					fieldTHREE = p._xseen.attributes[toAttribute];		// THREE field for animation
					var setter = {'from':fieldTHREE, 'current':fieldTHREE, 'attribute':toAttribute};
					useUpdate = true;
					tween = new TWEEN.Tween (setter, e._xseen.tagObject)
										.to({'current':target.to}, duration)
										.onUpdate(p._xseen.animate[toAttribute]);
					startingValue = fieldTHREE;

				} else {
					fieldTHREE = p._xseen.animate[toAttribute];			// THREE field for animation
																// TODO: The 'animate' array needs to be populated
																//	with the field in the tag object
																//	(._xseen.tagObject) that uses this label.
																//	The population MUST be done in the tag method
																//	as it is the only place it is defined. There is
																//	a problem if the object is not yet build :-(
					useUpdate = false;
					tween = new TWEEN.Tween(fieldTHREE, e._xseen.tagObject).to(target.to, duration);
					startingValue = fieldTHREE.clone();
				}
				e._xseen.initialValue = startingValue;

			
				tween	.delay(delay)
						.repeat(repeat)
						.interpolation(target.interpolation)
						.yoyo(yoyo);
				var easingType = e._xseen.attributes.easingtype;
				var easing = e._xseen.attributes.easing;
				if (easing != '') {
					tween.easing(TWEEN.Easing[easingType][easing]);
				}
				e._xseen.animating = tween;
				p._xseen.animation.push (tween);
				e._xseen.sceneInfo.TweenGroups.push (e._xseen.tagObject);
				tween.start();
/*
 *	Handle key frames.
 *	Use the provided keys (e._xseen.key[]) to construct TWEEN animations
 *	Each key creates one TWEEN. All Tweens are chained togeter (in order)
 *	Many <animate> attributes are ignored: interpolator, easing, easingtype, yoyo
 *	duration now contains the total duration of the animation, but it (the total) is also ignored
 *	repeat is either on (-1) or not (anything else). If it is on, then a chain is created from the last Tween to the first
 *
 *	TODO: At this time only deal with direct animation of THREE properties. 
 */
			} else {
				var fieldTHREE = p._xseen.animate[toAttribute];			// THREE field for animation
				var startingValue = fieldTHREE.clone();
				e._xseen.initialValue = startingValue;

				var tween0, tweenP, tween;
				tween0 = new TWEEN.Tween(fieldTHREE, e._xseen.tagObject);
				tween0	.to(e._xseen.key[0].to, duration)
						.delay(delay)
						.interpolation(e._xseen.key[0].interpolation)
						.easing(TWEEN.Easing[e._xseen.key[0].easingType][e._xseen.key[0].easing]);
				tweenP = tween0;
				for (var ii=1; ii<e._xseen.key.length; ii++) {
					tween = new TWEEN.Tween(fieldTHREE, e._xseen.tagObject);
					tween	.to(e._xseen.key[ii].to, duration)
							.delay(delay)
							.interpolation(e._xseen.key[ii].interpolation)
							.easing(TWEEN.Easing[e._xseen.key[ii].easingType][e._xseen.key[ii].easing]);
					tweenP.chain(tween);
					tweenP = tween;
				}
				if (repeat === Infinity) {
					console.log ('test');
					tween.chain(tween0);
				}
				tween0.start();
				e._xseen.animating = e._xseen.tagObject;
				p._xseen.animation.push (e._xseen.tagObject);
				e._xseen.sceneInfo.TweenGroups.push (e._xseen.tagObject);
			}

/*
 *	TODO: This section needs to be thought through. It may not apply or need to be changed if animation a 
 *	field of an attribute
 *
 * Put animation-specific data in node (e._xseen) so it can be accessed on events (through 'XSeen.Tags.animate')
 *	This includes initial value and field
 *	All handlers (goes into .handlers)
 *	TWEEN object
 */
			console.log ('Close up shop for animate...');
			e._xseen.handlers = {};
			e._xseen.handlers.setstart = XSeen.Tags.animate.setstart;
			e._xseen.handlers.setstop = XSeen.Tags.animate.setstop;
			e._xseen.handlers.setpause = XSeen.Tags.animate.setpause;
			e._xseen.handlers.setresetstart = XSeen.Tags.animate.setresetstart;
		},

	'event'	: function (ev, attr)
		{
			console.log ('Handling event ... for ' + attr);
		},


	'setstart'	: function (ev)
		{
			console.log ('Starting animation');
			XSeen.Tags.animate.destination._xseen.animating.start();
		},
	'setstop'	: function (ev) 
		{
			console.log ('Stopping animation');
			XSeen.Tags.animate.destination._xseen.animating.stop();
		},
/*
 * TODO: Update TWEEN to support real pause & resume. 
 *	Pause needs to hold current position
 *	Resume needs to restart the timer to current time so there is no "jump"
 */
	'setpause'	: function (ev) 
		{
			console.log ('Pausing (really stopping) animation');
			XSeen.Tags.animate.destination._xseen.animating.stop();
		},
	'setresetstart'	: function (ev) 	// TODO: Create seperate 'reset' method
		{
			console.log ('Reset and start animation');
			XSeen.Tags.animate.destination._xseen.animatingField = XSeen.Tags.animate.destination._xseen.initialValue;
			XSeen.Tags.animate.destination._xseen.animating.start();
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
				var fn = this.slerpCompute;		// TODO: not sure this is needed
	
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

XSeen.Tags.key = {
	/*
	 *	Each 'key' child provides the following
	 *	if !.keyFraction, then p._xseen.duration += e._xseen.duration
	 *	if .keyFraction && (when < 0 || when > 1) then ignore tag
	 *	p._xseen.key.push ({duration:, easing:, easingType, to:}) 
	 */
	'init'	: function (e,p) 
		{
			if (p.nodeName != 'X-ANIMATE') {return; }
			var duration = e._xseen.attributes.duration;
			if (!p._xseen.keyFraction) {
				if (duration <= 0) {return; }
				p._xseen.attributes.duration += duration;
			} else {
				if (duration <= 0 || duration > 1) {return; }
				duration *= p._xseen.attributes.duration;
			}
			XSeen.Tags.animate._easeCheck (e._xseen.attributes.easing, e._xseen.attributes.easingtype, e._xseen.attributes);
			var target = XSeen.Tags.animate._getTo (e, p._xseen.attrObject, p._xseen.attributes.attribute);
			p._xseen.key.push ({duration:duration, to:target.to, interpolation:target.interpolation, easing:e._xseen.attributes.easing, easingType:e._xseen.attributes.easingtype}) 
		},
	'fin'	: function (e,p) {},
	'event'	: function (ev, attr)
		{
			console.log ('Handling event ... for ' + attr);
		},
};



// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'animate',
						'init'	: XSeen.Tags.animate.init,
						'fin'	: XSeen.Tags.animate.fin,
						'event'	: XSeen.Tags.animate.event
//						'tick'	: XSeen.Tags.animate.tick
						})
		.defineAttribute ({'name':'attribute', dataType:'string', 'defaultValue':''})
		.defineAttribute ({'name':'to', dataType:'vector', 'defaultValue':[]})
		.defineAttribute ({'name':'delay', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'duration', dataType:'float', 'defaultValue':0.0})	// 0.0 ==> key time in seconds
		.defineAttribute ({'name':'repeat', dataType:'integer', 'defaultValue':0})

		.defineAttribute ({'name':'interpolator', dataType:'string', 'defaultValue':'position', enumeration:['position', 'rotation', 'color'], isCaseInsensitive:true})
		.defineAttribute ({'name':'easing', dataType:'string', 'defaultValue':'', enumeration:['', 'in', 'out', 'inout'], isCaseInsensitive:true})
		.defineAttribute ({'name':'easingtype', dataType:'string', 'defaultValue':'linear', enumeration:['linear', 'quadratic', 'sinusoidal', 'exponential', 'elastic', 'bounce'], isCaseInsensitive:true})
		.defineAttribute ({'name':'yoyo', dataType:'boolean', 'defaultValue':false})

		.defineAttribute ({'name':'start', dataType:'boolean', 'defaultValue':true})		// incoming event
		.defineAttribute ({'name':'stop', dataType:'boolean', 'defaultValue':true})			// incoming event
		.defineAttribute ({'name':'resetstart', dataType:'boolean', 'defaultValue':true})	// incoming event
		.defineAttribute ({'name':'pause', dataType:'boolean', 'defaultValue':true})		// incoming event
		.addTag();
XSeen.Parser.defineTag ({
						'name'	: 'key',
						'init'	: XSeen.Tags.key.init,
						'fin'	: XSeen.Tags.key.fin,
						'event'	: XSeen.Tags.key.event
						})
		.defineAttribute ({'name':'to', dataType:'vector', 'defaultValue':[]})
		.defineAttribute ({'name':'duration', dataType:'float', 'defaultValue':0.0})
		.defineAttribute ({'name':'easing', dataType:'string', 'defaultValue':'', enumeration:['', 'in', 'out', 'inout'], isCaseInsensitive:true})
		.defineAttribute ({'name':'easingtype', dataType:'string', 'defaultValue':'linear', enumeration:['linear', 'quadratic', 'sinusoidal', 'exponential', 'elastic', 'bounce'], isCaseInsensitive:true})
		.addTag();
