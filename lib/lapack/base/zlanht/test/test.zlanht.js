/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanht from './../lib/zlanht.js';


// TESTS //

test( 'zlanht is a function', function t() {
	assert.strictEqual( typeof zlanht, 'function', 'is a function' );
});

test( 'zlanht has expected arity', function t() {
	assert.strictEqual( zlanht.length, 6, 'has expected arity' );
});

test( 'zlanht throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanht( 'invalid', new Float64Array( 4 ), 2, 1, 2, 1 );
	}, TypeError );
});

test( 'zlanht throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanht( 'max', -1, 2, 1, 2, 1 );
	}, RangeError );
});
