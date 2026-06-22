/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrevc3 from './../lib/ndarray.js';

// FIXTURES //

import right_all_4x4 from './fixtures/right_all_4x4.json' with { type: 'json' };
import left_all_4x4 from './fixtures/left_all_4x4.json' with { type: 'json' };
import both_all_4x4 from './fixtures/both_all_4x4.json' with { type: 'json' };
import right_selected_4x4 from './fixtures/right_selected_4x4.json' with { type: 'json' };
import right_backtransform_4x4 from './fixtures/right_backtransform_4x4.json' with { type: 'json' };
import right_all_real_4x4 from './fixtures/right_all_real_4x4.json' with { type: 'json' };
import right_n_1 from './fixtures/right_n_1.json' with { type: 'json' };
import left_selected_complex_4x4 from './fixtures/left_selected_complex_4x4.json' with { type: 'json' };
import left_backtransform_4x4 from './fixtures/left_backtransform_4x4.json' with { type: 'json' };
import right_all_6x6_mixed from './fixtures/right_all_6x6_mixed.json' with { type: 'json' };
import left_all_6x6_mixed from './fixtures/left_all_6x6_mixed.json' with { type: 'json' };
import both_backtransform_6x6 from './fixtures/both_backtransform_6x6.json' with { type: 'json' };
import right_selected_real_6x6 from './fixtures/right_selected_real_6x6.json' with { type: 'json' };
import left_selected_complex_first_6x6 from './fixtures/left_selected_complex_first_6x6.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Pack an MxN submatrix from a column-major LDA array.
*/
function packMatrix( A, LDA, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ i + j * LDA ] );
		}
	}
	return out;
}

/**
* Build the 4x4 quasi-triangular test matrix T.
* T = [ 1   0.5  0.2  0.1  ]
*     [ 0   2    0.3  0.15 ]
*     [ 0   0    3   -0.5  ]
*     [ 0   0    0.8  3    ]
*/
function buildT4() {
	var N = 4;
	var T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.5; T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1;
	T[ 1 + 1*N ] = 2.0; T[ 1 + 2*N ] = 0.3; T[ 1 + 3*N ] = 0.15;
	T[ 2 + 2*N ] = 3.0; T[ 2 + 3*N ] = -0.5;
	T[ 3 + 2*N ] = 0.8; T[ 3 + 3*N ] = 3.0;
	return T;
}

/**
* Build the 6x6 quasi-triangular test matrix T.
* 2x2 block at (0,0)-(1,1): eigenvalues ~ 1 +/- 0.6i
* Real eigenvalue at (2,2): 4.0
* Real eigenvalue at (3,3): 5.0
* 2x2 block at (4,4)-(5,5): eigenvalues ~ 7 +/- 0.5i
*/
function buildT6() {
	var N = 6;
	var T = new Float64Array( N * N );

	// 2x2 block at (0,0)-(1,1)
	T[ 0 + 0*N ] = 1.0; T[ 0 + 1*N ] = 0.6;
	T[ 1 + 0*N ] = -0.6; T[ 1 + 1*N ] = 1.0;

	// Upper part from rows 0-1
	T[ 0 + 2*N ] = 0.2; T[ 0 + 3*N ] = 0.1; T[ 0 + 4*N ] = 0.3; T[ 0 + 5*N ] = 0.05; // eslint-disable-line max-len
	T[ 1 + 2*N ] = 0.15; T[ 1 + 3*N ] = 0.08; T[ 1 + 4*N ] = 0.12; T[ 1 + 5*N ] = 0.04; // eslint-disable-line max-len

	// Real eigenvalue at (2,2)
	T[ 2 + 2*N ] = 4.0;
	T[ 2 + 3*N ] = 0.5; T[ 2 + 4*N ] = 0.2; T[ 2 + 5*N ] = 0.1;

	// Real eigenvalue at (3,3)
	T[ 3 + 3*N ] = 5.0;
	T[ 3 + 4*N ] = 0.3; T[ 3 + 5*N ] = 0.15;

	// 2x2 block at (4,4)-(5,5)
	T[ 4 + 4*N ] = 7.0; T[ 4 + 5*N ] = 0.5;
	T[ 5 + 4*N ] = -0.5; T[ 5 + 5*N ] = 7.0;
	return T;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dtrevc3: right eigenvectors, all, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = right_all_4x4;
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left eigenvectors, all, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = left_all_4x4;
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: both eigenvectors, all, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = both_all_4x4;
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: right eigenvectors, selected, 4x4', function t() {
	var SELECT;
	var M_out;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = right_selected_4x4;
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	M_out = tc.M;
	VR = new Float64Array( N * M_out );
	SELECT[ 0 ] = 1;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right backtransform, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var i;
	var M;

	tc = right_backtransform_4x4;
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VR[ i + i*N ] = 1.0;
	}
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'right', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right all real eigenvalues, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = right_all_real_4x4;
	N = 4;
	T = new Float64Array( N * N );
	T[ 0 + 0*N ] = 5.0;
	T[ 0 + 1*N ] = 1.0;
	T[ 0 + 2*N ] = 0.5;
	T[ 0 + 3*N ] = 0.2;
	T[ 1 + 1*N ] = 3.0;
	T[ 1 + 2*N ] = 0.8;
	T[ 1 + 3*N ] = 0.3;
	T[ 2 + 2*N ] = 1.0;
	T[ 2 + 3*N ] = 0.6;
	T[ 3 + 3*N ] = -1.0;
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: right N=1', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	N = 1;
	T = new Float64Array([ 7.0 ]);
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );
	SELECT = new Uint8Array( 1 );
	WORK = new Float64Array( 3 );
	M = 0;
	info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, 1, M, WORK, 1, 0, 3 ); // eslint-disable-line max-len
	tc = right_n_1;
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left selected complex 4x4', function t() {
	var SELECT;
	var M_out;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = left_selected_complex_4x4;
	N = 4;
	T = buildT4();
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	M_out = tc.M;
	VL = new Float64Array( N * M_out );
	SELECT[ 0 ] = 0;
	SELECT[ 1 ] = 0;
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: left backtransform, 4x4', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var i;
	var M;

	tc = left_backtransform_4x4;
	N = 4;
	T = buildT4();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VL[ i + i*N ] = 1.0;
	}
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'left', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: right all 6x6 mixed', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = right_all_6x6_mixed;
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left all 6x6 mixed', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = left_all_6x6_mixed;
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'left', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: both backtransform 6x6', function t() {
	var SELECT;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var i;
	var M;

	tc = both_backtransform_6x6;
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		VR[ i + i*N ] = 1.0;
		VL[ i + i*N ] = 1.0;
	}
	SELECT = new Uint8Array( N );
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'both', 'backtransform', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});

test( 'dtrevc3: right selected real 6x6', function t() {
	var SELECT;
	var M_out;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = right_selected_real_6x6;
	N = 6;
	T = buildT6();
	VL = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	M_out = tc.M;
	VR = new Float64Array( N * M_out );
	SELECT[ 2 ] = 1;
	SELECT[ 3 ] = 1;
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'right', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VR ), tc.VR, 1e-12, 'VR' );
});

test( 'dtrevc3: left selected complex first 6x6', function t() {
	var SELECT;
	var M_out;
	var WORK;
	var info;
	var tc;
	var VL;
	var VR;
	var N;
	var T;
	var M;

	tc = left_selected_complex_first_6x6;
	N = 6;
	T = buildT6();
	VR = new Float64Array( N * N );
	SELECT = new Uint8Array( N );
	M_out = tc.M;
	VL = new Float64Array( N * M_out );
	SELECT[ 0 ] = 1;
	SELECT[ 1 ] = 1;
	WORK = new Float64Array( 3 * N );
	M = 0;
	info = dtrevc3( 'left', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0, 3 * N ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( VL ), tc.VL, 1e-12, 'VL' );
});
