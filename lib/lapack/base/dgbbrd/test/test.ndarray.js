/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbbrd from './../lib/ndarray.js';


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

function setAB( AB, ldab, i, j, v ) {
	AB[ ( i - 1 ) + ( ( j - 1 ) * ldab ) ] = v;
}


// CONSTANTS //

var TOL = 1e-12;


// FIXTURES //

var EXP_TRI_5x5_N = {
	'D': [ 4.12310562561766059, 4.01817139473493157, 4.00348134633165298, 3.93832559031083296, 2.98601687466391086 ],
	'E': [ -1.95538472218760706, -1.99213680201810628, -1.99484192546206396, -1.62117172555310018 ]
};
var EXP_PENTA_5x5_B = {
	'D': [ 6.40312423743284853, 7.41137464522937961, 6.74088738223369877, 4.11851131024814876, 3.59167230271748039 ],
	'E': [ -4.81106448339810022, -4.36279737526022515, -2.14073121629694807, 8.15186109023340322e-2 ]
};
var EXP_TALL_6x4_Q = {
	'D': [ 3.16227766016837952, 3.04071470972630875, 2.98792005453486142, 2.07088976998553553 ],
	'E': [ -1.92353840616713412, -1.97610091783054509, -1.71255029849665497 ]
};
var EXP_WIDE_4x6_P = {
	'D': [ 2.00006659452261903, 3.00039965363529060, 4.00480480653695992, 5.09901951359278449 ],
	'E': [ 9.99866799866209077e-1, 9.98800239520009292e-1, 9.80580675690920223e-1 ]
};
var EXP_LOWER_4x4_B = {
	'D': [ 2.23606797749978981, 2.86356421265527095, 3.87927576846566469, 4.83101809337084731 ],
	'E': [ -1.34164078649987384, -1.39686059153915632, -1.28890037688081271 ]
};
var EXP_DIAG_4x4_N = {
	'D': [ 2.5, -1.5, 3.5, 4.5 ],
	'E': [ 0.0, 0.0, 0.0 ]
};


// TESTS //

test( 'dgbbrd is a function', function t() {
	assert.strictEqual( typeof dgbbrd, 'function', 'is a function' );
});

test( 'dgbbrd throws TypeError for invalid vect', function t() {
	var AB = new Float64Array( 6 );
	var d = new Float64Array( 2 );
	var e = new Float64Array( 1 );
	var Q = new Float64Array( 4 );
	var PT = new Float64Array( 4 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dgbbrd( 'bogus', 2, 2, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 2, 0, PT, 1, 2, 0, C, 1, 1, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'dgbbrd throws RangeError for negative M', function t() {
	var AB = new Float64Array( 6 );
	var d = new Float64Array( 2 );
	var e = new Float64Array( 1 );
	var Q = new Float64Array( 4 );
	var PT = new Float64Array( 4 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dgbbrd( 'no-vectors', -1, 2, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 2, 0, PT, 1, 2, 0, C, 1, 1, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'dgbbrd throws RangeError for negative N', function t() {
	var AB = new Float64Array( 6 );
	var d = new Float64Array( 2 );
	var e = new Float64Array( 1 );
	var Q = new Float64Array( 4 );
	var PT = new Float64Array( 4 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 4 );
	assert.throws( function throws() {
		dgbbrd( 'no-vectors', 2, -1, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 2, 0, PT, 1, 2, 0, C, 1, 1, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'dgbbrd: tri_5x5_N', function t() {
	var M = 5;
	var N = 5;
	var kl = 1;
	var ku = 1;
	var ldab = kl + ku + 1;
	var AB = new Float64Array( ldab * N );
	var d = new Float64Array( N );
	var e = new Float64Array( N - 1 );
	var Q = new Float64Array( 1 );
	var PT = new Float64Array( 1 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * Math.max( M, N ) );
	var info;
	setAB( AB, ldab, 2, 1, 4.0 ); setAB( AB, ldab, 3, 1, -1.0 );
	setAB( AB, ldab, 1, 2, -1.0 ); setAB( AB, ldab, 2, 2, 4.0 ); setAB( AB, ldab, 3, 2, -1.0 );
	setAB( AB, ldab, 1, 3, -1.0 ); setAB( AB, ldab, 2, 3, 4.0 ); setAB( AB, ldab, 3, 3, -1.0 );
	setAB( AB, ldab, 1, 4, -1.0 ); setAB( AB, ldab, 2, 4, 4.0 ); setAB( AB, ldab, 3, 4, -1.0 );
	setAB( AB, ldab, 1, 5, -1.0 ); setAB( AB, ldab, 2, 5, 4.0 );
	info = dgbbrd( 'no-vectors', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_TRI_5x5_N.D, TOL, 'D' );
	assertArrayClose( e, EXP_TRI_5x5_N.E, TOL, 'E' );
});

test( 'dgbbrd: penta_5x5_B', function t() {
	var M = 5;
	var N = 5;
	var kl = 2;
	var ku = 2;
	var ldab = kl + ku + 1;
	var AB = new Float64Array( ldab * N );
	var d = new Float64Array( N );
	var e = new Float64Array( N - 1 );
	var Q = new Float64Array( M * M );
	var PT = new Float64Array( N * N );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * Math.max( M, N ) );
	var sum0;
	var info;
	var i;
	setAB( AB, ldab, 3, 1, 6.0 ); setAB( AB, ldab, 4, 1, -2.0 ); setAB( AB, ldab, 5, 1, 1.0 );
	setAB( AB, ldab, 2, 2, -2.0 ); setAB( AB, ldab, 3, 2, 6.0 ); setAB( AB, ldab, 4, 2, -2.0 ); setAB( AB, ldab, 5, 2, 1.0 );
	setAB( AB, ldab, 1, 3, 1.0 ); setAB( AB, ldab, 2, 3, -2.0 ); setAB( AB, ldab, 3, 3, 6.0 ); setAB( AB, ldab, 4, 3, -2.0 ); setAB( AB, ldab, 5, 3, 1.0 );
	setAB( AB, ldab, 1, 4, 1.0 ); setAB( AB, ldab, 2, 4, -2.0 ); setAB( AB, ldab, 3, 4, 6.0 ); setAB( AB, ldab, 4, 4, -2.0 );
	setAB( AB, ldab, 1, 5, 1.0 ); setAB( AB, ldab, 2, 5, -2.0 ); setAB( AB, ldab, 3, 5, 6.0 );
	info = dgbbrd( 'both', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_PENTA_5x5_B.D, TOL, 'D' );
	assertArrayClose( e, EXP_PENTA_5x5_B.E, TOL, 'E' );
	sum0 = 0.0;
	for ( i = 0; i < M; i++ ) {
		sum0 += Q[ i ] * Q[ i ];
	}
	assertClose( sum0, 1.0, 1e-12, 'Q col 0 norm' );
});

test( 'dgbbrd: tall_6x4_Q', function t() {
	var M = 6;
	var N = 4;
	var kl = 1;
	var ku = 1;
	var ldab = kl + ku + 1;
	var ncc = 2;
	var AB = new Float64Array( ldab * N );
	var d = new Float64Array( Math.min( M, N ) );
	var e = new Float64Array( Math.min( M, N ) - 1 );
	var Q = new Float64Array( M * M );
	var PT = new Float64Array( 1 );
	var C = new Float64Array( M * ncc );
	var WORK = new Float64Array( 2 * Math.max( M, N ) );
	var info;
	setAB( AB, ldab, 2, 1, 3.0 ); setAB( AB, ldab, 3, 1, -1.0 );
	setAB( AB, ldab, 1, 2, -1.0 ); setAB( AB, ldab, 2, 2, 3.0 ); setAB( AB, ldab, 3, 2, -1.0 );
	setAB( AB, ldab, 1, 3, -1.0 ); setAB( AB, ldab, 2, 3, 3.0 ); setAB( AB, ldab, 3, 3, -1.0 );
	setAB( AB, ldab, 1, 4, -1.0 ); setAB( AB, ldab, 2, 4, 3.0 ); setAB( AB, ldab, 3, 4, -1.0 );
	C[ 0 ] = 1; C[ 1 ] = 3; C[ 2 ] = 5; C[ 3 ] = 7; C[ 4 ] = 9; C[ 5 ] = 11;
	C[ 6 ] = 2; C[ 7 ] = 4; C[ 8 ] = 6; C[ 9 ] = 8; C[ 10 ] = 10; C[ 11 ] = 12;
	info = dgbbrd( 'q-only', M, N, ncc, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, 1, 0, C, 1, M, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_TALL_6x4_Q.D, TOL, 'D' );
	assertArrayClose( e, EXP_TALL_6x4_Q.E, TOL, 'E' );
});

test( 'dgbbrd: wide_4x6_P', function t() {
	var M = 4;
	var N = 6;
	var kl = 0;
	var ku = 1;
	var ldab = kl + ku + 1;
	var AB = new Float64Array( ldab * N );
	var d = new Float64Array( Math.min( M, N ) );
	var e = new Float64Array( Math.min( M, N ) - 1 );
	var Q = new Float64Array( 1 );
	var PT = new Float64Array( N * N );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * Math.max( M, N ) );
	var info;
	setAB( AB, ldab, 2, 1, 2.0 );
	setAB( AB, ldab, 1, 2, 1.0 ); setAB( AB, ldab, 2, 2, 3.0 );
	setAB( AB, ldab, 1, 3, 1.0 ); setAB( AB, ldab, 2, 3, 4.0 );
	setAB( AB, ldab, 1, 4, 1.0 ); setAB( AB, ldab, 2, 4, 5.0 );
	setAB( AB, ldab, 1, 5, 1.0 );
	setAB( AB, ldab, 1, 6, 1.0 );
	info = dgbbrd( 'p-only', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_WIDE_4x6_P.D, TOL, 'D' );
	assertArrayClose( e, EXP_WIDE_4x6_P.E, TOL, 'E' );
});

test( 'dgbbrd: lower_4x4_B', function t() {
	var M = 4;
	var N = 4;
	var kl = 1;
	var ku = 0;
	var ldab = kl + ku + 1;
	var AB = new Float64Array( ldab * N );
	var d = new Float64Array( N );
	var e = new Float64Array( N - 1 );
	var Q = new Float64Array( M * M );
	var PT = new Float64Array( N * N );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * Math.max( M, N ) );
	var info;
	setAB( AB, ldab, 1, 1, 2.0 ); setAB( AB, ldab, 2, 1, -1.0 );
	setAB( AB, ldab, 1, 2, 3.0 ); setAB( AB, ldab, 2, 2, -1.0 );
	setAB( AB, ldab, 1, 3, 4.0 ); setAB( AB, ldab, 2, 3, -1.0 );
	setAB( AB, ldab, 1, 4, 5.0 );
	info = dgbbrd( 'both', M, N, 0, kl, ku, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, M, 0, PT, 1, N, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_LOWER_4x4_B.D, TOL, 'D' );
	assertArrayClose( e, EXP_LOWER_4x4_B.E, TOL, 'E' );
});

test( 'dgbbrd: diag_4x4_N', function t() {
	var M = 4;
	var N = 4;
	var ldab = 1;
	var AB = new Float64Array( ldab * N );
	var d = new Float64Array( N );
	var e = new Float64Array( Math.max( 1, N - 1 ) );
	var Q = new Float64Array( 1 );
	var PT = new Float64Array( 1 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 2 * Math.max( M, N ) );
	var info;
	AB[ 0 ] = 2.5;
	AB[ 1 ] = -1.5;
	AB[ 2 ] = 3.5;
	AB[ 3 ] = 4.5;
	info = dgbbrd( 'no-vectors', M, N, 0, 0, 0, AB, 1, ldab, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( d, EXP_DIAG_4x4_N.D, TOL, 'D' );
});

test( 'dgbbrd: m_zero quick return', function t() {
	var AB = new Float64Array( 12 );
	var d = new Float64Array( 4 );
	var e = new Float64Array( 4 );
	var Q = new Float64Array( 1 );
	var PT = new Float64Array( 1 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 8 );
	var info = dgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgbbrd: n_zero quick return', function t() {
	var AB = new Float64Array( 1 );
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	var Q = new Float64Array( 1 );
	var PT = new Float64Array( 1 );
	var C = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dgbbrd( 'no-vectors', 4, 0, 0, 0, 0, AB, 1, 1, 0, d, 1, 0, e, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});
