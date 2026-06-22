// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrcon from './../lib/ndarray.js';

// FIXTURES //

import upper_nonunit_1norm from './fixtures/upper_nonunit_1norm.json' with { type: 'json' };
import upper_nonunit_inorm from './fixtures/upper_nonunit_inorm.json' with { type: 'json' };
import lower_nonunit_1norm from './fixtures/lower_nonunit_1norm.json' with { type: 'json' };
import upper_unit_1norm from './fixtures/upper_unit_1norm.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import _4x4_lower_inorm from './fixtures/4x4_lower_inorm.json' with { type: 'json' };
import lower_unit_inorm from './fixtures/lower_unit_inorm.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

// Helper to run ztrcon with a flat column-major complex array
function computeRcond( normStr, uploStr, diagStr, N, Aflat ) {
	var A = new Complex128Array( Aflat );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var rcond = new Float64Array( 1 );
	var info = ztrcon( normStr, uploStr, diagStr, N, A, 1, N, 0, rcond, work, 1, 0, rwork, 1, 0 );
	return { rcond: rcond[ 0 ], info: info };
}

// TESTS //

test( 'ztrcon: main export is a function', function t() {
	assert.strictEqual( typeof ztrcon, 'function' );
});

test( 'ztrcon: upper triangular, non-unit, 1-norm', function t() {
	var tc = upper_nonunit_1norm;
	// A = [[4+i, 1+i, 0.5], [0, 3, 1-i], [0, 0, 2+i]]
	var result = computeRcond( 'one-norm', 'upper', 'non-unit', 3, [
		4, 1,  0, 0,  0, 0,
		1, 1,  3, 0,  0, 0,
		0.5, 0,  1, -1,  2, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'ztrcon: upper triangular, non-unit, inf-norm', function t() {
	var tc = upper_nonunit_inorm;
	var result = computeRcond( 'inf-norm', 'upper', 'non-unit', 3, [
		4, 1,  0, 0,  0, 0,
		1, 1,  3, 0,  0, 0,
		0.5, 0,  1, -1,  2, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'ztrcon: lower triangular, non-unit, 1-norm', function t() {
	var tc = lower_nonunit_1norm;
	// A = [[3+i, 0, 0], [1, 4-i, 0], [0.5+i, 1-i, 2]]
	var result = computeRcond( 'one-norm', 'lower', 'non-unit', 3, [
		3, 1,    1, 0,     0.5, 1,
		0, 0,    4, -1,    1, -1,
		0, 0,    0, 0,     2, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'ztrcon: upper triangular, unit diagonal, 1-norm', function t() {
	var tc = upper_unit_1norm;
	// A = [[1, 1+i, 0.5], [0, 1, 1-i], [0, 0, 1]] (unit diag)
	var result = computeRcond( 'one-norm', 'upper', 'unit', 3, [
		1, 0,  0, 0,  0, 0,
		1, 1,  1, 0,  0, 0,
		0.5, 0,  1, -1,  1, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'ztrcon: identity (rcond=1)', function t() {
	var tc = identity;
	var result = computeRcond( 'one-norm', 'upper', 'non-unit', 3, [
		1, 0,  0, 0,  0, 0,
		0, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'ztrcon: N=0 (rcond=1)', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var work = new Complex128Array( 1 );
	var rwork = new Float64Array( 1 );
	var rcond = new Float64Array( 1 );
	var info = ztrcon( 'one-norm', 'upper', 'non-unit', 0, A, 1, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
});

test( 'ztrcon: 4x4 lower, inf-norm', function t() {
	var tc = _4x4_lower_inorm;
	// A = [[5+i, 0, 0, 0], [1, 4-i, 0, 0], [0, 1+i, 3, 0], [0, 0, 1, 2+i]]
	var result = computeRcond( 'inf-norm', 'lower', 'non-unit', 4, [
		5, 1,    1, 0,    0, 0,    0, 0,
		0, 0,    4, -1,   1, 1,    0, 0,
		0, 0,    0, 0,    3, 0,    1, 0,
		0, 0,    0, 0,    0, 0,    2, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'ztrcon: lower, unit diagonal, inf-norm', function t() {
	var tc = lower_unit_inorm;
	// A = [[1, 0, 0], [0.5+0.5i, 1, 0], [0, 0.5-0.5i, 1]]
	var result = computeRcond( 'inf-norm', 'lower', 'unit', 3, [
		1, 0,       0.5, 0.5,    0, 0,
		0, 0,       1, 0,        0.5, -0.5,
		0, 0,       0, 0,        1, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});
