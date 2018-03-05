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

xseen.Tags.route = {
	'init'	: function (e, p) 
		{
			var dest = e._xseen.attributes.destination;
			var hand = e._xseen.attributes.handler;
			var externalHandler = false;
			
			// Make sure sufficient data is provided
			console.log ('handler: |'+hand+'|; window[hand]: '+window[hand]+'|');
			console.log ('typeof (handler): |'+typeof(window[hand])+'|');
			if (e._xseen.attributes.source == '' || 
				typeof(window[hand]) !== 'function' && 
					(dest == '' || e._xseen.attributes.event == '' || e._xseen.attributes.attribute == '')) {
				xseen.debug.logError ('Route node missing attribute. No route setup. Source: '+e._xseen.attributes.source+'.'+e._xseen.attributes.event+'; Destination: '+dest+'.'+e._xseen.attributes.attribute+'; Handler: '+hand);
				return;
			} else if (typeof(window[hand]) === 'function') {
				externalHandler = true;
			}
			
			// For toNode routing, check existence of source and destination elements
			var eSource = document.getElementById (e._xseen.attributes.source);
			if (! externalHandler) {
				var eDestination = document.getElementById (dest);
				if (typeof(eSource) === 'undefined' || typeof(eDestination) === 'undefined') {
					xseen.debug.logError ('Source or Destination node does not exist. No route setup');
					return;
				}
				// Get attribute information -- perhaps there is some use in the Animate node?
				var fField = xseen.Parser.getAttrInfo (eDestination.localName, e._xseen.attributes.attribute);
				if (typeof(fField) === 'undefined' || !fField.good) {
					xseen.debug.logError ('Destination attribute does not exist or incorrectly specified. No route setup');
					return;
				}
				// Set up listener on source node for specified event. The listener code is the 'set<attribute>' method for the
				// node. It is passed the DOM 'event' data structure. Since there may be more than one node of the type
				// specified by 'destination', the event handler is attached to the node in e._xseen.handlers. This is done
				// when the node is parsed
				xseen.Events.addHandler (e, eSource, e._xseen.attributes.event, eDestination, fField);

/*
 * External (to XSeen) event handler
 *	addHandler ensures that only requested 'xseen' events are passed through
 */
			} else {
				var handler = window[hand];
				eSource.addEventListener ('xseen', handler);
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
	'tick'	: function (systemTime, deltaTime) {},
};

// Add tag and attributes to Parsing table
xseen.Parser.defineTag ({
						'name'	: 'route',
						'init'	: xseen.Tags.route.init,
						'fin'	: xseen.Tags.route.fin,
						'event'	: xseen.Tags.route.event,
						'tick'	: xseen.Tags.route.tick
						})
		.defineAttribute ({'name':'source', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'event', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'destination', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'attribute', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'handler', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.addTag();
