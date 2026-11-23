/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlagtf from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5 from './fixtures/basic_5x5.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };

// FUNCTIONS //

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
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
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlagtf: basic 5x5', function t() {

	const tc = basic_5x5;
	const a = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const b = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const c = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const d = new Float64Array( 3 );
	const IN = new Int32Array( 5 );
	const info = dlagtf( 5, a, 1, 0, 2.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( a, tc.a, 1e-14, 'a' );
	assertArrayClose( b, tc.b, 1e-14, 'b' );
	assertArrayClose( c, tc.c, 1e-14, 'c' );
	assertArrayClose( d, tc.d, 1e-14, 'd' );
	assert.deepEqual( toArray( IN ), tc.in, 'IN' );
});

test( 'dlagtf: N=1', function t() {

	const tc = n_equals_1;
	const a = new Float64Array( [ 5.0 ] );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const IN = new Int32Array( 1 );
	const info = dlagtf( 1, a, 1, 0, 3.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( a[ 0 ], tc.a[ 0 ], 1e-14, 'a[0]' );
	assert.equal( IN[ 0 ], tc.in[ 0 ], 'IN[0]' );
});

test( 'dlagtf: N=0', function t() {

	const a = new Float64Array( 1 );
	const b = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const d = new Float64Array( 1 );
	const IN = new Int32Array( 1 );
	const info = dlagtf( 0, a, 1, 0, 0.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, 0, 'info' );
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
* Reconstructs `P*L*U` from the factorization returned by dlagtf, as a dense row-major array of rows.
*
* `T - lambda*I = P_1*L_1*P_2*L_2*...*P_{n-1}*L_{n-1}*U`, where `L_k = I + c(k)*e(k+1)*e(k)^T` and `P_k` swaps rows `k` and `k+1` when `IN(k) = 1`.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {Function} a - accessor for the diagonal of U
* @param {Function} b - accessor for the first super-diagonal of U
* @param {Function} c - accessor for the multipliers
* @param {Function} d - accessor for the second super-diagonal of U
* @param {Function} piv - accessor for IN
* @returns {Array} dense matrix
*/
function reconstruct( N, a, b, c, d, piv ) {
	const R = [];
	let tmp;
	let i;
	let j;
	let k;
	for ( i = 0; i < N; i++ ) {
		R.push( [] );
		for ( j = 0; j < N; j++ ) {
			if ( j === i ) {
				R[ i ].push( a( i ) );
			} else if ( j === i + 1 ) {
				R[ i ].push( b( i ) );
			} else if ( j === i + 2 ) {
				R[ i ].push( d( i ) );
			} else {
				R[ i ].push( 0.0 );
			}
		}
	}
	for ( k = N - 2; k >= 0; k-- ) {
		for ( j = 0; j < N; j++ ) {
			R[ k + 1 ][ j ] += c( k ) * R[ k ][ j ];
		}
		if ( piv( k ) === 1 ) {
			tmp = R[ k ];
			R[ k ] = R[ k + 1 ];
			R[ k + 1 ] = tmp;
		}
	}
	return R;
}

test( 'dlagtf: P*L*U reconstructs T - lambda*I (strided, offset storage, pivoting and zero sub-diagonals)', function t() {
	const rand = lcg( 2024 );
	let lambda;
	let trial;
	let pivs;
	let info;
	let scl;
	let err;
	let ta;
	let tb;
	let tc;
	let IN;
	let R;
	let N;
	let A;
	let B;
	let C;
	let D;
	let i;
	let j;
	let v;
	pivs = 0;
	for ( N = 2; N <= 7; N++ ) {
		for ( trial = 0; trial < 30; trial++ ) {
			ta = [];
			tb = [];
			tc = [];
			for ( i = 0; i < N; i++ ) {
				ta.push( 4.0 * rand() );
				if ( i < N - 1 ) {
					tb.push( 4.0 * rand() );
					// Every fifth trial zeroes a sub-diagonal entry (exercises the C(K) = 0 branch):
					tc.push( ( trial % 5 === 0 && i === trial % ( N - 1 ) ) ? 0.0 : 4.0 * rand() );
				}
			}
			lambda = 2.0 * rand();

			// Storage: a stride 2 offset 1, b stride 1 offset 2, c stride 3 offset 0, d stride 2 offset 3, IN stride -1 offset N-1; unused slots NaN.
			A = new Float64Array( 2 + ( 2 * N ) ).fill( NaN );
			B = new Float64Array( 2 + N ).fill( NaN );
			C = new Float64Array( 3 * N ).fill( NaN );
			D = new Float64Array( 3 + ( 2 * N ) ).fill( NaN );
			IN = new Int32Array( N ).fill( -9 );
			for ( i = 0; i < N; i++ ) {
				A[ 1 + ( 2 * i ) ] = ta[ i ];
				if ( i < N - 1 ) {
					B[ 2 + i ] = tb[ i ];
					C[ 3 * i ] = tc[ i ];
				}
			}
			info = dlagtf( N, A, 2, 1, lambda, B, 1, 2, C, 3, 0, 0.0, D, 2, 3, IN, -1, N - 1 );
			assert.equal( info, 0, 'info' );
			R = reconstruct( N, function fa( k ) {
				return A[ 1 + ( 2 * k ) ];
			}, function fb( k ) {
				return ( k < N - 1 ) ? B[ 2 + k ] : 0.0;
			}, function fc( k ) {
				return C[ 3 * k ];
			}, function fd( k ) {
				return ( k < N - 2 ) ? D[ 3 + ( 2 * k ) ] : 0.0;
			}, function fp( k ) {
				return IN[ N - 1 - k ];
			});
			scl = 1.0;
			for ( i = 0; i < N; i++ ) {
				scl = Math.max( scl, Math.abs( ta[ i ] - lambda ) );
			}
			for ( i = 0; i < N; i++ ) {
				for ( j = 0; j < N; j++ ) {
					if ( i === j ) {
						v = ta[ i ] - lambda;
					} else if ( i === j + 1 ) {
						v = tc[ j ];
					} else if ( j === i + 1 ) {
						v = tb[ i ];
					} else {
						v = 0.0;
					}
					err = Math.abs( R[ i ][ j ] - v );
					assert.ok( err <= 1e-13 * scl * 4.0, 'N=' + N + ' trial=' + trial + ' (' + i + ',' + j + '): expected ' + v + ', got ' + R[ i ][ j ] );
				}
			}
			for ( i = 0; i < N - 1; i++ ) {
				assert.ok( IN[ N - 1 - i ] === 0 || IN[ N - 1 - i ] === 1, 'pivot flag' );
				pivs += IN[ N - 1 - i ];
			}
			assert.ok( IN[ 0 ] >= 0 && IN[ 0 ] <= N, 'IN(N) range' );
		}
	}
	assert.ok( pivs > 0, 'some row interchanges occurred' );
});

test( 'dlagtf: N=1 with A(1) = lambda flags exact singularity (IN(1) = 1)', function t() {
	const a = new Float64Array( [ 3.0 ] );
	const IN = new Int32Array( [ -9 ] );
	const info = dlagtf( 1, a, 1, 0, 3.0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 0.0, new Float64Array( 1 ), 1, 0, IN, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( a[ 0 ], 0.0, 'a' );
	assert.equal( IN[ 0 ], 1, 'IN(1)' );
});

test( 'dlagtf: zero pivot at step 1 with C(1) = 0 sets IN(N) = 1', function t() {
	// T - lambda*I = [ 0 1 0; 0 1 1; 0 1 2 ] (A(1) = lambda, C(1) = 0): MAX(PIV1,PIV2) = 0 <= TL at K = 1.
	const a = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const b = new Float64Array( [ 1.0, 1.0 ] );
	const c = new Float64Array( [ 0.0, 1.0 ] );
	const d = new Float64Array( [ NaN ] );
	const IN = new Int32Array( [ -9, -9, -9 ] );
	const info = dlagtf( 3, a, 1, 0, 1.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	assert.equal( info, 0, 'info' );

	// K=1: C(1)=0 -> IN(1)=0, D(1)=0. K=2: PIV1 = 1/2, PIV2 = 1/3 <= PIV1 -> no interchange, C(2) = 1/1, A(3) = 2 - 1*1 = 1.
	assert.deepEqual( toArray( a ), [ 0.0, 1.0, 1.0 ], 'a' );
	assert.deepEqual( toArray( b ), [ 1.0, 1.0 ], 'b' );
	assert.deepEqual( toArray( c ), [ 0.0, 1.0 ], 'c' );
	assert.deepEqual( toArray( d ), [ 0.0 ], 'd' );
	assert.deepEqual( toArray( IN ), [ 0, 0, 1 ], 'IN' );
});
