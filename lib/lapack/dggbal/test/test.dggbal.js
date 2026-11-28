/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggbal from './../lib/dggbal.js';


// TESTS //

test( 'dggbal is a function', function t() {
	assert.strictEqual( typeof dggbal, 'function', 'is a function' );
});

test( 'dggbal has expected arity', function t() {
	assert.strictEqual( dggbal.length, 14, 'has expected arity' );
});

test( 'dggbal throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		dggbal( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, ilo, ihi, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dggbal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		dggbal( 'row-major', 'both', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, ilo, ihi, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});
