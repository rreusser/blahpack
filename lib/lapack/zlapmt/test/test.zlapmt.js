/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlapmt from './../lib/zlapmt.js';


// TESTS //

test( 'zlapmt is a function', function t() {
	assert.strictEqual( typeof zlapmt, 'function', 'is a function' );
});

test( 'zlapmt has expected arity', function t() {
	assert.strictEqual( zlapmt.length, 8, 'has expected arity' );
});

test( 'zlapmt throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlapmt( 'column-major', 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});

test( 'zlapmt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlapmt( 'column-major', 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1 );
	}, RangeError );
});
