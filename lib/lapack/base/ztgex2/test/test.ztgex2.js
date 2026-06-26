
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztgex2 from './../lib/ztgex2.js';


// TESTS //

test( 'ztgex2 is a function', function t() {
	assert.strictEqual( typeof ztgex2, 'function', 'is a function' );
});

test( 'ztgex2 has expected arity', function t() {
	assert.strictEqual( ztgex2.length, 13, 'has expected arity' );
});

test( 'ztgex2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztgex2( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'ztgex2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztgex2( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
