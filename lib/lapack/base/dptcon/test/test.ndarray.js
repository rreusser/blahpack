import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptcon from './../lib/ndarray.js';
import dpttrf from '../../dpttrf/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';

// HELPERS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Factor a symmetric positive definite tridiagonal matrix and compute rcond.
* d is diagonal (length N), e is subdiagonal (length N-1).
*/
function computeRcond( dArr, eArr ) {
	var N = dArr.length;
	var d = new Float64Array( dArr );
	var e = new Float64Array( eArr );
	var work = new Float64Array( N );
	var rcond = new Float64Array( 1 );
	var anorm;
	var info;

	// Compute 1-norm before factoring
	anorm = dlanst( 'one-norm', N, d, 1, 0, e, 1, 0 );

	// Factor
	info = dpttrf( N, d, 1, 0, e, 1, 0 );
	if ( info !== 0 ) {
		return { 'rcond': 0.0, 'anorm': anorm, 'info': info, 'factInfo': info };
	}

	// Compute rcond
	info = dptcon( N, d, 1, 0, e, 1, 0, anorm, rcond, work, 1, 0 );
	return { 'rcond': rcond[ 0 ], 'anorm': anorm, 'info': info };
}

// TESTS //

test( 'dptcon: main export is a function', function t() {
	assert.strictEqual( typeof dptcon, 'function' );
});

test( 'dptcon: N=0 returns rcond=1', function t() {
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	var work = new Float64Array( 1 );
	var rcond = new Float64Array( 1 );
	var info = dptcon( 0, d, 1, 0, e, 1, 0, 0.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dptcon: anorm=0 returns rcond=0', function t() {
	var d = new Float64Array( [ 2, 2 ] );
	var e = new Float64Array( [ 0.5 ] );
	var work = new Float64Array( 2 );
	var rcond = new Float64Array( 1 );
	dpttrf( 2, d, 1, 0, e, 1, 0 );
	var info = dptcon( 2, d, 1, 0, e, 1, 0, 0.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dptcon: N=1 (scalar)', function t() {
	// A = [5], inv(A) = [0.2], ||A||_1 = 5, ||inv(A)||_1 = 0.2
	// Rcond = 1/(5*0.2) = 1
	var result = computeRcond( [ 5.0 ], [] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 5.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 1.0, 1e-10, 'rcond' );
});

test( 'dptcon: identity 3x3 (rcond=1)', function t() {
	var result = computeRcond( [ 1, 1, 1 ], [ 0, 0 ] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 1.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 1.0, 1e-10, 'rcond' );
});

test( 'dptcon: well-conditioned 4x4', function t() {
	// Diagonally dominant SPD tridiagonal
	// D = [4, 4, 4, 4], e = [1, 1, 1]
	var result = computeRcond( [ 4, 4, 4, 4 ], [ 1, 1, 1 ] );
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond <= 1.0, 'rcond should be at most 1' );
});

test( 'dptcon: ill-conditioned (small diagonal entry)', function t() {
	// D = [1, 1, 1e-15], e = [0, 0]
	// Very ill-conditioned
	var result = computeRcond( [ 1, 1, 1e-15 ], [ 0, 0 ] );
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond < 1e-10, 'rcond should be very small' );
	assert.ok( result.rcond > 0.0, 'rcond should still be positive' );
});

test( 'dptcon: 2x2 case', function t() {
	// A = [[3, 1], [1, 3]]
	// ||A||_1 = 4
	// inv(A) = [[3/8, -1/8], [-1/8, 3/8]]
	// ||inv(A)||_1 = 0.5
	// Rcond = 1/(4*0.5) = 0.5
	var result = computeRcond( [ 3, 3 ], [ 1 ] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 4.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 0.5, 1e-10, 'rcond' );
});

test( 'dptcon: 5x5 uniform tridiagonal', function t() {
	// D = [2, 2, 2, 2, 2], e = [1, 1, 1, 1]
	var result = computeRcond( [ 2, 2, 2, 2, 2 ], [ 1, 1, 1, 1 ] );
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'dptcon: non-positive diagonal returns rcond=0', function t() {
	// After dpttrf, if d has non-positive entries, dptcon should return rcond=0
	var d = new Float64Array( [ 2.0, 0.0, 2.0 ] );
	var e = new Float64Array( [ 0.0, 0.0 ] );
	var work = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );

	// Don't factor -- just pass in d with zero entry directly
	var info = dptcon( 3, d, 1, 0, e, 1, 0, 4.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});
