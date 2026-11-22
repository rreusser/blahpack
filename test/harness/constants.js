/**
* Import a module with some of its named `const` declarations replaced, so
* a test can reach a path that no input reaches in practice: an
* iteration-limit exit (e.g. `MAXIT = 0`), or a limit too large to hit in
* a test.
*
* The routine's own code runs unchanged apart from the named constants. Each
* name must be declared exactly once, as `const NAME = …;`, or the import
* throws. Overrides compose with bin/break-mutants.mjs: the hook rewrites
* whatever source the mutation loader serves, so these tests kill mutants
* like any other (ticket 0051).
*
* @example
* const dsterf = ( await importWithConstants( new URL( './../lib/base.js', import.meta.url ), { 'MAXIT': 0 } ) ).default;
*/

import { register } from 'node:module';

let registered = false;

/**
* @param {URL|string} url - module URL (e.g. `new URL( './../lib/base.js', import.meta.url )`)
* @param {Object} constants - map of constant name to replacement value
* @returns {Promise<Object>} module namespace
*/
async function importWithConstants( url, constants ) {
	if ( !registered ) {
		register( new URL( './constants-hook.js', import.meta.url ) );
		registered = true;
	}
	return import( String( url ) + '?constants=' + encodeURIComponent( JSON.stringify( constants ) ) );
}

export { importWithConstants };
