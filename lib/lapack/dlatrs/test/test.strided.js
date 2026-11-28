/* eslint-disable no-restricted-syntax */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrs from './../lib/strided.js';
import dtrsv from '../../../blas/dtrsv/lib/base.js';

// FIXTURES //

import upper_n_nonunit from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import lower_n_nonunit from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import upper_t_nonunit from './fixtures/upper_t_nonunit.json' with { type: 'json' };
import lower_t_nonunit from './fixtures/lower_t_nonunit.json' with { type: 'json' };
import upper_n_unit from './fixtures/upper_n_unit.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_n_normin_y from './fixtures/upper_n_normin_y.json' with { type: 'json' };
import lower_t_unit from './fixtures/lower_t_unit.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

test( 'dlatrs: main export is a function', function t() {
	assert.strictEqual( typeof dlatrs, 'function' );
});

test( 'dlatrs: upper, no-transpose, non-unit diagonal, 3x3', function t() {

	const tc = upper_n_nonunit;
	const A = new Float64Array( [ 2, 0, 0, 1, 3, 0, 1, 2, 4 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'dlatrs: lower, no-transpose, non-unit diagonal, 3x3', function t() {

	const tc = lower_n_nonunit;
	const A = new Float64Array( [ 2, 1, 1, 0, 3, 2, 0, 0, 4 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'dlatrs: upper, transpose, non-unit diagonal, 3x3', function t() {

	const tc = upper_t_nonunit;
	const A = new Float64Array( [ 2, 0, 0, 1, 3, 0, 1, 2, 4 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: lower, transpose, non-unit diagonal, 3x3', function t() {

	const tc = lower_t_nonunit;
	const A = new Float64Array( [ 2, 1, 1, 0, 3, 2, 0, 0, 4 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: upper, no-transpose, unit diagonal, 3x3', function t() {

	const tc = upper_n_unit;
	const A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 1, 2, 99 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: N=0', function t() {

	const A = new Float64Array( 0 );
	const x = new Float64Array( 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 0 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 0, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
});

test( 'dlatrs: N=1', function t() {

	const tc = n_one;
	const A = new Float64Array( [ 5 ] );
	const x = new Float64Array( [ 10 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 1 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 1, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( x[ 0 ], tc.x[ 0 ], 1e-14, 'x[0]' );
});

test( 'dlatrs: upper, normin=Y (pre-computed norms), 4x4', function t() {

	const tc = upper_n_normin_y;
	const A = new Float64Array( [ 3, 0, 0, 0, 1, 4, 0, 0, 2, 1, 2, 0, 1, 2, 1, 5 ] );
	const x = new Float64Array( [ 1, 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( [ 0, 1, 3, 4 ] );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', 4, A, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: lower, transpose, unit diagonal, 3x3', function t() {

	const tc = lower_t_unit;
	const A = new Float64Array( [ 99, 1, 2, 0, 99, 3, 0, 0, 99 ] );
	const x = new Float64Array( [ 6, 5, 4 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: identity matrix', function t() {

	const tc = identity;
	const A = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	const x = new Float64Array( [ 7, 8, 9 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: verifies A * x = scale * b', function t() {
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	let ax;
	const A = new Float64Array( [ 2, 0, 0, 1, 3, 0, 1, 2, 4 ] );
	const b = new Float64Array( [ 1, 2, 3 ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	let i, j;
	dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	for ( i = 0; i < 3; i++ ) {
		ax = 0;
		for ( j = 0; j < 3; j++ ) {
			ax += A[ i + j * 3 ] * x[ j ];
		}
		assertClose( ax, scale[ 0 ] * b[ i ], 1e-14, 'A*x[' + i + '] == s*b[' + i + ']' ); // eslint-disable-line max-len
	}
});

test( 'dlatrs: lower, no-transpose, unit diagonal', function t() {

	const A = new Float64Array( [ 99, 1, 2, 0, 99, 3, 0, 0, 99 ] );
	const x = new Float64Array( [ 6, 5, 4 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	assertClose( x[ 0 ], 6, 1e-14, 'x[0]' );
	assertClose( x[ 1 ], -1, 1e-14, 'x[1]' );
	assertClose( x[ 2 ], -5, 1e-14, 'x[2]' );
});

test( 'dlatrs: near-singular upper triangular triggers careful solve (non-transpose)', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0, 0, 1, tiny, 0, 1, 1, tiny ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular lower triangular triggers careful solve (non-transpose)', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 1, 1, 0, tiny, 1, 0, 0, tiny ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular upper, transpose triggers careful solve', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0, 0, 1, tiny, 0, 1, 1, tiny ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular lower, transpose triggers careful solve', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 1, 1, 0, tiny, 1, 0, 0, tiny ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular unit diagonal triggers careful solve', function t() { // eslint-disable-line max-len

	const A = new Float64Array( [ 1, 0, 0, 1e200, 1, 0, 1e200, 1e200, 1 ] );
	const x = new Float64Array( [ 1e200, 1e200, 1e200 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: zero diagonal triggers singular path', function t() {

	const A = new Float64Array( [ 0, 0, 0, 1, 0, 0, 1, 1, 0 ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0 );
});

test( 'dlatrs: very large x triggers xmax > BIGNUM scaling', function t() {

	const A = new Float64Array( [ 1e-300, 0, 0, 0, 1e-300, 0, 0, 0, 1e-300 ] );
	const x = new Float64Array( [ 1e300, 1e300, 1e300 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular lower, non-transpose, unit diagonal triggers careful solve', function t() { // eslint-disable-line max-len

	const A = new Float64Array( [ 1, 1e200, 1e200, 0, 1, 1e200, 0, 0, 1 ] );
	const x = new Float64Array( [ 1e200, 1e200, 1e200 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: near-singular lower, transpose, unit diagonal triggers careful solve', function t() { // eslint-disable-line max-len

	const A = new Float64Array( [ 1, 1e200, 1e200, 0, 1, 1e200, 0, 0, 1 ] );
	const x = new Float64Array( [ 1e200, 1e200, 1e200 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: small diagonal with large x triggers xj > tjj*BIGNUM scaling', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0, 0, 0, tiny, 0, 0, 0, tiny ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: upper with off-diag, non-unit, triggers non-trivial careful solve', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0, 0, 0.5, tiny, 0, 0.3, 0.7, tiny ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: lower with off-diag, non-unit, triggers non-trivial careful solve', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0.5, 0.3, 0, tiny, 0.7, 0, 0, tiny ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: upper transpose with off-diag, triggers transpose careful solve', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0, 0, 0.5, tiny, 0, 0.3, 0.7, tiny ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: lower transpose with off-diag, triggers transpose careful solve', function t() { // eslint-disable-line max-len

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0.5, 0.3, 0, tiny, 0.7, 0, 0, tiny ] );
	const x = new Float64Array( [ 1, 2, 3 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: large CNORM triggers tscal scaling path', function t() {

	const big = 1e300;
	const A = new Float64Array( [ 1, 0, 0, big, 1, 0, big, big, 1 ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: large CNORM triggers tscal scaling, lower', function t() {

	const big = 1e300;
	const A = new Float64Array( [ 1, big, big, 0, 1, big, 0, 0, 1 ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: small diagonal with large x, transpose', function t() {

	const tiny = 1e-300;
	const A = new Float64Array( [ tiny, 0, 0, 0, tiny, 0, 0, 0, tiny ] );
	const x = new Float64Array( [ 1, 1, 1 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: upper, transpose, unit diagonal', function t() {

	const A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 1, 2, 99 ] );
	const x = new Float64Array( [ 6, 5, 4 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );
	const info = dlatrs( 'upper', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	assertClose( x[ 0 ], 6, 1e-14, 'x[0]' );
	assertClose( x[ 1 ], -1, 1e-14, 'x[1]' );
	assertClose( x[ 2 ], 0, 1e-14, 'x[2]' );
});


// Regression: the growth-bound loop for the non-transposed, non-unit solve
// left early (Fortran `GO TO`) but then still applied `grow = xbnd`, so a
// solution that would overflow was routed to the unscaled fast path and
// returned NaN with scale = 1 (see test/harness/LEARNINGS.md, 2026-11-18).
function stressEntry( i, j ) {
	if ( i === j ) {
		return 2.0;
	}
	return 1.0e40 * ( ( ( i + ( 2 * j ) ) % 5 ) - 1.5 );
}

function stressSolve( uplo, trans, diag ) {
	const N = 12;
	let i, j;
	const A = new Float64Array( N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( ( uplo === 'upper' ) ? i <= j : i >= j ) {
				A[ i + ( j * N ) ] = stressEntry( i, j );
			}
		}
	}
	const x = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		x[ i ] = 1.0;
	}
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( N );
	dlatrs( uplo, trans, diag, 'no', N, A, 1, N, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.ok( scale[ 0 ] > 0.0 && scale[ 0 ] < 1.0, uplo + ' ' + trans + ' ' + diag + ': solution was rescaled (scale = ' + scale[ 0 ] + ')' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( Number.isFinite( x[ i ] ), uplo + ' ' + trans + ' ' + diag + ': x[' + i + '] is finite (got ' + x[ i ] + ')' );
	}
}

test( 'dlatrs: no-transpose non-unit solve rescales instead of overflowing (upper)', function t() {
	stressSolve( 'upper', 'no-transpose', 'non-unit' );
});

test( 'dlatrs: no-transpose non-unit solve rescales instead of overflowing (lower)', function t() {
	stressSolve( 'lower', 'no-transpose', 'non-unit' );
});

test( 'dlatrs: every trans x diag x uplo solve rescales instead of overflowing (careful path)', function t() {
	const TRANS = [ 'no-transpose', 'transpose' ];
	const UPLO = [ 'upper', 'lower' ];
	const DIAG = [ 'non-unit', 'unit' ];
	TRANS.forEach( function eachTrans( trans ) {
		UPLO.forEach( function eachUplo( uplo ) {
			DIAG.forEach( function eachDiag( diag ) {
				stressSolve( uplo, trans, diag );
			});
		});
	});
});


// RESIDUAL-CHECKED OVERFLOW PATHS //

const UPLOS = [ 'upper', 'lower' ];
const TRANSES = [ 'no-transpose', 'transpose' ];
const DIAGS = [ 'non-unit', 'unit' ];

function maxAbs( x ) {
	let m = 0.0;
	let i;
	for ( i = 0; i < x.length; i++ ) {
		m = Math.max( m, Math.abs( x[ i ] ) );
	}
	return m;
}

/**
* Max-abs residual of op(A)*x - scale*b, computed on A/max|A| and x/max(|x|, scale*|b|) so that no product overflows; returns a value relative to ||A||*||x||.
*/
function scaledResidual( uplo, trans, diag, N, A, x, b, scale ) {
	const al = maxAbs( A ) || 1.0;
	const be = Math.max( maxAbs( x ), scale * maxAbs( b ) ) || 1.0;
	let inTri, r, t, a, i, j;
	r = 0.0;
	for ( i = 0; i < N; i++ ) {
		t = 0.0;
		for ( j = 0; j < N; j++ ) {
			// Element (i,j) of op(A) is A(i,j) or A(j,i):
			inTri = ( ( uplo === 'upper' ) === ( trans === 'no-transpose' ) ) ? i <= j : i >= j;
			if ( inTri ) {
				a = ( trans === 'no-transpose' ) ? A[ i + ( j * N ) ] : A[ j + ( i * N ) ];
				if ( i === j && diag === 'unit' ) {
					a = 1.0;
				}
				t += ( a / al ) * ( x[ j ] / be );
			}
		}
		t -= ( ( scale * b[ i ] ) / be ) / al;
		r = Math.max( r, Math.abs( t ) );
	}
	return r;
}

/**
* Builds an N-by-N column-major triangular matrix from fill(i, j) and solves with dlatrs (normin='no').
*/
function solveFill( uplo, trans, diag, N, fill, b ) {
	const A = new Float64Array( N * N );
	const x = new Float64Array( b );
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( ( uplo === 'upper' ) ? i <= j : i >= j ) {
				A[ i + ( j * N ) ] = fill( i, j );
			}
		}
	}
	const info = dlatrs( uplo, trans, diag, 'no', N, A, 1, N, 0, x, 1, 0, scale, CNORM, 1, 0 );
	return {
		'A': A,
		'x': x,
		'info': info,
		'scale': scale[ 0 ],
		'cnorm': CNORM,
		'resid': scaledResidual( uplo, trans, diag, N, A, x, b, scale[ 0 ] )
	};
}

function forEachCase( fn ) {
	UPLOS.forEach( function eachUplo( uplo ) {
		TRANSES.forEach( function eachTrans( trans ) {
			DIAGS.forEach( function eachDiag( diag ) {
				fn( uplo, trans, diag, uplo + ' ' + trans + ' ' + diag );
			});
		});
	});
}

test( 'dlatrs: SMLNUM = safmin/precision as in the reference: x=[1e300], A=[1] gives scale = BIGNUM/1e300', function t() {
	const SMLNUM = 2.2250738585072014e-308 / 2.220446049250313e-16;
	const BIGNUM = 1.0 / SMLNUM;
	const A = new Float64Array( [ 1.0 ] );
	const x = new Float64Array( [ 1.0e300 ] );
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( 1 );
	const info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 1, A, 1, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( Math.abs( scale[ 0 ] - ( BIGNUM / 1.0e300 ) ) <= 1.0e-15 * ( BIGNUM / 1.0e300 ), 'scale = BIGNUM/1e300 = ' + ( BIGNUM / 1.0e300 ) + ', got ' + scale[ 0 ] );
	assert.ok( Math.abs( x[ 0 ] - BIGNUM ) <= 1.0e-15 * BIGNUM, 'x = scale*b = BIGNUM, got ' + x[ 0 ] );
});

test( 'dlatrs: a column norm that overflows to Inf is recomputed (dlange path), every uplo/trans/diag', function t() {
	// N=4: the last column (upper) or first column (lower) holds two entries of +-1e308, so dasum overflows to Inf; tscal != 1 forces the careful solve in both trans directions.
	const N = 4;
	const b = [ 1.0, -2.0, 3.0, 0.5 ];
	forEachCase( function check( uplo, trans, diag, msg ) {
		const big = ( uplo === 'upper' ) ? N - 1 : 0;
		const r = solveFill( uplo, trans, diag, N, function fill( i, j ) {
			if ( i === j ) {
				return 1.5;
			}
			if ( j === big && Math.abs( i - j ) <= 2 ) {
				return ( i % 2 === 0 ) ? 1.0e308 : -1.0e308;
			}
			return 0.25;
		}, b );
		assert.equal( r.info, 0, msg + ': info' );
		assert.ok( r.scale > 0.0 && r.scale <= 1.0, msg + ': 0 < scale <= 1, got ' + r.scale );
		assert.ok( r.x.every( Number.isFinite ), msg + ': x finite' );
		assert.ok( maxAbs( r.x ) > 0.0, msg + ': x nonzero' );
		assert.ok( r.resid <= 1.0e-14, msg + ': residual ' + r.resid );
		assert.equal( r.cnorm[ big ], Infinity, msg + ': CNORM restored (overflowed column stays Inf after unscaling)' );
	});
});

test( 'dlatrs: an Inf off-diagonal entry falls back to a plain dtrsv with scale = 1', function t() {
	const N = 3;
	const b = [ 1.0, 2.0, 3.0 ];
	forEachCase( function check( uplo, trans, diag, msg ) {
		const fill = function fill( i, j ) {
			if ( i === j ) {
				return 2.0;
			}
			return ( Math.abs( i - j ) === 2 ) ? Infinity : 0.5;
		};
		const r = solveFill( uplo, trans, diag, N, fill, b );
		const A = new Float64Array( r.A );
		const y = new Float64Array( b );
		let i;
		dtrsv( uplo, trans, diag, N, A, 1, N, 0, y, 1, 0 );
		assert.equal( r.info, 0, msg + ': info' );
		assert.equal( r.scale, 1.0, msg + ': scale' );
		for ( i = 0; i < N; i++ ) {
			assert.ok( Object.is( r.x[ i ], y[ i ] ), msg + ': x[' + i + '] equals dtrsv (' + y[ i ] + '), got ' + r.x[ i ] );
		}
	});
});

test( 'dlatrs: off-diagonal update that would pass BIGNUM halves x (careful path), every uplo/trans/diag', function t() {
	// N=2, off-diagonal 3e292 (> BIGNUM ~ 1e292): xj*CNORM(j) exceeds BIGNUM - xmax, for xj > 1 (b = +-2) and xj <= 1 (b = +-0.5).
	const N = 2;
	const rhs = [ [ 2.0, -2.0 ], [ 0.5, -0.5 ] ];
	forEachCase( function check( uplo, trans, diag, msg ) {
		let r, k;
		for ( k = 0; k < rhs.length; k++ ) {
			r = solveFill( uplo, trans, diag, N, function fill( i, j ) {
				return ( i === j ) ? 1.0 : 3.0e292;
			}, rhs[ k ] );
			assert.equal( r.info, 0, msg + ': info' );
			assert.ok( r.scale > 0.0 && r.scale < 1.0, msg + ': 0 < scale < 1, got ' + r.scale );
			assert.ok( r.x.every( Number.isFinite ), msg + ': x finite' );
			assert.ok( r.resid <= 1.0e-15, msg + ': residual ' + r.resid );
		}
	});
});

test( 'dlatrs: tiny nonzero diagonal (|a_jj| < SMLNUM) scales x instead of overflowing, every uplo/trans', function t() {
	const N = 5;
	const b = [ 1.0, -2.0, 3.0, 0.5, 1.0 ];
	forEachCase( function check( uplo, trans, diag, msg ) {
		const r = solveFill( uplo, trans, diag, N, function fill( i, j ) {
			if ( i === j ) {
				return ( i === 2 ) ? 1.0e-300 : 2.0;
			}
			return 0.5;
		}, b );
		assert.equal( r.info, 0, msg + ': info' );
		assert.ok( r.scale > 0.0 && r.scale <= 1.0, msg + ': 0 < scale <= 1, got ' + r.scale );
		if ( diag === 'non-unit' ) {
			assert.ok( r.scale < 1.0e-8, msg + ': scale reduced, got ' + r.scale );
		} else {
			assert.equal( r.scale, 1.0, msg + ': unit diagonal ignores a_jj' );
		}
		assert.ok( r.x.every( Number.isFinite ), msg + ': x finite' );
		assert.ok( r.resid <= 1.0e-14, msg + ': residual ' + r.resid );
	});
});

test( 'dlatrs: exactly zero diagonal returns scale = 0 and a null vector of op(A), every uplo/trans', function t() {
	const N = 5;
	const b = [ 1.0, -2.0, 3.0, 0.5, 1.0 ];
	UPLOS.forEach( function eachUplo( uplo ) {
		TRANSES.forEach( function eachTrans( trans ) {
			const msg = uplo + ' ' + trans;
			const r = solveFill( uplo, trans, 'non-unit', N, function fill( i, j ) {
				if ( i === j ) {
					return ( i === 2 ) ? 0.0 : 2.0;
				}
				return 0.5;
			}, b );
			assert.equal( r.info, 0, msg + ': info' );
			assert.equal( r.scale, 0.0, msg + ': scale = 0 (singular)' );
			assert.ok( maxAbs( r.x ) >= 1.0, msg + ': x nonzero' );
			assert.ok( r.x.every( Number.isFinite ), msg + ': x finite' );

			// With scale = 0 the residual is |op(A) x| / (||A|| ||x||): x is a null vector.
			assert.ok( r.resid <= 1.0e-15, msg + ': op(A) x = 0, residual ' + r.resid );
		});
	});
});

test( 'dlatrs: update with xj <= 1 that would pass BIGNUM because xmax is already near BIGNUM halves x (no-transpose)', function t() {
	// N=2, off-diagonal 9e291 (just under BIGNUM ~ 9.98e291, so CNORM is not pre-scaled), the solved component is 1 and the other right-hand side entry is 5e291: xj*CNORM(j) > BIGNUM - xmax with xj <= 1.
	const N = 2;
	UPLOS.forEach( function eachUplo( uplo ) {
		DIAGS.forEach( function eachDiag( diag ) {
			const msg = uplo + ' ' + diag;
			const b = ( uplo === 'upper' ) ? [ 5.0e291, 1.0 ] : [ 1.0, 5.0e291 ];
			const r = solveFill( uplo, 'no-transpose', diag, N, function fill( i, j ) {
				return ( i === j ) ? 1.0 : 9.0e291;
			}, b );
			assert.equal( r.info, 0, msg + ': info' );
			assert.equal( r.scale, 0.5, msg + ': scale halved once' );
			assert.ok( r.x.every( Number.isFinite ), msg + ': x finite' );
			assert.ok( r.resid <= 1.0e-15, msg + ': residual ' + r.resid );
		});
	});
});
