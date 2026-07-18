// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsteqr from './../lib/ndarray.js';

// FIXTURES //

import compz_i_4x4 from './fixtures/compz_i_4x4.json' with { type: 'json' };
import compz_v_4x4 from './fixtures/compz_v_4x4.json' with { type: 'json' };
import compz_n_4x4 from './fixtures/compz_n_4x4.json' with { type: 'json' };
import n1_compz_i from './fixtures/n1_compz_i.json' with { type: 'json' };
import n2_compz_i from './fixtures/n2_compz_i.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import diagonal_compz_i from './fixtures/diagonal_compz_i.json' with { type: 'json' };
import n6_compz_i from './fixtures/n6_compz_i.json' with { type: 'json' };
import compz_v_permuted from './fixtures/compz_v_permuted.json' with { type: 'json' };
import n2_compz_n from './fixtures/n2_compz_n.json' with { type: 'json' };
import n2_compz_v_complex from './fixtures/n2_compz_v_complex.json' with { type: 'json' };

// VARIABLES //

const LDZ = 6; // Leading dimension used in Fortran test

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extract NxN complex matrix from fixture data (LDZ x ncols interleaved).
*/
function extractZ( fixtureZ, N ) {
	const result = new Float64Array( 2 * N * N );
	let col, row;
	for ( col = 0; col < N; col++ ) {
		for ( row = 0; row < N; row++ ) {
			result[ col * 2 * N + row * 2 ] = fixtureZ[ col * 2 * LDZ + row * 2 ];
			result[ col * 2 * N + row * 2 + 1 ] = fixtureZ[ col * 2 * LDZ + row * 2 + 1 ];
		}
	}
	return result;
}

/**
* Verify Z^H * Z = I for a complex NxN matrix (column-major Float64 view).
*/
function assertOrthogonal( zv, N, tol, msg ) {
	let re, im, expected, i, j, k, zkiRe, zkiIm, zkjRe, zkjIm;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			re = 0.0;
			im = 0.0;
			for ( k = 0; k < N; k++ ) {
				zkiRe = zv[ i * 2 * N + k * 2 ];
				zkiIm = zv[ i * 2 * N + k * 2 + 1 ];
				zkjRe = zv[ j * 2 * N + k * 2 ];
				zkjIm = zv[ j * 2 * N + k * 2 + 1 ];
				re += zkiRe * zkjRe + zkiIm * zkjIm;
				im += zkiRe * zkjIm - zkiIm * zkjRe;
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			assert.ok( Math.abs( re - expected ) < tol, msg + ': Z^H*Z[' + i + ',' + j + '] real: expected ' + expected + ', got ' + re );
			assert.ok( Math.abs( im ) < tol, msg + ': Z^H*Z[' + i + ',' + j + '] imag: expected 0, got ' + im );
		}
	}
}

/**
* Verify T*Z = Z*D (eigenvector property) for a real symmetric tridiagonal matrix.
* D is diagonal (eigenvalues), Z is complex eigenvector matrix.
* T has diagonal `diag` and off-diagonal `offdiag`.
*/
function assertEigenvectors( zv, eigenvalues, diag, offdiag, N, tol, msg ) {
	// For each eigenvector column j, verify T * z_j = lambda_j * z_j
	let j, i, tzRe, tzIm, lzRe, lzIm, ziRe, ziIm, zipRe, zipIm, zimRe, zimIm;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			// T * z_j at row i
			ziRe = zv[ j * 2 * N + i * 2 ];
			ziIm = zv[ j * 2 * N + i * 2 + 1 ];
			tzRe = diag[ i ] * ziRe;
			tzIm = diag[ i ] * ziIm;
			if ( i > 0 ) {
				zimRe = zv[ j * 2 * N + ( i - 1 ) * 2 ];
				zimIm = zv[ j * 2 * N + ( i - 1 ) * 2 + 1 ];
				tzRe += offdiag[ i - 1 ] * zimRe;
				tzIm += offdiag[ i - 1 ] * zimIm;
			}
			if ( i < N - 1 ) {
				zipRe = zv[ j * 2 * N + ( i + 1 ) * 2 ];
				zipIm = zv[ j * 2 * N + ( i + 1 ) * 2 + 1 ];
				tzRe += offdiag[ i ] * zipRe;
				tzIm += offdiag[ i ] * zipIm;
			}
			// lambda_j * z_j at row i
			lzRe = eigenvalues[ j ] * ziRe;
			lzIm = eigenvalues[ j ] * ziIm;
			assert.ok( Math.abs( tzRe - lzRe ) < tol, msg + ': T*z[' + i + ',' + j + '] re: expected ' + lzRe + ', got ' + tzRe );
			assert.ok( Math.abs( tzIm - lzIm ) < tol, msg + ': T*z[' + i + ',' + j + '] im: expected ' + lzIm + ', got ' + tzIm );
		}
	}
}

// TESTS //

test( 'zsteqr: COMPZ=I, 4x4 tridiagonal', function t() {
	const tc = compz_i_4x4;
	const diag = [ 2, 2, 2, 2 ];
	const offdiag = [ 1, 1, 1 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 16 );
	const WORK = new Float64Array( 6 );
	const info = zsteqr( 'initialize', 4, d, 1, 0, e, 1, 0, Z, 1, 4, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( zv, 4, 1e-13, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 4, 1e-12, 'eigvecs' );
});

test( 'zsteqr: COMPZ=V, 4x4 with identity initial Z', function t() {
	const tc = compz_v_4x4;
	const diag = [ 2, 2, 2, 2 ];
	const offdiag = [ 1, 1, 1 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 16 );
	const zv = reinterpret( Z, 0 );
	let i;
	for ( i = 0; i < 4; i++ ) {
		zv[ i * 8 + i * 2 ] = 1.0;
	}
	const WORK = new Float64Array( 6 );
	const info = zsteqr( 'update', 4, d, 1, 0, e, 1, 0, Z, 1, 4, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( zv, 4, 1e-13, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 4, 1e-12, 'eigvecs' );
});

test( 'zsteqr: COMPZ=N, 4x4 eigenvalues only', function t() {
	const tc = compz_n_4x4;
	const d = new Float64Array( [ 2, 2, 2, 2 ] );
	const e = new Float64Array( [ 1, 1, 1 ] );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 6 );
	const info = zsteqr( 'none', 4, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
});

test( 'zsteqr: N=1, COMPZ=I', function t() {
	const tc = n1_compz_i;
	const d = new Float64Array( [ 5 ] );
	const e = new Float64Array( 0 );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = zsteqr( 'initialize', 1, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertClose( zv[ 0 ], 1.0, 1e-14, 'Z(0,0) real' );
	assertClose( zv[ 1 ], 0.0, 1e-14, 'Z(0,0) imag' );
});

test( 'zsteqr: N=2, COMPZ=I', function t() {
	const tc = n2_compz_i;
	const diag = [ 3, 1 ];
	const offdiag = [ 2 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 4 );
	const WORK = new Float64Array( 2 );
	const info = zsteqr( 'initialize', 2, d, 1, 0, e, 1, 0, Z, 1, 2, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	assertOrthogonal( zv, 2, 1e-13, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 2, 1e-12, 'eigvecs' );
});

test( 'zsteqr: N=0 edge case', function t() {
	const tc = n0;
	const d = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = zsteqr( 'initialize', 0, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zsteqr: already-diagonal matrix, COMPZ=I', function t() {
	const tc = diagonal_compz_i;
	const diag = [ 4, 1, 3, 2 ];
	const offdiag = [ 0, 0, 0 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 16 );
	const WORK = new Float64Array( 6 );
	const info = zsteqr( 'initialize', 4, d, 1, 0, e, 1, 0, Z, 1, 4, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );

	// For diagonal matrix, eigenvectors are just identity (possibly permuted)
	const expectedZ = extractZ( tc.z, 4 );
	assertArrayClose( Array.from( zv ), Array.from( expectedZ ), 1e-14, 'z' );
	assertOrthogonal( zv, 4, 1e-13, 'orthogonality' );
});

test( 'zsteqr: 6x6 matrix, COMPZ=I', function t() {
	const tc = n6_compz_i;
	const diag = [ 4, 3, 2, 1, 5, 6 ];
	const offdiag = [ 1, 0.5, 0.25, 0.125, 2 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 36 );
	const WORK = new Float64Array( 10 );
	const info = zsteqr( 'initialize', 6, d, 1, 0, e, 1, 0, Z, 1, 6, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-13, 'd' );
	assertOrthogonal( zv, 6, 1e-12, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 6, 1e-11, 'eigvecs' );
});

test( 'zsteqr: COMPZ=V, 4x4 with permuted initial Z', function t() {
	const tc = compz_v_permuted;
	const diag = [ 2, 2, 2, 2 ];
	const offdiag = [ 1, 1, 1 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 16 );
	const zv = reinterpret( Z, 0 );
	zv[ 0 * 8 + 1 * 2 ] = 1.0; // Z(1,0) = 1
	zv[ 1 * 8 + 0 * 2 ] = 1.0; // Z(0,1) = 1
	zv[ 2 * 8 + 2 * 2 ] = 1.0; // Z(2,2) = 1
	zv[ 3 * 8 + 3 * 2 ] = 1.0; // Z(3,3) = 1
	const WORK = new Float64Array( 6 );
	const info = zsteqr( 'update', 4, d, 1, 0, e, 1, 0, Z, 1, 4, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
	// For COMPZ='V', orthogonality of Z depends on the initial Z being unitary
	assertOrthogonal( zv, 4, 1e-13, 'orthogonality' );
});

test( 'zsteqr: N=2, COMPZ=N', function t() {
	const tc = n2_compz_n;
	const d = new Float64Array( [ 3, 1 ] );
	const e = new Float64Array( [ 2 ] );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 2 );
	const info = zsteqr( 'none', 2, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );
});

test( 'zsteqr: N=2, COMPZ=V with complex initial Z', function t() {
	const tc = n2_compz_v_complex;
	const diag = [ 3, 1 ];
	const offdiag = [ 2 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 4 );
	const zv = reinterpret( Z, 0 );
	zv[ 0 * 4 + 0 * 2 ] = 0.0;
	zv[ 0 * 4 + 0 * 2 + 1 ] = 1.0;
	zv[ 1 * 4 + 1 * 2 ] = 0.0;
	zv[ 1 * 4 + 1 * 2 + 1 ] = 1.0;
	const WORK = new Float64Array( 2 );
	const info = zsteqr( 'update', 2, d, 1, 0, e, 1, 0, Z, 1, 2, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	assertArrayClose( Array.from( d ), tc.d, 1e-14, 'd' );

	const expectedZ = extractZ( tc.z, 2 );
	assertArrayClose( Array.from( zv ), Array.from( expectedZ ), 1e-14, 'z' );
	assertOrthogonal( zv, 2, 1e-13, 'orthogonality' );
});

test( 'zsteqr: QR iteration path (|D(end)| < |D(start)|), COMPZ=I', function t() {
	// Construct a matrix where the last diagonal element is smaller than the first,
	// so that the QR branch (lend < l) is taken.
	// D = [10, 5, 1], E = [3, 3] -> |D(end)| = 1 < |D(start)| = 10
	const diag = [ 10, 5, 1 ];
	const offdiag = [ 3, 3 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 9 ); // 3x3
	const WORK = new Float64Array( 4 ); // 2*(N-1) = 4
	const info = zsteqr( 'initialize', 3, d, 1, 0, e, 1, 0, Z, 1, 3, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, 0 );
	// Eigenvalues should be sorted ascending
	assert.ok( d[ 0 ] <= d[ 1 ] );
	assert.ok( d[ 1 ] <= d[ 2 ] );
	assertOrthogonal( zv, 3, 1e-13, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 3, 1e-12, 'eigvecs' );
});

test( 'zsteqr: QR iteration path, COMPZ=N (eigenvalues only)', function t() {
	const d = new Float64Array( [ 10, 5, 1 ] );
	const e = new Float64Array( [ 3, 3 ] );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 4 );
	const info = zsteqr( 'none', 3, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	assert.ok( d[ 0 ] <= d[ 1 ] );
	assert.ok( d[ 1 ] <= d[ 2 ] );
});

test( 'zsteqr: QR iteration 2x2 block, COMPZ=I', function t() {
	// 2x2 matrix where |D(end)| < |D(start)| to trigger QR 2x2 path
	const diag = [ 10, 1 ];
	const offdiag = [ 3 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 4 ); // 2x2
	const WORK = new Float64Array( 2 );
	const info = zsteqr( 'initialize', 2, d, 1, 0, e, 1, 0, Z, 1, 2, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, 0 );
	assert.ok( d[ 0 ] <= d[ 1 ] );
	assertOrthogonal( zv, 2, 1e-13, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 2, 1e-12, 'eigvecs' );
});

test( 'zsteqr: QR iteration, COMPZ=V with complex initial Z', function t() {
	// Use |D(end)| < |D(start)| to force QR path, with a complex initial Z
	const diag = [ 10, 5, 1 ];
	const offdiag = [ 3, 3 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 9 );
	const zv = reinterpret( Z, 0 );
	// Initialize Z to identity
	zv[ 0 ] = 1.0; // Z(0,0) = 1+0i
	zv[ 1 * 6 + 1 * 2 ] = 1.0; // Z(1,1) = 1+0i
	zv[ 2 * 6 + 2 * 2 ] = 1.0; // Z(2,2) = 1+0i
	const WORK = new Float64Array( 4 );
	const info = zsteqr( 'update', 3, d, 1, 0, e, 1, 0, Z, 1, 3, 0, WORK, 1, 0 );

	assert.equal( info, 0 );
	assert.ok( d[ 0 ] <= d[ 1 ] );
	assert.ok( d[ 1 ] <= d[ 2 ] );
	assertOrthogonal( zv, 3, 1e-13, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 3, 1e-12, 'eigvecs' );
});

test( 'zsteqr: throws TypeError for invalid COMPZ', function t() {
	const d = new Float64Array( [ 1 ] );
	const e = new Float64Array( 0 );
	const Z = new Complex128Array( 1 );
	const WORK = new Float64Array( 1 );
	assert.throws( function () {
		zsteqr( 'X', 1, d, 1, 0, e, 1, 0, Z, 1, 1, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zsteqr: 5x5, mixed sizes to exercise both QL and QR paths', function t() {
	// D = [1, 8, 2, 7, 3], E = [4, 4, 4, 4]
	// This has structure where some blocks may use QL and others QR
	const diag = [ 1, 8, 2, 7, 3 ];
	const offdiag = [ 4, 4, 4, 4 ];
	const d = new Float64Array( diag );
	const e = new Float64Array( offdiag );
	const Z = new Complex128Array( 25 ); // 5x5
	const WORK = new Float64Array( 8 ); // 2*(N-1) = 8
	const info = zsteqr( 'initialize', 5, d, 1, 0, e, 1, 0, Z, 1, 5, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );

	assert.equal( info, 0 );
	for ( let i = 0; i < 4; i++ ) {
		assert.ok( d[ i ] <= d[ i + 1 ], 'd[' + i + '] <= d[' + ( i + 1 ) + ']' );
	}
	assertOrthogonal( zv, 5, 1e-12, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), diag, offdiag, 5, 1e-11, 'eigvecs' );
});
