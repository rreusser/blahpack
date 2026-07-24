'use strict';

// Provenance bridge: the parsed Fortran argument metadata.
//
// The signature rules do not re-parse Fortran at lint time — Fortran is parsed
// once (by `bin/extract_metadata.py`, which drives `fparser` over the reference
// BLAS/LAPACK sources) into `data/routines.json`. That file is the machine-read
// record of every routine's Fortran signature: for each dummy argument its
// name, intent (`in`/`out`/`in,out`) and declared type (including `array` and
// `dimension(...)`). This module is the single place that loads it and answers
// one question: "what are the Fortran arguments of routine <name>?"
//
// A small `data/supplemental.json`, kept beside the fortran-signature rule,
// carries the same shape of record for routines whose reference source is not
// vendored in this repository (e.g. the ARPACK family, and a couple of LAPACK
// routines whose extraction produced no argument list). Supplemental entries
// are transcribed verbatim from the reference Fortran signatures — they extend
// coverage of the derivation, they are NOT per-routine validation waivers.
// There is deliberately no mechanism anywhere in `lint/` to exempt a routine
// from a rule once its Fortran arguments are known.

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..', '..' );
var DB_PATH = path.join( ROOT, 'data', 'routines.json' );
var SUPPLEMENTAL_PATH = path.join( __dirname, '..', 'rules', 'fortran-signature', 'data', 'supplemental.json' );

var cache = null;

// Build a lowercase-name -> arguments map from routines.json plus the
// supplemental file. Later sources win, so a supplemental entry can fill a
// gap the extractor left (e.g. a routine recorded with zero arguments).
function build() {
	var map = {};

	if ( fs.existsSync( DB_PATH ) ) {
		var db = JSON.parse( fs.readFileSync( DB_PATH, 'utf8' ) );
		var algs = ( db && db.routines ) || {};
		Object.keys( algs ).forEach( function forEachAlg( key ) {
			var variants = algs[ key ].variants || [];
			variants.forEach( function forEachVariant( v ) {
				if ( !v.name || !v.arguments || v.arguments.length === 0 ) {
					return;
				}
				map[ v.name.toLowerCase() ] = {
					'name': v.name,
					'signature': v.signature || null,
					'arguments': v.arguments,
					'source': 'routines.json'
				};
			});
		});
	}

	if ( fs.existsSync( SUPPLEMENTAL_PATH ) ) {
		var supp = JSON.parse( fs.readFileSync( SUPPLEMENTAL_PATH, 'utf8' ) );
		Object.keys( supp ).forEach( function forEachSupp( name ) {
			var rec = supp[ name ];
			map[ name.toLowerCase() ] = {
				'name': rec.name || name.toUpperCase(),
				'signature': rec.signature || null,
				'arguments': rec.arguments || [],
				'source': 'supplemental.json'
			};
		});
	}

	return map;
}

function load() {
	if ( !cache ) {
		cache = build();
	}
	return cache;
}

// Return the Fortran record for a routine, or null when we have no parsed
// arguments for it. `null` means "not yet ingested" — a visible coverage gap,
// never a silent pass.
function lookup( routineName ) {
	var map = load();
	return map[ String( routineName ).toLowerCase() ] || null;
}

module.exports = {
	'load': load,
	'lookup': lookup,
	'DB_PATH': DB_PATH,
	'SUPPLEMENTAL_PATH': SUPPLEMENTAL_PATH
};
