/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 */

/*
 * Version Information for XSeen
 */
xseen.generateVersion = function () {
	var Major, Minor, Patch, PreRelease, Release, Date, SpashText;
	Major		= 0;
	Minor		= 3;
	Patch		= 6;
	PreRelease	= 'beta.1';
	Release		= 12;
	Version		= '';
	Date		= '2017-06-23';
	SplashText	= ["XSeen 3D Language parser.", "XSeen <a href='http://tools.realism.com/specification/xseen' target='_blank'>Documentation</a>."];
// All X3D and A-Frame pre-defined solids, fixed camera, directional light, Material texture only, glTF model loader with animations, Assets and reuse, Viewpoint, Background, Lighting, Image Texture, [Indexed]TriangleSet, IndexedFaceSet, [Indexed]QuadSet<br>\nNext work<ul><li>Event Model/Animation</li><li>Extrusion</li><li>Navigation</li></ul>",

	var version = {
		major		: Major,
		minor		: Minor,
		patch		: Patch,
		preRelease	: PreRelease,
		release		: Release,
		version		: '',
		date		: Date,
		splashText	: SplashText
	};
// Using the scheme at http://semver.org/
	version.version = version.major + '.' + version.minor + '.' + version.patch;
	version.version += (version.preRelease != '') ? '-' + version.preRelease : '';
	version.version += (version.release != '') ? '+' + version.release : '';
	return version;
}