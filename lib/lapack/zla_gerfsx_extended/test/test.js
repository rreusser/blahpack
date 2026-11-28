
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_gerfsx_extended from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_gerfsx_extended, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zla_gerfsx_extended.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'strided method is distinct from main export', function t() {
	assert.notStrictEqual( zla_gerfsx_extended.strided, zla_gerfsx_extended, 'strided is distinct' ); // eslint-disable-line max-len
});
