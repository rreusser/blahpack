/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetrf2 from './../lib/dgetrf2.js';


// TESTS //

test( 'dgetrf2 is a function', function t() {
	assert.strictEqual( typeof dgetrf2, 'function', 'is a function' );
});

test( 'dgetrf2 has expected arity', function t() {
	assert.strictEqual( dgetrf2.length, 7, 'has expected arity' );
});

test( 'dgetrf2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgetrf2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgetrf2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgetrf2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgetrf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgetrf2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
