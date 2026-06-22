/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpotrf from './../lib/zpotrf.js';


// TESTS //

test( 'zpotrf is a function', function t() {
	assert.strictEqual( typeof zpotrf, 'function', 'is a function' );
});

test( 'zpotrf has expected arity', function t() {
	assert.strictEqual( zpotrf.length, 5, 'has expected arity' );
});

test( 'zpotrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpotrf( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpotrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpotrf( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpotrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpotrf( 'row-major', 'upper', -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
