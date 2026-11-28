/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrevc3 from './../lib/ztrevc3.js';
import strided from './../lib/strided.js';


// FIXTURES //

// 2x2 upper-triangular diag(3,5) (column-major):
function tri2() {
	return new Complex128Array([ 3.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ]);
}
function select2() {
	return new Uint8Array([ 1, 1 ]);
}


// TESTS //

test( 'ztrevc3 is a function', function t() {
	assert.strictEqual( typeof ztrevc3, 'function', 'is a function' );
});

test( 'ztrevc3 has expected arity', function t() {
	assert.strictEqual( ztrevc3.length, 16, 'has expected arity' );
});

test( 'ztrevc3 throws a TypeError for an invalid side', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		ztrevc3( 'column-major', 'bogus', 'all', select2(), 1, 2, tri2(), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 2, m, null, null );
	}, TypeError );
});

test( 'ztrevc3 throws a TypeError for an invalid howmny', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		ztrevc3( 'column-major', 'right', 'bogus', select2(), 1, 2, tri2(), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 2, m, null, null );
	}, TypeError );
});

test( 'ztrevc3 throws a RangeError for LDT < max(1,N)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		ztrevc3( 'column-major', 'right', 'all', select2(), 1, 2, tri2(), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, 2, m, null, null );
	}, RangeError );
});

test( 'ztrevc3 computes right eigenvectors of a diagonal matrix (auto workspaces)', function t() {
	const m = new Int32Array( 1 );
	const VR = new Complex128Array( 4 );
	const info = ztrevc3( 'column-major', 'right', 'all', select2(), 1, 2, tri2(), 2, new Complex128Array( 4 ), 2, VR, 2, 2, m, null, null );
	assert.strictEqual( info, 0, 'info is 0' );

	// For a diagonal matrix, the right eigenvectors are the standard basis vectors:
	const v = new Float64Array( VR.buffer );
	assert.ok( Math.abs( Math.abs( v[ 0 ] ) - 1.0 ) < 1e-12, 'VR[0,0] has unit modulus' );
	assert.ok( Math.abs( v[ 2 ] ) < 1e-12, 'VR[1,0] is zero' );
});

test( 'ztrevc3 matches the strided form', function t() {
	const m = new Int32Array( 1 );
	const VR1 = new Complex128Array( 4 );
	const info1 = ztrevc3( 'column-major', 'right', 'all', select2(), 1, 2, tri2(), 2, new Complex128Array( 4 ), 2, VR1, 2, 2, m, null, null );

	const VR2 = new Complex128Array( 4 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );
	const info2 = strided( 'right', 'all', select2(), 1, 0, 2, tri2(), 1, 2, 0, new Complex128Array( 4 ), 1, 2, 0, VR2, 1, 2, 0, 2, m, WORK, 1, 0, RWORK, 1, 0 );

	assert.strictEqual( info1, info2, 'info matches' );
	const a1 = new Float64Array( VR1.buffer );
	const a2 = new Float64Array( VR2.buffer );
	for ( let i = 0; i < a1.length; i++ ) {
		assert.ok( Math.abs( a1[ i ] - a2[ i ] ) < 1e-14, 'VR['+i+'] matches' );
	}
});

test( 'ztrevc3: WORK = null allocates the optimal workspace and back-transforms at N=70 (blocked)', function t() {
	const N = 70;
	const T = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const tv = reinterpret( T, 0 );
	const vr = reinterpret( VR, 0 );
	const vl = reinterpret( VL, 0 );
	const M = new Int32Array( 1 );
	let i;
	for ( i = 0; i < N; i++ ) {
		tv[ 2 * ( i + ( i * N ) ) ] = i + 1;
		tv[ ( 2 * ( i + ( i * N ) ) ) + 1 ] = 0.5;
		vr[ 2 * ( i + ( i * N ) ) ] = 1.0;
		vl[ 2 * ( i + ( i * N ) ) ] = 1.0;
		if ( i > 0 ) {
			tv[ 2 * ( ( i - 1 ) + ( i * N ) ) ] = 0.5;
		}
	}
	const info = ztrevc3( 'column-major', 'both', 'backtransform', new Uint8Array( N ), 1, N, T, N, VL, N, VR, N, N, M, null, null );
	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( M[ 0 ], N, 'M' );

	// With Q = I, column 0 of VR is e_0, and the last column of VL is e_(N-1):
	assert.strictEqual( vr[ 0 ], 1.0, 'VR(0,0)' );
	assert.strictEqual( vl[ 2 * ( ( N - 1 ) + ( ( N - 1 ) * N ) ) ], 1.0, 'VL(N-1,N-1)' );
	for ( i = 0; i < 2 * N * N; i++ ) {
		assert.ok( Number.isFinite( vr[ i ] ) && Number.isFinite( vl[ i ] ), 'finite at ' + i );
	}
});
