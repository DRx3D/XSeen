/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 */

 // Control Node definitions

XSeen.Tags.asset = {
	'init'	: function (e, p) 
		{
		},
	'fin'	: function (e, p) 
		{
		},
	'event'	: function (ev, attr) {},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'asset',
						'init'	: XSeen.Tags.asset.init,
						'fin'	: XSeen.Tags.asset.fin,
						'event'	: XSeen.Tags.asset.event
						})
		.addTag();
