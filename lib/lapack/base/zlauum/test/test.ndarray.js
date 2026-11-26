// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlauum from './../lib/ndarray.js';
import zlauu2 from './../../zlauu2/lib/base.js';

// FIXTURES //

import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import identity_upper from './fixtures/identity_upper.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zlauum: upper 3x3', function t() {
	const tc = upper_3x3;
	// U = [2, 1+0.5i, 3+i; 0, 4, 5+i; 0, 0, 6] (real diagonal)
	const A = new Complex128Array( [
		2, 0,    0, 0,      0, 0,
		1, 0.5,  4, 0,      0, 0,
		3, 1,    5, 1,      6, 0
	] );
	const info = zlauum( 'upper', 3, A, 1, 3, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'zlauum: lower 3x3', function t() {
	const tc = lower_3x3;
	// L = [2, 0, 0; 1+0.5i, 4, 0; 3+i, 5+i, 6] (real diagonal)
	const A = new Complex128Array( [
		2, 0,    1, 0.5,   3, 1,
		0, 0,    4, 0,     5, 1,
		0, 0,    0, 0,     6, 0
	] );
	const info = zlauum( 'lower', 3, A, 1, 3, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'zlauum: N=1', function t() {
	const tc = n_one;
	const A = new Complex128Array( [ 5, 0 ] );
	const info = zlauum( 'upper', 1, A, 1, 1, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'zlauum: N=0 quick return', function t() {
	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const info = zlauum( 'upper', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zlauum: upper 4x4', function t() {
	const tc = upper_4x4;
	const A = new Complex128Array( [
		1, 0,     0, 0,     0, 0,     0, 0,
		2, 1,     5, 0,     0, 0,     0, 0,
		3, 0,     6, 0.5,   8, 0,     0, 0,
		4, 2,     7, 3,     9, 1,    10, 0
	] );
	const info = zlauum( 'upper', 4, A, 1, 4, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'zlauum: lower 4x4', function t() {
	const tc = lower_4x4;
	const A = new Complex128Array( [
		1, 0,    2, 1,     3, 0,    4, 2,
		0, 0,    5, 0,     6, 0.5,  7, 3,
		0, 0,    0, 0,     8, 0,    9, 1,
		0, 0,    0, 0,     0, 0,   10, 0
	] );
	const info = zlauum( 'lower', 4, A, 1, 4, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'zlauum: identity upper', function t() {
	const tc = identity_upper;
	const A = new Complex128Array( [
		1, 0,  0, 0,  0, 0,
		0, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1, 0
	] );
	const info = zlauum( 'upper', 3, A, 1, 3, 0 );
	const view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

/**
* Returns an N-by-N column-major triangular test matrix (opposite triangle zero).
*
* @private
* @param {string} uplo - triangle to fill
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} matrix
*/
function triangularInput( uplo, N ) {
	let i, j;
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( ( uplo === 'upper' ) ? i <= j : i >= j ) {
				v[ 2 * ( i + ( j * N ) ) ] = Math.sin( ( i * N ) + j + 1 ) + ( ( i === j ) ? 3.0 : 0.0 );
				v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = Math.cos( ( 3 * i ) + j );
			}
		}
	}
	return A;
}

test( 'zlauum: N in (old NB, 64] takes the unblocked path, like the reference (ILAENV NB = 64)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		[ 40, 64 ].forEach( function eachN( N ) {
			const A = triangularInput( uplo, N );
			const B = triangularInput( uplo, N );
			const info = zlauum( uplo, N, A, 1, N, 0 );
			zlauu2( uplo, N, B, 1, N, 0 );
			assert.equal( info, 0 );
			assert.deepStrictEqual( reinterpret( A, 0 ), reinterpret( B, 0 ), uplo + ' N=' + N );
		});
	});
});
