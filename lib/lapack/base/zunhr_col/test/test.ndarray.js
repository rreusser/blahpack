/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunhr_col from './../lib/ndarray.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}

// Build an MxN identity-like matrix in Complex128Array (column-major).
function identityM( M, N ) {
	var A = new Complex128Array( M * N );
	var v = reinterpret( A, 0 );
	var k;
	for ( k = 0; k < Math.min( M, N ); k += 1 ) {
		v[ 2 * ( k + ( k * M ) ) ] = 1.0;
	}
	return A;
}

// Build an MxN matrix with -1 on the diagonal.
function negIdentityM( M, N ) {
	var A = new Complex128Array( M * N );
	var v = reinterpret( A, 0 );
	var k;
	for ( k = 0; k < Math.min( M, N ); k += 1 ) {
		v[ 2 * ( k + ( k * M ) ) ] = -1.0;
	}
	return A;
}


// TESTS //

test( 'zunhr_col: main export is a function', function t() {
	assert.strictEqual( typeof zunhr_col, 'function', 'is a function' );
});

test( 'zunhr_col: M=0 quick return', function t() {
	var info = zunhr_col( 0, 3, 1, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 3 ), 1, 1, 0, new Float64Array( 3 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zunhr_col: N=0 quick return', function t() {
	var info = zunhr_col( 3, 0, 1, new Complex128Array( 0 ), 1, 3, 0, new Complex128Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zunhr_col: 3x3 identity, nb=1 (D = all -1)', function t() {
	var M = 3;
	var N = 3;
	var nb = 1;
	var A = identityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-12, 'd[0]' );
	approxEqual( d[ 1 ], -1.0, 1e-12, 'd[1]' );
	approxEqual( d[ 2 ], -1.0, 1e-12, 'd[2]' );
});

test( 'zunhr_col: 3x3 negative identity, nb=1 (D = all +1, exercises zscal branch)', function t() {
	var M = 3;
	var N = 3;
	var nb = 1;
	var A = negIdentityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );

	// For input -I, signs are +1, and the D[j]==1 branch (zscal CNEG_ONE) runs.
	approxEqual( d[ 0 ], 1.0, 1e-12, 'd[0]' );
	approxEqual( d[ 1 ], 1.0, 1e-12, 'd[1]' );
	approxEqual( d[ 2 ], 1.0, 1e-12, 'd[2]' );
});

test( 'zunhr_col: 4x2 (M>N) identity, nb=1 — exercises ztrsm branch', function t() {
	var M = 4;
	var N = 2;
	var nb = 1;
	var A = identityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-12, 'd[0]' );
	approxEqual( d[ 1 ], -1.0, 1e-12, 'd[1]' );
});

test( 'zunhr_col: 4x4 identity nb=2 — exercises panel zero-out loop', function t() {
	var M = 4;
	var N = 4;
	var nb = 2;
	var A = identityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-12, 'd[0]' );
	approxEqual( d[ 3 ], -1.0, 1e-12, 'd[3]' );
});

test( 'zunhr_col: 5x5 identity nb=3 — multi-panel blocked path', function t() {
	var M = 5;
	var N = 5;
	var nb = 3;
	var A = identityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 4 ], -1.0, 1e-12, 'd[4]' );
});

test( 'zunhr_col: mixed signs (alternating ±1 diagonal)', function t() {
	var M = 4;
	var N = 4;
	var nb = 2;
	var A = new Complex128Array( M * N );
	var v = reinterpret( A, 0 );
	v[ 2 * 0 ] = 1.0;
	v[ 2 * 5 ] = -1.0;
	v[ 2 * 10 ] = 1.0;
	v[ 2 * 15 ] = -1.0;
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );

	// Expect d to negate input diagonal sign.
	approxEqual( d[ 0 ], -1.0, 1e-12, 'd[0]' );
	approxEqual( d[ 1 ], 1.0, 1e-12, 'd[1]' );
	approxEqual( d[ 2 ], -1.0, 1e-12, 'd[2]' );
	approxEqual( d[ 3 ], 1.0, 1e-12, 'd[3]' );
});

test( 'zunhr_col: 6x6 identity nb=2 (multiple complete panels)', function t() {
	var M = 6;
	var N = 6;
	var nb = 2;
	var A = identityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	var i;
	for ( i = 0; i < N; i += 1 ) {
		approxEqual( d[ i ], -1.0, 1e-12, 'd[' + i + ']' );
	}
});

test( 'zunhr_col: 5x3 (M>N) identity nb=2', function t() {
	var M = 5;
	var N = 3;
	var nb = 2;
	var A = identityM( M, N );
	var T = new Complex128Array( nb * N );
	var d = new Float64Array( N );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-12, 'd[0]' );
	approxEqual( d[ 1 ], -1.0, 1e-12, 'd[1]' );
	approxEqual( d[ 2 ], -1.0, 1e-12, 'd[2]' );
});

test( 'zunhr_col: 1x1 identity nb=1', function t() {
	var M = 1;
	var N = 1;
	var nb = 1;
	var A = identityM( M, N );
	var T = new Complex128Array( 1 );
	var d = new Float64Array( 1 );
	var info = zunhr_col( M, N, nb, A, 1, M, 0, T, 1, nb, 0, d, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	approxEqual( d[ 0 ], -1.0, 1e-10, 'd[0]' );
});
