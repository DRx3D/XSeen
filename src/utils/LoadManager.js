/*
 * For use with XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * Licensed under MIT or GNU in the same manner as XSeen
 *
 * (C)2017 Daly Realiusm, Los Angeles
 * 
 */

/*
 *	Manages all download requests.
 *	Requests are queued up and processed to the maximum limit (.MaxRequests)
 *	Use this for processing text (X3D, XML, JSON, HTML) files. 
 *	Not really setup for binary files (.jpg, png, etc.)
 *
 *	Requires jQuery -- should work on removing that...
 *
 */

function LoadManager () {
	this.urlQueue = [];
	this.urlNext = -1;
	this.MaxRequests = 3;
	this.totalRequests = 0;
	this.totalResponses = 0;
	this.requestCount = 0;
	var lmThat = this;

	this.load = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadText = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'text', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadHtml = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'html', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadXml = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'xml', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadJson = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'json', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.loadImage = function (url, success, progress, failed, userdata) {
		this.urlQueue.push( {'url':url, 'type':'image', 'userdata':userdata, 'success':success, 'failure':failed, 'progress':progress} );
		this.loadNextUrl();
	}

	this.success = function (response, string, xhr) {
		if (typeof(xhr._loadManager.success) !== undefined) {
			xhr._loadManager.success (response, xhr._loadManager.userdata, xhr);
		}
	}

	this.failure = function (xhr, errorCode, errorText) {
		if (typeof(xhr._loadManager.failure) !== undefined) {
			xhr._loadManager.failure (xhr, xhr._loadManager.userdata, errorCode, errorText);
		}
	}

	this.requestComplete = function (event, xhr, settings) {
		lmThat.requestCount --;
		lmThat.totalResponses++;
		lmThat.loadNextUrl();
	}

	this.loadNextUrl = function () {
		if (this.requestCount >= this.MaxRequests) {return; }
		if (this.urlNext >= this.urlQueue.length || this.urlNext < 0) {
			this.urlNext = -1;
			for (var i=0; i<this.urlQueue.length; i++) {
				if (this.urlQueue[i] !== null) {
					this.urlNext = i;
					break;
				}
			}
			if (this.urlNext < 0) {
				this.urlQueue = [];
				return;
			}
		}

		this.requestCount ++;
		var details = this.urlQueue[this.urlNext];
		var settings = {
						'url'		: details.url,
						'dataType'	: details.type,
						'complete'	: this.requestComplete,
						'success'	: this.success,
						'error'		: this.failure
						};
		if (settings.dataType == 'json') {
			settings['beforeSend'] = function(xhr){xhr.overrideMimeType("application/json");};
		}
		this.urlQueue[this.urlNext] = null;
		this.urlNext ++;
		var x = jQuery.get(settings);		// Need to change this... Has impact throughout class
		x._loadManager = {'userdata': details.userdata, 'requestType':details.type, 'success':details.success, 'failure':details.failure};
		this.totalRequests++;
	}
}
