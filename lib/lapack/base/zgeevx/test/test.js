/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zgeevx from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgeevx, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zgeevx.ndarray, 'function', 'has ndarray method' );
});

test( 'main export validates order', function t() {
	assert.throws( function throws() {
		zgeevx( 'invalid', 'none', 'no-vectors', 'no-vectors', 'none', 0 );
	}, TypeError );
});

test( 'main export validates N', function t() {
	assert.throws( function throws() {
		zgeevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', -1, null, 1, null, 1, null, 1, null, 1, 0, 0, null, 1, 0, null, 1, null, 1, null, 1, 1, null, 1 ); // eslint-disable-line max-len
	}, RangeError );
});
