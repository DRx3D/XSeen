/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 *
 * portions extracted from or inspired by
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen events.
 * This object is the manager for all XSeen events. Individual nodes may handle events directed to
 * the node (e.g., change an attribute's value).
 *
 *
 * provides method for the creation of events and the general-purpose handler for the XSEEN tag
 * The General Purpose handler mostly captures the event and regenerates a new XSeen event
 *
 *
 */

var XSeen = XSeen || {};
XSeen.Events = {
				
};
/*
Events

Events are created for all user interactions and changes to the DOM scene graph
Unless there is already a system event name (mouseover, click, etc.), all events are Custom
All nodes create event handlers for the following:
  1) Attribute changes
  2) Children changes
  3) Changes to all style nodes used
Changes to styles that have run-time impact (those with non-empty 'selector' value) are pushed to the node

For example a Group (Transform) node defines an event handler for (https://developer.mozilla.org/en-US/docs/Web/Events)
  1) changes to any attribute value
	DOMAttrModified
  2) changes to children
	DOMNodeInserted
	DOMNodeRemoved
	DOMSubtreeModified
  3)[1] for style elements (nodes)
  
In addition the XSEEN node also receives events for all 
 * mouse/cursor/pointer(?) motions
 * clicks & presses
 * full-screen
 * keyboard
 * window/element resize
 
Node events are handled with the 'events' method that is automatically created during node definition.

The event structure contains the initiating node/action and a reference to the target node

It is the responsibility of the node to make all necessary changes. If the event is ignored, then the node should
pass on the event. If it is fully handled, then it should capture it.
 */
