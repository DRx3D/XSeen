/*
 * XSeen JavaScript library
 *
 * (c)2018, Daly Realism, Los Angeles
 *
 * Dual licensed under the MIT and GPL
 */

 
/*
 * XSeen Camera Manager.
 * This object is the manager for all XSeen cameras.
 *
 * provides method for the addition and selection of a camera for scene viewing
 *
 *
 *
 */

var XSeen = XSeen || {};
XSeen.CameraManager = {
		'PRIORITY_MINIMUM'	: 0,
		'PRIORITY_DEFAULT'	: 1,
		'DefinedCameras'	: [],		// Contains references to camera nodes ...[priority][order]
		'CurrentNode'		: null,
		
/*
 *
 */
		'add'				: function (camera)
					{
						console.log ('Adding camera#' + camera.id + ' to the list');
						if (typeof(this.DefinedCameras[camera._xseen.priority]) == 'undefined') {this.DefinedCameras[camera._xseen.priority] = [];}
						this.DefinedCameras[camera._xseen.priority].push (camera);
						camera._xseen.ndxCamera = this.DefinedCameras[camera._xseen.priority].length - 1;
					},
					
		'next'				: function ()
					{
						for (var p=this.DefinedCameras.length-1; p>=this.PRIORITY_MINIMUM; p--) {
							if (typeof(this.DefinedCameras[p]) != 'undefined') {
								for (var ii=0; ii<this.DefinedCameras[p].length; ii++) {
									if (this.DefinedCameras[p][ii]._xseen.available) {return this.DefinedCameras[p][ii];}
								}
							}
						}
						return this.DefinedCameras[this.PRIORITY_MINIMUM][0];	// System default
					},
					
		'setNext'			: function ()
					{
						var camera = this.next();
						if (this.CurrentNode !== null) {this.CurrentNode._xseen.active = false;}
						camera._xseen.active = true;
						camera._xseen.sceneInfo.Camera.position.set (
									camera._xseen.attributes.position.x,
									camera._xseen.attributes.position.y,
									camera._xseen.attributes.position.z);
						camera._xseen.sceneInfo.Camera.lookAt(0,0,0);		// Look at origin. Seems to be required for object type.
						// TODO: A number of other things need to be set/changed (tracking, type, etc.)
						this.CurrentNode = camera;
					}
};
