'use strict';

// Copy-on-write ESLint plugin.
//
// Rules resolve in two layers:
//   1. Local rules in tools/eslint/rules/<name>.cjs (always available).
//   2. Optionally, stdlib's internal rules from a stdlib source checkout,
//      IF one is available. stdlib's ESLint rules are not published to npm
//      (`@stdlib/_tools` / `eslint-plugin-stdlib` do not exist there), so
//      this layer only activates when a checkout is present.
//
// Point at a stdlib checkout with the STDLIB_ESLINT_DIR environment
// variable (the repo root of a stdlib clone). When it is unset or invalid,
// only the local rules load — and eslint.config.cjs references only rules
// this plugin actually provides, so ESLint still runs instead of erroring
// on undefined rules.

var path = require( 'path' );
var fs = require( 'fs' );

// --- optional stdlib fallback ----------------------------------------------

var STDLIB_DIR = process.env.STDLIB_ESLINT_DIR || '';

function loadStdlibRules() {
	if ( !STDLIB_DIR ) {
		return {};
	}
	if ( !fs.existsSync( STDLIB_DIR ) ) {
		console.error( '[blahpack eslint] STDLIB_ESLINT_DIR is set but does not exist: ' + STDLIB_DIR + ' — skipping stdlib rules.' );
		return {};
	}
	var stdlibNodeModules = path.join( STDLIB_DIR, 'lib', 'node_modules' );
	var origPaths = module.paths.slice();
	module.paths = [ stdlibNodeModules ].concat( origPaths );
	try {
		return require( '@stdlib/_tools/eslint/rules' );
	} catch ( err ) {
		console.error( '[blahpack eslint] could not load stdlib ESLint rules from ' + STDLIB_DIR + ': ' + err.message );
		return {};
	} finally {
		module.paths = origPaths;
	}
}

// --- local rules ------------------------------------------------------------

var LOCAL_RULES_DIR = path.join( __dirname, 'rules' );

function loadLocalRules() {
	var rules = {};
	if ( !fs.existsSync( LOCAL_RULES_DIR ) ) {
		return rules;
	}
	fs.readdirSync( LOCAL_RULES_DIR ).forEach( function forEach( file ) {
		if ( !file.endsWith( '.cjs' ) ) {
			return;
		}
		var name = file.replace( /\.cjs$/, '' );
		try {
			rules[ name ] = require( path.join( LOCAL_RULES_DIR, file ) );
		} catch ( err ) {
			// A rule that transitively requires stdlib internals (absent
			// without STDLIB_ESLINT_DIR) is skipped rather than crashing the
			// whole lint run.
			console.error( '[blahpack eslint] skipping rule "' + name + '": ' + err.message );
		}
	});
	return rules;
}

// --- merged plugin ----------------------------------------------------------

var merged = {};
var fallback = loadStdlibRules();
var local = loadLocalRules();
Object.keys( fallback ).forEach( function ( n ) { merged[ n ] = fallback[ n ]; } );
Object.keys( local ).forEach( function ( n ) { merged[ n ] = local[ n ]; } ); // local overrides

module.exports = {
	rules: merged
};
