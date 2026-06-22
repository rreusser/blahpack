/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrsyl from './../lib/ztrsyl.js';


// TESTS //

test( 'ztrsyl is a function', function t() {
	assert.strictEqual( typeof ztrsyl, 'function', 'is a function' );
});

test( 'ztrsyl has expected arity', function t() {
	assert.strictEqual( ztrsyl.length, 12, 'has expected arity' );
});

test( 'ztrsyl throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztrsyl( 2, 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'ztrsyl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrsyl( 2, 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
