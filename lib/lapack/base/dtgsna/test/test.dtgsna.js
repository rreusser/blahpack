/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgsna from './../lib/dtgsna.js';


// TESTS //

test( 'dtgsna is a function', function t() {
	assert.strictEqual( typeof dtgsna, 'function', 'is a function' );
});

test( 'dtgsna has expected arity', function t() {
	assert.strictEqual( dtgsna.length, 26, 'has expected arity' );
});

test( 'dtgsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgsna( 'invalid', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dtgsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsna( 'row-major', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2, 2, 2, 2 );
	}, RangeError );
});

test( 'dtgsna throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtgsna( 'row-major', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, 2, 2, 2, 2 );
	}, RangeError );
});
