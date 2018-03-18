/*
 * XSeen JavaScript library
 *
 * (c)2017, Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 */

/*
 * The metadata tag defines metadata for an XSeen tag. Each metadata tag can define an individual value
 * or a collection of values stored as children elements. Metadata tags do not contain values.
 * A metadata structure is created by nesting additional metadata tags as children of a metadata tag.
 * All global HTML attributes are supported (and ignored).
 *
 * Changes to any metadata tag causes the entire metadata structure to be rebuilt and resaved
 * to the parent tag's data structure.
 *
 * Metadata is accessible with the getMetadata method called on the XSeen tag. It optionally
 * takes the name of the top-level metadata element name. Metadata tags without the 'name'
 * attribute create ascending array elements (using <object>.push).
 *
 */

 
/*
 * Need to parse out name and save it. Creation of the metadata structure is not done until 'fin' to
 * allow for children
 *
 *	Goal is to end up with a structure that for each child level there is an array element for each metadata tag
 *	and if 'name' is defined, there is exist a reference to that array element. Parent tag contains the entire
 *	structure of their children.
 *	<[parent] ...>
 *		<metadata name='c1' value='1'></metadata>
 *		<metadata name='c2'>
 *			<metadata name='c2.1' value='-1'></metadata>
 *			<metadata name='c2.2' value='test'></metadata>
 *			<metadata value='no name'></metadata>
 *		</metadata>
 *		<metadata name='c3' value='label1'></metadata>
 *			<metadata name='c3.1' value='-1'></metadata>
 *			<metadata name='c3.2' value='test'></metadata>
 *		</metadata>
 *	</[parent]>
 *
 * produces:
 *	[parent].Metadata(
 *						[0]		=> '1',
 *						[1]		=> (
 *									[0]		=> '',
 *									[1]		=> '-1',
 *									[2]		=> 'test',
 *									[3]		=> 'no name',
 *									['c2.1']=> (-->[1]),
 *									['c2.2']=> (-->[2])
 *									)
 *						[2]		=> (
 *									[0]		=> 'label1'
 *									[1]		=> '-1',
 *									[2]		=> 'test',
 *									['c3.1']=> (-->[1]),
 *									['c3.2']=> (-->[2])
 *									)
 *						['c1']	=> (-->[0]),
 *						['c2']	=> (-->[1]),
 *						['c3']	=> (-->[2])
 *					]
 * Metadata init
 */
XSeen.Tags.metadata = {
	'init'	: function (e, p) 
		{
			// Get name, value, and type
			// Parse value according to 'type'
			// Save this value in e._xseen.Metadata['name' : value]
			e._xseen.tmp.meta = [];
			e._xseen.tmp.meta.push (e._xseen.attributes.value);
			if (typeof(p._xseen.tmp.meta) == 'undefined') {p._xseen.tmp.meta = [];}
		},
	'fin'	: function (e, p) 
		{
			if (e._xseen.tmp.meta.length == 1) {		// this is a leaf tag
				p._xseen.tmp.meta.push (e._xseen.tmp.meta[0]);
				e._xseen.Metadata.push (e._xseen.tmp.meta[0]);
			} else {
				p._xseen.tmp.meta.push (e._xseen.tmp.meta);
				e._xseen.Metadata.push (e._xseen.tmp.meta);
			}
			if (e._xseen.attributes.name != '') {p._xseen.tmp.meta[e._xseen.attributes.name] = p._xseen.tmp.meta[p._xseen.tmp.meta.length-1];}
			e._xseen.tmp.meta = [];
		},
	'event'	: function (ev, attr) {},
	'changeValue'	: function (ev, attr) 
		{
			// Change this value and reparse Metadata tree
		},
};

// Add tag and attributes to Parsing table
XSeen.Parser.defineTag ({
						'name'	: 'metadata',
						'init'	: XSeen.Tags.metadata.init,
						'fin'	: XSeen.Tags.metadata.fin,
						'event'	: XSeen.Tags.metadata.event
						})
		.defineAttribute ({'name':'name', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'value', dataType:'string', 'defaultValue':'', 'isAnimatable':false})
		.defineAttribute ({'name':'type', dataType:'string', 'defaultValue':'string', enumeration:['string','integer', 'float', 'vector', 'object'], isCaseInsensitive:true, 'isAnimatable':false})
		.addEvents ({'mutation':[{'attributes':XSeen.Tags.metadata.changeValue}]})
		.addTag();
