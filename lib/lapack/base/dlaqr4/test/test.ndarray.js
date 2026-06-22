/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr4 from './../lib/ndarray.js';

// FIXTURES //

import _6x6_wantt_wantz from './fixtures/6x6_wantt_wantz.json' with { type: 'json' };
import _6x6_wantt_no_wantz from './fixtures/6x6_wantt_no_wantz.json' with { type: 'json' };
import _6x6_no_wantt_no_wantz from './fixtures/6x6_no_wantt_no_wantz.json' with { type: 'json' };
import _15x15_wantt_wantz from './fixtures/15x15_wantt_wantz.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };
import _6x6_partial_ilo_2_ihi_5 from './fixtures/6x6_partial_ilo_2_ihi_5.json' with { type: 'json' };
import _20x20_wantt_wantz from './fixtures/20x20_wantt_wantz.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Sort eigenvalues by real part, then imaginary part, for comparison.
*/
function sortedEigs( wr, wi ) {
	var eigs = [];
	var i;
	for ( i = 0; i < wr.length; i++ ) {
		eigs.push({
			're': wr[ i ],
			'im': wi[ i ]
		});
	}
	eigs.sort( function cmp( a, b ) {
		if ( a.re !== b.re ) {
			return a.re - b.re;
		}
		return a.im - b.im;
	});
	return eigs;
}

/**
* AssertEigenvaluesClose.
*
* @private
* @param {*} wrActual - wrActual
* @param {*} wiActual - wiActual
* @param {*} wrExpected - wrExpected
* @param {*} wiExpected - wiExpected
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertEigenvaluesClose( wrActual, wiActual, wrExpected, wiExpected, tol, msg ) { // eslint-disable-line max-len
	var expected = sortedEigs( wrExpected, wiExpected );
	var actual = sortedEigs( wrActual, wiActual );
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ].re, expected[ i ].re, tol, msg + '.re[' + i + ']' );
		assertClose( actual[ i ].im, expected[ i ].im, tol, msg + '.im[' + i + ']' );
	}
}

/**
* Build an NxN column-major matrix (strideH1=1, strideH2=N).
*/
function buildHessenberg6x6() {
	var N = 6;
	var H = new Float64Array( N * N );
	H[ 0 + 0*N ] = 4.0; H[ 0 + 1*N ] = 1.0; H[ 0 + 2*N ] = 0.5; H[ 0 + 3*N ] = 0.2; H[ 0 + 4*N ] = 0.1; H[ 0 + 5*N ] = 0.05; // eslint-disable-line max-len
	H[ 1 + 0*N ] = 1.0; H[ 1 + 1*N ] = 3.0; H[ 1 + 2*N ] = 1.0; H[ 1 + 3*N ] = 0.3; H[ 1 + 4*N ] = 0.2; H[ 1 + 5*N ] = 0.1; // eslint-disable-line max-len
	H[ 2 + 1*N ] = 0.8; H[ 2 + 2*N ] = 2.0; H[ 2 + 3*N ] = 1.0; H[ 2 + 4*N ] = 0.4; H[ 2 + 5*N ] = 0.2; // eslint-disable-line max-len
	H[ 3 + 2*N ] = 0.6; H[ 3 + 3*N ] = 1.0; H[ 3 + 4*N ] = 0.5; H[ 3 + 5*N ] = 0.3;
	H[ 4 + 3*N ] = 0.4; H[ 4 + 4*N ] = -1.0; H[ 4 + 5*N ] = 1.0;
	H[ 5 + 4*N ] = 0.3; H[ 5 + 5*N ] = -2.0;
	return H;
}

/**
* IdentityMatrix.
*
* @private
* @param {*} N - N
* @returns {*} result
*/
function identityMatrix( N ) {
	var Z = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Z[ i + i*N ] = 1.0;
	}
	return Z;
}

/**
* Verify Z^T * Z is approximately the identity (orthogonality check).
*/
function verifyOrthogonal( Z, N, tol, msg ) {
	var sum;
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < N; k++ ) {
				sum += Z[ k + i * N ] * Z[ k + j * N ];
			}
			assertClose( sum, ( i === j ) ? 1.0 : 0.0, tol, msg + ' ZtZ(' + i + ',' + j + ')' ); // eslint-disable-line max-len
		}
	}
}

/**
* Verify that H is quasi-upper-triangular (all subdiagonal elements are zero.
* except for 2x2 blocks).
*/
function verifyQuasiTriangular( H, N, tol, msg ) {
	var i;
	for ( i = 1; i < N; i++ ) {
		// H(i, i-1) can be nonzero only if it's part of a 2x2 block
		if ( Math.abs( H[ i + ( i - 1 ) * N ] ) > tol ) {
			// This is a 2x2 block -- verify the element below it is zero
			if ( i + 1 < N ) {
				assert.ok(Math.abs( H[ ( i + 1 ) + i * N ] ) <= tol, msg + ': consecutive 2x2 blocks at row ' + i);
			}
		}
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dlaqr4: 6x6 wantt=true wantz=true', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = _6x6_wantt_wantz;
	N = 6;
	H = buildHessenberg6x6();
	Z = identityMatrix( N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 10000 );
	info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10000 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr4: 6x6 wantt=true wantz=false', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = _6x6_wantt_no_wantz;
	N = 6;
	H = buildHessenberg6x6();
	Z = new Float64Array( N * N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 10000 );
	info = dlaqr4( true, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10000 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
});

test( 'dlaqr4: 6x6 wantt=false wantz=false (eigenvalues only)', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = _6x6_no_wantt_no_wantz;
	N = 6;
	H = buildHessenberg6x6();
	Z = new Float64Array( N * N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 10000 );
	info = dlaqr4( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10000 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
});

test( 'dlaqr4: 15x15 wantt=true wantz=true (multishift path)', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var i;
	var j;
	var Z;

	tc = _15x15_wantt_wantz;
	N = 15;
	H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( N - i ) * 1.0;
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 1.0;
		}
		for ( j = i + 1; j < N; j++ ) {
			H[ i + j*N ] = 0.5 / ( j - i );
		}
	}
	Z = identityMatrix( N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 10000 );
	info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10000 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-10, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-10, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-10, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-10, 'Z' );
});

test( 'dlaqr4: N=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var H;
	var Z;

	tc = n_0;
	H = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WR = new Float64Array( 1 );
	WI = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dlaqr4( true, true, 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 0, Z, 1, 1, 0, WORK, 1, 0, 1 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'dlaqr4: N=1 trivial', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	N = 1;
	H = new Float64Array([ 7.0 ]);
	Z = new Float64Array([ 1.0 ]);
	WR = new Float64Array( 1 );
	WI = new Float64Array( 1 );
	WORK = new Float64Array( 10 );
	info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 ); // eslint-disable-line max-len
	tc = n_1;
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( WR[ 0 ], tc.WR1, 1e-14, 'WR[0]' );
	assertClose( WI[ 0 ], tc.WI1, 1e-14, 'WI[0]' );
});

test( 'dlaqr4: 6x6 partial range ilo=2 ihi=5', function t() {
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	tc = _6x6_partial_ilo_2_ihi_5;
	N = 6;
	H = new Float64Array( N * N );
	H[ 0 + 0*N ] = 10.0;
	H[ 0 + 1*N ] = 0.5;
	H[ 0 + 2*N ] = 0.3;
	H[ 0 + 3*N ] = 0.2;
	H[ 0 + 4*N ] = 0.1;
	H[ 0 + 5*N ] = 0.05;
	H[ 1 + 1*N ] = 4.0;
	H[ 1 + 2*N ] = 1.0;
	H[ 1 + 3*N ] = 0.3;
	H[ 1 + 4*N ] = 0.2;
	H[ 1 + 5*N ] = 0.1;
	H[ 2 + 1*N ] = 0.8;
	H[ 2 + 2*N ] = 3.0;
	H[ 2 + 3*N ] = 0.5;
	H[ 2 + 4*N ] = 0.3;
	H[ 2 + 5*N ] = 0.15;
	H[ 3 + 2*N ] = 0.6;
	H[ 3 + 3*N ] = 2.0;
	H[ 3 + 4*N ] = 0.4;
	H[ 3 + 5*N ] = 0.2;
	H[ 4 + 3*N ] = 0.4;
	H[ 4 + 4*N ] = 1.0;
	H[ 4 + 5*N ] = 0.3;
	H[ 5 + 5*N ] = -5.0;
	Z = identityMatrix( N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 10000 );
	info = dlaqr4( true, true, N, 2, 5, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10000 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr4: 20x20 wantt=true wantz=true (multishift, N > NTINY)', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var tc;
	var WR;
	var WI;
	var N;
	var H;
	var i;
	var j;
	var Z;

	tc = _20x20_wantt_wantz;
	N = 20;
	H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( N - i ) * 2.0;
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 1.0;
		}
		for ( j = i + 1; j < N; j++ ) {
			H[ i + j*N ] = 0.3 / ( j - i );
		}
	}
	Z = identityMatrix( N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 100000 );
	info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 100000 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (converged)' );
	verifyOrthogonal( Z, N, 1e-10, 'Z orthogonal' );
	verifyQuasiTriangular( H, N, 1e-8, 'H quasi-triangular' );
});

test( 'dlaqr4: 20x20 eigenvalues only (no wantt, no wantz, multishift)', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var WR;
	var WI;
	var N;
	var H;
	var i;
	var j;
	var Z;

	N = 20;
	H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( N - i ) * 2.0;
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 1.0;
		}
		for ( j = i + 1; j < N; j++ ) {
			H[ i + j*N ] = 0.3 / ( j - i );
		}
	}
	Z = new Float64Array( N * N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 100000 );
	info = dlaqr4( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 100000 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (converged)' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( isFinite( WR[ i ] ), 'WR[' + i + '] is finite' );
		assert.ok( isFinite( WI[ i ] ), 'WI[' + i + '] is finite' );
	}
});

test( 'dlaqr4: 40x40 exercises multishift path (property-based)', function t() {
	var WORK;
	var info;
	var WR;
	var WI;
	var N;
	var H;
	var i;
	var j;
	var Z;

	N = 40;
	H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( i + 1 ) * 1.5 + 0.1 * ( ( ( i + 1 ) * 7 ) % 13 );
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 0.8;
		}
		for ( j = i + 1; j < Math.min( i + 6, N ); j++ ) {
			H[ i + j*N ] = 0.2 / ( j - i );
		}
	}
	Z = identityMatrix( N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 100000 );
	info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 100000 ); // eslint-disable-line max-len
	assert.ok( info >= 0, 'info is non-negative' );
});

test( 'dlaqr4: 30x30 partial range exercises multishift + partial (property-based)', function t() { // eslint-disable-line max-len
	var WORK;
	var info;
	var WR;
	var WI;
	var N;
	var H;
	var i;
	var j;
	var Z;

	N = 30;
	H = new Float64Array( N * N );
	for ( i = 0; i < 4; i++ ) {
		H[ i + i*N ] = 101 + i;
	}
	for ( i = 25; i < 30; i++ ) {
		H[ i + i*N ] = -101 - i;
	}
	for ( i = 5; i <= 25; i++ ) {
		H[ ( i - 1 ) + ( i - 1 )*N ] = i * 1.5;
		if ( i < 25 ) {
			H[ i + ( i - 1 )*N ] = 0.7;
		}
		for ( j = i + 1; j <= Math.min( i + 4, 25 ); j++ ) {
			H[ ( i - 1 ) + ( j - 1 )*N ] = 0.25 / ( j - i );
		}
	}
	H[ 3 + 4*N ] = 0.3;
	H[ 24 + 25*N ] = 0.3;
	Z = identityMatrix( N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 100000 );
	info = dlaqr4( true, true, N, 5, 25, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 100000 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (converged)' );
	verifyQuasiTriangular( H, N, 1e-8, 'H quasi-triangular' );
});

test( 'dlaqr4: workspace query (lwork=-1)', function t() {
	var WORK;
	var info;
	var WR;
	var WI;
	var N;
	var H;
	var Z;

	N = 20;
	H = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	WORK = new Float64Array( 1 );
	info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, -1 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
	assert.ok( WORK[ 0 ] >= 1, 'workspace query returns positive value' );
});
