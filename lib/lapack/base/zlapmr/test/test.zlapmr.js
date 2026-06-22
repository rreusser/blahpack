/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlapmr from './../lib/zlapmr.js';


// TESTS //

test( 'zlapmr is a function', function t() {
	assert.strictEqual( typeof zlapmr, 'function', 'is a function' );
});

test( 'zlapmr has expected arity', function t() {
	assert.strictEqual( zlapmr.length, 7, 'has expected arity' );
});

test( 'zlapmr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlapmr( 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'zlapmr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlapmr( 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
