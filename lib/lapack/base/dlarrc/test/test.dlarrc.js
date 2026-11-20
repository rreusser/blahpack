/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrc from './../lib/dlarrc.js';


// TESTS //

test( 'dlarrc is a function', function t() {
	assert.strictEqual( typeof dlarrc, 'function', 'is a function' );
});

test( 'dlarrc has expected arity', function t() {
	assert.strictEqual( dlarrc.length, 12, 'has expected arity' );
});

test( 'dlarrc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const eigcnt = new Int32Array( 1 );
		const lcnt = new Int32Array( 1 );
		const rcnt = new Int32Array( 1 );
		dlarrc( 2, -1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, eigcnt, lcnt, rcnt );
	}, RangeError );
});
