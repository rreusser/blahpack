/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbtrs from './../lib/zgbtrs.js';


// TESTS //

test( 'zgbtrs is a function', function t() {
	assert.strictEqual( typeof zgbtrs, 'function', 'is a function' );
});

test( 'zgbtrs has expected arity', function t() {
	assert.strictEqual( zgbtrs.length, 12, 'has expected arity' );
});

test( 'zgbtrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgbtrs( 'invalid', 'no-transpose', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgbtrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgbtrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgbtrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbtrs( 'row-major', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgbtrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgbtrs( 'row-major', 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
