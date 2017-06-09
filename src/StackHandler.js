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
 * xseen.utlis.StackHandler(label);
 * Creates a new stack that is managed by this class
 * 
 * Note that the Push-Down stack (aka FILO) is implemented as a reverse list
 * so that the Array methods .push and .pop can be used. The end of the array
 * is the "top-most" element in the stack.
 */

xseen.utils.StackHandler = function (label) {
	this._internals				= {};		// Internal class storage
	this._internals.label		= label;	// Unique user-supplied name for this stack
	this._internals.stack		= [];		// Maintains the stack. Last entry on stack is active
	this._internals.active		= -1;		// Entry of currently active list element
	this._internals.activeNode	= {};		// Entry of currently active list element
	this._internals.defaultNode	= {};		// The default entry to be active if nothing else is

	this._setActiveNode = function() {		// Sets the entry specified by nodeId as active
		this._internals.active = this._internals.stack.length-1;
		if (this._internals.active >= 0) {
			this._internals.activeNode = this._internals.stack[this._internals.active];
		} else {
			this._internals.activeNode = this._internals.defaultNode;
		}
	}

	this.init = function() {		// Clears existing stack
		this._internals.stack = [];
	}

	this.pushDown = function(node) {		// Push new node onto stack and make active
		this._internals.stack.push (node);
		this._setActiveNode();
	}

	this.popOff = function() {			// Pop new node onto stack and make active
		this._internals.stack.pop();
		this._setActiveNode();
	}

	this.getActive = function() {
		return this._internals.activeNode;
	}
}
