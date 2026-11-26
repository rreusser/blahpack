/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtgsyl from './../lib/ndarray.js';
import base from './../lib/base.js';

// FIXTURES //

import notrans_2x2 from './fixtures/notrans_2x2.json' with { type: 'json' };
import notrans_3x2_quasi from './fixtures/notrans_3x2_quasi.json' with { type: 'json' };
import trans_2x2 from './fixtures/trans_2x2.json' with { type: 'json' };
import trans_3x2_quasi from './fixtures/trans_3x2_quasi.json' with { type: 'json' };
import trans_3x3_quasi from './fixtures/trans_3x3_quasi.json' with { type: 'json' };
import notrans_3x3_quasi from './fixtures/notrans_3x3_quasi.json' with { type: 'json' };
import notrans_2x2_ijob1 from './fixtures/notrans_2x2_ijob1.json' with { type: 'json' };
import notrans_5x4_ijob1_blocked from './fixtures/notrans_5x4_ijob1_blocked.json' with { type: 'json' };
import trans_5x4_blocked from './fixtures/trans_5x4_blocked.json' with { type: 'json' };
import notrans_5x5_ijob2_merge from './fixtures/notrans_5x5_ijob2_merge.json' with { type: 'json' };
import notrans_7x6_bumpB from './fixtures/notrans_7x6_bumpB.json' with { type: 'json' };
import trans_7x6_bumpB from './fixtures/trans_7x6_bumpB.json' with { type: 'json' };
import notrans_5x4_ijob3_blocked from './fixtures/notrans_5x4_ijob3_blocked.json' with { type: 'json' };


// VARIABLES //

const TOL = 1e-9;


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

function packMatrix( entries, M, N ) {
	const A = new Float64Array( M * N );
	let i;
	for ( i = 0; i < entries.length; i += 3 ) {
		A[ entries[ i + 1 ] * M + entries[ i ] ] = entries[ i + 2 ];
	}
	return A;
}

function extractMatrix( A, LDA, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}

function allFinite( arr ) {
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		if ( !isFinite( arr[ i ] ) ) {
			return false;
		}
	}
	return true;
}

/**
* Build an N-by-N upper-triangular matrix with diagonal d and small superdiag values.
* Useful for blocked-path tests (N > 32).
*/
function buildUpperTri( N, dval ) {
	const A = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		A[ j * N + j ] = dval + (0.01 * j);
		for ( i = 0; i < j; i++ ) {
			// Small upper-triangular entries
			A[ j * N + i ] = 0.001 * ( ( i + j ) % 5 );
		}
	}
	return A;
}

/**
* Generates the blocked-path problem of `test/fortran/test_dtgsyl.f90` (its `gen`): upper quasi-triangular `(A,D)` and `(B,E)`, column-major, with a 2x2 bump at 1-based row `ba` of `A` and column `bb` of `B` (0 = none).
*
* @private
* @param {number} M - rows
* @param {number} N - columns
* @param {number} ba - bump position in `A`
* @param {number} bb - bump position in `B`
* @returns {Object} `A`, `B`, `C`, `D`, `E`, `F`
*/
function gen( M, N, ba, bb ) {
	let i, j;
	const g = {
		'A': new Float64Array( M * M ),
		'B': new Float64Array( N * N ),
		'C': new Float64Array( M * N ),
		'D': new Float64Array( M * M ),
		'E': new Float64Array( N * N ),
		'F': new Float64Array( M * N )
	};
	for ( j = 1; j <= M; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			if ( i === j ) {
				g.A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = 1.0 + i;
				g.D[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = 1.0 + ( 0.1 * i );
			} else {
				g.A[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = 0.1 * Math.sin( i + ( 2 * j ) );
				g.D[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = 0.05 * Math.cos( i + j );
			}
		}
	}
	if ( ba > 0 ) {
		g.A[ ( ba - 2 ) + ( ( ba - 2 ) * M ) ] = g.A[ ( ba - 1 ) + ( ( ba - 1 ) * M ) ];
		g.A[ ( ba - 2 ) + ( ( ba - 1 ) * M ) ] = 0.5;
		g.A[ ( ba - 1 ) + ( ( ba - 2 ) * M ) ] = -0.5;
		g.D[ ( ba - 2 ) + ( ( ba - 1 ) * M ) ] = 0.0;
	}
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			if ( i === j ) {
				g.B[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = -( 1.0 + ( 0.5 * i ) );
				g.E[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 1.0 + ( 0.2 * i );
			} else {
				g.B[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 0.1 * Math.cos( ( 2 * i ) + j );
				g.E[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = 0.05 * Math.sin( i + j );
			}
		}
	}
	if ( bb > 0 ) {
		g.B[ ( bb - 2 ) + ( ( bb - 2 ) * N ) ] = g.B[ ( bb - 1 ) + ( ( bb - 1 ) * N ) ];
		g.B[ ( bb - 2 ) + ( ( bb - 1 ) * N ) ] = 0.4;
		g.B[ ( bb - 1 ) + ( ( bb - 2 ) * N ) ] = -0.4;
		g.E[ ( bb - 2 ) + ( ( bb - 1 ) * N ) ] = 0.0;
	}
	for ( j = 1; j <= N; j++ ) {
		for ( i = 1; i <= M; i++ ) {
			g.C[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = i + ( 0.5 * j );
			g.F[ ( i - 1 ) + ( ( j - 1 ) * M ) ] = 1.0 + Math.sin( i * j );
		}
	}
	return g;
}

/**
* Runs a blocked-path fixture case and returns `IWORK`.
*
* @private
* @param {Object} tc - fixture
* @param {string} trans - transpose option
* @param {number} ijob - job
* @param {number} M - rows
* @param {number} N - columns
* @param {number} ba - bump position in `A`
* @param {number} bb - bump position in `B`
* @param {number} [lwork] - WORK length (default `2*M*N`)
* @returns {Int32Array} `IWORK` after the call
*/
function runBlocked( tc, trans, ijob, M, N, ba, bb, lwork ) {
	const g = gen( M, N, ba, bb );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( ( lwork === void 0 ) ? 2 * M * N : lwork ).fill( NaN );
	const IWORK = new Int32Array( M + N + 6 ).fill( -1 );
	const info = dtgsyl( trans, ijob, M, N, g.A, 1, M, 0, g.B, 1, N, 0, g.C, 1, M, 0, g.D, 1, M, 0, g.E, 1, N, 0, g.F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, tc.name + ': info' );
	assertClose( scale[ 0 ], tc.scale, 1e-12, tc.name + ': scale' );
	if ( tc.dif !== void 0 ) {
		assertClose( dif[ 0 ], tc.dif, 1e-12, tc.name + ': dif' );
	}
	assertArrayClose( Array.from( g.C ), tc.C, 1e-12, tc.name + ': C' );
	assertArrayClose( Array.from( g.F ), tc.F, 1e-12, tc.name + ': F' );
	return IWORK;
}


// TESTS //

test( 'dtgsyl.ndarray: main export is a function', function t() {
	assert.strictEqual( typeof dtgsyl, 'function', 'main export is a function' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=0', function t() {
	const tc = notrans_2x2;
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: trans 2x2 IJOB=0', function t() {
	const tc = trans_2x2;
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: notrans 3x2 quasi-triangular IJOB=0', function t() {
	const tc = notrans_3x2_quasi;
	const M = 3;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M);
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	const F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: trans 3x2 quasi-triangular IJOB=0', function t() {
	const tc = trans_3x2_quasi;
	const M = 3;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M);
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	const F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: notrans 3x3 quasi-triangular IJOB=0', function t() {
	const tc = notrans_3x3_quasi;
	const M = 3;
	const N = 3;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M);
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N);
	const C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N);
	const F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: trans 3x3 quasi-triangular IJOB=0', function t() {
	const tc = trans_3x3_quasi;
	const M = 3;
	const N = 3;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M);
	const B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N);
	const C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N);
	const F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});


// IJOB MODES (no-transpose only) //

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=1 (Frobenius DIF estimate)', function t() {
	const tc = notrans_2x2_ijob1;
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=2 (1-norm DIF estimate)', function t() {
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 2, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=3 (zeros C/F, computes DIF only)', function t() {
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 3, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=4 (zeros C/F, 1-norm DIF only)', function t() {
	const M = 2;
	const N = 2;
	const A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	const B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	const C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	const D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	const E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	const F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 400 );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 4, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});


// REFERENCE REJECTS M <= 0 (INFO = -3) //

test( 'dtgsyl.ndarray: throws RangeError for M=0 (reference rejects M <= 0) notrans IJOB=0', function t() {
	const A = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const D = new Float64Array( 1 );
	const E = new Float64Array( 1 );
	const F = new Float64Array( 1 );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 10 );
	assert.throws( function throws() {
		dtgsyl( 'no-transpose', 0, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});

test( 'dtgsyl.ndarray: throws RangeError for M=0 (reference rejects M <= 0) notrans IJOB=1', function t() {
	const A = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const D = new Float64Array( 1 );
	const E = new Float64Array( 1 );
	const F = new Float64Array( 1 );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array([ 99.0 ]);
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 10 );
	assert.throws( function throws() {
		dtgsyl( 'no-transpose', 1, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});

test( 'dtgsyl.ndarray: throws RangeError for M=0 (reference rejects M <= 0) transpose', function t() {
	const A = new Float64Array( 1 );
	const B = new Float64Array( 4 );
	const C = new Float64Array( 1 );
	const D = new Float64Array( 1 );
	const E = new Float64Array( 4 );
	const F = new Float64Array( 1 );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 10 );
	assert.throws( function throws() {
		dtgsyl( 'transpose', 0, 0, 2, A, 1, 1, 0, B, 1, 2, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 2, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	}, RangeError );
});


// BLOCKED PATH (M > 32 or N > 32) //

test( 'dtgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=0', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTri( M, 2.0 );
	const B = buildUpperTri( N, 3.0 );
	const D = buildUpperTri( M, 1.0 );
	const E = buildUpperTri( N, 1.0 );
	let i;
	const C = new Float64Array( M * N );
	const F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
});

test( 'dtgsyl.ndarray: blocked path trans M=40 N=40 IJOB=0', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTri( M, 2.0 );
	const B = buildUpperTri( N, 3.0 );
	const D = buildUpperTri( M, 1.0 );
	const E = buildUpperTri( N, 1.0 );
	let i;
	const C = new Float64Array( M * N );
	const F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
});

test( 'dtgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=1 (uses isolve=2 round)', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTri( M, 2.0 );
	const B = buildUpperTri( N, 3.0 );
	const D = buildUpperTri( M, 1.0 );
	const E = buildUpperTri( N, 1.0 );
	let i;
	const C = new Float64Array( M * N );
	const F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
	assert.ok( allFinite( C ), 'C finite' );
});

test( 'dtgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=3 (zeros C/F)', function t() {
	const M = 40;
	const N = 40;
	const A = buildUpperTri( M, 2.0 );
	const B = buildUpperTri( N, 3.0 );
	const D = buildUpperTri( M, 1.0 );
	const E = buildUpperTri( N, 1.0 );
	let i;
	const C = new Float64Array( M * N );
	const F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = 0.5;
		F[ i ] = 0.7;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 3, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'dtgsyl.ndarray: blocked path with quasi-triangular 2x2 block at boundary', function t() {
	// Place a 2x2 quasi-triangular block straddling the mb=32 partition boundary
	// to exercise the partitioning skip-row logic on line 207-208.
	const M = 34;
	const N = 34;
	const A = buildUpperTri( M, 2.0 );
	// Add subdiagonal at row 32 to make a 2x2 block
	A[ 31 * M + 32 ] = 0.5;
	const B = buildUpperTri( N, 3.0 );
	B[ 31 * N + 32 ] = 0.4;
	const D = buildUpperTri( M, 1.0 );
	const E = buildUpperTri( N, 1.0 );
	let i;
	const C = new Float64Array( M * N );
	const F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const WORK = new Float64Array( 2 * M * N );
	const IWORK = new Int32Array( M + N + 6 );
	const info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( C ), 'C finite' );
});


// RESIDUAL-CHECKED BLOCKED PATH //

/**
* Returns op(A)*op(B) for column-major A (lda) and B (ldb); result is M-by-N with leading dimension M.
*/
function matmul( ta, tb, M, N, K, A, lda, B, ldb ) {
	const out = new Float64Array( M * N );
	let s, i, j, k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			s = 0.0;
			for ( k = 0; k < K; k++ ) {
				s += ( ( ta ) ? A[ ( i * lda ) + k ] : A[ ( k * lda ) + i ] ) * ( ( tb ) ? B[ ( k * ldb ) + j ] : B[ ( j * ldb ) + k ] );
			}
			out[ ( j * M ) + i ] = s;
		}
	}
	return out;
}

function maxAbs( x ) {
	let m = 0.0;
	let i;
	for ( i = 0; i < x.length; i++ ) {
		m = Math.max( m, Math.abs( x[ i ] ) );
	}
	return m;
}

/**
* Quasi-triangular N-by-N matrix: diagonal d + 0.05*j, dense upper part, and a 2x2 block (subdiagonal entry) at each (k+1,k) for k in `blocks`.
*/
function quasiTri( N, d, blocks, seed ) {
	const A = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		A[ ( j * N ) + j ] = d + ( 0.05 * j );
		for ( i = 0; i < j; i++ ) {
			A[ ( j * N ) + i ] = 0.1 * Math.sin( seed + ( i * 7 ) + ( j * 3 ) );
		}
	}
	for ( i = 0; i < blocks.length; i++ ) {
		A[ ( blocks[ i ] * N ) + blocks[ i ] + 1 ] = -0.6;
	}
	return A;
}

/**
* Relative residual of both generalized Sylvester equations:
* no-transpose: A*R - L*B = scale*C0, D*R - L*E = scale*F0;
* transpose: A^T*R + D^T*L = scale*C0, R*B^T + L*E^T = -scale*F0.
*/
function sylvesterResidual( trans, M, N, A, B, C0, D, E, F0, R, L, scale ) {
	let r1, r2, X, Y, Z, W, i;
	if ( trans === 'no-transpose' ) {
		X = matmul( false, false, M, N, M, A, M, R, M );
		Y = matmul( false, false, M, N, N, L, M, B, N );
		Z = matmul( false, false, M, N, M, D, M, R, M );
		W = matmul( false, false, M, N, N, L, M, E, N );
	} else {
		X = matmul( true, false, M, N, M, A, M, R, M );
		Y = matmul( true, false, M, N, M, D, M, L, M );
		Z = matmul( false, true, M, N, N, R, M, B, N );
		W = matmul( false, true, M, N, N, L, M, E, N );
	}
	r1 = new Float64Array( M * N );
	r2 = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		if ( trans === 'no-transpose' ) {
			r1[ i ] = X[ i ] - Y[ i ] - ( scale * C0[ i ] );
			r2[ i ] = Z[ i ] - W[ i ] - ( scale * F0[ i ] );
		} else {
			r1[ i ] = X[ i ] + Y[ i ] - ( scale * C0[ i ] );
			r2[ i ] = Z[ i ] + W[ i ] + ( scale * F0[ i ] );
		}
	}
	const nrm = ( Math.max( maxAbs( A ), maxAbs( B ), maxAbs( D ), maxAbs( E ) ) * Math.max( M, N ) * Math.max( maxAbs( R ), maxAbs( L ) ) ) + ( scale * Math.max( maxAbs( C0 ), maxAbs( F0 ) ) );
	return Math.max( maxAbs( r1 ), maxAbs( r2 ) ) / nrm;
}

/**
* Runs dtgsyl on an M-by-N problem (M,N > 32 => blocked path) whose A has 2x2 blocks at rows 5/6 and 31/32 (straddling the mb=32 partition) and B at 10/11 and 31/32.
*/
function solveBlocked( trans, ijob, M, N, opts ) {
	const A = quasiTri( M, 2.0, opts.ablk, 1 );
	const D = quasiTri( M, 1.0, [], 2 );
	const B = quasiTri( N, -1.5, opts.bblk, 3 );
	const E = quasiTri( N, 1.2, [], 4 );
	const C = new Float64Array( M * N );
	const F = new Float64Array( M * N );
	let i;
	if ( opts.modify ) {
		opts.modify( A, B, D, E );
	}
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = Math.cos( i );
		F[ i ] = Math.sin( 0.5 * i );
	}
	if ( opts.bigIndex !== void 0 ) {
		C[ opts.bigIndex ] = 1.0e300;
	}
	const C0 = new Float64Array( C );
	const F0 = new Float64Array( F );
	const scale = new Float64Array( 1 );
	const dif = new Float64Array( 1 );
	const info = dtgsyl( trans, ijob, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, new Float64Array( 2 * M * N ), 1, 0, new Int32Array( M + N + 6 ), 1, 0 );
	return {
		'info': info,
		'scale': scale[ 0 ],
		'dif': dif[ 0 ],
		'C': C,
		'F': F,
		'resid': sylvesterResidual( trans, M, N, A, B, C0, D, E, F0, C, F, scale[ 0 ] )
	};
}

const RTOL = 1.0e-14;
const BLK = {
	'ablk': [ 5, 31 ],
	'bblk': [ 10, 31 ]
};

test( 'dtgsyl.ndarray: blocked quasi-triangular residuals, no-transpose, ijob 0..2', function t() {
	const r0 = solveBlocked( 'no-transpose', 0, 40, 37, BLK );
	const r1 = solveBlocked( 'no-transpose', 1, 40, 37, BLK );
	const r2 = solveBlocked( 'no-transpose', 2, 40, 37, BLK );
	assert.equal( r0.info, 0, 'info ijob=0' );
	assert.equal( r1.info, 0, 'info ijob=1' );
	assert.equal( r2.info, 0, 'info ijob=2' );
	assert.equal( r0.scale, 1.0, 'scale' );
	assert.ok( r0.resid <= RTOL, 'ijob=0 residual ' + r0.resid );
	assert.ok( r1.resid <= RTOL, 'ijob=1 residual ' + r1.resid );
	assert.ok( r2.resid <= RTOL, 'ijob=2 residual ' + r2.resid );

	// The solution is independent of ijob (the DIF round restores C/F):
	assertArrayClose( Array.from( r1.C ), Array.from( r0.C ), 0.0, 'R ijob=1' );
	assertArrayClose( Array.from( r2.F ), Array.from( r0.F ), 0.0, 'L ijob=2' );
	assert.ok( r1.dif > 0.0 && isFinite( r1.dif ), 'Frobenius DIF > 0' );
	assert.ok( r2.dif > 0.0 && isFinite( r2.dif ), 'one-norm DIF > 0' );
});

test( 'dtgsyl.ndarray: blocked quasi-triangular, no-transpose ijob 3/4 return the DIF of ijob 1/2', function t() {
	const r1 = solveBlocked( 'no-transpose', 1, 40, 37, BLK );
	const r2 = solveBlocked( 'no-transpose', 2, 40, 37, BLK );
	const r3 = solveBlocked( 'no-transpose', 3, 40, 37, BLK );
	const r4 = solveBlocked( 'no-transpose', 4, 40, 37, BLK );
	assert.equal( r3.info, 0, 'info ijob=3' );
	assert.equal( r4.info, 0, 'info ijob=4' );
	assert.ok( r3.dif > 0.0, 'DIF ijob=3 > 0' );
	assert.ok( r4.dif > 0.0, 'DIF ijob=4 > 0' );
	assertClose( r3.dif, r1.dif, 1.0e-14, 'DIF ijob=3 vs ijob=1' );
	assertClose( r4.dif, r2.dif, 1.0e-14, 'DIF ijob=4 vs ijob=2' );
});

test( 'dtgsyl.ndarray: blocked quasi-triangular residuals, transpose', function t() {
	const r = solveBlocked( 'transpose', 0, 40, 37, BLK );
	assert.equal( r.info, 0, 'info' );
	assert.equal( r.scale, 1.0, 'scale' );
	assert.ok( r.resid <= RTOL, 'residual ' + r.resid );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
});

test( 'dtgsyl.ndarray: blocked path rescales the whole solution when a block RHS is huge (no-transpose)', function t() {
	const opts = {
		'ablk': BLK.ablk,
		'bblk': BLK.bblk,
		'bigIndex': 39 // C(39,0): in the first block solved (last row block, first column block)
	};
	const r = solveBlocked( 'no-transpose', 0, 40, 37, opts );
	assert.equal( r.info, 0, 'info' );
	assert.ok( r.scale > 0.0 && r.scale < 1.0e-290, 'scale reduced: ' + r.scale );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= RTOL, 'residual ' + r.resid );
});

test( 'dtgsyl.ndarray: blocked path rescales the whole solution when a block RHS is huge (transpose)', function t() {
	const opts = {
		'ablk': BLK.ablk,
		'bblk': BLK.bblk,
		'bigIndex': 36 * 40 // C(0,36): in the first block solved (first row block, last column block)
	};
	const r = solveBlocked( 'transpose', 0, 40, 37, opts );
	assert.equal( r.info, 0, 'info' );
	assert.ok( r.scale > 0.0 && r.scale < 1.0e-290, 'scale reduced: ' + r.scale );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= RTOL, 'residual ' + r.resid );
});

test( 'dtgsyl.ndarray: blocked path reports a common generalized eigenvalue via info > 0 (no-transpose)', function t() {
	// (A,D)(39,39) = (2,1) and (B,E)(0,0) = (2,1) share eigenvalue 2: the 2x2 Kronecker subsystem is singular and dgetc2 perturbs its pivot.
	const opts = {
		'ablk': BLK.ablk,
		'bblk': BLK.bblk,
		'modify': function modify( A, B, D, E ) {
			A[ ( 39 * 40 ) + 39 ] = 2.0;
			D[ ( 39 * 40 ) + 39 ] = 1.0;
			B[ 0 ] = 2.0;
			E[ 0 ] = 1.0;
		}
	};
	const r = solveBlocked( 'no-transpose', 0, 40, 37, opts );
	assert.ok( r.info > 0, 'info > 0: ' + r.info );
	assert.ok( r.scale > 0.0 && r.scale <= 1.0, 'scale in (0,1]' );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );

	// The perturbed-pivot solution still solves a nearby system:
	assert.ok( r.resid <= 1.0e-12, 'residual ' + r.resid );
});

test( 'dtgsyl.ndarray: blocked path reports a common generalized eigenvalue via info > 0 (transpose)', function t() {
	const opts = {
		'ablk': BLK.ablk,
		'bblk': BLK.bblk,
		'modify': function modify( A, B, D, E ) {
			A[ 0 ] = 2.0;
			D[ 0 ] = 1.0;
			B[ ( 36 * 37 ) + 36 ] = 2.0;
			E[ ( 36 * 37 ) + 36 ] = 1.0;
		}
	};
	const r = solveBlocked( 'transpose', 0, 40, 37, opts );
	assert.ok( r.info > 0, 'info > 0: ' + r.info );
	assert.ok( r.scale > 0.0 && r.scale <= 1.0, 'scale in (0,1]' );
	assert.ok( allFinite( r.C ) && allFinite( r.F ), 'finite' );
	assert.ok( r.resid <= 1.0e-12, 'residual ' + r.resid );
});

test( 'dtgsyl base: M=0 or N=0 quick return sets scale=1 and, for ijob>0 no-transpose, dif=0', function t() {
	const scale = new Float64Array( [ 7.0 ] );
	const dif = new Float64Array( [ 7.0 ] );
	const Z = new Float64Array( 1 );
	let info = base( 'no-transpose', 1, 0, 3, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, scale, dif, Z, 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale' );
	assert.equal( dif[ 0 ], 0.0, 'dif' );
	scale[ 0 ] = 7.0;
	dif[ 0 ] = 7.0;
	info = base( 'transpose', 0, 3, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, Z, 1, 1, 0, scale, dif, Z, 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale' );
	assert.equal( dif[ 0 ], 7.0, 'dif untouched for transpose' );
});

test( 'dtgsyl.ndarray: blocked path rescales already-solved column blocks when a later block RHS is huge', function t() {
	// No-transpose solves column blocks left to right: C(39,36) sits in the second column block (js=32), so the rescale also touches columns 0..js-1. Transpose solves column blocks right to left: C(0,0) sits in the last-solved column block, so columns je+1..N-1 are rescaled.
	const cases = [ [ 'no-transpose', ( 36 * 40 ) + 39 ], [ 'transpose', 0 ] ];
	let r, k;
	for ( k = 0; k < cases.length; k++ ) {
		r = solveBlocked( cases[ k ][ 0 ], 0, 40, 37, {
		'ablk': BLK.ablk,
		'bblk': BLK.bblk,
			'bigIndex': cases[ k ][ 1 ]
		});
		assert.equal( r.info, 0, cases[ k ][ 0 ] + ': info' );
		assert.ok( r.scale > 0.0 && r.scale < 1.0e-290, cases[ k ][ 0 ] + ': scale reduced: ' + r.scale );
		assert.ok( allFinite( r.C ) && allFinite( r.F ), cases[ k ][ 0 ] + ': finite' );
		assert.ok( r.resid <= RTOL, cases[ k ][ 0 ] + ': residual ' + r.resid );
	}
});

// The reference's block sizes are MB = ILAENV( 2, 'DTGSYL' ) = 2 and NB = ILAENV( 5, 'DTGSYL' ) = 2, so every M > 2 or N > 2 takes the blocked solver. Its block starts (`IWORK(1:P+1)` rows, `IWORK(P+2:Q+1)` columns) are left in IWORK; a 2x2 bump extends a block, and a last single row/column joins the previous block (`IF( I.GE.M )`).
test( 'dtgsyl.ndarray: notrans 5x4 IJOB=1 uses the reference block structure (bump in A, merged last row)', function t() {
	const IWORK = runBlocked( notrans_5x4_ijob1_blocked, 'no-transpose', 1, 5, 4, 3, 0 );
	assert.deepEqual( Array.from( IWORK.slice( 0, 6 ) ), [ 0, 3, 5, 0, 2, 4 ], 'block starts' );
});

test( 'dtgsyl.ndarray: trans 5x4 blocked', function t() {
	const IWORK = runBlocked( trans_5x4_blocked, 'transpose', 0, 5, 4, 3, 0 );
	assert.deepEqual( Array.from( IWORK.slice( 0, 6 ) ), [ 0, 3, 5, 0, 2, 4 ], 'block starts' );
});

test( 'dtgsyl.ndarray: notrans 5x5 IJOB=2 (the last single row and column join the previous block)', function t() {
	const IWORK = runBlocked( notrans_5x5_ijob2_merge, 'no-transpose', 2, 5, 5, 0, 0 );
	assert.deepEqual( Array.from( IWORK.slice( 0, 6 ) ), [ 0, 2, 5, 0, 2, 5 ], 'block starts' );
});

test( 'dtgsyl.ndarray: notrans 7x6 with a 2x2 bump in B', function t() {
	const IWORK = runBlocked( notrans_7x6_bumpB, 'no-transpose', 0, 7, 6, 0, 3 );
	assert.deepEqual( Array.from( IWORK.slice( 0, 7 ) ), [ 0, 2, 4, 7, 0, 3, 6 ], 'block starts' );
});

test( 'dtgsyl.ndarray: trans 7x6 with a 2x2 bump in B', function t() {
	const IWORK = runBlocked( trans_7x6_bumpB, 'transpose', 0, 7, 6, 0, 3 );
	assert.deepEqual( Array.from( IWORK.slice( 0, 7 ) ), [ 0, 2, 4, 7, 0, 3, 6 ], 'block starts' );
});

test( 'dtgsyl.ndarray: notrans 5x4 IJOB=3 blocked', function t() {
	runBlocked( notrans_5x4_ijob3_blocked, 'no-transpose', 3, 5, 4, 3, 0 );
});

test( 'dtgsyl.ndarray: WORK of length 1 suffices (the reference LWMIN) when IJOB = 0, IJOB >= 3 or TRANS = T, on the blocked path', function t() {
	runBlocked( notrans_7x6_bumpB, 'no-transpose', 0, 7, 6, 0, 3, 1 );
	runBlocked( trans_7x6_bumpB, 'transpose', 0, 7, 6, 0, 3, 1 );
	runBlocked( trans_5x4_blocked, 'transpose', 0, 5, 4, 3, 0, 1 );
	runBlocked( notrans_5x4_ijob3_blocked, 'no-transpose', 3, 5, 4, 3, 0, 1 );
});

test( 'dtgsyl.ndarray: IJOB = 1 or 2 with TRANS = N needs WORK of 2*M*N (one less throws)', function t() {
	runBlocked( notrans_5x4_ijob1_blocked, 'no-transpose', 1, 5, 4, 3, 0, 40 );
	runBlocked( notrans_5x5_ijob2_merge, 'no-transpose', 2, 5, 5, 0, 0, 50 );
	assert.throws( function throws() {
		runBlocked( notrans_5x4_ijob1_blocked, 'no-transpose', 1, 5, 4, 3, 0, 39 );
	}, RangeError );
	assert.throws( function throws() {
		runBlocked( notrans_7x6_bumpB, 'no-transpose', 0, 7, 6, 0, 3, 0 );
	}, RangeError );
});
