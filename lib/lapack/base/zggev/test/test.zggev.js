/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggev from './../lib/zggev.js';


// TESTS //

test( 'zggev is a function', function t() {
	assert.strictEqual( typeof zggev, 'function', 'is a function' );
});

test( 'zggev has expected arity', function t() {
	assert.strictEqual( zggev.length, 16, 'has expected arity' );
});

test( 'zggev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zggev( 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zggev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggev( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
