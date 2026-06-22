/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsymm from './../lib/zsymm.js';


// TESTS //

test( 'zsymm is a function', function t() {
	assert.strictEqual( typeof zsymm, 'function', 'is a function' );
});

test( 'zsymm has expected arity', function t() {
	assert.strictEqual( zsymm.length, 13, 'has expected arity' );
});

test( 'zsymm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsymm( 'invalid', 'left', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsymm throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zsymm( 'row-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsymm throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsymm( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsymm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zsymm( 'row-major', 'left', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zsymm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsymm( 'row-major', 'left', 'upper', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
