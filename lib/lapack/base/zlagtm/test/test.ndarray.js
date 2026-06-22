

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlagtm from './../lib/ndarray.js';

// FIXTURES //

import notrans_alpha1_beta0 from './fixtures/notrans_alpha1_beta0.json' with { type: 'json' };
import trans_alpha1_beta0 from './fixtures/trans_alpha1_beta0.json' with { type: 'json' };
import conjtrans_alpha1_beta0 from './fixtures/conjtrans_alpha1_beta0.json' with { type: 'json' };
import notrans_alpham1_beta0 from './fixtures/notrans_alpham1_beta0.json' with { type: 'json' };
import trans_alpham1_beta0 from './fixtures/trans_alpham1_beta0.json' with { type: 'json' };
import conjtrans_alpham1_beta0 from './fixtures/conjtrans_alpham1_beta0.json' with { type: 'json' };
import notrans_alpha1_beta1 from './fixtures/notrans_alpha1_beta1.json' with { type: 'json' };
import notrans_alpha1_betam1 from './fixtures/notrans_alpha1_betam1.json' with { type: 'json' };
import notrans_alpha0_beta0 from './fixtures/notrans_alpha0_beta0.json' with { type: 'json' };
import notrans_alpha0_beta1 from './fixtures/notrans_alpha0_beta1.json' with { type: 'json' };
import n1_notrans from './fixtures/n1_notrans.json' with { type: 'json' };
import n1_trans from './fixtures/n1_trans.json' with { type: 'json' };
import n1_conjtrans from './fixtures/n1_conjtrans.json' with { type: 'json' };
import notrans_multi_rhs from './fixtures/notrans_multi_rhs.json' with { type: 'json' };
import conjtrans_alpham1_betam1_multi_rhs from './fixtures/conjtrans_alpham1_betam1_multi_rhs.json' with { type: 'json' };
import n1_alpham1_betam1 from './fixtures/n1_alpham1_betam1.json' with { type: 'json' };

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
* Returns the standard 4x4 complex tridiagonal test matrix vectors.
*
* @private
* @returns {Object} DL, d, DU as Complex128Arrays
*/
function triDiag4() {
	return {
		DL: new Complex128Array( [ 3, 1, 1, -2, 2, 0 ] ),
		d: new Complex128Array( [ 2, 1, 4, 2, 5, -1, 6, 3 ] ),
		DU: new Complex128Array( [ -1, 1, -2, 3, -3, -1 ] )
	};
}

/**
* Returns the standard X vector (4 complex elements, 1 RHS).
*
* @private
* @returns {Complex128Array} X
*/
function xVec4() {
	return new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 2 ] );
}

// TESTS //

test( 'zlagtm is a function', function t() {
	assert.equal( typeof zlagtm, 'function' );
});

test( 'zlagtm: notrans_alpha1_beta0', function t() {
	var tc = notrans_alpha1_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( 4 );
	var Bv;

	zlagtm( 'no-transpose', 4, 1, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: trans_alpha1_beta0', function t() {
	var tc = trans_alpha1_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( 4 );
	var Bv;

	zlagtm( 'transpose', 4, 1, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: conjtrans_alpha1_beta0', function t() {
	var tc = conjtrans_alpha1_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( 4 );
	var Bv;

	zlagtm( 'conjugate-transpose', 4, 1, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: notrans_alpham1_beta0', function t() {
	var tc = notrans_alpham1_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( 4 );
	var Bv;

	zlagtm( 'no-transpose', 4, 1, -1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: trans_alpham1_beta0', function t() {
	var tc = trans_alpham1_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( 4 );
	var Bv;

	zlagtm( 'transpose', 4, 1, -1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: conjtrans_alpham1_beta0', function t() {
	var tc = conjtrans_alpham1_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( 4 );
	var Bv;

	zlagtm( 'conjugate-transpose', 4, 1, -1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: notrans_alpha1_beta1', function t() {
	var tc = notrans_alpha1_beta1;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( [ 10, 5, 20, -3, 30, 7, 40, -2 ] );
	var Bv;

	zlagtm( 'no-transpose', 4, 1, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 1.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: notrans_alpha1_betam1', function t() {
	var tc = notrans_alpha1_betam1;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( [ 10, 5, 20, -3, 30, 7, 40, -2 ] );
	var Bv;

	zlagtm( 'no-transpose', 4, 1, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, -1.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: notrans_alpha0_beta0', function t() {
	var tc = notrans_alpha0_beta0;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( [ 10, 5, 20, -3, 30, 7, 40, -2 ] );
	var Bv;

	zlagtm( 'no-transpose', 4, 1, 0.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: notrans_alpha0_beta1', function t() {
	var tc = notrans_alpha0_beta1;
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( [ 10, 5, 20, -3, 30, 7, 40, -2 ] );
	var Bv;

	zlagtm( 'no-transpose', 4, 1, 0.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 1.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: n1_notrans', function t() {
	var tc = n1_notrans;
	var DL = new Complex128Array( 0 );
	var d = new Complex128Array( [ 5, -2 ] );
	var DU = new Complex128Array( 0 );
	var X = new Complex128Array( [ 3, 1 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlagtm( 'no-transpose', 1, 1, 1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, 1, 0, 0.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: n1_trans', function t() {
	var tc = n1_trans;
	var DL = new Complex128Array( 0 );
	var d = new Complex128Array( [ 5, -2 ] );
	var DU = new Complex128Array( 0 );
	var X = new Complex128Array( [ 3, 1 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlagtm( 'transpose', 1, 1, 1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, 1, 0, 0.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: n1_conjtrans', function t() {
	var tc = n1_conjtrans;
	var DL = new Complex128Array( 0 );
	var d = new Complex128Array( [ 5, -2 ] );
	var DU = new Complex128Array( 0 );
	var X = new Complex128Array( [ 3, 1 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlagtm( 'conjugate-transpose', 1, 1, 1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, 1, 0, 0.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: n0_quickreturn', function t() {
	var td = triDiag4();
	var X = xVec4();
	var B = new Complex128Array( [ 99, -99 ] );
	var Bv;

	zlagtm( 'no-transpose', 0, 1, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), [ 99, -99 ], 1e-14, 'b' );
});

test( 'zlagtm: notrans_multi_rhs', function t() {
	var tc = notrans_multi_rhs;
	var td = triDiag4();
	var Bv;

	// X is 4x2, column-major with LDX=4
	var X = new Complex128Array( [
		1, 0, 0, 1, -1, 0, 0, -1,
		2, 1, 1, -1, 3, 0, -1, 2
	] );
	var B = new Complex128Array( 8 );

	zlagtm( 'no-transpose', 4, 2, 1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, 0.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ).slice( 0, 8 ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( Array.from( Bv ).slice( 8, 16 ), tc.b2, 1e-14, 'b2' );
});

test( 'zlagtm: conjtrans_alpham1_betam1_multi_rhs', function t() {
	var tc = conjtrans_alpham1_betam1_multi_rhs;
	var td = triDiag4();
	var Bv;

	var X = new Complex128Array( [
		1, 0, 0, 1, -1, 0, 0, -1,
		2, 1, 1, -1, 3, 0, -1, 2
	] );
	var B = new Complex128Array( [
		1, 1, 2, 2, 3, 3, 4, 4,
		5, 5, 6, 6, 7, 7, 8, 8
	] );

	zlagtm( 'conjugate-transpose', 4, 2, -1.0, td.DL, 1, 0, td.d, 1, 0, td.DU, 1, 0, X, 1, 4, 0, -1.0, B, 1, 4, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ).slice( 0, 8 ), tc.b1, 1e-14, 'b1' );
	assertArrayClose( Array.from( Bv ).slice( 8, 16 ), tc.b2, 1e-14, 'b2' );
});

test( 'zlagtm: n1_alpham1_betam1', function t() {
	var tc = n1_alpham1_betam1;
	var DL = new Complex128Array( 0 );
	var d = new Complex128Array( [ 5, -2 ] );
	var DU = new Complex128Array( 0 );
	var X = new Complex128Array( [ 3, 1 ] );
	var B = new Complex128Array( [ 7, 3 ] );
	var Bv;

	zlagtm( 'no-transpose', 1, 1, -1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, 1, 0, -1.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), tc.b, 1e-14, 'b' );
});

test( 'zlagtm: n1_alpham1_trans', function t() {
	// N=1, alpha=-1, trans='transpose', beta=0
	// D[0] = 5-2i, X[0] = 3+1i => D*X = (5-2i)*(3+1i) = 17-1i
	// B = 0 - (17-1i) = -17+1i
	var DL = new Complex128Array( 0 );
	var d = new Complex128Array( [ 5, -2 ] );
	var DU = new Complex128Array( 0 );
	var X = new Complex128Array( [ 3, 1 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlagtm( 'transpose', 1, 1, -1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, 1, 0, 0.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), [ -17, 1 ], 1e-14, 'b' );
});

test( 'zlagtm: n1_alpham1_conjtrans', function t() {
	// N=1, alpha=-1, trans='conjugate-transpose', beta=0
	// conj(D[0]) = 5+2i, X[0] = 3+1i => conj(D)*X = (5+2i)*(3+1i) = 13+11i
	// B = 0 - (13+11i) = -13-11i
	var DL = new Complex128Array( 0 );
	var d = new Complex128Array( [ 5, -2 ] );
	var DU = new Complex128Array( 0 );
	var X = new Complex128Array( [ 3, 1 ] );
	var B = new Complex128Array( 1 );
	var Bv;

	zlagtm( 'conjugate-transpose', 1, 1, -1.0, DL, 1, 0, d, 1, 0, DU, 1, 0, X, 1, 1, 0, 0.0, B, 1, 1, 0 );
	Bv = reinterpret( B, 0 );
	assertArrayClose( Array.from( Bv ), [ -13, -11 ], 1e-14, 'b' );
});
