/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zposv from './../lib/zposv.js';


// TESTS //

test( 'zposv is a function', function t() {
	assert.strictEqual( typeof zposv, 'function', 'is a function' );
});

test( 'zposv has expected arity', function t() {
	assert.strictEqual( zposv.length, 7, 'has expected arity' );
});

test( 'zposv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zposv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zposv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zposv( 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zposv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zposv( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
