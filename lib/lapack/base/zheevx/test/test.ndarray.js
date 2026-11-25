// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zheevx from './../lib/ndarray.js';
import zheev from './../../zheev/lib/ndarray.js';
import dlamch from './../../dlamch/lib/base.js';
import zsteinReal from './../../zstein/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

// FIXTURES //

import zheevx_4x4_v_a_l from './fixtures/zheevx_4x4_v_a_l.json' with { type: 'json' };
import zheevx_4x4_v_a_u from './fixtures/zheevx_4x4_v_a_u.json' with { type: 'json' };
import zheevx_4x4_n_a_l from './fixtures/zheevx_4x4_n_a_l.json' with { type: 'json' };
import zheevx_4x4_v_v_l from './fixtures/zheevx_4x4_v_v_l.json' with { type: 'json' };
import zheevx_4x4_v_i_l from './fixtures/zheevx_4x4_v_i_l.json' with { type: 'json' };
import zheevx_4x4_n_v_u from './fixtures/zheevx_4x4_n_v_u.json' with { type: 'json' };
import zheevx_1x1_v from './fixtures/zheevx_1x1_v.json' with { type: 'json' };
import zheevx_3x3_diag_i from './fixtures/zheevx_3x3_diag_i.json' with { type: 'json' };
import zheevx_3x3_v_v_u from './fixtures/zheevx_3x3_v_v_u.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verifies A*v = lambda*v for each eigenpair.
* Adata is the original matrix as flat interleaved re/im array (column-major, N x N).
*/
function verifyEigenpairs( N, Adata, uplo, M, w, Z ) {
	let are, aim, vre, vim, wre, wim, lre, lim, err, vnorm, j, r, c;

	const Zv = new Float64Array( Z.buffer );

	// Build full Hermitian matrix from stored triangle
	const fullA = new Float64Array( 2 * N * N );
	for ( c = 0; c < N; c++ ) {
		for ( r = 0; r < N; r++ ) {
			if ( uplo === 'lower' ) {
				if ( r >= c ) {
					fullA[ ( c * N + r ) * 2 ] = Adata[ ( c * N + r ) * 2 ];
					fullA[ ( c * N + r ) * 2 + 1 ] = Adata[ ( c * N + r ) * 2 + 1 ];
					fullA[ ( r * N + c ) * 2 ] = Adata[ ( c * N + r ) * 2 ];
					fullA[ ( r * N + c ) * 2 + 1 ] = -Adata[ ( c * N + r ) * 2 + 1 ];
				}
			} else {
				if ( r <= c ) {
					fullA[ ( c * N + r ) * 2 ] = Adata[ ( c * N + r ) * 2 ];
					fullA[ ( c * N + r ) * 2 + 1 ] = Adata[ ( c * N + r ) * 2 + 1 ];
					fullA[ ( r * N + c ) * 2 ] = Adata[ ( c * N + r ) * 2 ];
					fullA[ ( r * N + c ) * 2 + 1 ] = -Adata[ ( c * N + r ) * 2 + 1 ];
				}
			}
		}
	}

	for ( j = 0; j < M; j++ ) {
		vnorm = 0.0;
		err = 0.0;
		for ( r = 0; r < N; r++ ) {
			wre = 0.0;
			wim = 0.0;
			for ( c = 0; c < N; c++ ) {
				are = fullA[ ( c * N + r ) * 2 ];
				aim = fullA[ ( c * N + r ) * 2 + 1 ];
				vre = Zv[ ( j * N + c ) * 2 ];
				vim = Zv[ ( j * N + c ) * 2 + 1 ];
				wre += are * vre - aim * vim;
				wim += are * vim + aim * vre;
			}
			lre = w[ j ] * Zv[ ( j * N + r ) * 2 ];
			lim = w[ j ] * Zv[ ( j * N + r ) * 2 + 1 ];
			err += ( wre - lre ) * ( wre - lre ) + ( wim - lim ) * ( wim - lim );
			vnorm += Zv[ ( j * N + r ) * 2 ] * Zv[ ( j * N + r ) * 2 ] + Zv[ ( j * N + r ) * 2 + 1 ] * Zv[ ( j * N + r ) * 2 + 1 ];
		}
		err = Math.sqrt( err );
		vnorm = Math.sqrt( vnorm );
		assert.ok( err / Math.max( vnorm * Math.abs( w[ j ] ), 1e-15 ) < 1e-10,
			'eigenpair ' + j + ': ||Av - lv|| / (||v||*|l|) = ' + ( err / ( vnorm * Math.abs( w[ j ] ) ) ) );
	}
}

/**
* Helper to run zheevx with standard workspace allocation.
*/
function runZheevx( jobz, range, uplo, N, Adata, vl, vu, il, iu, abstol ) {
	const m = new Int32Array( 1 );
	let i;

	const LWORK = Math.max( 1, 2 * N + 32 * N );
	const A = new Complex128Array( Math.max( 1, N * N ) );
	const Av = new Float64Array( A.buffer );
	for ( i = 0; i < Adata.length; i++ ) {
		Av[ i ] = Adata[ i ];
	}
	const Z = new Complex128Array( Math.max( 1, N * N ) );
	const w = new Float64Array( Math.max( 1, N ) );
	const WORK = new Complex128Array( Math.max( 1, LWORK ) );
	const RWORK = new Float64Array( Math.max( 1, 7 * N ) );
	const IWORK = new Int32Array( Math.max( 1, 5 * N ) );
	const IFAIL = new Int32Array( Math.max( 1, N ) );

	const info = zheevx( jobz, range, uplo, N, A, 1, N, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );

	return {
		info: info,
		M: m[ 0 ],
		w: w,
		Z: Z,
		IFAIL: IFAIL
	};
}

// TESTS //

test( 'zheevx: 4x4 compute-vectors, all, lower', function t() {
	const tc = zheevx_4x4_v_a_l;
	const Adata = [
		2.0, 0.0, 1.0, 1.0, 0.5, -0.5, 0.0, 0.0,
		0.0, 0.0, 3.0, 0.0, 0.0, 2.0, 1.0, -1.0,
		0.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.5, 0.5,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0
	];
	const result = runZheevx( 'compute-vectors', 'all', 'lower', 4, Adata, 0.0, 0.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
	verifyEigenpairs( 4, Adata, 'lower', result.M, Array.from( result.w ), result.Z );
});

test( 'zheevx: 4x4 compute-vectors, all, upper', function t() {
	const tc = zheevx_4x4_v_a_u;
	const Adata = [
		2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		1.0, -1.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.5, 0.5, 0.0, -2.0, 4.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 1.0, 0.5, -0.5, 5.0, 0.0
	];
	const result = runZheevx( 'compute-vectors', 'all', 'upper', 4, Adata, 0.0, 0.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
	verifyEigenpairs( 4, Adata, 'upper', result.M, Array.from( result.w ), result.Z );
});

test( 'zheevx: 4x4 no-vectors, all, lower', function t() {
	const tc = zheevx_4x4_n_a_l;
	const Adata = [
		2.0, 0.0, 1.0, 1.0, 0.5, -0.5, 0.0, 0.0,
		0.0, 0.0, 3.0, 0.0, 0.0, 2.0, 1.0, -1.0,
		0.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.5, 0.5,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0
	];
	const result = runZheevx( 'no-vectors', 'all', 'lower', 4, Adata, 0.0, 0.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
});

test( 'zheevx: 4x4 compute-vectors, value range [1.5, 4.5], lower', function t() {
	const tc = zheevx_4x4_v_v_l;
	const Adata = [
		2.0, 0.0, 1.0, 1.0, 0.5, -0.5, 0.0, 0.0,
		0.0, 0.0, 3.0, 0.0, 0.0, 2.0, 1.0, -1.0,
		0.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.5, 0.5,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0
	];
	const result = runZheevx( 'compute-vectors', 'value', 'lower', 4, Adata, 1.5, 4.5, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
	verifyEigenpairs( 4, Adata, 'lower', result.M, Array.from( result.w ), result.Z );
});

test( 'zheevx: 4x4 compute-vectors, index range [2,3], lower', function t() {
	const tc = zheevx_4x4_v_i_l;
	const Adata = [
		2.0, 0.0, 1.0, 1.0, 0.5, -0.5, 0.0, 0.0,
		0.0, 0.0, 3.0, 0.0, 0.0, 2.0, 1.0, -1.0,
		0.0, 0.0, 0.0, 0.0, 4.0, 0.0, 0.5, 0.5,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0
	];
	const result = runZheevx( 'compute-vectors', 'index', 'lower', 4, Adata, 0.0, 0.0, 2, 3, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
	verifyEigenpairs( 4, Adata, 'lower', result.M, Array.from( result.w ), result.Z );
});

test( 'zheevx: 4x4 no-vectors, value range [0.0, 3.0], upper', function t() {
	const tc = zheevx_4x4_n_v_u;
	const Adata = [
		2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		1.0, -1.0, 3.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.5, 0.5, 0.0, -2.0, 4.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 1.0, 0.5, -0.5, 5.0, 0.0
	];
	const result = runZheevx( 'no-vectors', 'value', 'upper', 4, Adata, 0.0, 3.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
});

test( 'zheevx: N=1, compute-vectors', function t() {
	const tc = zheevx_1x1_v;
	const Adata = [ 7.5, 0.0 ];
	const result = runZheevx( 'compute-vectors', 'all', 'lower', 1, Adata, 0.0, 0.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-14, 'eigenvalues' );
	const Zv = new Float64Array( result.Z.buffer );
	assertClose( Zv[ 0 ], 1.0, 1e-14, 'Z[0] re' );
	assertClose( Zv[ 1 ], 0.0, 1e-14, 'Z[0] im' );
});

test( 'zheevx: N=0', function t() {
	const result = runZheevx( 'compute-vectors', 'all', 'lower', 0, [], 0.0, 0.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, 0, 'M' );
});

test( 'zheevx: 3x3 diagonal, index range [1,1]', function t() {
	const tc = zheevx_3x3_diag_i;
	const Adata = [
		5.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 2.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 8.0, 0.0
	];
	const result = runZheevx( 'compute-vectors', 'index', 'lower', 3, Adata, 0.0, 0.0, 1, 1, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
	verifyEigenpairs( 3, Adata, 'lower', result.M, Array.from( result.w ), result.Z );
});

test( 'zheevx: 3x3 compute-vectors, value range [2.0, 7.0], upper', function t() {
	const tc = zheevx_3x3_v_v_u;
	const Adata = [
		4.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		1.0, 2.0, 5.0, 0.0, 0.0, 0.0,
		0.0, -1.0, 2.0, 0.0, 6.0, 0.0
	];
	const result = runZheevx( 'compute-vectors', 'value', 'upper', 3, Adata, 2.0, 7.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, tc.M, 'M' );
	assertArrayClose( Array.from( result.w ).slice( 0, result.M ), tc.w, 1e-10, 'eigenvalues' );
	verifyEigenpairs( 3, Adata, 'upper', result.M, Array.from( result.w ), result.Z );
});

test( 'zheevx: N=1, value range excludes eigenvalue', function t() {
	const Adata = [ 7.5, 0.0 ];
	const result = runZheevx( 'compute-vectors', 'value', 'lower', 1, Adata, 0.0, 5.0, 0, 0, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, 0, 'M = 0 when eigenvalue outside range' );
});

test( 'zheevx: N=1, index range', function t() {
	const Adata = [ 3.0, 0.0 ];
	const result = runZheevx( 'compute-vectors', 'index', 'lower', 1, Adata, 0.0, 0.0, 1, 1, 0.0 );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.M, 1, 'M' );
	assertClose( result.w[ 0 ], 3.0, 1e-14, 'eigenvalue' );
});

// FUNCTIONS (ADDITIONAL CHECKS) //

/**
* Returns the eigenvalues (ascending) of a dense Hermitian matrix computed independently by zheev.
*
* @private
* @param {Float64Array} Ad - dense Hermitian matrix (interleaved, column-major, N-by-N)
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} eigenvalues
*/
function denseEigenvalues( Ad, N ) {
	const A = new Complex128Array( Ad );
	const w = new Float64Array( N );
	const info = zheev( 'no-vectors', 'upper', N, A, 1, N, 0, w, 1, 0, new Complex128Array( 64 * N ), 1, 0, new Float64Array( 3 * N ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'zheev info' );
	return w;
}

/**
* Returns the max-modulus entry of an interleaved complex array.
*
* @private
* @param {Float64Array} Av - interleaved array
* @returns {number} max modulus
*/
function maxAbs( Av ) {
	let mx = 0.0;
	let i;
	for ( i = 0; i < Av.length; i += 2 ) {
		mx = Math.max( mx, Math.sqrt( ( Av[ i ] * Av[ i ] ) + ( Av[ i + 1 ] * Av[ i + 1 ] ) ) ); // eslint-disable-line max-len
	}
	return mx;
}

/**
* Asserts ||A z_k - w_k z_k|| <= 1e-12 * N * ||A|| and Z^H Z = I for the first M columns.
*
* @private
* @param {Float64Array} Ad - dense Hermitian matrix (interleaved, column-major)
* @param {NonNegativeInteger} N - order
* @param {Float64Array} w - eigenvalues
* @param {Float64Array} Zv - eigenvectors (interleaved, column-major, LDZ = N)
* @param {NonNegativeInteger} M - number of eigenpairs
* @param {string} msg - message prefix
*/
function assertResidualOrtho( Ad, N, w, Zv, M, msg ) {
	const anrm = maxAbs( Ad ) * N;
	let sr, si, ar, ai, zr, zi, err, dr, di, i, j, k;
	for ( k = 0; k < M; k++ ) {
		err = 0.0;
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( j = 0; j < N; j++ ) {
				ar = Ad[ 2 * ( i + ( j * N ) ) ];
				ai = Ad[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
				zr = Zv[ 2 * ( j + ( k * N ) ) ];
				zi = Zv[ ( 2 * ( j + ( k * N ) ) ) + 1 ];
				sr += ( ar * zr ) - ( ai * zi );
				si += ( ar * zi ) + ( ai * zr );
			}
			sr -= w[ k ] * Zv[ 2 * ( i + ( k * N ) ) ];
			si -= w[ k ] * Zv[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
			err += ( sr * sr ) + ( si * si );
		}
		assert.ok( Math.sqrt( err ) <= 1e-12 * N * anrm, msg + ': residual ' + k + ' = ' + Math.sqrt( err ) ); // eslint-disable-line max-len
		for ( j = 0; j <= k; j++ ) {
			dr = 0.0;
			di = 0.0;
			for ( i = 0; i < N; i++ ) {
				ar = Zv[ 2 * ( i + ( j * N ) ) ];
				ai = Zv[ ( 2 * ( i + ( j * N ) ) ) + 1 ];
				zr = Zv[ 2 * ( i + ( k * N ) ) ];
				zi = Zv[ ( 2 * ( i + ( k * N ) ) ) + 1 ];
				dr += ( ar * zr ) + ( ai * zi );
				di += ( ar * zi ) - ( ai * zr );
			}
			assert.ok( Math.abs( dr - ( ( j === k ) ? 1.0 : 0.0 ) ) <= 1e-12 * N && Math.abs( di ) <= 1e-12 * N, msg + ': orthonormality (' + j + ',' + k + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Returns a scaled copy of a complex array.
*
* @private
* @param {Complex128Array} x - array
* @param {number} alpha - real scalar
* @returns {Complex128Array} scaled copy
*/
function scaled( x, alpha ) {
	const xv = reinterpret( x, 0 );
	const out = new Float64Array( xv.length );
	let i;
	for ( i = 0; i < xv.length; i++ ) {
		out[ i ] = xv[ i ] * alpha;
	}
	return new Complex128Array( out.buffer );
}

/**
* Returns the scaling factor the expert drivers apply to a matrix with max-modulus entry `anrm`.
*
* @private
* @param {number} anrm - max-modulus entry
* @returns {number} sigma
*/
function scaleFactor( anrm ) {
	const safmin = dlamch( 'safe-minimum' );
	const smlnum = safmin / dlamch( 'precision' ); // SMLNUM = DLAMCH('S') / DLAMCH('P') in the reference
	const rmin = Math.sqrt( smlnum );
	const rmax = Math.min( Math.sqrt( 1.0 / smlnum ), 1.0 / Math.sqrt( Math.sqrt( safmin ) ) ); // eslint-disable-line max-len
	if ( anrm < rmin ) {
		return rmin / anrm;
	}
	if ( anrm > rmax ) {
		return rmax / anrm;
	}
	return 1.0;
}

/**
* Returns the full (both triangles) dense 4x4 Hermitian test matrix (interleaved, column-major).
*
* @private
* @returns {Float64Array} dense matrix
*/
function dense4() {
	return new Float64Array([
		2.0, 0.0, 1.0, 1.0, 0.5, -0.5, 0.0, 0.0,
		1.0, -1.0, 3.0, 0.0, 0.0, 2.0, 1.0, -1.0,
		0.5, 0.5, 0.0, -2.0, 4.0, 0.0, 0.5, 0.5,
		0.0, 0.0, 1.0, 1.0, 0.5, -0.5, 5.0, 0.0
	]);
}

/**
* Returns a dense 4x4 Hermitian block-diagonal matrix [[5,-i],[i,5]] (eigenvalues 4, 6) and [[0,1],[1,0]] (eigenvalues -1, 1), whose tridiagonal form splits.
*
* @private
* @returns {Float64Array} dense matrix
*/
function denseSplit() {
	return new Float64Array([
		5.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
		0.0, -1.0, 5.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0
	]);
}

/**
* Calls an implementation (ndarray or base) with ample workspace on a dense matrix.
*
* @private
* @param {Function} fn - implementation
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {Float64Array} Ad - dense matrix (interleaved, copied)
* @param {number} vl - lower bound
* @param {number} vu - upper bound
* @param {integer} il - lower index
* @param {integer} iu - upper index
* @param {number} abstol - tolerance
* @returns {Object} results
*/
function runDense( fn, jobz, range, uplo, N, Ad, vl, vu, il, iu, abstol ) {
	const m = new Int32Array( 1 );
	const w = new Float64Array( N );
	const Z = new Complex128Array( N * N );
	const IFAIL = new Int32Array( N );
	const info = fn( jobz, range, uplo, N, new Complex128Array( Ad ), 1, N, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, new Complex128Array( 34 * N ), 1, 0, new Float64Array( 7 * N ), 1, 0, new Int32Array( 5 * N ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': m[ 0 ],
		'w': w,
		'Zv': reinterpret( Z, 0 ),
		'IFAIL': IFAIL
	};
}

test( 'zheevx: N=1, value range includes eigenvalue', function t() {
	const r = runDense( zheevx, 'compute-vectors', 'value', 'upper', 1, new Float64Array( [ 3.0, 0.0 ] ), 2.0, 3.0, 0, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.equal( r.M, 1 );
	assert.equal( r.w[ 0 ], 3.0 );
	assert.equal( r.Zv[ 0 ], 1.0 );
	assert.equal( r.Zv[ 1 ], 0.0 );
});

test( 'zheevx: tiny-norm matrix (1e-160) is scaled; V, V, L with abstol > 0', function t() {
	const Ad = scaled( new Complex128Array( dense4() ), 1e-160 );
	const Adv = reinterpret( Ad, 0 );
	const ref = denseEigenvalues( dense4(), 4 );
	const expected = [];
	let i;
	for ( i = 0; i < 4; i++ ) {
		if ( ref[ i ] > 2.0 && ref[ i ] <= 5.0 ) {
			expected.push( ref[ i ] * 1e-160 );
		}
	}
	const r = runDense( zheevx, 'compute-vectors', 'value', 'lower', 4, Adv, 2e-160, 5e-160, 0, 0, 1e-175 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
	assert.ok( expected.length > 0 && expected.length < 4, 'range is selective' );
	assert.equal( r.M, expected.length );
	for ( i = 0; i < r.M; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - expected[ i ] ) <= 1e-12 * 8e-160, 'w[' + i + ']' ); // eslint-disable-line max-len
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( Adv, 4, r.w, r.Zv, r.M, 'tiny' );
});

test( 'zheevx: huge-norm matrix (1e100) is scaled; V, I, U (2..3)', function t() {
	const Adv = reinterpret( scaled( new Complex128Array( dense4() ), 1e100 ), 0 ); // eslint-disable-line max-len
	const ref = denseEigenvalues( Adv, 4 );
	const r = runDense( zheevx, 'compute-vectors', 'index', 'upper', 4, Adv, 0.0, 0.0, 2, 3, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 2 );
	for ( i = 0; i < 2; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i + 1 ] ) <= 1e-12 * 8e100, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Adv, 4, r.w, r.Zv, r.M, 'huge' );
});

test( 'zheevx: huge-norm matrix (1e100), V, A, L fast path rescales all eigenvalues', function t() {
	const Adv = reinterpret( scaled( new Complex128Array( dense4() ), 1e100 ), 0 ); // eslint-disable-line max-len
	const ref = denseEigenvalues( Adv, 4 );
	const r = runDense( zheevx, 'compute-vectors', 'all', 'lower', 4, Adv, 0.0, 0.0, 0, 0, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assert.ok( Math.abs( r.w[ i ] - ref[ i ] ) <= 1e-12 * 8e100, 'w[' + i + ']' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( Adv, 4, r.w, r.Zv, r.M, 'huge all' );
});

test( 'zheevx: split matrix with abstol > 0 (bisection, block order) sorts eigenpairs ascending', function t() {
	const r = runDense( zheevx, 'compute-vectors', 'all', 'lower', 4, denseSplit(), 0.0, 0.0, 0, 0, 1e-14 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( denseSplit(), 4, r.w, r.Zv, r.M, 'split' );
});

test( 'zheevx: when zsteqr fails, falls back to bisection + inverse iteration', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zsteqr/lib/base.js': function failingZsteqr() {
			return 1;
		}
	});
	const ref = denseEigenvalues( dense4(), 4 );
	const r = runDense( mod.default, 'compute-vectors', 'all', 'upper', 4, dense4(), 0.0, 0.0, 0, 0, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( r.IFAIL[ i ], 0 );
	}
	assertResidualOrtho( dense4(), 4, r.w, r.Zv, 4, 'zsteqr fallback' );
});

test( 'zheevx: when dsterf fails, falls back to bisection (no vectors)', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../dsterf/lib/base.js': function failingDsterf() {
			return 2;
		}
	});
	const ref = denseEigenvalues( dense4(), 4 );
	const r = runDense( mod.default, 'no-vectors', 'index', 'lower', 4, dense4(), 0.0, 0.0, 1, 4, 0.0 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], ref[ i ], 1e-13, 'w[' + i + ']' );
	}
});

test( 'zheevx: zstein failure on a scaled matrix returns its info and rescales only w[0..info-2]', async function t() {
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zstein/lib/base.js': function failingZstein() {
			const args = Array.prototype.slice.call( arguments );
			zsteinReal.apply( null, args );
			args[ 27 ][ args[ 29 ] + ( 2 * args[ 28 ] ) ] = 3;
			return 3;
		}
	});
	const ref = denseEigenvalues( dense4(), 4 );
	const anrm = maxAbs( dense4() ) * 1e-160;
	const sigma = scaleFactor( anrm );
	const Adv = reinterpret( scaled( new Complex128Array( dense4() ), 1e-160 ), 0 ); // eslint-disable-line max-len
	const r = runDense( mod.default, 'compute-vectors', 'all', 'upper', 4, Adv, 0.0, 0.0, 0, 0, 1e-175 ); // eslint-disable-line max-len
	let i;
	assert.equal( r.info, 3 );
	assert.equal( r.M, 4 );
	assert.ok( sigma > 1.0, 'matrix is scaled' );

	// imax = info - 1 = 2: only w[0], w[1] are rescaled.
	for ( i = 0; i < 2; i++ ) {
		assertClose( r.w[ i ] / 1e-160, ref[ i ], 1e-12, 'w[' + i + '] rescaled' );
	}
	for ( i = 2; i < 4; i++ ) {
		assertClose( r.w[ i ] / ( sigma * 1e-160 ), ref[ i ], 1e-12, 'w[' + i + '] not rescaled' ); // eslint-disable-line max-len
	}
	assert.equal( r.IFAIL[ 2 ], 3 );
});

test( 'zheevx: zstein failure on a split matrix permutes IFAIL along with the eigenvalues', async function t() {
	const pre = [];
	const mod = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../zstein/lib/base.js': function failingZstein() {
			const args = Array.prototype.slice.call( arguments );
			let k;
			zsteinReal.apply( null, args );
			for ( k = 0; k < args[ 7 ]; k++ ) {
				pre.push( args[ 8 ][ args[ 10 ] + ( k * args[ 9 ] ) ] );
				args[ 27 ][ args[ 29 ] + ( k * args[ 28 ] ) ] = 10 + k;
			}
			return 4;
		}
	});
	const r = runDense( mod.default, 'compute-vectors', 'all', 'lower', 4, denseSplit(), 0.0, 0.0, 0, 0, 1e-14 ); // eslint-disable-line max-len
	const expected = [ -1.0, 1.0, 4.0, 6.0 ];
	let i;
	assert.equal( r.info, 4 );
	assert.equal( r.M, 4 );
	assert.notDeepEqual( pre, expected, 'block order differs from ascending order' );
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], expected[ i ], 1e-13, 'w[' + i + ']' );
		assert.equal( pre[ r.IFAIL[ i ] - 10 ], r.w[ i ], 'IFAIL[' + i + '] follows its eigenvalue' ); // eslint-disable-line max-len
	}
	assertResidualOrtho( denseSplit(), 4, r.w, r.Zv, 4, 'split zstein failure' );
});
