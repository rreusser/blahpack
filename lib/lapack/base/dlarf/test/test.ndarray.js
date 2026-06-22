/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarf from './../lib/ndarray.js';

// FIXTURES //

import left_3x3 from './fixtures/left_3x3.json' with { type: 'json' };
import right_3x3 from './fixtures/right_3x3.json' with { type: 'json' };
import tau_zero from './fixtures/tau_zero.json' with { type: 'json' };
import left_2x3 from './fixtures/left_2x3.json' with { type: 'json' };

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

// C is 3x3 or 2x3 col-major, LDA=4 in Fortran -> we use LDA=3 or LDA=2 for exact packing // eslint-disable-line max-len

test( 'dlarf: left 3x3', function t() {
	var WORK;
	var tc;
	var C;
	var v;

	tc = left_3x3;
	C = new Float64Array( 9 );
	C[ 0 ] = 1;
	C[ 1 ] = 4;
	C[ 2 ] = 7;
	C[ 3 ] = 2;
	C[ 4 ] = 5;
	C[ 5 ] = 8;
	C[ 6 ] = 3;
	C[ 7 ] = 6;
	C[ 8 ] = 9;
	v = new Float64Array( [ 1.0, 0.5, 0.25 ] );
	WORK = new Float64Array( 3 );
	dlarf( 'left', 3, 3, v, 1, 0, 1.5, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarf: right 3x3', function t() {
	var WORK;
	var tc;
	var C;
	var v;

	tc = right_3x3;
	C = new Float64Array( 9 );
	C[ 0 ] = 1;
	C[ 1 ] = 4;
	C[ 2 ] = 7;
	C[ 3 ] = 2;
	C[ 4 ] = 5;
	C[ 5 ] = 8;
	C[ 6 ] = 3;
	C[ 7 ] = 6;
	C[ 8 ] = 9;
	v = new Float64Array( [ 1.0, 0.5, 0.25 ] );
	WORK = new Float64Array( 3 );
	dlarf( 'right', 3, 3, v, 1, 0, 1.5, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarf: tau=0 (identity)', function t() {
	var WORK;
	var tc;
	var C;
	var v;

	tc = tau_zero;
	C = new Float64Array( 4 );
	C[ 0 ] = 1;
	C[ 1 ] = 3;
	C[ 2 ] = 2;
	C[ 3 ] = 4;
	v = new Float64Array( [ 1.0, 0.5 ] );
	WORK = new Float64Array( 2 );
	dlarf( 'left', 2, 2, v, 1, 0, 0.0, C, 1, 2, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarf: left 2x3', function t() {
	var WORK;
	var tc;
	var C;
	var v;

	tc = left_2x3;
	C = new Float64Array( 6 );
	C[ 0 ] = 1;
	C[ 1 ] = 4;
	C[ 2 ] = 2;
	C[ 3 ] = 5;
	C[ 4 ] = 3;
	C[ 5 ] = 6;
	v = new Float64Array( [ 1.0, 2.0 ] );
	WORK = new Float64Array( 3 );
	dlarf( 'left', 2, 3, v, 1, 0, 0.8, C, 1, 2, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarf: left with negative strideV', function t() {
	var WORK;
	var tc;
	var C;
	var v;

	C = new Float64Array( 9 );
	C[ 0 ] = 1;
	C[ 1 ] = 4;
	C[ 2 ] = 7;
	C[ 3 ] = 2;
	C[ 4 ] = 5;
	C[ 5 ] = 8;
	C[ 6 ] = 3;
	C[ 7 ] = 6;
	C[ 8 ] = 9;
	v = new Float64Array( [ 0.25, 0.5, 1.0 ] );
	WORK = new Float64Array( 3 );
	tc = left_3x3;
	dlarf( 'left', 3, 3, v, -1, 2, 1.5, C, 1, 3, 0, WORK, 1, 0 );
	assertArrayClose( C, tc.C, 1e-14, 'C' );
});

test( 'dlarf: left with negative strideV and trailing zeros (lines 58-60)', function t() { // eslint-disable-line max-len
	var WORK2;
	var WORK;
	var C2;
	var v2;
	var C;
	var v;

	C = new Float64Array( 5 * 3 );
	C[ 0 ] = 1;
	C[ 1 ] = 2;
	C[ 2 ] = 3;
	C[ 3 ] = 4;
	C[ 4 ] = 5;
	C[ 5 ] = 6;
	C[ 6 ] = 7;
	C[ 7 ] = 8;
	C[ 8 ] = 9;
	C[ 9 ] = 10;
	C[ 10 ] = 11;
	C[ 11 ] = 12;
	C[ 12 ] = 13;
	C[ 13 ] = 14;
	C[ 14 ] = 15;
	v = new Float64Array( [ 0.0, 0.0, 0.25, 0.5, 1.0 ] );
	WORK = new Float64Array( 3 );
	C2 = new Float64Array( C );
	v2 = new Float64Array( [ 1.0, 0.5, 0.25, 0.0, 0.0 ] );
	WORK2 = new Float64Array( 3 );
	dlarf( 'left', 5, 3, v2, 1, 0, 1.5, C2, 1, 5, 0, WORK2, 1, 0 );
	dlarf( 'left', 5, 3, v, -1, 4, 1.5, C, 1, 5, 0, WORK, 1, 0 );
	assertArrayClose( C, C2, 1e-14, 'C negative stride with trailing zeros' );
});
