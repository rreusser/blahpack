/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zheswapr from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const raw = readFileSync( path.join( fixtureDir, 'zheswapr.jsonl' ), 'utf8' );
const lines = raw.trim().split( '\n' );
const fixture = [];


// VARIABLES //

const N = 6;
const LDA = 6;
let k;
for ( k = 0; k < lines.length; k++ ) {
	fixture.push( JSON.parse( lines[ k ] ) );
}


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Object} actual - actual array-like
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds the Hermitian base matrix used by the Fortran fixture (column-major).
*
* @private
* @returns {Complex128Array} column-major Hermitian matrix
*/
function buildMatrix() {
	let idx, re, im, i, j;
	const a = new Float64Array( 2 * LDA * N );
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= N; i++ ) {
			idx = 2 * ( ( ( j - 1 ) * LDA ) + ( i - 1 ) );
			if ( i === j ) {
				re = ( 10 * i ) + 1;
				im = 0;
			} else if ( i < j ) {
				re = ( 10 * i ) + j;
				im = i + j;
			} else {
				re = ( 10 * j ) + i;
				im = -( i + j );
			}
			a[ idx ] = re;
			a[ idx + 1 ] = im;
		}
	}
	return new Complex128Array( a.buffer );
}

/**
* Runs a single swap and asserts against the fixture. Indices are zero-based.
*
* @private
* @param {string} name - fixture case name
* @param {string} uplo - upper or lower
* @param {integer} i1 - first index
* @param {integer} i2 - second index
*/
function runCase( name, uplo, i1, i2 ) {
	let i;
	const tc = findCase( name );
	assert.ok( tc, 'fixture case exists: ' + name );
	const A = buildMatrix();
	zheswapr( uplo, N, A, 1, LDA, 0, i1, i2 );
	const view = reinterpret( A, 0 );
	const arr = [];
	for ( i = 0; i < view.length; i++ ) {
		arr.push( view[ i ] );
	}
	assertArrayClose( arr, tc.a, 1e-14, name );
	for ( i = 0; i < N; i++ ) {
		assert.equal( view[ ( 2 * i * LDA ) + ( 2 * i ) + 1 ], 0, name + ' diag imag at ' + i );
	}
}


// TESTS //

test( 'zheswapr: upper_non_adjacent', function t() {
	runCase( 'upper_non_adjacent', 'upper', 1, 4 );
});

test( 'zheswapr: upper_adjacent', function t() {
	runCase( 'upper_adjacent', 'upper', 1, 2 );
});

test( 'zheswapr: upper_noop', function t() {
	runCase( 'upper_noop', 'upper', 2, 2 );
});

test( 'zheswapr: upper_i1_first', function t() {
	runCase( 'upper_i1_first', 'upper', 0, 3 );
});

test( 'zheswapr: upper_i2_last', function t() {
	runCase( 'upper_i2_last', 'upper', 2, N - 1 );
});

test( 'zheswapr: upper_both_bounds', function t() {
	runCase( 'upper_both_bounds', 'upper', 0, N - 1 );
});

test( 'zheswapr: lower_non_adjacent', function t() {
	runCase( 'lower_non_adjacent', 'lower', 1, 4 );
});

test( 'zheswapr: lower_adjacent', function t() {
	runCase( 'lower_adjacent', 'lower', 1, 2 );
});

test( 'zheswapr: lower_noop', function t() {
	runCase( 'lower_noop', 'lower', 2, 2 );
});

test( 'zheswapr: lower_i1_first', function t() {
	runCase( 'lower_i1_first', 'lower', 0, 3 );
});

test( 'zheswapr: lower_i2_last', function t() {
	runCase( 'lower_i2_last', 'lower', 2, N - 1 );
});

test( 'zheswapr: lower_both_bounds', function t() {
	runCase( 'lower_both_bounds', 'lower', 0, N - 1 );
});

test( 'zheswapr: returns the input matrix', function t() {
	const A = buildMatrix();
	const out = zheswapr( 'upper', N, A, 1, LDA, 0, 1, 4 );
	assert.equal( out, A );
});

test( 'zheswapr: N=0 quick no-op', function t() {
	const A = new Complex128Array( 0 );
	const out = zheswapr( 'upper', 0, A, 1, 1, 0, 0, 0 );
	assert.strictEqual( out, A );
});

test( 'zheswapr: upper path does not touch strict lower triangle', function t() {
	let i, j;
	const A = buildMatrix();
	const before = reinterpret( A, 0 ).slice();
	zheswapr( 'upper', N, A, 1, LDA, 0, 1, 4 );
	const view = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			assert.equal( view[ ( 2 * j * LDA ) + ( 2 * i ) ], before[ ( 2 * j * LDA ) + ( 2 * i ) ], 'strict lower re untouched' );
			assert.equal( view[ ( 2 * j * LDA ) + ( 2 * i ) + 1 ], before[ ( 2 * j * LDA ) + ( 2 * i ) + 1 ], 'strict lower im untouched' );
		}
	}
});

test( 'zheswapr: lower path does not touch strict upper triangle', function t() {
	let i, j;
	const A = buildMatrix();
	const before = reinterpret( A, 0 ).slice();
	zheswapr( 'lower', N, A, 1, LDA, 0, 1, 4 );
	const view = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			assert.equal( view[ ( 2 * j * LDA ) + ( 2 * i ) ], before[ ( 2 * j * LDA ) + ( 2 * i ) ], 'strict upper re untouched' );
			assert.equal( view[ ( 2 * j * LDA ) + ( 2 * i ) + 1 ], before[ ( 2 * j * LDA ) + ( 2 * i ) + 1 ], 'strict upper im untouched' );
		}
	}
});

test( 'zheswapr.ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zheswapr( 'invalid', 2, new Complex128Array( 4 ), 1, 2, 0, 0, 1 );
	}, TypeError );
});

test( 'zheswapr.ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zheswapr( 'upper', -1, new Complex128Array( 4 ), 1, 2, 0, 0, 1 );
	}, RangeError );
});
