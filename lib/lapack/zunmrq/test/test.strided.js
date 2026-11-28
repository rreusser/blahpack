// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerq2 from '../../zgerq2/lib/base.js';
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
* Converts row-major packed data to column-major for a KxNQ matrix.
*/
function rowToCol( rowData, K, NQ ) {
	const col = new Float64Array( K * NQ * 2 );
	let ri, ci, i, j;
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
	const Cv = reinterpret( C, 0 );
	const out = [];
	let i, j;
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
	const tc = left_notrans_4x3;
	const K = 3;
	const M = 4;
	const N = 3;
	const NQ = M; // left => NQ = M
	const Acm = rowToCol( tc.A, K, NQ );
	const A = new Complex128Array( Acm );
	const TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	const Cin = new Float64Array( [
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.3,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.2, -0.1,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -0.3, 0.4
	] );
	const C = new Complex128Array( Cin );
	const WORK = new Complex128Array( ( N * 32 ) + ( 65 * 64 ) );

	const info = zunmrq( 'left', 'no-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: left, conjugate-transpose, 4x3, K=3', function t() {
	const tc = left_conjtrans_4x3;
	const tcA = left_notrans_4x3;
	const K = 3;
	const M = 4;
	const N = 3;
	const NQ = M;
	const Acm = rowToCol( tcA.A, K, NQ );
	const A = new Complex128Array( Acm );
	const TAU = new Complex128Array( new Float64Array( tcA.TAU ) );
	const Cin = new Float64Array( [
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.3,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.2, -0.1,
		0.0, 0.0, 0.0, 0.0, 1.0, 0.0, -0.3, 0.4
	] );
	const C = new Complex128Array( Cin );
	const WORK = new Complex128Array( ( N * 32 ) + ( 65 * 64 ) );

	const info = zunmrq( 'left', 'conjugate-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: right, no-transpose, 3x4, K=3', function t() {
	const tc = right_notrans_3x4;
	const tcA = left_notrans_4x3;
	const K = 3;
	const M = 3;
	const N = 4;
	const NQ = N; // right => NQ = N
	const Acm = rowToCol( tcA.A, K, NQ );
	const A = new Complex128Array( Acm );
	const TAU = new Complex128Array( new Float64Array( tcA.TAU ) );
	const Cin = new Float64Array( [
		1.0, 0.5, 0.0, 0.0, 0.3, -0.2,
		0.0, 0.0, 1.0, -0.5, 0.7, 0.1,
		2.0, 0.0, 3.0, 1.0, -0.5, 0.0,
		-1.0, 0.5, 0.5, 0.0, 1.0, 1.0
	] );
	const C = new Complex128Array( Cin );
	const WORK = new Complex128Array( ( M * 32 ) + ( 65 * 64 ) );

	const info = zunmrq( 'right', 'no-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: right, conjugate-transpose, 3x4, K=3', function t() {
	const tc = right_conjtrans_3x4;
	const tcA = left_notrans_4x3;
	const K = 3;
	const M = 3;
	const N = 4;
	const NQ = N;
	const Acm = rowToCol( tcA.A, K, NQ );
	const A = new Complex128Array( Acm );
	const TAU = new Complex128Array( new Float64Array( tcA.TAU ) );
	const Cin = new Float64Array( [
		1.0, 0.5, 0.0, 0.0, 0.3, -0.2,
		0.0, 0.0, 1.0, -0.5, 0.7, 0.1,
		2.0, 0.0, 3.0, 1.0, -0.5, 0.0,
		-1.0, 0.5, 0.5, 0.0, 1.0, 1.0
	] );
	const C = new Complex128Array( Cin );
	const WORK = new Complex128Array( ( M * 32 ) + ( 65 * 64 ) );

	const info = zunmrq( 'right', 'conjugate-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-12, 'C' );
});

test( 'zunmrq: quick return M=0, N=0, K=0', function t() {
	const A = new Complex128Array( 1 );
	const TAU = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const info = zunmrq( 'left', 'no-transpose', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zunmrq: large K=35, blocked path (left, no-transpose)', function t() {
	const tc = large_left_notrans;
	const K = tc.K;
	const M = tc.M;
	const N = tc.N;
	const NQ = M; // left => NQ = M
	const Acm = rowToCol( tc.A, K, NQ );
	const A = new Complex128Array( Acm );
	const TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	// Reconstruct C input using same deterministic formula as Fortran
	const Cin = new Float64Array( M * N * 2 );
	let ci, re, im, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			re = ( ( (i + 1) * 3 + (j + 1) * 7 ) % 11 ) - 5.0;
			im = ( ( (i + 1) * 2 + (j + 1) * 5 ) % 7 ) - 3.0;
			ci = ( j * M + i ) * 2;
			Cin[ ci ] = re;
			Cin[ ci + 1 ] = im;
		}
	}
	const C = new Complex128Array( Cin );
	const WORK = new Complex128Array( ( N * 32 ) + ( 65 * 64 ) );

	const info = zunmrq( 'left', 'no-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-10, 'C' );
});

test( 'zunmrq: large K=35, blocked path (right, conj-transpose)', function t() {
	const tc = large_right_conjtrans;
	const K = tc.K;
	const M = tc.M;
	const N = tc.N;
	const NQ = N; // right => NQ = N
	const Acm = rowToCol( tc.A, K, NQ );
	const A = new Complex128Array( Acm );
	const TAU = new Complex128Array( new Float64Array( tc.TAU ) );
	// Reconstruct C input
	const Cin = new Float64Array( M * N * 2 );
	let ci, re, im, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			re = ( ( (i + 1) * 3 + (j + 1) * 7 ) % 11 ) - 5.0;
			im = ( ( (i + 1) * 2 + (j + 1) * 5 ) % 7 ) - 3.0;
			ci = ( j * M + i ) * 2;
			Cin[ ci ] = re;
			Cin[ ci + 1 ] = im;
		}
	}
	const C = new Complex128Array( Cin );
	const WORK = new Complex128Array( ( M * 32 ) + ( 65 * 64 ) );

	const info = zunmrq( 'right', 'conjugate-transpose', M, N, K, A, 1, K, 0, TAU, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( extractC( C, M, N ), tc.C, 1e-10, 'C' );
});


// WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

/**
* Applies op(Q), from the factorization of a deterministic N-by-N matrix, to a deterministic N-by-N matrix C (M = N = K) with a workspace of the given length.
*
* @private
* @param {string} side - operation side
* @param {string} trans - transpose operation
* @param {PositiveInteger} N - order of the matrices
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} the result, as interleaved components
*/
function wsApply( side, trans, N, lwork ) {
	const TAU = new Complex128Array( N );
	const A = new Complex128Array( N * N );
	const C = new Complex128Array( N * N );
	let i;
	const Av = reinterpret( A, 0 );
	const Cv = reinterpret( C, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		Av[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		Cv[ i ] = Math.cos( ( 0.23 * i ) + 0.7 );
	}
	zgerq2( N, N, A, 1, N, 0, TAU, 1, 0, new Complex128Array( N ), 1, 0 );
	const info = zunmrq( side, trans, N, N, N, A, 1, N, 0, TAU, 1, 0, C, 1, N, 0, new Complex128Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return reinterpret( C, 0 );
}

/**
* Asserts that two arrays agree to a tolerance relative to the largest magnitude of the expected array.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function wsAssertClose( actual, expected, tol, msg ) {
	let scale = 0.0;
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		scale = Math.max( scale, Math.abs( expected[ i ] ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		if ( !( Math.abs( actual[ i ] - expected[ i ] ) <= tol * scale ) ) {
			assert.fail( msg + ': index ' + i + ', expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

test( 'zunmrq: M=N=K=70 with WORK of the reference minimum max(1,N) matches the optimum (unblocked fallback)', function t() {
	const N = 70;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
			const opt = wsApply( side, trans, N, ( N * 32 ) + 4160 );
			const lo = wsApply( side, trans, N, N );
			wsAssertClose( lo, opt, 1e-11, side + '/' + trans );
		});
	});
});

test( 'zunmrq: M=N=K=150 with WORK for a shrunk block size NB=8 matches the optimum', function t() {
	const N = 150;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
			const opt = wsApply( side, trans, N, ( N * 32 ) + 4160 );
			const mid = wsApply( side, trans, N, ( N * 8 ) + 4160 );
			wsAssertClose( mid, opt, 1e-11, side + '/' + trans );
		});
	});
});

test( 'zunmrq: throws when WORK is missing or one element below the minimum max(1,nw) (K > NB)', function t() {
	const N = 70;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		assert.throws( function throws() {
			zunmrq( side, 'no-transpose', N, N, N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N - 1 ), 1, 0 );
		}, RangeError );
		assert.throws( function throws() {
			zunmrq( side, 'no-transpose', N, N, N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N ), 1, 0, new Complex128Array( N * N ), 1, N, 0, null, 1, 0 );
		}, RangeError );
	});
});
