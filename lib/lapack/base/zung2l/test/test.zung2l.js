/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zung2l from './../lib/zung2l.js';


// TESTS //

test( 'zung2l is a function', function t() {
	assert.strictEqual( typeof zung2l, 'function', 'is a function' );
});

test( 'zung2l has expected arity', function t() {
	assert.strictEqual( zung2l.length, 9, 'has expected arity' );
});

test( 'zung2l throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zung2l( -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zung2l throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zung2l( new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zung2l throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zung2l( new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
