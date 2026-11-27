import Float64Array from '@stdlib/array/float64/lib/index.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import dsycon from './../lib/ndarray.js';
import dsytrf from '../../dsytrf/lib/base.js';
import dlansy from '../../dlansy/lib/base.js';

// FIXTURES //

import upper_well_cond from './fixtures/upper_well_cond.json' with { type: 'json' };
import lower_well_cond from './fixtures/lower_well_cond.json' with { type: 'json' };
import identity_upper from './fixtures/identity_upper.json' with { type: 'json' };
import identity_lower from './fixtures/identity_lower.json' with { type: 'json' };
import ill_cond_upper from './fixtures/ill_cond_upper.json' with { type: 'json' };
import _4x4_upper from './fixtures/4x4_upper.json' with { type: 'json' };
import _4x4_lower from './fixtures/4x4_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

// Helper to compute rcond given a symmetric matrix (column-major flat array)
function computeRcond( uplo, N, Aflat ) {
	const A = new Float64Array( Aflat );
	const work = new Float64Array( 2 * N );
	const iwork = new Int32Array( N );
	const ipiv = new Int32Array( N );
	const rcond = new Float64Array( 1 );
	const lanWork = new Float64Array( N );
	const anorm = dlansy( 'one-norm', uplo, N, A, 1, N, 0, lanWork, 1, 0 );
	dsytrf( uplo, N, A, 1, N, 0, ipiv, 1, 0, new Float64Array( Math.max( 1, N * 32 ) ), 1, 0 );
	const info = dsycon( uplo, N, A, 1, N, 0, ipiv, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	return { rcond: rcond[ 0 ], anorm: anorm, info: info };
}

test( 'dsycon: main export is a function', function t() {
	assert.strictEqual( typeof dsycon, 'function' );
});

test( 'dsycon: well-conditioned 3x3 (upper)', function t() {
	const tc = upper_well_cond;
	const result = computeRcond( 'upper', 3, [
		4, 1, 1,
		1, 3, 1,
		1, 1, 2
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: well-conditioned 3x3 (lower)', function t() {
	const tc = lower_well_cond;
	const result = computeRcond( 'lower', 3, [
		4, 1, 1,
		1, 3, 1,
		1, 1, 2
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: identity 3x3 (upper, rcond=1)', function t() {
	const tc = identity_upper;
	const result = computeRcond( 'upper', 3, [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: identity 3x3 (lower, rcond=1)', function t() {
	const tc = identity_lower;
	const result = computeRcond( 'lower', 3, [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: ill-conditioned 3x3 (upper)', function t() {
	const tc = ill_cond_upper;
	const result = computeRcond( 'upper', 3, [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1e-15
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: singular 3x3 (upper, rcond=0)', function t() {
	const result = computeRcond( 'upper', 3, [
		1, 2, 3,
		2, 4, 6,
		3, 6, 9
	] );
	assert.strictEqual( result.info, 0 );
	assert.strictEqual( result.rcond, 0.0 );
});

test( 'dsycon: N=0 (rcond=1)', function t() {
	const A = new Float64Array( 1 );
	const ipiv = new Int32Array( 1 );
	const work = new Float64Array( 1 );
	const iwork = new Int32Array( 1 );
	const rcond = new Float64Array( 1 );
	const info = dsycon( 'upper', 0, A, 1, 1, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dsycon: 4x4 (upper)', function t() {
	const tc = _4x4_upper;
	const result = computeRcond( 'upper', 4, [
		10, 1, 2, 0,
		1, 8, 1, 1,
		2, 1, 6, 1,
		0, 1, 1, 5
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: 4x4 (lower)', function t() {
	const tc = _4x4_lower;
	const result = computeRcond( 'lower', 4, [
		10, 1, 2, 0,
		1, 8, 1, 1,
		2, 1, 6, 1,
		0, 1, 1, 5
	] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, tc.anorm, 1e-14, 'anorm' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: N=1 (upper)', function t() {
	const tc = n_one_upper;
	const A = new Float64Array( [ 5.0 ] );
	const ipiv = new Int32Array( 1 );
	const work = new Float64Array( 2 );
	const iwork = new Int32Array( 1 );
	const rcond = new Float64Array( 1 );
	dsytrf( 'upper', 1, A, 1, 1, 0, ipiv, 1, 0, new Float64Array( Math.max( 1, 1 * 32 ) ), 1, 0 );
	const info = dsycon( 'upper', 1, A, 1, 1, 0, ipiv, 1, 0, 5.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'dsycon: singular 3x3 (lower, rcond=0)', function t() {
	const result = computeRcond( 'lower', 3, [
		1, 2, 3,
		2, 4, 6,
		3, 6, 9
	] );
	assert.strictEqual( result.info, 0 );
	assert.strictEqual( result.rcond, 0.0 );
});

test( 'dsycon: anorm=0 returns rcond=0', function t() {
	const A = new Float64Array( [ 1, 0, 0, 1 ] );
	const ipiv = new Int32Array( 2 );
	const work = new Float64Array( 4 );
	const iwork = new Int32Array( 2 );
	const rcond = new Float64Array( 1 );
	dsytrf( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, new Float64Array( Math.max( 1, 2 * 32 ) ), 1, 0 );
	const info = dsycon( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'ndarray: inv(D) = 0 leaves rcond = 0 (AINVNM = 0 guard)', function t() {
	// N = 1, 1x1 pivot D = Inf (nonzero, so not flagged singular): the solve
	// gives 1/Inf = 0, so the estimator returns AINVNM = 0. The reference then
	// skips RCOND = (1/AINVNM)/ANORM and returns RCOND = 0, INFO = 0.
	[ 'upper', 'lower' ].forEach( function check( uplo ) {
		const rcond = new Float64Array( [ -1.0 ] );
		const A = new Float64Array( [ Infinity ] );
		const info = dsycon( uplo, 1, A, 1, 1, 0, new Int32Array( [ 0 ] ), 1, 0, 1.0, rcond, new Float64Array( 2 ), 1, 0, new Int32Array( 1 ), 1, 0 ); // eslint-disable-line max-len
		assert.strictEqual( info, 0, uplo + ': info' );
		assert.ok( Object.is( rcond[ 0 ], 0.0 ), uplo + ': rcond is exactly 0, got ' + rcond[ 0 ] );
	});
});
