/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgemm from './../lib/zgemm.js';


// TESTS //

test( 'zgemm is a function', function t() {
	assert.strictEqual( typeof zgemm, 'function', 'is a function' );
});

test( 'zgemm has expected arity', function t() {
	assert.strictEqual( zgemm.length, 14, 'has expected arity' );
});

test( 'zgemm throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgemm( 'invalid', 'no-transpose', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemm throws TypeError for invalid transa', function t() {
	assert.throws( function throws() {
		zgemm( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemm throws TypeError for invalid transb', function t() {
	assert.throws( function throws() {
		zgemm( 'row-major', 'no-transpose', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgemm throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgemm( 'row-major', 'no-transpose', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgemm( 'row-major', 'no-transpose', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgemm throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zgemm( 'row-major', 'no-transpose', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
