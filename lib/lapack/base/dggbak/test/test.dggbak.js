/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggbak from './../lib/dggbak.js';


// TESTS //

test( 'dggbak is a function', function t() {
	assert.strictEqual( typeof dggbak, 'function', 'is a function' );
});

test( 'dggbak has expected arity', function t() {
	assert.strictEqual( dggbak.length, 13, 'has expected arity' );
});

test( 'dggbak throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dggbak( 'invalid', 2, 'left', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dggbak throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dggbak( 'row-major', 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dggbak throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggbak( 'row-major', 2, 'left', -1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dggbak throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggbak( 'row-major', 2, 'left', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
