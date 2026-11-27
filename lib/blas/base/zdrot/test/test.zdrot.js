/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zdrot from './../lib/zdrot.js';


// TESTS //

test( 'zdrot is a function', function t() {
	assert.strictEqual( typeof zdrot, 'function', 'is a function' );
});

test( 'zdrot has expected arity', function t() {
	assert.strictEqual( zdrot.length, 7, 'has expected arity' );
});

test( 'zdrot throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zdrot( -1, 2, 1, 2, 1, 2, 2 );
	}, RangeError );
});
