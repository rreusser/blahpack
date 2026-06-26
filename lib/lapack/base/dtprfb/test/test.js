/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, node/no-sync */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtprfb from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dtprfb.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) {
		return t.name === name;
	} );
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* BuildVColFwd.
*
* @private
* @returns {*} result
*/
function buildVColFwd() {
	var ldv = 8;
	var V = new Float64Array( ldv * 2 );
	V[ 0 + (0*ldv) ] = 1.0;
	V[ 0 + (1*ldv) ] = 0.3;
	V[ 1 + (1*ldv) ] = 1.0;
	V[ 3 + (0*ldv) ] = 0.2;
	V[ 3 + (1*ldv) ] = 1.0;
	return {
		'V': V,
		'ldv': ldv
	};
}

/**
* BuildTFwd.
*
* @private
* @returns {*} result
*/
function buildTFwd() {
	var ldt = 3;
	var T = new Float64Array( ldt * 2 );
	T[ 0 + (0*ldt) ] = 1.2;
	T[ 0 + (1*ldt) ] = -0.3;
	T[ 1 + (1*ldt) ] = 0.8;
	return {
		'T': T,
		'ldt': ldt
	};
}

/**
* BuildTBwd.
*
* @private
* @returns {*} result
*/
function buildTBwd() {
	var ldt = 3;
	var T = new Float64Array( ldt * 2 );
	T[ 0 + (0*ldt) ] = 1.2;
	T[ 1 + (0*ldt) ] = -0.3;
	T[ 1 + (1*ldt) ] = 0.8;
	return {
		'T': T,
		'ldt': ldt
	};
}

/**
* BuildVColBwd.
*
* @private
* @returns {*} result
*/
function buildVColBwd() {
	var ldv = 8;
	var V = new Float64Array( ldv * 2 );
	V[ 0 + (0*ldv) ] = 0.2;
	V[ 0 + (1*ldv) ] = 0.3;
	V[ 2 + (0*ldv) ] = 1.0;
	V[ 3 + (0*ldv) ] = 0.4;
	V[ 3 + (1*ldv) ] = 1.0;
	return {
		'V': V,
		'ldv': ldv
	};
}

/**
* BuildVRowFwd.
*
* @private
* @returns {*} result
*/
function buildVRowFwd() {
	var ldv = 8;
	var V = new Float64Array( ldv * 4 );
	V[ 0 + (0*ldv) ] = 1.0;
	V[ 1 + (0*ldv) ] = 0.3;
	V[ 1 + (1*ldv) ] = 1.0;
	V[ 0 + (3*ldv) ] = 0.2;
	V[ 1 + (3*ldv) ] = 0.5;
	return {
		'V': V,
		'ldv': ldv
	};
}

/**
* BuildVRowBwd.
*
* @private
* @returns {*} result
*/
function buildVRowBwd() {
	var ldv = 8;
	var V = new Float64Array( ldv * 4 );
	V[ 0 + (0*ldv) ] = 0.2;
	V[ 1 + (0*ldv) ] = 0.5;
	V[ 0 + (2*ldv) ] = 1.0;
	V[ 0 + (3*ldv) ] = 0.3;
	V[ 1 + (3*ldv) ] = 1.0;
	return {
		'V': V,
		'ldv': ldv
	};
}

/**
* BuildALeft.
*
* @private
* @returns {*} result
*/
function buildALeft() {
	var lda = 4;
	var A = new Float64Array( lda * 3 );
	A[ 0 + (0*lda) ] = 1.0;
	A[ 0 + (1*lda) ] = 2.0;
	A[ 0 + (2*lda) ] = 3.0;
	A[ 1 + (0*lda) ] = 4.0;
	A[ 1 + (1*lda) ] = 5.0;
	A[ 1 + (2*lda) ] = 6.0;
	return {
		'A': A,
		'lda': lda
	};
}

/**
* BuildARight.
*
* @private
* @returns {*} result
*/
function buildARight() {
	var lda = 4;
	var A = new Float64Array( lda * 2 );
	A[ 0 + (0*lda) ] = 1.0;
	A[ 0 + (1*lda) ] = 2.0;
	A[ 1 + (0*lda) ] = 3.0;
	A[ 1 + (1*lda) ] = 4.0;
	A[ 2 + (0*lda) ] = 5.0;
	A[ 2 + (1*lda) ] = 6.0;
	return {
		'A': A,
		'lda': lda
	};
}

/**
* BuildBLeft.
*
* @private
* @returns {*} result
*/
function buildBLeft() {
	var ldb = 5;
	var B = new Float64Array( ldb * 3 );
	B[ 0 + (0*ldb) ] = 7.0;
	B[ 0 + (1*ldb) ] = 8.0;
	B[ 0 + (2*ldb) ] = 9.0;
	B[ 1 + (0*ldb) ] = 10.0;
	B[ 1 + (1*ldb) ] = 11.0;
	B[ 1 + (2*ldb) ] = 12.0;
	B[ 2 + (0*ldb) ] = 13.0;
	B[ 2 + (1*ldb) ] = 14.0;
	B[ 2 + (2*ldb) ] = 15.0;
	B[ 3 + (0*ldb) ] = 16.0;
	B[ 3 + (1*ldb) ] = 17.0;
	B[ 3 + (2*ldb) ] = 18.0;
	return {
		'B': B,
		'ldb': ldb
	};
}

/**
* BuildBRight.
*
* @private
* @returns {*} result
*/
function buildBRight() {
	var ldb = 5;
	var B = new Float64Array( ldb * 4 );
	B[ 0 + (0*ldb) ] = 7.0;
	B[ 0 + (1*ldb) ] = 8.0;
	B[ 0 + (2*ldb) ] = 9.0;
	B[ 0 + (3*ldb) ] = 10.0;
	B[ 1 + (0*ldb) ] = 11.0;
	B[ 1 + (1*ldb) ] = 12.0;
	B[ 1 + (2*ldb) ] = 13.0;
	B[ 1 + (3*ldb) ] = 14.0;
	B[ 2 + (0*ldb) ] = 15.0;
	B[ 2 + (1*ldb) ] = 16.0;
	B[ 2 + (2*ldb) ] = 17.0;
	B[ 2 + (3*ldb) ] = 18.0;
	return {
		'B': B,
		'ldb': ldb
	};
}

/**
* PackMat.
*
* @private
* @param {*} M - M
* @param {*} ldm - ldm
* @param {*} rows - rows
* @param {*} cols - cols
* @returns {*} result
*/
function packMat( M, ldm, rows, cols ) {
	var out = new Float64Array( rows * cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			out[ i + (j*rows) ] = M[ i + (j*ldm) ];
		}
	}
	return out;
}


// TESTS //

test( 'dtprfb: col_fwd_left_notrans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'col_fwd_left_notrans' );
	var tt = buildTFwd();
	var v = buildVColFwd();
	var a = buildALeft();
	var b = buildBLeft();
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 2, 3 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 4, 3 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_fwd_left_trans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'col_fwd_left_trans' );
	var tt = buildTFwd();
	var v = buildVColFwd();
	var a = buildALeft();
	var b = buildBLeft();
	dtprfb( 'left', 'transpose', 'forward', 'columnwise', 4, 3, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 2, 3 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 4, 3 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_fwd_right_notrans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'col_fwd_right_notrans' );
	var tt = buildTFwd();
	var v = buildVColFwd();
	var a = buildARight();
	var b = buildBRight();
	dtprfb( 'right', 'no-transpose', 'forward', 'columnwise', 3, 4, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 3, 2 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 3, 4 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_fwd_right_trans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'col_fwd_right_trans' );
	var tt = buildTFwd();
	var v = buildVColFwd();
	var a = buildARight();
	var b = buildBRight();
	dtprfb( 'right', 'transpose', 'forward', 'columnwise', 3, 4, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 3, 2 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 3, 4 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_bwd_left_notrans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'col_bwd_left_notrans' );
	var tt = buildTBwd();
	var v = buildVColBwd();
	var a = buildALeft();
	var b = buildBLeft();
	dtprfb( 'left', 'no-transpose', 'backward', 'columnwise', 4, 3, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 2, 3 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 4, 3 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_bwd_right_trans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'col_bwd_right_trans' );
	var tt = buildTBwd();
	var v = buildVColBwd();
	var a = buildARight();
	var b = buildBRight();
	dtprfb( 'right', 'transpose', 'backward', 'columnwise', 3, 4, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 3, 2 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 3, 4 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: row_fwd_left_notrans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'row_fwd_left_notrans' );
	var tt = buildTFwd();
	var v = buildVRowFwd();
	var a = buildALeft();
	var b = buildBLeft();
	dtprfb( 'left', 'no-transpose', 'forward', 'rowwise', 4, 3, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 2, 3 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 4, 3 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: row_fwd_right_notrans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'row_fwd_right_notrans' );
	var tt = buildTFwd();
	var v = buildVRowFwd();
	var a = buildARight();
	var b = buildBRight();
	dtprfb( 'right', 'no-transpose', 'forward', 'rowwise', 3, 4, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 3, 2 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 3, 4 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: row_bwd_left_trans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'row_bwd_left_trans' );
	var tt = buildTBwd();
	var v = buildVRowBwd();
	var a = buildALeft();
	var b = buildBLeft();
	dtprfb( 'left', 'transpose', 'backward', 'rowwise', 4, 3, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 2, 3 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 4, 3 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: row_bwd_right_notrans', function t() {
	var WORK = new Float64Array( 25 );
	var tc = findCase( 'row_bwd_right_notrans' );
	var tt = buildTBwd();
	var v = buildVRowBwd();
	var a = buildARight();
	var b = buildBRight();
	dtprfb( 'right', 'no-transpose', 'backward', 'rowwise', 3, 4, 2, 1, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 3, 2 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 3, 4 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_fwd_left_notrans_l0', function t() {
	var WORK;
	var ldv;
	var tc;
	var tt;
	var V;
	var a;
	var b;

	tc = findCase( 'col_fwd_left_notrans_l0' );
	ldv = 8;
	V = new Float64Array( ldv * 2 );
	V[ 0 + (0*ldv) ] = 1.0;
	V[ 0 + (1*ldv) ] = 0.3;
	V[ 1 + (1*ldv) ] = 1.0;
	V[ 2 + (0*ldv) ] = 0.4;
	V[ 2 + (1*ldv) ] = 0.5;
	V[ 3 + (0*ldv) ] = 0.6;
	V[ 3 + (1*ldv) ] = 0.7;
	tt = buildTFwd();
	a = buildALeft();
	b = buildBLeft();
	WORK = new Float64Array( 25 );
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 0, V, 1, ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assertArrayClose( packMat( a.A, a.lda, 2, 3 ), tc.A, 1e-13, 'A' );
	assertArrayClose( packMat( b.B, b.ldb, 4, 3 ), tc.B, 1e-13, 'B' );
});

test( 'dtprfb: col_bwd_left_l_equals_k', function t() {
	var WORK = new Float64Array( 25 );
	var ldv = 8;
	var V = new Float64Array( ldv * 2 );
	V[ 0 + (0*ldv) ] = 0.2;
	V[ 0 + (1*ldv) ] = 0.3;
	V[ 1 + (0*ldv) ] = 0.4;
	V[ 1 + (1*ldv) ] = 0.5;
	V[ 2 + (0*ldv) ] = 1.0;
	V[ 2 + (1*ldv) ] = 0.6;
	V[ 3 + (1*ldv) ] = 1.0;
	var tt = buildTBwd();
	var a = buildALeft();
	var b = buildBLeft();

	// Run with L === K to exercise the saturation branches in kp/mp clamps.
	dtprfb( 'left', 'no-transpose', 'backward', 'columnwise', 4, 3, 2, 2, V, 1, ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len

	// Smoke: result arrays are finite and not all original values.
	var i;
	for ( i = 0; i < 4 * 3; i += 1 ) {
		assert.ok( Number.isFinite( b.B[ i ] ), 'B finite' );
	}
});

test( 'dtprfb: row_fwd_right_l_equals_k', function t() {
	var WORK = new Float64Array( 25 );
	var v = buildVRowFwd();

	// Set the whole V block to use L=K=2 (both cols are trapezoidal).
	v.V[ 0 + (2*v.ldv) ] = 0.4;
	v.V[ 1 + (2*v.ldv) ] = 0.5;
	var tt = buildTFwd();
	var a = buildARight();
	var b = buildBRight();
	dtprfb( 'right', 'no-transpose', 'forward', 'rowwise', 3, 4, 2, 2, v.V, 1, v.ldv, 0, tt.T, 1, tt.ldt, 0, a.A, 1, a.lda, 0, b.B, 1, b.ldb, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	var i;
	for ( i = 0; i < 3 * 4; i += 1 ) {
		assert.ok( Number.isFinite( b.B[ i ] ), 'B finite' );
	}
});

test( 'dtprfb: quick_return_m0', function t() {
	var WORK = new Float64Array( 25 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var i;
	for ( i = 0; i < 16; i += 1 ) {
		A[ i ] = 99.0;
	}
	for ( i = 0; i < 25; i += 1 ) {
		B[ i ] = 99.0;
	}
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 3, 2, 0, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 ); // eslint-disable-line max-len
	assert.equal( A[ 0 ], 99.0 );
});
