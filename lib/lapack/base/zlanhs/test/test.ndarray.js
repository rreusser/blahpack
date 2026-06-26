/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlanhs from './../lib/ndarray.js';


// FIXTURES //

var fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'zlanhs.jsonl' );
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

/**
* Builds a Complex128Array from interleaved [re, im, re, im, ...].
*
* @private
* @param {Array<number>} flat - flat array of real/imag pairs
* @returns {Complex128Array} complex array
*/
function buildCArr( flat ) {
	var buf = new Float64Array( flat );
	return new Complex128Array( buf.buffer );
}


// MATRIX DATA (mirrors test/fortran/test_zlanhs.f90) //

// 3x3 upper Hessenberg, LDA=3, column-major
//   Col1: (1+1i), (4+2i), (0+0i)
//   Col2: (2+0i), (5+1i), (7+3i)
//   Col3: (3+0i), (6+0i), (8+2i)
var A_3X3 = buildCArr([
	1.0, 1.0, 4.0, 2.0, 0.0, 0.0,
	2.0, 0.0, 5.0, 1.0, 7.0, 3.0,
	3.0, 0.0, 6.0, 0.0, 8.0, 2.0
]);


// FUNCTIONS //

function runCase( name, norm, N, A, lda ) {
	var WORK = new Float64Array( Math.max( N, 1 ) );
	var tc = findCase( name );
	var got = zlanhs( norm, N, A, 1, lda, 0, WORK, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlanhs: ' + name );
}


// TESTS //

test( 'zlanhs: max_norm', function t() {
	runCase( 'max_norm', 'max', 3, A_3X3, 3 );
});

test( 'zlanhs: one_norm', function t() {
	runCase( 'one_norm', 'one-norm', 3, A_3X3, 3 );
});

test( 'zlanhs: inf_norm', function t() {
	runCase( 'inf_norm', 'inf-norm', 3, A_3X3, 3 );
});

test( 'zlanhs: frob_norm', function t() {
	runCase( 'frob_norm', 'frobenius', 3, A_3X3, 3 );
});

test( 'zlanhs: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, A_3X3, 3 );
});
