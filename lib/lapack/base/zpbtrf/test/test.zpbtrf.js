/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpbtrf from './../lib/zpbtrf.js';


// TESTS //

test( 'zpbtrf is a function', function t() {
	assert.strictEqual( typeof zpbtrf, 'function', 'is a function' );
});

test( 'zpbtrf has expected arity', function t() {
	assert.strictEqual( zpbtrf.length, 6, 'has expected arity' );
});

test( 'zpbtrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpbtrf( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpbtrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpbtrf( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpbtrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpbtrf( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpbtrf: row-major band storage gives the transposed result of column-major', function t() {
	// Hermitian positive definite tridiagonal (kd = 1, N = 3), upper band:
	// diagonal 4, 5, 6 on row 1, superdiagonal (1+i), (2-i) on row 0.
	const N = 3;
	const kd = 1;
	const col = [ 0, 0, 4, 0, 1, 1, 5, 0, 2, -1, 6, 0 ];
	const ABc = new Complex128Array( col );
	const row = new Float64Array( 2 * ( kd + 1 ) * N );
	for ( let i = 0; i <= kd; i++ ) {
		for ( let j = 0; j < N; j++ ) {
			row[ 2 * ( ( i * N ) + j ) ] = col[ 2 * ( i + ( j * ( kd + 1 ) ) ) ];
			row[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = col[ ( 2 * ( i + ( j * ( kd + 1 ) ) ) ) + 1 ];
		}
	}
	const ABr = new Complex128Array( row );
	assert.strictEqual( zpbtrf( 'column-major', 'upper', N, kd, ABc, kd + 1 ), 0 );
	assert.strictEqual( zpbtrf( 'row-major', 'upper', N, kd, ABr, N ), 0 );
	const c = reinterpret( ABc, 0 );
	const r = reinterpret( ABr, 0 );
	for ( let i = 0; i <= kd; i++ ) {
		for ( let j = 0; j < N; j++ ) {
			assert.strictEqual( r[ 2 * ( ( i * N ) + j ) ], c[ 2 * ( i + ( j * ( kd + 1 ) ) ) ], 're(' + i + ',' + j + ')' );
			assert.strictEqual( r[ ( 2 * ( ( i * N ) + j ) ) + 1 ], c[ ( 2 * ( i + ( j * ( kd + 1 ) ) ) ) + 1 ], 'im(' + i + ',' + j + ')' );
		}
	}
	// The factor's first diagonal entry is sqrt(4) = 2.
	assert.strictEqual( c[ 2 ], 2 );
});
