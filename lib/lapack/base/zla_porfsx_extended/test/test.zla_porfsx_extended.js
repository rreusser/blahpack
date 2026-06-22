/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zla_porfsx_extended from './../lib/zla_porfsx_extended.js';


// FUNCTIONS //

/**
* Build a dummy argument list for invalid-input tests.
*
* @private
* @param {string} order - storage layout
* @param {string} uplo - triangle flag
* @param {integer} N - matrix order
* @param {integer} nrhs - number of right-hand sides
* @returns {Array} positional argument list
*/
function dummyArgs( order, uplo, N, nrhs ) {
	var A;
	var b;
	var c;
	A = new Complex128Array( 4 );
	c = new Float64Array( 4 );
	b = new Float64Array( 4 );
	return [
		order,
		2,
		uplo,
		N,
		nrhs,
		A,
		2,
		A,
		2,
		false,
		c,
		1,
		A,
		2,
		A,
		2,
		b,
		1,
		2,
		b,
		2,
		b,
		2,
		A,
		1,
		b,
		1,
		A,
		1,
		A,
		1,
		1.0,
		10,
		0.5,
		0.25,
		false
	];
}


// TESTS //

test( 'zla_porfsx_extended is a function', function t() {
	assert.strictEqual( typeof zla_porfsx_extended, 'function', 'is a function' );
});

test( 'zla_porfsx_extended has expected arity', function t() {
	assert.strictEqual( zla_porfsx_extended.length, 36, 'has expected arity' );
});

test( 'zla_porfsx_extended throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'invalid', 'upper', 2, 1 ) );
	}, TypeError );
});

test( 'zla_porfsx_extended throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'row-major', 'invalid', 2, 1 ) );
	}, TypeError );
});

test( 'zla_porfsx_extended throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'row-major', 'upper', -1, 1 ) );
	}, RangeError );
});

test( 'zla_porfsx_extended throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zla_porfsx_extended.apply( null, dummyArgs( 'row-major', 'upper', 2, -1 ) );
	}, RangeError );
});
