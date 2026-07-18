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
	const bound = tol * Math.max( Math.abs( expected ), 1.0 );
	if ( !( Math.abs( got - expected ) <= bound ) ) {
		throw new Error( msg + ': expected ' + expected + ', got ' + got );
	}
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function setAB( ABv, ldab, i, j, re, im ) {
	const idx = ( ( i - 1 ) + ( ( j - 1 ) * ldab ) ) * 2;
	ABv[ idx ] = re;
	ABv[ idx + 1 ] = im;
}

function buildComplexAB( ldab, N, entries ) {
	const AB = new Complex128Array( ldab * N );
	const v = reinterpret( AB, 0 );
	let i;
	for ( i = 0; i < entries.length; i++ ) {
		setAB( v, ldab, entries[ i ][ 0 ], entries[ i ][ 1 ], entries[ i ][ 2 ], entries[ i ][ 3 ] );
	}
	return AB;
}


// CONSTANTS //

const TOL = 1e-12;


// FIXTURES //

const EXP_TRI_5x5_N = {
	'D': [ 4.15812457725835838, 4.03806456678551928, 4.03602887260100296, 3.91515981306622152, 3.03172720028854359 ],
	'E': [ 1.98944583661935948, 2.02550925033127482, 2.06754236721582174, 1.66112775394673839 ]
};
const EXP_DIAG_4x4_N = {
	'D': [ 2.54950975679639225, 1.52970585407783544, 3.50570962859162050, 4.53982378512646711 ]
};


// TESTS //

test( 'zgbbrd is a function', function t() {
	assert.strictEqual( typeof zgbbrd, 'function', 'is a function' );
});

test( 'zgbbrd: tri_5x5_N', function t() {
	const M = 5;
	const N = 5;
	const kl = 1;
	const ku = 1;
	const ldab = kl + ku + 1;
	const AB = buildComplexAB( ldab, N, [
		[ 2, 1, 4.0, 0.5 ], [ 3, 1, -1.0, 0.2 ],
		[ 1, 2, -1.0, -0.2 ], [ 2, 2, 4.0, -0.3 ], [ 3, 2, -1.0, 0.1 ],
		[ 1, 3, -1.0, 0.4 ], [ 2, 3, 4.0, 0.0 ], [ 3, 3, -1.0, -0.5 ],
		[ 1, 4, -1.0, -0.1 ], [ 2, 4, 4.0, 0.6 ], [ 3, 4, -1.0, 0.3 ],
		[ 1, 5, -1.0, 0.2 ], [ 2, 5, 4.0, -0.4 ]
	]);
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( Math.max( M, N ) );
	const RWORK = new Float64Array( Math.max( M, N ) );
	const info = zgbbrd( 'no-vectors', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_TRI_5x5_N.D, TOL, 'D' );
	assertArrayClose( e, EXP_TRI_5x5_N.E, TOL, 'E' );
});

test( 'zgbbrd: penta_5x5_B', function t() {
	const M = 5;
	const N = 5;
	const kl = 2;
	const ku = 2;
	const ldab = kl + ku + 1;
	const AB = buildComplexAB( ldab, N, [
		[ 3, 1, 6.0, 0.0 ], [ 4, 1, -2.0, 0.5 ], [ 5, 1, 1.0, 0.1 ],
		[ 2, 2, -2.0, -0.5 ], [ 3, 2, 6.0, 0.2 ], [ 4, 2, -2.0, -0.3 ], [ 5, 2, 1.0, 0.4 ],
		[ 1, 3, 1.0, -0.1 ], [ 2, 3, -2.0, 0.3 ], [ 3, 3, 6.0, -0.2 ], [ 4, 3, -2.0, 0.1 ], [ 5, 3, 1.0, -0.5 ],
		[ 1, 4, 1.0, -0.4 ], [ 2, 4, -2.0, -0.1 ], [ 3, 4, 6.0, 0.3 ], [ 4, 4, -2.0, 0.2 ],
		[ 1, 5, 1.0, 0.5 ], [ 2, 5, -2.0, -0.2 ], [ 3, 5, 6.0, 0.6 ]
	]);
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Complex128Array( M * M );
	const PT = new Complex128Array( N * N );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( Math.max( M, N ) );
	const RWORK = new Float64Array( Math.max( M, N ) );
	const info = zgbbrd( 'both', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0, 'D[0] positive' );
});

test( 'zgbbrd: tall_6x4_Q', function t() {
	const M = 6;
	const N = 4;
	const kl = 1;
	const ku = 1;
	const ncc = 2;
	const ldab = kl + ku + 1;
	const AB = buildComplexAB( ldab, N, [
		[ 2, 1, 3.0, 0.1 ], [ 3, 1, -1.0, 0.2 ],
		[ 1, 2, -1.0, -0.2 ], [ 2, 2, 3.0, -0.3 ], [ 3, 2, -1.0, 0.4 ],
		[ 1, 3, -1.0, -0.4 ], [ 2, 3, 3.0, 0.5 ], [ 3, 3, -1.0, -0.1 ],
		[ 1, 4, -1.0, 0.1 ], [ 2, 4, 3.0, 0.0 ], [ 3, 4, -1.0, 0.3 ]
	]);
	const d = new Float64Array( Math.min( M, N ) );
	const e = new Float64Array( Math.min( M, N ) - 1 );
	const Q = new Complex128Array( M * M );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( M * ncc );
	const WORK = new Complex128Array( Math.max( M, N ) );
	const RWORK = new Float64Array( Math.max( M, N ) );
	const cv = reinterpret( C, 0 );
	cv[ 0 ] = 1; cv[ 1 ] = 0.1;
	cv[ 2 ] = 3; cv[ 3 ] = -0.2;
	const info = zgbbrd( 'q-only', M, N, ncc, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, 1, 0, C, 1, M, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0 );
});

test( 'zgbbrd: wide_4x6_P', function t() {
	const M = 4;
	const N = 6;
	const kl = 0;
	const ku = 1;
	const ldab = kl + ku + 1;
	const AB = buildComplexAB( ldab, N, [
		[ 2, 1, 2.0, 0.1 ],
		[ 1, 2, 1.0, -0.2 ], [ 2, 2, 3.0, 0.3 ],
		[ 1, 3, 1.0, 0.4 ], [ 2, 3, 4.0, -0.5 ],
		[ 1, 4, 1.0, -0.1 ], [ 2, 4, 5.0, 0.2 ],
		[ 1, 5, 1.0, 0.6 ],
		[ 1, 6, 1.0, -0.3 ]
	]);
	const d = new Float64Array( Math.min( M, N ) );
	const e = new Float64Array( Math.min( M, N ) - 1 );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( N * N );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( Math.max( M, N ) );
	const RWORK = new Float64Array( Math.max( M, N ) );
	const info = zgbbrd( 'p-only', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0 );
});

test( 'zgbbrd: lower_4x4_B', function t() {
	const M = 4;
	const N = 4;
	const kl = 1;
	const ku = 0;
	const ldab = kl + ku + 1;
	const AB = buildComplexAB( ldab, N, [
		[ 1, 1, 2.0, 0.1 ], [ 2, 1, -1.0, 0.2 ],
		[ 1, 2, 3.0, -0.2 ], [ 2, 2, -1.0, 0.3 ],
		[ 1, 3, 4.0, 0.4 ], [ 2, 3, -1.0, -0.4 ],
		[ 1, 4, 5.0, -0.1 ]
	]);
	const d = new Float64Array( N );
	const e = new Float64Array( N - 1 );
	const Q = new Complex128Array( M * M );
	const PT = new Complex128Array( N * N );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( Math.max( M, N ) );
	const RWORK = new Float64Array( Math.max( M, N ) );
	const info = zgbbrd( 'both', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( d[ 0 ] > 0 );
});

test( 'zgbbrd: diag_4x4_N', function t() {
	const M = 4;
	const N = 4;
	const ldab = 1;
	const AB = buildComplexAB( ldab, N, [
		[ 1, 1, 2.5, 0.5 ],
		[ 1, 2, -1.5, -0.3 ],
		[ 1, 3, 3.5, 0.2 ],
		[ 1, 4, 4.5, -0.6 ]
	]);
	const d = new Float64Array( N );
	const e = new Float64Array( Math.max( 1, N - 1 ) );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( Math.max( M, N ) );
	const RWORK = new Float64Array( Math.max( M, N ) );
	const info = zgbbrd( 'no-vectors', M, N, 0, 0, 0, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_DIAG_4x4_N.D, TOL, 'D' );
});

test( 'zgbbrd: m_zero quick return', function t() {
	const AB = new Complex128Array( 12 );
	const d = new Float64Array( 4 );
	const e = new Float64Array( 4 );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 4 );
	const info = zgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zgbbrd: n_zero quick return', function t() {
	const AB = new Complex128Array( 1 );
	const d = new Float64Array( 1 );
	const e = new Float64Array( 1 );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );
	const info = zgbbrd( 'no-vectors', 4, 0, 0, 1, 1, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.strictEqual( info, 0 );
});
