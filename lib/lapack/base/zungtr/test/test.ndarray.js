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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungtr from './../lib/ndarray.js';
import zhetrd from '../../zhetrd/lib/base.js';

// FIXTURES //

import zungtr_4x4_l from './fixtures/zungtr_4x4_l.json' with { type: 'json' };
import zungtr_4x4_u from './fixtures/zungtr_4x4_u.json' with { type: 'json' };
import zungtr_3x3_l from './fixtures/zungtr_3x3_l.json' with { type: 'json' };
import zungtr_1x1 from './fixtures/zungtr_1x1.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extract a dense M-by-N complex matrix from a fixture's Q array which uses LDA stride.
* Fixture is interleaved re/im with LDA complex elements per column.
*
* @param {Array} Q - fixture data (2*LDA*N doubles)
* @param {number} M - rows to extract
* @param {number} N - columns to extract
* @param {number} LDA - leading dimension in the fixture
* @returns {Array} dense 2*M*N doubles
*/
function extractFixtureQ( Q, M, N, LDA ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( Q[ 2 * (j * LDA + i) ] );
			out.push( Q[ 2 * (j * LDA + i) + 1 ] );
		}
	}
	return out;
}

/**
* Helper: performs zhetrd then zungtr and returns the Q matrix.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} AHerm - Hermitian matrix as interleaved re/im pairs (column-major, dense N*N complex)
* @returns {Object} { Q, Qv, d, e, info }
*/
function zhetrdThenZungtr( uplo, N, AHerm ) {
	var WORK = new Complex128Array( 256 );
	var TAU = new Complex128Array( Math.max( N - 1, 1 ) );
	var d = new Float64Array( N );
	var e = new Float64Array( Math.max( N - 1, 1 ) );
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var Qv;
	var info;
	var Q;
	var i;

	// Copy input into A
	for ( i = 0; i < 2 * N * N; i++ ) {
		Av[ i ] = AHerm[ i ];
	}

	// Call zhetrd to reduce to tridiagonal form
	zhetrd( uplo, N, A, 1, N, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );

	// Copy A to Q (A now contains reflectors)
	Q = new Complex128Array( N * N );
	Qv = reinterpret( Q, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		Qv[ i ] = Av[ i ];
	}

	// Allocate fresh WORK for zungtr
	WORK = new Complex128Array( 256 );

	// Call zungtr to generate Q
	info = zungtr( uplo, N, Q, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );

	return {
		Q: Q,
		Qv: reinterpret( Q, 0 ),
		d: d,
		e: e,
		TAU: TAU,
		info: info
	};
}

/**
* Build the 4x4 Hermitian matrix from the Fortran test.
* Full matrix (both triangles), column-major, interleaved re/im.
*/
function buildHerm4x4() {
	return new Float64Array([
		// col 0
		2, 0, 1, 1, 0.5, -0.5, 0, 0,
		// col 1
		1, -1, 3, 0, 0, 2, 1, -1,
		// col 2
		0.5, 0.5, 0, -2, 4, 0, 0.5, 0.5,
		// col 3
		0, 0, 1, 1, 0.5, -0.5, 5, 0
	]);
}

/**
* Build the 3x3 Hermitian matrix from the Fortran test.
*/
function buildHerm3x3() {
	return new Float64Array([
		// col 0
		4, 0, 1, -2, 0, 1,
		// col 1
		1, 2, 5, 0, 2, 0,
		// col 2
		0, -1, 2, 0, 6, 0
	]);
}

// TESTS //

test( 'zungtr: 4x4 lower', function t() {
	var tc = zungtr_4x4_l;
	var N = 4;
	var AHerm = buildHerm4x4();
	var result = zhetrdThenZungtr( 'lower', N, AHerm );
	// Fixture has LDA=N=4, so dense and fixture layout match
	var expected = extractFixtureQ( tc.Q, N, N, N );

	assert.equal( result.info, 0, 'info' );
	assertArrayClose( Array.from( result.Qv ), expected, 1e-13, 'Q' );
});

test( 'zungtr: 4x4 upper', function t() {
	var tc = zungtr_4x4_u;
	var N = 4;
	var AHerm = buildHerm4x4();
	var result = zhetrdThenZungtr( 'upper', N, AHerm );
	var expected = extractFixtureQ( tc.Q, N, N, N );

	assert.equal( result.info, 0, 'info' );
	assertArrayClose( Array.from( result.Qv ), expected, 1e-13, 'Q' );
});

test( 'zungtr: 3x3 lower', function t() {
	var tc = zungtr_3x3_l;
	var N = 3;
	var LDA_FIXTURE = 4; // Fortran test uses LDA=NMAX=4
	var AHerm = buildHerm3x3();
	var result = zhetrdThenZungtr( 'lower', N, AHerm );
	var expected = extractFixtureQ( tc.Q, N, N, LDA_FIXTURE );

	assert.equal( result.info, 0, 'info' );
	assertArrayClose( Array.from( result.Qv ), expected, 1e-13, 'Q' );
});

test( 'zungtr: 1x1', function t() {
	var tc = zungtr_1x1;
	var N = 1;
	var AHerm = new Float64Array([ 5, 0 ]);
	var result = zhetrdThenZungtr( 'lower', N, AHerm );

	assert.equal( result.info, 0, 'info' );
	assertArrayClose( Array.from( result.Qv ), tc.Q, 1e-14, 'Q' );
});

test( 'zungtr: N=0 quick return (lower)', function t() {
	var WORK = new Complex128Array( 4 );
	var TAU = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var info;

	info = zungtr( 'lower', 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zungtr: N=0 quick return (upper)', function t() {
	var WORK = new Complex128Array( 4 );
	var TAU = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var info;

	info = zungtr( 'upper', 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zungtr: Q is unitary (4x4 lower)', function t() {
	var N = 4;
	var AHerm = buildHerm4x4();
	var result = zhetrdThenZungtr( 'lower', N, AHerm );
	var Qv = result.Qv;
	var reKI;
	var imKI;
	var reKJ;
	var imKJ;
	var sumRe;
	var sumIm;
	var i;
	var j;
	var k;

	// Verify Q^H * Q = I
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sumRe = 0.0;
			sumIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				reKI = Qv[ 2 * (k + i * N) ];
				imKI = Qv[ 2 * (k + i * N) + 1 ];
				reKJ = Qv[ 2 * (k + j * N) ];
				imKJ = Qv[ 2 * (k + j * N) + 1 ];
				sumRe += reKI * reKJ + imKI * imKJ;
				sumIm += -imKI * reKJ + reKI * imKJ;
			}
			if ( i === j ) {
				assertClose( sumRe, 1.0, 1e-13, 'QHQ real[' + i + ',' + j + ']' );
			} else {
				assertClose( sumRe, 0.0, 1e-13, 'QHQ real[' + i + ',' + j + ']' );
			}
			assertClose( sumIm, 0.0, 1e-13, 'QHQ imag[' + i + ',' + j + ']' );
		}
	}
});

test( 'zungtr: Q is unitary (4x4 upper)', function t() {
	var N = 4;
	var AHerm = buildHerm4x4();
	var result = zhetrdThenZungtr( 'upper', N, AHerm );
	var Qv = result.Qv;
	var reKI;
	var imKI;
	var reKJ;
	var imKJ;
	var sumRe;
	var sumIm;
	var i;
	var j;
	var k;

	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sumRe = 0.0;
			sumIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				reKI = Qv[ 2 * (k + i * N) ];
				imKI = Qv[ 2 * (k + i * N) + 1 ];
				reKJ = Qv[ 2 * (k + j * N) ];
				imKJ = Qv[ 2 * (k + j * N) + 1 ];
				sumRe += reKI * reKJ + imKI * imKJ;
				sumIm += -imKI * reKJ + reKI * imKJ;
			}
			if ( i === j ) {
				assertClose( sumRe, 1.0, 1e-13, 'QHQ real[' + i + ',' + j + ']' );
			} else {
				assertClose( sumRe, 0.0, 1e-13, 'QHQ real[' + i + ',' + j + ']' );
			}
			assertClose( sumIm, 0.0, 1e-13, 'QHQ imag[' + i + ',' + j + ']' );
		}
	}
});

test( 'zungtr: N=2 edge case (lower)', function t() {
	var N = 2;
	var AHerm = new Float64Array([ 3, 0, 1, 1, 1, -1, 5, 0 ]);
	var result = zhetrdThenZungtr( 'lower', N, AHerm );
	var Qv = result.Qv;
	var reKI;
	var imKI;
	var reKJ;
	var imKJ;
	var sumRe;
	var sumIm;
	var i;
	var j;
	var k;

	assert.equal( result.info, 0, 'info' );

	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sumRe = 0.0;
			sumIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				reKI = Qv[ 2 * (k + i * N) ];
				imKI = Qv[ 2 * (k + i * N) + 1 ];
				reKJ = Qv[ 2 * (k + j * N) ];
				imKJ = Qv[ 2 * (k + j * N) + 1 ];
				sumRe += reKI * reKJ + imKI * imKJ;
				sumIm += -imKI * reKJ + reKI * imKJ;
			}
			if ( i === j ) {
				assertClose( sumRe, 1.0, 1e-14, 'QHQ real[' + i + ',' + j + ']' );
			} else {
				assertClose( sumRe, 0.0, 1e-14, 'QHQ real[' + i + ',' + j + ']' );
			}
			assertClose( sumIm, 0.0, 1e-14, 'QHQ imag[' + i + ',' + j + ']' );
		}
	}
});

test( 'zungtr: N=2 edge case (upper)', function t() {
	var N = 2;
	var AHerm = new Float64Array([ 3, 0, 1, 1, 1, -1, 5, 0 ]);
	var result = zhetrdThenZungtr( 'upper', N, AHerm );
	var Qv = result.Qv;
	var reKI;
	var imKI;
	var reKJ;
	var imKJ;
	var sumRe;
	var sumIm;
	var i;
	var j;
	var k;

	assert.equal( result.info, 0, 'info' );

	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sumRe = 0.0;
			sumIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				reKI = Qv[ 2 * (k + i * N) ];
				imKI = Qv[ 2 * (k + i * N) + 1 ];
				reKJ = Qv[ 2 * (k + j * N) ];
				imKJ = Qv[ 2 * (k + j * N) + 1 ];
				sumRe += reKI * reKJ + imKI * imKJ;
				sumIm += -imKI * reKJ + reKI * imKJ;
			}
			if ( i === j ) {
				assertClose( sumRe, 1.0, 1e-14, 'QHQ real[' + i + ',' + j + ']' );
			} else {
				assertClose( sumRe, 0.0, 1e-14, 'QHQ real[' + i + ',' + j + ']' );
			}
			assertClose( sumIm, 0.0, 1e-14, 'QHQ imag[' + i + ',' + j + ']' );
		}
	}
});
