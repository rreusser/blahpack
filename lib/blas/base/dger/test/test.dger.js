/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dger from './../lib/dger.js';


// TESTS //

test( 'dger is a function', function t() {
	assert.strictEqual( typeof dger, 'function', 'is a function' );
});

test( 'dger has expected arity', function t() {
	assert.strictEqual( dger.length, 10, 'has expected arity' );
});

test( 'dger throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dger( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dger throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dger( 'row-major', -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dger throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dger( 'row-major', new Float64Array( 4 ), -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
