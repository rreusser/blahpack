/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgsyl from './../lib/dtgsyl.js';


// TESTS //

test( 'dtgsyl is a function', function t() {
	assert.strictEqual( typeof dtgsyl, 'function', 'is a function' );
});

test( 'dtgsyl has expected arity', function t() {
	assert.strictEqual( dtgsyl.length, 23, 'has expected arity' );
});

test( 'dtgsyl throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtgsyl( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtgsyl throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtgsyl( 'no-transpose', 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dtgsyl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsyl( 'no-transpose', 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
