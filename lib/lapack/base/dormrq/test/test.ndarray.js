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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function getRQFactors() {
	const rq = rq_factor;
	const A = new Float64Array( 4 * 4 );
	let j;
	for ( j = 0; j < 12; j++ ) {
		A[ j ] = rq.A[ j ];
	}
	const TAU = new Float64Array( rq.TAU );
	return { A: A, TAU: TAU };
}

function getBigRQFactors() {
	const rq = big_rq_factor;
	const A = new Float64Array( rq.A );
	const TAU = new Float64Array( rq.TAU );
	return { A: A, TAU: TAU, N: 40 };
}

// TESTS //

test( 'dormrq: left_notrans (Q*I = Q)', function t() {
	const tc = left_notrans;
	const rq = getRQFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormrq( 'left', 'no-transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: left_trans (Q^T*I)', function t() {
	const tc = left_trans;
	const rq = getRQFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormrq( 'left', 'transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: right_notrans (I*Q)', function t() {
	const tc = right_notrans;
	const rq = getRQFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormrq( 'right', 'no-transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: right_trans (I*Q^T)', function t() {
	const tc = right_trans;
	const rq = getRQFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormrq( 'right', 'transpose', 4, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: m_zero', function t() {
	const rq = getRQFactors();
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormrq( 'left', 'no-transpose', 0, 4, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormrq: n_zero', function t() {
	const rq = getRQFactors();
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormrq( 'left', 'no-transpose', 4, 0, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormrq: k_zero', function t() {
	const rq = getRQFactors();
	const C = new Float64Array( 16 );
	const WORK = new Float64Array( 4 );
	const info = dormrq( 'left', 'no-transpose', 4, 4, 0, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormrq: left_notrans_rect (Q*C, 4x2)', function t() {
	const tc = left_notrans_rect;
	const rq = getRQFactors();
	const C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormrq( 'left', 'no-transpose', 4, 2, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: right_notrans_rect (C*Q, 2x4)', function t() {
	const tc = right_notrans_rect;
	const rq = getRQFactors();
	const C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormrq( 'right', 'no-transpose', 2, 4, 3, rq.A, 1, 4, 0, rq.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormrq: blocked left notrans (K=40)', function t() {
	const tc = blocked_left_notrans;
	const f = getBigRQFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormrq( 'left', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormrq: blocked left trans (K=40)', function t() {
	const tc = blocked_left_trans;
	const f = getBigRQFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormrq( 'left', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormrq: blocked right notrans (K=40)', function t() {
	const tc = blocked_right_notrans;
	const f = getBigRQFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormrq( 'right', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormrq: blocked right trans (K=40)', function t() {
	const tc = blocked_right_trans;
	const f = getBigRQFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormrq( 'right', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});
