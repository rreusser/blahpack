// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeql2 from '../../dgeql2/lib/base.js';
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

function getQLFactors() {
	const ql = ql_factor;
	const A = new Float64Array( ql.A );
	const TAU = new Float64Array( ql.TAU );
	return { A: A, TAU: TAU };
}

function getBigQLFactors() {
	const ql = big_ql_factor;
	const A = new Float64Array( ql.A );
	const TAU = new Float64Array( ql.TAU );
	return { A: A, TAU: TAU, N: 40 };
}

// TESTS //

test( 'dormql: left_notrans (Q*I = Q)', function t() {
	const tc = left_notrans;
	const ql = getQLFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormql( 'left', 'no-transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: left_trans (Q^T*I)', function t() {
	const tc = left_trans;
	const ql = getQLFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormql( 'left', 'transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: right_notrans (I*Q)', function t() {
	const tc = right_notrans;
	const ql = getQLFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormql( 'right', 'no-transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: right_trans (I*Q^T)', function t() {
	const tc = right_trans;
	const ql = getQLFactors();
	const C = new Float64Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormql( 'right', 'transpose', 4, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: m_zero', function t() {
	const ql = getQLFactors();
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormql( 'left', 'no-transpose', 0, 4, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormql: n_zero', function t() {
	const ql = getQLFactors();
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormql( 'left', 'no-transpose', 4, 0, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormql: k_zero', function t() {
	const ql = getQLFactors();
	const C = new Float64Array( 16 );
	const WORK = new Float64Array( 4 );
	const info = dormql( 'left', 'no-transpose', 4, 4, 0, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dormql: left_notrans_rect (Q*C, 4x2)', function t() {
	const tc = left_notrans_rect;
	const ql = getQLFactors();
	const C = new Float64Array([
		1, 3, -1, 2,
		2, 0, 4, -1
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormql( 'left', 'no-transpose', 4, 2, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: right_notrans_rect (C*Q, 2x4)', function t() {
	const tc = right_notrans_rect;
	const ql = getQLFactors();
	const C = new Float64Array([
		1, 0,
		2, 1,
		-1, 3,
		4, -2
	]);
	const WORK = new Float64Array( 1000 );
	const info = dormql( 'right', 'no-transpose', 2, 4, 3, ql.A, 1, 4, 0, ql.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-14, 'C' );
});

test( 'dormql: blocked left notrans (K=40)', function t() {
	const tc = blocked_left_notrans;
	const f = getBigQLFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormql( 'left', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormql: blocked left trans (K=40)', function t() {
	const tc = blocked_left_trans;
	const f = getBigQLFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormql( 'left', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormql: blocked right notrans (K=40)', function t() {
	const tc = blocked_right_notrans;
	const f = getBigQLFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormql( 'right', 'no-transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});

test( 'dormql: blocked right trans (K=40)', function t() {
	const tc = blocked_right_trans;
	const f = getBigQLFactors();
	const N = f.N;
	const C = new Float64Array( N * N );
	const WORK = new Float64Array( N * 64 );
	let i;
	for ( i = 0; i < N; i++ ) {
		C[ i * N + i ] = 1.0;
	}
	const info = dormql( 'right', 'transpose', N, N, N, f.A, 1, N, 0, f.TAU, 1, 0, C, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( Array.from( C ), tc.c, 1e-12, 'C' );
});


// WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

/**
* Applies op(Q), from the factorization of a deterministic N-by-N matrix, to a deterministic N-by-N matrix C (M = N = K) with a workspace of the given length.
*
* @private
* @param {string} side - operation side
* @param {string} trans - transpose operation
* @param {PositiveInteger} N - order of the matrices
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} the result, as interleaved components
*/
function wsApply( side, trans, N, lwork ) {
	const TAU = new Float64Array( N );
	const A = new Float64Array( N * N );
	const C = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		C[ i ] = Math.cos( ( 0.23 * i ) + 0.7 );
	}
	dgeql2( N, N, A, 1, N, 0, TAU, 1, 0, new Float64Array( N ), 1, 0 );
	const info = dormql( side, trans, N, N, N, A, 1, N, 0, TAU, 1, 0, C, 1, N, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return C;
}

/**
* Asserts that two arrays agree to a tolerance relative to the largest magnitude of the expected array.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function wsAssertClose( actual, expected, tol, msg ) {
	let scale = 0.0;
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		scale = Math.max( scale, Math.abs( expected[ i ] ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		if ( !( Math.abs( actual[ i ] - expected[ i ] ) <= tol * scale ) ) {
			assert.fail( msg + ': index ' + i + ', expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

test( 'dormql: M=N=K=70 with WORK of the reference minimum max(1,N) matches the optimum (unblocked fallback)', function t() {
	const N = 70;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const opt = wsApply( side, trans, N, ( N * 32 ) + 4160 );
			const lo = wsApply( side, trans, N, N );
			wsAssertClose( lo, opt, 1e-12, side + '/' + trans );
		});
	});
});

test( 'dormql: M=N=K=150 with WORK for a shrunk block size NB=8 matches the optimum', function t() {
	const N = 150;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
			const opt = wsApply( side, trans, N, ( N * 32 ) + 4160 );
			const mid = wsApply( side, trans, N, ( N * 8 ) + 4160 );
			wsAssertClose( mid, opt, 1e-12, side + '/' + trans );
		});
	});
});

test( 'dormql: throws when WORK is missing or one element below the minimum max(1,nw) (K > NB)', function t() {
	const N = 70;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		assert.throws( function throws() {
			dormql( side, 'no-transpose', N, N, N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( N - 1 ), 1, 0 );
		}, RangeError );
		assert.throws( function throws() {
			dormql( side, 'no-transpose', N, N, N, new Float64Array( N * N ), 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, null, 1, 0 );
		}, RangeError );
	});
});
