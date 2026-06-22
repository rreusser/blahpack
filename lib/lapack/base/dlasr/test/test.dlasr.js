/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasr from './../lib/dlasr.js';


// TESTS //

test( 'dlasr is a function', function t() {
	assert.strictEqual( typeof dlasr, 'function', 'is a function' );
});

test( 'dlasr has expected arity', function t() {
	assert.strictEqual( dlasr.length, 12, 'has expected arity' );
});

test( 'dlasr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlasr( 'invalid', 'left', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlasr( 'row-major', 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlasr( 'row-major', 'left', 2, 2, -1, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlasr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasr( 'row-major', 'left', 2, 2, new Float64Array( 4 ), -1, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
