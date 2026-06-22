/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrexc from './../lib/ztrexc.js';


// TESTS //

test( 'ztrexc is a function', function t() {
	assert.strictEqual( typeof ztrexc, 'function', 'is a function' );
});

test( 'ztrexc has expected arity', function t() {
	assert.strictEqual( ztrexc.length, 8, 'has expected arity' );
});

test( 'ztrexc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrexc( 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2 );
	}, RangeError );
});
