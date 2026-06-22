/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dopgtr from './../lib/dopgtr.js';


// TESTS //

test( 'dopgtr is a function', function t() {
	assert.strictEqual( typeof dopgtr, 'function', 'is a function' );
});

test( 'dopgtr has expected arity', function t() {
	assert.strictEqual( dopgtr.length, 8, 'has expected arity' );
});

test( 'dopgtr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dopgtr( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopgtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dopgtr( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dopgtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dopgtr( 'row-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
