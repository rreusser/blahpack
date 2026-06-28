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
	var diff = Math.abs( actual - expected );
	var denom = Math.max( Math.abs( expected ), 1.0 );
	var relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.strictEqual( actual.length >= expected.length, true, msg + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// HELPERS //

function makeMatrix( vals, N ) {
	var buf = new Complex128Array( N * N );
	var v = reinterpret( buf, 0 );
	var i;
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
	var tc = right_all_n1;
	var T = makeMatrix( [ 5.0, -3.0 ], 1 );
	var VR = new Complex128Array( 1 );
	var VL = new Complex128Array( 1 );
	var WORK = new Complex128Array( 3 );
	var RWORK = new Float64Array( 1 );
	var SELECT = new Uint8Array( 1 );
	var vrv = reinterpret( VR, 0 );
	var info;

	info = ztrevc3( 'right', 'all', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0, 3, RWORK, 1, 0, 1 );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-14, 'VR' );
});

test( 'ztrevc3: right eigenvectors, all, 3x3', function t() {
	var tc = right_all_3x3;
	var N = 3;
	var T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	var VR = new Complex128Array( N * N );
	var VL = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vrv = reinterpret( VR, 0 );
	var info;

	info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
});

test( 'ztrevc3: left eigenvectors, all, 3x3', function t() {
	var tc = left_all_3x3;
	var N = 3;
	var T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	var VR = new Complex128Array( N * N );
	var VL = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vlv = reinterpret( VL, 0 );
	var info;

	info = ztrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: both eigenvectors, all, 3x3', function t() {
	var tc = both_all_3x3;
	var N = 3;
	var T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	var VR = new Complex128Array( N * N );
	var VL = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vrv = reinterpret( VR, 0 );
	var vlv = reinterpret( VL, 0 );
	var info;

	info = ztrevc3( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: right eigenvectors, diagonal matrix', function t() {
	var tc = right_all_diag;
	var N = 3;
	var T = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  3.0, -2.0, 0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	var VR = new Complex128Array( N * N );
	var VL = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vrv = reinterpret( VR, 0 );
	var info;

	info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	// For diagonal matrix, eigenvectors should be identity columns
	// VR is NxN col-major complex: VR(i,j) = vrv[(j*N+i)*2], vrv[(j*N+i)*2+1]
	assertClose( vrv[ 0 ], 1.0, 1e-14, 'VR(0,0) re' );
	assertClose( vrv[ 1 ], 0.0, 1e-14, 'VR(0,0) im' );
	assertClose( vrv[ 8 ], 1.0, 1e-14, 'VR(1,1) re' );
	assertClose( vrv[ 9 ], 0.0, 1e-14, 'VR(1,1) im' );
});

test( 'ztrevc3: right eigenvectors, 4x4', function t() {
	var tc = right_all_4x4;
	var N = 4;
	var T = makeMatrix( [
		1.0, 0.0,   0.0, 0.0,   0.0, 0.0,   0.0, 0.0,
		0.5, 0.2,   2.0, 1.0,   0.0, 0.0,   0.0, 0.0,
		0.1, 0.0,   0.3, -0.1,  3.0, -1.0,  0.0, 0.0,
		0.0, 0.3,   0.0, 0.0,   0.4, 0.2,   4.0, 0.0
	], N );
	var VR = new Complex128Array( N * N );
	var VL = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vrv = reinterpret( VR, 0 );
	var info;

	info = ztrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-12, 'VR' );
});

test( 'ztrevc3: right backtransform with identity, 3x3', function t() {
	var tc = right_backtransform_3x3;
	var N = 3;
	var T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	// VR = identity
	var VR = makeMatrix( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  1.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	var VL = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vrv = reinterpret( VR, 0 );
	var info;

	info = ztrevc3( 'right', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vrv, tc.VR, 1e-13, 'VR' );
});

test( 'ztrevc3: left backtransform with identity, 3x3', function t() {
	var tc = left_backtransform_3x3;
	var N = 3;
	var T = makeMatrix( [
		1.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.0,  2.0, -1.0, 0.0, 0.0,
		0.0, 0.3,  0.2, 0.1,  3.0, 0.0
	], N );
	// VL = identity
	var VL = makeMatrix( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  1.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	], N );
	var VR = new Complex128Array( N * N );
	var WORK = new Complex128Array( 3 * N );
	var RWORK = new Float64Array( N );
	var SELECT = new Uint8Array( N );
	var vlv = reinterpret( VL, 0 );
	var info;

	info = ztrevc3( 'left', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0, 3 * N, RWORK, 1, 0, N );
	assert.strictEqual( info, tc.INFO );
	assertArrayClose( vlv, tc.VL, 1e-13, 'VL' );
});

test( 'ztrevc3: N=0 returns immediately', function t() {
	var T = new Complex128Array( 1 );
	var VR = new Complex128Array( 1 );
	var VL = new Complex128Array( 1 );
	var WORK = new Complex128Array( 3 );
	var RWORK = new Float64Array( 1 );
	var SELECT = new Uint8Array( 1 );
	var info;

	info = ztrevc3( 'right', 'all', SELECT, 1, 0, 0, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, 0, WORK, 1, 0, 3, RWORK, 1, 0, 1 );
	assert.strictEqual( info, 0 );
});
