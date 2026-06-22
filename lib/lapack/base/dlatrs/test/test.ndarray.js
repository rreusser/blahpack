/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrs from './../lib/ndarray.js';

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
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

test( 'dlatrs: main export is a function', function t() {
	assert.strictEqual( typeof dlatrs, 'function' );
});

test( 'dlatrs: upper, no-transpose, non-unit diagonal, 3x3', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = upper_n_nonunit;
	A = new Float64Array( [ 2, 0, 0, 1, 3, 0, 1, 2, 4 ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'dlatrs: lower, no-transpose, non-unit diagonal, 3x3', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = lower_n_nonunit;
	A = new Float64Array( [ 2, 1, 1, 0, 3, 2, 0, 0, 4 ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'dlatrs: upper, transpose, non-unit diagonal, 3x3', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = upper_t_nonunit;
	A = new Float64Array( [ 2, 0, 0, 1, 3, 0, 1, 2, 4 ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: lower, transpose, non-unit diagonal, 3x3', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = lower_t_nonunit;
	A = new Float64Array( [ 2, 1, 1, 0, 3, 2, 0, 0, 4 ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: upper, no-transpose, unit diagonal, 3x3', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = upper_n_unit;
	A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 1, 2, 99 ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: N=0', function t() {
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( 0 );
	x = new Float64Array( 0 );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 0 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 0, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
});

test( 'dlatrs: N=1', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = n_one;
	A = new Float64Array( [ 5 ] );
	x = new Float64Array( [ 10 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 1 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 1, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertClose( x[ 0 ], tc.x[ 0 ], 1e-14, 'x[0]' );
});

test( 'dlatrs: upper, normin=Y (pre-computed norms), 4x4', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = upper_n_normin_y;
	A = new Float64Array( [ 3, 0, 0, 0, 1, 4, 0, 0, 2, 1, 2, 0, 1, 2, 1, 5 ] );
	x = new Float64Array( [ 1, 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( [ 0, 1, 3, 4 ] );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', 4, A, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: lower, transpose, unit diagonal, 3x3', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = lower_t_unit;
	A = new Float64Array( [ 99, 1, 2, 0, 99, 3, 0, 0, 99 ] );
	x = new Float64Array( [ 6, 5, 4 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: identity matrix', function t() {
	var scale;
	var cnorm;
	var info;
	var tc;
	var A;
	var x;

	tc = identity;
	A = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	x = new Float64Array( [ 7, 8, 9 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
});

test( 'dlatrs: verifies A * x = scale * b', function t() {
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var ax;
	var A = new Float64Array( [ 2, 0, 0, 1, 3, 0, 1, 2, 4 ] );
	var b = new Float64Array( [ 1, 2, 3 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var i;
	var j;
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
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 99, 1, 2, 0, 99, 3, 0, 0, 99 ] );
	x = new Float64Array( [ 6, 5, 4 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	assertClose( x[ 0 ], 6, 1e-14, 'x[0]' );
	assertClose( x[ 1 ], -1, 1e-14, 'x[1]' );
	assertClose( x[ 2 ], -5, 1e-14, 'x[2]' );
});

test( 'dlatrs: near-singular upper triangular triggers careful solve (non-transpose)', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0, 0, 1, tiny, 0, 1, 1, tiny ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular lower triangular triggers careful solve (non-transpose)', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 1, 1, 0, tiny, 1, 0, 0, tiny ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular upper, transpose triggers careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0, 0, 1, tiny, 0, 1, 1, tiny ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular lower, transpose triggers careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 1, 1, 0, tiny, 1, 0, 0, tiny ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular unit diagonal triggers careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 1, 0, 0, 1e200, 1, 0, 1e200, 1e200, 1 ] );
	x = new Float64Array( [ 1e200, 1e200, 1e200 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: zero diagonal triggers singular path', function t() {
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 0, 0, 0, 1, 0, 0, 1, 1, 0 ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0 );
});

test( 'dlatrs: very large x triggers xmax > BIGNUM scaling', function t() {
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 1e-300, 0, 0, 0, 1e-300, 0, 0, 0, 1e-300 ] );
	x = new Float64Array( [ 1e300, 1e300, 1e300 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: near-singular lower, non-transpose, unit diagonal triggers careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 1, 1e200, 1e200, 0, 1, 1e200, 0, 0, 1 ] );
	x = new Float64Array( [ 1e200, 1e200, 1e200 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: near-singular lower, transpose, unit diagonal triggers careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 1, 1e200, 1e200, 0, 1, 1e200, 0, 0, 1 ] );
	x = new Float64Array( [ 1e200, 1e200, 1e200 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: small diagonal with large x triggers xj > tjj*BIGNUM scaling', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0, 0, 0, tiny, 0, 0, 0, tiny ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: upper with off-diag, non-unit, triggers non-trivial careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0, 0, 0.5, tiny, 0, 0.3, 0.7, tiny ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: lower with off-diag, non-unit, triggers non-trivial careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0.5, 0.3, 0, tiny, 0.7, 0, 0, tiny ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: upper transpose with off-diag, triggers transpose careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0, 0, 0.5, tiny, 0, 0.3, 0.7, tiny ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: lower transpose with off-diag, triggers transpose careful solve', function t() { // eslint-disable-line max-len
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0.5, 0.3, 0, tiny, 0.7, 0, 0, tiny ] );
	x = new Float64Array( [ 1, 2, 3 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: large CNORM triggers tscal scaling path', function t() {
	var scale;
	var cnorm;
	var info;
	var big;
	var A;
	var x;

	big = 1e300;
	A = new Float64Array( [ 1, 0, 0, big, 1, 0, big, big, 1 ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: large CNORM triggers tscal scaling, lower', function t() {
	var scale;
	var cnorm;
	var info;
	var big;
	var A;
	var x;

	big = 1e300;
	A = new Float64Array( [ 1, big, big, 0, 1, big, 0, 0, 1 ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'dlatrs: small diagonal with large x, transpose', function t() {
	var scale;
	var cnorm;
	var tiny;
	var info;
	var A;
	var x;

	tiny = 1e-300;
	A = new Float64Array( [ tiny, 0, 0, 0, tiny, 0, 0, 0, tiny ] );
	x = new Float64Array( [ 1, 1, 1 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] >= 0.0, 'scale >= 0' );
});

test( 'dlatrs: upper, transpose, unit diagonal', function t() {
	var scale;
	var cnorm;
	var info;
	var A;
	var x;

	A = new Float64Array( [ 99, 0, 0, 1, 99, 0, 1, 2, 99 ] );
	x = new Float64Array( [ 6, 5, 4 ] );
	scale = new Float64Array( 1 );
	cnorm = new Float64Array( 3 );
	info = dlatrs( 'upper', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 1.0 );
	assertClose( x[ 0 ], 6, 1e-14, 'x[0]' );
	assertClose( x[ 1 ], -1, 1e-14, 'x[1]' );
	assertClose( x[ 2 ], 0, 1e-14, 'x[2]' );
});
