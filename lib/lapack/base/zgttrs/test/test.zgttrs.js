/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgttrs from './../lib/zgttrs.js';


// TESTS //

test( 'zgttrs is a function', function t() {
	assert.strictEqual( typeof zgttrs, 'function', 'is a function' );
});

test( 'zgttrs has expected arity', function t() {
	assert.strictEqual( zgttrs.length, 15, 'has expected arity' );
});

test( 'zgttrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgttrs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgttrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgttrs( 'no-transpose', -1, 2, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgttrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgttrs( 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
