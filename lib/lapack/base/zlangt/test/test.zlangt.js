/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlangt from './../lib/zlangt.js';


// TESTS //

test( 'zlangt is a function', function t() {
	assert.strictEqual( typeof zlangt, 'function', 'is a function' );
});

test( 'zlangt has expected arity', function t() {
	assert.strictEqual( zlangt.length, 8, 'has expected arity' );
});

test( 'zlangt throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlangt( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlangt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlangt( 'max', -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
