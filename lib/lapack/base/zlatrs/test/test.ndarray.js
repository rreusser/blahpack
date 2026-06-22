/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlatrs from './../lib/ndarray.js';

// FIXTURES //

import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import upper_n_nonunit from './fixtures/upper_n_nonunit.json' with { type: 'json' };
import lower_n_nonunit from './fixtures/lower_n_nonunit.json' with { type: 'json' };
import upper_t_nonunit from './fixtures/upper_t_nonunit.json' with { type: 'json' };
import upper_c_nonunit from './fixtures/upper_c_nonunit.json' with { type: 'json' };
import lower_t_nonunit from './fixtures/lower_t_nonunit.json' with { type: 'json' };
import lower_c_nonunit from './fixtures/lower_c_nonunit.json' with { type: 'json' };
import upper_n_unit from './fixtures/upper_n_unit.json' with { type: 'json' };
import lower_n_unit from './fixtures/lower_n_unit.json' with { type: 'json' };
import upper_n_normin_y from './fixtures/upper_n_normin_y.json' with { type: 'json' };
import upper_c_unit from './fixtures/upper_c_unit.json' with { type: 'json' };
import lower_c_unit from './fixtures/lower_c_unit.json' with { type: 'json' };
import upper_n_4x4 from './fixtures/upper_n_4x4.json' with { type: 'json' };
import lower_t_unit_norminy from './fixtures/lower_t_unit_norminy.json' with { type: 'json' };
import upper_n_unit_careful from './fixtures/upper_n_unit_careful.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	var diff = Math.abs( actual - expected );
	var denom = Math.max( Math.abs( expected ), 1.0 );
	var relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// HELPERS //

/**
* Creates an NxN Complex128Array in column-major layout from a flat Float64 interleaved array.
*
* @private
* @param {Array} vals - interleaved [re,im,...] for column-major elements
* @param {integer} N - matrix dimension
* @returns {Complex128Array} matrix
*/
function makeMatrix( vals, N ) {
	var buf = new Complex128Array( N * N );
	var v = reinterpret( buf, 0 );
	var i;
	for ( i = 0; i < vals.length; i++ ) {
		v[ i ] = vals[ i ];
	}
	return buf;
}

/**
* Creates a Complex128Array vector from flat Float64 interleaved array.
*
* @private
* @param {Array} vals - interleaved [re,im,...]
* @returns {Complex128Array} vector
*/
function makeVector( vals ) {
	var buf = new Complex128Array( vals.length / 2 );
	var v = reinterpret( buf, 0 );
	var i;
	for ( i = 0; i < vals.length; i++ ) {
		v[ i ] = vals[ i ];
	}
	return buf;
}

// TESTS //

test( 'zlatrs is a function', function t() {
	assert.strictEqual( typeof zlatrs, 'function' );
});

test( 'zlatrs: N=0 returns immediately', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var x = new Complex128Array( 1 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 1 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 0, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'zlatrs: N=1 upper, no-transpose, non-unit', function t() {
	var tc = n_one;
	var A = makeMatrix( [ 5.0, 2.0 ], 1 );
	var x = makeVector( [ 10.0, -3.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 1 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 1, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, non-unit, 3x3', function t() {
	var tc = upper_n_nonunit;
	// A upper triangular 3x3 column-major in a 4x4 leading dim = 4
	// In JS: strideA1=1, strideA2=N=3, leading dim matches N
	var A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'zlatrs: lower, no-transpose, non-unit, 3x3', function t() {
	var tc = lower_n_nonunit;
	var A = makeMatrix( [
		2.0, 1.0,  1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,  3.0, 0.5,  1.0, -1.0,
		0.0, 0.0,  0.0, 0.0,  4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'zlatrs: upper, transpose, non-unit, 3x3', function t() {
	var tc = upper_t_nonunit;
	var A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, conjugate-transpose, non-unit, 3x3', function t() {
	var tc = upper_c_nonunit;
	var A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, transpose, non-unit, 3x3', function t() {
	var tc = lower_t_nonunit;
	var A = makeMatrix( [
		2.0, 1.0,  1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,  3.0, 0.5,  1.0, -1.0,
		0.0, 0.0,  0.0, 0.0,  4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, conjugate-transpose, non-unit, 3x3', function t() {
	var tc = lower_c_nonunit;
	var A = makeMatrix( [
		2.0, 1.0,  1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,  3.0, 0.5,  1.0, -1.0,
		0.0, 0.0,  0.0, 0.0,  4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, unit diagonal, 3x3', function t() {
	var tc = upper_n_unit;
	var A = makeMatrix( [
		99.0, 99.0,  0.0, 0.0,   0.0, 0.0,
		1.0, 1.0,    99.0, 99.0, 0.0, 0.0,
		0.5, 0.0,    1.0, -1.0,  99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, no-transpose, unit diagonal, 3x3', function t() {
	var tc = lower_n_unit;
	var A = makeMatrix( [
		99.0, 99.0, 1.0, 1.0,   0.5, 0.0,
		0.0, 0.0,   99.0, 99.0, 1.0, -1.0,
		0.0, 0.0,   0.0, 0.0,   99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, normin=Y, 3x3', function t() {
	var tc = upper_n_normin_y;
	var A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( [ 0.0, 2.0, 2.5 ] );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, conjugate-transpose, unit diagonal, 3x3', function t() {
	var tc = upper_c_unit;
	var A = makeMatrix( [
		99.0, 99.0,  0.0, 0.0,   0.0, 0.0,
		1.0, 1.0,    99.0, 99.0, 0.0, 0.0,
		0.5, 0.0,    1.0, -1.0,  99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, conjugate-transpose, unit diagonal, 3x3', function t() {
	var tc = lower_c_unit;
	var A = makeMatrix( [
		99.0, 99.0, 1.0, 1.0,   0.5, 0.0,
		0.0, 0.0,   99.0, 99.0, 1.0, -1.0,
		0.0, 0.0,   0.0, 0.0,   99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, 4x4', function t() {
	var tc = upper_n_4x4;
	// 4x4 upper triangular, column-major
	var A = makeMatrix( [
		3.0, 0.0,   0.0, 0.0,   0.0, 0.0,  0.0, 0.0,
		1.0, 0.5,   4.0, 1.0,   0.0, 0.0,  0.0, 0.0,
		0.0, 1.0,   1.0, 0.0,   2.0, -1.0, 0.0, 0.0,
		0.5, 0.0,   0.0, 0.5,   1.0, 1.0,  5.0, 0.0
	], 4 );
	var x = makeVector( [ 1.0, 1.0, 2.0, 0.0, 0.0, 3.0, 1.0, -2.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 4 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 4, A, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-12, 'x' );
});

test( 'zlatrs: lower, transpose, unit, normin=Y, 3x3', function t() {
	var tc = lower_t_unit_norminy;
	var A = makeMatrix( [
		99.0, 99.0, 1.0, 1.0,   0.5, 0.0,
		0.0, 0.0,   99.0, 99.0, 1.0, -1.0,
		0.0, 0.0,   0.0, 0.0,   99.0, 99.0
	], 3 );
	var x = makeVector( [ 5.0, 1.0, 3.0, -2.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( [ 2.5, 2.0, 0.0 ] );
	var info;

	info = zlatrs( 'lower', 'transpose', 'unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, careful solve (near-singular diag)', function t() {
	// Near-singular diagonal forces the careful (non-ztrsv) solve path.
	// scale=0 means singular - x is a null-space direction, so only check
	// that scale is tiny and info=0, not exact x values.
	var A = makeMatrix( [
		1e-300, 0.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,     1e-300, 0.0, 0.0, 0.0,
		0.5, 0.0,     1.0, -1.0, 1e-300, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: lower, no-transpose, careful solve', function t() {
	var A = makeMatrix( [
		1e-300, 0.0, 1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,    1e-300, 0.0, 1.0, -1.0,
		0.0, 0.0,    0.0, 0.0,  1e-300, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, transpose, careful solve', function t() {
	var A = makeMatrix( [
		1e-300, 0.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,     1e-300, 0.0, 0.0, 0.0,
		0.5, 0.0,     1.0, -1.0, 1e-300, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, conjugate-transpose, careful solve', function t() {
	var A = makeMatrix( [
		1e-300, 0.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,     1e-300, 0.0, 0.0, 0.0,
		0.5, 0.0,     1.0, -1.0, 1e-300, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, no-transpose, unit, careful solve (large off-diag)', function t() {
	var tc = upper_n_unit_careful;
	var A = makeMatrix( [
		99.0, 99.0,  0.0, 0.0,      0.0, 0.0,
		1e+150, 1e+150, 99.0, 99.0, 0.0, 0.0,
		1e+150, 0.0, 1e+150, -1e+150, 99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-10, 'scale' );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
});

test( 'zlatrs: lower, conjugate-transpose, careful solve', function t() {
	var A = makeMatrix( [
		1e-300, 0.0, 1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,    1e-300, 0.0, 1.0, -1.0,
		0.0, 0.0,    0.0, 0.0,  1e-300, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, no-transpose, tiny-but-nonzero diag with huge x triggers rec scale', function t() {
	// tjj > SMLNUM but tjj < ONE, and xj > tjj*BIGNUM forces rec = 1/xj scaling.
	var A = makeMatrix( [
		1e-10, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,      1e-10, 0.0,  0.0, 0.0,
		0.5, 0.0,      1.0, 0.0,    1e-10, 0.0
	], 3 );
	var x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, no-transpose, tiny-but-nonzero diag with huge x triggers rec scale', function t() {
	var A = makeMatrix( [
		1e-10, 0.0,  1.0, 0.0,  0.5, 0.0,
		0.0, 0.0,    1e-10, 0.0, 1.0, 0.0,
		0.0, 0.0,    0.0, 0.0,  1e-10, 0.0
	], 3 );
	var x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, transpose, tiny-but-nonzero diag with huge x', function t() {
	var A = makeMatrix( [
		1e-10, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,      1e-10, 0.0,  0.0, 0.0,
		0.5, 0.0,      1.0, 0.0,    1e-10, 0.0
	], 3 );
	var x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, conjugate-transpose, tiny-but-nonzero diag with huge x', function t() {
	var A = makeMatrix( [
		1e-10, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.5,      1e-10, 0.0,  0.0, 0.0,
		0.5, 0.0,      1.0, -0.3,   1e-10, 0.0
	], 3 );
	var x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: huge CNORM triggers tscal scaling (upper)', function t() {
	// Very large off-diagonal column makes CNORM huge enough to require tscal != 1.
	// Need CNORM > BIGNUM*HALF ~ 5e291 but <= RMAX so tscal scaling path is taken.
	var A = makeMatrix( [
		2.0, 0.0,      0.0, 0.0,      0.0, 0.0,
		1e300, 0.0,    3.0, 0.0,      0.0, 0.0,
		1e300, 0.0,    1e300, 0.0,    4.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: huge CNORM triggers tscal scaling (lower)', function t() {
	var A = makeMatrix( [
		2.0, 0.0,      1e300, 0.0,    1e300, 0.0,
		0.0, 0.0,      3.0, 0.0,      1e300, 0.0,
		0.0, 0.0,      0.0, 0.0,      4.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, transpose, tiny diag with huge x', function t() {
	var A = makeMatrix( [
		1e-10, 0.0,  1.0, 0.0,  0.5, 0.0,
		0.0, 0.0,    1e-10, 0.0, 1.0, 0.0,
		0.0, 0.0,    0.0, 0.0,  1e-10, 0.0
	], 3 );
	var x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, conjugate-transpose, tiny diag with huge x', function t() {
	var A = makeMatrix( [
		1e-10, 0.0,  1.0, 0.5,  0.5, 0.0,
		0.0, 0.0,    1e-10, 0.0, 1.0, -0.3,
		0.0, 0.0,    0.0, 0.0,  1e-10, 0.0
	], 3 );
	var x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, transpose, large diagonal triggers uscal division', function t() {
	// |tjjs| > 1 within careful path forces uscal = 1/tjjs branch (lines 134-160 / 559-568).
	// Very large diagonal + huge CNORM forces both careful path and uscal != tscal.
	var A = makeMatrix( [
		1e150, 0.0,    0.0, 0.0,    0.0, 0.0,
		1e300, 0.0,    1e150, 0.0,  0.0, 0.0,
		1e300, 0.0,    1e300, 0.0,  1e150, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, conjugate-transpose, large diagonal triggers uscal division', function t() {
	var A = makeMatrix( [
		1e150, 0.0,    0.0, 0.0,    0.0, 0.0,
		1e300, 0.0,    1e150, 0.5,  0.0, 0.0,
		1e300, 0.0,    1e300, 0.0,  1e150, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, transpose, large diagonal triggers uscal division', function t() {
	var A = makeMatrix( [
		1e150, 0.0,  1e300, 0.0,  1e300, 0.0,
		0.0, 0.0,    1e150, 0.0,  1e300, 0.0,
		0.0, 0.0,    0.0, 0.0,    1e150, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, conjugate-transpose, large diagonal triggers uscal division', function t() {
	var A = makeMatrix( [
		1e150, 0.0,  1e300, 0.5,  1e300, 0.0,
		0.0, 0.0,    1e150, 0.0,  1e300, -0.3,
		0.0, 0.0,    0.0, 0.0,    1e150, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: huge initial xmax triggers pre-scaling (no-transpose)', function t() {
	// xmax > BIGNUM*HALF before solve forces zdscal of x.
	var A = makeMatrix( [
		1e-300, 0.0,   0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,      1e-300, 0.0, 0.0, 0.0,
		1.0, 0.0,      1.0, 0.0,    1e-300, 0.0
	], 3 );
	var x = makeVector( [ 1e305, 0.0, 1e305, 0.0, 1e305, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatrs: lower, no-transpose, unit, careful path (huge off-diag)', function t() {
	// Mirror of upper_n_unit_careful, but for lower triangle.
	var A = makeMatrix( [
		99.0, 99.0, 1e150, 1e150,    1e150, 0.0,
		0.0, 0.0,   99.0, 99.0,      1e150, -1e150,
		0.0, 0.0,   0.0, 0.0,        99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, transpose, unit, careful path', function t() {
	var A = makeMatrix( [
		99.0, 99.0,    0.0, 0.0,        0.0, 0.0,
		1e150, 1e150,  99.0, 99.0,      0.0, 0.0,
		1e150, 0.0,    1e150, -1e150,   99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, conjugate-transpose, unit, careful path', function t() {
	var A = makeMatrix( [
		99.0, 99.0,    0.0, 0.0,        0.0, 0.0,
		1e150, 1e150,  99.0, 99.0,      0.0, 0.0,
		1e150, 0.0,    1e150, -1e150,   99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, transpose, unit, careful path', function t() {
	var A = makeMatrix( [
		99.0, 99.0,  1e150, 1e150,  1e150, 0.0,
		0.0, 0.0,    99.0, 99.0,    1e150, -1e150,
		0.0, 0.0,    0.0, 0.0,      99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, conjugate-transpose, unit, careful path', function t() {
	var A = makeMatrix( [
		99.0, 99.0,  1e150, 1e150,  1e150, 0.0,
		0.0, 0.0,    99.0, 99.0,    1e150, -1e150,
		0.0, 0.0,    0.0, 0.0,      99.0, 99.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	var xv = reinterpret( x, 0 );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (no-transpose, upper)', function t() {
	// Non-unit with zero on diagonal forces tjj==0 path (lines 502-512).
	var A = makeMatrix( [
		2.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		0.5, 0.0,    1.0, 0.0,    3.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (no-transpose, lower)', function t() {
	var A = makeMatrix( [
		2.0, 0.0,    1.0, 0.0,    0.5, 0.0,
		0.0, 0.0,    0.0, 0.0,    1.0, 0.0,
		0.0, 0.0,    0.0, 0.0,    3.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (transpose, upper)', function t() {
	var A = makeMatrix( [
		2.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		0.5, 0.0,    1.0, 0.0,    3.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (conjugate-transpose, upper)', function t() {
	var A = makeMatrix( [
		2.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		0.5, 0.0,    1.0, 0.0,    3.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: huge CNORM that overflows RMAX (upper)', function t() {
	// dzasum of huge values overflows -> tmax becomes Infinity > RMAX,
	// triggers the element-wise recompute path (lines 277-318).
	var A = makeMatrix( [
		2.0, 0.0,      0.0, 0.0,      0.0, 0.0,
		1e308, 0.0,    3.0, 0.0,      0.0, 0.0,
		1e308, 0.0,    1e308, 0.0,    4.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	// Pre-load CNORM with overflow values via normin='yes' so we hit the BIGNUM*HALF < tmax path.
	cnorm[ 0 ] = 0.0;
	cnorm[ 1 ] = 1e308;
	cnorm[ 2 ] = 2e308; // Infinity once doubled
	info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatrs: huge CNORM that overflows RMAX (lower)', function t() {
	var A = makeMatrix( [
		2.0, 0.0,      1e308, 0.0,    1e308, 0.0,
		0.0, 0.0,      3.0, 0.0,      1e308, 0.0,
		0.0, 0.0,      0.0, 0.0,      4.0, 0.0
	], 3 );
	var x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	var scale = new Float64Array( 1 );
	var cnorm = new Float64Array( 3 );
	var info;

	cnorm[ 0 ] = 2e308;
	cnorm[ 1 ] = 1e308;
	cnorm[ 2 ] = 0.0;
	info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatrs: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlatrs( 'invalid', 'no-transpose', 'non-unit', 'no', 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatrs: throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlatrs( 'upper', 'bad', 'non-unit', 'no', 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatrs: throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlatrs( 'upper', 'no-transpose', 'bad', 'no', 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zlatrs: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', -1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});
