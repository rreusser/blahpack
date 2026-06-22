// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dormrq from './../lib/ndarray.js';

// FIXTURES //

import rq_factor from './fixtures/rq_factor.json' with { type: 'json' };
import big_rq_factor from './fixtures/big_rq_factor.json' with { type: 'json' };
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

function getRQFactors() {
	var rq = rq_factor;
	var A = new Float64Array( 4 * 4 );
	var j;
	for ( j = 0; j < 12; j++ ) {
		A[ j ] = rq.A[ j ];
	}
	var TAU = new Float64Array( rq.TAU );
	return { A: A, TAU: TAU };
}

function getBigRQFactors() {
	var rq = big_rq_factor;
	var A = new Float64Array( rq.A );
	var TAU = new Float64Array( rq.TAU );
	return { A: A, TAU: TAU, N: 40 };
}

// TESTS //

test( 'dormrq: left_notrans (Q*I = Q)', function t() {
	var tc = left_notrans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormrq( 'left', 'no-transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: left_trans (Q^T*I)', function t() {
	var tc = left_trans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormrq( 'left', 'transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: right_notrans (I*Q)', function t() {
	var tc = right_notrans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormrq( 'right', 'no-transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: right_trans (I*Q^T)', function t() {
	var tc = right_trans;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormrq( 'right', 'transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: m_zero', function t() {
	var rq = getRQFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dormrq( 'left', 'no-transpose', 0, 4, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormrq: n_zero', function t() {
	var rq = getRQFactors();
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dormrq( 'left', 'no-transpose', 4, 0, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormrq: k_zero', function t() {
	var rq = getRQFactors();
	var C = new Float64Array( 16 );
	var WORK = new Float64Array( 4 );
	var info = dormrq( 'left', 'no-transpose', 4, 4, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormrq: left_notrans_rect (Q*C, 4x2)', function t() {
	var tc = left_notrans_rect;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormrq( 'left', 'no-transpose', 4, 2, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: right_notrans_rect (C*Q, 2x4)', function t() {
	var tc = right_notrans_rect;
	var rq = getRQFactors();
	var C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	var WORK = new Float64Array( 1000 );
	var info = dormrq( 'right', 'no-transpose', 2, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: blocked left notrans (K=40)', function t() {
	var tc = blocked_left_notrans;
	var f = getBigRQFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormrq( 'left', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormrq: blocked left trans (K=40)', function t() {
	var tc = blocked_left_trans;
	var f = getBigRQFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormrq( 'left', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormrq: blocked right notrans (K=40)', function t() {
	var tc = blocked_right_notrans;
	var f = getBigRQFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormrq( 'right', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormrq: blocked right trans (K=40)', function t() {
	var tc = blocked_right_trans;
	var f = getBigRQFactors();
	var N = f.N;
	var C = new Float64Array( N * N );
	var WORK = new Float64Array( N * 64 );
	var i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	var info = dormrq( 'right', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});
