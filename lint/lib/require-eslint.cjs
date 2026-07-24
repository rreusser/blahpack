'use strict';

// Resolve ESLint whether it is installed locally (node_modules) or globally.
// In this project ESLint is provided by the toolchain rather than pinned as a
// local dependency, so a plain `require('eslint')` from inside lint/ can miss
// it. We try the normal resolution first, then fall back to the global prefix
// reported by `npm root -g`.

var path = require( 'path' );
var child = require( 'child_process' );

function tryRequire( id ) {
	try {
		return require( id );
	} catch ( err ) {
		return null;
	}
}

var eslint = tryRequire( 'eslint' );

if ( !eslint ) {
	try {
		var globalRoot = child.execSync( 'npm root -g', { 'encoding': 'utf8' } ).trim();
		eslint = require( path.join( globalRoot, 'eslint' ) );
	} catch ( err ) {
		throw new Error( 'Could not resolve the "eslint" module locally or globally: ' + err.message );
	}
}

module.exports = eslint;
