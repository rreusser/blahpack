
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaeda from './../lib/dlaeda.js';


// TESTS //

test( 'dlaeda is a function', function t() {
	assert.strictEqual( typeof dlaeda, 'function', 'is a function' );
});

test( 'dlaeda has expected arity', function t() {
	assert.strictEqual( dlaeda.length, 29, 'has expected arity' );
});

test( 'dlaeda throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaeda( 'invalid', 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlaeda throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaeda( 'row-major', -1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
