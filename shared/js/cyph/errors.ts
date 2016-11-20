import {Analytics} from './analytics';
import {Env} from './env';
import {Util} from './util';


/**
 * Handles errors.
 */
export class Errors {
	private static baseErrorLog (subject: string, shouldIncludeBootstrapText?: boolean) : Function {
		let numEmails: number	= 0;

		return (
			errorMessage?: string,
			url?: string,
			line?: number,
			column?: number,
			errorObject?: any
		) : void => {
			/* Annoying useless iframe-related spam */
			if (errorMessage === 'Script error.') {
				return;
			}

			const exception: string	= !errorMessage ? '' : (
				errorMessage + '\n\n' +
				'URL: ' + url + '\n' +
				'Line: ' + line + '\n' +
				'Column: ' + column + '\n\n' +
				(errorObject && errorObject.stack)
			).replace(/\/#.*/g, '');

			if (numEmails++ < 50) {
				Util.email({
					message: exception,
					subject: 'CYPH: ' + subject,
					to: 'errors'
				});
			}

			Analytics.send('exception', {
				exDescription: exception
			});
		};
	}

	/**
	 * Logs generic error (used by self.onerror).
	 * @param errorMessage
	 * @param url
	 * @param line
	 * @param column
	 * @param errorObject
	 * @function
	 */
	public static log			= Errors.baseErrorLog('WARNING WARNING WARNING SOMETHING IS SRSLY FUCKED UP LADS');

	/**
	 * Logs chat authentication failure (attempted mitm and/or mistyped shared secret).
	 * @function
	 */
	public static logAuthFail	= Errors.baseErrorLog('AUTHENTICATION JUST FAILED FOR SOMEONE LADS');

	private static _	= (() => {
		self.onerror	= <ErrorEventHandler> Errors.log;
	})();
}
