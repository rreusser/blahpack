/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspgvx from './../lib/dspgvx.js';


// TESTS //

test( 'dspgvx is a function', function t() {
	assert.strictEqual( typeof dspgvx, 'function', 'is a function' );
});

test( 'dspgvx has expected arity', function t() {
	assert.strictEqual( dspgvx.length, 20, 'has expected arity' );
});

test( 'dspgvx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dspgvx( 'invalid', 2, 2, 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspgvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspgvx( 'row-major', 2, 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspgvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspgvx( 'row-major', 2, 2, 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
