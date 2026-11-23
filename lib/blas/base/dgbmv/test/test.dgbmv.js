/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbmv from './../lib/dgbmv.js';


// FIXTURES //

import notrans from './fixtures/notrans.json' with { type: 'json' };
import trans from './fixtures/trans.json' with { type: 'json' };


// FUNCTIONS //

/**
* Returns the band storage (KL=1, KU=2, 4x5 band array) of the 4x5 matrix.
*
* Full matrix:
*   [ 1  2  3  0  0 ]
*   [ 4  5  6  7  0 ]
*   [ 0  8  9 10 11 ]
*   [ 0  0 12 13 14 ]
*
* @private
* @param {string} order - storage layout of the band array
* @returns {Float64Array} band array (column-major: LDA=4; row-major: LDA=5)
*/
function bandA( order ) {
	// Band rows (KL+KU+1 = 4) by columns (N = 5); band row KU=2 is the diagonal:
	const band = [
		[ 0, 0, 3, 7, 11 ],
		[ 0, 2, 6, 10, 14 ],
		[ 1, 5, 9, 13, 0 ],
		[ 4, 8, 12, 0, 0 ]
	];
	const a = new Float64Array( 20 );
	let r;
	let j;
	for ( r = 0; r < 4; r++ ) {
		for ( j = 0; j < 5; j++ ) {
			if ( order === 'column-major' ) {
				a[ r + ( j * 4 ) ] = band[ r ][ j ];
			} else {
				a[ ( r * 5 ) + j ] = band[ r ][ j ];
			}
		}
	}
	return a;
}


// TESTS //

test( 'dgbmv is a function', function t() {
	assert.strictEqual( typeof dgbmv, 'function', 'is a function' );
});

test( 'dgbmv has expected arity', function t() {
	assert.strictEqual( dgbmv.length, 14, 'has expected arity' );
});

test( 'dgbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgbmv( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'dgbmv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgbmv( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'dgbmv throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgbmv( 'row-major', 'no-transpose', -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'dgbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbmv( 'row-major', 'no-transpose', new Float64Array( 4 ), -1, 2, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'dgbmv: column-major, no-transpose (fixture notrans)', function t() {
	const x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	const y = new Float64Array( 4 );
	const out = dgbmv( 'column-major', 'no-transpose', 4, 5, 1, 2, 1.0, bandA( 'column-major' ), 4, x, 1, 0.0, y, 1 );
	assert.strictEqual( out, y, 'returns y' );
	assert.deepStrictEqual( Array.from( y ), notrans.y, 'y' );
});

test( 'dgbmv: row-major, no-transpose (fixture notrans)', function t() {
	const x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	const y = new Float64Array( 4 );
	const out = dgbmv( 'row-major', 'no-transpose', 4, 5, 1, 2, 1.0, bandA( 'row-major' ), 5, x, 1, 0.0, y, 1 );
	assert.strictEqual( out, y, 'returns y' );
	assert.deepStrictEqual( Array.from( y ), notrans.y, 'y' );
});

test( 'dgbmv: row-major, transpose (fixture trans)', function t() {
	const x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const y = new Float64Array( 5 );
	dgbmv( 'row-major', 'transpose', 4, 5, 1, 2, 1.0, bandA( 'row-major' ), 5, x, 1, 0.0, y, 1 );
	assert.deepStrictEqual( Array.from( y ), trans.y, 'y' );
});

test( 'dgbmv throws RangeError for row-major LDA < max(1,N)', function t() {
	assert.throws( function throws() {
		dgbmv( 'row-major', 'no-transpose', 4, 5, 1, 2, 1.0, bandA( 'row-major' ), 4, new Float64Array( 5 ), 1, 0.0, new Float64Array( 4 ), 1 );
	}, RangeError );
});
