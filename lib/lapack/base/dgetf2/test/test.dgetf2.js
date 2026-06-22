/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetf2 from './../lib/dgetf2.js';


// TESTS //

test( 'dgetf2 is a function', function t() {
	assert.strictEqual( typeof dgetf2, 'function', 'is a function' );
});

test( 'dgetf2 has expected arity', function t() {
	assert.strictEqual( dgetf2.length, 7, 'has expected arity' );
});

test( 'dgetf2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgetf2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dgetf2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgetf2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dgetf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgetf2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
