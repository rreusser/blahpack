/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztfttr from './../lib/ztfttr.js';


// TESTS //

test( 'ztfttr is a function', function t() {
	assert.strictEqual( typeof ztfttr, 'function', 'is a function' );
});

test( 'ztfttr has expected arity', function t() {
	assert.strictEqual( ztfttr.length, 7, 'has expected arity' );
});

test( 'ztfttr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztfttr( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztfttr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztfttr( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztfttr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztfttr( 'row-major', 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
