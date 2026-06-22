/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarf from './../lib/dlarf.js';


// TESTS //

test( 'dlarf is a function', function t() {
	assert.strictEqual( typeof dlarf, 'function', 'is a function' );
});

test( 'dlarf has expected arity', function t() {
	assert.strictEqual( dlarf.length, 11, 'has expected arity' );
});

test( 'dlarf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarf( 'invalid', 'left', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlarf throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarf( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlarf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarf( 'row-major', 'left', -1, new Float64Array( 4 ), 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dlarf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarf( 'row-major', 'left', new Float64Array( 4 ), -1, 2, 1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
