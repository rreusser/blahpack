/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstebz from './../lib/dstebz.js';


// TESTS //

test( 'dstebz is a function', function t() {
	assert.strictEqual( typeof dstebz, 'function', 'is a function' );
});

test( 'dstebz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstebz( 'all', 'block', -1, 0, 0, 0, 0, 0, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), new Int32Array( 1 ), new Float64Array( 1 ), 1, new Int32Array( 1 ), 1, new Int32Array( 1 ), 1, new Float64Array( 1 ), 1, new Int32Array( 1 ), 1 );
	}, RangeError );
});
