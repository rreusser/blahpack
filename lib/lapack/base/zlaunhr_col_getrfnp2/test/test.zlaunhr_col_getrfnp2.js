/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaunhr_col_getrfnp2 from './../lib/zlaunhr_col_getrfnp2.js';


// TESTS //

test( 'zlaunhr_col_getrfnp2 is a function', function t() {
	assert.strictEqual( typeof zlaunhr_col_getrfnp2, 'function', 'is a function' );
});

test( 'zlaunhr_col_getrfnp2 has expected arity', function t() {
	assert.strictEqual( zlaunhr_col_getrfnp2.length, 7, 'has expected arity' );
});

test( 'zlaunhr_col_getrfnp2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlaunhr_col_getrfnp2( 'invalid', 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, TypeError );
});

test( 'zlaunhr_col_getrfnp2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlaunhr_col_getrfnp2( 'column-major', -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});

test( 'zlaunhr_col_getrfnp2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaunhr_col_getrfnp2( 'column-major', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1 );
	}, RangeError );
});
