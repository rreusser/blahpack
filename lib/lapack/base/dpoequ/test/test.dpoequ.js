/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpoequ from './../lib/dpoequ.js';


// TESTS //

test( 'dpoequ is a function', function t() {
	assert.strictEqual( typeof dpoequ, 'function', 'is a function' );
});

test( 'dpoequ has expected arity', function t() {
	assert.strictEqual( dpoequ.length, 5, 'has expected arity' );
});

test( 'dpoequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpoequ( -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
