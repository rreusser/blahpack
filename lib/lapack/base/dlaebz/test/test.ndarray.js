// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaebz from './../lib/ndarray.js';

// FIXTURES //

import ijob1_all from './fixtures/ijob1_all.json' with { type: 'json' };
import ijob1_two_intervals from './fixtures/ijob1_two_intervals.json' with { type: 'json' };
import ijob12_full_cycle from './fixtures/ijob12_full_cycle.json' with { type: 'json' };
import ijob3_search from './fixtures/ijob3_search.json' with { type: 'json' };
import ijob1_n1 from './fixtures/ijob1_n1.json' with { type: 'json' };
import ijob2_parallel from './fixtures/ijob2_parallel.json' with { type: 'json' };
import ijob3_parallel from './fixtures/ijob3_parallel.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

// 5x5 tridiagonal: D=[2,-1,3,0.5,4], E=[1,1,1,1]
const D5 = new Float64Array( [ 2.0, -1.0, 3.0, 0.5, 4.0 ] );
const E5 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
const E2_5 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );

const SAFEMN = 2.2250738585072014e-308;
const ULP = 1.1102230246251565e-16;
const PIVMIN = SAFEMN;
const MMAX = 40;

function gershgorin( d, e, N ) {
	let gl = d[ 0 ] - Math.abs( e[ 0 ] );
	let gu = d[ 0 ] + Math.abs( e[ 0 ] );
	let tmp, i;
	for ( i = 1; i < N - 1; i++ ) {
		tmp = Math.abs( e[ i - 1 ] ) + Math.abs( e[ i ] );
		gl = Math.min( gl, d[ i ] - tmp );
		gu = Math.max( gu, d[ i ] + tmp );
	}
	gl = Math.min( gl, d[ N - 1 ] - Math.abs( e[ N - 2 ] ) );
	gu = Math.max( gu, d[ N - 1 ] + Math.abs( e[ N - 2 ] ) );
	const tnorm = Math.max( Math.abs( gl ), Math.abs( gu ) );
	gl = gl - 2.1 * tnorm * ULP * N - 2.1 * 2.0 * PIVMIN;
	gu = gu + 2.1 * tnorm * ULP * N + 2.1 * PIVMIN;
	return { gl: gl, gu: gu, tnorm: tnorm };
}

// TESTS //

test( 'dlaebz: IJOB=1, single interval containing all eigenvalues', function t() {
	const tc = ijob1_all;
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );

	AB[ 0 ] = -10.0;
	AB[ MMAX ] = 10.0;

	const info = dlaebz( 1, 0, 5, MMAX, 1, 0, 0.0, 0.0, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assert.equal( mout[ 0 ], tc.mout, 'mout' );
	assert.equal( NAB[ 0 ], tc.nab11, 'NAB(1,1)' );
	assert.equal( NAB[ MMAX ], tc.nab12, 'NAB(1,2)' );
});

test( 'dlaebz: IJOB=1, two intervals', function t() {
	const tc = ijob1_two_intervals;
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );

	AB[ 0 ] = -10.0;
	AB[ MMAX ] = 1.0;
	AB[ 1 ] = 1.0;
	AB[ MMAX + 1 ] = 10.0;

	const info = dlaebz( 1, 0, 5, MMAX, 2, 0, 0.0, 0.0, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assert.equal( mout[ 0 ], tc.mout, 'mout' );
	assert.equal( NAB[ 0 ], tc.nab11, 'NAB(1,1)' );
	assert.equal( NAB[ MMAX ], tc.nab12, 'NAB(1,2)' );
	assert.equal( NAB[ 1 ], tc.nab21, 'NAB(2,1)' );
	assert.equal( NAB[ MMAX + 1 ], tc.nab22, 'NAB(2,2)' );
});

test( 'dlaebz: IJOB=1 then IJOB=2, full bisection cycle', function t() {
	const tc = ijob12_full_cycle;
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );
	const N = 5;
	let i, im, iout, nitmax;

	const bounds = gershgorin( D5, E5, N );
	const abstol = 2.0 * SAFEMN;
	const reltol = ULP * 2.0;

	AB[ 0 ] = bounds.gl;
	AB[ MMAX ] = bounds.gu;

	// IJOB=1: count
	let info = dlaebz( 1, 0, N, MMAX, 1, 0, abstol, reltol, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	im = mout[ 0 ];
	assert.equal( im, tc.im, 'im matches' );

	nitmax = Math.floor( ( Math.log( bounds.gu - bounds.gl + PIVMIN ) - Math.log( PIVMIN ) ) / Math.log( 2.0 ) ) + 2;

	// IJOB=2: bisect (MINP=1, matching dstebz convention)
	info = dlaebz( 2, nitmax, N, MMAX, 1, 0, abstol, reltol, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	iout = mout[ 0 ];
	assert.equal( info, tc.info, 'info' );
	assert.equal( iout, tc.iout, 'iout' );

	// Compare eigenvalue midpoints (sorted)
	const eigenvalues = [];
	for ( i = 0; i < iout; i++ ) {
		eigenvalues.push( 0.5 * ( AB[ i ] + AB[ MMAX + i ] ) );
	}
	const sortedActual = eigenvalues.slice().sort( function( a, b ) { return a - b; } );
	const sortedExpected = tc.eigenvalues.slice().sort( function( a, b ) { return a - b; } );

	assert.equal( sortedActual.length, sortedExpected.length, 'eigenvalue count' );
	for ( i = 0; i < sortedExpected.length; i++ ) {
		assertClose( sortedActual[ i ], sortedExpected[ i ], 1e-12, 'eigenvalue[' + i + ']' );
	}

	// Check NAB values
	for ( i = 0; i < iout; i++ ) {
		assert.equal( NAB[ i ], tc.nab1[ i ], 'nab1[' + i + ']' );
		assert.equal( NAB[ MMAX + i ], tc.nab2[ i ], 'nab2[' + i + ']' );
	}
});

test( 'dlaebz: IJOB=3, binary search', function t() {
	const tc = ijob3_search;
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );
	const N = 5;
	let i;

	const bounds = gershgorin( D5, E5, N );
	const abstol = 2.0 * SAFEMN;
	const reltol = ULP * 2.0;

	AB[ 0 ] = bounds.gl; AB[ MMAX ] = bounds.gu;
	AB[ 1 ] = bounds.gl; AB[ MMAX + 1 ] = bounds.gu;
	NAB[ 0 ] = -1; NAB[ MMAX ] = N + 1;
	NAB[ 1 ] = -1; NAB[ MMAX + 1 ] = N + 1;
	NVAL[ 0 ] = 2;
	NVAL[ 1 ] = 4;
	C[ 0 ] = bounds.gl;
	C[ 1 ] = bounds.gu;

	const nitmax = Math.floor( ( Math.log( bounds.tnorm + PIVMIN ) - Math.log( PIVMIN ) ) / Math.log( 2.0 ) ) + 2;

	const info = dlaebz( 3, nitmax, N, MMAX, 2, 0, abstol, reltol, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assert.equal( mout[ 0 ], tc.mout, 'mout' );

	for ( i = 0; i < tc.mout; i++ ) {
		assertClose( AB[ i ], tc.ab1[ i ], 1e-12, 'AB(' + i + ',1)' );
		assertClose( AB[ MMAX + i ], tc.ab2[ i ], 1e-12, 'AB(' + i + ',2)' );
		assert.equal( NAB[ i ], tc.nab1[ i ], 'NAB(' + i + ',1)' );
		assert.equal( NAB[ MMAX + i ], tc.nab2[ i ], 'NAB(' + i + ',2)' );
		assert.equal( NVAL[ i ], tc.nval[ i ], 'NVAL(' + i + ')' );
	}
});

test( 'dlaebz: invalid IJOB returns -1', function t() {
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );

	assert.equal( dlaebz( 0, 0, 5, MMAX, 1, 0, 0.0, 0.0, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 ), -1 );

	assert.equal( dlaebz( 4, 0, 5, MMAX, 1, 0, 0.0, 0.0, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 ), -1 );
});

test( 'dlaebz: IJOB=1, N=1', function t() {
	const tc = ijob1_n1;
	const d = new Float64Array( [ 3.0 ] );
	const e = new Float64Array( 1 );
	const e2 = new Float64Array( 1 );
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );

	AB[ 0 ] = 0.0;
	AB[ MMAX ] = 10.0;

	const info = dlaebz( 1, 0, 1, MMAX, 1, 0, 0.0, 0.0, PIVMIN,
		d, 1, 0, e, 1, 0, e2, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assert.equal( mout[ 0 ], tc.mout, 'mout' );
	assert.equal( NAB[ 0 ], tc.nab11, 'NAB(1,1)' );
	assert.equal( NAB[ MMAX ], tc.nab12, 'NAB(1,2)' );
});

test( 'dlaebz: IJOB=2 with parallel path (nbmin>0)', function t() {
	const tc = ijob2_parallel;
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );
	const N = 5;
	let i;

	const bounds = gershgorin( D5, E5, N );
	const abstol = 2.0 * SAFEMN;
	const reltol = ULP * 2.0;

	AB[ 0 ] = bounds.gl;
	AB[ MMAX ] = bounds.gu;

	// IJOB=1: count
	dlaebz( 1, 0, N, MMAX, 1, 0, abstol, reltol, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	const nitmax = Math.floor( ( Math.log( bounds.gu - bounds.gl + PIVMIN ) - Math.log( PIVMIN ) ) / Math.log( 2.0 ) ) + 2;

	// IJOB=2 with NBMIN=2, MINP=1
	const info = dlaebz( 2, nitmax, N, MMAX, 1, 2, abstol, reltol, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	const iout = mout[ 0 ];
	assert.equal( info, tc.info, 'info' );
	assert.equal( iout, tc.iout, 'iout' );

	// Compare eigenvalue midpoints (sorted)
	const eigenvalues = [];
	for ( i = 0; i < iout; i++ ) {
		eigenvalues.push( 0.5 * ( AB[ i ] + AB[ MMAX + i ] ) );
	}
	const sortedActual = eigenvalues.slice().sort( function( a, b ) { return a - b; } );
	const sortedExpected = tc.eigenvalues.slice().sort( function( a, b ) { return a - b; } );

	for ( i = 0; i < sortedExpected.length; i++ ) {
		assertClose( sortedActual[ i ], sortedExpected[ i ], 1e-12, 'eigenvalue[' + i + ']' );
	}
});

test( 'dlaebz: IJOB=3 with parallel path (nbmin>0)', function t() {
	const tc = ijob3_parallel;
	const AB = new Float64Array( MMAX * 2 );
	const NAB = new Int32Array( MMAX * 2 );
	const NVAL = new Int32Array( MMAX );
	const C = new Float64Array( MMAX );
	const WORK = new Float64Array( MMAX );
	const IWORK = new Int32Array( MMAX );
	const mout = new Int32Array( 1 );
	const N = 5;
	let i;

	const bounds = gershgorin( D5, E5, N );
	const abstol = 2.0 * SAFEMN;
	const reltol = ULP * 2.0;

	AB[ 0 ] = bounds.gl; AB[ MMAX ] = bounds.gu;
	AB[ 1 ] = bounds.gl; AB[ MMAX + 1 ] = bounds.gu;
	NAB[ 0 ] = -1; NAB[ MMAX ] = N + 1;
	NAB[ 1 ] = -1; NAB[ MMAX + 1 ] = N + 1;
	NVAL[ 0 ] = 2;
	NVAL[ 1 ] = 4;
	C[ 0 ] = bounds.gl;
	C[ 1 ] = bounds.gu;

	const nitmax = Math.floor( ( Math.log( bounds.tnorm + PIVMIN ) - Math.log( PIVMIN ) ) / Math.log( 2.0 ) ) + 2;

	const info = dlaebz( 3, nitmax, N, MMAX, 2, 1, abstol, reltol, PIVMIN,
		D5, 1, 0, E5, 1, 0, E2_5, 1, 0,
		NVAL, 1, 0, AB, 1, MMAX, 0, C, 1, 0,
		mout, NAB, 1, MMAX, 0, WORK, 1, 0, IWORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assert.equal( mout[ 0 ], tc.mout, 'mout' );

	for ( i = 0; i < tc.mout; i++ ) {
		assertClose( AB[ i ], tc.ab1[ i ], 1e-12, 'AB(' + i + ',1)' );
		assertClose( AB[ MMAX + i ], tc.ab2[ i ], 1e-12, 'AB(' + i + ',2)' );
		assert.equal( NAB[ i ], tc.nab1[ i ], 'NAB(' + i + ',1)' );
		assert.equal( NAB[ MMAX + i ], tc.nab2[ i ], 'NAB(' + i + ',2)' );
		assert.equal( NVAL[ i ], tc.nval[ i ], 'NVAL(' + i + ')' );
	}
});
