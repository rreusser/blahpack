/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements-per-line */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgerqf from './../lib/zgerqf.js';


// TESTS //

test( 'zgerqf is a function', function t() {
	assert.strictEqual( typeof zgerqf, 'function', 'is a function' );
});

test( 'zgerqf has expected arity', function t() {
	assert.strictEqual( zgerqf.length, 10, 'has expected arity' );
});

test( 'zgerqf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgerqf( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zgerqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgerqf( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'zgerqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgerqf( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
