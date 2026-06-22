/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggqrf from './../lib/zggqrf.js';


// TESTS //

test( 'zggqrf is a function', function t() {
	assert.strictEqual( typeof zggqrf, 'function', 'is a function' );
});

test( 'zggqrf has expected arity', function t() {
	assert.strictEqual( zggqrf.length, 14, 'has expected arity' );
});

test( 'zggqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggqrf( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zggqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zggqrf( new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
