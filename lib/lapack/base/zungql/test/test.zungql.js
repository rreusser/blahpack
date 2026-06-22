/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeql2 from './../../zgeql2/lib/base.js';
import zungql from './../lib/zungql.js';


// FUNCTIONS //

function randomMatrix( M, N, seed ) {
	var A = new Complex128Array( M * N );
	var v = reinterpret( A, 0 );
	var x = seed;
	var i;
	for ( i = 0; i < 2 * M * N; i += 1 ) {
		x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
		v[ i ] = ( ( x % 2000 ) - 1000 ) / 500.0;
	}
	return A;
}

function verifyOrthonormal( Q, M, N, LDA, tol ) {
	var Av = reinterpret( Q, 0 );
	var maxErr = 0;
	var expected;
	var err;
	var re;
	var im;
	var qi;
	var qj;
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i += 1 ) {
		for ( j = 0; j < N; j += 1 ) {
			re = 0;
			im = 0;
			for ( k = 0; k < M; k += 1 ) {
				qi = 2 * ( k + ( i * LDA ) );
				qj = 2 * ( k + ( j * LDA ) );
				re += ( Av[ qi ] * Av[ qj ] ) + ( Av[ qi + 1 ] * Av[ qj + 1 ] );
				im += ( Av[ qi ] * Av[ qj + 1 ] ) - ( Av[ qi + 1 ] * Av[ qj ] );
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			err = Math.abs( re - expected ) + Math.abs( im );
			if ( err > maxErr ) {
				maxErr = err;
			}
		}
	}
	assert.ok( maxErr < tol, 'Q^H*Q=I, max error: ' + maxErr );
}


// TESTS //

test( 'zungql: is a function', function t() {
	assert.strictEqual( typeof zungql, 'function', 'is a function' );
});

test( 'zungql: has expected arity', function t() {
	assert.strictEqual( zungql.length, 10, 'has expected arity' );
});

test( 'zungql: throws TypeError for invalid order', function t() {
	assert.throws( function f() {
		zungql( 'invalid', 1, 1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, TypeError );
});

test( 'zungql: throws RangeError for negative M', function t() {
	assert.throws( function f() {
		zungql( 'column-major', -1, 1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zungql: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zungql( 'column-major', 1, -1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zungql: throws RangeError for negative K', function t() {
	assert.throws( function f() {
		zungql( 'column-major', 1, 1, -1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'zungql: throws RangeError for column-major LDA < max(1,M)', function t() {
	assert.throws( function f() {
		zungql( 'column-major', 4, 4, 4, new Complex128Array( 16 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zungql: throws RangeError for row-major LDA < max(1,N)', function t() {
	assert.throws( function f() {
		zungql( 'row-major', 4, 4, 4, new Complex128Array( 16 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1 );
	}, RangeError );
});

test( 'zungql: column-major 3x3 produces orthonormal Q', function t() {
	var M = 3;
	var N = 3;
	var K = 3;
	var LDA = M;
	var A = randomMatrix( M, N, 12345 );
	var TAU = new Complex128Array( K );
	var WORK = new Complex128Array( N );
	zgeql2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	var Wbig = new Complex128Array( N * 32 );
	var info = zungql( 'column-major', M, N, K, A, LDA, TAU, 1, Wbig, 1 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: row-major path executes (N=1 trivial Q)', function t() {
	// row-major just selects strides differently; for 1x1 the result is unitary.
	var info = zungql( 'row-major', 1, 1, 0, new Complex128Array( [ 0, 0 ] ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 32 ), 1 );
	assert.strictEqual( info, 0, 'info' );
});
