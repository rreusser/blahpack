/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgeqlf from './../../dgeqlf/lib/base.js';
import dormql from './../lib/dormql.js';
import dormqlNd from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns the dgeqlf factorization (column-major, LDA = nq) of a deterministic nq-by-K matrix.
*
* @private
* @param {integer} nq - order of Q
* @param {integer} K - number of reflectors
* @returns {Object} reflectors `A` and scalar factors `TAU`
*/
function factor( nq, K ) {
	const rows = nq;
	const cols = K;
	const TAU = new Float64Array( K );
	const A = new Float64Array( rows * cols );
	let i;
	for ( i = 0; i < A.length; i++ ) {
		A[ i ] = ( ( ( i * 13 ) % 17 ) / 8.0 ) - 1.0 + ( ( i % ( rows + 1 ) === 0 ) ? 3.0 : 0.0 );
	}
	dgeqlf( rows, cols, A, 1, rows, 0, TAU, 1, 0, new Float64Array( ( rows * cols ) + 4096 ), 1, 0 );
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
	dormqlNd( side, trans, M, N, K, new Float64Array( f.A ), 1, f.rows, 0, f.TAU, 1, 0, expected, 1, M, 0, new Float64Array( ( Math.max( M, N ) * 32 ) + 4096 ), 1, 0 );

	C = new Float64Array( C0 );
	info = dormql( 'column-major', side, trans, M, N, K, new Float64Array( f.A ), f.rows, f.TAU, 1, C, M, null );
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
	info = dormql( 'row-major', side, trans, M, N, K, Arow, f.cols, f.TAU, 1, Crow, N, null );
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

test( 'dormql is a function', function t() {
	assert.strictEqual( typeof dormql, 'function', 'is a function' );
});

test( 'dormql has expected arity', function t() {
	assert.strictEqual( dormql.length, 13, 'has expected arity' );
});

test( 'dormql throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormql throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormql throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormql throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormql throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormql: WORK = null allocates the blocked workspace (K > 32)', function t() {
	checkNullWork( 'left', 'no-transpose', 40, 3, 40 );
	checkNullWork( 'left', 'transpose', 40, 3, 36 );
	checkNullWork( 'right', 'no-transpose', 3, 40, 40 );
	checkNullWork( 'right', 'transpose', 3, 40, 36 );
});

test( 'dormql: WORK = null with side=right sizes the workspace by M (M > N)', function t() {
	checkNullWork( 'right', 'no-transpose', 6, 4, 3 );
	checkNullWork( 'right', 'transpose', 6, 4, 4 );
});

test( 'dormql: wrapper WORK = null result is orthogonal (Q^T Q = I, K = 40)', function t() {
	const n = 40;
	const f = factor( n, n );
	const Q = new Float64Array( n * n );
	let i;
	let j;
	for ( i = 0; i < n; i++ ) {
		Q[ i + ( i * n ) ] = 1.0;
	}
	dormql( 'column-major', 'left', 'no-transpose', n, n, n, new Float64Array( f.A ), n, f.TAU, 1, Q, n, null );
	dormql( 'column-major', 'left', 'transpose', n, n, n, new Float64Array( f.A ), n, f.TAU, 1, Q, n, null );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			assert.ok( Math.abs( Q[ i + ( j * n ) ] - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-13, 'Q^T Q [' + i + ',' + j + ']' );
		}
	}
});

test( 'dormql: a caller WORK one element short of the reference minimum throws RangeError through the wrapper (CONVENTIONS D5d; ticket 0077)', function t() {
	// side = 'left': the minimum is max( 1, N ) = 3.
	const A = new Float64Array( [ 0.5, -0.25, 1, 0, 0.75, 0.125, -0.5, 1 ] );
	const TAU = new Float64Array( [ 1.2, 0.8 ] );
	assert.throws( function throws() {
		dormql( 'column-major', 'left', 'no-transpose', 4, 3, 2, A, 4, TAU, 1, new Float64Array( 12 ), 4, new Float64Array( 2 ) );
	}, /WORK array must have at least 3 elements/ );
	assert.throws( function throws() {
		dormql( 'row-major', 'right', 'transpose', 3, 4, 2, A, 2, TAU, 1, new Float64Array( 12 ), 4, new Float64Array( 2 ) );
	}, /WORK array must have at least 3 elements/ );
	assert.strictEqual( dormql( 'column-major', 'left', 'no-transpose', 4, 3, 2, A, 4, TAU, 1, new Float64Array( 12 ), 4, new Float64Array( 3 ) ), 0, 'the minimum suffices' );
});
