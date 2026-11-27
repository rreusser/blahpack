/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlapy2 from './../lib/dlapy2.js';


// TESTS //

test( 'dlapy2 is a function', function t() {
	assert.strictEqual( typeof dlapy2, 'function', 'is a function' );
});

test( 'dlapy2 has expected arity', function t() {
	assert.strictEqual( dlapy2.length, 2, 'has expected arity' );
});
