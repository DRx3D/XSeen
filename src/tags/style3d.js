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

/*
 * style3d is a single definition of a style attribute. Multiple style attributes can be
 * grouped together as children of a class3d tag. These still express a rule set.
 *
 * Each rule set defines a single selector (usable with jQuery) and a number of property/value
 * pairs where the property is the name of a XSeen attribute for some XSeen tag and the value
 * is a legal value for that attribute. 
 *
 * If no selector is defined, then the style will have no effect at runtime if the value in the
 * 'style3d' tag is changed.
 *
 * If the rule set has an id attribute (in the 'class3d' tag for the collection, or in the 'style3d'
 * tag for a single expression), then that style can be referenced by a node using the style3d attribute.
 * The styles are applied prior to any attributes specifically included in the node.
 *
 * If a 'style3d' tag is a child of a 'class3d' tag, then the selector is ignored.
 *
 * Runtime application of a style overrides any current value associated with the node.
 *
 * TODO: add support in 'class3d' for external files to define the style3d
 *
 */

 XSeen.Tags.Style3d = {};
 XSeen.Tags.Style3d._changeAttribute = function (e, attributeName, value) {
			console.log ('Changing attribute ' + attributeName + ' of ' + e.localName + '#' + e.id + ' to |' + value + ' (' + e.getAttribute(attributeName) + ')|');
			if (value !== null) {
				var ruleset, nodeAttributes, styleValue, styleProperty, changeSelector;

				if (e._xseen.ruleset.complete) {
					ruleset = e._xseen.ruleset;
					nodeAttributes = e._xseen.attributes;
				} else {
					ruleset = e.parentNode._xseen.ruleset;
					nodeAttributes = e.parentNode._xseen.attributes;
				}

				if (attributeName == 'property') {
					if (nodeAttributes.property != '') {
						var oldProperty = nodeAttributes.property;
						for (var ii=0; ii<ruleset.declaration.length; ii++) {
							if (ruleset.declaration[ii].property == oldProperty) {
								ruleset.declaration[ii].property = value;
								styleValue = nodeAttributes.value;
								styleProperty = oldProperty;
							}
						}
					}
					changeSelector = false;

				} else if (attributeName == 'value') {
					if (nodeAttributes.property != '') {
						for (var ii=0; ii<ruleset.declaration.length; ii++) {
							if (ruleset.declaration[ii].property == nodeAttributes.property) {
								ruleset.declaration[ii].value = value;
								styleValue = value;
								styleProperty = nodeAttributes.property;
							}
						}
					}
					changeSelector = false;

				} else if (attributeName == 'selector') {
					ruleset.selector = value;
					nodeAttributes.selector = value;
					changeSelector = true;
				}
				e._xseen.attributes[attributeName] = value;

				var eles = document.querySelectorAll (ruleset.selector);
				eles.forEach (function(item) {
					for (var ii=0; ii<ruleset.declaration.length; ii++) {
						item.setAttribute(ruleset.declaration[ii].property, ruleset.declaration[ii].value);
					}
				});
			} else {
				XSeen.LogWarn("Reparse of " + attributeName + " is invalid -- no change")
			}

};

XSeen.Tags._style = 
	function (property, value, selector, id, ruleParent) {
		if (typeof(ruleParent) === 'undefined' || typeof(ruleParent._xseen.styleDefinition) === 'undefined') {
			this.id				= id || '';
			this.selector		= selector;
			this.complete		= true;
			this.declaration	= [];
			if (property != '') this.declaration.push({'property':property, 'value':value});
		} else {
			this.complete 		= false;
			ruleParent._xseen.ruleset.declaration.push({'property':property, 'value':value});
		}
		return this;
	};
	
	
XSeen.Tags.style3d = {
	'init'	: function (e, p) 
		{
			e._xseen.ruleset = new XSeen.Tags._style (e._xseen.attributes.property, e._xseen.attributes.value, e._xseen.attributes.selector, e.id, p);
			if (e._xseen.ruleset.complete) {
				e._xseen.sceneInfo.StyleRules.ruleset.push (e._xseen.ruleset);
				if (e.id != '') e._xseen.sceneInfo.StyleRules.idLookup[e.id] = e._xseen.ruleset;
			}
		},
	'fin'	: function (e, p) {},
	'event'	: function (ev, attr) {},
};
XSeen.Tags.class3d = {
	'init'	: function (e, p) 
		{
			e._xseen.styleDefinition = true;
			e._xseen.ruleset = new XSeen.Tags._style ('', '', e._xseen.attributes.selector, e.id);
		},
	'fin'	: function (e, p) 
		{
			e._xseen.sceneInfo.StyleRules.ruleset.push (e._xseen.ruleset);
			if (e.id != '') e._xseen.sceneInfo.StyleRules.idLookup[e.id] = e._xseen.ruleset;
			
/*
			if (e._xseen.attributes.dump) {
				var class3d, msg = '<table border="1"><tr><th>Class</th><th>ID</th><th>Property</th><th>Value</th></tr>\n', ii, jj;
				
				for (ii=0; ii<e._xseen.sceneInfo.classes.length; ii++) {
					var className = e._xseen.sceneInfo.classes[ii].class3d;
					for (var jj=0; jj<e._xseen.sceneInfo.classes[ii].style.length; jj++) {
						class3d = e._xseen.sceneInfo.classes[ii].style[jj];
						msg += "<tr><td>" + className + "</td><td>" + class3d.id + '</td><td>' + class3d.name + '</td><td>' + class3d.string + "</td></tr>\n";
					}
				}
				msg += '</table>';
				XSeen.LogDebug(msg);
			}
 */
		},
	'event'	: function (ev, attr) {},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'style3d',
						'init'	: XSeen.Tags.style3d.init,
						'fin'	: XSeen.Tags.style3d.fin,
						'event'	: XSeen.Tags.style3d.event
						})
		.defineAttribute ({'name':'selector', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'property', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'value', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
//		.defineAttribute ({'name':'waitforload', dataType:'boolean', 'defaultValue':false, 'isAnimatable':false})
//		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'value', enumeration:['value','external'], isCaseInsensitive:true, 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.Style3d._changeAttribute}]})
		.addTag();
XSeen.Parser.defineTag ({
						'name'	: 'class3d',
						'init'	: XSeen.Tags.class3d.init,
						'fin'	: XSeen.Tags.class3d.fin,
						'event'	: XSeen.Tags.class3d.event
						})
		.defineAttribute ({'name':'selector', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'dump', dataType:'boolean', 'defaultValue':false, 'isAnimatable':false})
		.addTag();

		
