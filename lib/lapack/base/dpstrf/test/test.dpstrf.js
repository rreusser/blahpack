/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpstrf from './../lib/dpstrf.js';


// TESTS //

test( 'dpstrf is a function', function t() {
	assert.strictEqual( typeof dpstrf, 'function', 'is a function' );
});

test( 'dpstrf has expected arity', function t() {
	assert.strictEqual( dpstrf.length, 9, 'has expected arity' );
});

test( 'dpstrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpstrf( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpstrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpstrf( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpstrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpstrf( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
