/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlanhs from './../lib/zlanhs.js';


// TESTS //

test( 'zlanhs is a function', function t() {
	assert.strictEqual( typeof zlanhs, 'function', 'is a function' );
});

test( 'zlanhs has expected arity', function t() {
	assert.strictEqual( zlanhs.length, 7, 'has expected arity' );
});

test( 'zlanhs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlanhs( 'invalid', 'max', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlanhs throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanhs( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlanhs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanhs( 'row-major', 'max', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
