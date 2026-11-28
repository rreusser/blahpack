/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgebal from './../lib/zgebal.js';


// TESTS //

test( 'zgebal is a function', function t() {
	assert.strictEqual( typeof zgebal, 'function', 'is a function' );
});

test( 'zgebal has expected arity', function t() {
	assert.strictEqual( zgebal.length, 9, 'has expected arity' );
});

test( 'zgebal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		zgebal( 'column-major', 'both', -1, new Float64Array( 4 ), 2, ilo, ihi, new Float64Array( 4 ), 1 );
	}, RangeError );
});
