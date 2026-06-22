/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgsy2 from './../lib/dtgsy2.js';


// TESTS //

test( 'dtgsy2 is a function', function t() {
	assert.strictEqual( typeof dtgsy2, 'function', 'is a function' );
});

test( 'dtgsy2 has expected arity', function t() {
	assert.strictEqual( dtgsy2.length, 22, 'has expected arity' );
});

test( 'dtgsy2 throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtgsy2( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dtgsy2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtgsy2( 'no-transpose', 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dtgsy2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsy2( 'no-transpose', 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
