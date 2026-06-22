/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzt from './../lib/dlarzt.js';


// TESTS //

test( 'dlarzt is a function', function t() {
	assert.strictEqual( typeof dlarzt, 'function', 'is a function' );
});

test( 'dlarzt has expected arity', function t() {
	assert.strictEqual( dlarzt.length, 11, 'has expected arity' );
});

test( 'dlarzt throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarzt( 'invalid', 'no-transpose', 'no-transpose', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarzt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarzt( 'row-major', 'no-transpose', 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarzt throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlarzt( 'row-major', 'no-transpose', 'no-transpose', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
