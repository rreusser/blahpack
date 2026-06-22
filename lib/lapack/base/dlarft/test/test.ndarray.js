/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarft from './../lib/ndarray.js';

// FIXTURES //

import fwd_col_5x3 from './fixtures/fwd_col_5x3.json' with { type: 'json' };
import fwd_col_3x2 from './fixtures/fwd_col_3x2.json' with { type: 'json' };
import bwd_col_5x2 from './fixtures/bwd_col_5x2.json' with { type: 'json' };
import fwd_col_tau_zero from './fixtures/fwd_col_tau_zero.json' with { type: 'json' };
import fwd_row_5x3 from './fixtures/fwd_row_5x3.json' with { type: 'json' };
import fwd_row_3x2 from './fixtures/fwd_row_3x2.json' with { type: 'json' };
import bwd_row_5x2 from './fixtures/bwd_row_5x2.json' with { type: 'json' };
import bwd_col_tau_zero from './fixtures/bwd_col_tau_zero.json' with { type: 'json' };

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

// Fortran print_matrix extracts MxN submatrix from LDA-strided storage.
// In JS we use exact-size storage (LDT=K, strideT1=1, strideT2=K).

test( 'dlarft: fwd col 5x3', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = fwd_col_5x3;
	V = new Float64Array( 6 * 3 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25;
	V[ 2 + 1 * 6 ] = 0.5;
	V[ 2 + 2 * 6 ] = 1;
	V[ 3 + 0 * 6 ] = 0.125;
	V[ 3 + 1 * 6 ] = 0.25;
	V[ 3 + 2 * 6 ] = 0.5;
	V[ 4 + 0 * 6 ] = 0.0625;
	V[ 4 + 1 * 6 ] = 0.125;
	V[ 4 + 2 * 6 ] = 0.25;
	TAU = new Float64Array( [ 1.2, 1.5, 1.1 ] );
	T = new Float64Array( 3 * 3 );
	dlarft( 'forward', 'columnwise', 5, 3, V, 1, 6, 0, TAU, 1, 0, T, 1, 3, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd col 3x2', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = fwd_col_3x2;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 2;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 3;
	V[ 2 + 1 * 6 ] = 4;
	TAU = new Float64Array( [ 0.8, 1.2 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'columnwise', 3, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: bwd col 5x2', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = bwd_col_5x2;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.125;
	V[ 2 + 0 * 6 ] = 0.125;
	V[ 2 + 1 * 6 ] = 0.0625;
	V[ 3 + 0 * 6 ] = 1.0;
	V[ 4 + 1 * 6 ] = 1.0;
	TAU = new Float64Array( [ 1.5, 0.9 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'backward', 'columnwise', 5, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd col tau zero', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = fwd_col_tau_zero;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 1 + 0 * 6 ] = 0.5;
	V[ 1 + 1 * 6 ] = 1;
	V[ 2 + 0 * 6 ] = 0.25;
	V[ 2 + 1 * 6 ] = 0.5;
	TAU = new Float64Array( [ 1.2, 0.0 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'columnwise', 3, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd row 5x3', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = fwd_row_5x3;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 0 + 1 * 6 ] = 0.5;
	V[ 0 + 2 * 6 ] = 0.25;
	V[ 0 + 3 * 6 ] = 0.125;
	V[ 0 + 4 * 6 ] = 0.0625;
	V[ 1 + 1 * 6 ] = 1;
	V[ 1 + 2 * 6 ] = 0.5;
	V[ 1 + 3 * 6 ] = 0.25;
	V[ 1 + 4 * 6 ] = 0.125;
	V[ 2 + 2 * 6 ] = 1;
	V[ 2 + 3 * 6 ] = 0.5;
	V[ 2 + 4 * 6 ] = 0.25;
	TAU = new Float64Array( [ 1.2, 1.5, 1.1 ] );
	T = new Float64Array( 3 * 3 );
	dlarft( 'forward', 'rowwise', 5, 3, V, 1, 6, 0, TAU, 1, 0, T, 1, 3, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: fwd row 3x2', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = fwd_row_3x2;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 1;
	V[ 0 + 1 * 6 ] = 2;
	V[ 0 + 2 * 6 ] = 3;
	V[ 1 + 1 * 6 ] = 1;
	V[ 1 + 2 * 6 ] = 4;
	TAU = new Float64Array( [ 0.8, 1.2 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'rowwise', 3, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: bwd row 5x2', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = bwd_row_5x2;
	V = new Float64Array( 6 * 6 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 0 + 2 * 6 ] = 0.125;
	V[ 0 + 3 * 6 ] = 1.0;
	V[ 0 + 4 * 6 ] = 0.0;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.125;
	V[ 1 + 2 * 6 ] = 0.0625;
	V[ 1 + 3 * 6 ] = 0.0;
	V[ 1 + 4 * 6 ] = 1.0;
	TAU = new Float64Array( [ 1.5, 0.9 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'backward', 'rowwise', 5, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: bwd col tau zero', function t() {
	var TAU;
	var tc;
	var V;
	var T;

	tc = bwd_col_tau_zero;
	V = new Float64Array( 6 * 2 );
	V[ 0 + 0 * 6 ] = 0.5;
	V[ 0 + 1 * 6 ] = 0.25;
	V[ 1 + 0 * 6 ] = 0.25;
	V[ 1 + 1 * 6 ] = 0.125;
	V[ 2 + 0 * 6 ] = 0.125;
	V[ 2 + 1 * 6 ] = 0.0625;
	V[ 3 + 0 * 6 ] = 1.0;
	V[ 4 + 1 * 6 ] = 1.0;
	TAU = new Float64Array( [ 0.0, 0.9 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'backward', 'columnwise', 5, 2, V, 1, 6, 0, TAU, 1, 0, T, 1, 2, 0 );
	assertArrayClose( T, tc.T, 1e-14, 'T' );
});

test( 'dlarft: N=0 quick return', function t() {
	var TAU = new Float64Array( [ 1.0 ] );
	var T = new Float64Array( [ 99 ] );
	var V = new Float64Array( 1 );
	dlarft( 'forward', 'columnwise', 0, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 );
	if ( T[ 0 ] !== 99 ) {
		throw new Error( 'T changed on N=0' );
	}
});

test( 'dlarft: fwd col with trailing zeros in V (exercises lastv assignment, lines 62-63)', function t() { // eslint-disable-line max-len
	var TAU;
	var V;
	var T;

	V = new Float64Array( 8 * 2 );
	V[ 0 + 0 * 8 ] = 1;
	V[ 1 + 0 * 8 ] = 0.5;
	V[ 2 + 0 * 8 ] = 0.25;
	V[ 3 + 0 * 8 ] = 0.125;
	V[ 4 + 0 * 8 ] = 0.0;
	V[ 5 + 0 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 1;
	V[ 2 + 1 * 8 ] = 0.5;
	V[ 3 + 1 * 8 ] = 0.25;
	V[ 4 + 1 * 8 ] = 0.125;
	V[ 5 + 1 * 8 ] = 0.0625;
	TAU = new Float64Array( [ 1.2, 1.5 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'columnwise', 6, 2, V, 1, 8, 0, TAU, 1, 0, T, 1, 2, 0 );
	if ( T[ 0 ] !== 1.2 ) {
		throw new Error( 'T[0,0] should be TAU[0]=1.2, got ' + T[ 0 ] );
	}
	if ( T[ 1 + 1 * 2 ] !== 1.5 ) {
		throw new Error( 'T[1,1] should be TAU[1]=1.5, got ' + T[ 1 + 1 * 2 ] );
	}
});

test( 'dlarft: fwd row with trailing zeros in V (exercises lastv assignment, lines 86-87)', function t() { // eslint-disable-line max-len
	var TAU;
	var V;
	var T;

	V = new Float64Array( 8 * 8 );
	V[ 0 + 0 * 8 ] = 1;
	V[ 0 + 1 * 8 ] = 0.5;
	V[ 0 + 2 * 8 ] = 0.25;
	V[ 0 + 3 * 8 ] = 0.125;
	V[ 0 + 4 * 8 ] = 0.0;
	V[ 0 + 5 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 1;
	V[ 1 + 2 * 8 ] = 0.5;
	V[ 1 + 3 * 8 ] = 0.25;
	V[ 1 + 4 * 8 ] = 0.125;
	V[ 1 + 5 * 8 ] = 0.0625;
	TAU = new Float64Array( [ 1.2, 1.5 ] );
	T = new Float64Array( 2 * 2 );
	dlarft( 'forward', 'rowwise', 6, 2, V, 1, 8, 0, TAU, 1, 0, T, 1, 2, 0 );
	if ( T[ 0 ] !== 1.2 ) {
		throw new Error( 'T[0,0] should be TAU[0]=1.2, got ' + T[ 0 ] );
	}
});

test( 'dlarft: bwd col with leading zeros in V (exercises lastv assignment, lines 133-137)', function t() { // eslint-disable-line max-len
	var TAU;
	var V;
	var T;

	V = new Float64Array( 8 * 3 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 1 + 0 * 8 ] = 0.25;
	V[ 2 + 0 * 8 ] = 0.125;
	V[ 3 + 0 * 8 ] = 1.0;
	V[ 0 + 1 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 0.3;
	V[ 2 + 1 * 8 ] = 0.15;
	V[ 4 + 1 * 8 ] = 1.0;
	V[ 0 + 2 * 8 ] = 0.0;
	V[ 1 + 2 * 8 ] = 0.0;
	V[ 2 + 2 * 8 ] = 0.1;
	V[ 5 + 2 * 8 ] = 1.0;
	TAU = new Float64Array( [ 1.5, 0.8, 1.1 ] );
	T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'columnwise', 6, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.5 ) {
		throw new Error( 'T[0,0] should be 1.5, got ' + T[ 0 ] );
	}
	if ( T[ 1 + 1 * 3 ] !== 0.8 ) {
		throw new Error( 'T[1,1] should be 0.8, got ' + T[ 1 + 1 * 3 ] );
	}
	if ( T[ 2 + 2 * 3 ] !== 1.1 ) {
		throw new Error( 'T[2,2] should be 1.1, got ' + T[ 2 + 2 * 3 ] );
	}
});

test( 'dlarft: bwd row with leading zeros in V (exercises lastv=jj+1, lines 155-159)', function t() { // eslint-disable-line max-len
	var TAU;
	var V;
	var T;

	V = new Float64Array( 8 * 8 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 0 + 1 * 8 ] = 0.25;
	V[ 0 + 2 * 8 ] = 0.125;
	V[ 0 + 3 * 8 ] = 0.1;
	V[ 0 + 4 * 8 ] = 1.0;
	V[ 1 + 0 * 8 ] = 0.0;
	V[ 1 + 1 * 8 ] = 0.3;
	V[ 1 + 2 * 8 ] = 0.15;
	V[ 1 + 3 * 8 ] = 0.1;
	V[ 1 + 5 * 8 ] = 1.0;
	V[ 2 + 0 * 8 ] = 0.0;
	V[ 2 + 1 * 8 ] = 0.0;
	V[ 2 + 2 * 8 ] = 0.1;
	V[ 2 + 3 * 8 ] = 0.05;
	V[ 2 + 6 * 8 ] = 1.0;
	TAU = new Float64Array( [ 1.5, 0.8, 1.1 ] );
	T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'rowwise', 7, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.5 ) {
		throw new Error( 'T[0,0] should be 1.5, got ' + T[ 0 ] );
	}
});

test( 'dlarft: bwd row, non-zero V triggers break (lines 156-157)', function t() { // eslint-disable-line max-len
	var TAU;
	var V;
	var T;

	V = new Float64Array( 8 * 8 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 0 + 1 * 8 ] = 0.25;
	V[ 0 + 2 * 8 ] = 0.125;
	V[ 0 + 3 * 8 ] = 0.1;
	V[ 0 + 4 * 8 ] = 1.0;
	V[ 1 + 0 * 8 ] = 0.3;
	V[ 1 + 1 * 8 ] = 0.3;
	V[ 1 + 2 * 8 ] = 0.15;
	V[ 1 + 3 * 8 ] = 0.1;
	V[ 1 + 5 * 8 ] = 1.0;
	V[ 2 + 0 * 8 ] = 0.0;
	V[ 2 + 1 * 8 ] = 0.0;
	V[ 2 + 2 * 8 ] = 0.1;
	V[ 2 + 3 * 8 ] = 0.05;
	V[ 2 + 6 * 8 ] = 1.0;
	TAU = new Float64Array( [ 1.5, 0.8, 1.1 ] );
	T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'rowwise', 7, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.5 ) {
		throw new Error( 'T[0,0] should be 1.5, got ' + T[ 0 ] );
	}
});

test( 'dlarft: bwd col K=1 (exercises line 179: prevlastv set, i=0 else branch)', function t() { // eslint-disable-line max-len
	var TAU;
	var V;
	var T;

	V = new Float64Array( 8 * 3 );
	V[ 0 + 0 * 8 ] = 0.5;
	V[ 1 + 0 * 8 ] = 0.25;
	V[ 2 + 0 * 8 ] = 0.125;
	V[ 3 + 0 * 8 ] = 1.0;
	V[ 0 + 1 * 8 ] = 0.3;
	V[ 1 + 1 * 8 ] = 0.15;
	V[ 2 + 1 * 8 ] = 0.075;
	V[ 4 + 1 * 8 ] = 1.0;
	V[ 0 + 2 * 8 ] = 0.2;
	V[ 1 + 2 * 8 ] = 0.1;
	V[ 2 + 2 * 8 ] = 0.05;
	V[ 5 + 2 * 8 ] = 1.0;
	TAU = new Float64Array( [ 1.2, 0.8, 1.1 ] );
	T = new Float64Array( 3 * 3 );
	dlarft( 'backward', 'columnwise', 6, 3, V, 1, 8, 0, TAU, 1, 0, T, 1, 3, 0 );
	if ( T[ 0 ] !== 1.2 ) {
		throw new Error( 'T[0,0] should be 1.2, got ' + T[ 0 ] );
	}
	if ( T[ 1 + 1 * 3 ] !== 0.8 ) {
		throw new Error( 'T[1,1] should be 0.8, got ' + T[ 1 + 1 * 3 ] );
	}
	if ( T[ 2 + 2 * 3 ] !== 1.1 ) {
		throw new Error( 'T[2,2] should be 1.1, got ' + T[ 2 + 2 * 3 ] );
	}
});
