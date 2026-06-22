/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgels from './../lib/zgels.js';


// TESTS //

test( 'zgels is a function', function t() {
	assert.strictEqual( typeof zgels, 'function', 'is a function' );
});

test( 'zgels has expected arity', function t() {
	assert.strictEqual( zgels.length, 11, 'has expected arity' );
});

test( 'zgels throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgels( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zgels throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgels( 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zgels throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgels( 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zgels throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgels( 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
