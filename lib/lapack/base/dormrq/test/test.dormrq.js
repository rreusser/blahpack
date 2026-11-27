/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgerqf from './../../dgerqf/lib/base.js';
import dormrq from './../lib/dormrq.js';
import dormrqNd from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns the dgerqf factorization (column-major, LDA = K) of a deterministic K-by-nq matrix.
*
* @private
* @param {integer} nq - order of Q
* @param {integer} K - number of reflectors
* @returns {Object} reflectors `A` and scalar factors `TAU`
*/
function factor( nq, K ) {
	const rows = K;
	const cols = nq;
	const TAU = new Float64Array( K );
	const A = new Float64Array( rows * cols );
	let i;
	for ( i = 0; i < A.length; i++ ) {
		A[ i ] = ( ( ( i * 13 ) % 17 ) / 8.0 ) - 1.0 + ( ( i % ( rows + 1 ) === 0 ) ? 3.0 : 0.0 );
	}
	dgerqf( rows, cols, A, 1, rows, 0, TAU, 1, 0, new Float64Array( ( rows * cols ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU,
		'rows': rows,
		'cols': cols
	};
}

/**
* Applies Q via the wrapper with `WORK = null` (both layouts) and compares against the ndarray interface given an ample workspace.
*
* @private
* @param {string} side - side
* @param {string} trans - transpose
* @param {integer} M - rows of C
* @param {integer} N - columns of C
* @param {integer} K - number of reflectors
*/
function checkNullWork( side, trans, M, N, K ) {
	const f = factor( ( side === 'left' ) ? M : N, K );
	const C0 = new Float64Array( M * N );
	const msg = side + '/' + trans + ' ' + M + 'x' + N + ' K=' + K;
	let expected;
	let Arow;
	let Crow;
	let info;
	let e;
	let C;
	let i;
	let j;
	for ( i = 0; i < C0.length; i++ ) {
		C0[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	expected = new Float64Array( C0 );
	dormrqNd( side, trans, M, N, K, new Float64Array( f.A ), 1, f.rows, 0, f.TAU, 1, 0, expected, 1, M, 0, new Float64Array( ( Math.max( M, N ) * 32 ) + 4096 ), 1, 0 );

	C = new Float64Array( C0 );
	info = dormrq( 'column-major', side, trans, M, N, K, new Float64Array( f.A ), f.rows, f.TAU, 1, C, M, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	assert.deepStrictEqual( C, expected, msg + ' column-major' );

	Arow = new Float64Array( f.rows * f.cols );
	for ( i = 0; i < f.rows; i++ ) {
		for ( j = 0; j < f.cols; j++ ) {
			Arow[ ( i * f.cols ) + j ] = f.A[ i + ( j * f.rows ) ];
		}
	}
	Crow = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Crow[ ( i * N ) + j ] = C0[ i + ( j * M ) ];
		}
	}
	info = dormrq( 'row-major', side, trans, M, N, K, Arow, f.cols, f.TAU, 1, Crow, N, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			// Row-major traverses C in a different order, so agree up to rounding:
			e = expected[ i + ( j * M ) ];
			assert.ok( Math.abs( Crow[ ( i * N ) + j ] - e ) <= 1e-13 * Math.max( 1.0, Math.abs( e ) ), msg + ' row-major C[' + i + ',' + j + ']' );
		}
	}
}


// TESTS //

test( 'dormrq is a function', function t() {
	assert.strictEqual( typeof dormrq, 'function', 'is a function' );
});

test( 'dormrq has expected arity', function t() {
	assert.strictEqual( dormrq.length, 13, 'has expected arity' );
});

test( 'dormrq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormrq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormrq( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormrq: WORK = null allocates the blocked workspace (K > 32)', function t() {
	checkNullWork( 'left', 'no-transpose', 40, 3, 40 );
	checkNullWork( 'left', 'transpose', 40, 3, 36 );
	checkNullWork( 'right', 'no-transpose', 3, 40, 40 );
	checkNullWork( 'right', 'transpose', 3, 40, 36 );
});

test( 'dormrq: WORK = null with side=right sizes the workspace by M (M > N)', function t() {
	checkNullWork( 'right', 'no-transpose', 6, 4, 3 );
	checkNullWork( 'right', 'transpose', 6, 4, 4 );
});

test( 'dormrq: wrapper WORK = null result is orthogonal (Q^T Q = I, K = 40)', function t() {
	const n = 40;
	const f = factor( n, n );
	const Q = new Float64Array( n * n );
	let i;
	let j;
	for ( i = 0; i < n; i++ ) {
		Q[ i + ( i * n ) ] = 1.0;
	}
	dormrq( 'column-major', 'left', 'no-transpose', n, n, n, new Float64Array( f.A ), n, f.TAU, 1, Q, n, null );
	dormrq( 'column-major', 'left', 'transpose', n, n, n, new Float64Array( f.A ), n, f.TAU, 1, Q, n, null );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			assert.ok( Math.abs( Q[ i + ( j * n ) ] - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-13, 'Q^T Q [' + i + ',' + j + ']' );
		}
	}
});
