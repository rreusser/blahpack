/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgelss from './../lib/zgelss.js';


// TESTS //

test( 'zgelss is a function', function t() {
	assert.strictEqual( typeof zgelss, 'function', 'is a function' );
});

test( 'zgelss has expected arity', function t() {
	assert.strictEqual( zgelss.length, 16, 'has expected arity' );
});

test( 'zgelss throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgelss( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgelss throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgelss( new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgelss throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgelss( new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
