/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtprfb from './../lib/dtprfb.js';
import main from './../lib/index.js';


// TESTS //

test( 'dtprfb is a function', function t() {
	assert.strictEqual( typeof dtprfb, 'function', 'is a function' );
});

test( 'dtprfb has expected arity', function t() {
	assert.strictEqual( dtprfb.length, 19, 'has expected arity' );
});

test( 'dtprfb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtprfb( 'invalid', 'left', 'no-transpose', 'forward', 'columnwise', 2, 2, 2, 2, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, TypeError );
});

test( 'dtprfb throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'invalid', 'no-transpose', 'forward', 'columnwise', 2, 2, 2, 2, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, TypeError );
});

test( 'dtprfb throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'invalid', 'forward', 'columnwise', 2, 2, 2, 2, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, TypeError );
});

test( 'dtprfb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', -1, 2, 2, 2, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 2, -1, 2, 2, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 2, 2, -1, 2, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDV (row-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 1, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDV (column-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 1, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDT (row-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 1, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDT (column-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 1, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDA (row-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 1, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDA (column-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 1, new Float64Array( 25 ), 5, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDB (row-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 1, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDB (column-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 1, new Float64Array( 25 ), 5 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDWORK (row-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 1 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for invalid LDWORK (column-major)', function t() {
	assert.throws( function throws() {
		dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 16 ), 8, new Float64Array( 9 ), 3, new Float64Array( 16 ), 4, new Float64Array( 25 ), 5, new Float64Array( 25 ), 1 );
	}, RangeError );
});

test( 'dtprfb column-major path executes', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 16 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	V[ 0 ] = 1; V[ 8 ] = 0.3; V[ 9 ] = 1; V[ 3 ] = 0.2; V[ 11 ] = 1;
	T[ 0 ] = 1.2; T[ 4 ] = -0.3; T[ 5 ] = 0.8;
	A[ 0 ] = 1; A[ 1 ] = 4; A[ 4 ] = 2; A[ 5 ] = 5; A[ 8 ] = 3; A[ 9 ] = 6;
	B[ 0 ] = 7; B[ 1 ] = 10; B[ 2 ] = 13; B[ 3 ] = 16;
	B[ 5 ] = 8; B[ 6 ] = 11; B[ 7 ] = 14; B[ 8 ] = 17;
	B[ 10 ] = 9; B[ 11 ] = 12; B[ 12 ] = 15; B[ 13 ] = 18;
	dtprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 8, T, 4, A, 4, B, 5, WORK, 5 );
	assert.ok( Math.abs( A[ 0 ] - ( -2.81 ) ) < 1e-3 );
});

test( 'dtprfb row-major path executes', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	dtprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 2, 3, 0, 0, V, 3, T, 3, A, 3, B, 3, WORK, 3 );
	assert.ok( true );
});

test( 'dtprfb exposes ndarray method', function t() {
	assert.strictEqual( typeof main.ndarray, 'function', 'has ndarray method' );
});
