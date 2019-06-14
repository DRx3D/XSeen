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
	'levels'	: ['Info', 'Debug', 'Warn', 'Error'],
	'Data'		: {
					'Levels' : {
						'info'	: {'class':'xseen-log xseen-logInfo', 'level':7, label:'INFO'},
						'debug'	: {'class':'xseen-log xseen-logInfo', 'level':5, label:'DEBUG'},
						'warn'	: {'class':'xseen-log xseen-logInfo', 'level':3, label:'WARN'},
						'error'	: {'class':'xseen-log xseen-logInfo', 'level':1, label:'ERROR'},
						'load'	: {'class':'xseen-log xseen-logLoad', 'level':4, label:'LOAD'},
					},
					'maximumLevel'		: 9,
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
					this.active = true;
					this.Data.logContainer.style.display = 'block';
				},
	'LogOff'	: function () {this.active = false;},

	'logLog'	: function (message, level) {
		if (!this.Data.init) {return this; }
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
			console.log (node.innerHTML);
		}
		return this;
	},

	'logInfo'	: function (string) {this.logLog (string, 'info');},
	'logDebug'	: function (string) {this.logLog (string, 'debug');},
	'logWarn'	: function (string) {
		this.logLog (string, 'warn');
		console.log ('Warning: ' + string);
	},
	'logError'	: function (string) {
		this.logLog (string, 'error');
		console.log ('*** Error: ' + string);
	},
	'logLoad'	: function (ev) {
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
		}
	},
}
