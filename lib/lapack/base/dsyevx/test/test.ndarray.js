
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyevx from './../lib/ndarray.js';

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
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
	var Av;
	var v;
	var i;
	var j;
	var k;
	var err;
	var nrm;

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
	var WORK = new Float64Array( Math.max( 256, 8 * N + 100 ) );
	var IWORK = new Int32Array( 5 * N + 10 );
	var IFAIL = new Int32Array( N + 1 );
	var w = new Float64Array( N );
	var Z = new Float64Array( N * N );
	var out = { M: 0 };

	var info = dsyevx( jobz, range, uplo, N, A, 1, N, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, WORK.length, IWORK, 1, 0, IFAIL, 1, 0 );
	return { info: info, M: out.M, w: w, Z: Z, IFAIL: IFAIL };
}

// TESTS //

test( 'dsyevx: V, A, L, 4x4', function t() {
	var tc = dsyevx_4x4_v_a_l;
	var Aorig = symMatrix4();
	var A = new Float64Array( Aorig );
	var r = runDsyevx( 'compute-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: V, A, U, 4x4', function t() {
	var tc = dsyevx_4x4_v_a_u;
	var Aorig = symMatrix4();
	var A = new Float64Array( Aorig );
	var r = runDsyevx( 'compute-vectors', 'all', 'upper', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: N, A, L, 4x4', function t() {
	var tc = dsyevx_4x4_n_a_l;
	var A = symMatrix4();
	var r = runDsyevx( 'no-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsyevx: V, V, L, 4x4 (value range [2.5, 5.5])', function t() {
	var tc = dsyevx_4x4_v_v_l;
	var Aorig = symMatrix4();
	var A = new Float64Array( Aorig );
	var r = runDsyevx( 'compute-vectors', 'value', 'lower', 4, A, 2.5, 5.5, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: V, I, L, 4x4 (index range 2..3)', function t() {
	var tc = dsyevx_4x4_v_i_l;
	var Aorig = symMatrix4();
	var A = new Float64Array( Aorig );
	var r = runDsyevx( 'compute-vectors', 'index', 'lower', 4, A, 0, 0, 2, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});

test( 'dsyevx: N, V, U, 4x4 (value range [0, 4])', function t() {
	var tc = dsyevx_4x4_n_v_u;
	var A = symMatrix4();
	var r = runDsyevx( 'no-vectors', 'value', 'upper', 4, A, 0, 4, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsyevx: N=1, V, A', function t() {
	var tc = dsyevx_1x1_v_a;
	var A = new Float64Array([ 7.5 ]);
	var r = runDsyevx( 'compute-vectors', 'all', 'lower', 1, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
	assertClose( r.Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dsyevx: N=0', function t() {
	var A = new Float64Array( 1 );
	var r = runDsyevx( 'compute-vectors', 'all', 'lower', 0, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsyevx: N=1, V, V, excluded', function t() {
	var tc = dsyevx_1x1_v_v_excluded;
	var A = new Float64Array([ 7.5 ]);
	var r = runDsyevx( 'compute-vectors', 'value', 'lower', 1, A, 0, 5, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
});

test( 'dsyevx: N=1, V, V, included', function t() {
	var tc = dsyevx_1x1_v_v_included;
	var A = new Float64Array([ 7.5 ]);
	var r = runDsyevx( 'compute-vectors', 'value', 'lower', 1, A, 5, 10, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
	assertClose( r.Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dsyevx: N=1, N, I', function t() {
	var tc = dsyevx_1x1_n_i;
	var A = new Float64Array([ 3.0 ]);
	var r = runDsyevx( 'no-vectors', 'index', 'upper', 1, A, 0, 0, 1, 1, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-14, 'w' );
});

test( 'dsyevx: N, I, U, fast path (il=1, iu=N)', function t() {
	var tc = dsyevx_4x4_n_i_u_fast;
	var A = symMatrix4();
	var r = runDsyevx( 'no-vectors', 'index', 'upper', 4, A, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsyevx: V, A, L, 4x4 - scaled (tiny matrix)', function t() {
	// Matrix with very small entries to trigger iscale=1 (anrm < rmin)
	var scale = 1e-160;
	var Aorig = symMatrix4();
	var A = new Float64Array( 16 );
	var i;
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = Aorig[ i ] * scale;
	}
	var r = runDsyevx( 'compute-vectors', 'all', 'lower', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	// Eigenvalues should be scale * original eigenvalues
	var tc = dsyevx_4x4_v_a_l;
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], tc.w[ i ] * scale, 1e-10, 'w[' + i + ']' );
	}
});

test( 'dsyevx: V, A, U, 4x4 - scaled (large matrix)', function t() {
	// Matrix with very large entries to trigger iscale=1 (anrm > rmax)
	var scale = 1e155;
	var Aorig = symMatrix4();
	var A = new Float64Array( 16 );
	var i;
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = Aorig[ i ] * scale;
	}
	var r = runDsyevx( 'compute-vectors', 'all', 'upper', 4, A, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 4 );
	var tc = dsyevx_4x4_v_a_u;
	for ( i = 0; i < 4; i++ ) {
		assertClose( r.w[ i ], tc.w[ i ] * scale, 1e-10, 'w[' + i + ']' );
	}
});

test( 'dsyevx: V, V, L, scaled (value range)', function t() {
	// Tiny matrix with value range to exercise iscale + valeig path
	var scale = 1e-160;
	var Aorig = symMatrix4();
	var A = new Float64Array( 16 );
	var i;
	for ( i = 0; i < 16; i++ ) {
		A[ i ] = Aorig[ i ] * scale;
	}
	var r = runDsyevx( 'compute-vectors', 'value', 'lower', 4, A, 2.5 * scale, 5.5 * scale, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.ok( r.M >= 1, 'should find at least one eigenvalue' );
});

test( 'dsyevx: V, I, U, fast path (il=1, iu=N)', function t() {
	var tc = dsyevx_4x4_v_i_u_fast;
	var Aorig = symMatrix4();
	var A = new Float64Array( Aorig );
	var r = runDsyevx( 'compute-vectors', 'index', 'upper', 4, A, 0, 0, 1, 4, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyEigenpairs( Aorig, 4, r.w, r.Z, r.M, 1e-13, 'eigenpairs' );
});
