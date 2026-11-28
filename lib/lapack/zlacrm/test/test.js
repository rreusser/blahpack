
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlacrm from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlacrm, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zlacrm.strided, 'function', 'has strided method' );
});

test( 'main export and strided method have expected arities', function t() {
	assert.strictEqual( zlacrm.length, 10, 'main has expected arity' );
	assert.strictEqual( zlacrm.strided.length, 17, 'strided has expected arity' );
});
