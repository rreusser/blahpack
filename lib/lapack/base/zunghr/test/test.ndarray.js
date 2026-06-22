

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgehrd from '../../zgehrd/lib/base.js';
import zunghr from './../lib/ndarray.js';

// FIXTURES //

import _5x5_full from './fixtures/5x5_full.json' with { type: 'json' };
import _5x5_partial from './fixtures/5x5_partial.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import _4x4_full from './fixtures/4x4_full.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extracts a column-major N-by-N complex matrix from A into a flat Float64 array
* (interleaved re/im pairs, column-major order).
*/
function extractColMajor( Av, sa1, sa2, oA, N ) {
	var out = [];
	var ip;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			ip = oA + ( i * sa1 ) + ( j * sa2 );
			out.push( Av[ ip ] );
			out.push( Av[ ip + 1 ] );
		}
	}
	return out;
}

/**
* Runs zgehrd then zunghr and returns the Q matrix as a flat Float64 array
* (interleaved re/im, column-major).
*/
function runZunghr( N, ilo, ihi, AinputFlat ) {
	var WORK = new Complex128Array( 2048 );
	var TAU = new Complex128Array( Math.max( 1, N ) );
	var A = new Complex128Array( N * N );
	var Av = reinterpret( A, 0 );
	var info;
	var i;

	// Copy input (already interleaved re/im) into A
	for ( i = 0; i < AinputFlat.length; i++ ) {
		Av[ i ] = AinputFlat[ i ];
	}

	// Run zgehrd: ilo and ihi are 1-based
	zgehrd( N, ilo, ihi, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0 );

	// Run zunghr
	info = zunghr( N, ilo, ihi, A, 1, N, 0, TAU, 1, 0, WORK, 1, 0, 0 );

	return { Av: Av, info: info };
}

// TESTS //

test( 'zunghr: 5x5_full (ILO=1, IHI=5)', function t() {
	var tc = _5x5_full;
	// Column-major 5x5 complex matrix (interleaved re/im)
	// Same input as Fortran test
	var Ainput = [
		2, 1,   1, 0.5,   3, -1,  1, 0,     4, 1,     // col 1
		1, -0.5, 4, 0,    1, 1,   2, -0.5,   1, 0,     // col 2
		3, 0,   1, -1,    5, 0.5, 1, 0,      2, 1,     // col 3
		1, 1,   2, 0,     1, -0.5, 6, 1,     1, 0.5,   // col 4
		4, -1,  1, 0.5,   2, 0,   1, -1,     7, 0      // col 5
	];
	var result = runZunghr( 5, 1, 5, Ainput );
	var Q = extractColMajor( result.Av, 2, 10, 0, 5 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'zunghr: 5x5_partial (ILO=2, IHI=4)', function t() {
	var tc = _5x5_partial;
	var Ainput = [
		2, 1,   1, 0.5,   3, -1,  1, 0,     4, 1,
		1, -0.5, 4, 0,    1, 1,   2, -0.5,   1, 0,
		3, 0,   1, -1,    5, 0.5, 1, 0,      2, 1,
		1, 1,   2, 0,     1, -0.5, 6, 1,     1, 0.5,
		4, -1,  1, 0.5,   2, 0,   1, -1,     7, 0
	];
	var result = runZunghr( 5, 2, 4, Ainput );
	var Q = extractColMajor( result.Av, 2, 10, 0, 5 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'zunghr: n_zero (N=0)', function t() {
	var WORK = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var info = zunghr( 0, 1, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'zunghr: n_one (N=1)', function t() {
	var tc = n_one;
	var Ainput = [ 99.0, -3.0 ];
	var result = runZunghr( 1, 1, 1, Ainput );
	var Q = extractColMajor( result.Av, 2, 2, 0, 1 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'zunghr: ilo_eq_ihi (ILO=IHI=2, N=4)', function t() {
	var tc = ilo_eq_ihi;
	// Upper triangular-ish complex matrix, column-major
	var Ainput = [
		1, 0,   0, 0,   0, 0,   0, 0,    // col 1
		2, 1,   5, 0,   0, 0,   0, 0,    // col 2
		3, -1,  6, 2,   8, 0,   0, 0,    // col 3
		4, 0.5, 7, -0.5, 9, 1,  10, 0    // col 4
	];
	var result = runZunghr( 4, 2, 2, Ainput );
	var Q = extractColMajor( result.Av, 2, 8, 0, 4 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'zunghr: 4x4_full (ILO=1, IHI=4)', function t() {
	var tc = _4x4_full;
	var Ainput = [
		1, 0.5,    5, -0.5,  9, 1,     13, -1,   // col 1
		2, -1,     6, 1,     10, 0,    14, 2,     // col 2
		3, 0,      7, -2,    11, 1,    15, 0.5,   // col 3
		4, 1,      8, 0,     12, -1,   16, 0      // col 4
	];
	var result = runZunghr( 4, 1, 4, Ainput );
	var Q = extractColMajor( result.Av, 2, 8, 0, 4 );
	assert.equal( result.info, 0, 'INFO' );
	assertArrayClose( Q, tc.Q, 1e-12, 'Q' );
});

test( 'zunghr: unitarity check for 5x5_full', function t() {
	// Check Q^H * Q ≈ I
	var Ainput = [
		2, 1,   1, 0.5,   3, -1,  1, 0,     4, 1,
		1, -0.5, 4, 0,    1, 1,   2, -0.5,   1, 0,
		3, 0,   1, -1,    5, 0.5, 1, 0,      2, 1,
		1, 1,   2, 0,     1, -0.5, 6, 1,     1, 0.5,
		4, -1,  1, 0.5,   2, 0,   1, -1,     7, 0
	];
	var result = runZunghr( 5, 1, 5, Ainput );
	var Av = result.Av;
	var N = 5;
	var sa1 = 2;
	var sa2 = 10;
	var dotRe;
	var dotIm;
	var akiRe;
	var akiIm;
	var akjRe;
	var akjIm;
	var ip;
	var jp;
	var i;
	var j;
	var k;

	// Check Q^H * Q ≈ I
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			dotRe = 0.0;
			dotIm = 0.0;
			for ( k = 0; k < N; k++ ) {
				ip = ( k * sa1 ) + ( i * sa2 );
				jp = ( k * sa1 ) + ( j * sa2 );
				akiRe = Av[ ip ];
				akiIm = Av[ ip + 1 ];
				akjRe = Av[ jp ];
				akjIm = Av[ jp + 1 ];
				// conjg(A(k,i)) * A(k,j)
				dotRe += akiRe * akjRe + akiIm * akjIm;
				dotIm += akiRe * akjIm - akiIm * akjRe;
			}
			if ( i === j ) {
				assertClose( dotRe, 1.0, 1e-12, 'QtQ_re[' + i + ',' + j + ']' );
				assertClose( dotIm, 0.0, 1e-12, 'QtQ_im[' + i + ',' + j + ']' );
			} else {
				assertClose( dotRe, 0.0, 1e-12, 'QtQ_re[' + i + ',' + j + ']' );
				assertClose( dotIm, 0.0, 1e-12, 'QtQ_im[' + i + ',' + j + ']' );
			}
		}
	}
});
