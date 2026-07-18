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
	const diff = Math.abs( actual - expected );
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
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
	const buf = new Complex128Array( N * N );
	const v = reinterpret( buf, 0 );
	let i;
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
	const buf = new Complex128Array( vals.length / 2 );
	const v = reinterpret( buf, 0 );
	let i;
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
	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const x = new Complex128Array( 1 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 1 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 0, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'zlatrs: N=1 upper, no-transpose, non-unit', function t() {
	const tc = n_one;
	const A = makeMatrix( [ 5.0, 2.0 ], 1 );
	const x = makeVector( [ 10.0, -3.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 1 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 1, A, 1, 1, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, non-unit, 3x3', function t() {
	const tc = upper_n_nonunit;
	// A upper triangular 3x3 column-major in a 4x4 leading dim = 4
	// In JS: strideA1=1, strideA2=N=3, leading dim matches N
	const A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'zlatrs: lower, no-transpose, non-unit, 3x3', function t() {
	const tc = lower_n_nonunit;
	const A = makeMatrix( [
		2.0, 1.0,  1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,  3.0, 0.5,  1.0, -1.0,
		0.0, 0.0,  0.0, 0.0,  4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
	assertArrayClose( cnorm, tc.cnorm, 1e-14, 'cnorm' );
});

test( 'zlatrs: upper, transpose, non-unit, 3x3', function t() {
	const tc = upper_t_nonunit;
	const A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, conjugate-transpose, non-unit, 3x3', function t() {
	const tc = upper_c_nonunit;
	const A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, transpose, non-unit, 3x3', function t() {
	const tc = lower_t_nonunit;
	const A = makeMatrix( [
		2.0, 1.0,  1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,  3.0, 0.5,  1.0, -1.0,
		0.0, 0.0,  0.0, 0.0,  4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, conjugate-transpose, non-unit, 3x3', function t() {
	const tc = lower_c_nonunit;
	const A = makeMatrix( [
		2.0, 1.0,  1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,  3.0, 0.5,  1.0, -1.0,
		0.0, 0.0,  0.0, 0.0,  4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, unit diagonal, 3x3', function t() {
	const tc = upper_n_unit;
	const A = makeMatrix( [
		99.0, 99.0,  0.0, 0.0,   0.0, 0.0,
		1.0, 1.0,    99.0, 99.0, 0.0, 0.0,
		0.5, 0.0,    1.0, -1.0,  99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, no-transpose, unit diagonal, 3x3', function t() {
	const tc = lower_n_unit;
	const A = makeMatrix( [
		99.0, 99.0, 1.0, 1.0,   0.5, 0.0,
		0.0, 0.0,   99.0, 99.0, 1.0, -1.0,
		0.0, 0.0,   0.0, 0.0,   99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, normin=Y, 3x3', function t() {
	const tc = upper_n_normin_y;
	const A = makeMatrix( [
		2.0, 1.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,  3.0, 0.5,  0.0, 0.0,
		0.5, 0.0,  1.0, -1.0, 4.0, -1.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( [ 0.0, 2.0, 2.5 ] );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, conjugate-transpose, unit diagonal, 3x3', function t() {
	const tc = upper_c_unit;
	const A = makeMatrix( [
		99.0, 99.0,  0.0, 0.0,   0.0, 0.0,
		1.0, 1.0,    99.0, 99.0, 0.0, 0.0,
		0.5, 0.0,    1.0, -1.0,  99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: lower, conjugate-transpose, unit diagonal, 3x3', function t() {
	const tc = lower_c_unit;
	const A = makeMatrix( [
		99.0, 99.0, 1.0, 1.0,   0.5, 0.0,
		0.0, 0.0,   99.0, 99.0, 1.0, -1.0,
		0.0, 0.0,   0.0, 0.0,   99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, 4x4', function t() {
	const tc = upper_n_4x4;
	// 4x4 upper triangular, column-major
	const A = makeMatrix( [
		3.0, 0.0,   0.0, 0.0,   0.0, 0.0,  0.0, 0.0,
		1.0, 0.5,   4.0, 1.0,   0.0, 0.0,  0.0, 0.0,
		0.0, 1.0,   1.0, 0.0,   2.0, -1.0, 0.0, 0.0,
		0.5, 0.0,   0.0, 0.5,   1.0, 1.0,  5.0, 0.0
	], 4 );
	const x = makeVector( [ 1.0, 1.0, 2.0, 0.0, 0.0, 3.0, 1.0, -2.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 4 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 4, A, 1, 4, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-12, 'x' );
});

test( 'zlatrs: lower, transpose, unit, normin=Y, 3x3', function t() {
	const tc = lower_t_unit_norminy;
	const A = makeMatrix( [
		99.0, 99.0, 1.0, 1.0,   0.5, 0.0,
		0.0, 0.0,   99.0, 99.0, 1.0, -1.0,
		0.0, 0.0,   0.0, 0.0,   99.0, 99.0
	], 3 );
	const x = makeVector( [ 5.0, 1.0, 3.0, -2.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( [ 2.5, 2.0, 0.0 ] );

	const info = zlatrs( 'lower', 'transpose', 'unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( xv, tc.x, 1e-13, 'x' );
});

test( 'zlatrs: upper, no-transpose, careful solve (near-singular diag)', function t() {
	// Near-singular diagonal forces the careful (non-ztrsv) solve path.
	// scale=0 means singular - x is a null-space direction, so only check
	// that scale is tiny and info=0, not exact x values.
	const A = makeMatrix( [
		1e-300, 0.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,     1e-300, 0.0, 0.0, 0.0,
		0.5, 0.0,     1.0, -1.0, 1e-300, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: lower, no-transpose, careful solve', function t() {
	const A = makeMatrix( [
		1e-300, 0.0, 1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,    1e-300, 0.0, 1.0, -1.0,
		0.0, 0.0,    0.0, 0.0,  1e-300, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, transpose, careful solve', function t() {
	const A = makeMatrix( [
		1e-300, 0.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,     1e-300, 0.0, 0.0, 0.0,
		0.5, 0.0,     1.0, -1.0, 1e-300, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, conjugate-transpose, careful solve', function t() {
	const A = makeMatrix( [
		1e-300, 0.0,  0.0, 0.0,  0.0, 0.0,
		1.0, 1.0,     1e-300, 0.0, 0.0, 0.0,
		0.5, 0.0,     1.0, -1.0, 1e-300, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, no-transpose, unit, careful solve (large off-diag)', function t() {
	const tc = upper_n_unit_careful;
	const A = makeMatrix( [
		99.0, 99.0,  0.0, 0.0,      0.0, 0.0,
		1e+150, 1e+150, 99.0, 99.0, 0.0, 0.0,
		1e+150, 0.0, 1e+150, -1e+150, 99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( scale[ 0 ], tc.scale, 1e-10, 'scale' );
	assertArrayClose( xv, tc.x, 1e-10, 'x' );
});

test( 'zlatrs: lower, conjugate-transpose, careful solve', function t() {
	const A = makeMatrix( [
		1e-300, 0.0, 1.0, 1.0,  0.5, 0.0,
		0.0, 0.0,    1e-300, 0.0, 1.0, -1.0,
		0.0, 0.0,    0.0, 0.0,  1e-300, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( scale[ 0 ] <= 1e-100, 'scale should be tiny: ' + scale[ 0 ] );
});

test( 'zlatrs: upper, no-transpose, tiny-but-nonzero diag with huge x triggers rec scale', function t() {
	// tjj > SMLNUM but tjj < ONE, and xj > tjj*BIGNUM forces rec = 1/xj scaling.
	const A = makeMatrix( [
		1e-10, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,      1e-10, 0.0,  0.0, 0.0,
		0.5, 0.0,      1.0, 0.0,    1e-10, 0.0
	], 3 );
	const x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, no-transpose, tiny-but-nonzero diag with huge x triggers rec scale', function t() {
	const A = makeMatrix( [
		1e-10, 0.0,  1.0, 0.0,  0.5, 0.0,
		0.0, 0.0,    1e-10, 0.0, 1.0, 0.0,
		0.0, 0.0,    0.0, 0.0,  1e-10, 0.0
	], 3 );
	const x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, transpose, tiny-but-nonzero diag with huge x', function t() {
	const A = makeMatrix( [
		1e-10, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,      1e-10, 0.0,  0.0, 0.0,
		0.5, 0.0,      1.0, 0.0,    1e-10, 0.0
	], 3 );
	const x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, conjugate-transpose, tiny-but-nonzero diag with huge x', function t() {
	const A = makeMatrix( [
		1e-10, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.5,      1e-10, 0.0,  0.0, 0.0,
		0.5, 0.0,      1.0, -0.3,   1e-10, 0.0
	], 3 );
	const x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: huge CNORM triggers tscal scaling (upper)', function t() {
	// Very large off-diagonal column makes CNORM huge enough to require tscal != 1.
	// Need CNORM > BIGNUM*HALF ~ 5e291 but <= RMAX so tscal scaling path is taken.
	const A = makeMatrix( [
		2.0, 0.0,      0.0, 0.0,      0.0, 0.0,
		1e300, 0.0,    3.0, 0.0,      0.0, 0.0,
		1e300, 0.0,    1e300, 0.0,    4.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: huge CNORM triggers tscal scaling (lower)', function t() {
	const A = makeMatrix( [
		2.0, 0.0,      1e300, 0.0,    1e300, 0.0,
		0.0, 0.0,      3.0, 0.0,      1e300, 0.0,
		0.0, 0.0,      0.0, 0.0,      4.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, transpose, tiny diag with huge x', function t() {
	const A = makeMatrix( [
		1e-10, 0.0,  1.0, 0.0,  0.5, 0.0,
		0.0, 0.0,    1e-10, 0.0, 1.0, 0.0,
		0.0, 0.0,    0.0, 0.0,  1e-10, 0.0
	], 3 );
	const x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, conjugate-transpose, tiny diag with huge x', function t() {
	const A = makeMatrix( [
		1e-10, 0.0,  1.0, 0.5,  0.5, 0.0,
		0.0, 0.0,    1e-10, 0.0, 1.0, -0.3,
		0.0, 0.0,    0.0, 0.0,  1e-10, 0.0
	], 3 );
	const x = makeVector( [ 1e290, 0.0, 1e290, 0.0, 1e290, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, transpose, large diagonal triggers uscal division', function t() {
	// |tjjs| > 1 within careful path forces uscal = 1/tjjs branch (lines 134-160 / 559-568).
	// Very large diagonal + huge CNORM forces both careful path and uscal != tscal.
	const A = makeMatrix( [
		1e150, 0.0,    0.0, 0.0,    0.0, 0.0,
		1e300, 0.0,    1e150, 0.0,  0.0, 0.0,
		1e300, 0.0,    1e300, 0.0,  1e150, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, conjugate-transpose, large diagonal triggers uscal division', function t() {
	const A = makeMatrix( [
		1e150, 0.0,    0.0, 0.0,    0.0, 0.0,
		1e300, 0.0,    1e150, 0.5,  0.0, 0.0,
		1e300, 0.0,    1e300, 0.0,  1e150, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, transpose, large diagonal triggers uscal division', function t() {
	const A = makeMatrix( [
		1e150, 0.0,  1e300, 0.0,  1e300, 0.0,
		0.0, 0.0,    1e150, 0.0,  1e300, 0.0,
		0.0, 0.0,    0.0, 0.0,    1e150, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, conjugate-transpose, large diagonal triggers uscal division', function t() {
	const A = makeMatrix( [
		1e150, 0.0,  1e300, 0.5,  1e300, 0.0,
		0.0, 0.0,    1e150, 0.0,  1e300, -0.3,
		0.0, 0.0,    0.0, 0.0,    1e150, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: huge initial xmax triggers pre-scaling (no-transpose)', function t() {
	// xmax > BIGNUM*HALF before solve forces zdscal of x.
	const A = makeMatrix( [
		1e-300, 0.0,   0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,      1e-300, 0.0, 0.0, 0.0,
		1.0, 0.0,      1.0, 0.0,    1e-300, 0.0
	], 3 );
	const x = makeVector( [ 1e305, 0.0, 1e305, 0.0, 1e305, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatrs: lower, no-transpose, unit, careful path (huge off-diag)', function t() {
	// Mirror of upper_n_unit_careful, but for lower triangle.
	const A = makeMatrix( [
		99.0, 99.0, 1e150, 1e150,    1e150, 0.0,
		0.0, 0.0,   99.0, 99.0,      1e150, -1e150,
		0.0, 0.0,   0.0, 0.0,        99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, transpose, unit, careful path', function t() {
	const A = makeMatrix( [
		99.0, 99.0,    0.0, 0.0,        0.0, 0.0,
		1e150, 1e150,  99.0, 99.0,      0.0, 0.0,
		1e150, 0.0,    1e150, -1e150,   99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: upper, conjugate-transpose, unit, careful path', function t() {
	const A = makeMatrix( [
		99.0, 99.0,    0.0, 0.0,        0.0, 0.0,
		1e150, 1e150,  99.0, 99.0,      0.0, 0.0,
		1e150, 0.0,    1e150, -1e150,   99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, transpose, unit, careful path', function t() {
	const A = makeMatrix( [
		99.0, 99.0,  1e150, 1e150,  1e150, 0.0,
		0.0, 0.0,    99.0, 99.0,    1e150, -1e150,
		0.0, 0.0,    0.0, 0.0,      99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: lower, conjugate-transpose, unit, careful path', function t() {
	const A = makeMatrix( [
		99.0, 99.0,  1e150, 1e150,  1e150, 0.0,
		0.0, 0.0,    99.0, 99.0,    1e150, -1e150,
		0.0, 0.0,    0.0, 0.0,      99.0, 99.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ] );
	const xv = reinterpret( x, 0 );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'conjugate-transpose', 'unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( isFinite( xv[ 0 ] ) && isFinite( xv[ 2 ] ) && isFinite( xv[ 4 ] ), 'x finite' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (no-transpose, upper)', function t() {
	// Non-unit with zero on diagonal forces tjj==0 path (lines 502-512).
	const A = makeMatrix( [
		2.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		0.5, 0.0,    1.0, 0.0,    3.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (no-transpose, lower)', function t() {
	const A = makeMatrix( [
		2.0, 0.0,    1.0, 0.0,    0.5, 0.0,
		0.0, 0.0,    0.0, 0.0,    1.0, 0.0,
		0.0, 0.0,    0.0, 0.0,    3.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (transpose, upper)', function t() {
	const A = makeMatrix( [
		2.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		0.5, 0.0,    1.0, 0.0,    3.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: zero-diagonal triggers singular branch (conjugate-transpose, upper)', function t() {
	const A = makeMatrix( [
		2.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		1.0, 0.0,    0.0, 0.0,    0.0, 0.0,
		0.5, 0.0,    1.0, 0.0,    3.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	const info = zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'no', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( scale[ 0 ], 0.0, 'singular -> scale=0' );
});

test( 'zlatrs: huge CNORM that overflows RMAX (upper)', function t() {
	// dzasum of huge values overflows -> tmax becomes Infinity > RMAX,
	// triggers the element-wise recompute path (lines 277-318).
	const A = makeMatrix( [
		2.0, 0.0,      0.0, 0.0,      0.0, 0.0,
		1e308, 0.0,    3.0, 0.0,      0.0, 0.0,
		1e308, 0.0,    1e308, 0.0,    4.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	// Pre-load CNORM with overflow values via normin='yes' so we hit the BIGNUM*HALF < tmax path.
	cnorm[ 0 ] = 0.0;
	cnorm[ 1 ] = 1e308;
	cnorm[ 2 ] = 2e308; // Infinity once doubled
	const info = zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zlatrs: huge CNORM that overflows RMAX (lower)', function t() {
	const A = makeMatrix( [
		2.0, 0.0,      1e308, 0.0,    1e308, 0.0,
		0.0, 0.0,      3.0, 0.0,      1e308, 0.0,
		0.0, 0.0,      0.0, 0.0,      4.0, 0.0
	], 3 );
	const x = makeVector( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	const scale = new Float64Array( 1 );
	const cnorm = new Float64Array( 3 );

	cnorm[ 0 ] = 2e308;
	cnorm[ 1 ] = 1e308;
	cnorm[ 2 ] = 0.0;
	const info = zlatrs( 'lower', 'no-transpose', 'non-unit', 'yes', 3, A, 1, 3, 0, x, 1, 0, scale, cnorm, 1, 0 );
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
