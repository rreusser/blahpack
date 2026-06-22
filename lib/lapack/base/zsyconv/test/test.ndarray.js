// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsyconv from './../lib/ndarray.js';

// FIXTURES //

import upper_convert from './fixtures/upper_convert.json' with { type: 'json' };
import upper_revert from './fixtures/upper_revert.json' with { type: 'json' };
import lower_convert from './fixtures/lower_convert.json' with { type: 'json' };
import lower_revert from './fixtures/lower_revert.json' with { type: 'json' };
import n1_upper from './fixtures/n1_upper.json' with { type: 'json' };
import n1_lower from './fixtures/n1_lower.json' with { type: 'json' };
import upper_2x2_convert from './fixtures/upper_2x2_convert.json' with { type: 'json' };
import upper_2x2_revert from './fixtures/upper_2x2_revert.json' with { type: 'json' };
import lower_2x2_convert from './fixtures/lower_2x2_convert.json' with { type: 'json' };
import lower_2x2_revert from './fixtures/lower_2x2_revert.json' with { type: 'json' };

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
* Convert Fortran 1-based IPIV to JS 0-based IPIV.
* Positive values: subtract 1 (e.g. 2 -> 1).
* Negative values: use bitwise NOT encoding for 0-based index.
*   Fortran -p means 1-based row p, so 0-based row is p-1, encoded as ~(p-1).
*   Since ~(p-1) = -p, the encoding is the same numeric value as Fortran.
*
* @private
* @param {Array} ipivFortran - Fortran 1-based IPIV array
* @returns {Int32Array} 0-based IPIV
*/
function convertIPIV( ipivFortran ) {
	var out = new Int32Array( ipivFortran.length );
	var i;
	for ( i = 0; i < ipivFortran.length; i++ ) {
		if ( ipivFortran[ i ] >= 0 ) {
			out[ i ] = ipivFortran[ i ] - 1;
		} else {
			// Fortran -p (1-based row p) -> JS ~(p-1) = -p (same value)
			out[ i ] = ipivFortran[ i ];
		}
	}
	return out;
}

// TESTS //

test( 'zsyconv: upper_convert (all 1x1 pivots)', function t() {
	var tc = upper_convert;
	var N = 4;
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv_trf );
	var E = new Complex128Array( N );
	var Av;
	var Ev;
	var info;

	info = zsyconv( 'upper', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );
	assertArrayClose( Array.from( Av ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( Array.from( Ev ), tc.e, 1e-14, 'e' );
});

test( 'zsyconv: upper_revert (all 1x1 pivots)', function t() {
	var tcConv = upper_convert;
	var tcRev = upper_revert;
	var N = 4;
	var A = new Complex128Array( tcConv.a_converted );
	var IPIV = convertIPIV( tcConv.ipiv_trf );
	var E = new Complex128Array( tcConv.e );
	var Av;
	var info;

	info = zsyconv( 'upper', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconv: lower_convert (all 1x1 pivots)', function t() {
	var tc = lower_convert;
	var N = 4;
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv_trf );
	var E = new Complex128Array( N );
	var Av;
	var Ev;
	var info;

	info = zsyconv( 'lower', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );
	assertArrayClose( Array.from( Av ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( Array.from( Ev ), tc.e, 1e-14, 'e' );
});

test( 'zsyconv: lower_revert (all 1x1 pivots)', function t() {
	var tcConv = lower_convert;
	var tcRev = lower_revert;
	var N = 4;
	var A = new Complex128Array( tcConv.a_converted );
	var IPIV = convertIPIV( tcConv.ipiv_trf );
	var E = new Complex128Array( tcConv.e );
	var Av;
	var info;

	info = zsyconv( 'lower', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconv: n1_upper', function t() {
	var tc = n1_upper;
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv );
	var E = new Complex128Array( 1 );
	var Av;
	var Ev;
	var info;

	info = zsyconv( 'upper', 'convert', 1, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );
	assertArrayClose( Array.from( Av ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( Array.from( Ev ), tc.e, 1e-14, 'e' );
});

test( 'zsyconv: n1_lower', function t() {
	var tc = n1_lower;
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv );
	var E = new Complex128Array( 1 );
	var Av;
	var Ev;
	var info;

	info = zsyconv( 'lower', 'convert', 1, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );
	assertArrayClose( Array.from( Av ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( Array.from( Ev ), tc.e, 1e-14, 'e' );
});

test( 'zsyconv: upper_2x2_convert (with 2x2 pivots)', function t() {
	var tc = upper_2x2_convert;
	var N = 4;
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv_trf );
	var E = new Complex128Array( N );
	var Av;
	var Ev;
	var info;

	info = zsyconv( 'upper', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );
	assertArrayClose( Array.from( Av ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( Array.from( Ev ), tc.e, 1e-14, 'e' );
});

test( 'zsyconv: upper_2x2_revert (with 2x2 pivots)', function t() {
	var tcConv = upper_2x2_convert;
	var tcRev = upper_2x2_revert;
	var N = 4;
	var A = new Complex128Array( tcConv.a_converted );
	var IPIV = convertIPIV( tcConv.ipiv_trf );
	var E = new Complex128Array( tcConv.e );
	var Av;
	var info;

	info = zsyconv( 'upper', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconv: lower_2x2_convert (with 2x2 pivots)', function t() {
	var tc = lower_2x2_convert;
	var N = 4;
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv_trf );
	var E = new Complex128Array( N );
	var Av;
	var Ev;
	var info;

	info = zsyconv( 'lower', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );
	assertArrayClose( Array.from( Av ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( Array.from( Ev ), tc.e, 1e-14, 'e' );
});

test( 'zsyconv: lower_2x2_revert (with 2x2 pivots)', function t() {
	var tcConv = lower_2x2_convert;
	var tcRev = lower_2x2_revert;
	var N = 4;
	var A = new Complex128Array( tcConv.a_converted );
	var IPIV = convertIPIV( tcConv.ipiv_trf );
	var E = new Complex128Array( tcConv.e );
	var Av;
	var info;

	info = zsyconv( 'lower', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'zsyconv: N=0 returns immediately', function t() {
	var A = new Complex128Array( 0 );
	var IPIV = new Int32Array( 0 );
	var E = new Complex128Array( 0 );
	var info;

	info = zsyconv( 'upper', 'convert', 0, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info upper convert' );

	info = zsyconv( 'lower', 'revert', 0, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info lower revert' );
});

test( 'zsyconv: round-trip upper convert then revert restores A', function t() {
	var tc = upper_2x2_convert;
	var N = 4;
	var Aorig = new Complex128Array( tc.a_factored );
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv_trf );
	var E = new Complex128Array( N );
	var Av;
	var AorigV;

	zsyconv( 'upper', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	zsyconv( 'upper', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	Av = reinterpret( A, 0 );
	AorigV = reinterpret( Aorig, 0 );
	assertArrayClose( Array.from( Av ), Array.from( AorigV ), 1e-14, 'round-trip' );
});

test( 'zsyconv: round-trip lower convert then revert restores A', function t() {
	var tc = lower_2x2_convert;
	var N = 4;
	var Aorig = new Complex128Array( tc.a_factored );
	var A = new Complex128Array( tc.a_factored );
	var IPIV = convertIPIV( tc.ipiv_trf );
	var E = new Complex128Array( N );
	var Av;
	var AorigV;

	zsyconv( 'lower', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	zsyconv( 'lower', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	Av = reinterpret( A, 0 );
	AorigV = reinterpret( Aorig, 0 );
	assertArrayClose( Array.from( Av ), Array.from( AorigV ), 1e-14, 'round-trip' );
});
