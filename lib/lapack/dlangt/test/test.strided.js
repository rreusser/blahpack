/* eslint-disable no-restricted-syntax */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dlangt from './../lib/strided.js';


// FIXTURES //

const fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures', 'dlangt.jsonl' );
const rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
const FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

/**
* Returns a fixture by name.
*
* @private
* @param {string} name - case name
* @throws {Error} must be a known fixture
* @returns {Object} fixture record
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}


// MATRIX DATA (mirrors test/fortran/test_dlangt.f90) //

// 4x4 tridiagonal:
//   D  = [2, 4, 5, 6]
//   Dl = [3, 1, 2]
//   Du = [-1, -2, -3]
const DL_4 = new Float64Array( [ 3.0, 1.0, 2.0 ] );
const D_4 = new Float64Array( [ 2.0, 4.0, 5.0, 6.0 ] );
const DU_4 = new Float64Array( [ -1.0, -2.0, -3.0 ] );

// N=1: d(1) = -7
const D_N1 = new Float64Array( [ -7.0 ] );
const DL_EMPTY = new Float64Array( 0 );
const DU_EMPTY = new Float64Array( 0 );

// 5x5 larger:

//   Dl = [1, 2, 3, 4]

//   D  = [10, 20, 30, 40, 50]

//   Du = [5, 6, 7, 8]
const DL_5 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
const D_5 = new Float64Array( [ 10.0, 20.0, 30.0, 40.0, 50.0 ] );
const DU_5 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );

// N=2:

//   Dl = [0.5]

//   D  = [3, 4]

//   Du = [1.5]
const DL_N2 = new Float64Array( [ 0.5 ] );
const D_N2 = new Float64Array( [ 3.0, 4.0 ] );
const DU_N2 = new Float64Array( [ 1.5 ] );


// FUNCTIONS //

function runCase( name, norm, N, DL, D, DU ) {
	const tc = findCase( name );
	const got = dlangt( norm, N, DL, 1, 0, D, 1, 0, DU, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'dlangt: ' + name );
}


// TESTS //

test( 'dlangt: max_norm_4x4', function t() {
	runCase( 'max_norm_4x4', 'max', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: one_norm_4x4', function t() {
	runCase( 'one_norm_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: one_norm_O_4x4', function t() {
	runCase( 'one_norm_O_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: inf_norm_4x4', function t() {
	runCase( 'inf_norm_4x4', 'inf-norm', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: frob_norm_4x4', function t() {
	runCase( 'frob_norm_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: frob_norm_E_4x4', function t() {
	runCase( 'frob_norm_E_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'dlangt: max_norm_n1', function t() {
	runCase( 'max_norm_n1', 'max', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: one_norm_n1', function t() {
	runCase( 'one_norm_n1', 'one-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: inf_norm_n1', function t() {
	runCase( 'inf_norm_n1', 'inf-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: frob_norm_n1', function t() {
	runCase( 'frob_norm_n1', 'frobenius', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'dlangt: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, DL_EMPTY, new Float64Array( 0 ), DU_EMPTY );
});

test( 'dlangt: max_norm_5x5', function t() {
	runCase( 'max_norm_5x5', 'max', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: one_norm_5x5', function t() {
	runCase( 'one_norm_5x5', 'one-norm', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: inf_norm_5x5', function t() {
	runCase( 'inf_norm_5x5', 'inf-norm', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: frob_norm_5x5', function t() {
	runCase( 'frob_norm_5x5', 'frobenius', 5, DL_5, D_5, DU_5 );
});

test( 'dlangt: max_norm_n2', function t() {
	runCase( 'max_norm_n2', 'max', 2, DL_N2, D_N2, DU_N2 );
});

test( 'dlangt: one_norm_n2', function t() {
	runCase( 'one_norm_n2', 'one-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'dlangt: inf_norm_n2', function t() {
	runCase( 'inf_norm_n2', 'inf-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'dlangt: frob_norm_n2', function t() {
	runCase( 'frob_norm_n2', 'frobenius', 2, DL_N2, D_N2, DU_N2 );
});

/**
* Returns a deterministic pseudo-random number generator on [-1,1).
*
* @private
* @param {integer} seed - seed
* @returns {Function} generator
*/
function lcg( seed ) {
	let state = seed;
	return function next() {
		state = ( ( state * 1103515245 ) + 12345 ) % 2147483648;
		return ( ( 2.0 * state ) / 2147483648 ) - 1.0;
	};
}

/**
* Computes a norm of the dense tridiagonal matrix (reference oracle).
*
* @private
* @param {string} norm - norm type
* @param {NonNegativeInteger} N - order
* @param {Array} dl - sub-diagonal
* @param {Array} d - diagonal
* @param {Array} du - super-diagonal
* @returns {number} norm
*/
function denseNorm( norm, N, dl, d, du ) {
	const A = [];
	let out = 0.0;
	let s;
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		A.push( [] );
		for ( j = 0; j < N; j++ ) {
			if ( i === j ) {
				A[ i ].push( d[ i ] );
			} else if ( i === j + 1 ) {
				A[ i ].push( dl[ j ] );
			} else if ( j === i + 1 ) {
				A[ i ].push( du[ i ] );
			} else {
				A[ i ].push( 0.0 );
			}
		}
	}
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			if ( norm === 'max' ) {
				out = Math.max( out, Math.abs( A[ i ][ j ] ) );
			} else if ( norm === 'one-norm' ) {
				s += Math.abs( A[ j ][ i ] );
			} else if ( norm === 'inf-norm' ) {
				s += Math.abs( A[ i ][ j ] );
			} else {
				out += A[ i ][ j ] * A[ i ][ j ];
			}
		}
		out = Math.max( out, s );
	}
	return ( norm === 'frobenius' ) ? Math.sqrt( out ) : out;
}

test( 'dlangt matches the norms of the dense matrix (strided, offset storage)', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const rand = lcg( 42 );
	let expected;
	let actual;
	let trial;
	let DL;
	let DU;
	let dl;
	let du;
	let N;
	let d;
	let D;
	let i;
	let k;
	for ( N = 1; N <= 7; N++ ) {
		for ( trial = 0; trial < 20; trial++ ) {
			dl = [];
			d = [];
			du = [];
			for ( i = 0; i < N; i++ ) {
				d.push( 10.0 * rand() );
				if ( i < N - 1 ) {
					dl.push( 10.0 * rand() );
					du.push( 10.0 * rand() );
				}
			}
			// Storage: DL stride 2 offset 1, d stride 1 offset 3, DU stride 3 offset 2 (unused slots NaN):
			DL = new Float64Array( 1 + ( 2 * N ) ).fill( NaN );
			D = new Float64Array( 3 + N ).fill( NaN );
			DU = new Float64Array( 2 + ( 3 * N ) ).fill( NaN );
			for ( i = 0; i < N; i++ ) {
				D[ 3 + i ] = d[ i ];
				if ( i < N - 1 ) {
					DL[ 1 + ( 2 * i ) ] = dl[ i ];
					DU[ 2 + ( 3 * i ) ] = du[ i ];
				}
			}
			for ( k = 0; k < norms.length; k++ ) {
				expected = denseNorm( norms[ k ], N, dl, d, du );
				actual = dlangt( norms[ k ], N, DL, 2, 1, D, 1, 3, DU, 3, 2 );
				assertClose( actual, expected, 1e-14, format( '%s N=%d trial=%d', norms[ k ], N, trial ) );
			}
		}
	}
});

test( 'dlangt propagates NaN from any position (DISNAN checks)', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const N = 4;
	let which;
	let pos;
	let arr;
	let DL;
	let DU;
	let d;
	let k;
	for ( k = 0; k < norms.length; k++ ) {
		for ( which = 0; which < 3; which++ ) {
			for ( pos = 0; pos < ( ( which === 1 ) ? N : N - 1 ); pos++ ) {
				DL = new Float64Array( [ 1.0, 2.0, 3.0 ] );
				d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
				DU = new Float64Array( [ 8.0, 9.0, 10.0 ] );
				arr = [ DL, d, DU ][ which ];
				arr[ pos ] = NaN;
				assert.ok( Number.isNaN( dlangt( norms[ k ], N, DL, 1, 0, d, 1, 0, DU, 1, 0 ) ), format( '%s NaN in array %d at %d', norms[ k ], which, pos ) );
			}
		}
	}
});
