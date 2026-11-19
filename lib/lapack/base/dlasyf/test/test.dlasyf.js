/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasyf from './../lib/dlasyf.js';


// TESTS //

test( 'dlasyf is a function', function t() {
	assert.strictEqual( typeof dlasyf, 'function', 'is a function' );
});

test( 'dlasyf has expected arity', function t() {
	assert.strictEqual( dlasyf.length, 11, 'has expected arity' );
});

test( 'dlasyf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlasyf( 'invalid', 'upper', new Float64Array( 4 ), 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasyf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlasyf( 'row-major', 'invalid', new Float64Array( 4 ), 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlasyf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const kb = new Int32Array( 1 );
		dlasyf( 'row-major', 'upper', -1, 2, kb, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
