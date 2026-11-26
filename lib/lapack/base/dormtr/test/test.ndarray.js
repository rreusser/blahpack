/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrd from '../../dsytrd/lib/base.js';
import dormtr from './../lib/ndarray.js';

// FIXTURES //

import left_notrans_upper from './fixtures/left_notrans_upper.json' with { type: 'json' };
import left_trans_upper from './fixtures/left_trans_upper.json' with { type: 'json' };
import right_notrans_upper from './fixtures/right_notrans_upper.json' with { type: 'json' };
import right_trans_upper from './fixtures/right_trans_upper.json' with { type: 'json' };
import left_notrans_lower from './fixtures/left_notrans_lower.json' with { type: 'json' };
import left_trans_lower from './fixtures/left_trans_lower.json' with { type: 'json' };
import right_notrans_lower from './fixtures/right_notrans_lower.json' with { type: 'json' };
import right_trans_lower from './fixtures/right_trans_lower.json' with { type: 'json' };
import left_notrans_upper_rect from './fixtures/left_notrans_upper_rect.json' with { type: 'json' };
import right_notrans_lower_rect from './fixtures/right_notrans_lower_rect.json' with { type: 'json' };

// FUNCTIONS //

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
	let relErr, i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Setup: symmetric 4x4 matrix.
*   [ 4  1 -2  2 ]
*   [ 1  2  0  1 ]
*   [-2  0  3 -2 ]
*   [ 2  1 -2 -1 ]
*/
function symMatrix4() {
	// Column-major: col0=[4,1,-2,2], col1=[1,2,0,1], col2=[-2,0,3,-2], col3=[2,1,-2,-1] // eslint-disable-line max-len
	return new Float64Array([
		4,
		1,
		-2,
		2,
		1,
		2,
		0,
		1,
		-2,
		0,
		3,
		-2,
		2,
		1,
		-2,
		-1
	]);
}

/**
* Identity4.
*
* @private
* @returns {*} result
*/
function identity4( ) {
	return new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
}

/**
* ReduceUpper.
*
* @private
* @returns {*} result
*/
function reduceUpper() {
	const TAU = new Float64Array( 4 );
	const A = symMatrix4();
	const D = new Float64Array( 4 );
	const E = new Float64Array( 4 );
	dsytrd( 'upper', 4, A, 1, 4, 0, D, 1, 0, E, 1, 0, TAU, 1, 0, new Float64Array( Math.max( 1, 4 * 32 ) ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* ReduceLower.
*
* @private
* @returns {*} result
*/
function reduceLower() {
	const TAU = new Float64Array( 4 );
	const A = symMatrix4();
	const D = new Float64Array( 4 );
	const E = new Float64Array( 4 );
	dsytrd( 'lower', 4, A, 1, 4, 0, D, 1, 0, E, 1, 0, TAU, 1, 0, new Float64Array( Math.max( 1, 4 * 32 ) ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* FlattenColMajor.
*
* @private
* @param {*} C - C
* @param {*} M - M
* @param {*} N - N
* @returns {*} result
*/
function flattenColMajor( C, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( C[ i + j * M ] );
		}
	}
	return out;
}

// TESTS //

test( 'dormtr: left_notrans_upper', function t() {

	const tc = left_notrans_upper;
	const r = reduceUpper();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'upper', 'no-transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: left_trans_upper', function t() {

	const tc = left_trans_upper;
	const r = reduceUpper();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'upper', 'transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: right_notrans_upper', function t() {

	const tc = right_notrans_upper;
	const r = reduceUpper();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'right', 'upper', 'no-transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: right_trans_upper', function t() {

	const tc = right_trans_upper;
	const r = reduceUpper();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'right', 'upper', 'transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: left_notrans_lower', function t() {

	const tc = left_notrans_lower;
	const r = reduceLower();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'lower', 'no-transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: left_trans_lower', function t() {

	const tc = left_trans_lower;
	const r = reduceLower();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'lower', 'transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: right_notrans_lower', function t() {

	const tc = right_notrans_lower;
	const r = reduceLower();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'right', 'lower', 'no-transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: right_trans_lower', function t() {

	const tc = right_trans_lower;
	const r = reduceLower();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'right', 'lower', 'transpose', 4, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: m_zero', function t() {

	const r = reduceUpper();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'upper', 'no-transpose', 0, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormtr: n_zero', function t() {

	const r = reduceUpper();
	const C = identity4();
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'upper', 'no-transpose', 4, 0, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormtr: nq_one_left', function t() {

	const r = reduceUpper();
	const C = new Float64Array([ 7, 3, -1, 2 ]);
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'upper', 'no-transpose', 1, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dormtr: left_notrans_upper_rect', function t() {

	const tc = left_notrans_upper_rect;
	const r = reduceUpper();
	const C = new Float64Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	]);
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'left', 'upper', 'no-transpose', 4, 2, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 2 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: right_notrans_lower_rect', function t() {

	const tc = right_notrans_lower_rect;
	const r = reduceLower();
	const C = new Float64Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	]);
	const WORK = new Float64Array( 256 );
	const info = dormtr( 'right', 'lower', 'no-transpose', 2, 4, r.A, 1, 4, 0, r.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 2, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dormtr: accepts the reference minimum nw past the blocking threshold and matches an optimal-WORK run (ticket 0100)', function t() {
	const nq = 48;
	const freeN = 40;
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const A = new Float64Array( nq * nq );
		const TAU = new Float64Array( nq - 1 );
		let i;
		let j;
		for ( j = 0; j < nq; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				A[ i + ( j * nq ) ] = Math.sin( ( 0.31 * ( i + 1 ) * ( j + 2 ) ) + 0.2 );
				A[ j + ( i * nq ) ] = A[ i + ( j * nq ) ];
			}
		}
		dsytrd( uplo, nq, A, 1, nq, 0, new Float64Array( nq ), 1, 0, new Float64Array( nq - 1 ), 1, 0, TAU, 1, 0, new Float64Array( nq * 32 ), 1, 0 );
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
				const M = ( side === 'left' ) ? nq : freeN;
				const N = ( side === 'left' ) ? freeN : nq;
				const nw = ( side === 'left' ) ? N : M;
				const label = side + ' ' + uplo + ' ' + trans;
				const C1 = new Float64Array( M * N );
				let info;
				let k;
				for ( k = 0; k < C1.length; k++ ) {
					C1[ k ] = Math.cos( ( 0.23 * k ) + 0.5 );
				}
				const C2 = new Float64Array( C1 );
				info = dormtr( side, uplo, trans, M, N, A, 1, nq, 0, TAU, 1, 0, C1, 1, M, 0, new Float64Array( nw ), 1, 0 );
				assert.equal( info, 0, label + ': info (minimum WORK)' );
				info = dormtr( side, uplo, trans, M, N, A, 1, nq, 0, TAU, 1, 0, C2, 1, M, 0, new Float64Array( ( nw * 32 ) + 4160 ), 1, 0 );
				assert.equal( info, 0, label + ': info (optimal WORK)' );
				for ( k = 0; k < C1.length; k++ ) {
					assert.ok( Math.abs( C1[ k ] - C2[ k ] ) < 1e-12, label + ': C[' + k + ']' );
				}
				assert.throws( function throws() {
					dormtr( side, uplo, trans, M, N, A, 1, nq, 0, TAU, 1, 0, new Float64Array( C1 ), 1, M, 0, new Float64Array( nw - 1 ), 1, 0 );
				}, RangeError, label + ': one below the minimum' );
			});
		});
	});
});
