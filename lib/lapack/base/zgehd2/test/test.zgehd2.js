/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgehd2 from './../lib/zgehd2.js';


// TESTS //

test( 'zgehd2 is a function', function t() {
	assert.strictEqual( typeof zgehd2, 'function', 'is a function' );
});

test( 'zgehd2 has expected arity', function t() {
	assert.strictEqual( zgehd2.length, 13, 'has expected arity' );
});

test( 'zgehd2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgehd2( -1, 2, 2, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
