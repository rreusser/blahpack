
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_porcond from './../lib/dla_porcond.js';


// TESTS //

test( 'dla_porcond is a function', function t() {
	assert.strictEqual( typeof dla_porcond, 'function', 'is a function' );
});

test( 'dla_porcond has expected arity', function t() {
	assert.strictEqual( dla_porcond.length, 15, 'has expected arity' );
});

test( 'dla_porcond throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_porcond( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dla_porcond throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dla_porcond( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dla_porcond throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_porcond( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
