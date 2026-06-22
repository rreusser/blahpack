/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgetrs from './../lib/zgetrs.js';


// TESTS //

test( 'zgetrs is a function', function t() {
	assert.strictEqual( typeof zgetrs, 'function', 'is a function' );
});

test( 'zgetrs has expected arity', function t() {
	assert.strictEqual( zgetrs.length, 10, 'has expected arity' );
});

test( 'zgetrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgetrs( 'invalid', 'no-transpose', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgetrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgetrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgetrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgetrs( 'row-major', 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgetrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgetrs( 'row-major', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
