/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetrs from './../lib/dgetrs.js';


// TESTS //

test( 'dgetrs is a function', function t() {
	assert.strictEqual( typeof dgetrs, 'function', 'is a function' );
});

test( 'dgetrs has expected arity', function t() {
	assert.strictEqual( dgetrs.length, 10, 'has expected arity' );
});

test( 'dgetrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgetrs( 'invalid', 'no-transpose', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgetrs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgetrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dgetrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgetrs( 'row-major', 'no-transpose', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dgetrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgetrs( 'row-major', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
