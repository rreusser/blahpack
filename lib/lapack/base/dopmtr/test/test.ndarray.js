/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dopmtr from './../lib/ndarray.js';

// FIXTURES //

import setup_upper from './fixtures/setup_upper.json' with { type: 'json' };
import setup_lower from './fixtures/setup_lower.json' with { type: 'json' };
import left_notrans_upper from './fixtures/left_notrans_upper.json' with { type: 'json' };
import left_trans_upper from './fixtures/left_trans_upper.json' with { type: 'json' };
import right_notrans_upper from './fixtures/right_notrans_upper.json' with { type: 'json' };
import right_trans_upper from './fixtures/right_trans_upper.json' with { type: 'json' };
import left_notrans_lower from './fixtures/left_notrans_lower.json' with { type: 'json' };
import left_trans_lower from './fixtures/left_trans_lower.json' with { type: 'json' };
import right_notrans_lower from './fixtures/right_notrans_lower.json' with { type: 'json' };
import right_trans_lower from './fixtures/right_trans_lower.json' with { type: 'json' };
import left_notrans_upper_rect from './fixtures/left_notrans_upper_rect.json' with { type: 'json' };
import right_notrans_lower_rect from './fixtures/right_notrans_lower_rect.json' with { type: 'json' };
import main from './../lib/index.js';
import ndarray from './../lib/ndarray.js';

// FUNCTIONS //

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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Setup data: AP and TAU from DSPTRD('U') on a 4x4 symmetric packed matrix.
*
* @private
* @returns {Object} result with AP and TAU arrays
*/
function setupUpper() {
	var setup = setup_upper;
	return {
		'AP': new Float64Array( setup.AP ),
		'TAU': new Float64Array( setup.TAU )
	};
}

/**
* Setup data: AP and TAU from DSPTRD('L') on a 4x4 symmetric packed matrix.
*
* @private
* @returns {Object} result with AP and TAU arrays
*/
function setupLower() {
	var setup = setup_lower;
	return {
		'AP': new Float64Array( setup.AP ),
		'TAU': new Float64Array( setup.TAU )
	};
}

/**
* Returns a 4x4 identity matrix in column-major flat array.
*
* @private
* @returns {Float64Array} identity matrix
*/
function identity4() {
	return new Float64Array([
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		1
	]);
}

/**
* Extracts column-major data into a plain array.
*
* @private
* @param {Float64Array} C - column-major matrix data
* @param {number} M - number of rows
* @param {number} N - number of columns
* @returns {Array} flattened column-major array
*/
function flattenColMajor( C, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( C[ i + ( j * M ) ] );
		}
	}
	return out;
}

// TESTS //

test( 'dopmtr: left_notrans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_notrans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'upper', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: left_trans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_trans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'upper', 'transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: right_notrans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_notrans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'right', 'upper', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: right_trans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_trans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'right', 'upper', 'transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: left_notrans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_notrans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'lower', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: left_trans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_trans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'lower', 'transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: right_notrans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_notrans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'right', 'lower', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: right_trans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_trans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Float64Array( 4 );
	info = dopmtr( 'right', 'lower', 'transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: m_zero', function t() {
	var WORK;
	var info;
	var AP;
	var C;

	AP = new Float64Array( 10 );
	C = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'upper', 'no-transpose', 0, 4, AP, 1, 0, new Float64Array( 3 ), 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dopmtr: n_zero', function t() {
	var WORK;
	var info;
	var AP;
	var C;

	AP = new Float64Array( 10 );
	C = new Float64Array( 4 );
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'upper', 'no-transpose', 4, 0, AP, 1, 0, new Float64Array( 3 ), 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dopmtr: left_notrans_upper_rect', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_notrans_upper_rect;
	r = setupUpper();
	C = new Float64Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	]);
	WORK = new Float64Array( 4 );
	info = dopmtr( 'left', 'upper', 'no-transpose', 4, 2, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 2 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: right_notrans_lower_rect', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_notrans_lower_rect;
	r = setupLower();
	C = new Float64Array([
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8
	]);
	WORK = new Float64Array( 4 );
	info = dopmtr( 'right', 'lower', 'no-transpose', 2, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 2, 4 ), tc.C, 1e-14, 'C' );
});

test( 'dopmtr: AP is restored after call', function t() {
	var APcopy;
	var WORK;
	var r;
	var C;

	r = setupUpper();
	APcopy = new Float64Array( r.AP );
	C = identity4();
	WORK = new Float64Array( 4 );
	dopmtr( 'left', 'upper', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( flattenColMajor( r.AP, 10, 1 ), flattenColMajor( APcopy, 10, 1 ), 1e-15, 'AP restored' ); // eslint-disable-line max-len
});

test( 'dopmtr: main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
});

test( 'dopmtr: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof main.ndarray, 'function' );
});

test( 'dopmtr: ndarray validates side argument', function t() {
	assert.throws( function badSide() {
		ndarray( 'bad', 'upper', 'no-transpose', 4, 4, new Float64Array( 10 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /TypeError/ );
});

test( 'dopmtr: ndarray validates uplo argument', function t() {
	assert.throws( function badUplo() {
		ndarray( 'left', 'bad', 'no-transpose', 4, 4, new Float64Array( 10 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /TypeError/ );
});

test( 'dopmtr: ndarray validates trans argument', function t() {
	assert.throws( function badTrans() {
		ndarray( 'left', 'upper', 'bad', 4, 4, new Float64Array( 10 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /TypeError/ );
});
