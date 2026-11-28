/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zdotc from './../lib/zdotc.js';


// TESTS //

test( 'zdotc is a function', function t() {
	assert.strictEqual( typeof zdotc, 'function', 'is a function' );
});

test( 'zdotc has expected arity', function t() {
	assert.strictEqual( zdotc.length, 5, 'has expected arity' );
});

test( 'zdotc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zdotc( -1, 2, 1, 2, 1 );
	}, RangeError );
});
