/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarf from './../lib/zlarf.js';


// TESTS //

test( 'zlarf is a function', function t() {
	assert.strictEqual( typeof zlarf, 'function', 'is a function' );
});

test( 'zlarf has expected arity', function t() {
	assert.strictEqual( zlarf.length, 12, 'has expected arity' );
});

test( 'zlarf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarf( 'invalid', 'left', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlarf throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlarf( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlarf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarf( 'row-major', 'left', -1, new Float64Array( 4 ), 2, 1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlarf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarf( 'row-major', 'left', new Float64Array( 4 ), -1, 2, 1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
