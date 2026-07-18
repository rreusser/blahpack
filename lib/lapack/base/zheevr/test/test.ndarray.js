
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zheevr from './../lib/ndarray.js';

// FIXTURES //

import v_a_l from './fixtures/v_a_l.json' with { type: 'json' };
import v_a_u from './fixtures/v_a_u.json' with { type: 'json' };
import n_a_l from './fixtures/n_a_l.json' with { type: 'json' };
import v_v_l from './fixtures/v_v_l.json' with { type: 'json' };
import v_i_l from './fixtures/v_i_l.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import v_v_u from './fixtures/v_v_u.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (actual=' + actual.length + ', expected=' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* 4x4 Hermitian matrix (column-major, interleaved re/im):
*   [10+0i   1+0.5i  0-1i   0.5+0i]
*   [1-0.5i  8+0i    0.5-0.5i  0-1i]
*   [0+1i    0.5+0.5i 12+0i  1+0.5i]
*   [0.5+0i  0+1i    1-0.5i  6+0i  ]
*/
function hermMatrix4() {
	return new Complex128Array([
		10, 0,    1, -0.5,   0, 1,     0.5, 0,
		1, 0.5,   8, 0,      0.5, 0.5, 0, 1,
		0, -1,    0.5, -0.5, 12, 0,    1, -0.5,
		0.5, 0,   0, -1,     1, 0.5,   6, 0
	]);
}

/**
* Verify eigenvector property: A*v = lambda*v for each eigenpair.
* A is N x N Hermitian (Complex128Array, column-major), Z is N x M complex, w is real eigenvalues.
* We use the interleaved Float64 view for element access.
*/
function verifyEigenpairs( Aorig, N, w, Z, M, tol, msg ) {
	let Avr, Avi, vr, vi, ar, ai, i, j, k, err, nrm;

	const Av = reinterpret( Aorig, 0 );
	const Zv = reinterpret( Z, 0 );

	for ( k = 0; k < M; k++ ) {
		Avr = new Float64Array( N );
		Avi = new Float64Array( N );
		vr = new Float64Array( N );
		vi = new Float64Array( N );

		// Extract eigenvector k (column k of Z)
		for ( i = 0; i < N; i++ ) {
			vr[ i ] = Zv[ ( i + k * N ) * 2 ];
			vi[ i ] = Zv[ ( i + k * N ) * 2 + 1 ];
		}

		// Compute A*v (complex matrix-vector multiply)
		for ( i = 0; i < N; i++ ) {
			Avr[ i ] = 0.0;
			Avi[ i ] = 0.0;
			for ( j = 0; j < N; j++ ) {
				ar = Av[ ( i + j * N ) * 2 ];
				ai = Av[ ( i + j * N ) * 2 + 1 ];
				// (ar + ai*i) * (vr + vi*i) = (ar*vr - ai*vi) + (ar*vi + ai*vr)*i
				Avr[ i ] += ar * vr[ j ] - ai * vi[ j ];
				Avi[ i ] += ar * vi[ j ] + ai * vr[ j ];
			}
		}

		// Check ||A*v - lambda*v|| / (||v|| * |lambda|) is small
		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( Avr[ i ] - w[ k ] * vr[ i ] ) * ( Avr[ i ] - w[ k ] * vr[ i ] );
			err += ( Avi[ i ] - w[ k ] * vi[ i ] ) * ( Avi[ i ] - w[ k ] * vi[ i ] );
			nrm += vr[ i ] * vr[ i ] + vi[ i ] * vi[ i ];
		}
		err = Math.sqrt( err );
		nrm = Math.sqrt( nrm );
		assert.ok( err / ( nrm * Math.max( Math.abs( w[ k ] ), 1.0 ) ) < tol, msg + ': eigenpair ' + k + ' residual too large (' + err + ')' );
	}
}

function runZheevr( jobz, range, uplo, N, A, vl, vu, il, iu, abstol ) {
	const WORK = new Complex128Array( Math.max( 256, 2 * N + 100 ) );
	const RWORK = new Float64Array( Math.max( 256, 24 * N + 100 ) );
	const IWORK = new Int32Array( Math.max( 256, 10 * N + 100 ) );
	const ISUPPZ = new Int32Array( 2 * N + 10 );
	const w = new Float64Array( N );
	const Z = new Complex128Array( N * Math.max( 1, N ) );
	const out = { M: 0 };

	const info = zheevr( jobz, range, uplo, N, A, 1, N, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, ISUPPZ, 1, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0 );
	return { info: info, M: out.M, w: w, Z: Z, ISUPPZ: ISUPPZ };
}

// TESTS //

test( 'zheevr: JOBZ=V, RANGE=A, UPLO=L', function t() {
	const tc = v_a_l;
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'compute-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-11, 'eigenpairs' );
});

test( 'zheevr: JOBZ=V, RANGE=A, UPLO=U', function t() {
	const tc = v_a_u;
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'compute-vectors', 'all', 'upper', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-11, 'eigenpairs' );
});

test( 'zheevr: JOBZ=N, RANGE=A, UPLO=L (eigenvalues only)', function t() {
	const tc = n_a_l;
	const A = hermMatrix4();
	const r = runZheevr( 'no-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
});

test( 'zheevr: JOBZ=V, RANGE=V, UPLO=L (value range [7, 11])', function t() {
	const tc = v_v_l;
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'compute-vectors', 'value', 'lower', 4, A, 7.0, 11.0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-11, 'eigenpairs' );
});

test( 'zheevr: JOBZ=V, RANGE=I, UPLO=L (index 2..3)', function t() {
	const tc = v_i_l;
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'compute-vectors', 'index', 'lower', 4, A, 0, 0, 2, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-11, 'eigenpairs' );
});

test( 'zheevr: N=0 quick return', function t() {
	const A = new Complex128Array( 1 );
	const r = runZheevr( 'compute-vectors', 'all', 'lower', 0, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'zheevr: N=1', function t() {
	const tc = n1;
	const A = new Complex128Array( [ 5.0, 0.0 ] );
	const r = runZheevr( 'compute-vectors', 'all', 'lower', 1, A, 0, 0, 0, 0, 0 );
	const Zv = reinterpret( r.Z, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertClose( r.w[ 0 ], 5.0, 1e-14, 'w[0]' );
	assertClose( Zv[ 0 ], 1.0, 1e-14, 'Z[0] real' );
	assertClose( Zv[ 1 ], 0.0, 1e-14, 'Z[0] imag' );
});

test( 'zheevr: N=1 valeig in range', function t() {
	const A = new Complex128Array( [ 5.0, 0.0 ] );
	const r = runZheevr( 'compute-vectors', 'value', 'lower', 1, A, 4.0, 6.0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 1 );
	assertClose( r.w[ 0 ], 5.0, 1e-14, 'w[0]' );
});

test( 'zheevr: N=1 valeig out of range', function t() {
	const A = new Complex128Array( [ 5.0, 0.0 ] );
	const r = runZheevr( 'compute-vectors', 'value', 'lower', 1, A, 6.0, 8.0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'zheevr: tiny matrix triggers upscaling', function t() {
	const tiny = 1e-170;
	const Aorig = hermMatrix4();
	const Av = reinterpret( Aorig, 0 );
	// Scale all elements by tiny
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] *= tiny;
	}
	const r = runZheevr( 'compute-vectors', 'all', 'lower', 4, Aorig, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
});

test( 'zheevr: tiny matrix eigenvalues only (dsterf path with scaling)', function t() {
	const tiny = 1e-170;
	const Aorig = hermMatrix4();
	const Av = reinterpret( Aorig, 0 );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] *= tiny;
	}
	const r = runZheevr( 'no-vectors', 'all', 'lower', 4, Aorig, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
});

test( 'zheevr: tiny matrix upper with scaling', function t() {
	const tiny = 1e-170;
	const Aorig = hermMatrix4();
	const Av = reinterpret( Aorig, 0 );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] *= tiny;
	}
	const r = runZheevr( 'compute-vectors', 'all', 'upper', 4, Aorig, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
});

test( 'zheevr: value range with scaling', function t() {
	const tiny = 1e-170;
	const Aorig = hermMatrix4();
	const Av = reinterpret( Aorig, 0 );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] *= tiny;
	}
	const r = runZheevr( 'compute-vectors', 'value', 'lower', 4, Aorig, 7e-170, 11e-170, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.ok( r.M >= 0, 'M should be non-negative' );
});

test( 'zheevr: JOBZ=N, RANGE=V, UPLO=U', function t() {
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'no-vectors', 'value', 'upper', 4, A, 7.0, 11.0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.ok( r.M >= 0, 'M should be non-negative' );
});

test( 'zheevr: JOBZ=N, RANGE=I, UPLO=L', function t() {
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'no-vectors', 'index', 'lower', 4, A, 0, 0, 1, 2, 0 );

	assert.equal( r.info, 0 );
	assert.ok( r.M >= 0, 'M should be non-negative' );
});

test( 'zheevr: JOBZ=V, RANGE=V, UPLO=U', function t() {
	const tc = v_v_u;
	const Aorig = hermMatrix4();
	const A = new Complex128Array( reinterpret( Aorig, 0 ).slice() );
	const r = runZheevr( 'compute-vectors', 'value', 'upper', 4, A, 7.0, 11.0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-11, 'eigenpairs' );
});
