/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zung2r from './../lib/zung2r.js';


// TESTS //

test( 'zung2r is a function', function t() {
	assert.strictEqual( typeof zung2r, 'function', 'is a function' );
});

test( 'zung2r has expected arity', function t() {
	assert.strictEqual( zung2r.length, 10, 'has expected arity' );
});

test( 'zung2r throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zung2r( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zung2r throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zung2r( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zung2r throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zung2r( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zung2r throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zung2r( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
