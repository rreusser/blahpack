/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungl2 from './../lib/zungl2.js';


// TESTS //

test( 'zungl2 is a function', function t() {
	assert.strictEqual( typeof zungl2, 'function', 'is a function' );
});

test( 'zungl2 has expected arity', function t() {
	assert.strictEqual( zungl2.length, 10, 'has expected arity' );
});

test( 'zungl2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungl2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zungl2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungl2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zungl2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungl2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zungl2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungl2( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
