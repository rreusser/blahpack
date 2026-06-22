/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaorhr_col_getrfnp from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaorhr_col_getrfnp, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlaorhr_col_getrfnp.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( dlaorhr_col_getrfnp.length, 7, 'has expected arity' );
});

test( 'ndarray method has expected arity', function t() {
	assert.strictEqual( dlaorhr_col_getrfnp.ndarray.length, 9, 'ndarray has expected arity' ); // eslint-disable-line max-len
});
