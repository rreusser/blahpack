/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrevc3 from './../lib/ndarray.js';

// FIXTURES //

import right_all_n1 from './fixtures/right_all_n1.json' with { type: 'json' };
import right_all_3x3 from './fixtures/right_all_3x3.json' with { type: 'json' };
import left_all_3x3 from './fixtures/left_all_3x3.json' with { type: 'json' };
import both_all_3x3 from './fixtures/both_all_3x3.json' with { type: 'json' };
import right_all_diag from './fixtures/right_all_diag.json' with { type: 'json' };
import right_all_4x4 from './fixtures/right_all_4x4.json' with { type: 'json' };
import right_backtransform_3x3 from './fixtures/right_backtransform_3x3.json' with { type: 'json' };
import left_backtransform_3x3 from './fixtures/left_backtransform_3x3.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	const diff = Math.abs( actual - expected );
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.strictEqual( actual.length >= expected.length, true, msg + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// HELPERS //

function makeMatrix( vals, N ) {
	const buf = new Complex128Array( N * N );
	const v = reinterpret( buf, 0 );
	let i;
	for ( i = 0; i < vals.length; i++ ) {
		v[ i ] = vals[ i ];
	}
	return buf;
}

// TESTS //

test( 'ztrevc3 is a function', function t() {
	assert.strictEqual( typeof ztrevc3, 'function' );
});

test( 'ztrevc3: N=1 right eigenvectors', function t() {
	const tc = right_all_n1;
	const T = makeMatrix( [ 5.0, -3.0 ], 1 );
	const VR = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const WORK = new Complex128Array( 3 );
	const RWORK = new Float64Array( 1 );
	const SELECT = new Uint8Array( 1 );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-14, 'VR' );
});

test( 'ztrevc3: right eigenvectors, all, 3x3', function t() {
	const tc = right_all_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
});

test( 'ztrevc3: left eigenvectors, all, 3x3', function t() {
	const tc = left_all_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vlv = reinterpret( VL, 0 );

	const info = ztrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: both eigenvectors, all, 3x3', function t() {
	const tc = both_all_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );
	const vlv = reinterpret( VL, 0 );

	const info = ztrevc3( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: right eigenvectors, diagonal matrix', function t() {
	const tc = right_all_diag;
	const N = 3;
	const T = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  3.0, -2.0, 0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	// For diagonal matrix, eigenvectors should be identity columns
	// VR is NxN col-major complex: VR(i,j) = vrv[(j*N+i)*2], vrv[(j*N+i)*2+1]
	assertClose( vrv[ 0 ], 1.0, 1e-14, 'VR(0,0) re' );
	assertClose( vrv[ 1 ], 0.0, 1e-14, 'VR(0,0) im' );
	assertClose( vrv[ 8 ], 1.0, 1e-14, 'VR(1,1) re' );
	assertClose( vrv[ 9 ], 0.0, 1e-14, 'VR(1,1) im' );
});

test( 'ztrevc3: right eigenvectors, 4x4', function t() {
	const tc = right_all_4x4;
	const N = 4;
	const T = makeMatrix( [
		1.0, 0.0,   0.0, 0.0,   0.0, 0.0,   0.0, 0.0,
		0.5, 0.2,   2.0, 1.0,   0.0, 0.0,   0.0, 0.0,
		0.1, 0.0,   0.3, -0.1,  3.0, -1.0,  0.0, 0.0,
		0.0, 0.3,   0.0, 0.0,   0.4, 0.2,   4.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-12, 'VR' );
});

test( 'ztrevc3: right backtransform with identity, 3x3', function t() {
	const tc = right_backtransform_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	// VR = identity
	const VR = makeMatrix( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  1.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	const VL = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vrv = reinterpret( VR, 0 );

	const info = ztrevc3( 'right', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
});

test( 'ztrevc3: left backtransform with identity, 3x3', function t() {
	const tc = left_backtransform_3x3;
	const N = 3;
	const T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	// VL = identity
	const VL = makeMatrix( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  1.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	const VR = new Complex128Array( N * N );
	const WORK = new Complex128Array( 3 * N );
	const RWORK = new Float64Array( N );
	const SELECT = new Uint8Array( N );
	const vlv = reinterpret( VL, 0 );

	const info = ztrevc3( 'left', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: N=0 returns immediately', function t() {
	const T = new Complex128Array( 1 );
	const VR = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const WORK = new Complex128Array( 3 );
	const RWORK = new Float64Array( 1 );
	const SELECT = new Uint8Array( 1 );

	const info = ztrevc3( 'right', 'all', SELECT, 1, 0, 0, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
});
