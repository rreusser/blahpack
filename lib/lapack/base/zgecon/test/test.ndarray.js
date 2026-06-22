// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgecon from './../lib/ndarray.js';
import zgetrf from '../../zgetrf/lib/base.js';
import zlange from '../../zlange/lib/base.js';

// FIXTURES //

import well_cond_1norm from './fixtures/well_cond_1norm.json' with { type: 'json' };
import well_cond_inorm from './fixtures/well_cond_inorm.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import ill_cond from './fixtures/ill_cond.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import anorm_zero from './fixtures/anorm_zero.json' with { type: 'json' };
import _4x4_1norm from './fixtures/4x4_1norm.json' with { type: 'json' };
import _4x4_inorm from './fixtures/4x4_inorm.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

// Helper to compute condition number
function computeRcond( normStr, N, Aflat ) {
	var A = new Complex128Array( Aflat );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( 2 * N );
	var ipiv = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	var anorm = zlange( normStr, N, N, A, 1, N, 0, rwork, 1, 0 );
	zgetrf( N, N, A, 1, N, 0, ipiv, 1, 0 );
	var info = zgecon( normStr, N, A, 1, N, 0, anorm, rcond, work, 1, 0, rwork, 1, 0 );
	return { rcond: rcond[ 0 ], anorm: anorm, info: info };
}

// TESTS //

test( 'zgecon: main export is a function', function t() {
	assert.strictEqual( typeof zgecon, 'function' );
});

test( 'zgecon: well-conditioned 3x3 hermitian (1-norm)', function t() {
	var tc = well_cond_1norm;
	// A = [[4, 1+i, 0], [1-i, 3, 1], [0, 1, 2]]
	var result = computeRcond( 'one-norm', 3, [
		4, 0,   1, -1,  0, 0,
		1, 1,   3, 0,   1, 0,
		0, 0,   1, 0,   2, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'zgecon: well-conditioned 3x3 (infinity-norm)', function t() {
	var tc = well_cond_inorm;
	var result = computeRcond( 'inf-norm', 3, [
		4, 0,   1, -1,  0, 0,
		1, 1,   3, 0,   1, 0,
		0, 0,   1, 0,   2, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'zgecon: 3x3 identity (rcond=1)', function t() {
	var tc = identity;
	var result = computeRcond( 'one-norm', 3, [
		1, 0,  0, 0,  0, 0,
		0, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'zgecon: 3x3 ill-conditioned', function t() {
	var tc = ill_cond;
	var result = computeRcond( 'one-norm', 3, [
		1, 0,  0, 0,  0, 0,
		0, 0,  1, 0,  0, 0,
		0, 0,  0, 0,  1e-15, 0
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'zgecon: N=0 (rcond=1)', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var work = new Complex128Array( 1 );
	var rwork = new Float64Array( 1 );
	var rcond = new Float64Array( 1 );
	var info = zgecon( 'one-norm', 0, A, 1, 1, 0, 0.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
});

test( 'zgecon: anorm=0 (rcond=0)', function t() {
	var tc = anorm_zero;
	var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] );
	var work = new Complex128Array( 6 );
	var rwork = new Float64Array( 6 );
	var ipiv = new Int32Array( 3 );
	var rcond = new Float64Array( 1 );
	zgetrf( 3, 3, A, 1, 3, 0, ipiv, 1, 0 );
	var info = zgecon( 'one-norm', 3, A, 1, 3, 0, 0.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertClose( rcond[ 0 ], tc.rcond, 1e-14, 'rcond' );
});

test( 'zgecon: 4x4 complex matrix (1-norm)', function t() {
	var tc = _4x4_1norm;
	var result = computeRcond( 'one-norm', 4, [
		5, 1,   1, 0,   0, 0,   0, 0,
		1, 0,   4, -1,  1, 1,   0, 0,
		0, 0,   1, -1,  3, 0,   1, 0,
		0, 0,   0, 0,   1, 0,   2, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'zgecon: 4x4 complex matrix (inf-norm)', function t() {
	var tc = _4x4_inorm;
	var result = computeRcond( 'inf-norm', 4, [
		5, 1,   1, 0,   0, 0,   0, 0,
		1, 0,   4, -1,  1, 1,   0, 0,
		0, 0,   1, -1,  3, 0,   1, 0,
		0, 0,   0, 0,   1, 0,   2, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});
