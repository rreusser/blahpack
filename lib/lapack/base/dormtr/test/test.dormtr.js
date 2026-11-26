/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrd from './../../dsytrd/lib/base.js';
import dormtr from './../lib/dormtr.js';
import dormtrNd from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns the tridiagonal reduction (column-major, LDA = n) of a deterministic symmetric n-by-n matrix.
*
* @private
* @param {string} uplo - triangle
* @param {integer} n - order
* @returns {Object} reflectors `A` and scalar factors `TAU`
*/
function reduce( uplo, n ) {
	const TAU = new Float64Array( n );
	const A = new Float64Array( n * n );
	let i;
	let j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			A[ i + ( j * n ) ] = ( i === j ) ? n + i : 1.0 / ( 1.0 + i + j );
		}
	}
	dsytrd( uplo, n, A, 1, n, 0, new Float64Array( n ), 1, 0, new Float64Array( n ), 1, 0, TAU, 1, 0, new Float64Array( n * 64 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Applies Q via the wrapper with `WORK = null` (both layouts) and compares against the ndarray interface given an ample workspace (at least the optimum `nw*32 + 4160`).
*
* @private
* @param {string} side - side
* @param {string} uplo - triangle
* @param {string} trans - transpose
* @param {integer} M - rows of C
* @param {integer} N - columns of C
*/
function checkNullWork( side, uplo, trans, M, N ) {
	const nq = ( side === 'left' ) ? M : N;
	const r = reduce( uplo, nq );
	const C0 = new Float64Array( M * N );
	const msg = side + '/' + uplo + '/' + trans + ' ' + M + 'x' + N;
	let expected;
	let Arow;
	let Crow;
	let info;
	let C;
	let i;
	let j;
	for ( i = 0; i < C0.length; i++ ) {
		C0[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	expected = new Float64Array( C0 );
	dormtrNd( side, uplo, trans, M, N, new Float64Array( r.A ), 1, nq, 0, r.TAU, 1, 0, expected, 1, M, 0, new Float64Array( 8192 ), 1, 0 );

	C = new Float64Array( C0 );
	info = dormtr( 'column-major', side, uplo, trans, M, N, new Float64Array( r.A ), nq, r.TAU, 1, C, M, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	assert.deepStrictEqual( C, expected, msg + ' column-major' );

	Arow = new Float64Array( nq * nq );
	for ( i = 0; i < nq; i++ ) {
		for ( j = 0; j < nq; j++ ) {
			Arow[ ( i * nq ) + j ] = r.A[ i + ( j * nq ) ];
		}
	}
	Crow = new Float64Array( M * N );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			Crow[ ( i * N ) + j ] = C0[ i + ( j * M ) ];
		}
	}
	info = dormtr( 'row-major', side, uplo, trans, M, N, Arow, nq, r.TAU, 1, Crow, N, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			// Row-major traverses C in a different order, so agree up to rounding:
			assert.ok( Math.abs( Crow[ ( i * N ) + j ] - expected[ i + ( j * M ) ] ) <= 1e-13 * Math.max( 1.0, Math.abs( expected[ i + ( j * M ) ] ) ), msg + ' row-major C[' + i + ',' + j + ']' );
		}
	}
}


// TESTS //

test( 'dormtr is a function', function t() {
	assert.strictEqual( typeof dormtr, 'function', 'is a function' );
});

test( 'dormtr has expected arity', function t() {
	assert.strictEqual( dormtr.length, 13, 'has expected arity' );
});

test( 'dormtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dormtr( 'column-major', 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dormtr( 'column-major', 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dormtr( 'column-major', 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dormtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dormtr( 'column-major', 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dormtr( 'column-major', 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dormtr: WORK = null allocates the blocked workspace once NQ-1 > 32', function t() {
	checkNullWork( 'left', 'upper', 'transpose', 40, 3 );
	checkNullWork( 'left', 'lower', 'no-transpose', 40, 3 );
	checkNullWork( 'right', 'upper', 'no-transpose', 3, 40 );
	checkNullWork( 'right', 'lower', 'transpose', 3, 40 );
});

test( 'dormtr: WORK = null with side=right sizes the workspace by M (M > N)', function t() {
	checkNullWork( 'right', 'upper', 'transpose', 6, 4 );
	checkNullWork( 'right', 'lower', 'no-transpose', 6, 4 );
});

test( 'dormtr: wrapper WORK = null result is orthogonal (Q^T Q = I, NQ = 40)', function t() {
	const n = 40;
	const r = reduce( 'lower', n );
	const Q = new Float64Array( n * n );
	let i;
	let j;
	for ( i = 0; i < n; i++ ) {
		Q[ i + ( i * n ) ] = 1.0;
	}
	dormtr( 'column-major', 'left', 'lower', 'no-transpose', n, n, new Float64Array( r.A ), n, r.TAU, 1, Q, n, null );
	dormtr( 'column-major', 'left', 'lower', 'transpose', n, n, new Float64Array( r.A ), n, r.TAU, 1, Q, n, null );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			assert.ok( Math.abs( Q[ i + ( j * n ) ] - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-13, 'Q^T Q [' + i + ',' + j + ']' );
		}
	}
});

test( 'dormtr: negative strideTAU indexes TAU by its NQ-1 = N-1 entries when side=right', function t() {
	const M = 3;
	const N = 6;
	const r = reduce( 'upper', N );
	const TAUrev = new Float64Array( N - 1 );
	const C0 = new Float64Array( M * N );
	let expected;
	let C;
	let i;
	for ( i = 0; i < N - 1; i++ ) {
		TAUrev[ i ] = r.TAU[ N - 2 - i ];
	}
	for ( i = 0; i < C0.length; i++ ) {
		C0[ i ] = ( ( i * 5 ) % 7 ) - 3.0;
	}
	expected = new Float64Array( C0 );
	dormtr( 'column-major', 'right', 'upper', 'no-transpose', M, N, new Float64Array( r.A ), N, r.TAU, 1, expected, M, null );
	C = new Float64Array( C0 );
	dormtr( 'column-major', 'right', 'upper', 'no-transpose', M, N, new Float64Array( r.A ), N, TAUrev, -1, C, M, null );
	assert.deepStrictEqual( C, expected, 'C' );
});
