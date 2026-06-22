// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbtrf from './../lib/ndarray.js';

// FIXTURES //

import tridiag_4x4 from './fixtures/tridiag_4x4.json' with { type: 'json' };
import kl1_ku2_3x3 from './fixtures/kl1_ku2_3x3.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import pivot_2x2 from './fixtures/pivot_2x2.json' with { type: 'json' };
import pentadiag_5x5 from './fixtures/pentadiag_5x5.json' with { type: 'json' };
import zgbtrs from '../../zgbtrs/lib/base.js';

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch: actual ' + actual.length + ' vs expected ' + expected.length );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zgbtrf: main export is a function', function t() {
	assert.strictEqual( typeof zgbtrf, 'function' );
});

test( 'zgbtrf: 4x4 tridiagonal (KL=1, KU=1)', function t() {
	var tc = tridiag_4x4;
	var AB = new Complex128Array( 4 * 4 );
	var ABv = reinterpret( AB, 0 );
	// Same setup as zgbtf2 test
	ABv[ (2 + 0 * 4) * 2 ] = 4; ABv[ (2 + 0 * 4) * 2 + 1 ] = 1;
	ABv[ (3 + 0 * 4) * 2 ] = -1; ABv[ (3 + 0 * 4) * 2 + 1 ] = 0;
	ABv[ (1 + 1 * 4) * 2 ] = -1; ABv[ (1 + 1 * 4) * 2 + 1 ] = 0;
	ABv[ (2 + 1 * 4) * 2 ] = 4; ABv[ (2 + 1 * 4) * 2 + 1 ] = 1;
	ABv[ (3 + 1 * 4) * 2 ] = -1; ABv[ (3 + 1 * 4) * 2 + 1 ] = 0;
	ABv[ (1 + 2 * 4) * 2 ] = -1; ABv[ (1 + 2 * 4) * 2 + 1 ] = 0;
	ABv[ (2 + 2 * 4) * 2 ] = 4; ABv[ (2 + 2 * 4) * 2 + 1 ] = 1;
	ABv[ (3 + 2 * 4) * 2 ] = -1; ABv[ (3 + 2 * 4) * 2 + 1 ] = 0;
	ABv[ (1 + 3 * 4) * 2 ] = -1; ABv[ (1 + 3 * 4) * 2 + 1 ] = 0;
	ABv[ (2 + 3 * 4) * 2 ] = 4; ABv[ (2 + 3 * 4) * 2 + 1 ] = 1;

	var IPIV = new Int32Array( 4 );
	var info = zgbtrf( 4, 4, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( ABv ), tc.AB, 1e-10, 'AB' );
	var i;
	for ( i = 0; i < tc.ipiv.length; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgbtrf: 3x3 with KL=1, KU=2', function t() {
	var tc = kl1_ku2_3x3;
	var AB = new Complex128Array( 5 * 3 );
	var ABv = reinterpret( AB, 0 );
	ABv[ (3 + 0 * 5) * 2 ] = 5; ABv[ (3 + 0 * 5) * 2 + 1 ] = 1;
	ABv[ (4 + 0 * 5) * 2 ] = 2; ABv[ (4 + 0 * 5) * 2 + 1 ] = 0;
	ABv[ (2 + 1 * 5) * 2 ] = 3; ABv[ (2 + 1 * 5) * 2 + 1 ] = 0;
	ABv[ (3 + 1 * 5) * 2 ] = 6; ABv[ (3 + 1 * 5) * 2 + 1 ] = 1;
	ABv[ (4 + 1 * 5) * 2 ] = 1; ABv[ (4 + 1 * 5) * 2 + 1 ] = 0;
	ABv[ (1 + 2 * 5) * 2 ] = 1; ABv[ (1 + 2 * 5) * 2 + 1 ] = 1;
	ABv[ (2 + 2 * 5) * 2 ] = 4; ABv[ (2 + 2 * 5) * 2 + 1 ] = 0;
	ABv[ (3 + 2 * 5) * 2 ] = 7; ABv[ (3 + 2 * 5) * 2 + 1 ] = 1;

	var IPIV = new Int32Array( 3 );
	var info = zgbtrf( 3, 3, 1, 2, AB, 1, 5, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( ABv ), tc.AB, 1e-10, 'AB' );
	var i;
	for ( i = 0; i < tc.ipiv.length; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgbtrf: N=0 quick return', function t() {
	var tc = n_zero;
	var AB = new Complex128Array( 4 );
	var IPIV = new Int32Array( 1 );
	var info = zgbtrf( 3, 0, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'zgbtrf: M=0 quick return', function t() {
	var tc = m_zero;
	var AB = new Complex128Array( 4 );
	var IPIV = new Int32Array( 1 );
	var info = zgbtrf( 0, 3, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'zgbtrf: 1x1 matrix', function t() {
	var tc = one_by_one;
	var AB = new Complex128Array( [ 7, 2 ] );
	var IPIV = new Int32Array( 1 );
	var info = zgbtrf( 1, 1, 0, 0, AB, 1, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AB, 0 ) ), tc.AB, 1e-10, 'AB' );
	assert.strictEqual( IPIV[ 0 ], tc.ipiv[ 0 ] - 1, 'ipiv[0]' );
});

test( 'zgbtrf: singular matrix', function t() {
	var tc = singular;
	var AB = new Complex128Array( 2 * 2 );
	var ABv = reinterpret( AB, 0 );
	ABv[ (0 + 1 * 2) * 2 ] = 1; ABv[ (0 + 1 * 2) * 2 + 1 ] = 1;
	var IPIV = new Int32Array( 2 );
	var info = zgbtrf( 2, 2, 0, 1, AB, 1, 2, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
});

test( 'zgbtrf: pivoting 2x2', function t() {
	var tc = pivot_2x2;
	var AB = new Complex128Array( 4 * 2 );
	var ABv = reinterpret( AB, 0 );
	ABv[ (2 + 0 * 4) * 2 ] = 1; ABv[ (2 + 0 * 4) * 2 + 1 ] = 0;
	ABv[ (3 + 0 * 4) * 2 ] = 3; ABv[ (3 + 0 * 4) * 2 + 1 ] = 0;
	ABv[ (1 + 1 * 4) * 2 ] = 2; ABv[ (1 + 1 * 4) * 2 + 1 ] = 0;
	ABv[ (2 + 1 * 4) * 2 ] = 4; ABv[ (2 + 1 * 4) * 2 + 1 ] = 0;

	var IPIV = new Int32Array( 2 );
	var info = zgbtrf( 2, 2, 1, 1, AB, 1, 4, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( ABv ), tc.AB, 1e-10, 'AB' );
	var i;
	for ( i = 0; i < tc.ipiv.length; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgbtrf: 5x5 pentadiagonal (KL=2, KU=2)', function t() {
	var tc = pentadiag_5x5;
	// LDAB = 2*KL+KU+1 = 7, 5 columns
	var LDAB = 7;
	var kl = 2;
	var ku = 2;
	var kv = ku + kl; // = 4
	var AB = new Complex128Array( LDAB * 5 );
	var ABv = reinterpret( AB, 0 );

	// Build a complex pentadiagonal: diag=(6,1), super1=(-2,0), super2=(1,0),
	// sub1=(-2,0), sub2=(1,0)
	var j;
	for ( j = 0; j < 5; j++ ) {
		// Diagonal: row kv
		ABv[ (kv + j * LDAB) * 2 ] = 6; ABv[ (kv + j * LDAB) * 2 + 1 ] = 1;
		// super-diagonal 1: row kv-1
		if ( j > 0 ) {
			ABv[ ((kv - 1) + j * LDAB) * 2 ] = -2; ABv[ ((kv - 1) + j * LDAB) * 2 + 1 ] = 0;
		}
		// super-diagonal 2: row kv-2
		if ( j > 1 ) {
			ABv[ ((kv - 2) + j * LDAB) * 2 ] = 1; ABv[ ((kv - 2) + j * LDAB) * 2 + 1 ] = 0;
		}
		// sub-diagonal 1: row kv+1
		if ( j < 4 ) {
			ABv[ ((kv + 1) + j * LDAB) * 2 ] = -2; ABv[ ((kv + 1) + j * LDAB) * 2 + 1 ] = 0;
		}
		// sub-diagonal 2: row kv+2
		if ( j < 3 ) {
			ABv[ ((kv + 2) + j * LDAB) * 2 ] = 1; ABv[ ((kv + 2) + j * LDAB) * 2 + 1 ] = 0;
		}
	}

	var IPIV = new Int32Array( 5 );
	var info = zgbtrf( 5, 5, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( ABv ), tc.AB, 1e-10, 'AB' );
	var i;
	for ( i = 0; i < tc.ipiv.length; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgbtrf: blocked path 100x100 with KL=33 KU=33', function t() {
	var N = 100;
	var kl = 33;
	var ku = 33;
	var kv = ku + kl;
	var LDAB = 2 * kl + ku + 1;
	var AB_orig = new Complex128Array( LDAB * N );
	var AB_origv = reinterpret( AB_orig, 0 );
	var AB = new Complex128Array( LDAB * N );
	var ABv = reinterpret( AB, 0 );
	var IPIV = new Int32Array( N );
	var b = new Complex128Array( N );
	var bv = reinterpret( b, 0 );
	var i;
	var j;
	var re;
	var im;
	var resid;
	var bnorm;
	var Are;
	var Aim;

	// Build a diagonally dominant complex banded matrix
	for ( j = 0; j < N; j++ ) {
		AB_origv[ (kv + j * LDAB) * 2 ] = 10.0 * N + ( j + 1 );
		AB_origv[ (kv + j * LDAB) * 2 + 1 ] = 0.5 * ( j + 1 );
		for ( i = 1; i <= Math.min( kl, N - j - 1 ); i++ ) {
			AB_origv[ (kv + i + j * LDAB) * 2 ] = -1.0 + 0.01 * i;
			AB_origv[ (kv + i + j * LDAB) * 2 + 1 ] = 0.1;
		}
		for ( i = 1; i <= Math.min( ku, j ); i++ ) {
			AB_origv[ (kv - i + j * LDAB) * 2 ] = -1.0 + 0.02 * i;
			AB_origv[ (kv - i + j * LDAB) * 2 + 1 ] = -0.1;
		}
	}

	// Copy for factorization
	for ( i = 0; i < AB_origv.length; i++ ) {
		ABv[ i ] = AB_origv[ i ];
	}

	// Known solution: x_true[k] = (k+1, 0.5*(k+1))
	// Compute b = A * x_true using banded structure
	for ( i = 0; i < N; i++ ) {
		re = 0.0;
		im = 0.0;
		for ( j = Math.max( 0, i - kl ); j <= Math.min( N - 1, i + ku ); j++ ) {
			Are = AB_origv[ (kv + i - j + j * LDAB) * 2 ];
			Aim = AB_origv[ (kv + i - j + j * LDAB) * 2 + 1 ];
			// x_true[j] = (j+1) + 0.5*(j+1)*i
			re += Are * ( j + 1 ) - Aim * 0.5 * ( j + 1 );
			im += Aim * ( j + 1 ) + Are * 0.5 * ( j + 1 );
		}
		bv[ i * 2 ] = re;
		bv[ i * 2 + 1 ] = im;
	}

	// Factorize
	var info = zgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0, 'info should be 0' );

	// Solve using zgbtrs
	zgbtrs( 'no-transpose', N, kl, ku, 1, AB, 1, LDAB, 0, IPIV, 1, 0, b, 1, N, 0 );

	// Verify solution: b should now contain x_true
	bnorm = 0.0;
	resid = 0.0;
	for ( i = 0; i < N; i++ ) {
		re = bv[ i * 2 ] - ( i + 1 );
		im = bv[ i * 2 + 1 ] - 0.5 * ( i + 1 );
		resid += re * re + im * im;
		bnorm += ( i + 1 ) * ( i + 1 ) + 0.25 * ( i + 1 ) * ( i + 1 );
	}
	resid = Math.sqrt( resid ) / Math.sqrt( bnorm );
	assert.ok( resid < 1e-4, 'relative residual should be small: ' + resid );
});
