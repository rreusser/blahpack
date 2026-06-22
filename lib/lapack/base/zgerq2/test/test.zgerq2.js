/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgerq2 from './../lib/zgerq2.js';


// TESTS //

test( 'zgerq2 is a function', function t() {
	assert.strictEqual( typeof zgerq2, 'function', 'is a function' );
});

test( 'zgerq2 has expected arity', function t() {
	assert.strictEqual( zgerq2.length, 8, 'has expected arity' );
});

test( 'zgerq2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgerq2( -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgerq2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgerq2( new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
