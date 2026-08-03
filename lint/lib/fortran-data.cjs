'use strict';

// Access to the parsed Fortran signatures.
//
// The signature rules do not re-parse Fortran at lint time. Fortran is parsed
// once into a clean, flat, Fortran-only cache — data/fortran-signatures.json —
// produced by `node bin/gen_fortran_signatures.js` (see that file for the full
// provenance chain: .f sources → extract_metadata.py → routines.json →
// normalization → this cache, plus hand-transcribed signatures for routines
// whose source is not vendored). The cache is regenerable: if it went missing,
// re-running the generator reproduces it exactly.
//
// This module is the single place that loads the cache and answers one
// question: "what is the Fortran signature of routine <name>?" It exposes only
// Fortran facts (name, kind, returns, arguments with intent/type); no
// JavaScript interpretation lives here.

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..', '..' );
var CACHE_PATH = path.join( ROOT, 'data', 'fortran-signatures.json' );

var cache = null;

function load() {
	if ( !cache ) {
		cache = fs.existsSync( CACHE_PATH ) ? JSON.parse( fs.readFileSync( CACHE_PATH, 'utf8' ) ) : {};
	}
	return cache;
}

// Return the Fortran record for a routine, or null when the cache has no
// signature for it. `null` means "not yet ingested" — a visible coverage gap,
// never a silent pass.
function lookup( routineName ) {
	var map = load();
	return map[ String( routineName ).toLowerCase() ] || null;
}

module.exports = {
	'load': load,
	'lookup': lookup,
	'CACHE_PATH': CACHE_PATH
};
