/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpstf2 from './../lib/dpstf2.js';


// TESTS //

test( 'dpstf2 is a function', function t() {
	assert.strictEqual( typeof dpstf2, 'function', 'is a function' );
});

test( 'dpstf2 has expected arity', function t() {
	assert.strictEqual( dpstf2.length, 9, 'has expected arity' );
});

test( 'dpstf2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpstf2( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpstf2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpstf2( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpstf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpstf2( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
