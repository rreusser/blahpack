

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormr2 from './../lib/ndarray.js';

// FIXTURES //

import rq_factor from './fixtures/rq_factor.json' with { type: 'json' };
import left_notrans from './fixtures/left_notrans.json' with { type: 'json' };
import left_trans from './fixtures/left_trans.json' with { type: 'json' };
import right_notrans from './fixtures/right_notrans.json' with { type: 'json' };
import right_trans from './fixtures/right_trans.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import left_trans_rect from './fixtures/left_trans_rect.json' with { type: 'json' };
import right_notrans_rect from './fixtures/right_notrans_rect.json' with { type: 'json' };
import right_trans_rect from './fixtures/right_trans_rect.json' with { type: 'json' };
import k_one from './fixtures/k_one.json' with { type: 'json' };

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

/**
* Returns the RQ-factored A (3x4, LDA=4 column-major) and TAU from dgerq2.
* A is K=3 rows by NQ=4 columns stored column-major with LDA=4.
*/
function getRQFactors() {
	var rq = rq_factor;
	// rq.A is 12 elements: 3x4 column-major with LDA=4
	// But Fortran printed 12 elements from a 4x4 array with only 3 rows used.
	// Actually from the Fortran test: A(4,4) with 3x4 data, printed as 12 = 3*4 elements.
	// print_array('A', A, 12) prints first 12 elements of the flat 4x4 array.
	// That's A(1:4, 1:3) = first 12 elements of A(4,4) = columns 1-3 of a 4x4 array.
	// Wait: A is 4x4 in Fortran, and we print 12 elements = 3 columns * 4 rows.
	// So the 12 elements are A(:,1), A(:,2), A(:,3) each 4 elements.
	// But the RQ factorization only wrote into 3 rows, so row 4 is still 0.
	var A = new Float64Array( 4 * 4 );
	var j;
	for ( j = 0; j < 12; j++ ) {
		A[ j ] = rq.A[ j ];
	}
	var TAU = new Float64Array( rq.TAU );
	return { A: A, TAU: TAU };
}

// TESTS //

test( 'dormr2: left_notrans (Q*I = Q)', function t() {
	var tc = left_notrans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	// A is K=3 rows, stored with LDA=4 (strideA1=1, strideA2=4)
	var info = dormr2( 'left', 'no-transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: left_trans (Q^T*I)', function t() {
	var tc = left_trans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'left', 'transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: right_notrans (I*Q)', function t() {
	var tc = right_notrans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'right', 'no-transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: right_trans (I*Q^T)', function t() {
	var tc = right_trans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'right', 'transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: m_zero', function t() {
	var rq = getRQFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dormr2( 'left', 'no-transpose', 0, 4, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormr2: n_zero', function t() {
	var rq = getRQFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dormr2( 'left', 'no-transpose', 4, 0, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormr2: k_zero', function t() {
	var rq = getRQFactors();
	var C = new Float64Array( 16 );
	var WORK = new Float64Array( 4 );
	var info = dormr2( 'left', 'no-transpose', 4, 4, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormr2: left_notrans_rect (Q*C, 4x2)', function t() {
	var tc = left_notrans_rect;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'left', 'no-transpose', 4, 2, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: left_trans_rect (Q^T*C, 4x2)', function t() {
	var tc = left_trans_rect;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'left', 'transpose', 4, 2, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: right_notrans_rect (C*Q, 2x4)', function t() {
	var tc = right_notrans_rect;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'right', 'no-transpose', 2, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: right_trans_rect (C*Q^T, 2x4)', function t() {
	var tc = right_trans_rect;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'right', 'transpose', 2, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr2: k_one (single reflector)', function t() {
	var tc = k_one;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dormr2( 'left', 'no-transpose', 4, 4, 1, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});
