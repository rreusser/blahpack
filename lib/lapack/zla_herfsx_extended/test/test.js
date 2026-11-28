
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlaHerfsxExtended from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlaHerfsxExtended, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zlaHerfsxExtended.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'strided method is distinct from main export', function t() {
	assert.notStrictEqual( zlaHerfsxExtended, zlaHerfsxExtended.strided, 'main export is not the strided method' ); // eslint-disable-line max-len
});
