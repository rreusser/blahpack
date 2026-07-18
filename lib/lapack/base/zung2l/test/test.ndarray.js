/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zung2l from './../lib/ndarray.js';

// FIXTURES //

import zung2l_3x3 from './fixtures/zung2l_3x3.json' with { type: 'json' };
import zung2l_4x3 from './fixtures/zung2l_4x3.json' with { type: 'json' };
import zung2l_k0 from './fixtures/zung2l_k0.json' with { type: 'json' };

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
* Load a complex matrix (M x N) from interleaved re/im pairs into a Complex128Array with LDA stride.
*
* @param {Array} data - interleaved re/im pairs, column-major dense (2*M*N elements)
* @param {number} M - number of rows
* @param {number} N - number of columns
* @param {number} LDA - leading dimension (complex elements, >= M)
* @returns {Complex128Array} buffer of size LDA*N complex elements
*/
function loadComplexMatrix( data, M, N, LDA ) {
	const A = new Complex128Array( LDA * N );
	const Av = reinterpret( A, 0 );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Av[ 2 * (j * LDA + i) ] = data[ 2 * (j * M + i) ];
			Av[ 2 * (j * LDA + i) + 1 ] = data[ 2 * (j * M + i) + 1 ];
		}
	}
	return A;
}

/**
* Extract M-by-N submatrix from Complex128Array with leading dim LDA.
*
* @returns {Array} interleaved re/im pairs in column-major order (2*M*N elements)
*/
function extractComplexMatrix( A, LDA, M, N ) {
	const Av = reinterpret( A, 0 );
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( Av[ 2 * (j * LDA + i) ] );
			out.push( Av[ 2 * (j * LDA + i) + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zung2l: 3x3 full Q (M=N=K=3)', function t() {
	const tc = zung2l_3x3;
	const WORK = new Complex128Array( 10 );
	const LDA = 4;

	// Reflectors from the Fortran test (column-major, M=3, LDA=4):
	// Col 0: (0.5,0.5), (1,0), (0,0)
	// Col 1: (0,1), (0.5,-0.5), (0,0)
	// Col 2: (1,0), (0,0.5), (0.3,0)
	const Adata = new Float64Array([
		0.5, 0.5, 1, 0, 0, 0,
		0, 1, 0.5, -0.5, 0, 0,
		1, 0, 0, 0.5, 0.3, 0
	]);
	const A = loadComplexMatrix( Adata, 3, 3, LDA );

	const TAU = new Complex128Array( 3 );
	const tauv = reinterpret( TAU, 0 );
	tauv[ 0 ] = 1.2; tauv[ 1 ] = 0.1;
	tauv[ 2 ] = 0.8; tauv[ 3 ] = -0.2;
	tauv[ 4 ] = 1.5; tauv[ 5 ] = 0.3;

	const info = zung2l( 3, 3, 3, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Fixture uses LDA=4, so Q has 2*LDA*N = 24 values including padding rows.
	// Extract only the 3x3 part (2*3*3 = 18 values).
	const out = extractComplexMatrix( A, LDA, 3, 3 );
	// The fixture has 2*LDA*N elements; extract the dense 2*M*N subset for comparison
	const expected = [];
	let i, j;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			expected.push( tc.Q[ 2 * (j * 4 + i) ] );
			expected.push( tc.Q[ 2 * (j * 4 + i) + 1 ] );
		}
	}
	assertArrayClose( out, expected, 1e-14, 'Q' );
});

test( 'zung2l: 4x3 rectangular (M=4, N=3, K=2)', function t() {
	const tc = zung2l_4x3;
	const WORK = new Complex128Array( 10 );
	const LDA = 4;

	// From Fortran test:
	// Col 0: (0,0), (0,0), (0,0), (0,0)
	// Col 1: (0.3,0.4), (0.5,-0.1), (1,0), (0,0)
	// Col 2: (0.2,0.1), (0.4,-0.3), (0,0.6), (0.7,0)
	const Adata = new Float64Array([
		0, 0, 0, 0, 0, 0, 0, 0,
		0.3, 0.4, 0.5, -0.1, 1, 0, 0, 0,
		0.2, 0.1, 0.4, -0.3, 0, 0.6, 0.7, 0
	]);
	const A = loadComplexMatrix( Adata, 4, 3, LDA );

	const TAU = new Complex128Array( 2 );
	const tauv = reinterpret( TAU, 0 );
	tauv[ 0 ] = 1.1; tauv[ 1 ] = 0.2;
	tauv[ 2 ] = 0.9; tauv[ 3 ] = -0.1;

	const info = zung2l( 4, 3, 2, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	const out = extractComplexMatrix( A, LDA, 4, 3 );
	// Fixture has LDA=4=M, so 2*LDA*N = 2*4*3 = 24 = 2*M*N
	assertArrayClose( out, tc.Q, 1e-14, 'Q' );
});

test( 'zung2l: K=0 (identity)', function t() {
	const tc = zung2l_k0;
	const WORK = new Complex128Array( 10 );
	const TAU = new Complex128Array( 1 );
	const LDA = 4;

	// K=0: should produce identity columns, input doesn't matter
	const A = new Complex128Array( LDA * 3 );
	const Av = reinterpret( A, 0 );
	// Fill with arbitrary values
	Av[ 0 ] = 9; Av[ 1 ] = 9;

	const info = zung2l( 3, 3, 0, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	const out = extractComplexMatrix( A, LDA, 3, 3 );
	// Expected: identity matrix
	const expected = [
		1, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0,
		0, 0, 0, 0, 1, 0
	];
	assertArrayClose( out, expected, 1e-14, 'Q' );
});

test( 'zung2l: N=0 quick return', function t() {
	const WORK = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );

	const info = zung2l( 3, 0, 0, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zung2l: M=0, N=0 quick return', function t() {
	const WORK = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const A = new Complex128Array( 1 );

	const info = zung2l( 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zung2l: 3x3 with non-unit LDA', function t() {
	const tc = zung2l_3x3;
	const WORK = new Complex128Array( 10 );
	const LDA = 5; // larger than M=3

	const Adata = new Float64Array([
		0.5, 0.5, 1, 0, 0, 0,
		0, 1, 0.5, -0.5, 0, 0,
		1, 0, 0, 0.5, 0.3, 0
	]);
	const A = loadComplexMatrix( Adata, 3, 3, LDA );

	const TAU = new Complex128Array( 3 );
	const tauv = reinterpret( TAU, 0 );
	tauv[ 0 ] = 1.2; tauv[ 1 ] = 0.1;
	tauv[ 2 ] = 0.8; tauv[ 3 ] = -0.2;
	tauv[ 4 ] = 1.5; tauv[ 5 ] = 0.3;

	const info = zung2l( 3, 3, 3, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	const out = extractComplexMatrix( A, LDA, 3, 3 );
	// Extract expected from fixture (LDA=4)
	const expected = [];
	let i, j;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			expected.push( tc.Q[ 2 * (j * 4 + i) ] );
			expected.push( tc.Q[ 2 * (j * 4 + i) + 1 ] );
		}
	}
	assertArrayClose( out, expected, 1e-14, 'Q' );
});
