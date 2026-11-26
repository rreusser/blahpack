/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungbr from './../lib/zungbr.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebrd from '../../zgebrd/lib/base.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Reduces a deterministic pseudo-random M-by-N matrix to bidiagonal form (column-major, LDA = M).
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Object} factorization
*/
function setupLarge( M, N ) {
	var TAUQ;
	var TAUP;
	var Av;
	var mn;
	var A;
	var s;
	var i;
	mn = Math.min( M, N );
	A = new Complex128Array( M * N );
	Av = reinterpret( A, 0 );
	s = 5;
	for ( i = 0; i < Av.length; i++ ) {
		s = ( ( s * 69069 ) + 1 ) % 4294967296;
		Av[ i ] = ( 2.0 * ( s / 4294967296 ) ) - 1.0;
	}
	TAUQ = new Complex128Array( mn );
	TAUP = new Complex128Array( mn );
	zgebrd( M, N, A, 1, M, 0, new Float64Array( mn ), 1, 0, new Float64Array( mn ), 1, 0, TAUQ, 1, 0, TAUP, 1, 0, new Complex128Array( ( M + N ) * 64 ), 1, 0 ); // eslint-disable-line max-len
	return {
		'A': A,
		'TAUQ': TAUQ,
		'TAUP': TAUP
	};
}


// TESTS //

test( 'zungbr is a function', function t() {
	assert.strictEqual( typeof zungbr, 'function', 'is a function' );
});

test( 'zungbr has expected arity', function t() {
	assert.strictEqual( zungbr.length, 10, 'has expected arity' );
});

test( 'zungbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungbr( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zungbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungbr( 'row-major', 'apply-P', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungbr( 'row-major', 'apply-P', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungbr( 'row-major', 'apply-P', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungbr allocates enough workspace when WORK is null (all four delegate branches, blocked and unblocked sizes)', function t() {
	var cases;
	var tau;
	var c;
	var e;
	var a;
	var x;
	var y;
	var i;
	var j;
	cases = [
		[ 'apply-Q', 40, 34, 40, 34, 'TAUQ' ],
		[ 'apply-Q', 34, 40, 34, 34, 'TAUQ' ],
		[ 'apply-P', 34, 40, 34, 40, 'TAUP' ],
		[ 'apply-P', 40, 34, 34, 34, 'TAUP' ],
		[ 'apply-Q', 5, 3, 5, 3, 'TAUQ' ],
		[ 'apply-Q', 3, 5, 3, 3, 'TAUQ' ],
		[ 'apply-P', 3, 5, 3, 5, 'TAUP' ],
		[ 'apply-P', 5, 3, 3, 3, 'TAUP' ],
		[ 'apply-Q', 1, 2, 1, 1, 'TAUQ' ],
		[ 'apply-P', 2, 1, 1, 1, 'TAUP' ]
	];
	for ( j = 0; j < cases.length; j++ ) {
		c = cases[ j ];

		// c = [ vect, rows, cols of the reduced matrix, M, N for zungbr, tau ]
		x = setupLarge( c[ 1 ], c[ 2 ] );
		y = setupLarge( c[ 1 ], c[ 2 ] );
		tau = x[ c[ 5 ] ];
		ndarray( c[ 0 ], c[ 3 ], c[ 4 ], ( c[ 0 ] === 'apply-Q' ) ? c[ 2 ] : c[ 1 ], x.A, 1, c[ 1 ], 0, tau, 1, 0, new Complex128Array( 64 * 64 ), 1, 0 ); // eslint-disable-line max-len
		zungbr( 'column-major', c[ 0 ], c[ 3 ], c[ 4 ], ( c[ 0 ] === 'apply-Q' ) ? c[ 2 ] : c[ 1 ], y.A, c[ 1 ], y[ c[ 5 ] ], 1, null ); // eslint-disable-line max-len
		e = reinterpret( x.A, 0 );
		a = reinterpret( y.A, 0 );
		for ( i = 0; i < e.length; i++ ) {
			assert.ok( a[ i ] === a[ i ], 'finite at ' + i );
			assert.strictEqual( a[ i ], e[ i ], 'case ' + j + ' matches ndarray at ' + i );
		}
	}
});

test( 'zungbr locates a negative-stride TAU of length min(M,K) or min(N,K) (ticket 0068)', function t() {
	var cases;
	var TAUr;
	var tau;
	var red;
	var A1;
	var A2;
	var e;
	var a;
	var c;
	var i;
	var j;

	// c = [ vect, M0, N0 (reduced matrix), M, N, K ]
	cases = [
		[ 'apply-Q', 6, 3, 6, 5, 3 ],
		[ 'apply-P', 3, 6, 3, 6, 3 ],
		[ 'apply-P', 5, 7, 5, 7, 5 ]
	];
	for ( j = 0; j < cases.length; j++ ) {
		c = cases[ j ];
		red = setupLarge( c[ 1 ], c[ 2 ] );
		tau = ( c[ 0 ] === 'apply-Q' ) ? red.TAUQ : red.TAUP;
		TAUr = new Complex128Array( tau.length );
		for ( i = 0; i < tau.length; i++ ) {
			TAUr.set( tau.get( tau.length - 1 - i ), i );
		}
		A1 = new Complex128Array( c[ 3 ] * c[ 4 ] );
		for ( i = 0; i < c[ 1 ] * c[ 2 ]; i++ ) {
			A1.set( red.A.get( i ), i );
		}
		A2 = new Complex128Array( A1 );
		assert.strictEqual( zungbr( 'column-major', c[ 0 ], c[ 3 ], c[ 4 ], c[ 5 ], A1, c[ 3 ], TAUr, -1, null ), ndarray( c[ 0 ], c[ 3 ], c[ 4 ], c[ 5 ], A2, 1, c[ 3 ], 0, tau, 1, 0, new Complex128Array( 4096 ), 1, 0 ), 'case ' + j + ': info' ); // eslint-disable-line max-len
		a = reinterpret( A1, 0 );
		e = reinterpret( A2, 0 );
		for ( i = 0; i < e.length; i++ ) {
			assert.strictEqual( a[ i ], e[ i ], 'case ' + j + ': A[' + i + ']' );
		}
	}
});
