// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormql from './../lib/ndarray.js';

// FIXTURES //

import ql_factor from './fixtures/ql_factor.json' with { type: 'json' };
import big_ql_factor from './fixtures/big_ql_factor.json' with { type: 'json' };
import left_notrans from './fixtures/left_notrans.json' with { type: 'json' };
import left_trans from './fixtures/left_trans.json' with { type: 'json' };
import right_notrans from './fixtures/right_notrans.json' with { type: 'json' };
import right_trans from './fixtures/right_trans.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import right_notrans_rect from './fixtures/right_notrans_rect.json' with { type: 'json' };
import blocked_left_notrans from './fixtures/blocked_left_notrans.json' with { type: 'json' };
import blocked_left_trans from './fixtures/blocked_left_trans.json' with { type: 'json' };
import blocked_right_notrans from './fixtures/blocked_right_notrans.json' with { type: 'json' };
import blocked_right_trans from './fixtures/blocked_right_trans.json' with { type: 'json' };

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

function getQLFactors() {
	var ql = ql_factor;
	var A = new Float64Array( ql.A );
	var TAU = new Float64Array( ql.TAU );
	return { A: A, TAU: TAU };
}

function getBigQLFactors() {
	var ql = big_ql_factor;
	var A = new Float64Array( ql.A );
	var TAU = new Float64Array( ql.TAU );
	return { A: A, TAU: TAU, N: 40 };
}

// TESTS //

test( 'dormql: left_notrans (Q*I = Q)', function t() {
	var tc = left_notrans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormql( 'left', 'no-transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: left_trans (Q^T*I)', function t() {
	var tc = left_trans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormql( 'left', 'transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: right_notrans (I*Q)', function t() {
	var tc = right_notrans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormql( 'right', 'no-transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: right_trans (I*Q^T)', function t() {
	var tc = right_trans;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormql( 'right', 'transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: m_zero', function t() {
	var ql = getQLFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dormql( 'left', 'no-transpose', 0, 4, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormql: n_zero', function t() {
	var ql = getQLFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dormql( 'left', 'no-transpose', 4, 0, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormql: k_zero', function t() {
	var ql = getQLFactors();
	var C = new Float64Array( 16 );
	var WORK = new Float64Array( 4 );
	var info = dormql( 'left', 'no-transpose', 4, 4, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormql: left_notrans_rect (Q*C, 4x2)', function t() {
	var tc = left_notrans_rect;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormql( 'left', 'no-transpose', 4, 2, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: right_notrans_rect (C*Q, 2x4)', function t() {
	var tc = right_notrans_rect;
	var ql = getQLFactors();
	var C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormql( 'right', 'no-transpose', 2, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: blocked left notrans (K=40)', function t() {
	var tc = blocked_left_notrans;
	var f = getBigQLFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormql( 'left', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormql: blocked left trans (K=40)', function t() {
	var tc = blocked_left_trans;
	var f = getBigQLFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormql( 'left', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormql: blocked right notrans (K=40)', function t() {
	var tc = blocked_right_notrans;
	var f = getBigQLFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormql( 'right', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormql: blocked right trans (K=40)', function t() {
	var tc = blocked_right_trans;
	var f = getBigQLFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormql( 'right', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});
