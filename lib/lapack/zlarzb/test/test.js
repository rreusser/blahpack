/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarzb from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlarzb, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zlarzb.strided, 'function', 'has strided method' );
});

test( 'strided method throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		const WORK = new Complex128Array( 4 );
		const V = new Complex128Array( 4 );
		const T = new Complex128Array( 4 );
		const C = new Complex128Array( 4 );
		zlarzb.strided( 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'strided method throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		const WORK = new Complex128Array( 4 );
		const V = new Complex128Array( 4 );
		const T = new Complex128Array( 4 );
		const C = new Complex128Array( 4 );
		zlarzb.strided( 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'strided method throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		const WORK = new Complex128Array( 4 );
		const V = new Complex128Array( 4 );
		const T = new Complex128Array( 4 );
		const C = new Complex128Array( 4 );
		zlarzb.strided( 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});
