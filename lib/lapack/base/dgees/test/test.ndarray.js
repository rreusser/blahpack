

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgees from './../lib/ndarray.js';

// FIXTURES //

import nn_basic_3x3_tri from './fixtures/nn_basic_3x3_tri.json' with { type: 'json' };
import vn_3x3_general from './fixtures/vn_3x3_general.json' with { type: 'json' };
import vs_select_positive_real from './fixtures/vs_select_positive_real.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };
import n_2_complex_eigs from './fixtures/n_2_complex_eigs.json' with { type: 'json' };
import vn_4x4_general from './fixtures/vn_4x4_general.json' with { type: 'json' };

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

function fromFortranColMajor( arr, N, LDA ) {
	const out = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ i + j * N ] = arr[ i + j * LDA ];
		}
	}
	return out;
}

function selectPosReal( wr ) {
	return wr > 0.0;
}

function selectNone() {
	return false;
}

function runDgees( jobvs, sort, select, N, Adata ) {
	const A = new Float64Array( Adata );
	const VS = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const sdim = new Float64Array( 1 );
	const WORK = new Float64Array( Math.max( 200, 10 * N ) );
	const BWORK = new Uint8Array( N );
	const lwork = WORK.length;

	const info = dgees( jobvs, sort, select, N, A, 1, N, 0, sdim, WR, 1, 0, WI, 1, 0, VS, 1, N, 0, WORK, 1, 0, BWORK, 1, 0 );

	return { 'info': info, 'A': A, 'VS': VS, 'WR': WR, 'WI': WI, 'sdim': sdim[ 0 ] };
}

// TESTS //

test( 'dgees: NN basic 3x3 tri', function t() {
	const tc = nn_basic_3x3_tri;
	const N = 3;
	const A = fromFortranColMajor( [
		2, 0, 0, 0,
		1, 3, 0, 0,
		0, 1, 4, 0,
		0, 0, 0, 0
	], N, 4 );
	const res = runDgees( 'no-vectors', 'none', selectNone, N, A );

	assert.equal( res.info, tc.info );
	assert.equal( res.sdim, tc.SDIM );
	const sortedWR = Array.from( res.WR ).sort();
	assertArrayClose( sortedWR, [ 2.0, 3.0, 4.0 ], 1e-12, 'WR' );
});

test( 'dgees: VN 3x3 general', function t() {
	const tc = vn_3x3_general;
	const N = 3;
	const A = fromFortranColMajor( [
		1, 4, 7, 0,
		2, 5, 8, 0,
		3, 6, 0, 0,
		0, 0, 0, 0
	], N, 4 );
	const res = runDgees( 'compute-vectors', 'none', selectNone, N, A );

	assert.equal( res.info, tc.info );
	assert.equal( res.sdim, tc.SDIM );

	const expectedWR = tc.WR.slice( 0, N ).sort( function( a, b ) { return a - b; } );
	const actualWR = Array.from( res.WR ).sort( function( a, b ) { return a - b; } );
	assertArrayClose( actualWR, expectedWR, 1e-12, 'WR' );
});

test( 'dgees: VS select positive real', function t() {
	const tc = vs_select_positive_real;
	const N = 3;
	const A = fromFortranColMajor( [
		0, -1, 0, 0,
		1, 0, 0, 0,
		0, 0, 2, 0,
		0, 0, 0, 0
	], N, 4 );
	const res = runDgees( 'compute-vectors', 'sort', selectPosReal, N, A );

	assert.equal( res.info, tc.info );
	assert.equal( res.sdim, tc.SDIM );
	assertClose( res.WR[ 0 ], 2.0, 1e-12, 'WR[0]' );
});

test( 'dgees: N=0', function t() {
	const tc = n_0;
	const A = new Float64Array( 0 );
	const VS = new Float64Array( 0 );
	const WR = new Float64Array( 0 );
	const WI = new Float64Array( 0 );
	const sdim = new Float64Array( 1 );
	const WORK = new Float64Array( 200 );
	const BWORK = new Uint8Array( 0 );

	const info = dgees( 'no-vectors', 'none', selectNone, 0, A, 1, 0, 0, sdim, WR, 1, 0, WI, 1, 0, VS, 1, 0, 0, WORK, 1, 0, BWORK, 1, 0 );

	assert.equal( info, tc.info );
	assert.equal( sdim[ 0 ], tc.SDIM );
});

test( 'dgees: N=1', function t() {
	const tc = n_1;
	const N = 1;
	const A = new Float64Array([ 5.0 ]);
	const res = runDgees( 'compute-vectors', 'none', selectNone, N, A );

	assert.equal( res.info, tc.info );
	assertClose( res.WR[ 0 ], 5.0, 1e-12, 'WR[0]' );
	assertClose( res.WI[ 0 ], 0.0, 1e-12, 'WI[0]' );
	assertClose( res.VS[ 0 ], 1.0, 1e-12, 'VS[0]' );
});

test( 'dgees: N=2 complex eigs', function t() {
	const tc = n_2_complex_eigs;
	const N = 2;
	const A = new Float64Array([
		0.0, -1.0,
		1.0, 0.0
	]);
	const res = runDgees( 'compute-vectors', 'none', selectNone, N, A );

	assert.equal( res.info, tc.info );
	assertClose( res.WR[ 0 ], 0.0, 1e-12, 'WR[0]' );
	assertClose( res.WR[ 1 ], 0.0, 1e-12, 'WR[1]' );
	assertClose( Math.abs( res.WI[ 0 ] ), 1.0, 1e-12, '|WI[0]|' );
	assertClose( Math.abs( res.WI[ 1 ] ), 1.0, 1e-12, '|WI[1]|' );
	assertClose( res.WI[ 0 ] + res.WI[ 1 ], 0.0, 1e-12, 'conjugate' );
});

test( 'dgees: VN 4x4 general', function t() {
	const tc = vn_4x4_general;
	const N = 4;
	const A = fromFortranColMajor( [
		4, 0, 2, 0,
		1, 3, 1, 0,
		2, 1, 1, 1,
		0, 1, 0, 2
	], N, N );
	const res = runDgees( 'compute-vectors', 'none', selectNone, N, A );

	assert.equal( res.info, tc.info );

	const expectedWR = tc.WR.slice( 0, N ).sort( function( a, b ) { return a - b; } );
	const actualWR = Array.from( res.WR ).sort( function( a, b ) { return a - b; } );
	assertArrayClose( actualWR, expectedWR, 1e-10, 'WR' );
});

test( 'dgees: verify Schur decomposition A = Z*T*Z^T', function t() {
	const N = 3;
	const Aorig = new Float64Array([
		1, 4, 7,
		2, 5, 8,
		3, 6, 0
	]);
	const A = new Float64Array( Aorig );
	const VS = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const sdim = new Float64Array( 1 );
	const WORK = new Float64Array( 200 );
	const BWORK = new Uint8Array( N );

	const info = dgees( 'compute-vectors', 'none', selectNone, N, A, 1, N, 0, sdim, WR, 1, 0, WI, 1, 0, VS, 1, N, 0, WORK, 1, 0, BWORK, 1, 0 );
	assert.equal( info, 0 );

	// Verify: Z^T * Aorig * Z ~= T
	const tmp = new Float64Array( N * N );
	const result = new Float64Array( N * N );
	let i, j, k, s;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			s = 0;
			for ( k = 0; k < N; k++ ) {
				s += VS[ k + i * N ] * Aorig[ k + j * N ];
			}
			tmp[ i + j * N ] = s;
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			s = 0;
			for ( k = 0; k < N; k++ ) {
				s += tmp[ i + k * N ] * VS[ k + j * N ];
			}
			result[ i + j * N ] = s;
		}
	}

	assertArrayClose( Array.from( result ), Array.from( A ), 1e-10, 'Z^T*A*Z = T' );
});

test( 'dgees: SORT=S with select that triggers eigenvalue reordering', function t() {
	const N = 4;
	// Matrix with eigenvalues that are both positive and negative real parts
	// so that sorting by selectPosReal will reorder them.
	// Use a block diagonal matrix with known eigenvalues:
	// Block 1: [[0, -2], [2, 0]] -> eigenvalues +/-2i
	// Block 2: [[3, 0], [0, -1]] -> eigenvalues 3, -1
	const A = new Float64Array([
		0, 2, 0, 0,
		-2, 0, 0, 0,
		0, 0, 3, 0,
		0, 0, 0, -1
	]);
	const res = runDgees( 'compute-vectors', 'sort', selectPosReal, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	// selectPosReal selects eigenvalues with wr > 0.
	// Eigenvalue 3 has wr=3 > 0, so sdim >= 1.
	assert.ok( res.sdim >= 1, 'sdim should be at least 1, got ' + res.sdim );
	// The selected eigenvalue (wr=3) should appear first on the diagonal
	assertClose( res.WR[ 0 ], 3.0, 1e-10, 'first eigenvalue should be 3' );
});

test( 'dgees: SORT=S with larger 5x5 matrix and multiple selected eigenvalues', function t() {
	const N = 5;
	let i;

	const selectLargeReal = function selectLargeReal( wr ) {
		return wr > 1.0;
	};

	// 5x5 matrix with eigenvalues roughly at -2, -1, 0, 2, 5
	// (upper triangular so eigenvalues are diagonal entries)
	const A = new Float64Array([
		-2, 0, 0, 0, 0,
		1, -1, 0, 0, 0,
		0, 1, 0, 0, 0,
		0, 0, 1, 2, 0,
		0, 0, 0, 1, 5
	]);
	const res = runDgees( 'compute-vectors', 'sort', selectLargeReal, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	// selectLargeReal selects eigenvalues with wr > 1.0, which are 2 and 5
	assert.equal( res.sdim, 2, 'sdim should be 2' );
	// The first two diagonal entries of T should be the selected eigenvalues (2 and 5)
	const selectedWR = [ res.WR[ 0 ], res.WR[ 1 ] ].sort( function( a, b ) { return a - b; } );
	assertClose( selectedWR[ 0 ], 2.0, 1e-10, 'selected WR[0]' );
	assertClose( selectedWR[ 1 ], 5.0, 1e-10, 'selected WR[1]' );
});

test( 'dgees: SORT=S with SDIM verification for complex conjugate pair', function t() {
	const N = 4;
	// Matrix with a complex conjugate pair and two real eigenvalues.
	// If the select function picks a complex conjugate pair, sdim should include both.

	const selectAll = function selectAll() {
		return true;
	};

	// [[1, -1, 0, 0], [1, 1, 0, 0], [0, 0, 3, 0], [0, 0, 0, -2]]
	// Eigenvalues: 1+i, 1-i, 3, -2
	const A = new Float64Array([
		1, 1, 0, 0,
		-1, 1, 0, 0,
		0, 0, 3, 0,
		0, 0, 0, -2
	]);
	const res = runDgees( 'compute-vectors', 'sort', selectAll, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	assert.equal( res.sdim, 4, 'sdim should be 4 when all eigenvalues selected' );
});

test( 'dgees: SORT=S with select returning false for all (sdim=0)', function t() {
	const N = 3;
	const A = new Float64Array([
		2, 0, 0,
		1, 3, 0,
		0, 1, 4
	]);
	const res = runDgees( 'compute-vectors', 'sort', selectNone, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	assert.equal( res.sdim, 0, 'sdim should be 0' );
});

test( 'dgees: JOBVS=N with SORT=S', function t() {
	const N = 3;
	const A = new Float64Array([
		2, 0, 0,
		1, 3, 0,
		0, 1, 4
	]);
	const res = runDgees( 'no-vectors', 'sort', selectPosReal, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	assert.ok( res.sdim >= 0, 'sdim should be non-negative' );
});

test( 'dgees: very small matrix elements trigger scaling path (anrm < SMLNUM)', function t() {
	const N = 3;
	const scale = 1e-155; // well below sqrt(SMLNUM/EPS)
	const A = new Float64Array([
		2 * scale, 0, 0,
		1 * scale, 3 * scale, 0,
		0, 1 * scale, 4 * scale
	]);
	const res = runDgees( 'compute-vectors', 'sort', selectPosReal, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	// Eigenvalues should be 2*scale, 3*scale, 4*scale (all positive)
	assert.equal( res.sdim, 3, 'all eigenvalues positive' );
	const sortedWR = Array.from( res.WR ).sort( function( a, b ) { return a - b; } );
	assertClose( sortedWR[ 0 ], 2 * scale, 1e-6, 'WR[0]' );
	assertClose( sortedWR[ 1 ], 3 * scale, 1e-6, 'WR[1]' );
	assertClose( sortedWR[ 2 ], 4 * scale, 1e-6, 'WR[2]' );
});

test( 'dgees: very large matrix elements trigger scaling path (anrm > BIGNUM)', function t() {
	const N = 3;
	const scale = 1e155; // well above BIGNUM = 1/sqrt(SMLNUM/EPS)
	const A = new Float64Array([
		2 * scale, 0, 0,
		1 * scale, 3 * scale, 0,
		0, 1 * scale, 4 * scale
	]);
	const res = runDgees( 'compute-vectors', 'sort', selectPosReal, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	assert.equal( res.sdim, 3, 'all eigenvalues positive' );
	const sortedWR = Array.from( res.WR ).sort( function( a, b ) { return a - b; } );
	assertClose( sortedWR[ 0 ], 2 * scale, 1e-6, 'WR[0]' );
	assertClose( sortedWR[ 1 ], 3 * scale, 1e-6, 'WR[1]' );
	assertClose( sortedWR[ 2 ], 4 * scale, 1e-6, 'WR[2]' );
});

test( 'dgees: 6x6 matrix to exercise larger dimension paths', function t() {
	const N = 6;
	let i, j;
	const A = new Float64Array( N * N );
	// Create a matrix with known structure: tridiagonal + perturbation
	for ( i = 0; i < N; i++ ) {
		A[ i + i * N ] = ( i + 1 ) * 2.0; // diagonal
	}
	for ( i = 0; i < N - 1; i++ ) {
		A[ i + ( i + 1 ) * N ] = 1.0; // superdiagonal
		A[ ( i + 1 ) + i * N ] = 0.5; // subdiagonal
	}

	const res = runDgees( 'compute-vectors', 'sort', selectPosReal, N, A );

	assert.equal( res.info, 0, 'info should be 0' );
	// All eigenvalues should be positive for this matrix
	assert.equal( res.sdim, N, 'all eigenvalues should be positive' );
});
