/**
 * @file Normalises global namespace across varying runtime environments.
 */


/// <reference path="../typings/main.d.ts" />


try {
	if (!self.crypto && (<any> self).msCrypto) {
		(<any> self).crypto			= (<any> self).msCrypto;
	}
	if (!self.crypto.subtle && (<any> crypto).webkitSubtle) {
		(<any> self).crypto.subtle	= (<any> crypto).webkitSubtle;
	}
}
catch (_) {}

(<any> self).IS_WEB	= typeof IS_WEB !== 'undefined' ?
	IS_WEB :
	typeof window === 'object'
;

for (let k of ['window', 'document']) {
	if (!(k in self)) {
		self[k]	= self;
	}
}

for (let k of [
	'Audio',
	'cyph',
	'customBuild',
	'customBuildFavicon',
	'history',
	'location',
	'navigator',
	'onthreadmessage',
	'Translations',
	'ui'
]) {
	if (!(k in self)) {
		self[k]	= null;
	}
}

(<any> self).locationData	= typeof locationData !== 'undefined' ?
	locationData :
	location
;

(<any> self).navigatorData	= typeof navigatorData !== 'undefined' ?
	navigatorData :
	navigator
;


/* Make sure compiler adds necessary helpers to global scope in threads */

(async () => {})();
