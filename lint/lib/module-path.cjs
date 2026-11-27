'use strict';

// Locates the module a file belongs to: `…/lib/<pkg>/<routine>/<rest…>` with
// <pkg> one of blas, lapack, arpack (ticket 0125: there is no `base/` level).
// The one place lint rules derive a routine from a path.

var path = require( 'path' );

var PKGS = [ 'blas', 'lapack', 'arpack' ];

/**
* Returns the module of a file path, or null outside a module.
*
* @param {string} filename - file path
* @returns {(Object|null)} `{ pkg, routine, rest }`, where `rest` is the path segments below the module directory
*/
function moduleOf( filename ) {
	var parts = String( filename ).split( path.sep );
	var i;
	for ( i = parts.length - 3; i >= 1; i-- ) {
		if ( parts[ i - 1 ] === 'lib' && PKGS.indexOf( parts[ i ] ) >= 0 ) {
			return { 'pkg': parts[ i ], 'routine': parts[ i + 1 ], 'rest': parts.slice( i + 2 ) };
		}
	}
	return null;
}

module.exports = { 'moduleOf': moduleOf, 'PKGS': PKGS };
