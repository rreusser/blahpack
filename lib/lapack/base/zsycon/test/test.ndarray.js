import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsycon from './../lib/ndarray.js';
import zsytrf from '../../zsytrf/lib/base.js';

// HELPERS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Compute the 1-norm of a complex symmetric N-by-N matrix given as.
* a flat interleaved Float64Array in column-major order.
*/
function zlansy1( N, Av ) {
	let maxCol, re, im, s, i, j;

	maxCol = 0.0;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < N; i++ ) {
			re = Av[ 2 * ( j * N + i ) ];
			im = Av[ 2 * ( j * N + i ) + 1 ];
			s += Math.sqrt( re * re + im * im );
		}
		if ( s > maxCol ) {
			maxCol = s;
		}
	}
	return maxCol;
}

/**
* Factor and compute rcond for a complex symmetric matrix.
* Avals is a flat Float64Array of interleaved re/im, column-major.
*/
function computeRcond( uplo, N, Avals ) {
	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const ipiv = new Int32Array( N );
	const work = new Complex128Array( 2 * N );
	const rcond = new Float64Array( 1 );
	let i;

	for ( i = 0; i < Avals.length; i++ ) {
		Av[ i ] = Avals[ i ];
	}

	const anorm = zlansy1( N, Av );
	zsytrf( uplo, N, A, 1, N, 0, ipiv, 1, 0 );
	const info = zsycon( uplo, N, A, 1, N, 0, ipiv, 1, 0, anorm, rcond, work, 1, 0 );
	return { 'rcond': rcond[ 0 ], 'anorm': anorm, 'info': info };
}

// TESTS //

test( 'zsycon: main export is a function', function t() {
	assert.strictEqual( typeof zsycon, 'function' );
});

test( 'zsycon: N=0 returns rcond=1', function t() {
	const A = new Complex128Array( 1 );
	const ipiv = new Int32Array( 1 );
	const work = new Complex128Array( 1 );
	const rcond = new Float64Array( 1 );
	const info = zsycon( 'upper', 0, A, 1, 1, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zsycon: anorm=0 returns rcond=0', function t() {
	const A = new Complex128Array( 4 );
	const Av = reinterpret( A, 0 );

	// 2x2 identity
	Av[ 0 ] = 1; Av[ 1 ] = 0; // (0,0)
	Av[ 2 ] = 0; Av[ 3 ] = 0; // (1,0)
	Av[ 4 ] = 0; Av[ 5 ] = 0; // (0,1)
	Av[ 6 ] = 1; Av[ 7 ] = 0; // (1,1)
	const ipiv = new Int32Array( 2 );
	const work = new Complex128Array( 4 );
	const rcond = new Float64Array( 1 );
	zsytrf( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0 );
	const info = zsycon( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, 0.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zsycon: identity 3x3 (upper)', function t() {
	// Identity: rcond = 1/(1*1) = 1
	const result = computeRcond( 'upper', 3, [
		1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0,
		0, 0, 0, 0, 1, 0
	]);
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 1.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 1.0, 1e-10, 'rcond' );
});

test( 'zsycon: identity 3x3 (lower)', function t() {
	const result = computeRcond( 'lower', 3, [
		1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0,
		0, 0, 0, 0, 1, 0
	]);
	assert.strictEqual( result.info, 0 );
	assertClose( result.anorm, 1.0, 1e-14, 'anorm' );
	assertClose( result.rcond, 1.0, 1e-10, 'rcond' );
});

test( 'zsycon: well-conditioned 3x3 complex symmetric (upper)', function t() {
	// Symmetric (not Hermitian): A = A^T
	// A = [[4+0i, 1+1i, 0+0i],
	//      [1+1i, 3+0i, 1+0i],
	//      [0+0i, 1+0i, 2+0i]]
	// Column-major interleaved:
	const result = computeRcond( 'upper', 3, [
		4, 0, 1, 1, 0, 0,   // col 0: (0,0), (1,0), (2,0)
		1, 1, 3, 0, 1, 0,   // col 1: (0,1), (1,1), (2,1)
		0, 0, 1, 0, 2, 0    // col 2: (0,2), (1,2), (2,2)
	]);
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'zsycon: well-conditioned 3x3 complex symmetric (lower)', function t() {
	const result = computeRcond( 'lower', 3, [
		4, 0, 1, 1, 0, 0,
		1, 1, 3, 0, 1, 0,
		0, 0, 1, 0, 2, 0
	]);
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'zsycon: N=1 (upper)', function t() {
	// 1x1 matrix [[5+2i]]: rcond = 1/(|5+2i|*|1/(5+2i)|) = 1
	const A = new Complex128Array( 1 );
	const Av = reinterpret( A, 0 );
	Av[ 0 ] = 5; Av[ 1 ] = 2;
	const ipiv = new Int32Array( 1 );
	const work = new Complex128Array( 2 );
	const rcond = new Float64Array( 1 );
	const anorm = Math.sqrt( 25 + 4 );
	zsytrf( 'upper', 1, A, 1, 1, 0, ipiv, 1, 0 );
	const info = zsycon( 'upper', 1, A, 1, 1, 0, ipiv, 1, 0, anorm, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( rcond[ 0 ], 1.0, 1e-10, 'rcond for 1x1' );
});

test( 'zsycon: ill-conditioned 3x3 (upper)', function t() {
	// A = diag(1, 1, 1e-15): very ill-conditioned
	const result = computeRcond( 'upper', 3, [
		1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0,
		0, 0, 0, 0, 1e-15, 0
	]);
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond < 1e-10, 'rcond should be very small for ill-conditioned matrix' );
	assert.ok( result.rcond > 0.0, 'rcond should still be positive' );
});

test( 'zsycon: singular 3x3 (upper, rcond=0)', function t() {
	// A with zero diagonal means singular after factoring
	// Use a rank-deficient matrix
	const result = computeRcond( 'upper', 3, [
		1, 0, 1, 0, 1, 0,
		1, 0, 1, 0, 1, 0,
		1, 0, 1, 0, 1, 0
	]);
	assert.strictEqual( result.info, 0 );
	assert.strictEqual( result.rcond, 0.0 );
});

test( 'zsycon: 4x4 complex symmetric (upper)', function t() {
	// Diagonally dominant complex symmetric:
	// A = [[10, 1+i, 0, 0],
	//      [1+i, 8, 1, 0],
	//      [0, 1, 6, 1-i],
	//      [0, 0, 1-i, 5]]
	const result = computeRcond( 'upper', 4, [
		10, 0, 1, 1, 0, 0, 0, 0,   // col 0
		1, 1, 8, 0, 1, 0, 0, 0,   // col 1
		0, 0, 1, 0, 6, 0, 1, -1,  // col 2
		0, 0, 0, 0, 1, -1, 5, 0    // col 3
	]);
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'zsycon: 4x4 complex symmetric (lower)', function t() {
	const result = computeRcond( 'lower', 4, [
		10, 0, 1, 1, 0, 0, 0, 0,
		1, 1, 8, 0, 1, 0, 0, 0,
		0, 0, 1, 0, 6, 0, 1, -1,
		0, 0, 0, 0, 1, -1, 5, 0
	]);
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive' );
	assert.ok( result.rcond < 1.0, 'rcond should be less than 1' );
});

test( 'zsycon: purely imaginary diagonal (upper)', function t() {
	// A = diag(2i, 3i, 4i): nonsingular complex symmetric
	const result = computeRcond( 'upper', 3, [
		0, 2, 0, 0, 0, 0,
		0, 0, 0, 3, 0, 0,
		0, 0, 0, 0, 0, 4
	]);
	assert.strictEqual( result.info, 0 );
	assert.ok( result.rcond > 0.0, 'rcond should be positive for nonsingular matrix' );
});
