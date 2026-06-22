/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtgsyl from './../lib/ndarray.js';

// FIXTURES //

import notrans_2x2 from './fixtures/notrans_2x2.json' with { type: 'json' };
import notrans_3x2_quasi from './fixtures/notrans_3x2_quasi.json' with { type: 'json' };
import trans_2x2 from './fixtures/trans_2x2.json' with { type: 'json' };
import trans_3x2_quasi from './fixtures/trans_3x2_quasi.json' with { type: 'json' };
import trans_3x3_quasi from './fixtures/trans_3x3_quasi.json' with { type: 'json' };
import notrans_3x3_quasi from './fixtures/notrans_3x3_quasi.json' with { type: 'json' };
import notrans_2x2_ijob1 from './fixtures/notrans_2x2_ijob1.json' with { type: 'json' };


// VARIABLES //

var TOL = 1e-9;


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

function packMatrix( entries, M, N ) {
	var A = new Float64Array( M * N );
	var i;
	for ( i = 0; i < entries.length; i += 3 ) {
		A[ entries[ i + 1 ] * M + entries[ i ] ] = entries[ i + 2 ];
	}
	return A;
}

function extractMatrix( A, LDA, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}

function allFinite( arr ) {
	var i;
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
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		A[ j * N + j ] = dval + (0.01 * j);
		for ( i = 0; i < j; i++ ) {
			// Small upper-triangular entries
			A[ j * N + i ] = 0.001 * ( ( i + j ) % 5 );
		}
	}
	return A;
}


// TESTS //

test( 'dtgsyl.ndarray: main export is a function', function t() {
	assert.strictEqual( typeof dtgsyl, 'function', 'main export is a function' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=0', function t() {
	var tc = notrans_2x2;
	var M = 2;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	var B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	var F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: trans 2x2 IJOB=0', function t() {
	var tc = trans_2x2;
	var M = 2;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	var B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	var F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: notrans 3x2 quasi-triangular IJOB=0', function t() {
	var tc = notrans_3x2_quasi;
	var M = 3;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M);
	var B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	var F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: trans 3x2 quasi-triangular IJOB=0', function t() {
	var tc = trans_3x2_quasi;
	var M = 3;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 0, 2, 0.3, 1, 0, -0.5, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 3.0 ], M, M);
	var B = packMatrix([ 0, 0, 2.0, 0, 1, 0.4, 1, 1, 5.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.2, 1, 1, 1.5, 1, 2, 0.3, 2, 2, 2.0 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 3.0 ], N, N);
	var F = new Float64Array([ 7.0, 9.0, 11.0, 8.0, 10.0, 12.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: notrans 3x3 quasi-triangular IJOB=0', function t() {
	var tc = notrans_3x3_quasi;
	var M = 3;
	var N = 3;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M);
	var B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N);
	var C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N);
	var F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: trans 3x3 quasi-triangular IJOB=0', function t() {
	var tc = trans_3x3_quasi;
	var M = 3;
	var N = 3;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.4, 0, 2, 0.1, 1, 0, -0.4, 1, 1, 1.0, 1, 2, 0.2, 2, 2, 5.0 ], M, M);
	var B = packMatrix([ 0, 0, 2.0, 0, 1, 0.3, 0, 2, 0.1, 1, 0, -0.3, 1, 1, 2.0, 1, 2, 0.2, 2, 2, 6.0 ], N, N);
	var C = new Float64Array([ 1.0, 4.0, 7.0, 2.0, 5.0, 8.0, 3.0, 6.0, 9.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 0, 2, 0.05, 1, 1, 1.5, 1, 2, 0.2, 2, 2, 2.0 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 0, 2, 0.1, 1, 1, 2.5, 1, 2, 0.15, 2, 2, 3.0 ], N, N);
	var F = new Float64Array([ 10.0, 13.0, 16.0, 11.0, 14.0, 17.0, 12.0, 15.0, 18.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});


// IJOB MODES (no-transpose only) //

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=1 (Frobenius DIF estimate)', function t() {
	var tc = notrans_2x2_ijob1;
	var M = 2;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	var B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	var F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, TOL, 'scale' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
	assertArrayClose( extractMatrix( C, M, M, N ), tc.C, TOL, 'C' );
	assertArrayClose( extractMatrix( F, M, M, N ), tc.F, TOL, 'F' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=2 (1-norm DIF estimate)', function t() {
	var M = 2;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	var B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	var F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 2, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=3 (zeros C/F, computes DIF only)', function t() {
	var M = 2;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	var B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	var F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 3, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'dtgsyl.ndarray: notrans 2x2 IJOB=4 (zeros C/F, 1-norm DIF only)', function t() {
	var M = 2;
	var N = 2;
	var A = packMatrix([ 0, 0, 1.0, 0, 1, 0.5, 1, 1, 2.0 ], M, M);
	var B = packMatrix([ 0, 0, 3.0, 0, 1, 0.3, 1, 1, 4.0 ], N, N);
	var C = new Float64Array([ 1.0, 3.0, 2.0, 4.0 ]);
	var D = packMatrix([ 0, 0, 1.0, 0, 1, 0.2, 1, 1, 1.5 ], M, M);
	var E = packMatrix([ 0, 0, 1.0, 0, 1, 0.1, 1, 1, 2.0 ], N, N);
	var F = new Float64Array([ 5.0, 7.0, 6.0, 8.0 ]);
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 400 );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 4, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 400, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});


// QUICK RETURN //

test( 'dtgsyl.ndarray: M=0 N=0 quick return notrans IJOB=0', function t() {
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var C = new Float64Array( 1 );
	var D = new Float64Array( 1 );
	var E = new Float64Array( 1 );
	var F = new Float64Array( 1 );
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var IWORK = new Int32Array( 10 );
	var info = dtgsyl( 'no-transpose', 0, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, 1, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale=1' );
});

test( 'dtgsyl.ndarray: M=0 N=0 quick return notrans IJOB=1 (zeros dif)', function t() {
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var C = new Float64Array( 1 );
	var D = new Float64Array( 1 );
	var E = new Float64Array( 1 );
	var F = new Float64Array( 1 );
	var scale = new Float64Array( 1 );
	var dif = new Float64Array([ 99.0 ]);
	var WORK = new Float64Array( 1 );
	var IWORK = new Int32Array( 10 );
	var info = dtgsyl( 'no-transpose', 1, 0, 0, A, 1, 1, 0, B, 1, 1, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 1, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, 1, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale=1' );
	assert.equal( dif[ 0 ], 0.0, 'dif=0 quick return' );
});

test( 'dtgsyl.ndarray: M=0 quick return transpose', function t() {
	var A = new Float64Array( 1 );
	var B = new Float64Array( 4 );
	var C = new Float64Array( 1 );
	var D = new Float64Array( 1 );
	var E = new Float64Array( 4 );
	var F = new Float64Array( 1 );
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var IWORK = new Int32Array( 10 );
	var info = dtgsyl( 'transpose', 0, 0, 2, A, 1, 1, 0, B, 1, 2, 0, C, 1, 1, 0, D, 1, 1, 0, E, 1, 2, 0, F, 1, 1, 0, scale, dif, WORK, 1, 0, 1, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( scale[ 0 ], 1.0, 'scale=1' );
});


// BLOCKED PATH (M > 32 or N > 32) //

test( 'dtgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=0', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTri( M, 2.0 );
	var B = buildUpperTri( N, 3.0 );
	var D = buildUpperTri( M, 1.0 );
	var E = buildUpperTri( N, 1.0 );
	var i;
	var C = new Float64Array( M * N );
	var F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
});

test( 'dtgsyl.ndarray: blocked path trans M=40 N=40 IJOB=0', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTri( M, 2.0 );
	var B = buildUpperTri( N, 3.0 );
	var D = buildUpperTri( M, 1.0 );
	var E = buildUpperTri( N, 1.0 );
	var i;
	var C = new Float64Array( M * N );
	var F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( scale[ 0 ] > 0, 'scale > 0' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
});

test( 'dtgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=1 (uses isolve=2 round)', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTri( M, 2.0 );
	var B = buildUpperTri( N, 3.0 );
	var D = buildUpperTri( M, 1.0 );
	var E = buildUpperTri( N, 1.0 );
	var i;
	var C = new Float64Array( M * N );
	var F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 1, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
	assert.ok( allFinite( C ), 'C finite' );
});

test( 'dtgsyl.ndarray: blocked path notrans M=40 N=40 IJOB=3 (zeros C/F)', function t() {
	var M = 40;
	var N = 40;
	var A = buildUpperTri( M, 2.0 );
	var B = buildUpperTri( N, 3.0 );
	var D = buildUpperTri( M, 1.0 );
	var E = buildUpperTri( N, 1.0 );
	var i;
	var C = new Float64Array( M * N );
	var F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = 0.5;
		F[ i ] = 0.7;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 3, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( C ), 'C finite' );
	assert.ok( allFinite( F ), 'F finite' );
	assert.ok( dif[ 0 ] > 0, 'dif > 0' );
});

test( 'dtgsyl.ndarray: blocked path with quasi-triangular 2x2 block at boundary', function t() {
	// Place a 2x2 quasi-triangular block straddling the mb=32 partition boundary
	// to exercise the partitioning skip-row logic on line 207-208.
	var M = 34;
	var N = 34;
	var A = buildUpperTri( M, 2.0 );
	// Add subdiagonal at row 32 to make a 2x2 block
	A[ 31 * M + 32 ] = 0.5;
	var B = buildUpperTri( N, 3.0 );
	B[ 31 * N + 32 ] = 0.4;
	var D = buildUpperTri( M, 1.0 );
	var E = buildUpperTri( N, 1.0 );
	var i;
	var C = new Float64Array( M * N );
	var F = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		C[ i ] = ( ( i + 1 ) % 7 ) * 0.1;
		F[ i ] = ( ( i + 2 ) % 5 ) * 0.2;
	}
	var scale = new Float64Array( 1 );
	var dif = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * M * N );
	var IWORK = new Int32Array( M + N + 6 );
	var info = dtgsyl( 'no-transpose', 0, M, N, A, 1, M, 0, B, 1, N, 0, C, 1, M, 0, D, 1, M, 0, E, 1, N, 0, F, 1, M, 0, scale, dif, WORK, 1, 0, 2 * M * N, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( allFinite( C ), 'C finite' );
});
