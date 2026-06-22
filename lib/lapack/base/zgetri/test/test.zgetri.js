/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgetri from './../lib/zgetri.js';


// TESTS //

test( 'zgetri is a function', function t() {
	assert.strictEqual( typeof zgetri, 'function', 'is a function' );
});

test( 'zgetri has expected arity', function t() {
	assert.strictEqual( zgetri.length, 9, 'has expected arity' );
});

test( 'zgetri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgetri( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zgetri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgetri( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
