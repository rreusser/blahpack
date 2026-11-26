/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrd from './../../zhetrd/lib/base.js';
import zunmtr from './../lib/zunmtr.js';
import zunmtrNd from './../lib/ndarray.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// FUNCTIONS //

/**
* Returns the tridiagonal reduction (column-major, LDA = n) of a deterministic Hermitian n-by-n matrix.
*
* @private
* @param {string} uplo - triangle
* @param {integer} n - order
* @returns {Object} reflectors `A` and scalar factors `TAU`
*/
function reduce( uplo, n ) {
	const TAU = new Complex128Array( n );
	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	let k;
	let i;
	let j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			k = 2 * ( i + ( j * n ) );
			Av[ k ] = ( i === j ) ? n + i : 1.0 / ( 1.0 + i + j );
			Av[ k + 1 ] = ( i === j ) ? 0.0 : ( i - j ) / ( 2.0 + i + j );
		}
	}
	zhetrd( uplo, n, A, 1, n, 0, new Float64Array( n ), 1, 0, new Float64Array( n ), 1, 0, TAU, 1, 0, new Complex128Array( n * 64 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Applies Q via the wrapper with `WORK = null` (both layouts) and compares against the ndarray interface given an ample workspace.
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
	const Av = reinterpret( r.A, 0 );
	const C0 = new Complex128Array( M * N );
	const C0v = reinterpret( C0, 0 );
	const msg = side + '/' + uplo + '/' + trans + ' ' + M + 'x' + N;
	let expected;
	let Crowv;
	let Arowv;
	let Crow;
	let Arow;
	let info;
	let src;
	let dst;
	let ev;
	let C;
	let i;
	let j;
	for ( i = 0; i < C0v.length; i++ ) {
		C0v[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	expected = new Complex128Array( C0v );
	zunmtrNd( side, uplo, trans, M, N, new Complex128Array( Av ), 1, nq, 0, r.TAU, 1, 0, expected, 1, M, 0, new Complex128Array( 8192 ), 1, 0 );
	ev = reinterpret( expected, 0 );

	C = new Complex128Array( C0v );
	info = zunmtr( 'column-major', side, uplo, trans, M, N, new Complex128Array( Av ), nq, r.TAU, 1, C, M, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	assert.deepStrictEqual( reinterpret( C, 0 ), ev, msg + ' column-major' );

	Arow = new Complex128Array( nq * nq );
	Arowv = reinterpret( Arow, 0 );
	for ( i = 0; i < nq; i++ ) {
		for ( j = 0; j < nq; j++ ) {
			dst = 2 * ( ( i * nq ) + j );
			src = 2 * ( i + ( j * nq ) );
			Arowv[ dst ] = Av[ src ];
			Arowv[ dst + 1 ] = Av[ src + 1 ];
		}
	}
	Crow = new Complex128Array( M * N );
	Crowv = reinterpret( Crow, 0 );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dst = 2 * ( ( i * N ) + j );
			src = 2 * ( i + ( j * M ) );
			Crowv[ dst ] = C0v[ src ];
			Crowv[ dst + 1 ] = C0v[ src + 1 ];
		}
	}
	info = zunmtr( 'row-major', side, uplo, trans, M, N, Arow, nq, r.TAU, 1, Crow, N, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dst = 2 * ( ( i * N ) + j );
			src = 2 * ( i + ( j * M ) );

			// Row-major traverses C in a different order, so agree up to rounding:
			assert.ok( Math.abs( Crowv[ dst ] - ev[ src ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ev[ src ] ) ), msg + ' row-major re C[' + i + ',' + j + ']' );
			assert.ok( Math.abs( Crowv[ dst + 1 ] - ev[ src + 1 ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ev[ src + 1 ] ) ), msg + ' row-major im C[' + i + ',' + j + ']' );
		}
	}
}


// TESTS //

test( 'zunmtr is a function', function t() {
	assert.strictEqual( typeof zunmtr, 'function', 'is a function' );
});

test( 'zunmtr has expected arity', function t() {
	assert.strictEqual( zunmtr.length, 13, 'has expected arity' );
});

test( 'zunmtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmtr( 'column-major', 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zunmtr( 'column-major', 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmtr( 'column-major', 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmtr( 'column-major', 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmtr( 'column-major', 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmtr: WORK = null allocates the blocked workspace once NQ-1 > 32', function t() {
	checkNullWork( 'left', 'upper', 'conjugate-transpose', 40, 3 );
	checkNullWork( 'left', 'lower', 'no-transpose', 40, 3 );
	checkNullWork( 'right', 'upper', 'no-transpose', 3, 40 );
	checkNullWork( 'right', 'lower', 'conjugate-transpose', 3, 40 );
});

test( 'zunmtr: WORK = null with side=right sizes the workspace by M (M > N)', function t() {
	checkNullWork( 'right', 'upper', 'conjugate-transpose', 6, 4 );
	checkNullWork( 'right', 'lower', 'no-transpose', 6, 4 );
});

test( 'zunmtr: wrapper WORK = null result is unitary (Q^H Q = I, NQ = 40)', function t() {
	const n = 40;
	const r = reduce( 'upper', n );
	const Q = new Complex128Array( n * n );
	const Qv = reinterpret( Q, 0 );
	let k;
	let i;
	let j;
	for ( i = 0; i < n; i++ ) {
		Qv[ 2 * ( i + ( i * n ) ) ] = 1.0;
	}
	zunmtr( 'column-major', 'left', 'upper', 'no-transpose', n, n, new Complex128Array( reinterpret( r.A, 0 ) ), n, r.TAU, 1, Q, n, null );
	zunmtr( 'column-major', 'left', 'upper', 'conjugate-transpose', n, n, new Complex128Array( reinterpret( r.A, 0 ) ), n, r.TAU, 1, Q, n, null );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			k = 2 * ( i + ( j * n ) );
			assert.ok( Math.abs( Qv[ k ] - ( ( i === j ) ? 1.0 : 0.0 ) ) < 1e-13, 'Q^H Q re [' + i + ',' + j + ']' );
			assert.ok( Math.abs( Qv[ k + 1 ] ) < 1e-13, 'Q^H Q im [' + i + ',' + j + ']' );
		}
	}
});

test( 'zunmtr: negative strideTAU indexes TAU by its NQ-1 = N-1 entries when side=right', function t() {
	const M = 3;
	const N = 6;
	const r = reduce( 'lower', N );
	const tv = reinterpret( r.TAU, 0 );
	const TAUrev = new Complex128Array( N - 1 );
	const rv = reinterpret( TAUrev, 0 );
	const C0 = new Complex128Array( M * N );
	const c0v = reinterpret( C0, 0 );
	let expected;
	let C;
	let i;
	for ( i = 0; i < N - 1; i++ ) {
		rv[ 2 * i ] = tv[ 2 * ( N - 2 - i ) ];
		rv[ ( 2 * i ) + 1 ] = tv[ ( 2 * ( N - 2 - i ) ) + 1 ];
	}
	for ( i = 0; i < c0v.length; i++ ) {
		c0v[ i ] = ( ( i * 5 ) % 7 ) - 3.0;
	}
	expected = new Complex128Array( c0v );
	zunmtr( 'column-major', 'right', 'lower', 'conjugate-transpose', M, N, new Complex128Array( reinterpret( r.A, 0 ) ), N, r.TAU, 1, expected, M, null );
	C = new Complex128Array( c0v );
	zunmtr( 'column-major', 'right', 'lower', 'conjugate-transpose', M, N, new Complex128Array( reinterpret( r.A, 0 ) ), N, TAUrev, -1, C, M, null );
	assert.deepStrictEqual( reinterpret( C, 0 ), reinterpret( expected, 0 ), 'C' );
});

test( 'zunmtr: computeOptimalWorkSize returns the reference LWKOPT (NB = ILAENV( 1, ZUNMQL/ZUNMQR ) = 32)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'left', 'upper', 'conjugate-transpose', 5, 3 ), 96, 'left, upper, conjugate-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'right', 'lower', 'no-transpose', 5, 3 ), 160, 'right, lower, no-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'right', 'upper', 'no-transpose', 5, 3 ), 160, 'right, upper, no-transpose, 5, 3' );
	assert.strictEqual( computeOptimalWorkSize( 'left', 'lower', 'conjugate-transpose', 5, 3 ), 96, 'left, lower, conjugate-transpose, 5, 3' );
});
