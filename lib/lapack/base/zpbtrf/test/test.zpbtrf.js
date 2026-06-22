/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpbtrf from './../lib/zpbtrf.js';


// TESTS //

test( 'zpbtrf is a function', function t() {
	assert.strictEqual( typeof zpbtrf, 'function', 'is a function' );
});

test( 'zpbtrf has expected arity', function t() {
	assert.strictEqual( zpbtrf.length, 6, 'has expected arity' );
});

test( 'zpbtrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpbtrf( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpbtrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpbtrf( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpbtrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpbtrf( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
