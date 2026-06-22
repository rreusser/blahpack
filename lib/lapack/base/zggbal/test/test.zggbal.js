/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggbal from './../lib/zggbal.js';


// TESTS //

test( 'zggbal is a function', function t() {
	assert.strictEqual( typeof zggbal, 'function', 'is a function' );
});

test( 'zggbal has expected arity', function t() {
	assert.strictEqual( zggbal.length, 13, 'has expected arity' );
});

test( 'zggbal throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zggbal( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zggbal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggbal( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
