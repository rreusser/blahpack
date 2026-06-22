

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztgexc from './../lib/ztgexc.js';


// TESTS //

test( 'ztgexc is a function', function t() {
	assert.strictEqual( typeof ztgexc, 'function', 'is a function' );
});

test( 'ztgexc has expected arity', function t() {
	assert.strictEqual( ztgexc.length, 14, 'has expected arity' );
});

test( 'ztgexc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztgexc( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2 );
	}, TypeError );
});

test( 'ztgexc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztgexc( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2 );
	}, RangeError );
});

