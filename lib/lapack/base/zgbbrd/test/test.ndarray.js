/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbbrd from './../lib/ndarray.js';


// FUNCTIONS //

function assertClose( got, expected, tol, msg ) {
	var bound = tol * Math.max( Math.abs( expected ), 1.0 );
	if ( !( Math.abs( got - expected ) <= bound ) ) {
		throw new Error( msg + ': expected ' + expected + ', got ' + got );
	}
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function setAB( ABv, ldab, i, j, re, im ) {
	var idx = ( ( i - 1 ) + ( ( j - 1 ) * ldab ) ) * 2;
	ABv[ idx ] = re;
	ABv[ idx + 1 ] = im;
}

function buildComplexAB( ldab, N, entries ) {
	var AB = new Complex128Array( ldab * N );
	var v = reinterpret( AB, 0 );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		setAB( v, ldab, entries[ i ][ 0 ], entries[ i ][ 1 ], entries[ i ][ 2 ], entries[ i ][ 3 ] );
	}
	return AB;
}


// CONSTANTS //

var TOL = 1e-12;


// FIXTURES //

var EXP_TRI_5x5_N = {
	'D': [ 4.15812457725835838, 4.03806456678551928, 4.03602887260100296, 3.91515981306622152, 3.03172720028854359 ],
	'E': [ 1.98944583661935948, 2.02550925033127482, 2.06754236721582174, 1.66112775394673839 ]
};
var EXP_DIAG_4x4_N = {
	'D': [ 2.54950975679639225, 1.52970585407783544, 3.50570962859162050, 4.53982378512646711 ]
};


// TESTS //

test( 'zgbbrd is a function', function t() {
	assert.strictEqual( typeof zgbbrd, 'function', 'is a function' );
});

test( 'zgbbrd: tri_5x5_N', function t() {
	var M = 5;
	var N = 5;
	var kl = 1;
	var ku = 1;
	var ldab = kl + ku + 1;
	var AB = buildComplexAB( ldab, N, [
		[ 2, 1, 4.0, 0.5 ], [ 3, 1, -1.0, 0.2 ],
		[ 1, 2, -1.0, -0.2 ], [ 2, 2, 4.0, -0.3 ], [ 3, 2, -1.0, 0.1 ],
		[ 1, 3, -1.0, 0.4 ], [ 2, 3, 4.0, 0.0 ], [ 3, 3, -1.0, -0.5 ],
		[ 1, 4, -1.0, -0.1 ], [ 2, 4, 4.0, 0.6 ], [ 3, 4, -1.0, 0.3 ],
		[ 1, 5, -1.0, 0.2 ], [ 2, 5, 4.0, -0.4 ]
	] );
	var d = new Float64Array( N );
	var e = new Float64Array( N - 1 );
	var Q = new Complex128Array( 1 );
	var PT = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( Math.max( M, N ) );
	var RWORK = new Float64Array( Math.max( M, N ) );
	var info = zgbbrd( 'no-vectors', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_TRI_5x5_N.D, TOL, 'D' );
	assertArrayClose( e, EXP_TRI_5x5_N.E, TOL, 'E' );
});

test( 'zgbbrd: penta_5x5_B', function t() {
	var M = 5;
	var N = 5;
	var kl = 2;
	var ku = 2;
	var ldab = kl + ku + 1;
	var AB = buildComplexAB( ldab, N, [
		[ 3, 1, 6.0, 0.0 ], [ 4, 1, -2.0, 0.5 ], [ 5, 1, 1.0, 0.1 ],
		[ 2, 2, -2.0, -0.5 ], [ 3, 2, 6.0, 0.2 ], [ 4, 2, -2.0, -0.3 ], [ 5, 2, 1.0, 0.4 ],
		[ 1, 3, 1.0, -0.1 ], [ 2, 3, -2.0, 0.3 ], [ 3, 3, 6.0, -0.2 ], [ 4, 3, -2.0, 0.1 ], [ 5, 3, 1.0, -0.5 ],
		[ 1, 4, 1.0, -0.4 ], [ 2, 4, -2.0, -0.1 ], [ 3, 4, 6.0, 0.3 ], [ 4, 4, -2.0, 0.2 ],
		[ 1, 5, 1.0, 0.5 ], [ 2, 5, -2.0, -0.2 ], [ 3, 5, 6.0, 0.6 ]
	] );
	var d = new Float64Array( N );
	var e = new Float64Array( N - 1 );
	var Q = new Complex128Array( M * M );
	var PT = new Complex128Array( N * N );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( Math.max( M, N ) );
	var RWORK = new Float64Array( Math.max( M, N ) );
	var info = zgbbrd( 'both', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0, 'D[0] positive' );
});

test( 'zgbbrd: tall_6x4_Q', function t() {
	var M = 6;
	var N = 4;
	var kl = 1;
	var ku = 1;
	var ncc = 2;
	var ldab = kl + ku + 1;
	var AB = buildComplexAB( ldab, N, [
		[ 2, 1, 3.0, 0.1 ], [ 3, 1, -1.0, 0.2 ],
		[ 1, 2, -1.0, -0.2 ], [ 2, 2, 3.0, -0.3 ], [ 3, 2, -1.0, 0.4 ],
		[ 1, 3, -1.0, -0.4 ], [ 2, 3, 3.0, 0.5 ], [ 3, 3, -1.0, -0.1 ],
		[ 1, 4, -1.0, 0.1 ], [ 2, 4, 3.0, 0.0 ], [ 3, 4, -1.0, 0.3 ]
	] );
	var d = new Float64Array( Math.min( M, N ) );
	var e = new Float64Array( Math.min( M, N ) - 1 );
	var Q = new Complex128Array( M * M );
	var PT = new Complex128Array( 1 );
	var C = new Complex128Array( M * ncc );
	var WORK = new Complex128Array( Math.max( M, N ) );
	var RWORK = new Float64Array( Math.max( M, N ) );
	var cv = reinterpret( C, 0 );
	cv[ 0 ] = 1; cv[ 1 ] = 0.1;
	cv[ 2 ] = 3; cv[ 3 ] = -0.2;
	var info = zgbbrd( 'q-only', M, N, ncc, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, 1, 0, C, 1, M, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0 );
});

test( 'zgbbrd: wide_4x6_P', function t() {
	var M = 4;
	var N = 6;
	var kl = 0;
	var ku = 1;
	var ldab = kl + ku + 1;
	var AB = buildComplexAB( ldab, N, [
		[ 2, 1, 2.0, 0.1 ],
		[ 1, 2, 1.0, -0.2 ], [ 2, 2, 3.0, 0.3 ],
		[ 1, 3, 1.0, 0.4 ], [ 2, 3, 4.0, -0.5 ],
		[ 1, 4, 1.0, -0.1 ], [ 2, 4, 5.0, 0.2 ],
		[ 1, 5, 1.0, 0.6 ],
		[ 1, 6, 1.0, -0.3 ]
	] );
	var d = new Float64Array( Math.min( M, N ) );
	var e = new Float64Array( Math.min( M, N ) - 1 );
	var Q = new Complex128Array( 1 );
	var PT = new Complex128Array( N * N );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( Math.max( M, N ) );
	var RWORK = new Float64Array( Math.max( M, N ) );
	var info = zgbbrd( 'p-only', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0 );
});

test( 'zgbbrd: lower_4x4_B', function t() {
	var M = 4;
	var N = 4;
	var kl = 1;
	var ku = 0;
	var ldab = kl + ku + 1;
	var AB = buildComplexAB( ldab, N, [
		[ 1, 1, 2.0, 0.1 ], [ 2, 1, -1.0, 0.2 ],
		[ 1, 2, 3.0, -0.2 ], [ 2, 2, -1.0, 0.3 ],
		[ 1, 3, 4.0, 0.4 ], [ 2, 3, -1.0, -0.4 ],
		[ 1, 4, 5.0, -0.1 ]
	] );
	var d = new Float64Array( N );
	var e = new Float64Array( N - 1 );
	var Q = new Complex128Array( M * M );
	var PT = new Complex128Array( N * N );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( Math.max( M, N ) );
	var RWORK = new Float64Array( Math.max( M, N ) );
	var info = zgbbrd( 'both', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0 );
});

test( 'zgbbrd: diag_4x4_N', function t() {
	var M = 4;
	var N = 4;
	var ldab = 1;
	var AB = buildComplexAB( ldab, N, [
		[ 1, 1, 2.5, 0.5 ],
		[ 1, 2, -1.5, -0.3 ],
		[ 1, 3, 3.5, 0.2 ],
		[ 1, 4, 4.5, -0.6 ]
	] );
	var d = new Float64Array( N );
	var e = new Float64Array( Math.max( 1, N - 1 ) );
	var Q = new Complex128Array( 1 );
	var PT = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( Math.max( M, N ) );
	var RWORK = new Float64Array( Math.max( M, N ) );
	var info = zgbbrd( 'no-vectors', M, N, 0, 0, 0, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_DIAG_4x4_N.D, TOL, 'D' );
});

test( 'zgbbrd: m_zero quick return', function t() {
	var AB = new Complex128Array( 12 );
	var d = new Float64Array( 4 );
	var e = new Float64Array( 4 );
	var Q = new Complex128Array( 1 );
	var PT = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 4 );
	var RWORK = new Float64Array( 4 );
	var info = zgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgbbrd: n_zero quick return', function t() {
	var AB = new Complex128Array( 1 );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	var Q = new Complex128Array( 1 );
	var PT = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var RWORK = new Float64Array( 1 );
	var info = zgbbrd( 'no-vectors', 4, 0, 0, 1, 1, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
});
