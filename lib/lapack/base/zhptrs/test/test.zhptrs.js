/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhptrs from './../lib/zhptrs.js';


// TESTS //

test( 'zhptrs is a function', function t() {
	assert.strictEqual( typeof zhptrs, 'function', 'is a function' );
});

test( 'zhptrs has expected arity', function t() {
	assert.strictEqual( zhptrs.length, 8, 'has expected arity' );
});

test( 'zhptrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhptrs( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zhptrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zhptrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptrs( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zhptrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhptrs( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
