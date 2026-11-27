/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlamrg from './../lib/dlamrg.js';


// TESTS //

test( 'dlamrg is a function', function t() {
	assert.strictEqual( typeof dlamrg, 'function', 'is a function' );
});

test( 'dlamrg has expected arity', function t() {
	assert.strictEqual( dlamrg.length, 8, 'has expected arity' );
});
