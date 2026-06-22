/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpoequ from './../lib/zpoequ.js';


// TESTS //

test( 'zpoequ is a function', function t() {
	assert.strictEqual( typeof zpoequ, 'function', 'is a function' );
});

test( 'zpoequ has expected arity', function t() {
	assert.strictEqual( zpoequ.length, 5, 'has expected arity' );
});

test( 'zpoequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpoequ( -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
