
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zungtsqr_row from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zungtsqr_row, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zungtsqr_row.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});
