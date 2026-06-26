/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaorhr_col_getrfnp2 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaorhr_col_getrfnp2, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlaorhr_col_getrfnp2.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( dlaorhr_col_getrfnp2.length, 7, 'has expected arity' );
});

test( 'ndarray method has expected arity', function t() {
	assert.strictEqual( dlaorhr_col_getrfnp2.ndarray.length, 9, 'ndarray has expected arity' ); // eslint-disable-line max-len
});
