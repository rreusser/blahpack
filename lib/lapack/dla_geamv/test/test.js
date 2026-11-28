
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dla_geamv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_geamv, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dla_geamv.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (12)', function t() {
	assert.strictEqual( dla_geamv.length, 12, 'has expected arity' );
});

test( 'strided method has expected arity (15)', function t() {
	assert.strictEqual( dla_geamv.strided.length, 15, 'strided has expected arity' ); // eslint-disable-line max-len
});
