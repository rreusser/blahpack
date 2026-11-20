/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrexc from './../lib/dtrexc.js';


// TESTS //

test( 'dtrexc is a function', function t() {
	assert.strictEqual( typeof dtrexc, 'function', 'is a function' );
});

test( 'dtrexc has expected arity', function t() {
	assert.strictEqual( dtrexc.length, 10, 'has expected arity' );
});

test( 'dtrexc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ifst = new Int32Array( 1 );
		const ilst = new Int32Array( 1 );
		ifst[ 0 ] = 2;
		ilst[ 0 ] = 2;
		dtrexc( 'column-major', 'none', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, ifst, ilst, new Float64Array( 4 ) );
	}, RangeError );
});
