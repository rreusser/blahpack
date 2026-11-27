/* eslint-disable no-restricted-syntax */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlangt from './../lib/ndarray.js';


// FIXTURES //

const fixtureFile = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures', 'zlangt.jsonl' );
const rawLines = readFileSync( fixtureFile, 'utf8' ).trim().split( '\n' );
const FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s (rel err %s)', msg, expected, actual, relErr ) );
}

function findCase( name ) {
	let i;
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
	const buf = new Float64Array( flat );
	return new Complex128Array( buf.buffer );
}


// MATRIX DATA (mirrors test/fortran/test_zlangt.f90) //

// 4x4: dl, d, du
const DL_4 = buildCArr( [ 3.0, 2.0, 1.0, 4.0, 2.0, 1.0 ] );
const D_4 = buildCArr( [ 2.0, 1.0, 4.0, 2.0, 5.0, 3.0, 6.0, 1.0 ] );
const DU_4 = buildCArr( [ -1.0, 3.0, -2.0, 1.0, -3.0, 2.0 ] );

// N=1: d(1) = -7+3i
const D_N1 = buildCArr( [ -7.0, 3.0 ] );
const DL_EMPTY = new Complex128Array( 0 );
const DU_EMPTY = new Complex128Array( 0 );

// 5x5
const DL_5 = buildCArr( [ 1.0, 2.0, 2.0, 3.0, 3.0, 1.0, 4.0, 5.0 ] );
const D_5 = buildCArr( [ 10.0, 1.0, 20.0, 2.0, 30.0, 3.0, 40.0, 4.0, 50.0, 5.0 ] );
const DU_5 = buildCArr( [ 5.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0, 9.0 ] );

// N=2
const DL_N2 = buildCArr( [ 0.5, 1.0 ] );
const D_N2 = buildCArr( [ 3.0, 2.0, 4.0, 1.0 ] );
const DU_N2 = buildCArr( [ 1.5, 0.5 ] );


// FUNCTIONS //

function runCase( name, norm, N, DL, D, DU ) {
	const tc = findCase( name );
	const got = zlangt( norm, N, DL, 1, 0, D, 1, 0, DU, 1, 0 );
	assertClose( got, tc.result, 1e-12, 'zlangt: ' + name );
}


// TESTS //

test( 'zlangt: max_norm_4x4', function t() {
	runCase( 'max_norm_4x4', 'max', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: one_norm_4x4', function t() {
	runCase( 'one_norm_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: one_norm_O_4x4', function t() {
	runCase( 'one_norm_O_4x4', 'one-norm', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: inf_norm_4x4', function t() {
	runCase( 'inf_norm_4x4', 'inf-norm', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: frob_norm_4x4', function t() {
	runCase( 'frob_norm_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: frob_norm_E_4x4', function t() {
	runCase( 'frob_norm_E_4x4', 'frobenius', 4, DL_4, D_4, DU_4 );
});

test( 'zlangt: max_norm_n1', function t() {
	runCase( 'max_norm_n1', 'max', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: one_norm_n1', function t() {
	runCase( 'one_norm_n1', 'one-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: inf_norm_n1', function t() {
	runCase( 'inf_norm_n1', 'inf-norm', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: frob_norm_n1', function t() {
	runCase( 'frob_norm_n1', 'frobenius', 1, DL_EMPTY, D_N1, DU_EMPTY );
});

test( 'zlangt: n_zero', function t() {
	runCase( 'n_zero', 'max', 0, DL_EMPTY, new Complex128Array( 0 ), DU_EMPTY );
});

test( 'zlangt: max_norm_5x5', function t() {
	runCase( 'max_norm_5x5', 'max', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: one_norm_5x5', function t() {
	runCase( 'one_norm_5x5', 'one-norm', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: inf_norm_5x5', function t() {
	runCase( 'inf_norm_5x5', 'inf-norm', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: frob_norm_5x5', function t() {
	runCase( 'frob_norm_5x5', 'frobenius', 5, DL_5, D_5, DU_5 );
});

test( 'zlangt: max_norm_n2', function t() {
	runCase( 'max_norm_n2', 'max', 2, DL_N2, D_N2, DU_N2 );
});

test( 'zlangt: one_norm_n2', function t() {
	runCase( 'one_norm_n2', 'one-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'zlangt: inf_norm_n2', function t() {
	runCase( 'inf_norm_n2', 'inf-norm', 2, DL_N2, D_N2, DU_N2 );
});

test( 'zlangt: frob_norm_n2', function t() {
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
* Computes a norm of the dense complex tridiagonal matrix (reference oracle).
*
* @private
* @param {string} norm - norm type
* @param {NonNegativeInteger} N - order
* @param {Array} dl - sub-diagonal as [re,im] pairs
* @param {Array} d - diagonal as [re,im] pairs
* @param {Array} du - super-diagonal as [re,im] pairs
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
				A[ i ].push( Math.hypot( d[ i ][ 0 ], d[ i ][ 1 ] ) );
			} else if ( i === j + 1 ) {
				A[ i ].push( Math.hypot( dl[ j ][ 0 ], dl[ j ][ 1 ] ) );
			} else if ( j === i + 1 ) {
				A[ i ].push( Math.hypot( du[ i ][ 0 ], du[ i ][ 1 ] ) );
			} else {
				A[ i ].push( 0.0 );
			}
		}
	}
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			if ( norm === 'max' ) {
				out = Math.max( out, A[ i ][ j ] );
			} else if ( norm === 'one-norm' ) {
				s += A[ j ][ i ];
			} else if ( norm === 'inf-norm' ) {
				s += A[ i ][ j ];
			} else {
				out += A[ i ][ j ] * A[ i ][ j ];
			}
		}
		out = Math.max( out, s );
	}
	return ( norm === 'frobenius' ) ? Math.sqrt( out ) : out;
}

/**
* Stores complex values in a NaN-poisoned strided Complex128Array.
*
* @private
* @param {Array} vals - [re,im] pairs
* @param {integer} stride - stride (complex elements)
* @param {NonNegativeInteger} offset - offset (complex elements)
* @returns {Complex128Array} array
*/
function store( vals, stride, offset ) {
	const buf = new Float64Array( 2 * ( offset + ( stride * vals.length ) + 1 ) ).fill( NaN );
	let i;
	for ( i = 0; i < vals.length; i++ ) {
		buf[ 2 * ( offset + ( i * stride ) ) ] = vals[ i ][ 0 ];
		buf[ ( 2 * ( offset + ( i * stride ) ) ) + 1 ] = vals[ i ][ 1 ];
	}
	return new Complex128Array( buf.buffer );
}

test( 'zlangt matches the norms of the dense matrix (strided, offset storage)', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const rand = lcg( 7 );
	let expected;
	let actual;
	let trial;
	let dl;
	let du;
	let N;
	let d;
	let i;
	let k;
	for ( N = 1; N <= 7; N++ ) {
		for ( trial = 0; trial < 20; trial++ ) {
			dl = [];
			d = [];
			du = [];
			for ( i = 0; i < N; i++ ) {
				d.push( [ 10.0 * rand(), 10.0 * rand() ] );
				if ( i < N - 1 ) {
					dl.push( [ 10.0 * rand(), 10.0 * rand() ] );
					du.push( [ 10.0 * rand(), 10.0 * rand() ] );
				}
			}
			for ( k = 0; k < norms.length; k++ ) {
				expected = denseNorm( norms[ k ], N, dl, d, du );
				actual = zlangt( norms[ k ], N, store( dl, 2, 1 ), 2, 1, store( d, 1, 3 ), 1, 3, store( du, 3, 2 ), 3, 2 );
				assertClose( actual, expected, 1e-14, format( '%s N=%d trial=%d', norms[ k ], N, trial ) );
			}
		}
	}
});

test( 'zlangt propagates NaN from any position (DISNAN checks)', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const N = 4;
	let which;
	let vals;
	let pos;
	let k;
	for ( k = 0; k < norms.length; k++ ) {
		for ( which = 0; which < 3; which++ ) {
			for ( pos = 0; pos < ( ( which === 1 ) ? N : N - 1 ); pos++ ) {
				vals = [
					[ [ 1.0, 1.0 ], [ 2.0, 0.0 ], [ 3.0, -1.0 ] ],
					[ [ 4.0, 2.0 ], [ 5.0, 0.0 ], [ 6.0, 1.0 ], [ 7.0, -2.0 ] ],
					[ [ 8.0, 0.0 ], [ 9.0, 1.0 ], [ 10.0, 0.0 ] ]
				];
				vals[ which ][ pos ] = [ NaN, 0.0 ];
				assert.ok( Number.isNaN( zlangt( norms[ k ], N, store( vals[ 0 ], 1, 0 ), 1, 0, store( vals[ 1 ], 1, 0 ), 1, 0, store( vals[ 2 ], 1, 0 ), 1, 0 ) ), format( '%s NaN in array %d at %d', norms[ k ], which, pos ) );
			}
		}
	}
});
