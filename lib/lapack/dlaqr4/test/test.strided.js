/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr4 from './../lib/strided.js';
import dlaqr0 from './../../dlaqr0/lib/strided.js';
import dhseqr from './../../dhseqr/lib/strided.js';
import { importWithConstants } from '../../../../test/harness/constants.js';

// FIXTURES //

import _6x6_wantt_wantz from './fixtures/6x6_wantt_wantz.json' with { type: 'json' };
import _6x6_wantt_no_wantz from './fixtures/6x6_wantt_no_wantz.json' with { type: 'json' };
import _6x6_no_wantt_no_wantz from './fixtures/6x6_no_wantt_no_wantz.json' with { type: 'json' };
import _40x40_wantt_wantz from './fixtures/40x40_wantt_wantz.json' with { type: 'json' };
import _80x80_wantt_wantz from './fixtures/80x80_wantt_wantz.json' with { type: 'json' };
import _15x15_wantt_wantz from './fixtures/15x15_wantt_wantz.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };
import _6x6_partial_ilo_2_ihi_5 from './fixtures/6x6_partial_ilo_2_ihi_5.json' with { type: 'json' };

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build an NxN column-major matrix (strideH1=1, strideH2=N).
*/
function buildHessenberg6x6() {
	const N = 6;
	const H = new Float64Array( N * N );
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
	const Z = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Z[ i + i*N ] = 1.0;
	}
	return Z;
}

/**
* Verify Z^T * Z is approximately the identity (orthogonality check).
*/
function verifyOrthogonal( Z, N, tol, msg ) {
	let sum, i, j, k;
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
	let i;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Returns a pseudo-random upper Hessenberg matrix (column-major).
*
* @private
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} seed - generator seed
* @returns {Float64Array} matrix
*/
function randomHessenberg( N, seed ) {
	const H = new Float64Array( N * N );
	let s = seed;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= Math.min( j + 1, N - 1 ); i++ ) {
			s = ( s * 16807 ) % 2147483647;
			H[ i + ( j * N ) ] = ( s / 2147483647 ) - 0.5;
		}
	}
	return H;
}

/**
* Returns the N-by-N cyclic permutation matrix (ones on the subdiagonal and in the top-right corner); its eigenvalues are the N-th roots of unity.
*
* @private
* @param {PositiveInteger} N - order
* @returns {Float64Array} matrix
*/
function cyclicPermutation( N ) {
	const H = new Float64Array( N * N );
	let i;
	for ( i = 1; i < N; i++ ) {
		H[ i + ( ( i - 1 ) * N ) ] = 1.0;
	}
	H[ ( N - 1 ) * N ] = 1.0;
	return H;
}

/**
* Returns the Frobenius norm of an N-by-N matrix.
*
* @private
* @param {Float64Array} A - matrix
* @returns {number} norm
*/
function frob( A ) {
	let s = 0.0;
	let i;
	for ( i = 0; i < A.length; i++ ) {
		s += A[ i ] * A[ i ];
	}
	return Math.sqrt( s );
}

/**
* Returns the upper Hessenberg part of `H` (entries below the first subdiagonal are workspace on exit).
*
* @private
* @param {Float64Array} H - matrix
* @param {PositiveInteger} N - order
* @returns {Float64Array} copy with zeros below the first subdiagonal
*/
function hessPart( H, N ) {
	const T = new Float64Array( H );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 2; i < N; i++ ) {
			T[ i + ( j * N ) ] = 0.0;
		}
	}
	return T;
}

/**
* Asserts that `Z` is orthogonal and that `Z^T * H0 * Z` equals the Hessenberg part `T` of `H` within `1e-12 * N * ||H0||`.
*
* @private
* @param {Float64Array} H0 - original matrix
* @param {Float64Array} H - matrix on exit
* @param {Float64Array} Z - orthogonal factor on exit
* @param {PositiveInteger} N - order
* @param {string} msg - message prefix
* @returns {Float64Array} T
*/
function assertSimilar( H0, H, Z, N, msg ) {
	const tol = 1e-12 * N;
	const T = hessPart( H, N );
	const W = new Float64Array( N * N );
	const R = new Float64Array( N * N );
	let err;
	let s;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Z[ k + ( i * N ) ] * Z[ k + ( j * N ) ];
			}
			R[ i + ( j * N ) ] = s - ( ( i === j ) ? 1.0 : 0.0 );
		}
	}
	err = frob( R );
	assert.ok( err <= tol, msg + ': ||Z^T*Z - I|| = ' + err );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += H0[ i + ( k * N ) ] * Z[ k + ( j * N ) ];
			}
			W[ i + ( j * N ) ] = s;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			s = 0.0;
			for ( k = 0; k < N; k++ ) {
				s += Z[ k + ( i * N ) ] * W[ k + ( j * N ) ];
			}
			R[ i + ( j * N ) ] = s - T[ i + ( j * N ) ];
		}
	}
	err = frob( R );
	assert.ok( err <= tol * Math.max( frob( H0 ), 1.0 ), msg + ': ||Z^T*H0*Z - T|| = ' + err );
	return T;
}

/**
* Asserts that `T` is in standardized real Schur form (1x1 and 2x2 diagonal blocks, each 2x2 block with equal diagonal and off-diagonals of opposite sign) and that `WR + i*WI` are the eigenvalues of its diagonal blocks.
*
* @private
* @param {Float64Array} T - quasi-upper-triangular matrix
* @param {PositiveInteger} N - order
* @param {Float64Array} WR - real parts
* @param {Float64Array} WI - imaginary parts
* @param {string} msg - message prefix
*/
function assertRealSchur( T, N, WR, WI, msg ) {
	let tol;
	let a;
	let b;
	let c;
	let i;
	i = 0;
	while ( i < N ) {
		tol = 1e-13 * Math.max( Math.abs( T[ i + ( i * N ) ] ), 1.0 );
		if ( i === N - 1 || T[ ( i + 1 ) + ( i * N ) ] === 0.0 ) {
			assert.ok( Math.abs( WR[ i ] - T[ i + ( i * N ) ] ) <= tol, msg + ': WR[' + i + ']' );
			assert.strictEqual( WI[ i ], 0.0, msg + ': WI[' + i + ']' );
			i += 1;
		} else {
			assert.ok( i + 2 >= N || T[ ( i + 2 ) + ( ( i + 1 ) * N ) ] === 0.0, msg + ': consecutive 2x2 blocks at ' + i );
			a = T[ i + ( i * N ) ];
			b = T[ i + ( ( i + 1 ) * N ) ];
			c = T[ ( i + 1 ) + ( i * N ) ];
			assert.strictEqual( a, T[ ( i + 1 ) + ( ( i + 1 ) * N ) ], msg + ': 2x2 block at ' + i + ' has equal diagonal' );
			assert.ok( b * c < 0.0, msg + ': 2x2 block at ' + i + ' has complex eigenvalues' );
			assert.ok( Math.abs( WR[ i ] - a ) <= tol && Math.abs( WR[ i + 1 ] - a ) <= tol, msg + ': WR at ' + i );
			assert.ok( Math.abs( WI[ i ] - Math.sqrt( -b * c ) ) <= tol, msg + ': WI[' + i + ']' );
			assert.ok( WI[ i ] > 0.0 && WI[ i + 1 ] === -WI[ i ], msg + ': conjugate pair at ' + i );
			i += 2;
		}
	}
}

/**
* Asserts that two lists of complex numbers are equal as multisets, within a tolerance.
*
* @private
* @param {Array<Array<number>>} actual - list of [re, im] pairs
* @param {Array<Array<number>>} expected - list of [re, im] pairs
* @param {number} tol - absolute tolerance
* @param {string} msg - message prefix
*/
function assertSameEigenvalues( actual, expected, tol, msg ) {
	const used = [];
	let best;
	let bd;
	let d;
	let i;
	let j;
	assert.strictEqual( actual.length, expected.length, msg + ': count' );
	for ( i = 0; i < expected.length; i++ ) {
		best = -1;
		bd = Infinity;
		for ( j = 0; j < actual.length; j++ ) {
			d = Math.hypot( actual[ j ][ 0 ] - expected[ i ][ 0 ], actual[ j ][ 1 ] - expected[ i ][ 1 ] );
			if ( !used[ j ] && d < bd ) {
				bd = d;
				best = j;
			}
		}
		assert.ok( bd <= tol, msg + ': eigenvalue ' + expected[ i ] + ' unmatched (distance ' + bd + ')' );
		used[ best ] = true;
	}
}

/**
* Zips real and imaginary parts into a list of pairs.
*
* @private
* @param {Float64Array} re - real parts
* @param {Float64Array} im - imaginary parts
* @param {NonNegativeInteger} from - first index
* @param {NonNegativeInteger} to - one past the last index
* @returns {Array<Array<number>>} pairs
*/
function pairs( re, im, from, to ) {
	const out = [];
	let i;
	for ( i = from; i < to; i++ ) {
		out.push( [ re[ i ], im[ i ] ] );
	}
	return out;
}

/**
* Runs dlaqr4 on a copy of `H0` over the full range with `Z = I`.
*
* @private
* @param {Function} fcn - dlaqr4 implementation
* @param {boolean} wantt - compute the Schur form
* @param {boolean} wantz - compute the Schur vectors
* @param {Float64Array} H0 - input matrix
* @param {PositiveInteger} N - order
* @returns {Object} results
*/
function runFull( fcn, wantt, wantz, H0, N ) {
	const H = new Float64Array( H0 );
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 3 * N * N );
	const info = fcn( wantt, wantz, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 );
	return {
		'info': info,
		'H': H,
		'Z': Z,
		'WR': WR,
		'WI': WI
	};
}


// TESTS //

test( 'dlaqr4: 6x6 wantt=true wantz=true', function t() {

	const tc = _6x6_wantt_wantz;
	const N = 6;
	const H = buildHessenberg6x6();
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 10000 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr4: 6x6 wantt=true wantz=false', function t() {

	const tc = _6x6_wantt_no_wantz;
	const N = 6;
	const H = buildHessenberg6x6();
	const Z = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 10000 );
	const info = dlaqr4( true, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
});

test( 'dlaqr4: 6x6 wantt=false wantz=false (eigenvalues only)', function t() {

	const tc = _6x6_no_wantt_no_wantz;
	const N = 6;
	const H = buildHessenberg6x6();
	const Z = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 10000 );
	const info = dlaqr4( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
});

test( 'dlaqr4: 15x15 wantt=true wantz=true (multishift path)', function t() {
	let i, j;

	const tc = _15x15_wantt_wantz;
	const N = 15;
	const H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( N - i ) * 1.0;
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 1.0;
		}
		for ( j = i + 1; j < N; j++ ) {
			H[ i + j*N ] = 0.5 / ( j - i );
		}
	}
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 10000 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-10, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-10, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-10, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-10, 'Z' );
});

test( 'dlaqr4: N=0 quick return', function t() {

	const tc = n_0;
	const H = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dlaqr4( true, true, 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
});

test( 'dlaqr4: N=1 trivial', function t() {

	const N = 1;
	const H = new Float64Array([ 7.0 ]);
	const Z = new Float64Array([ 1.0 ]);
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const WORK = new Float64Array( 10 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	const tc = n_1;
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( WR[ 0 ], tc.WR1, 1e-14, 'WR[0]' );
	assertClose( WI[ 0 ], tc.WI1, 1e-14, 'WI[0]' );
});

test( 'dlaqr4: 6x6 partial range ilo=2 ihi=5', function t() {

	const tc = _6x6_partial_ilo_2_ihi_5;
	const N = 6;
	const H = new Float64Array( N * N );
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
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 10000 );
	const info = dlaqr4( true, true, N, 2, 5, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-12, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-12, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-12, 'H' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dlaqr4: 20x20 wantt=true wantz=true (multishift, N > NTINY)', function t() { // eslint-disable-line max-len
	let i, j;

	const N = 20;
	const H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( N - i ) * 2.0;
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 1.0;
		}
		for ( j = i + 1; j < N; j++ ) {
			H[ i + j*N ] = 0.3 / ( j - i );
		}
	}
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 100000 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (converged)' );
	verifyOrthogonal( Z, N, 1e-10, 'Z orthogonal' );
	verifyQuasiTriangular( H, N, 1e-8, 'H quasi-triangular' );
});

test( 'dlaqr4: 20x20 eigenvalues only (no wantt, no wantz, multishift)', function t() { // eslint-disable-line max-len
	let i, j;

	const N = 20;
	const H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( N - i ) * 2.0;
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 1.0;
		}
		for ( j = i + 1; j < N; j++ ) {
			H[ i + j*N ] = 0.3 / ( j - i );
		}
	}
	const Z = new Float64Array( N * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 100000 );
	const info = dlaqr4( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (converged)' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( isFinite( WR[ i ] ), 'WR[' + i + '] is finite' );
		assert.ok( isFinite( WI[ i ] ), 'WI[' + i + '] is finite' );
	}
});

test( 'dlaqr4: 40x40 exercises multishift path (property-based)', function t() {
	let i, j;

	const N = 40;
	const H = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		H[ i + i*N ] = ( i + 1 ) * 1.5 + 0.1 * ( ( ( i + 1 ) * 7 ) % 13 );
		if ( i < N - 1 ) {
			H[ ( i + 1 ) + i*N ] = 0.8;
		}
		for ( j = i + 1; j < Math.min( i + 6, N ); j++ ) {
			H[ i + j*N ] = 0.2 / ( j - i );
		}
	}
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 100000 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.ok( info >= 0, 'info is non-negative' );
});

test( 'dlaqr4: 30x30 partial range exercises multishift + partial (property-based)', function t() { // eslint-disable-line max-len
	let i, j;

	const N = 30;
	const H = new Float64Array( N * N );
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
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 100000 );
	const info = dlaqr4( true, true, N, 5, 25, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (converged)' );
	verifyQuasiTriangular( H, N, 1e-8, 'H quasi-triangular' );
});

test( 'dlaqr4: pre-split matrix (H(ks,ks-1)=0) is processed as two independent blocks', function t() { // eslint-disable-line max-len
	// With an exact zero at H(ks,ks-1), the reference algorithm locates the active block as KTOP = ks (Fortran `GO TO 20` skips `K = ILO`), so a single call over 1:N must equal the bottom block solved alone (ilo=ks) followed by the top block (ihi=ks-1), bit for bit. // eslint-disable-line max-len
	const LWORK = 10000;
	const N = 20;
	const ks = 11;
	let info2;
	let info;
	let i;
	let j;

	function build() {
		const H = new Float64Array( N * N );
		let r;
		let c;
		for ( c = 1; c <= N; c++ ) {
			for ( r = 1; r <= Math.min( c + 1, N ); r++ ) {
				H[ ( r - 1 ) + ( ( c - 1 ) * N ) ] = Math.sin( ( r * 1.7 ) + ( c * 0.3 ) ) + ( ( r === c + 1 ) ? 1.5 : 0.0 ); // eslint-disable-line max-len
			}
		}
		H[ ( ks - 1 ) + ( ( ks - 2 ) * N ) ] = 0.0;
		return H;
	}

	// Single call over the whole matrix:
	const H1 = build();
	const Z1 = identityMatrix( N );
	const WR1 = new Float64Array( N );
	const WI1 = new Float64Array( N );
	info = dlaqr4( true, true, N, 1, N, H1, 1, N, 0, WR1, 1, 0, WI1, 1, 0, 1, N, Z1, 1, N, 0, new Float64Array( LWORK ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info (single call)' );

	// Bottom block alone (ilo > 1), then the top block:
	const H2 = build();
	const Z2 = identityMatrix( N );
	const WR2 = new Float64Array( N );
	const WI2 = new Float64Array( N );
	info2 = dlaqr4( true, true, N, ks, N, H2, 1, N, 0, WR2, 1, 0, WI2, 1, 0, 1, N, Z2, 1, N, 0, new Float64Array( LWORK ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info2, 0, 'info (bottom block, ilo > 1)' );
	info2 = dlaqr4( true, true, N, 1, ks - 1, H2, 1, N, 0, WR2, 1, 0, WI2, 1, 0, 1, N, Z2, 1, N, 0, new Float64Array( LWORK ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info2, 0, 'info (top block)' );

	assert.strictEqual( H1[ ( ks - 1 ) + ( ( ks - 2 ) * N ) ], 0.0, 'split preserved' ); // eslint-disable-line max-len
	for ( i = 0; i < N; i++ ) {
		assert.strictEqual( WR1[ i ], WR2[ i ], 'WR[' + i + ']' );
		assert.strictEqual( WI1[ i ], WI2[ i ], 'WI[' + i + ']' );
		for ( j = 0; j < N; j++ ) {
			// Below the first subdiagonal H is workspace; compare only the Schur form.
			if ( i <= j + 1 ) {
				assert.strictEqual( H1[ i + ( j * N ) ], H2[ i + ( j * N ) ], 'H[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			}
			assert.strictEqual( Z1[ i + ( j * N ) ], Z2[ i + ( j * N ) ], 'Z[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
});

test( 'dlaqr4: matches dlaqr0 bit for bit while every deflation window is at most 12 (shift pairing after the shift sort)', function t() { // eslint-disable-line max-len
	// The reference DLAQR4 and DLAQR0 are the same algorithm apart from the AED routine (DLAQR2 vs DLAQR3), which coincide whenever the deflation window never exceeds the DLAQR3 recursion crossover (12 in this port); ILAENV parameters are identical. With N=24, NWMAX = (N-1)/3 = 7, so both calls must agree exactly. The Hessenberg matrix has mixed real and complex-conjugate eigenvalues, so the AED shift sets returned to the shift-selection code contain both kinds, and the "shuffle shifts into pairs" loop (which runs after the bubble sort whether or not the sort exits early via `GO TO 60`) reorders them.
	const LWORK = 10000;
	const N = 24;
	let ncplx;
	let i;
	let j;

	function build() {
		const H = new Float64Array( N * N );
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= Math.min( N - 1, j + 1 ); i++ ) {
				H[ i + ( j * N ) ] = Math.sin( ( ( i + 1 ) * ( i + 1 ) * 0.37 ) + ( ( j + 1 ) * 1.31 ) ); // eslint-disable-line max-len
			}
		}
		return H;
	}

	const H4 = build();
	const Z4 = identityMatrix( N );
	const WR4 = new Float64Array( N );
	const WI4 = new Float64Array( N );
	const info4 = dlaqr4( true, true, N, 1, N, H4, 1, N, 0, WR4, 1, 0, WI4, 1, 0, 1, N, Z4, 1, N, 0, new Float64Array( LWORK ), 1, 0 ); // eslint-disable-line max-len
	const H0 = build();
	const Z0 = identityMatrix( N );
	const WR0 = new Float64Array( N );
	const WI0 = new Float64Array( N );
	const info0 = dlaqr0( true, true, N, 1, N, H0, 1, N, 0, WR0, 1, 0, WI0, 1, 0, 1, N, Z0, 1, N, 0, new Float64Array( LWORK ), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info4, 0, 'info (dlaqr4)' );
	assert.strictEqual( info0, 0, 'info (dlaqr0)' );
	ncplx = 0;
	for ( i = 0; i < N; i++ ) {
		if ( WI4[ i ] !== 0.0 ) {
			ncplx += 1;
		}
	}
	assert.ok( ncplx > 0 && ncplx < N, 'mixed real and complex eigenvalues' );
	assert.deepStrictEqual( toArray( WR4 ), toArray( WR0 ), 'WR' );
	assert.deepStrictEqual( toArray( WI4 ), toArray( WI0 ), 'WI' );
	assert.deepStrictEqual( toArray( H4 ), toArray( H0 ), 'H' );
	assert.deepStrictEqual( toArray( Z4 ), toArray( Z0 ), 'Z' );
});

/**
* Builds the banded test matrices of test/fortran/test_dlaqr4.f90 (tests 9, 10).
*
* @private
* @param {integer} N - order (40 or 80)
* @returns {Float64Array} column-major Hessenberg matrix
*/
function buildBanded( N ) {
	const big = ( N === 40 );
	const H = new Float64Array( N * N );
	let i;
	let j;
	for ( i = 1; i <= N; i++ ) {
		H[ ( i - 1 ) + ( ( i - 1 ) * N ) ] = ( big ) ? ( i * 1.5 ) + ( 0.1 * ( ( i * 7 ) % 13 ) ) : i + ( 5.0 * ( ( i * 3 ) % 7 ) ); // eslint-disable-line max-len
		if ( i < N ) {
			H[ i + ( ( i - 1 ) * N ) ] = ( big ) ? 0.8 : 0.5;
		}
		for ( j = i + 1; j <= Math.min( i + ( ( big ) ? 5 : 3 ), N ); j++ ) {
			H[ ( i - 1 ) + ( ( j - 1 ) * N ) ] = ( ( big ) ? 0.2 : 0.15 ) / ( j - i );
		}
	}
	return H;
}

// The reference's eigenvalue ORDER depends on its IPARMQ shift/deflation
// schedule, so comparing these unsorted pins that schedule (tickets/0046).
test( 'dlaqr4: 40x40 multishift matches the reference unsorted (IPARMQ parameters)', function t() { // eslint-disable-line max-len
	const tc = _40x40_wantt_wantz;
	const N = 40;
	const H = buildBanded( N );
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 20000 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-11, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-11, 'WI' );
	assertArrayClose( toArray( H ), tc.H, 1e-11, 'H' );
});

test( 'dlaqr4: 80x80 multishift matches the reference unsorted (IPARMQ parameters)', function t() { // eslint-disable-line max-len
	const tc = _80x80_wantt_wantz;
	const N = 80;
	const H = buildBanded( N );
	const Z = identityMatrix( N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const WORK = new Float64Array( 20000 );
	const info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( WR ), tc.WR, 1e-11, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI, 1e-11, 'WI' );
});

test( 'dlaqr4: 150x150 random Hessenberg (NS >= 14 selects KACC22 = 2) yields a standardized real Schur form', function t() {
	const N = 150;
	const H0 = randomHessenberg( N, 3 );
	const full = runFull( dlaqr4, true, true, H0, N );
	assert.strictEqual( full.info, 0, 'info' );
	const T = assertSimilar( H0, full.H, full.Z, N, 'full' );
	assertRealSchur( T, N, full.WR, full.WI, 'full' );

	// Eigenvalues only: same spectrum as the Schur form
	const eig = runFull( dlaqr4, false, false, H0, N );
	assert.strictEqual( eig.info, 0, 'info (eigenvalues only)' );
	assertSameEigenvalues( pairs( eig.WR, eig.WI, 0, N ), pairs( full.WR, full.WI, 0, N ), 1e-10, 'eigenvalues only vs Schur' );
});

test( 'dlaqr4: two real shifts keep the one nearest H(kbot,kbot) (graded 20x20 with H(19,20) = 0)', function t() {
	// With H(N-1,N) = 0 the 2x2 deflation window is already triangular in swapped order, so the deflation window returns its two real shifts with the one equal to H(kbot,kbot) last; the two-shift rule then copies WR(kbot) over WR(kbot-1).
	const N = 20;
	const H0 = new Float64Array( N * N );
	let s = 1;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			s = ( s * 16807 ) % 2147483647;
			H0[ i + ( j * N ) ] = ( s / 2147483647 ) - 0.5;
		}
		H0[ j + ( j * N ) ] += N - j;
		if ( j < N - 1 ) {
			s = ( s * 16807 ) % 2147483647;
			H0[ ( j + 1 ) + ( j * N ) ] = ( s / 2147483647 ) + 0.1;
		}
	}
	H0[ ( N - 2 ) + ( ( N - 1 ) * N ) ] = 0.0;
	const full = runFull( dlaqr4, true, true, H0, N );
	assert.strictEqual( full.info, 0, 'info' );
	const T = assertSimilar( H0, full.H, full.Z, N, 'full' );
	assertRealSchur( T, N, full.WR, full.WI, 'full' );

	const eig = runFull( dlaqr4, false, false, H0, N );
	assert.strictEqual( eig.info, 0, 'info (eigenvalues only)' );
	assertSameEigenvalues( pairs( eig.WR, eig.WI, 0, N ), pairs( full.WR, full.WI, 0, N ), 1e-10, 'eigenvalues only vs Schur' );
});

test( 'dlaqr4: iteration limit returns INFO = KBOT with H orthogonally similar to the input (KEXSH = 0, cyclic permutation)', async function t() {
	// KEXSH = 0 turns exceptional shifts off (`ndfl % 0` is never 0) and sets ITMAX = 30*NH. Zero shifts leave a permutation matrix fixed, so nothing ever deflates: the deflation window shrinks until it returns at most NS/2 shifts, the shifts then come from the trailing NS-by-NS submatrix, and the loop ends at ITMAX with INFO = KBOT = N. Per the reference contract for INFO > 0, Z^T*H0*Z = H on exit and the unconverged eigenvalues are those of H(ILO:INFO,ILO:INFO).
	const mod = await importWithConstants( new URL( './../lib/base.js', import.meta.url ), {
		'KEXSH': 0
	});
	const N = 30;
	const H0 = cyclicPermutation( N );
	const out = runFull( mod.default, true, true, H0, N );
	assert.strictEqual( out.info, N, 'info' );
	const T = assertSimilar( H0, out.H, out.Z, N, 'iteration limit' );

	// Eigenvalues of the unconverged block H(1:INFO,1:INFO) are the N-th roots of unity
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const info = dhseqr( 'eigenvalues', 'none', N, 1, N, T, 1, N, 0, WR, 1, 0, WI, 1, 0, new Float64Array( 1 ), 1, 1, 0, new Float64Array( N * N ), 1, 0 );
	assert.strictEqual( info, 0, 'dhseqr info' );
	const roots = [];
	let k;
	for ( k = 0; k < N; k++ ) {
		roots.push( [ Math.cos( 2.0 * Math.PI * k / N ), Math.sin( 2.0 * Math.PI * k / N ) ] );
	}
	assertSameEigenvalues( pairs( WR, WI, 0, N ), roots, 1e-10, 'eigenvalues' );
});

test( 'dlaqr4: the reference\'s effective minimum 1 (not its documented max(1,N)) is accepted, and a few elements suffice where the AED window passes 32 (dlaqr2 and its callees adapt, tickets 0100, 0016)', function t() {
	function run( N, WORK ) {
		const H = new Float64Array( N * N );
		const Z = new Float64Array( N * N );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		let info;
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ i + ( ( i - 1 ) * N ) ] = 1.0;
		}
		H[ ( N - 1 ) * N ] = 1.0;
		for ( i = 0; i < N; i++ ) {
			Z[ i + ( i * N ) ] = 1.0;
		}
		info = dlaqr4( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0 );
		return {
			'N': N,
			'info': info,
			're': WR,
			'im': WI,
			'out': [].concat( Array.from( WR ), Array.from( WI ), Array.from( H ), Array.from( Z ) )
		};
	}
	function checkRoots( r, msg ) {
		// The cyclic shift's eigenvalues are the N-th roots of unity, each once:
		const seen = new Uint8Array( r.N );
		let k;
		let i;
		assert.equal( r.info, 0, msg + ': info' );
		for ( i = 0; i < r.N; i++ ) {
			k = ( ( Math.round( Math.atan2( r.im[ i ], r.re[ i ] ) * r.N / ( 2.0 * Math.PI ) ) % r.N ) + r.N ) % r.N;
			assert.ok( Math.abs( r.re[ i ] - Math.cos( 2.0 * Math.PI * k / r.N ) ) <= 1e-10 && Math.abs( r.im[ i ] - Math.sin( 2.0 * Math.PI * k / r.N ) ) <= 1e-10, msg + ': eigenvalue ' + i + ' = ' + r.re[ i ] + ' + ' + r.im[ i ] + 'i' );
			assert.equal( seen[ k ], 0, msg + ': root ' + k + ' found twice' );
			seen[ k ] = 1;
		}
	}

	// Cyclic shift of order 300: AED stalls and the window grows past 32 with more than 32 undeflated shifts, where the JS callees used to block whatever WORK they got (ticket 0096). With the reference's minimum max(1,N) they now shrink NB or go unblocked:
	checkRoots( run( 300, new Float64Array( 300 ) ), 'max(1,N)' ); // on the old code this threw (minimum 33*floor((N-1)/3) + 2080)

	// The reference documents max(1,N) but neither checks nor needs it: it caps the window at LWORK/2 and the shifts at 2*LWORK/3. At LWORK = 4 it converges (as the reference does); on the old code this threw (minimum max(1,N)):
	checkRoots( run( 300, new Float64Array( 4 ) ), 'LWORK = 4' );

	// At LWORK = 1, the effective minimum, it is accepted; with no room for a window or shifts it makes no progress and returns INFO = N, as the reference does:
	assert.strictEqual( run( 300, new Float64Array( 1 ) ).info, 300, 'LWORK = 1: info' );

	// Below it throws:
	assert.throws( function throws() {
		run( 300, new Float64Array( 0 ) );
	}, /WORK array must have at least 1 elements/ );
});
