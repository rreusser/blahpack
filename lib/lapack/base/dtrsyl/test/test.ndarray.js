/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsyl from './../lib/ndarray.js';

// FIXTURES //

import nn_basic_2x2 from './fixtures/nn_basic_2x2.json' with { type: 'json' };
import nn_isgn__1 from './fixtures/nn_isgn_-1.json' with { type: 'json' };
import tn_basic from './fixtures/tn_basic.json' with { type: 'json' };
import tt_basic from './fixtures/tt_basic.json' with { type: 'json' };
import nt_basic from './fixtures/nt_basic.json' with { type: 'json' };
import m_0 from './fixtures/m_0.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import nn_3x3_quasi_tri from './fixtures/nn_3x3_quasi-tri.json' with { type: 'json' };
import m_1_n_1 from './fixtures/m_1_n_1.json' with { type: 'json' };
import tn_3x3_quasi_tri from './fixtures/tn_3x3_quasi-tri.json' with { type: 'json' };
import tt_3x3_quasi_tri from './fixtures/tt_3x3_quasi-tri.json' with { type: 'json' };
import nt_3x3_quasi_tri from './fixtures/nt_3x3_quasi-tri.json' with { type: 'json' };
import nn_4x4_quasi_tri_both from './fixtures/nn_4x4_quasi-tri_both.json' with { type: 'json' };
import tn_4x4_quasi_tri_both from './fixtures/tn_4x4_quasi-tri_both.json' with { type: 'json' };
import tt_4x4_quasi_tri_both from './fixtures/tt_4x4_quasi-tri_both.json' with { type: 'json' };
import nt_4x4_quasi_tri_both from './fixtures/nt_4x4_quasi-tri_both.json' with { type: 'json' };
import nn_4x4_quasi_tri_both_isgn__1 from './fixtures/nn_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import tn_4x4_quasi_tri_both_isgn__1 from './fixtures/tn_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import tt_4x4_quasi_tri_both_isgn__1 from './fixtures/tt_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import nt_4x4_quasi_tri_both_isgn__1 from './fixtures/nt_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };

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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Pack an MxN submatrix from a column-major LDA array into a dense M*N column-major array.
*/
function packMatrix( C, LDA, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( C[ i + j * LDA ] );
		}
	}
	return out;
}

/**
* Build the 4x4 test matrix A with 2x2 blocks at (1,1)-(2,2) and (3,3)-(4,4).
* A(1,1)=1.0, A(1,2)=0.5, A(2,1)=-0.5, A(2,2)=1.0
* A(3,3)=3.0, A(3,4)=0.4, A(4,3)=-0.6, A(4,4)=3.0
* Upper part: A(1,3)=0.3, A(1,4)=0.1, A(2,3)=0.2, A(2,4)=0.05
*/
function buildA4( LDA ) {
	var A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0; A[ 0 + 1*LDA ] = 0.5; A[ 0 + 2*LDA ] = 0.3; A[ 0 + 3*LDA ] = 0.1; // eslint-disable-line max-len
	A[ 1 + 0*LDA ] = -0.5; A[ 1 + 1*LDA ] = 1.0; A[ 1 + 2*LDA ] = 0.2; A[ 1 + 3*LDA ] = 0.05; // eslint-disable-line max-len
	A[ 2 + 2*LDA ] = 3.0; A[ 2 + 3*LDA ] = 0.4;
	A[ 3 + 2*LDA ] = -0.6; A[ 3 + 3*LDA ] = 3.0;
	return A;
}

/**
* Build the 4x4 test matrix B with a 2x2 block at (3,3)-(4,4).
* B(1,1)=2.0, B(1,2)=0.1, B(1,3)=0.2, B(1,4)=0.05
* B(2,2)=4.0, B(2,3)=0.3, B(2,4)=0.1
* B(3,3)=5.0, B(3,4)=0.7, B(4,3)=-0.7, B(4,4)=5.0
*/
function buildB4( LDA ) {
	var B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0; B[ 0 + 1*LDA ] = 0.1; B[ 0 + 2*LDA ] = 0.2; B[ 0 + 3*LDA ] = 0.05; // eslint-disable-line max-len
	B[ 1 + 1*LDA ] = 4.0; B[ 1 + 2*LDA ] = 0.3; B[ 1 + 3*LDA ] = 0.1;
	B[ 2 + 2*LDA ] = 5.0; B[ 2 + 3*LDA ] = 0.7;
	B[ 3 + 2*LDA ] = -0.7; B[ 3 + 3*LDA ] = 5.0;
	return B;
}

/**
* BuildC4.
*
* @private
* @param {*} LDA - LDA
* @returns {*} result
*/
function buildC4( LDA ) {
	var C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0; C[ 0 + 1*LDA ] = 2.0; C[ 0 + 2*LDA ] = 3.0; C[ 0 + 3*LDA ] = 4.0; // eslint-disable-line max-len
	C[ 1 + 0*LDA ] = 5.0; C[ 1 + 1*LDA ] = 6.0; C[ 1 + 2*LDA ] = 7.0; C[ 1 + 3*LDA ] = 8.0; // eslint-disable-line max-len
	C[ 2 + 0*LDA ] = 9.0; C[ 2 + 1*LDA ] = 10.0; C[ 2 + 2*LDA ] = 11.0; C[ 2 + 3*LDA ] = 12.0; // eslint-disable-line max-len
	C[ 3 + 0*LDA ] = 13.0; C[ 3 + 1*LDA ] = 14.0; C[ 3 + 2*LDA ] = 15.0; C[ 3 + 3*LDA ] = 16.0; // eslint-disable-line max-len
	return C;
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

test( 'dtrsyl: NN basic 2x2', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nn_basic_2x2;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: NN isgn=-1', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nn_isgn__1;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', -1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TN basic', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tn_basic;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'no-transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TT basic', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tt_basic;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: NT basic', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nt_basic;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: M=0', function t() {
	var scale;
	var info;
	var tc;
	var A;
	var B;
	var C;

	tc = m_0;
	A = new Float64Array( 16 );
	B = new Float64Array( 16 );
	C = new Float64Array( 16 );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', 1, 0, 2, A, 1, 4, 0, B, 1, 4, 0, C, 1, 4, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'dtrsyl: N=0', function t() {
	var scale;
	var info;
	var tc;
	var A;
	var B;
	var C;

	tc = n_0;
	A = new Float64Array( 16 );
	B = new Float64Array( 16 );
	C = new Float64Array( 16 );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', 1, 2, 0, A, 1, 4, 0, B, 1, 4, 0, C, 1, 4, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'dtrsyl: NN 3x3 quasi-tri', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nn_3x3_quasi_tri;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: M=1 N=1', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = m_1_n_1;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 ] = 2.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 ] = 3.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 ] = 10.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', 1, 1, 1, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TN 3x3 quasi-tri', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tn_3x3_quasi_tri;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'no-transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TT 3x3 quasi-tri', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tt_3x3_quasi_tri;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: NT 3x3 quasi-tri', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nt_3x3_quasi_tri;
	LDA = 4;
	A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

// 4x4 tests with 2x2 blocks in BOTH A and B

test( 'dtrsyl: NN 4x4 quasi-tri both', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nn_4x4_quasi_tri_both;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TN 4x4 quasi-tri both', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tn_4x4_quasi_tri_both;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TT 4x4 quasi-tri both', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tt_4x4_quasi_tri_both;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NT 4x4 quasi-tri both', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nt_4x4_quasi_tri_both;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NN 4x4 quasi-tri both isgn=-1', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nn_4x4_quasi_tri_both_isgn__1;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'no-transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TN 4x4 quasi-tri both isgn=-1', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tn_4x4_quasi_tri_both_isgn__1;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'no-transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TT 4x4 quasi-tri both isgn=-1', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = tt_4x4_quasi_tri_both_isgn__1;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'transpose', 'transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NT 4x4 quasi-tri both isgn=-1', function t() {
	var scale;
	var info;
	var LDA;
	var tc;
	var A;
	var B;
	var C;

	tc = nt_4x4_quasi_tri_both_isgn__1;
	LDA = 4;
	A = buildA4( LDA );
	B = buildB4( LDA );
	C = buildC4( LDA );
	scale = new Float64Array( 1 );
	info = dtrsyl( 'no-transpose', 'transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});
