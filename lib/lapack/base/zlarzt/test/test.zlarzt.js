/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarzt from './../lib/zlarzt.js';


// TESTS //

test( 'zlarzt is a function', function t() {
	assert.strictEqual( typeof zlarzt, 'function', 'is a function' );
});

test( 'zlarzt has expected arity', function t() {
	assert.strictEqual( zlarzt.length, 11, 'has expected arity' );
});

test( 'zlarzt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarzt( 'invalid', 'no-transpose', 'no-transpose', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarzt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarzt( 'row-major', 'no-transpose', 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarzt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarzt( 'row-major', 'no-transpose', 'no-transpose', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
