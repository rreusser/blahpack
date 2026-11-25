/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbtrd from './../lib/dsbtrd.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns column-major band storage (LDAB = kd+1) of a deterministic symmetric band matrix.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {string} uplo - triangle
* @returns {Float64Array} band storage
*/
function band( N, kd, uplo ) {
	const ldab = kd + 1;
	const AB = new Float64Array( ldab * N );
	let i, j, v;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i <= Math.min( N - 1, j + kd ); i++ ) {
			v = ( i === j ) ? 4.0 + Math.sin( i + 1 ) : Math.cos( ( 3 * i ) + ( 7 * j ) + 1 );
			if ( uplo === 'upper' ) {
				AB[ ( kd + j - i ) + ( i * ldab ) ] = v;
			} else {
				AB[ ( i - j ) + ( j * ldab ) ] = v;
			}
		}
	}
	return AB;
}

/**
* Asserts exact element-wise equality.
*
* @private
* @param {Float64Array} actual - actual
* @param {Float64Array} expected - expected
* @param {string} msg - message
*/
function assertEqualArrays( actual, expected, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.equal( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dsbtrd is a function', function t() {
	assert.strictEqual( typeof dsbtrd, 'function', 'is a function' );
});

test( 'dsbtrd has expected arity', function t() {
	assert.strictEqual( dsbtrd.length, 14, 'has expected arity' );
});

test( 'dsbtrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsbtrd( 'invalid', 'none', 'upper', 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dsbtrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbtrd( 'row-major', 'none', 'invalid', 2, 1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
});

test( 'dsbtrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbtrd( 'row-major', 'none', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsbtrd throws RangeError for negative kd', function t() {
	assert.throws( function throws() {
		dsbtrd( 'column-major', 'none', 'upper', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Float64Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
});

test( 'dsbtrd throws RangeError for column-major LDAB < kd+1', function t() {
	assert.throws( function throws() {
		dsbtrd( 'column-major', 'none', 'upper', 3, 2, new Float64Array( 9 ), 2, new Float64Array( 3 ), 1, new Float64Array( 2 ), 1, new Float64Array( 9 ), 3, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dsbtrd throws RangeError for row-major LDAB < N', function t() {
	assert.throws( function throws() {
		dsbtrd( 'row-major', 'none', 'upper', 3, 1, new Float64Array( 6 ), 2, new Float64Array( 3 ), 1, new Float64Array( 2 ), 1, new Float64Array( 9 ), 3, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dsbtrd throws RangeError for LDQ < N when Q is wanted', function t() {
	assert.throws( function throws() {
		dsbtrd( 'column-major', 'initialize', 'upper', 3, 1, new Float64Array( 6 ), 2, new Float64Array( 3 ), 1, new Float64Array( 2 ), 1, new Float64Array( 9 ), 2, new Float64Array( 3 ) );
	}, RangeError );
});

test( 'dsbtrd (column-major) matches ndarray, with and without workspace', function t() {
	const vects = [ 'none', 'initialize', 'update' ];
	const uplos = [ 'upper', 'lower' ];
	const N = 9;
	const kd = 2;
	let ABe, ABw, de, dw, ee, ew, Qe, Qw, info, v, u, w;
	for ( v = 0; v < vects.length; v++ ) {
		for ( u = 0; u < uplos.length; u++ ) {
			ABe = band( N, kd, uplos[ u ] );
			de = new Float64Array( N );
			ee = new Float64Array( N - 1 );
			Qe = new Float64Array( N * N );
			Qe[ 0 ] = 1.0;
			Qe[ ( N * N ) - 1 ] = 1.0;
			Qe[ N + 2 ] = 1.0; // arbitrary non-trivial start for 'update'
			info = ndarray( vects[ v ], uplos[ u ], N, kd, ABe, 1, kd + 1, 0, de, 1, 0, ee, 1, 0, Qe, 1, N, 0, new Float64Array( N ), 1, 0 );
			assert.equal( info, 0 );
			for ( w = 0; w < 2; w++ ) {
				ABw = band( N, kd, uplos[ u ] );
				dw = new Float64Array( N );
				ew = new Float64Array( N - 1 );
				Qw = new Float64Array( N * N );
				Qw[ 0 ] = 1.0;
				Qw[ ( N * N ) - 1 ] = 1.0;
				Qw[ N + 2 ] = 1.0;
				info = dsbtrd( 'column-major', vects[ v ], uplos[ u ], N, kd, ABw, kd + 1, dw, 1, ew, 1, Qw, N, ( w === 0 ) ? new Float64Array( N ) : null );
				assert.equal( info, 0 );
				assertEqualArrays( dw, de, vects[ v ] + ' ' + uplos[ u ] + ' d' );
				assertEqualArrays( ew, ee, vects[ v ] + ' ' + uplos[ u ] + ' e' );
				assertEqualArrays( Qw, Qe, vects[ v ] + ' ' + uplos[ u ] + ' Q' );
				assertEqualArrays( ABw, ABe, vects[ v ] + ' ' + uplos[ u ] + ' AB' );
			}
		}
	}
});

test( 'dsbtrd (row-major) matches ndarray and the transposed column-major result', function t() {
	const vects = [ 'none', 'initialize' ];
	const uplos = [ 'upper', 'lower' ];
	const LDAB = 10; // >= N, padded
	const LDQ = 11; // >= N, padded
	const N = 9;
	const kd = 2;
	let ABc, ABr, ABe, dc, dr, de, ec, er, ee, Qc, Qr, Qe, info, v, u, i, j;
	for ( v = 0; v < vects.length; v++ ) {
		for ( u = 0; u < uplos.length; u++ ) {
			ABc = band( N, kd, uplos[ u ] );
			ABr = new Float64Array( ( kd + 1 ) * LDAB );
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i <= kd; i++ ) {
					ABr[ ( i * LDAB ) + j ] = ABc[ i + ( j * ( kd + 1 ) ) ];
				}
			}
			ABe = new Float64Array( ABr );
			dc = new Float64Array( N );
			ec = new Float64Array( N - 1 );
			Qc = new Float64Array( N * N );
			dr = new Float64Array( N );
			er = new Float64Array( N - 1 );
			Qr = new Float64Array( N * LDQ );
			de = new Float64Array( N );
			ee = new Float64Array( N - 1 );
			Qe = new Float64Array( N * LDQ );
			ndarray( vects[ v ], uplos[ u ], N, kd, ABc, 1, kd + 1, 0, dc, 1, 0, ec, 1, 0, Qc, 1, N, 0, new Float64Array( N ), 1, 0 );
			ndarray( vects[ v ], uplos[ u ], N, kd, ABe, LDAB, 1, 0, de, 1, 0, ee, 1, 0, Qe, LDQ, 1, 0, new Float64Array( N ), 1, 0 );
			info = dsbtrd( 'row-major', vects[ v ], uplos[ u ], N, kd, ABr, LDAB, dr, 1, er, 1, Qr, LDQ, null );
			assert.equal( info, 0 );
			assertEqualArrays( dr, de, vects[ v ] + ' ' + uplos[ u ] + ' d vs ndarray' );
			assertEqualArrays( er, ee, vects[ v ] + ' ' + uplos[ u ] + ' e vs ndarray' );
			assertEqualArrays( Qr, Qe, vects[ v ] + ' ' + uplos[ u ] + ' Q vs ndarray' );
			assertEqualArrays( ABr, ABe, vects[ v ] + ' ' + uplos[ u ] + ' AB vs ndarray' );
			assertEqualArrays( dr, dc, vects[ v ] + ' ' + uplos[ u ] + ' d vs column-major' );
			assertEqualArrays( er, ec, vects[ v ] + ' ' + uplos[ u ] + ' e vs column-major' );
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < N; i++ ) {
					assert.equal( Qr[ ( i * LDQ ) + j ], Qc[ i + ( j * N ) ], vects[ v ] + ' ' + uplos[ u ] + ' Q(' + i + ',' + j + ')' );
				}
			}
		}
	}
});
