/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrmm from './../lib/ndarray.js';
import ndarray from './../lib/ndarray.js';

import left_upper_n from './fixtures/left_upper_n.json' with { type: 'json' };
import left_lower_n from './fixtures/left_lower_n.json' with { type: 'json' };
import left_upper_t from './fixtures/left_upper_t.json' with { type: 'json' };
import left_lower_t from './fixtures/left_lower_t.json' with { type: 'json' };
import right_upper_n from './fixtures/right_upper_n.json' with { type: 'json' };
import right_lower_n from './fixtures/right_lower_n.json' with { type: 'json' };
import right_upper_t from './fixtures/right_upper_t.json' with { type: 'json' };
import right_lower_t from './fixtures/right_lower_t.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import unit_diag from './fixtures/unit_diag.json' with { type: 'json' };

var fixtures = {
	'left_upper_n': left_upper_n,
	'left_lower_n': left_lower_n,
	'left_upper_t': left_upper_t,
	'left_lower_t': left_lower_t
};

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* SetupTriUpper3.
*
* @private
* @param {*} a - a
*/
function setupTriUpper3( a ) {
	// Upper tri 3x3 col-major LDA=3: [2 3 4; 0 5 6; 0 0 7]
	a[ 0 ] = 2; a[ 3 ] = 3; a[ 6 ] = 4;
	a[ 4 ] = 5; a[ 7 ] = 6;
	a[ 8 ] = 7;
}

/**
* SetupTriLower3.
*
* @private
* @param {*} a - a
*/
function setupTriLower3( a ) {
	// Lower tri 3x3 col-major LDA=3: [2 0 0; 3 5 0; 4 6 7]
	a[ 0 ] = 2; a[ 1 ] = 3; a[ 2 ] = 4;
	a[ 4 ] = 5; a[ 5 ] = 6;
	a[ 8 ] = 7;
}

/**
* SetupB3x2.
*
* @private
* @param {*} b - b
*/
function setupB3x2( b ) {
	b[ 0 ] = 1; b[ 1 ] = 2; b[ 2 ] = 3;
	b[ 3 ] = 4; b[ 4 ] = 5; b[ 5 ] = 6;
}

var cases = [
	{
		'name': 'left_upper_n',
		's': 'left',
		'u': 'upper',
		't': 'no-transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriUpper3,
		'aLda': 3
	}, // eslint-disable-line max-len
	{
		'name': 'left_lower_n',
		's': 'left',
		'u': 'lower',
		't': 'no-transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriLower3,
		'aLda': 3
	}, // eslint-disable-line max-len
	{
		'name': 'left_upper_t',
		's': 'left',
		'u': 'upper',
		't': 'transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriUpper3,
		'aLda': 3
	}, // eslint-disable-line max-len
	{
		'name': 'left_lower_t',
		's': 'left',
		'u': 'lower',
		't': 'transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriLower3,
		'aLda': 3
	} // eslint-disable-line max-len
];

cases.forEach( function forEach( c ) {
	test( 'dtrmm: ' + c.name, function t() {
		var tc = fixtures[ c.name ];
		var a = new Float64Array( 16 );
		var b = new Float64Array( 16 );
		c.aFn( a );
		setupB3x2( b );
		dtrmm( c.s, c.u, c.t, c.d, c.m, c.n, c.al, a, 1, c.aLda, 0, b, 1, 3, 0 );
		assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
	});
});

test( 'dtrmm: right upper N', function t() {
	var tc;
	var a;
	var b;

	tc = right_upper_n;
	a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 2 ] = 3;
	a[ 3 ] = 5;
	b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: right lower N', function t() {
	var tc;
	var a;
	var b;

	tc = right_lower_n;
	a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 1 ] = 3;
	a[ 3 ] = 5;
	b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: right upper T', function t() {
	var tc;
	var a;
	var b;

	tc = right_upper_t;
	a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 2 ] = 3;
	a[ 3 ] = 5;
	b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'upper', 'transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: right lower T', function t() {
	var tc;
	var a;
	var b;

	tc = right_lower_t;
	a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 1 ] = 3;
	a[ 3 ] = 5;
	b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'lower', 'transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: alpha=0', function t() {
	var tc;
	var a;
	var b;

	tc = alpha_zero;
	a = new Float64Array( 16 );
	setupTriUpper3( a );
	b = new Float64Array( 16 );
	setupB3x2( b );
	dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, 0.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: M=0 quick return', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( [ 99 ] );
	dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, 1.0, a, 1, 1, 0, b, 1, 1, 0 ); // eslint-disable-line max-len
	if ( b[ 0 ] !== 99 ) {
		throw new Error( 'B changed on M=0' );
	}
});

test( 'dtrmm: unit diag', function t() {
	var tc;
	var a;
	var b;

	tc = unit_diag;
	a = new Float64Array( 16 );
	a[ 0 ] = 99;
	a[ 3 ] = 3;
	a[ 6 ] = 4;
	a[ 4 ] = 99;
	a[ 7 ] = 6;
	a[ 8 ] = 99;
	b = new Float64Array( 16 );
	setupB3x2( b );
	dtrmm( 'left', 'upper', 'no-transpose', 'unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid side', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'invalid', 'upper', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'invalid', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid transa', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'invalid', 'non-unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'invalid', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', -1, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	var a = new Float64Array( 16 );
	var b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 3, -1, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});
