/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztprfb from './../lib/ndarray.js';


// FUNCTIONS //

function assertClose( got, expected, tol, msg ) {
	var bound = tol * Math.max( Math.abs( expected ), 1.0 );
	if ( !( Math.abs( got - expected ) <= bound ) ) {
		throw new Error( msg + ': expected ' + expected + ', got ' + got );
	}
}

function assertArrayClose( got, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( got[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function extractComplex( buf, M, N, lda ) {
	var v = reinterpret( buf, 0 );
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( v[ 2 * ( i + ( j * lda ) ) ] );
			out.push( v[ 2 * ( i + ( j * lda ) ) + 1 ] );
		}
	}
	return out;
}

function fillAll() {
	var V = new Complex128Array( 64 );
	var T = new Complex128Array( 16 );
	var A = new Complex128Array( 16 );
	var B = new Complex128Array( 64 );
	var WORK = new Complex128Array( 64 );
	var v = reinterpret( V, 0 );
	var tt = reinterpret( T, 0 );
	var a = reinterpret( A, 0 );
	var b = reinterpret( B, 0 );
	var k;
	for ( k = 1; k <= 64; k++ ) {
		v[ 2 * ( k - 1 ) ] = 0.1 * k;
		v[ 2 * ( k - 1 ) + 1 ] = -0.05 * k;
	}
	tt[ 0 ] = 1.1; tt[ 1 ] = 0.1;
	tt[ 6 ] = 0.3; tt[ 7 ] = -0.2;
	tt[ 8 ] = 1.2; tt[ 9 ] = -0.1;
	tt[ 12 ] = 0.2; tt[ 13 ] = 0.4;
	tt[ 14 ] = -0.1; tt[ 15 ] = 0.3;
	tt[ 16 ] = 1.3; tt[ 17 ] = 0.05;
	tt[ 2 ] = 0.25; tt[ 3 ] = -0.15;
	tt[ 4 ] = -0.35; tt[ 5 ] = 0.1;
	tt[ 10 ] = 0.45; tt[ 11 ] = 0.2;
	for ( k = 1; k <= 16; k++ ) {
		a[ 2 * ( k - 1 ) ] = 0.5 + ( 0.1 * k );
		a[ 2 * ( k - 1 ) + 1 ] = 0.2 - ( 0.03 * k );
	}
	for ( k = 1; k <= 64; k++ ) {
		b[ 2 * ( k - 1 ) ] = -0.3 + ( 0.07 * k );
		b[ 2 * ( k - 1 ) + 1 ] = 0.15 + ( 0.02 * k );
	}
	return {
		'V': V,
		'T': T,
		'A': A,
		'B': B,
		'WORK': WORK
	};
}


// CONSTANTS //

var TOL = 1e-12;


// FIXTURES //

var FX = {};
FX.ztprfb_col_fwd_left_N = {
	'A': [ 5.99499999999999922e-1, -5.84000000000000408e-1, 9.68999999999999972e-1, -6.42000000000000126e-1, 1.39162499999999945, -1.47837500000000022, -1.65000000000000369e-1, -2.18000000000000016, 1.02249999999999508e-1, -2.29925000000000068, -1.14850000000000074, -3.88762500000000033, -9.29500000000000215e-1, -3.77600000000000069, -7.64500000000000624e-1, -3.95650000000000102, -3.68862500000000093, -6.29687500000000089, -1.69400000000000039, -5.37200000000000166, -1.63124999999999964, -5.61375000000000046, -6.22875000000000156, -8.70612500000000189 ]
};
FX.ztprfb_col_fwd_left_C = {
	'A': [ 1.20999999999999885e-1, -1.58000000000000113e-1, 7.54999999999999893e-1, -1.06550000000000011, 7.94374999999999387e-1, -1.34462500000000018, -2.57500000000000173e-1, -3.91500000000000015e-1, -7.87000000000000366e-1, -2.69300000000000050, -2.26250000000000018, -2.77487500000000020, -6.36000000000000121e-1, -6.25000000000000111e-1, -2.32900000000000063, -4.32050000000000090, -5.31937500000000085, -4.20512500000000067, -1.01450000000000040, -8.58500000000000263e-1, -3.87100000000000000, -5.94800000000000040, -8.37625000000000242, -5.63537500000000158 ]
};
FX.ztprfb_col_fwd_right_N = {
	'A': [ -2.88200000000000123e-1, -2.22400000000000014e-1, -3.54900000000000215e-1, -2.24299999999999999e-1, -4.21599999999999975e-1, -2.26199999999999984e-1, -4.88300000000000289e-1, -2.28100000000000025e-1, -5.55000000000000382e-1, -2.30000000000000010e-1, -2.22880000000000011, -1.66599999999999748e-1, -2.52810000000000024, -4.16999999999998622e-2, -2.82740000000000080, 8.32000000000002043e-2, -3.12670000000000048, 2.08100000000000257e-1, -3.42600000000000016, 3.33000000000000185e-1, -2.87305000000000055, -2.13085000000000013, -3.37960000000000083, -2.21245000000000003, -3.88614999999999977, -2.29404999999999992, -4.39270000000000138, -2.37565000000000026, -4.89925000000000210, -2.45725000000000016 ]
};
FX.ztprfb_col_bwd_left_C = {
	'A': [ 1.42699999999999938e-1, -1.17899999999999977e-1, 6.01549999999999696e-1, -1.42585000000000006, 8.20449999999999680e-1, -1.42315000000000036, -1.05550000000000366e-1, -2.84900000000000209e-1, -1.94045000000000023, -3.12160000000000037, -1.44530000000000047, -3.23065000000000024, -3.53800000000000336e-1, -4.51900000000000412e-1, -4.48245000000000093, -4.81735000000000024, -3.71105000000000107, -5.03815000000000079, -6.02050000000001084e-1, -6.18900000000000339e-1, -7.02444999999999986, -6.51310000000000056, -5.97680000000000078, -6.84565000000000090 ]
};


// TESTS //

test( 'ztprfb is a function', function t() {
	assert.strictEqual( typeof ztprfb, 'function', 'is a function' );
});

test( 'ztprfb: col_fwd_left_N', function t() {
	var b = fillAll();
	ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assertArrayClose( extractComplex( b.A, 3, 4, 3 ), FX.ztprfb_col_fwd_left_N.A, TOL, 'A' );
});

test( 'ztprfb: col_fwd_left_C', function t() {
	var b = fillAll();
	ztprfb( 'left', 'conjugate-transpose', 'forward', 'columnwise', 5, 4, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assertArrayClose( extractComplex( b.A, 3, 4, 3 ), FX.ztprfb_col_fwd_left_C.A, TOL, 'A' );
});

test( 'ztprfb: col_fwd_right_N', function t() {
	var b = fillAll();
	ztprfb( 'right', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, b.V, 1, 4, 0, b.T, 1, 3, 0, b.A, 1, 5, 0, b.B, 1, 5, 0, b.WORK, 1, 5, 0 );
	assertArrayClose( extractComplex( b.A, 5, 3, 5 ), FX.ztprfb_col_fwd_right_N.A, TOL, 'A' );
});

test( 'ztprfb: col_bwd_left_C', function t() {
	var b = fillAll();
	ztprfb( 'left', 'conjugate-transpose', 'backward', 'columnwise', 5, 4, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assertArrayClose( extractComplex( b.A, 3, 4, 3 ), FX.ztprfb_col_bwd_left_C.A, TOL, 'A' );
});

test( 'ztprfb: col_bwd_right_N', function t() {
	var b = fillAll();
	ztprfb( 'right', 'no-transpose', 'backward', 'columnwise', 5, 4, 3, 2, b.V, 1, 4, 0, b.T, 1, 3, 0, b.A, 1, 5, 0, b.B, 1, 5, 0, b.WORK, 1, 5, 0 );
	assert.notStrictEqual( reinterpret( b.A, 0 )[ 0 ], 0.6 );
});

test( 'ztprfb: row_fwd_left_N', function t() {
	var b = fillAll();
	ztprfb( 'left', 'no-transpose', 'forward', 'rowwise', 5, 4, 3, 2, b.V, 1, 3, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 5, 0 );
	assert.notStrictEqual( reinterpret( b.A, 0 )[ 0 ], 0.6 );
});

test( 'ztprfb: row_fwd_right_C', function t() {
	var b = fillAll();
	ztprfb( 'right', 'conjugate-transpose', 'forward', 'rowwise', 5, 4, 3, 2, b.V, 1, 3, 0, b.T, 1, 3, 0, b.A, 1, 5, 0, b.B, 1, 5, 0, b.WORK, 1, 5, 0 );
	assert.notStrictEqual( reinterpret( b.A, 0 )[ 0 ], 0.6 );
});

test( 'ztprfb: row_bwd_left_N', function t() {
	var b = fillAll();
	ztprfb( 'left', 'no-transpose', 'backward', 'rowwise', 5, 4, 3, 2, b.V, 1, 3, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assert.notStrictEqual( reinterpret( b.A, 0 )[ 0 ], 0.6 );
});

test( 'ztprfb: row_bwd_right_C', function t() {
	var b = fillAll();
	ztprfb( 'right', 'conjugate-transpose', 'backward', 'rowwise', 5, 4, 3, 2, b.V, 1, 3, 0, b.T, 1, 3, 0, b.A, 1, 5, 0, b.B, 1, 5, 0, b.WORK, 1, 5, 0 );
	assert.notStrictEqual( reinterpret( b.A, 0 )[ 0 ], 0.6 );
});

test( 'ztprfb: quick return M=0', function t() {
	var b = fillAll();
	var beforeA0 = reinterpret( b.A, 0 )[ 0 ];
	ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 4, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assert.strictEqual( reinterpret( b.A, 0 )[ 0 ], beforeA0 );
});

test( 'ztprfb: quick return N=0', function t() {
	var b = fillAll();
	var beforeA0 = reinterpret( b.A, 0 )[ 0 ];
	ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 5, 0, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assert.strictEqual( reinterpret( b.A, 0 )[ 0 ], beforeA0 );
});

test( 'ztprfb: quick return K=0', function t() {
	var b = fillAll();
	var beforeA0 = reinterpret( b.A, 0 )[ 0 ];
	ztprfb( 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 0, 0, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	assert.strictEqual( reinterpret( b.A, 0 )[ 0 ], beforeA0 );
});

test( 'ztprfb throws TypeError for invalid side', function t() {
	var b = fillAll();
	assert.throws( function throws() {
		ztprfb( 'invalid', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid trans', function t() {
	var b = fillAll();
	assert.throws( function throws() {
		ztprfb( 'left', 'invalid', 'forward', 'columnwise', 5, 4, 3, 2, b.V, 1, 5, 0, b.T, 1, 3, 0, b.A, 1, 3, 0, b.B, 1, 5, 0, b.WORK, 1, 3, 0 );
	}, TypeError );
});
