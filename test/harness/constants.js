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

/**
* Import a module with some of its imports replaced by test functions, so a
* test can reach a path taken only when a callee fails (zgges's `info = N+3`
* when ztgsen cannot reorder; ticket 0051 left this case open until one was
* found). The module's own code runs unchanged.
*
* Each key must be an import specifier that appears exactly once in the
* module's source (e.g. `'./../../ztgsen/lib/base.js'`); its default
* export becomes the given function. Like `importWithConstants`, the
* rewrite applies to whatever source the next hook serves, so it composes
* with bin/break-mutants.mjs.
*
* @example
* const zgges = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), { './../../ztgsen/lib/base.js': () => 1 } ) ).default;
*
* @param {URL|string} url - module URL
* @param {Object<string, Function>} deps - map of import specifier to replacement default export
* @returns {Promise<Object>} module namespace
*/
async function importWithDependencies( url, deps ) {
	if ( !registered ) {
		register( new URL( './constants-hook.js', import.meta.url ) );
		registered = true;
	}
	const ids = {};
	globalThis.__harnessDeps = globalThis.__harnessDeps || [];
	for ( const [ spec, fn ] of Object.entries( deps ) ) {
		ids[ spec ] = globalThis.__harnessDeps.push( fn ) - 1;
	}
	return import( String( url ) + '?deps=' + encodeURIComponent( JSON.stringify( ids ) ) );
}

export { importWithConstants, importWithDependencies };
