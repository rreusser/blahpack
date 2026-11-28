/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zhetf2Rook from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhetf2Rook, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zhetf2Rook.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export and strided are distinct functions', function t() {
	assert.notStrictEqual( zhetf2Rook, zhetf2Rook.strided, 'are distinct' );
	assert.strictEqual( typeof zhetf2Rook.strided, 'function', 'is a function' );
});
