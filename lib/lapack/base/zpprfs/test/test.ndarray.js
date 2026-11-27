/* eslint-disable no-restricted-syntax, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptrf from './../../zpptrf/lib/base.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpprfs from './../lib/ndarray.js';

// FIXTURES //

import basic_upper_3x3 from './fixtures/basic_upper_3x3.json' with { type: 'json' };
import basic_lower_3x3 from './fixtures/basic_lower_3x3.json' with { type: 'json' };
import multi_rhs_3x3 from './fixtures/multi_rhs_3x3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

// FUNCTIONS //

/**
* Converts a Float64Array to an array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	let i;

	const out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let relErr, i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Creates a Complex128Array from interleaved real/imaginary doubles.
*
* @private
* @param {Array} arr - interleaved real/imaginary values
* @returns {Complex128Array} complex array
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

// TESTS //

test( 'zpprfs is a function', function t() {
	assert.equal( typeof zpprfs, 'function' );
});

test( 'zpprfs: basic_upper_3x3', function t() {

	const tc = basic_upper_3x3;
	const ap = c128( tc.AP );
	const afp = c128( tc.AFP );
	const b = c128( tc.B );
	const x = c128( tc.x );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 6 );
	const RWORK = new Float64Array( 3 );
	const info = zpprfs( 'upper', 3, 1, ap, 1, 0, afp, 1, 0, b, 1, 3, 0, x, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const xv = toArray( new Float64Array( x.buffer, x.byteOffset, 6 ) );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-6, 'berr' );
});

test( 'zpprfs: basic_lower_3x3', function t() {

	const tc = basic_lower_3x3;
	const ap = c128( tc.AP );
	const afp = c128( tc.AFP );
	const b = c128( tc.B );
	const x = c128( tc.x );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 6 );
	const RWORK = new Float64Array( 3 );
	const info = zpprfs( 'lower', 3, 1, ap, 1, 0, afp, 1, 0, b, 1, 3, 0, x, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const xv = toArray( new Float64Array( x.buffer, x.byteOffset, 6 ) );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-6, 'berr' );
});

test( 'zpprfs: multi_rhs_3x3', function t() {

	const tc = multi_rhs_3x3;
	const ap = c128( tc.AP );
	const afp = c128( tc.AFP );
	const b = c128( tc.B );
	const x = c128( tc.x );
	const FERR = new Float64Array( 2 );
	const BERR = new Float64Array( 2 );
	const WORK = new Complex128Array( 6 );
	const RWORK = new Float64Array( 3 );
	const info = zpprfs( 'upper', 3, 2, ap, 1, 0, afp, 1, 0, b, 1, 3, 0, x, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const xv = toArray( new Float64Array( x.buffer, x.byteOffset, 12 ) );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-6, 'berr' );
});

test( 'zpprfs: n_zero', function t() {

	const ap = c128( [ 1.0, 0.0 ] );
	const afp = c128( [ 1.0, 0.0 ] );
	const b = c128( [ 1.0, 0.0 ] );
	const x = c128( [ 1.0, 0.0 ] );
	const FERR = new Float64Array( [ -1.0 ] );
	const BERR = new Float64Array( [ -1.0 ] );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = zpprfs( 'upper', 0, 1, ap, 1, 0, afp, 1, 0, b, 1, 1, 0, x, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'zpprfs: nrhs_zero', function t() {

	const ap = c128( [ 1.0, 0.0 ] );
	const afp = c128( [ 1.0, 0.0 ] );
	const b = c128( [ 1.0, 0.0 ] );
	const x = c128( [ 1.0, 0.0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 3 );
	const info = zpprfs( 'upper', 3, 0, ap, 1, 0, afp, 1, 0, b, 1, 3, 0, x, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zpprfs: n_one', function t() {

	const tc = n_one;
	const ap = c128( tc.AP );
	const afp = c128( tc.AFP );
	const b = c128( tc.B );
	const x = c128( tc.x );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = zpprfs( 'upper', 1, 1, ap, 1, 0, afp, 1, 0, b, 1, 1, 0, x, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	const xv = toArray( new Float64Array( x.buffer, x.byteOffset, 2 ) );
	assertArrayClose( xv, tc.x, 1e-14, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-6, 'berr' );
});

test( 'zpprfs: FERR is normalized by max|X| even when no refinement step is taken (scale invariance)', function t() {
	// A = tridiag(1,4,1) (exactly representable), X is the exact solution and B = A*X exactly, so the residual is zero, BERR = 0, and the refinement loop exits on its first pass (LSTRES still holds its initial 3.0). FERR must then be EST / max_i CABS1(X(i)) with LSTRES reset to zero first; since max(CABS1(X)) = 0.75*scale < 3 for scale = 1, a stale LSTRES would divide by 3 instead. Scaling B and X by a power of two scales EST and max|X| identically, so FERR must be invariant.
	const xs = [ 0.25, 0.125, -0.125, 0.25, 0.5, -0.25 ];
	const bs = [ 0.875, 0.75, 0.25, 0.875, 1.875, -0.75 ];
	const ferr = [];
	const berr = [];
	let scale;
	let info;
	let i;
	let k;
	const AP = new Complex128Array( [ 4, 0, 1, 0, 4, 0, 0, 0, 1, 0, 4, 0 ] );
	const AFP = new Complex128Array( reinterpret( AP, 0 ) );
	zpptrf( 'upper', 3, AFP, 1, 0 );
	for ( k = 0; k < 2; k++ ) {
		scale = ( k === 0 ) ? 1.0 : 8.0;
		const X = new Complex128Array( 3 );
		const B = new Complex128Array( 3 );
		const xv = reinterpret( X, 0 );
		const bv = reinterpret( B, 0 );
		for ( i = 0; i < 6; i++ ) {
			xv[ i ] = scale * xs[ i ];
			bv[ i ] = scale * bs[ i ];
		}
		const FERR = new Float64Array( 1 );
		const BERR = new Float64Array( 1 );
		const WORK = new Complex128Array( 6 );
		const RWORK = new Float64Array( 3 );
		info = zpprfs( 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
		assert.equal( info, 0, 'info' );
		ferr.push( FERR[ 0 ] );
		berr.push( BERR[ 0 ] );
	}
	assert.equal( berr[ 0 ], 0.0, 'berr (scale 1)' );
	assert.equal( berr[ 1 ], 0.0, 'berr (scale 8)' );
	assert.ok( ferr[ 1 ] > 0.0, 'ferr > 0' );
	assert.ok( Math.abs( ferr[ 0 ] - ferr[ 1 ] ) <= 1e-12 * ferr[ 1 ], 'ferr invariant under scaling: ' + ferr[ 0 ] + ' vs ' + ferr[ 1 ] ); // eslint-disable-line max-len
});
