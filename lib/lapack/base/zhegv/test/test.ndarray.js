

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhegv from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_upper from './fixtures/itype1_v_upper.json' with { type: 'json' };
import itype1_v_lower from './fixtures/itype1_v_lower.json' with { type: 'json' };
import itype1_n_lower from './fixtures/itype1_n_lower.json' with { type: 'json' };
import itype2_v_upper from './fixtures/itype2_v_upper.json' with { type: 'json' };
import itype3_v_lower from './fixtures/itype3_v_lower.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// A = [10 2+i 1-2i; 2-i 8 3+i; 1+2i 3-i 7] Hermitian (upper stored)
var A_UPPER = [
	10, 0, 0, 0, 0, 0,
	2, 1, 8, 0, 0, 0,
	1, -2, 3, 1, 7, 0
];

// A (lower stored)
var A_LOWER = [
	10, 0, 2, -1, 1, 2,
	0, 0, 8, 0, 3, -1,
	0, 0, 0, 0, 7, 0
];

// B = [4 1+i 0; 1-i 5 2-i; 0 2+i 6] (upper stored)
var B_UPPER = [
	4, 0, 0, 0, 0, 0,
	1, 1, 5, 0, 0, 0,
	0, 0, 2, -1, 6, 0
];

// B (lower stored)
var B_LOWER = [
	4, 0, 1, -1, 0, 0,
	0, 0, 5, 0, 2, 1,
	0, 0, 0, 0, 6, 0
];

function callZhegv( itype, jobz, uplo, N, aData, bData ) {
	var RWORK = new Float64Array( Math.max( 1, 3 * N - 2 ) );
	var WORK = new Complex128Array( Math.max( 1, 2 * N ) );
	var lwork = Math.max( 1, 2 * N );
	var A = new Complex128Array( aData );
	var B = new Complex128Array( bData );
	var w = new Float64Array( N );
	var info = zhegv( itype, jobz, uplo, N, A, 1, N, 0, B, 1, N, 0, w, 1, 0, WORK, 1, 0, lwork, RWORK, 1, 0 );
	return { info: info, w: w, A: A };
}

// TESTS //

test( 'zhegv: itype1_v_upper', function t() {
	var tc = itype1_v_upper;
	var r = callZhegv( 1, 'compute-vectors', 'upper', 3, A_UPPER, B_UPPER );
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.w ), tc.w, 1e-12, 'w' );
});

test( 'zhegv: itype1_v_lower', function t() {
	var tc = itype1_v_lower;
	var r = callZhegv( 1, 'compute-vectors', 'lower', 3, A_LOWER, B_LOWER );
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.w ), tc.w, 1e-12, 'w' );
});

test( 'zhegv: itype1_n_lower', function t() {
	var tc = itype1_n_lower;
	var r = callZhegv( 1, 'no-vectors', 'lower', 3, A_LOWER, B_LOWER );
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.w ), tc.w, 1e-12, 'w' );
});

test( 'zhegv: itype2_v_upper', function t() {
	var tc = itype2_v_upper;
	var r = callZhegv( 2, 'compute-vectors', 'upper', 3, A_UPPER, B_UPPER );
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.w ), tc.w, 1e-12, 'w' );
});

test( 'zhegv: itype3_v_lower', function t() {
	var tc = itype3_v_lower;
	var r = callZhegv( 3, 'compute-vectors', 'lower', 3, A_LOWER, B_LOWER );
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.w ), tc.w, 1e-12, 'w' );
});

test( 'zhegv: n_zero', function t() {
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var w = new Float64Array( 1 );
	var info = zhegv( 1, 'compute-vectors', 'upper', 0, A, 1, 1, 0, B, 1, 1, 0, w, 1, 0, WORK, 1, 0, 1, RWORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhegv: n_one', function t() {
	var tc = n_one;
	var r = callZhegv( 1, 'compute-vectors', 'upper', 1, [ 6, 0 ], [ 2, 0 ] );
	assert.equal( r.info, tc.info );
	assertArrayClose( Array.from( r.w ), tc.w, 1e-12, 'w' );
	assertArrayClose( Array.from( reinterpret( r.A, 0 ) ), tc.A, 1e-12, 'A' );
});

test( 'zhegv: not_posdef', function t() {
	var tc = not_posdef;
	var r = callZhegv( 1, 'compute-vectors', 'lower', 2, [ 1, 0, 0, 0, 0, 0, 1, 0 ], [ -1, 0, 0, 0, 0, 0, 1, 0 ] );
	assert.equal( r.info, tc.info );
});
