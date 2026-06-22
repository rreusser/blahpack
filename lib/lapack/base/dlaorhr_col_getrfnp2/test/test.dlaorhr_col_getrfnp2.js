/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaorhr_col_getrfnp2 from './../lib/dlaorhr_col_getrfnp2.js';


// TESTS //

test( 'dlaorhr_col_getrfnp2 is a function', function t() {
	assert.strictEqual( typeof dlaorhr_col_getrfnp2, 'function', 'is a function' );
});

test( 'dlaorhr_col_getrfnp2 has expected arity', function t() {
	assert.strictEqual( dlaorhr_col_getrfnp2.length, 7, 'has expected arity' );
});

test( 'dlaorhr_col_getrfnp2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlaorhr_col_getrfnp2( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlaorhr_col_getrfnp2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaorhr_col_getrfnp2( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlaorhr_col_getrfnp2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaorhr_col_getrfnp2( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
