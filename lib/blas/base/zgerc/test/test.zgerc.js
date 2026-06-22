/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgerc from './../lib/zgerc.js';


// TESTS //

test( 'zgerc is a function', function t() {
	assert.strictEqual( typeof zgerc, 'function', 'is a function' );
});

test( 'zgerc has expected arity', function t() {
	assert.strictEqual( zgerc.length, 10, 'has expected arity' );
});

test( 'zgerc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgerc( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgerc throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgerc( 'row-major', -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgerc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgerc( 'row-major', new Float64Array( 4 ), -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
