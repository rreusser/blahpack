/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbmv from './../lib/zgbmv.js';


// FIXTURES //

import no_trans_basic from './fixtures/no_trans_basic.json' with { type: 'json' };
import conj_trans_basic from './fixtures/conj_trans_basic.json' with { type: 'json' };
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns the band storage (KL=1, KU=2, 4x4 band array) of the 4x4 matrix.
*
* Full matrix:
*   [ (1,0.5)  (3,1)  (6,-0.5)  0       ]
*   [ (2,-1)   (4,0)  (7,1.5)   0       ]
*   [ 0        (5,2)  (8,-1)    (10,1)  ]
*   [ 0        0      (9,0)     (11,-2) ]
*
* @private
* @param {string} order - storage layout of the band array (LDA = 4 either way)
* @returns {Complex128Array} band array
*/
function bandA( order ) {
	// Band rows (KL+KU+1 = 4) by columns (N = 4) as [re, im]; band row KU=2 is the diagonal:
	const band = [
		[ [ 0, 0 ], [ 0, 0 ], [ 6, -0.5 ], [ 0, 0 ] ],
		[ [ 0, 0 ], [ 3, 1 ], [ 7, 1.5 ], [ 10, 1 ] ],
		[ [ 1, 0.5 ], [ 4, 0 ], [ 8, -1 ], [ 11, -2 ] ],
		[ [ 2, -1 ], [ 5, 2 ], [ 9, 0 ], [ 0, 0 ] ]
	];
	const a = new Float64Array( 32 );
	let idx;
	let r;
	let j;
	for ( r = 0; r < 4; r++ ) {
		for ( j = 0; j < 4; j++ ) {
			idx = ( order === 'column-major' ) ? r + ( j * 4 ) : ( r * 4 ) + j;
			a[ 2 * idx ] = band[ r ][ j ][ 0 ];
			a[ ( 2 * idx ) + 1 ] = band[ r ][ j ][ 1 ];
		}
	}
	return new Complex128Array( a.buffer );
}


// TESTS //

test( 'zgbmv is a function', function t() {
	assert.strictEqual( typeof zgbmv, 'function', 'is a function' );
});

test( 'zgbmv has expected arity', function t() {
	assert.strictEqual( zgbmv.length, 14, 'has expected arity' );
});

test( 'zgbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgbmv( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zgbmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgbmv( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zgbmv throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgbmv( 'row-major', 'no-transpose', -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'zgbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbmv( 'row-major', 'no-transpose', new Float64Array( 4 ), -1, 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'zgbmv: column-major, no-transpose (fixture no_trans_basic)', function t() {
	const x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	const y = new Complex128Array( 4 );
	const out = zgbmv( 'column-major', 'no-transpose', 4, 4, 1, 2, new Complex128( 1, 0 ), bandA( 'column-major' ), 4, x, 1, new Complex128( 0, 0 ), y, 1 );
	assert.strictEqual( out, y, 'returns y' );
	assert.deepStrictEqual( Array.from( reinterpret( y, 0 ) ), no_trans_basic.y, 'y' );
});

test( 'zgbmv: row-major, no-transpose (fixture no_trans_basic)', function t() {
	const x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	const y = new Complex128Array( 4 );
	zgbmv( 'row-major', 'no-transpose', 4, 4, 1, 2, new Complex128( 1, 0 ), bandA( 'row-major' ), 4, x, 1, new Complex128( 0, 0 ), y, 1 );
	assert.deepStrictEqual( Array.from( reinterpret( y, 0 ) ), no_trans_basic.y, 'y' );
});

test( 'zgbmv: row-major, conjugate-transpose (fixture conj_trans_basic)', function t() {
	const x = new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
	const y = new Complex128Array( 4 );
	zgbmv( 'row-major', 'conjugate-transpose', 4, 4, 1, 2, new Complex128( 1, 0 ), bandA( 'row-major' ), 4, x, 1, new Complex128( 0, 0 ), y, 1 );
	assert.deepStrictEqual( Array.from( reinterpret( y, 0 ) ), conj_trans_basic.y, 'y' );
});

test( 'zgbmv throws RangeError for row-major LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		zgbmv( 'row-major', 'no-transpose', 4, 4, 1, 2, new Complex128( 1, 0 ), bandA( 'row-major' ), 3, new Complex128Array( 4 ), 1, new Complex128( 0, 0 ), new Complex128Array( 4 ), 1 );
	}, RangeError );
});

// Ticket 0068: with TRANS != 'no-transpose', x has M elements and y has N.
// The wrapper's negative-stride offsets must use those lengths (they used
// N for x and M for y, so a non-square transposed call read out of bounds).
test( 'zgbmv: negative strides on a non-square conjugate-transposed call use the TRANS-dependent lengths', function t() {
	const M = 4;
	const N = 5;
	const A = new Complex128Array( Float64Array.from( { 'length': 2 * 4 * N }, function v( _, i ) {
		return ( ( i * 7 ) % 11 ) - 5;
	}) );
	const xs = Float64Array.from( [ 4, 1, 3, -1, 2, 0.5, 1, 2 ] );
	const y1 = new Complex128Array( N );
	const y2 = new Complex128Array( N );
	zgbmv( 'column-major', 'conjugate-transpose', M, N, 1, 2, new Complex128( 1.0, 0.0 ), A, 4, new Complex128Array( xs ), -1, new Complex128( 0.0, 0.0 ), y1, -1 );
	ndarray( 'conjugate-transpose', M, N, 1, 2, new Complex128( 1.0, 0.0 ), A, 1, 4, 0, new Complex128Array( xs ), -1, M - 1, new Complex128( 0.0, 0.0 ), y2, -1, N - 1 );
	assert.deepStrictEqual( Array.from( new Float64Array( y1.buffer ) ), Array.from( new Float64Array( y2.buffer ) ) );
	assert.ok( Array.from( new Float64Array( y1.buffer ) ).every( Number.isFinite ) );
});
