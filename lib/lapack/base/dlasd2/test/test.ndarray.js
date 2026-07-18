
/* eslint-disable max-len, max-lines, no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasd2 from './../lib/ndarray.js';

// FIXTURES //

import basic_nl2_nr2_sqre0 from './fixtures/basic_nl2_nr2_sqre0.json' with { type: 'json' };
import sqre1_nl2_nr2 from './fixtures/sqre1_nl2_nr2.json' with { type: 'json' };
import nl3_nr3_sqre0 from './fixtures/nl3_nr3_sqre0.json' with { type: 'json' };
import deflation_close_values from './fixtures/deflation_close_values.json' with { type: 'json' };
import minimal_nl1_nr1 from './fixtures/minimal_nl1_nr1.json' with { type: 'json' };
import sqre1_nl1_nr1 from './fixtures/sqre1_nl1_nr1.json' with { type: 'json' };
import givens_deflation from './fixtures/givens_deflation.json' with { type: 'json' };
import all_deflated from './fixtures/all_deflated.json' with { type: 'json' };
import tiny_dsigma2 from './fixtures/tiny_dsigma2.json' with { type: 'json' };

// FUNCTIONS //

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Runs a dlasd2 test case given a named fixture.
*
* @private
* @param {Object} tc - test case from fixture
* @param {integer} nl - nl
* @param {integer} nr - nr
* @param {integer} sqre - sqre
* @param {number} alpha - alpha
* @param {number} beta - beta
* @param {Float64Array} din - initial D values
* @param {Array<integer>} idxqIn - initial IDXQ values (1-based)
*/
function runCase( tc, nl, nr, sqre, alpha, beta, din, idxqIn ) {
	let i, j;

	const n = nl + nr + 1;
	const m = n + sqre;
	const tol = 1e-14;

	const d = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		d[ i ] = din[ i ];
	}
	const z = new Float64Array( m );
	const U = new Float64Array( n * n );
	for ( i = 0; i < n; i++ ) {
		U[ i * n + i ] = 1.0; // identity, column-major: U(i,i) = 1
	}
	const VT = new Float64Array( m * m );
	for ( i = 0; i < m; i++ ) {
		VT[ i * m + i ] = 1.0; // identity, column-major
	}
	const DSIGMA = new Float64Array( n );
	const U2 = new Float64Array( n * n );
	const VT2 = new Float64Array( m * m );
	const IDXP = new Int32Array( n );
	const IDX = new Int32Array( n );
	const IDXC = new Int32Array( n );
	const IDXQ = new Int32Array( m );
	for ( i = 0; i < idxqIn.length; i++ ) {
		IDXQ[ i ] = idxqIn[ i ];
	}
	const COLTYP = new Int32Array( Math.max( n, 4 ) );
	const K2 = new Int32Array( 1 );

	// Call: column-major strides: strideU1=1, strideU2=n, etc.
	const info = dlasd2(nl, nr, sqre, K2, d, 1, 0, z, 1, 0, alpha, beta, U, 1, n, 0, VT, 1, m, 0, DSIGMA, 1, 0, U2, 1, n, 0, VT2, 1, m, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0);

	assert.equal( info, tc.info, 'info' );
	assert.equal( K2[ 0 ], tc.K, 'K' );

	assertArrayClose( toArray( d ), tc.D, tol, 'D' );
	assertArrayClose( toArray( z.subarray( 0, n ) ), tc.Z, tol, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, tol, 'DSIGMA' );

	// U is N x N column-major (packed)
	assertArrayClose( toArray( U ), tc.U, tol, 'U' );

	// VT is M x M column-major (packed)
	assertArrayClose( toArray( VT ), tc.VT, tol, 'VT' );

	// U2 is N x N column-major (packed)
	assertArrayClose( toArray( U2 ), tc.U2, tol, 'U2' );

	// VT2 is M x M column-major (packed)
	assertArrayClose( toArray( VT2 ), tc.VT2, tol, 'VT2' );

	// Integer arrays: compare against 1-based fixture values
	for ( i = 0; i < n; i++ ) {
		assert.equal( IDXP[ i ], tc.IDXP[ i ], 'IDXP[' + i + ']' );
	}
	for ( i = 0; i < n; i++ ) {
		assert.equal( IDX[ i ], tc.IDX[ i ], 'IDX[' + i + ']' );
	}
	for ( i = 0; i < n; i++ ) {
		assert.equal( IDXC[ i ], tc.IDXC[ i ], 'IDXC[' + i + ']' );
	}
	for ( i = 0; i < n; i++ ) {
		assert.equal( IDXQ[ i ], tc.IDXQ[ i ], 'IDXQ[' + i + ']' );
	}
	for ( i = 0; i < 4; i++ ) {
		assert.equal( COLTYP[ i ], tc.COLTYP[ i ], 'COLTYP[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlasd2 is a function', function t() {
	assert.equal( typeof dlasd2, 'function' );
});

test( 'dlasd2: basic_nl2_nr2_sqre0', function t() {
	const tc = basic_nl2_nr2_sqre0;
	runCase( tc, 2, 2, 0, 0.5, 0.7, [ 1.0, 3.0, 0.0, 2.0, 4.0 ], [ 1, 2, 0, 1, 2 ]);
});

test( 'dlasd2: sqre1_nl2_nr2', function t() {
	const tc = sqre1_nl2_nr2;
	runCase( tc, 2, 2, 1, 0.3, 0.4, [ 1.5, 3.5, 0.0, 2.5, 5.0 ], [ 1, 2, 0, 1, 2 ]);
});

test( 'dlasd2: nl3_nr3_sqre0', function t() {
	const tc = nl3_nr3_sqre0;
	runCase( tc, 3, 3, 0, 0.6, 0.8, [ 0.5, 1.5, 2.5, 0.0, 1.0, 2.0, 3.0 ], [ 1, 2, 3, 0, 1, 2, 3 ]);
});

test( 'dlasd2: deflation_close_values', function t() {
	const tc = deflation_close_values;
	runCase( tc, 2, 2, 0, 0.5, 0.5, [ 1.0, 2.0, 0.0, 1.0, 3.0 ], [ 1, 2, 0, 1, 2 ]);
});

test( 'dlasd2: minimal_nl1_nr1', function t() {
	const tc = minimal_nl1_nr1;
	runCase( tc, 1, 1, 0, 0.8, 0.6, [ 2.0, 0.0, 4.0 ], [ 1, 0, 1 ]);
});

test( 'dlasd2: sqre1_nl1_nr1', function t() {
	const tc = sqre1_nl1_nr1;
	runCase( tc, 1, 1, 1, 0.4, 0.9, [ 3.0, 0.0, 5.0 ], [ 1, 0, 1 ]);
});

test( 'dlasd2: givens_deflation (close values with non-tiny Z)', function t() {
	let i;

	const tc = givens_deflation;
	const n = 5;
	const m = 5;
	const tol = 1e-14;
	const d = new Float64Array( [ 5.0, 10.0, 0.0, 5.0, 15.0 ] );
	const z = new Float64Array( m );
	const U = new Float64Array( n * n );
	for ( i = 0; i < n; i++ ) {
		U[ i * n + i ] = 1.0;
	}
	const VT = new Float64Array( m * m );
	for ( i = 0; i < m; i++ ) {
		VT[ i * m + i ] = 1.0;
	}
	VT[ 0 + 2 * m ] = 0.3;
	VT[ 1 + 2 * m ] = 0.4;
	VT[ 2 + 2 * m ] = 0.5;
	VT[ 3 + 3 * m ] = 0.6;
	VT[ 4 + 3 * m ] = 0.7;
	const DSIGMA = new Float64Array( n );
	const U2 = new Float64Array( n * n );
	const VT2 = new Float64Array( m * m );
	const IDXP = new Int32Array( n );
	const IDX = new Int32Array( n );
	const IDXC = new Int32Array( n );
	const IDXQ = new Int32Array( [ 1, 2, 0, 1, 2 ] );
	const COLTYP = new Int32Array( Math.max( n, 4 ) );
	const K2 = new Int32Array( 1 );
	const info = dlasd2(2, 2, 0, K2, d, 1, 0, z, 1, 0, 2.0, 3.0, U, 1, n, 0, VT, 1, m, 0, DSIGMA, 1, 0, U2, 1, n, 0, VT2, 1, m, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assert.equal( K2[ 0 ], tc.K, 'K' );
	assertArrayClose( toArray( d ), tc.D, tol, 'D' );
	assertArrayClose( toArray( z.subarray( 0, n ) ), tc.Z, tol, 'Z' );
	assertArrayClose( toArray( DSIGMA ), tc.DSIGMA, tol, 'DSIGMA' );
	assertArrayClose( toArray( U ), tc.U, tol, 'U' );
	assertArrayClose( toArray( VT ), tc.VT, tol, 'VT' );
	assertArrayClose( toArray( U2 ), tc.U2, tol, 'U2' );
	assertArrayClose( toArray( VT2 ), tc.VT2, tol, 'VT2' );
	for ( i = 0; i < n; i++ ) {
		assert.equal( IDXP[ i ], tc.IDXP[ i ], 'IDXP[' + i + ']' );
		assert.equal( IDX[ i ], tc.IDX[ i ], 'IDX[' + i + ']' );
		assert.equal( IDXC[ i ], tc.IDXC[ i ], 'IDXC[' + i + ']' );
		assert.equal( IDXQ[ i ], tc.IDXQ[ i ], 'IDXQ[' + i + ']' );
	}
	for ( i = 0; i < 4; i++ ) {
		assert.equal( COLTYP[ i ], tc.COLTYP[ i ], 'COLTYP[' + i + ']' );
	}
});

test( 'dlasd2: all_deflated (tiny alpha/beta)', function t() {
	const tc = all_deflated;
	runCase( tc, 2, 1, 0, 1.0e-20, 1.0e-20, [ 1.0, 2.0, 0.0, 3.0 ], [ 1, 2, 0, 1 ]);
});

test( 'dlasd2: tiny_dsigma2 (DSIGMA(2) replacement)', function t() {
	const tc = tiny_dsigma2;
	runCase( tc, 2, 1, 0, 1.0, 1.0, [ 1.0e-20, 2.0, 0.0, 3.0 ], [ 1, 2, 0, 1 ]);
});
