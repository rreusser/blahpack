/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeqr2p from './../lib/zgeqr2p.js';


// TESTS //

test( 'zgeqr2p is a function', function t() {
	assert.strictEqual( typeof zgeqr2p, 'function', 'is a function' );
});

test( 'zgeqr2p has expected arity', function t() {
	assert.strictEqual( zgeqr2p.length, 9, 'has expected arity' );
});

test( 'zgeqr2p throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqr2p( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgeqr2p throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqr2p( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeqr2p throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqr2p( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
