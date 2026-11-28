import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zptcon from './../lib/ndarray.js';
import zpttrf from '../../zpttrf/lib/base.js';

// HELPERS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Compute 1-norm of a Hermitian positive definite tridiagonal matrix.
* For a tridiagonal Hermitian matrix, the 1-norm = max column sum.
* Column j sum = |e(j-1)| + |d(j)| + |e(j)|.
*/
function zlanht1( N, dArr, eReIm ) {
	let maxCol, absE, s, j;

	if ( N === 0 ) {
		return 0.0;
	}
	if ( N === 1 ) {
		return Math.abs( dArr[ 0 ] );
	}

	maxCol = 0.0;
	for ( j = 0; j < N; j++ ) {
		s = Math.abs( dArr[ j ] );

		// Add |e(j-1)| (subdiagonal from column j)
		if ( j > 0 ) {
			absE = Math.sqrt( eReIm[ 2 * ( j - 1 ) ] * eReIm[ 2 * ( j - 1 ) ] + eReIm[ 2 * ( j - 1 ) + 1 ] * eReIm[ 2 * ( j - 1 ) + 1 ] );
			s += absE;
		}
		// Add |e(j)| (superdiagonal from column j = conj(e(j)))
		if ( j < N - 1 ) {
			absE = Math.sqrt( eReIm[ 2 * j ] * eReIm[ 2 * j ] + eReIm[ 2 * j + 1 ] * eReIm[ 2 * j + 1 ] );
			s += absE;
		}
		if ( s > maxCol ) {
			maxCol = s;
		}
	}
	return maxCol;
}

/**
* Factor and compute rcond for a Hermitian positive definite tridiagonal matrix.
*/
function computeRcond( dArr, eReIm ) {
	const N = dArr.length;
	const d = new Float64Array( dArr );
	const e = new Complex128Array( ( N > 1 ) ? N - 1 : 1 );
	const ev = reinterpret( e, 0 );
	const rwork = new Float64Array( N );
	const rcond = new Float64Array( 1 );
	let info, i;

	for ( i = 0; i < eReIm.length; i++ ) {
		ev[ i ] = eReIm[ i ];
	}

	const anorm = zlanht1( N, dArr, eReIm );

	// Factor
	info = zpttrf( N, d, 1, 0, e, 1, 0 );
	if ( info !== 0 ) {
		return { 'rcond': 0.0, 'anorm': anorm, 'info': info, 'factInfo': info };
	}

	// Compute rcond
	info = zptcon( N, d, 1, 0, e, 1, 0, anorm, rcond, rwork, 1, 0 );
	return { 'rcond': rcond[ 0 ], 'anorm': anorm, 'info': info };
}

// TESTS //

test( 'zptcon: main export is a function', function t() {
	assert.strictEqual( typeof zptcon, 'function' );
});

test( 'zptcon: N=0 returns rcond=1', function t() {
	const d = new Float64Array( 1 );
	const e = new Complex128Array( 1 );
	const rwork = new Float64Array( 1 );
	const rcond = new Float64Array( 1 );
	const info = zptcon( 0, d, 1, 0, e, 1, 0, 0.0, rcond, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zptcon: anorm=0 returns rcond=0', function t() {
	const d = new Float64Array( [ 2, 2 ] );
	const e = new Complex128Array( 1 );
	const ev = reinterpret( e, 0 );
	ev[ 0 ] = 0.5; ev[ 1 ] = 0.0;
	const rwork = new Float64Array( 2 );
	const rcond = new Float64Array( 1 );
	zpttrf( 2, d, 1, 0, e, 1, 0 );
	const info = zptcon( 2, d, 1, 0, e, 1, 0, 0.0, rcond, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zptcon: N=1 (scalar)', function t() {
	// A = [5], rcond = 1
	const result = computeRcond( [ 5.0 ], [] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 5.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 1.0, 1e-10, 'rcond' );
});

test( 'zptcon: real identity 3x3 (rcond=1)', function t() {
	const result = computeRcond( [ 1, 1, 1 ], [ 0, 0, 0, 0 ] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 1.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 1.0, 1e-10, 'rcond' );
});

test( 'zptcon: real 2x2 SPD tridiagonal', function t() {
	// A = [[3, 1], [1, 3]] (real subdiagonal)
	// Same as dptcon 2x2 test: rcond = 0.5
	const result = computeRcond( [ 3, 3 ], [ 1, 0 ] );
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 4.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 0.5, 1e-10, 'rcond' );
});

test( 'zptcon: complex subdiagonal 3x3', function t() {
	// D = [4, 4, 4], e = [0.5+0.5i, 0.5-0.5i]
	// |e(0)| = |e(1)| = sqrt(0.5)
	const result = computeRcond( [ 4, 4, 4 ], [ 0.5, 0.5, 0.5, -0.5 ] );
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'zptcon: ill-conditioned (small diagonal)', function t() {
	// D = [1, 1, 1e-15], e = [0, 0]
	const result = computeRcond( [ 1, 1, 1e-15 ], [ 0, 0, 0, 0 ] );
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond < 1e-10, 'rcond should be very small' );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
});

test( 'zptcon: well-conditioned 4x4 with complex off-diagonals', function t() {
	// D = [5, 5, 5, 5], e = [1+i, 1-i, 1+0i]
	const result = computeRcond( [ 5, 5, 5, 5 ], [ 1, 1, 1, -1, 1, 0 ] );
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'zptcon: non-positive diagonal returns rcond=0', function t() {
	const d = new Float64Array( [ 2.0, 0.0, 2.0 ] );
	const e = new Complex128Array( 2 );
	const rwork = new Float64Array( 3 );
	const rcond = new Float64Array( 1 );
	const info = zptcon( 3, d, 1, 0, e, 1, 0, 4.0, rcond, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});
