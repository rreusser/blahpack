
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_porfsx_extended from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_porfsx_extended, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zla_porfsx_extended.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'strided method is distinct from the BLAS-layout wrapper', function t() {
	assert.notStrictEqual( zla_porfsx_extended, zla_porfsx_extended.strided, 'distinct functions' ); // eslint-disable-line max-len
});
