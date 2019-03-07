/**
 * Handles polyfill for Immersive Web features
 *
 * @author DrxR / http://xseen.org
 *
 *
 *	Developed for XSeen 2010-02-21
 */

XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
XSeen.IW = {
	
/*
 * Handle connecting and disconnecting the device camera
 */
 
 //	'e' is [almost] always a 'background' tag DOM element
	'connectCamera'		: function (e) {
			var constraints = {video: {facingMode: {exact: "environment"}}};
			var constraints = {video: {facingMode: "environment"}};
			if (e._xseen.videoState != 'defined') {
				console.log ('Camera/video not correctly configured. Current state: ' + e._xseen.videoState);
				return;
			}
			function handleSuccess(stream) {
				e._xseen.video.srcObject = stream;
				e._xseen.video.play();
				e._xseen.videoState = 'running';
				console.log ('Camera/video (' + stream.id + ') engaged and connected to display.');
				console.log (stream);
			}
			function handleError(error) {
				//console.error('Reeeejected!', error);
				console.log ('Device camera not available -- ignoring');
				e._xseen.videoState = 'error';
			}
			navigator.mediaDevices.getUserMedia(constraints).
				then(handleSuccess).catch(handleError);
	},

// From https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop
	'disconnectCamera'		: function (e) {
			if (e._xseen.videoState == 'running') {
				e._xseen.video.srcObject.getTracks().forEach (function(mediaTrack) {
						mediaTrack.stop();
				});
				e._xseen.video.srcObject = null;
				e._xseen.videoState = 'defined';
				console.log ('Disconnecting device camera');
			}
	},
};
