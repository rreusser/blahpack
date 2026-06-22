

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorm2l from './../lib/ndarray.js';

// FIXTURES //

import ql_factor from './fixtures/ql_factor.json' with { type: 'json' };
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
* Returns the QL-factored A (4x3 column-major, LDA=4) and TAU from dgeqlf.
*/
function getQLFactors() {
	var ql = ql_factor;
	var A = new Float64Array( ql.A );
	var TAU = new Float64Array( ql.TAU );
	return { A: A, TAU: TAU };
}

// TESTS //

test( 'dorm2l: left_notrans (Q*I = Q)', function t() {
	var tc = left_notrans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'left', 'no-transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: left_trans (Q^T*I)', function t() {
	var tc = left_trans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'left', 'transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: right_notrans (I*Q)', function t() {
	var tc = right_notrans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'right', 'no-transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: right_trans (I*Q^T)', function t() {
	var tc = right_trans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'right', 'transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: m_zero', function t() {
	var ql = getQLFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dorm2l( 'left', 'no-transpose', 0, 4, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorm2l: n_zero', function t() {
	var ql = getQLFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dorm2l( 'left', 'no-transpose', 4, 0, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorm2l: k_zero', function t() {
	var ql = getQLFactors();
	var C = new Float64Array( 16 );
	var WORK = new Float64Array( 4 );
	var info = dorm2l( 'left', 'no-transpose', 4, 4, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorm2l: left_notrans_rect (Q*C, 4x2)', function t() {
	var tc = left_notrans_rect;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'left', 'no-transpose', 4, 2, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: left_trans_rect (Q^T*C, 4x2)', function t() {
	var tc = left_trans_rect;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'left', 'transpose', 4, 2, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: right_notrans_rect (C*Q, 2x4)', function t() {
	var tc = right_notrans_rect;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'right', 'no-transpose', 2, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: right_trans_rect (C*Q^T, 2x4)', function t() {
	var tc = right_trans_rect;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'right', 'transpose', 2, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dorm2l: k_one (single reflector)', function t() {
	var tc = k_one;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 100 );
	var info = dorm2l( 'left', 'no-transpose', 4, 4, 1, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});
