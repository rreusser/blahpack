#!/usr/bin/env node
'use strict';

// Precompute a clean, flat, Fortran-ONLY signature cache.
//
//   data/fortran-signatures.json  ←  node bin/gen_fortran_signatures.js
//
// This is a caching step: the file is nothing but this utility's output, so if
// it goes missing, re-running the utility reproduces it exactly (byte-for-byte;
// keys are sorted and the writer is deterministic).
//
// It encodes ONLY the reference Fortran signatures — routine name, kind, return
// type, the raw signature string, and each dummy argument's name / intent /
// declared type. It contains NO interpretation of what the JavaScript should
// look like (no strides, offsets, renames, or consumed-argument logic); that
// derivation lives in lint/rules/fortran-signature/derive.cjs and consumes this
// cache.
//
// Provenance. The Fortran `.f` files are parsed by bin/extract_metadata.py into
// data/routines.json (grouped by algorithm, carrying descriptions and storage
// codes alongside the signatures). This utility is the normalization layer over
// that parse: it flattens routines.json to one entry per routine and drops
// everything that is not a Fortran signature fact. Routines whose reference
// source is not vendored in this repository (the ARPACK family, and a couple of
// LAPACK/BLAS routines the extractor recorded without an argument list) are
// supplied by data/fortran-signatures.supplemental.json — hand-transcribed from
// the reference Fortran, in the same shape. Supplemental entries win on overlap.
//
// The output is the single source the lint signature rules read.

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..' );
var ROUTINES = path.join( ROOT, 'data', 'routines.json' );
var SUPPLEMENTAL = path.join( ROOT, 'data', 'fortran-signatures.supplemental.json' );
var OUT = path.join( ROOT, 'data', 'fortran-signatures.json' );

// Parse `kind` and (for functions) `returns` out of a raw Fortran signature
// declaration, e.g. "DOUBLE PRECISION FUNCTION DDOT(N,DX,INCX,DY,INCY)" or
// "SUBROUTINE DGEMM(...)". Returns { kind, returns }.
function parseKind( signature ) {
	var sig = String( signature || '' );
	var fn = /\bFUNCTION\s+\w+/i.exec( sig );
	if ( fn ) {
		var prefix = sig.slice( 0, fn.index )
			.replace( /\bRECURSIVE\b/ig, '' )
			.replace( /\s+/g, ' ' )
			.trim();
		return { 'kind': 'function', 'returns': prefix || null };
	}
	if ( /\bSUBROUTINE\b/i.test( sig ) ) {
		return { 'kind': 'subroutine', 'returns': null };
	}
	return { 'kind': null, 'returns': null };
}

// Build one clean entry. `explicitKind` (from supplemental) overrides parsing.
function entry( rec, explicitKind ) {
	var parsed = parseKind( rec.signature );
	var kind = explicitKind || parsed.kind;
	var out = {
		'name': rec.name,
		'kind': kind
	};
	if ( kind === 'function' ) {
		out.returns = parsed.returns;
	}
	out.signature = rec.signature || null;
	out.arguments = ( rec.arguments || [] ).map( function map( a ) {
		return {
			'name': a.name,
			'intent': a.intent || a.direction || null,
			'type': a.type || null
		};
	});
	return out;
}

function loadJSON( p ) {
	return JSON.parse( fs.readFileSync( p, 'utf8' ) );
}

function main() {
	var sigs = {};

	// 1) Normalize routines.json (the .f parse), keeping only routines that
	//    actually carry an argument list.
	var db = loadJSON( ROUTINES );
	var algs = ( db && db.routines ) || {};
	Object.keys( algs ).forEach( function forEachAlg( k ) {
		( algs[ k ].variants || [] ).forEach( function forEachVariant( v ) {
			if ( !v.name || !v.arguments || v.arguments.length === 0 ) {
				return;
			}
			sigs[ v.name.toLowerCase() ] = entry( v, null );
		});
	});
	var fromDb = Object.keys( sigs ).length;

	// 2) Merge the not-vendored routines (supplemental wins on overlap).
	var suppCount = 0;
	if ( fs.existsSync( SUPPLEMENTAL ) ) {
		var supp = loadJSON( SUPPLEMENTAL );
		Object.keys( supp ).forEach( function forEachSupp( name ) {
			var rec = supp[ name ];
			sigs[ name.toLowerCase() ] = entry( rec, rec.kind || null );
			suppCount += 1;
		});
	}

	// 3) Deterministic write: sorted keys, stable 1-space value objects.
	var sortedKeys = Object.keys( sigs ).sort();
	var ordered = {};
	sortedKeys.forEach( function forEach( k ) {
		ordered[ k ] = sigs[ k ];
	});

	fs.writeFileSync( OUT, JSON.stringify( ordered, null, '\t' ) + '\n' );
	process.stderr.write(
		'wrote ' + sortedKeys.length + ' Fortran signatures to ' +
		path.relative( ROOT, OUT ) +
		' (' + fromDb + ' from routines.json, ' + suppCount + ' supplemental)\n'
	);
}

main();
