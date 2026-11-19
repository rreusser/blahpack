/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlassq from './../lib/dlassq.js';


// TESTS //

test( 'dlassq is a function', function t() {
	assert.strictEqual( typeof dlassq, 'function', 'is a function' );
});

test( 'dlassq has expected arity', function t() {
	assert.strictEqual( dlassq.length, 5, 'has expected arity' );
});

test( 'dlassq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const scale = new Float64Array( 1 );
		const sumsq = new Float64Array( 1 );
		scale[ 0 ] = 2;
		sumsq[ 0 ] = 2;
		dlassq( -1, 2, 1, scale, sumsq );
	}, RangeError );
});
