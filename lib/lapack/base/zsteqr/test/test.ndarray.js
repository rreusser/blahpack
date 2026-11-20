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

test( 'zsteqr: NaN input exhausts NMAXIT and reports every unconverged off-diagonal in info', function t() { // eslint-disable-line max-len
	// A NaN never satisfies the deflation test, so the unreduced 4x4 block
	// iterates until JTOT = NMAXIT; INFO is then the count of nonzero E
	// entries, i.e. all N-1 = 3 of them (NaN != 0).
	const N = 4;
	const d = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const e = new Float64Array( [ 1.0, NaN, 1.0 ] );
	const Z = new Complex128Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = zsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, N - 1, 'info' );
});

test( 'zsteqr: QL and QR paths undo ssfmax/ssfmin scaling (homogeneity: eig(c*T) = c*eig(T))', function t() { // eslint-disable-line max-len
	// [3 2 1] (|d[N-1]| < |d[0]|) takes the QR branch and [1 2 3] the QL
	// branch; both tridiagonals have eigenvalues 2-sqrt(3), 2, 2+sqrt(3).
	// For c = 1e300 the block is scaled down (anorm > ssfmax) and for
	// c = 1e-300 scaled up (anorm < ssfmin). Every exit of the QL/QR loop
	// reaches label 140, which must undo the scaling.
	const lams = [ 2.0 - Math.sqrt( 3.0 ), 2.0, 2.0 + Math.sqrt( 3.0 ) ];
	const diags = [ [ 3.0, 2.0, 1.0 ], [ 1.0, 2.0, 3.0 ] ];
	const scales = [ 1.0e300, 1.0e-300 ];
	const N = 3;
	let diag, offdiag, WORK, info, msg, c, d, e, Z, i, j, k, zv;
	for ( j = 0; j < diags.length; j++ ) {
		for ( k = 0; k < scales.length; k++ ) {
			c = scales[ k ];
			msg = 'd0=[' + diags[ j ] + '], c=' + c;
			diag = [ diags[ j ][ 0 ] * c, diags[ j ][ 1 ] * c, diags[ j ][ 2 ] * c ];
			offdiag = [ c, c ];
			d = new Float64Array( diag );
			e = new Float64Array( offdiag );
			Z = new Complex128Array( N * N );
			WORK = new Float64Array( 2 * ( N - 1 ) );
			info = zsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
			zv = reinterpret( Z, 0 );
			assert.equal( info, 0, msg + ': info' );
			for ( i = 0; i < N; i++ ) {
				assertClose( d[ i ] / c, lams[ i ], 1e-14, msg + ': d[' + i + ']/c' );
			}
			assertOrthogonal( zv, N, 1e-14, msg + ': orthogonality' );
			assertEigenvectors( zv, Array.from( d ), diag, offdiag, N, 1e-14 * c, msg + ': residual' );
		}
	}
});

test( 'zsteqr: a nonzero E below the split threshold starts the next block at the split (label 30: L = L1)', function t() { // eslint-disable-line max-len
	// |e[1]| = 1e-20 <= sqrt(|d[1]|)*sqrt(|d[2]|)*eps, so the split scan
	// zeroes it and leaves the loop at M = 2 (GO TO 30); the block [0..1] must
	// then start at L = L1 = 0 and be diagonalized: eig([1 1; 1 2]) and 3.
	const N = 3;
	const d = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const e = new Float64Array( [ 1.0, 1.0e-20 ] );
	const Z = new Complex128Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = zsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	const zv = reinterpret( Z, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( d ), [ ( 3.0 - Math.sqrt( 5.0 ) ) / 2.0, ( 3.0 + Math.sqrt( 5.0 ) ) / 2.0, 3.0 ], 1e-14, 'd' ); // eslint-disable-line max-len
	assertOrthogonal( zv, N, 1e-14, 'orthogonality' );
	assertEigenvectors( zv, Array.from( d ), [ 1.0, 2.0, 3.0 ], [ 1.0, 0.0 ], N, 1e-14, 'residual' ); // eslint-disable-line max-len
});

test( 'zsteqr: the QL and QR 1x1-deflation exits undo the block scaling (label 80/130 -> 140)', function t() { // eslint-disable-line max-len
	// c = 1e300 > ssfmax, so the block is scaled by ~4.5e-147. d = 0 next to
	// the tiny off-diagonal makes the split threshold 0, but the scaled
	// 1e-20 has E^2 <= SAFMIN, so the iteration deflates the 2x2 block first
	// (M = L+1) and then finishes with a converged 1x1 at L = LEND, whose
	// exit must still reach label 140 and undo the scaling.
	const c = 1.0e300;
	const r5 = Math.sqrt( 5.0 );
	const cases = [
		// QL (|d[2]| >= |d[0]|): rows 0-1 = c*[1 1; 1 0], row 2 = c
		[ [ c, 0.0, c ], [ c, 1.0e-20 ], [ ( 1.0 - r5 ) / 2.0, 1.0, ( 1.0 + r5 ) / 2.0 ] ], // eslint-disable-line max-len
		// QR (|d[2]| < |d[0]|): row 0 = 2c, rows 1-2 = c*[0 1; 1 1]
		[ [ 2.0 * c, 0.0, c ], [ 1.0e-20, c ], [ ( 1.0 - r5 ) / 2.0, ( 1.0 + r5 ) / 2.0, 2.0 ] ] // eslint-disable-line max-len
	];
	const N = 3;
	let WORK, info, d, e, Z, i, k;
	for ( k = 0; k < cases.length; k++ ) {
		d = new Float64Array( cases[ k ][ 0 ] );
		e = new Float64Array( cases[ k ][ 1 ] );
		Z = new Complex128Array( N * N );
		WORK = new Float64Array( 2 * ( N - 1 ) );
		info = zsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
		assert.equal( info, 0, 'info' );
		for ( i = 0; i < N; i++ ) {
			assertClose( d[ i ] / c, cases[ k ][ 2 ][ i ], 1e-14, 'case ' + k + ': d[' + i + ']/c' ); // eslint-disable-line max-len
		}
		assertOrthogonal( reinterpret( Z, 0 ), N, 1e-14, 'case ' + k + ': orthogonality' ); // eslint-disable-line max-len
	}
});

test( 'zsteqr: the QL iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() { // eslint-disable-line max-len
	// anorm = Inf > ssfmax, so DLASCL scales the block by ssfmax/Inf = 0:
	// d = 0, e = [0, NaN, NaN]. Row 0 deflates (e[0] = 0); rows 1-3 never
	// converge and exhaust NMAXIT. Label 140 then rescales by Inf/ssfmax
	// (multiplier Inf), which turns the converged zeros d[0] and e[0] into
	// NaN, so every E entry is nonzero: INFO = 3. Skipping it leaves INFO = 2.
	const N = 4;
	const d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const e = new Float64Array( [ 1.0, Infinity, Infinity ] );
	const Z = new Complex128Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = zsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 3, 'info' );
	assert.ok( Number.isNaN( d[ 0 ] ), 'd[0] rescaled by Inf' );
	assert.ok( Number.isNaN( e[ 0 ] ), 'e[0] rescaled by Inf' );
});

test( 'zsteqr: the QR iteration-limit exit (JTOT = NMAXIT) undoes the block scaling', function t() { // eslint-disable-line max-len
	// anorm = 1e160 > ssfmax, so the block is scaled by ~2.2e-7, and
	// |d[3]| < |d[0]| selects QR. d[1] = 0 makes the deflation threshold for
	// e[1] SAFMIN (scaled |e[1]| ~ 2.2e-147 is above it), while the first
	// rotation has s ~ e[0]/g ~ 1e-250, so s*e[1] underflows and every QR
	// sweep is the identity: the block stalls until JTOT = NMAXIT and INFO = 3.
	// Label 140 must still undo the scaling, returning T at its own scale.
	const origD = [ 1.0e110, 0.0, -1.0e70, 1.0e-120 ];
	const origE = [ 1.0e-90, -1.0e-140, -1.0e160 ];
	const N = 4;
	const d = new Float64Array( origD );
	const e = new Float64Array( origE );
	const Z = new Complex128Array( N * N );
	const WORK = new Float64Array( 2 * ( N - 1 ) );
	const info = zsteqr( 'initialize', N, d, 1, 0, e, 1, 0, Z, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 3, 'info' );
	assertArrayClose( Array.from( d ), origD, 1e-14, 'd' );
	assertArrayClose( Array.from( e ), origE, 1e-14, 'e' );
});
