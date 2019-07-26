/*
 * XSeen JavaScript Library
 * http://tools.realism.com/...
 *
 * (C)2017 Daly Realism, Los Angeles
 * Dual licensed under the MIT and GPL
 *
 * 
 */
if (typeof(XSeen) === 'undefined') {var XSeen = {};}
if (typeof(XSeen.definitions) === 'undefined') {XSeen.definitions = {};}

/*
 *	Logging object for handling all logging of messages
 *
 *	init is used to initialize and return the object. 
 */
 
XSeen.definitions.Logging = {
	'levels'	: ['Ridiculous', 'Verbose', 'Debug', 'Info', 'Load', 'Warn', 'Error'],
	'Data'		: {
					'Levels' : {
						'ridiculous': {'class':'xseen-log xseen-logInfo', 'level':8, label:'+++'},
						'verbose'	: {'class':'xseen-log xseen-logInfo', 'level':7, label:'VERBOSE'},
						'debug'		: {'class':'xseen-log xseen-logInfo', 'level':5, label:'DEBUG'},
						'info'		: {'class':'xseen-log xseen-logInfo', 'level':4, label:'INFO'},
						'load'		: {'class':'xseen-log xseen-logLoad', 'level':3, label:'LOAD'},
						'warn'		: {'class':'xseen-log xseen-logInfo', 'level':2, label:'WARN'},
						'error'		: {'class':'xseen-log xseen-logInfo', 'level':1, label:'ERROR'},
						'force'		: {'class':'xseen-log xseen-logInfo', 'level':0, label:'FORCE'},
					},
					'maximumLevel'		: 9,
					'consoleLevel'		: 'Info',
					'defaultLevel'		: 'Error',
					'active'			: false,
					'init'				: false,
					'maxLinesLogged'	: 10000,
					'lineCount'			: 0,
					'logContainer'		: null,
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
		if (show) {
			//this.Data.logContainer.style.display = 'block';
			this.LogOn();
		} else {
			this.Data.logContainer.style.display = 'none';
		}
		this.Data.init = true;
		return this;
	},
	
	'LogOn'		: function () {
					this.Data.active = true;
					this.Data.logContainer.style.display = 'block';
				},
	'LogOff'	: function () {this.active = false;},

	'logLog'	: function (message, level) {
		if (!this.Data.init) {return this; }
		if (this.Data.active) {
			var innerText = this.Data.Levels[level].label + ": " + message;
			if (this.Data.Levels[level].level <= this.Data.maximumLevel) {
			// if level not in this.levels, then set to this.Data.defaultLevel
				var node = document.createElement("p");
				node.setAttribute("class", this.Data.Levels[level].class);
				node.innerHTML = this.Data.Levels[level].label + ": " + message;
				this.Data.logContainer.insertBefore(node, this.Data.logContainer.firstChild);
				this.Data.lineCount++;
			}
			if (this.Data.Levels[level].level <= this.Data.consoleLevel) {
				console.log (innerText);
			}
			if (this.Data.lineCount >= this.Data.maxLinesLogged) {
				message = "Maximum number of log lines (=" + this.Data.maxLinesLogged + ") reached. Deactivating logging...";
				this.Data.maximumLevel = 9;
				//this.Data.active = false;
			}
		}
		return this;
	},

	'logRidiculous'	: function (string) {this.logLog (string, 'ridiculous');},
	'logVerbose'	: function (string) {this.logLog (string, 'verbose');},
	'logDebug'		: function (string) {this.logLog (string, 'debug');},
	'logInfo'		: function (string) {this.logLog (string, 'info');},
	'logWarn'		: function (string) {
		this.logLog (string, 'warn');
		console.log ('Warning: ' + string);
	},
	'logError'	: function (string) {
		this.logLog (string, 'error');
		console.error ('*** Error: ' + string);
	},
	'logLoad'	: function (ev) {				// This is really an event handler and belongs in Events.js
		var node = document.createElement("p");
		var that = XSeen.definitions.Logging;
		node.setAttribute("class", that.Data.Levels['load'].class);
		node.innerHTML = that.Data.Levels['load'].label + ": " + ev.detail.state + ' for ' + ev.target.localName + '#' + ev.target.id;
		that.Data.logContainer.insertBefore(node, that.Data.logContainer.firstChild);
	},
	
	'initLoad'	: function (root) {
		root.addEventListener ('xseen-loadstart', this.logLoad, true);
		root.addEventListener ('xseen-loadcomplete', this.logLoad, true);
		root.addEventListener ('xseen-loadfail', this.logLoad, true);
	},
	'setLoggingLevel'	: function(newLevel, root) {
		if (typeof (this.Data.Levels[newLevel]) != 'undefined') {
			this.Data.maximumLevel = this.Data.Levels[newLevel].level;
			if (this.Data.maximumLevel >= this.Data.Levels['load'].level) this.initLoad(root);
			if (this.Data.maximumLevel >= this.Data.Levels['error'].level) this.LogOn();
			this.logLog ('Setting logging to ' + newLevel, 'force');
		}
	},
	'setConsoleLevel'	: function(newLevel) {
		if (typeof (this.Data.Levels[newLevel]) != 'undefined') {
			this.Data.consoleLevel = this.Data.Levels[newLevel].level;
			if (this.Data.consoleLevel >= this.Data.Levels['error'].level) this.LogOn();
			this.logLog ('Setting console logging to ' + newLevel, 'force');
		}
	},
}
