
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyevx from './../lib/ndarray.js';
import dscal from '../../../blas/dscal/lib/base.js';
import { importWithDependencies } from '../../../../test/harness/constants.js';

// FIXTURES //

import dsyevx_4x4_v_a_l from './fixtures/dsyevx_4x4_v_a_l.json' with { type: 'json' };
import dsyevx_4x4_v_a_u from './fixtures/dsyevx_4x4_v_a_u.json' with { type: 'json' };
import dsyevx_4x4_n_a_l from './fixtures/dsyevx_4x4_n_a_l.json' with { type: 'json' };
import dsyevx_4x4_v_v_l from './fixtures/dsyevx_4x4_v_v_l.json' with { type: 'json' };
import dsyevx_4x4_v_i_l from './fixtures/dsyevx_4x4_v_i_l.json' with { type: 'json' };
import dsyevx_4x4_n_v_u from './fixtures/dsyevx_4x4_n_v_u.json' with { type: 'json' };
import dsyevx_1x1_v_a from './fixtures/dsyevx_1x1_v_a.json' with { type: 'json' };
import dsyevx_1x1_v_v_excluded from './fixtures/dsyevx_1x1_v_v_excluded.json' with { type: 'json' };
import dsyevx_1x1_v_v_included from './fixtures/dsyevx_1x1_v_v_included.json' with { type: 'json' };
import dsyevx_1x1_n_i from './fixtures/dsyevx_1x1_n_i.json' with { type: 'json' };
import dsyevx_4x4_n_i_u_fast from './fixtures/dsyevx_4x4_n_i_u_fast.json' with { type: 'json' };
import dsyevx_4x4_v_i_u_fast from './fixtures/dsyevx_4x4_v_i_u_fast.json' with { type: 'json' };

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
* 4x4 diagonally dominant symmetric matrix (column-major):
*   [ 4  1 -2  0 ]
*   [ 1  3  0  1 ]
*   [-2  0  5 -1 ]
*   [ 0  1 -1  6 ]
*/
function symMatrix4() {
	return new Float64Array([
		4, 1, -2, 0,
		1, 3, 0, 1,
		-2, 0, 5, -1,
		0, 1, -1, 6
	]);
}

/**
* Verify eigenvector property: A*v = lambda*v for each eigenpair.
* A is N x N (column-major), Z is N x M (column-major), w is eigenvalues.
*/
function verifyEigenpairs( Aorig, N, w, Z, M, tol, msg ) {
	let Av, v, i, j, k, err, nrm;

	for ( k = 0; k < M; k++ ) {
		Av = new Float64Array( N );
		v = new Float64Array( N );

		// Extract eigenvector k (column k of Z)
		for ( i = 0; i < N; i++ ) {
			v[ i ] = Z[ i + k * N ];
		}

		// Compute Av = A * v
		for ( i = 0; i < N; i++ ) {
			Av[ i ] = 0.0;
			for ( j = 0; j < N; j++ ) {
				Av[ i ] += Aorig[ i + j * N ] * v[ j ];
			}
		}

		// Check Av - lambda*v is small
		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( Av[ i ] - w[ k ] * v[ i ] ) * ( Av[ i ] - w[ k ] * v[ i ] );
			nrm += v[ i ] * v[ i ];
		}
		err = Math.sqrt( err );
		nrm = Math.sqrt( nrm );
		assert.ok( err / ( nrm * Math.max( Math.abs( w[ k ] ), 1.0 ) ) < tol, msg + ': eigenpair ' + k + ' residual too large (' + err + ')' );
	}
}

function runDsyevx( jobz, range, uplo, N, A, vl, vu, il, iu, abstol ) {
	const m = new Int32Array( 1 );
	const WORK = new Float64Array( Math.max( 256, 8 * N + 100 ) );
	const IWORK = new Int32Array( 5 * N + 10 );
	const IFAIL = new Int32Array( N + 1 );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );

	const info = dsyevx( jobz, range, uplo, N, A, 1, N, 0, vl, vu, il, iu, abstol, m, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 );
	return { info: info, M: m[ 0 ], w: w, Z: Z, IFAIL: IFAIL };
}

// TESTS //

test( 'dsyevx: V, A, L, 4x4', function t() {
	const tc = dsyevx_4x4_v_a_l;
	const Aorig = symMatrix4();
	const A = new Float64Array( Aorig );
	const r = runDsyevx( 'compute-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: V, A, U, 4x4', function t() {
	const tc = dsyevx_4x4_v_a_u;
	const Aorig = symMatrix4();
	const A = new Float64Array( Aorig );
	const r = runDsyevx( 'compute-vectors', 'all', 'upper', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: N, A, L, 4x4', function t() {
	const tc = dsyevx_4x4_n_a_l;
	const A = symMatrix4();
	const r = runDsyevx( 'no-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsyevx: V, V, L, 4x4 (value range [2.5, 5.5])', function t() {
	const tc = dsyevx_4x4_v_v_l;
	const Aorig = symMatrix4();
	const A = new Float64Array( Aorig );
	const r = runDsyevx( 'compute-vectors', 'value', 'lower', 4, A, 2.5, 5.5, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: V, I, L, 4x4 (index range 2..3)', function t() {
	const tc = dsyevx_4x4_v_i_l;
	const Aorig = symMatrix4();
	const A = new Float64Array( Aorig );
	const r = runDsyevx( 'compute-vectors', 'index', 'lower', 4, A, 0, 0, 2, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: N, V, U, 4x4 (value range [0, 4])', function t() {
	const tc = dsyevx_4x4_n_v_u;
	const A = symMatrix4();
	const r = runDsyevx( 'no-vectors', 'value', 'upper', 4, A, 0, 4, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsyevx: N=1, V, A', function t() {
	const tc = dsyevx_1x1_v_a;
	const A = new Float64Array([ 7.5 ]);
	const r = runDsyevx( 'compute-vectors', 'all', 'lower', 1, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
	assertClose( r.Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dsyevx: N=0', function t() {
	const A = new Float64Array( 1 );
	const r = runDsyevx( 'compute-vectors', 'all', 'lower', 0, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsyevx: N=1, V, V, excluded', function t() {
	const tc = dsyevx_1x1_v_v_excluded;
	const A = new Float64Array([ 7.5 ]);
	const r = runDsyevx( 'compute-vectors', 'value', 'lower', 1, A, 0, 5, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'dsyevx: N=1, V, V, included', function t() {
	const tc = dsyevx_1x1_v_v_included;
	const A = new Float64Array([ 7.5 ]);
	const r = runDsyevx( 'compute-vectors', 'value', 'lower', 1, A, 5, 10, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
	assertClose( r.Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dsyevx: N=1, N, I', function t() {
	const tc = dsyevx_1x1_n_i;
	const A = new Float64Array([ 3.0 ]);
	const r = runDsyevx( 'no-vectors', 'index', 'upper', 1, A, 0, 0, 1, 1, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
});

test( 'dsyevx: N, I, U, fast path (il=1, iu=N)', function t() {
	const tc = dsyevx_4x4_n_i_u_fast;
	const A = symMatrix4();
	const r = runDsyevx( 'no-vectors', 'index', 'upper', 4, A, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsyevx: V, A, L, 4x4 - scaled (tiny matrix)', function t() {
	// Matrix with very small entries to trigger iscale=1 (anrm < rmin)
	const scale = 1e-160;
	const Aorig = symMatrix4();
	const A = new Float64Array( 16 );
	let i;
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = Aorig[ i ] * scale;
	}
	const r = runDsyevx( 'compute-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	// Eigenvalues should be scale * original eigenvalues
	const tc = dsyevx_4x4_v_a_l;
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], tc.w[ i ] * scale, 1e-10, 'w[' + i + ']' );
	}
});

test( 'dsyevx: V, A, U, 4x4 - scaled (large matrix)', function t() {
	// Matrix with very large entries to trigger iscale=1 (anrm > rmax)
	const scale = 1e155;
	const Aorig = symMatrix4();
	const A = new Float64Array( 16 );
	let i;
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = Aorig[ i ] * scale;
	}
	const r = runDsyevx( 'compute-vectors', 'all', 'upper', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	const tc = dsyevx_4x4_v_a_u;
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], tc.w[ i ] * scale, 1e-10, 'w[' + i + ']' );
	}
});

test( 'dsyevx: V, V, L, scaled (value range)', function t() {
	// Tiny matrix with value range to exercise iscale + valeig path
	const scale = 1e-160;
	const Aorig = symMatrix4();
	const A = new Float64Array( 16 );
	let i;
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = Aorig[ i ] * scale;
	}
	const r = runDsyevx( 'compute-vectors', 'value', 'lower', 4, A, 2.5 * scale, 5.5 * scale, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.ok( r.M >= 1, 'should find at least one eigenvalue' );
});

test( 'dsyevx: V, I, U, fast path (il=1, iu=N)', function t() {
	const tc = dsyevx_4x4_v_i_u_fast;
	const Aorig = symMatrix4();
	const A = new Float64Array( Aorig );
	const r = runDsyevx( 'compute-vectors', 'index', 'upper', 4, A, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

// Ticket 0089 //

// Reference thresholds (data/lapack-3.12.0/SRC/dsyevx.f): SAFMIN = DLAMCH( 'S' ) = 2^-1022 and EPS = DLAMCH( 'P' ) = 2^-52 give SMLNUM = 2^-970 and RMIN = SQRT( SMLNUM ) = 2^-485. With DLAMCH( 'E' ) = 2^-53 RMIN would be 2^-484.5. ( RMAX = MIN( SQRT( BIGNUM ), 1/SQRT( SQRT( SAFMIN ) ) ) = 2^255.5 does not depend on EPS. )
const RMIN_P = Math.pow( 2.0, -485 );

/**
* Runs dsyevx on T = s * tridiag( 1, 2, 1 ) stored as a full 3x3 matrix (lower), through a module whose scaling dependencies are spied on.
*
* @private
* @param {Function} mod - dsyevx base implementation
* @param {number} s - scale of the matrix ( max|T| = 2s )
* @returns {Object} info and eigenvalues
*/
function run( mod, s ) {
	const A = new Float64Array( [ 2.0 * s, s, 0.0, s, 2.0 * s, s, 0.0, s, 2.0 * s ] );
	const m = new Int32Array( 1 );
	const w = new Float64Array( 3 );
	const info = mod( 'compute-vectors', 'all', 'lower', 3, A, 1, 3, 0, 0.0, 0.0, 0, 0, 0.0, m, w, 1, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 100 ), 1, 0, new Int32Array( 50 ), 1, 0, new Int32Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( m[ 0 ], 3, 'm' );
	return { 'info': info, 'w': w };
}

/**
* Asserts that `w` holds the eigenvalues of s * tridiag( 1, 2, 1 ), i.e. s * ( 2 - sqrt(2) ), 2s, s * ( 2 + sqrt(2) ).
*
* @private
* @param {Float64Array} w - computed eigenvalues
* @param {number} s - scale
* @param {string} msg - message
*/
function assertSpectrum( w, s, msg ) {
	const ref = [ s * ( 2.0 - Math.SQRT2 ), 2.0 * s, s * ( 2.0 + Math.SQRT2 ) ];
	let i;
	for ( i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( w[ i ] - ref[ i ] ) <= 1e-13 * ref[ i ], msg + ': w[' + i + '] expected ' + ref[ i ] + ', got ' + w[ i ] ); // eslint-disable-line max-len
	}
}

test( 'dsyevx: matrix norm between the DLAMCH(P) and DLAMCH(E) RMIN thresholds is not rescaled (ticket 0089)', async function t() {
	const calls = [];
	const mod = ( await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'../../../blas/dscal/lib/base.js': function spyDscal() {
			calls.push( 'dscal' );
			return dscal.apply( null, arguments );
		}
	}) ).default;
	let out;
	let s;

	// Control: max|T| = 0.5 * RMIN_P is below both thresholds, so the matrix is rescaled.
	s = 0.25 * RMIN_P;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (control)' );
	assert.ok( calls.length > 0, 'rescaled (control)' );
	assertSpectrum( out.w, s, 'control' );

	// max|T| = 1.2 * RMIN_P lies in ( RMIN_P, RMIN_E ) = ( 1, 1.414 ) * RMIN_P: no rescaling.
	s = 0.6 * RMIN_P;
	calls.length = 0;
	out = run( mod, s );
	assert.equal( out.info, 0, 'info (below RMIN_E)' );
	assert.deepEqual( calls, [], 'not rescaled (below RMIN_E)' );
	assertSpectrum( out.w, s, 'below RMIN_E' );
});

test( 'dsyevx: N=1 needs only the reference LWKMIN = 1 elements of WORK, and the declared 5*N of IWORK (ticket 0107)', function t() {
	const m = new Int32Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const IFAIL = new Int32Array( 1 );
	const info = dsyevx( 'compute-vectors', 'all', 'lower', 1, new Float64Array( [ 7.5 ] ), 1, 1, 0, 0, 0, 0, 0, 0, m, w, 1, 0, Z, 1, 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 5 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( m[ 0 ], 1 );
	assert.equal( w[ 0 ], 7.5 );
	assert.equal( Z[ 0 ], 1.0 );
	assert.throws( function bad() {
		dsyevx( 'compute-vectors', 'all', 'lower', 1, new Float64Array( [ 7.5 ] ), 1, 1, 0, 0, 0, 0, 0, 0, m, w, 1, 0, Z, 1, 1, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 5 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function bad() {
		dsyevx( 'compute-vectors', 'all', 'lower', 1, new Float64Array( [ 7.5 ] ), 1, 1, 0, 0, 0, 0, 0, 0, m, w, 1, 0, Z, 1, 1, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 4 ), 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	}, /IWORK array must have at least 5 elements/ );
});

test( 'dsyevx: IWORK shorter than the declared 5*N throws when N > 1', function t() {
	const N = 4;
	assert.throws( function bad() {
		dsyevx( 'compute-vectors', 'all', 'lower', N, symMatrix4(), 1, N, 0, 0, 0, 0, 0, 0, new Int32Array( 1 ), new Float64Array( N ), 1, 0, new Float64Array( N * N ), 1, N, 0, new Float64Array( 8 * N ), 1, 0, new Int32Array( ( 5 * N ) - 1 ), 1, 0, new Int32Array( N ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
