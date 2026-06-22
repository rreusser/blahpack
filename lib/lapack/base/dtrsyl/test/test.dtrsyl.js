/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrsyl from './../lib/dtrsyl.js';


// TESTS //

test( 'dtrsyl is a function', function t() {
	assert.strictEqual( typeof dtrsyl, 'function', 'is a function' );
});

test( 'dtrsyl has expected arity', function t() {
	assert.strictEqual( dtrsyl.length, 12, 'has expected arity' );
});

test( 'dtrsyl throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtrsyl( 2, 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'dtrsyl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrsyl( 2, 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
