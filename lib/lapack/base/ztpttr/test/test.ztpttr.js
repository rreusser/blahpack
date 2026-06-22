/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpttr from './../lib/ztpttr.js';


// TESTS //

test( 'ztpttr is a function', function t() {
	assert.strictEqual( typeof ztpttr, 'function', 'is a function' );
});

test( 'ztpttr has expected arity', function t() {
	assert.strictEqual( ztpttr.length, 6, 'has expected arity' );
});

test( 'ztpttr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztpttr( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpttr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpttr( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztpttr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpttr( 'row-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
