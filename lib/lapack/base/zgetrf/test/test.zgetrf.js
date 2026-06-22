/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgetrf from './../lib/zgetrf.js';


// TESTS //

test( 'zgetrf is a function', function t() {
	assert.strictEqual( typeof zgetrf, 'function', 'is a function' );
});

test( 'zgetrf has expected arity', function t() {
	assert.strictEqual( zgetrf.length, 7, 'has expected arity' );
});

test( 'zgetrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgetrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgetrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgetrf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgetrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgetrf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
