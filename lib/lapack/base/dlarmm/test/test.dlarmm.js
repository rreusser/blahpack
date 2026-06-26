
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarmm from './../lib/dlarmm.js';


// TESTS //

test( 'dlarmm is a function', function t() {
	assert.strictEqual( typeof dlarmm, 'function', 'is a function' );
} );

test( 'dlarmm has expected arity', function t() {
	assert.strictEqual( dlarmm.length, 3, 'has expected arity' );
} );

test( 'dlarmm returns 1.0 for small norms', function t() {
	var s = dlarmm( 1.0, 1.0, 1.0 );
	assert.strictEqual( s, 1.0 );
} );

test( 'dlarmm returns 0.5 when overflow would occur with bnorm <= 1', function t() {
	var s = dlarmm( 1e308, 1.0, 1e307 );
	assert.strictEqual( s, 0.5 );
} );
