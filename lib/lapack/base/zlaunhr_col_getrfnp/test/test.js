/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaunhr_col_getrfnp from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlaunhr_col_getrfnp, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlaunhr_col_getrfnp.ndarray, 'function', 'has ndarray method' );
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zlaunhr_col_getrfnp.length, 7, 'has expected arity' );
});

test( 'main throws TypeError for invalid order', function t() {
	assert.throws( function fn() {
		zlaunhr_col_getrfnp( 'invalid', 1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, TypeError );
});

test( 'main throws RangeError for negative M', function t() {
	assert.throws( function fn() {
		zlaunhr_col_getrfnp( 'column-major', -1, 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'main throws RangeError for negative N', function t() {
	assert.throws( function fn() {
		zlaunhr_col_getrfnp( 'column-major', 1, -1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1 );
	}, RangeError );
});

test( 'main throws RangeError when LDA < max(1,M) for column-major', function t() {
	assert.throws( function fn() {
		zlaunhr_col_getrfnp( 'column-major', 3, 3, new Complex128Array( 9 ), 2, new Complex128Array( 3 ), 1 );
	}, RangeError );
});
