/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspevx from './../lib/dspevx.js';


// TESTS //

test( 'dspevx is a function', function t() {
	assert.strictEqual( typeof dspevx, 'function', 'is a function' );
});

test( 'dspevx has expected arity', function t() {
	assert.strictEqual( dspevx.length, 18, 'has expected arity' );
});

test( 'dspevx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dspevx( 'invalid', 2, 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspevx( 'row-major', 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dspevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspevx( 'row-major', 2, 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
