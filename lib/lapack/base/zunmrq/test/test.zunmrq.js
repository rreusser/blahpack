/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgerqf from './../../zgerqf/lib/base.js';
import zunmrq from './../lib/zunmrq.js';
import zunmrqNd from './../lib/ndarray.js';

// FUNCTIONS //

/**
* Returns the zgerqf factorization (column-major, LDA = K) of a deterministic K-by-nq complex matrix.
*
* @private
* @param {integer} nq - order of Q
* @param {integer} K - number of reflectors
* @returns {Object} reflectors `A` and scalar factors `TAU`
*/
function factor( nq, K ) {
	const TAU = new Complex128Array( K );
	const A = new Complex128Array( K * nq );
	const Av = reinterpret( A, 0 );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = ( ( ( i * 13 ) % 17 ) / 8.0 ) - 1.0 + ( ( i % ( ( 2 * K ) + 2 ) === 0 ) ? 3.0 : 0.0 );
	}
	zgerqf( K, nq, A, 1, K, 0, TAU, 1, 0, new Complex128Array( ( K * nq ) + 4096 ), 1, 0 );
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
* @param {string} trans - transpose
* @param {integer} M - rows of C
* @param {integer} N - columns of C
* @param {integer} K - number of reflectors
*/
function checkNullWork( side, trans, M, N, K ) {
	const nq = ( side === 'left' ) ? M : N;
	const f = factor( nq, K );
	const Av = reinterpret( f.A, 0 );
	const C0 = new Complex128Array( M * N );
	const C0v = reinterpret( C0, 0 );
	const msg = side + '/' + trans + ' ' + M + 'x' + N + ' K=' + K;
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
	let p;
	let i;
	let j;
	for ( i = 0; i < C0v.length; i++ ) {
		C0v[ i ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	expected = new Complex128Array( C0v );
	zunmrqNd( side, trans, M, N, K, new Complex128Array( Av ), 1, K, 0, f.TAU, 1, 0, expected, 1, M, 0, new Complex128Array( ( Math.max( M, N ) * 32 ) + 4096 ), 1, 0 );
	ev = reinterpret( expected, 0 );

	C = new Complex128Array( C0v );
	info = zunmrq( 'column-major', side, trans, M, N, K, new Complex128Array( Av ), K, f.TAU, 1, C, M, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	assert.deepStrictEqual( reinterpret( C, 0 ), ev, msg + ' column-major' );

	Arow = new Complex128Array( K * nq );
	Arowv = reinterpret( Arow, 0 );
	for ( i = 0; i < K; i++ ) {
		for ( j = 0; j < nq; j++ ) {
			dst = 2 * ( ( i * nq ) + j );
			src = 2 * ( i + ( j * K ) );
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
	info = zunmrq( 'row-major', side, trans, M, N, K, Arow, nq, f.TAU, 1, Crow, N, null );
	assert.strictEqual( info, 0, msg + ' INFO' );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dst = 2 * ( ( i * N ) + j );
			src = 2 * ( i + ( j * M ) );
			for ( p = 0; p < 2; p++ ) {
				// Row-major traverses C in a different order, so agree up to rounding:
				assert.ok( Math.abs( Crowv[ dst + p ] - ev[ src + p ] ) <= 1e-13 * Math.max( 1.0, Math.abs( ev[ src + p ] ) ), msg + ' row-major C[' + i + ',' + j + '] part ' + p );
			}
		}
	}
}


// TESTS //

test( 'zunmrq is a function', function t() {
	assert.strictEqual( typeof zunmrq, 'function', 'is a function' );
});

test( 'zunmrq has expected arity', function t() {
	assert.strictEqual( zunmrq.length, 13, 'has expected arity' );
});

test( 'zunmrq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmrq( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmrq throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmrq throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmrq( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmrq throws RangeError for an undersized caller-provided WORK', function t() {
	// side='left' (M=2, N=3, K=1): needs N*32 + 33*32 = 3*32 + 1056 = 1152 complex elements...
	assert.throws( function throws() {
		zunmrq( 'column-major', 'left', 'no-transpose', 2, 3, 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 1151 ) );
	}, RangeError );

	// side='right' (M=2, N=3, K=1): needs M*32 + 33*32 = 2*32 + 1056 = 1120 complex elements...
	assert.throws( function throws() {
		zunmrq( 'column-major', 'right', 'no-transpose', 2, 3, 1, new Complex128Array( 3 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 6 ), 2, new Complex128Array( 1119 ) );
	}, RangeError );
});

test( 'zunmrq accepts a caller-provided WORK of exactly the documented size', function t() {
	// With TAU = 0 the reflector is the identity, so C is unchanged...
	const C = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	let info = zunmrq( 'column-major', 'left', 'no-transpose', 2, 3, 1, new Complex128Array( 2 ), 1, new Complex128Array( 1 ), 1, C, 2, new Complex128Array( 1152 ) );
	assert.strictEqual( info, 0, 'left info' );
	info = zunmrq( 'column-major', 'right', 'conjugate-transpose', 2, 3, 1, new Complex128Array( 3 ), 1, new Complex128Array( 1 ), 1, C, 2, new Complex128Array( 1120 ) );
	assert.strictEqual( info, 0, 'right info' );
	assert.deepStrictEqual( Array.from( new Float64Array( C.buffer ) ), [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ], 'C' );
});

test( 'zunmrq: WORK = null allocates a sufficient workspace (blocked and unblocked, both sides)', function t() {
	checkNullWork( 'left', 'no-transpose', 40, 3, 40 );
	checkNullWork( 'left', 'conjugate-transpose', 40, 3, 36 );
	checkNullWork( 'right', 'no-transpose', 3, 40, 40 );
	checkNullWork( 'right', 'conjugate-transpose', 3, 40, 36 );
	checkNullWork( 'right', 'no-transpose', 6, 4, 3 );
	checkNullWork( 'left', 'conjugate-transpose', 4, 6, 4 );
});
