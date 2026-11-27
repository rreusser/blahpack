/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlag2 from './../lib/dlag2.js';


// TESTS //

test( 'dlag2 is a function', function t() {
	assert.strictEqual( typeof dlag2, 'function', 'is a function' );
});

test( 'dlag2 has expected arity', function t() {
	assert.strictEqual( dlag2.length, 11, 'has expected arity' );
});

test( 'dlag2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const scale1 = new Float64Array( 1 );
		const scale2 = new Float64Array( 1 );
		const wr1 = new Float64Array( 1 );
		const wr2 = new Float64Array( 1 );
		const wi = new Float64Array( 1 );
		dlag2( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, scale1, scale2, wr1, wr2, wi );
	}, TypeError );
});
