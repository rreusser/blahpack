/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import idamax from './../lib/idamax.js';


// TESTS //

test( 'idamax is a function', function t() {
	assert.strictEqual( typeof idamax, 'function', 'is a function' );
});

test( 'idamax has expected arity', function t() {
	assert.strictEqual( idamax.length, 3, 'has expected arity' );
});

test( 'idamax throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		idamax( -1, 2, 1 );
	}, RangeError );
});
