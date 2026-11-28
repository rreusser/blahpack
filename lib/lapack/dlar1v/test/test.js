
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlar1v from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlar1v, 'function', 'main export is a function' );
	assert.ok( dlar1v.length > 0, 'has a nonzero arity' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlar1v.strided, 'function', 'has strided method' );
	assert.notStrictEqual( dlar1v.strided, dlar1v, 'strided is a distinct function' ); // eslint-disable-line max-len
});
