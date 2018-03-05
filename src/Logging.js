/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * 
 */
//var XSeen = (typeof(XSeen) === 'undefined') ? {} : XSeen;
if (typeof(XSeen) === 'undefined') {var XSeen = {};}
if (typeof(XSeen.definitions) === 'undefined') {XSeen.definitions = {};}

/*
 *	Logging object for handling all logging of messages
 *
 *	init is used to initialize and return the object. 
 */
 
XSeen.definitions.Logging = {
	'levels'	: ['Info', 'Debug', 'Warn', 'Error'],
	'Data'		: {
					'Levels' : {
						'Info'	: {'class':'xseen-log xseen-logInfo', 'level':7, label:'INFO'},
						'Debug'	: {'class':'xseen-log xseen-logInfo', 'level':5, label:'DEBUG'},
						'Warn'	: {'class':'xseen-log xseen-logInfo', 'level':3, label:'WARN'},
						'Error'	: {'class':'xseen-log xseen-logInfo', 'level':1, label:'ERROR'},
					},
					'maximumLevel'	: 9,
					'defaultLevel'	: 'Error',
					'active'			: true,
					'init'			: false,
					'maxLinesLogged'	: 10000,
					'lineCount'		: 0,
					'logContainer'	: null,
				},
	'init'		: function (show, element) {

		// 	If initialized, return this
		if (this.Data.init) {return this; }
	
		// Setup container
		if (document.getElementById('XSeenLog') === null) {
			this.Data.logContainer = document.createElement("div");
			this.Data.logContainer.id = "xseen_logdiv";
			this.Data.logContainer.setAttribute("class", "xseen-logContainer");
			this.Data.logContainer.style.clear = "both";
			element.parentElement.appendChild (this.Data.logContainer);
		} else {
			this.Data.logContainer = document.getElementById('XSeenLog');
			this.Data.logContainer.classList.add ("xseen-logContainer");
		}
		this.Data.init = true;
		if (!show) {this.LogOff()}
		return this;
	},
	
	'LogOn'		: function () {this.active = true;},
	'LogOff'	: function () {this.active = false;},

	'logLog'	: function (message, level) {
		if (this.Data.active && this.Data.Levels[level].level <= this.Data.maximumLevel) {
			if (this.Data.lineCount >= this.Data.maxLinesLogged) {
				message = "Maximum number of log lines (=" + this.Data.maxLinesLogged + ") reached. Deactivating logging...";
				this.Data.active = false;
				level = 'Error'
			}
			// if level not in this.levels, then set to this.Data.defaultLevel
			var node = document.createElement("p");
			node.setAttribute("class", this.Data.Levels[level].class);
			node.innerHTML = this.Data.Levels[level].label + ": " + message;
			this.Data.logContainer.insertBefore(node, this.Data.logContainer.firstChild);
		}
	},

	'logInfo'	: function (string) {this.logLog (string, 'Info');},
	'logDebug'	: function (string) {this.logLog (string, 'Debug');},
	'logWarn'	: function (string) {
		this.logLog (string, 'Warn');
		console.log ('Warning: ' + string);
	},
	'logError'	: function (string) {
		this.logLog (string, 'Error');
		console.log ('*** Error: ' + string);
	},
}
