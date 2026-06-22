// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunmrq from './../lib/ndarray.js';

// FIXTURES //

import left_notrans_4x3 from './fixtures/left_notrans_4x3.json' with { type: 'json' };
import left_conjtrans_4x3 from './fixtures/left_conjtrans_4x3.json' with { type: 'json' };
import right_notrans_3x4 from './fixtures/right_notrans_3x4.json' with { type: 'json' };
import right_conjtrans_3x4 from './fixtures/right_conjtrans_3x4.json' with { type: 'json' };
import large_left_notrans from './fixtures/large_left_notrans.json' with { type: 'json' };
import large_right_conjtrans from './fixtures/large_right_conjtrans.json' with { type: 'json' };

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
* Converts row-major packed data to column-major for a KxNQ matrix.
*/
function rowToCol( rowData, K, NQ ) {
	var col = new Float64Array( K * NQ * 2 );
	var ri;
	var ci;
	var i;
	var j;
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < NQ; j++ ) {
			ri = ( i * NQ + j ) * 2;
			ci = ( j * K + i ) * 2;
			col[ ci ] = rowData[ ri ];
			col[ ci + 1 ] = rowData[ ri + 1 ];
		}
	}
	return col;
}

function extractC( C, M, N ) {
	var Cv = reinterpret( C, 0 );
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( Cv[ ( j * M + i ) * 2 ] );
			out.push( Cv[ ( j * M + i ) * 2 + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zunmrq: left, no-transpose, 4x3, K=3', function t() {
	var tc = left_notrans_4x3;
	var K = 3;
	var M = 4;
	var N = 3;
	var NQ = M; // left => NQ = M
	var Acm = rowToCol( tc.A, K, NQ );
	var A = new Complex128Array( Acm );
	var TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	var Cin = new Float64Array( [
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.3,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.2, -0.1,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -0.3, 0.4
	] );
	var C = new Complex128Array( Cin );
	var WORK = new Complex128Array( ( N * 32 ) + ( 33 * 32 ) );

	var info = zunmrq( 'left', 'no-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: left, conjugate-transpose, 4x3, K=3', function t() {
	var tc = left_conjtrans_4x3;
	var tcA = left_notrans_4x3;
	var K = 3;
	var M = 4;
	var N = 3;
	var NQ = M;
	var Acm = rowToCol( tcA.A, K, NQ );
	var A = new Complex128Array( Acm );
	var TAU = new Complex128Array( new Float64Array( tcA.TAU ) );
	var Cin = new Float64Array( [
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.3,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.2, -0.1,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -0.3, 0.4
	] );
	var C = new Complex128Array( Cin );
	var WORK = new Complex128Array( ( N * 32 ) + ( 33 * 32 ) );

	var info = zunmrq( 'left', 'conjugate-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: right, no-transpose, 3x4, K=3', function t() {
	var tc = right_notrans_3x4;
	var tcA = left_notrans_4x3;
	var K = 3;
	var M = 3;
	var N = 4;
	var NQ = N; // right => NQ = N
	var Acm = rowToCol( tcA.A, K, NQ );
	var A = new Complex128Array( Acm );
	var TAU = new Complex128Array( new Float64Array( tcA.TAU ) );
	var Cin = new Float64Array( [
		1.0, 0.5, 0.0, 0.0, 0.3, -0.2,
		0.0, 0.0, 1.0, -0.5, 0.7, 0.1,
		2.0, 0.0, 3.0, 1.0, -0.5, 0.0,
		-1.0, 0.5, 0.5, 0.0, 1.0, 1.0
	] );
	var C = new Complex128Array( Cin );
	var WORK = new Complex128Array( ( M * 32 ) + ( 33 * 32 ) );

	var info = zunmrq( 'right', 'no-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: right, conjugate-transpose, 3x4, K=3', function t() {
	var tc = right_conjtrans_3x4;
	var tcA = left_notrans_4x3;
	var K = 3;
	var M = 3;
	var N = 4;
	var NQ = N;
	var Acm = rowToCol( tcA.A, K, NQ );
	var A = new Complex128Array( Acm );
	var TAU = new Complex128Array( new Float64Array( tcA.TAU ) );
	var Cin = new Float64Array( [
		1.0, 0.5, 0.0, 0.0, 0.3, -0.2,
		0.0, 0.0, 1.0, -0.5, 0.7, 0.1,
		2.0, 0.0, 3.0, 1.0, -0.5, 0.0,
		-1.0, 0.5, 0.5, 0.0, 1.0, 1.0
	] );
	var C = new Complex128Array( Cin );
	var WORK = new Complex128Array( ( M * 32 ) + ( 33 * 32 ) );

	var info = zunmrq( 'right', 'conjugate-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: quick return M=0, N=0, K=0', function t() {
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunmrq( 'left', 'no-transpose', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunmrq: large K=35, blocked path (left, no-transpose)', function t() {
	var tc = large_left_notrans;
	var K = tc.K;
	var M = tc.M;
	var N = tc.N;
	var NQ = M; // left => NQ = M
	var Acm = rowToCol( tc.A, K, NQ );
	var A = new Complex128Array( Acm );
	var TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	// Reconstruct C input using same deterministic formula as Fortran
	var Cin = new Float64Array( M * N * 2 );
	var ci;
	var re;
	var im;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			re = ( ( (i + 1) * 3 + (j + 1) * 7 ) % 11 ) - 5.0;
			im = ( ( (i + 1) * 2 + (j + 1) * 5 ) % 7 ) - 3.0;
			ci = ( j * M + i ) * 2;
			Cin[ ci ] = re;
			Cin[ ci + 1 ] = im;
		}
	}
	var C = new Complex128Array( Cin );
	var WORK = new Complex128Array( ( N * 32 ) + ( 33 * 32 ) );

	var info = zunmrq( 'left', 'no-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-10, 'C' );
});

test( 'zunmrq: large K=35, blocked path (right, conj-transpose)', function t() {
	var tc = large_right_conjtrans;
	var K = tc.K;
	var M = tc.M;
	var N = tc.N;
	var NQ = N; // right => NQ = N
	var Acm = rowToCol( tc.A, K, NQ );
	var A = new Complex128Array( Acm );
	var TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	// Reconstruct C input
	var Cin = new Float64Array( M * N * 2 );
	var ci;
	var re;
	var im;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			re = ( ( (i + 1) * 3 + (j + 1) * 7 ) % 11 ) - 5.0;
			im = ( ( (i + 1) * 2 + (j + 1) * 5 ) % 7 ) - 3.0;
			ci = ( j * M + i ) * 2;
			Cin[ ci ] = re;
			Cin[ ci + 1 ] = im;
		}
	}
	var C = new Complex128Array( Cin );
	var WORK = new Complex128Array( ( M * 32 ) + ( 33 * 32 ) );

	var info = zunmrq( 'right', 'conjugate-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-10, 'C' );
});
