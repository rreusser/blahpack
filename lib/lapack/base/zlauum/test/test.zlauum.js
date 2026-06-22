/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlauum from './../lib/zlauum.js';


// TESTS //

test( 'zlauum is a function', function t() {
	assert.strictEqual( typeof zlauum, 'function', 'is a function' );
});

test( 'zlauum has expected arity', function t() {
	assert.strictEqual( zlauum.length, 5, 'has expected arity' );
});

test( 'zlauum throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlauum( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlauum throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlauum( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlauum throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlauum( 'row-major', 'upper', -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
