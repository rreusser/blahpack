/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarzb from './../lib/zlarzb.js';


// TESTS //

test( 'zlarzb is a function', function t() {
	assert.strictEqual( typeof zlarzb, 'function', 'is a function' );
});

test( 'zlarzb has expected arity', function t() {
	assert.strictEqual( zlarzb.length, 17, 'has expected arity' );
});

test( 'zlarzb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarzb( 'invalid', 'left', 'no-transpose', 'backward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'invalid', 'backward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zlarzb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', -1, 2, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zlarzb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, -1, 2, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zlarzb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarzb( 'row-major', 'left', 'no-transpose', 'backward', 'rowwise', 2, 2, -1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2 ); // eslint-disable-line max-len
	}, RangeError );
});
