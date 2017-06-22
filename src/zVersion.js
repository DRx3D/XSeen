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
	Patch		= 0;
	PreRelease	= 'beta.1';
	Release		= 11;
	Version		= '';
	Date		= '2017-06-22';
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
	version.version = xseen.versionInfo.major + '.' + xseen.versionInfo.minor + '.' + xseen.versionInfo.patch;
	version.version += (xseen.versionInfo.preRelease != '') ? '-'+xseen.versionInfo.preRelease : '';
	version.version += (xseen.versionInfo.release != '') ? '+'+xseen.versionInfo.release : '';
	return version;
}