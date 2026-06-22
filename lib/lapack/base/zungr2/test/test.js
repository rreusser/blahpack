/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungr2 from './../lib/index.js';


// FUNCTIONS //

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zungr2, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zungr2.ndarray, 'function', 'has ndarray method' );
});

test( 'main export returns identity for K=0', function t() {
	var expected;
	var info;
	var Av;
	var A;

	A = new Complex128Array( 2 * 2 );
	info = zungr2.ndarray( 2, 2, 0, A, 1, 2, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info is 0' );
	Av = reinterpret( A, 0 );
	expected = [ 1, 0, 0, 0, 0, 0, 1, 0 ];
	assert.deepStrictEqual( toArray( Av ), expected, 'A is identity' );
});
