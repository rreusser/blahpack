// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zheevx from './../lib/ndarray.js';

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
	const out = { M: 0 };

	const info = zheevx( jobz, range, uplo, N,
		A, 1, N, 0,
		vl, vu, il, iu, abstol,
		out, w, 1, 0,
		Z, 1, N, 0,
		WORK, 1, 0,
		RWORK, 1, 0,
		IWORK, 1, 0,
		IFAIL, 1, 0
	);

	return {
		info: info,
		M: out.M,
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
