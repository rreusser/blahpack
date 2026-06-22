/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zptcon from './../lib/zptcon.js';


// TESTS //

test( 'zptcon is a function', function t() {
	assert.strictEqual( typeof zptcon, 'function', 'is a function' );
});

test( 'zptcon has expected arity', function t() {
	assert.strictEqual( zptcon.length, 9, 'has expected arity' );
});

test( 'zptcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zptcon( -1, 2, 1, 2, 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
