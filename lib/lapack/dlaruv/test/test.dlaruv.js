/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaruv from './../lib/dlaruv.js';


// TESTS //

test( 'dlaruv is a function', function t() {
	assert.strictEqual( typeof dlaruv, 'function', 'is a function' );
});

test( 'dlaruv has expected arity', function t() {
	assert.strictEqual( dlaruv.length, 5, 'has expected arity' );
});

test( 'dlaruv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaruv( 2, 1, -1, 2, 1 );
	}, RangeError );
});
