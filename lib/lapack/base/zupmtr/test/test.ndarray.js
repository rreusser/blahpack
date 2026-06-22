/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zupmtr from './../lib/ndarray.js';

// FIXTURES //

import setup_upper from './fixtures/setup_upper.json' with { type: 'json' };
import setup_lower from './fixtures/setup_lower.json' with { type: 'json' };
import left_notrans_upper from './fixtures/left_notrans_upper.json' with { type: 'json' };
import left_conjtrans_upper from './fixtures/left_conjtrans_upper.json' with { type: 'json' };
import right_notrans_upper from './fixtures/right_notrans_upper.json' with { type: 'json' };
import right_conjtrans_upper from './fixtures/right_conjtrans_upper.json' with { type: 'json' };
import left_notrans_lower from './fixtures/left_notrans_lower.json' with { type: 'json' };
import left_conjtrans_lower from './fixtures/left_conjtrans_lower.json' with { type: 'json' };
import right_notrans_lower from './fixtures/right_notrans_lower.json' with { type: 'json' };
import right_conjtrans_lower from './fixtures/right_conjtrans_lower.json' with { type: 'json' };
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
* Converts a Float64Array to a plain Array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} plain array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Setup data: AP and TAU from ZHPTRD('U') on a 4x4 Hermitian packed matrix.
*
* @private
* @returns {Object} result with AP and TAU arrays
*/
function setupUpper() {
	var setup = setup_upper;
	return {
		'AP': new Complex128Array( setup.AP ),
		'TAU': new Complex128Array( setup.TAU )
	};
}

/**
* Setup data: AP and TAU from ZHPTRD('L') on a 4x4 Hermitian packed matrix.
*
* @private
* @returns {Object} result with AP and TAU arrays
*/
function setupLower() {
	var setup = setup_lower;
	return {
		'AP': new Complex128Array( setup.AP ),
		'TAU': new Complex128Array( setup.TAU )
	};
}

/**
* Returns a 4x4 complex identity matrix in column-major storage.
*
* @private
* @returns {Complex128Array} identity matrix
*/
function identity4() {
	var cv;
	var C;
	C = new Complex128Array( 16 );
	cv = reinterpret( C, 0 );
	cv[ 0 ] = 1.0;
	cv[ 10 ] = 1.0;
	cv[ 20 ] = 1.0;
	cv[ 30 ] = 1.0;
	return C;
}

/**
* Extracts column-major complex data into a plain array.
*
* @private
* @param {Complex128Array} C - column-major matrix data
* @param {number} M - number of rows
* @param {number} N - number of columns
* @returns {Array} flattened interleaved re/im array
*/
function flattenColMajor( C, M, N ) {
	var out;
	var idx;
	var cv;
	var i;
	var j;
	cv = reinterpret( C, 0 );
	out = [];
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			idx = ( i + ( j * M ) ) * 2;
			out.push( cv[ idx ] );
			out.push( cv[ idx + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zupmtr: left_notrans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_notrans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'upper', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: left_conjtrans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_conjtrans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'upper', 'conjugate-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: right_notrans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_notrans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'right', 'upper', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: right_conjtrans_upper', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_conjtrans_upper;
	r = setupUpper();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'right', 'upper', 'conjugate-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: left_notrans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_notrans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'lower', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: left_conjtrans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = left_conjtrans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'lower', 'conjugate-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: right_notrans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_notrans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'right', 'lower', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: right_conjtrans_lower', function t() {
	var WORK;
	var info;
	var tc;
	var r;
	var C;

	tc = right_conjtrans_lower;
	r = setupLower();
	C = identity4();
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'right', 'lower', 'conjugate-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: m_zero', function t() {
	var WORK;
	var info;

	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'upper', 'no-transpose', 0, 4, new Complex128Array( 10 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 4 ), 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zupmtr: n_zero', function t() {
	var WORK;
	var info;

	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'upper', 'no-transpose', 4, 0, new Complex128Array( 10 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 16 ), 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zupmtr: left_notrans_upper_rect', function t() {
	var WORK;
	var info;
	var tc;
	var cv;
	var r;
	var C;

	tc = left_notrans_upper_rect;
	r = setupUpper();
	C = new Complex128Array( 8 );
	cv = reinterpret( C, 0 );
	cv[ 0 ] = 1.0;
	cv[ 1 ] = 0.5;
	cv[ 2 ] = 2.0;
	cv[ 3 ] = -0.5;
	cv[ 4 ] = 3.0;
	cv[ 5 ] = 1.0;
	cv[ 6 ] = 4.0;
	cv[ 7 ] = 0.0;
	cv[ 8 ] = 5.0;
	cv[ 9 ] = -1.0;
	cv[ 10 ] = 6.0;
	cv[ 11 ] = 0.5;
	cv[ 12 ] = 7.0;
	cv[ 13 ] = -0.5;
	cv[ 14 ] = 8.0;
	cv[ 15 ] = 1.0;
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'left', 'upper', 'no-transpose', 4, 2, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 4, 2 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: right_notrans_lower_rect', function t() {
	var WORK;
	var info;
	var tc;
	var cv;
	var r;
	var C;

	tc = right_notrans_lower_rect;
	r = setupLower();
	C = new Complex128Array( 8 );
	cv = reinterpret( C, 0 );
	cv[ 0 ] = 1.0;
	cv[ 1 ] = 0.0;
	cv[ 2 ] = 2.0;
	cv[ 3 ] = 1.0;
	cv[ 4 ] = 3.0;
	cv[ 5 ] = -1.0;
	cv[ 6 ] = 4.0;
	cv[ 7 ] = 0.0;
	cv[ 8 ] = 5.0;
	cv[ 9 ] = 0.5;
	cv[ 10 ] = 6.0;
	cv[ 11 ] = -0.5;
	cv[ 12 ] = 7.0;
	cv[ 13 ] = 0.0;
	cv[ 14 ] = 8.0;
	cv[ 15 ] = 1.0;
	WORK = new Complex128Array( 4 );
	info = zupmtr( 'right', 'lower', 'no-transpose', 2, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( flattenColMajor( C, 2, 4 ), tc.C, 1e-14, 'C' );
});

test( 'zupmtr: AP is restored after call', function t() {
	var APcopy;
	var WORK;
	var r;
	var C;

	r = setupUpper();
	APcopy = new Complex128Array( r.AP );
	C = identity4();
	WORK = new Complex128Array( 4 );
	zupmtr( 'left', 'upper', 'no-transpose', 4, 4, r.AP, 1, 0, r.TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( r.AP, 0 ) ), toArray( reinterpret( APcopy, 0 ) ), 1e-15, 'AP restored' ); // eslint-disable-line max-len
});

test( 'zupmtr: main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
});

test( 'zupmtr: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof main.ndarray, 'function' );
});

test( 'zupmtr: ndarray validates side argument', function t() {
	assert.throws( function badSide() {
		ndarray( 'bad', 'upper', 'no-transpose', 4, 4, new Complex128Array( 10 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 16 ), 1, 4, 0, new Complex128Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /TypeError/ );
});

test( 'zupmtr: ndarray validates uplo argument', function t() {
	assert.throws( function badUplo() {
		ndarray( 'left', 'bad', 'no-transpose', 4, 4, new Complex128Array( 10 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 16 ), 1, 4, 0, new Complex128Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /TypeError/ );
});

test( 'zupmtr: ndarray validates trans argument', function t() {
	assert.throws( function badTrans() {
		ndarray( 'left', 'upper', 'bad', 4, 4, new Complex128Array( 10 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 16 ), 1, 4, 0, new Complex128Array( 4 ), 1, 0 ); // eslint-disable-line max-len
	}, /TypeError/ );
});
