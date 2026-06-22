/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlangb from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlangb.jsonl' );
var rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

// Builds a complex band-storage Complex128Array from cell entries.
// `cells` is a list of (row, col, re, im) tuples (1-indexed).
function buildAB( ldab, ncols, cells ) {
	var view;
	var out;
	var idx;
	var i;
	out = new Complex128Array( ldab * ncols );
	view = new Float64Array( out.buffer );
	for ( i = 0; i < cells.length; i += 4 ) {
		idx = ( cells[ i ] - 1 ) + ( ( cells[ i + 1 ] - 1 ) * ldab );
		view[ ( 2 * idx ) ] = cells[ i + 2 ];
		view[ ( 2 * idx ) + 1 ] = cells[ i + 3 ];
	}
	return out;
}

function runCase( name, norm, N, KL, KU, AB, ldab ) {
	var WORK;
	var got;
	var tc;
	WORK = new Float64Array( Math.max( N, 1 ) );
	tc = findCase( name );
	got = zlangb( norm, N, KL, KU, AB, 1, ldab, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlangb: ' + name );
}


// MATRIX DATA (mirrors test/fortran/test_zlangb.f90) //

// 5x5 with KL=1, KU=2 (LDAB=4)
var AB_5X5 = buildAB( 4, 5, [
	3, 1, 1.0, 2.0, 4, 1, 7.0, 8.0,
	2, 2, 3.0, 4.0, 3, 2, 9.0, 1.0, 4, 2, 6.0, 7.0,
	1, 3, 5.0, 6.0, 2, 3, 2.0, 3.0, 3, 3, 8.0, 9.0, 4, 3, 5.0, 6.0,
	1, 4, 4.0, 5.0, 2, 4, 1.0, 2.0, 3, 4, 7.0, 8.0, 4, 4, 2.0, 3.0,
	1, 5, 3.0, 4.0, 2, 5, 9.0, 1.0, 3, 5, 4.0, 5.0
] );

// 4x4 with KL=1, KU=1 (LDAB=3)
var AB_4X4 = buildAB( 3, 4, [
	2, 1, 1.0, 1.0, 3, 1, 3.0, 3.0,
	1, 2, 2.0, 2.0, 2, 2, 4.0, 4.0, 3, 2, 6.0, 6.0,
	1, 3, 5.0, 5.0, 2, 3, 7.0, 7.0, 3, 3, 9.0, 9.0,
	1, 4, 8.0, 8.0, 2, 4, 1.0, 1.0
] );

// 3x3 diagonal (KL=0, KU=0, LDAB=1)
var AB_DIAG = buildAB( 1, 3, [
	1, 1, 3.0, 4.0,
	1, 2, 1.0, 1.0,
	1, 3, 2.0, 2.0
] );

// 1x1 (3+4i)
var AB_1X1 = buildAB( 1, 1, [ 1, 1, 3.0, 4.0 ] );


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlangb, 'function', 'main export is a function' );
});

test( 'zlangb: throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlangb( 'invalid', 4, 1, 1, AB_4X4, 1, 3, 0, new Float64Array( 4 ), 1, 0 );
	}, TypeError );
});

test( 'zlangb: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlangb( 'one-norm', -1, 1, 1, AB_4X4, 1, 3, 0, new Float64Array( 4 ), 1, 0 );
	}, RangeError );
});

test( 'zlangb: max_5x5', function t() {
	runCase( 'max_5x5', 'max', 5, 1, 2, AB_5X5, 4 );
});

test( 'zlangb: one_5x5', function t() {
	runCase( 'one_5x5', 'one-norm', 5, 1, 2, AB_5X5, 4 );
});

test( 'zlangb: inf_5x5', function t() {
	runCase( 'inf_5x5', 'inf-norm', 5, 1, 2, AB_5X5, 4 );
});

test( 'zlangb: frob_5x5', function t() {
	runCase( 'frob_5x5', 'frobenius', 5, 1, 2, AB_5X5, 4 );
});

test( 'zlangb: max_4x4_tridiag', function t() {
	runCase( 'max_4x4_tridiag', 'max', 4, 1, 1, AB_4X4, 3 );
});

test( 'zlangb: one_4x4_tridiag', function t() {
	runCase( 'one_4x4_tridiag', 'one-norm', 4, 1, 1, AB_4X4, 3 );
});

test( 'zlangb: inf_4x4_tridiag', function t() {
	runCase( 'inf_4x4_tridiag', 'inf-norm', 4, 1, 1, AB_4X4, 3 );
});

test( 'zlangb: frob_4x4_tridiag', function t() {
	runCase( 'frob_4x4_tridiag', 'frobenius', 4, 1, 1, AB_4X4, 3 );
});

test( 'zlangb: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, 1, 2, AB_5X5, 4 );
});

test( 'zlangb: max_diag_only', function t() {
	runCase( 'max_diag_only', 'max', 3, 0, 0, AB_DIAG, 1 );
});

test( 'zlangb: one_diag_only', function t() {
	runCase( 'one_diag_only', 'one-norm', 3, 0, 0, AB_DIAG, 1 );
});

test( 'zlangb: inf_diag_only', function t() {
	runCase( 'inf_diag_only', 'inf-norm', 3, 0, 0, AB_DIAG, 1 );
});

test( 'zlangb: frob_diag_only', function t() {
	runCase( 'frob_diag_only', 'frobenius', 3, 0, 0, AB_DIAG, 1 );
});

test( 'zlangb: frob_1x1', function t() {
	runCase( 'frob_1x1', 'frobenius', 1, 0, 0, AB_1X1, 1 );
});

test( 'zlangb: one_1x1', function t() {
	runCase( 'one_1x1', 'one-norm', 1, 0, 0, AB_1X1, 1 );
});
