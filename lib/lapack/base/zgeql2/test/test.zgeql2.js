
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeql2 from './../lib/zgeql2.js';


// TESTS //

test( 'zgeql2 is a function', function t() {
	assert.strictEqual( typeof zgeql2, 'function', 'is a function' );
});

test( 'zgeql2 has expected arity', function t() {
	assert.strictEqual( zgeql2.length, 9, 'has expected arity' );
});

test( 'zgeql2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeql2( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgeql2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeql2( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeql2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeql2( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
