

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddisna from './../lib/ddisna.js';


// TESTS //

test( 'ddisna is a function', function t() {
	assert.strictEqual( typeof ddisna, 'function', 'is a function' );
});

test( 'ddisna has expected arity', function t() {
	assert.strictEqual( ddisna.length, 7, 'has expected arity' );
});

test( 'ddisna throws RangeError for invalid job (via base.js)', function t() {
	var info = ddisna( 'invalid', 2, 2, new Float64Array( [ 1.0, 2.0 ] ), 1, new Float64Array( 2 ), 1 );
	assert.strictEqual( info, -1, 'returns -1 for invalid job' );
});

test( 'ddisna throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ddisna( 'eigenvalues', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ddisna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ddisna( 'eigenvalues', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

