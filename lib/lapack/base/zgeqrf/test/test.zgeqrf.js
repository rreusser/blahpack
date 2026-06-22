/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeqrf from './../lib/zgeqrf.js';


// TESTS //

test( 'zgeqrf is a function', function t() {
	assert.strictEqual( typeof zgeqrf, 'function', 'is a function' );
});

test( 'zgeqrf has expected arity', function t() {
	assert.strictEqual( zgeqrf.length, 9, 'has expected arity' );
});

test( 'zgeqrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgeqrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqrf( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgeqrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqrf( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
