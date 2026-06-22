/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsysv from './../lib/zsysv.js';


// TESTS //

test( 'zsysv is a function', function t() {
	assert.strictEqual( typeof zsysv, 'function', 'is a function' );
});

test( 'zsysv has expected arity', function t() {
	assert.strictEqual( zsysv.length, 9, 'has expected arity' );
});

test( 'zsysv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsysv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsysv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsysv( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zsysv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zsysv( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
