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

test( 'zungbr allocates enough workspace when WORK is null (all four delegate branches, blocked sizes)', function t() {
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
		[ 'apply-Q', 40, 34, 34, 40, 'TAUQ' ],
		[ 'apply-Q', 34, 40, 34, 34, 'TAUQ' ],
		[ 'apply-P', 34, 40, 34, 40, 'TAUP' ],
		[ 'apply-P', 40, 34, 34, 34, 'TAUP' ]
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
