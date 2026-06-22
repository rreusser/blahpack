/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeev from './../lib/zgeev.js';


// TESTS //

test( 'zgeev is a function', function t() {
	assert.strictEqual( typeof zgeev, 'function', 'is a function' );
});

test( 'zgeev has expected arity', function t() {
	assert.strictEqual( zgeev.length, 16, 'has expected arity' );
});

test( 'zgeev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeev( 2, 2, -1, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
