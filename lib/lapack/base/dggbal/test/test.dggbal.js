/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggbal from './../lib/dggbal.js';


// TESTS //

test( 'dggbal is a function', function t() {
	assert.strictEqual( typeof dggbal, 'function', 'is a function' );
});

test( 'dggbal has expected arity', function t() {
	assert.strictEqual( dggbal.length, 13, 'has expected arity' );
});

test( 'dggbal throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dggbal( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dggbal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggbal( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
