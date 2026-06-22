/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlascl from './../lib/dlascl.js';


// TESTS //

test( 'dlascl is a function', function t() {
	assert.strictEqual( typeof dlascl, 'function', 'is a function' );
});

test( 'dlascl has expected arity', function t() {
	assert.strictEqual( dlascl.length, 10, 'has expected arity' );
});

test( 'dlascl throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlascl( 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlascl throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlascl( 'row-major', 2, 2, 2, 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlascl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlascl( 'row-major', 2, 2, 2, 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
