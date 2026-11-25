/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
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

test( 'zlarzb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K (ZLARZB: LDT >= K); rowwise V is K by L (LDV >= K).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDV': 16, 'LDT': 16, 'LDC': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return zlarzb( order, 'left', 'no-transpose', 'backward', 'rowwise', 6, 5, 2, 3, Z(), L.LDV, Z(), L.LDT, Z(), L.LDC, Z(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDV': 2 } );
	}, 'column-major LDV = 2 is accepted' );
});
