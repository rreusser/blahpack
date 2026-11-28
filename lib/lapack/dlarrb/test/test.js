
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarrb from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarrb, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlarrb.strided, 'function', 'has strided method' );
});

test( 'main export and strided method have the expected arities', function t() {
	assert.strictEqual( dlarrb.length, 21, 'main has arity 24' );
	assert.strictEqual( dlarrb.strided.length, 30, 'strided has arity 30' );
});
