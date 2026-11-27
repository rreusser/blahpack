/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlargv from './../lib/dlargv.js';


// TESTS //

test( 'dlargv is a function', function t() {
	assert.strictEqual( typeof dlargv, 'function', 'is a function' );
});

test( 'dlargv has expected arity', function t() {
	assert.strictEqual( dlargv.length, 7, 'has expected arity' );
});

test( 'dlargv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlargv( -1, 2, 1, 2, 1, 2, 1 );
	}, RangeError );
});
