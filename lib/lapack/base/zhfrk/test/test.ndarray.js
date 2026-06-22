/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhfrk from './../lib/ndarray.js';


// FIXTURES //

import oddNLN from './fixtures/odd_nln.json' with { type: 'json' };
import oddNLC from './fixtures/odd_nlc.json' with { type: 'json' };
import oddNUN from './fixtures/odd_nun.json' with { type: 'json' };
import oddNUC from './fixtures/odd_nuc.json' with { type: 'json' };
import oddCLN from './fixtures/odd_cln.json' with { type: 'json' };
import oddCLC from './fixtures/odd_clc.json' with { type: 'json' };
import oddCUN from './fixtures/odd_cun.json' with { type: 'json' };
import oddCUC from './fixtures/odd_cuc.json' with { type: 'json' };
import evenNLN from './fixtures/even_nln.json' with { type: 'json' };
import evenNLC from './fixtures/even_nlc.json' with { type: 'json' };
import evenNUN from './fixtures/even_nun.json' with { type: 'json' };
import evenNUC from './fixtures/even_nuc.json' with { type: 'json' };
import evenCLN from './fixtures/even_cln.json' with { type: 'json' };
import evenCLC from './fixtures/even_clc.json' with { type: 'json' };
import evenCUN from './fixtures/even_cun.json' with { type: 'json' };
import evenCUC from './fixtures/even_cuc.json' with { type: 'json' };
import n5NLN from './fixtures/n5_nln.json' with { type: 'json' };
import n5CUC from './fixtures/n5_cuc.json' with { type: 'json' };
import kZero from './fixtures/k_zero.json' with { type: 'json' };
import alpha0Beta0 from './fixtures/alpha0_beta0.json' with { type: 'json' };
import alpha0Beta1 from './fixtures/alpha0_beta1.json' with { type: 'json' };

var fixtures = {
	'odd_NLN': oddNLN,
	'odd_NLC': oddNLC,
	'odd_NUN': oddNUN,
	'odd_NUC': oddNUC,
	'odd_CLN': oddCLN,
	'odd_CLC': oddCLC,
	'odd_CUN': oddCUN,
	'odd_CUC': oddCUC,
	'even_NLN': evenNLN,
	'even_NLC': evenNLC,
	'even_NUN': evenNUN,
	'even_NUC': evenNUC,
	'even_CLN': evenCLN,
	'even_CLC': evenCLC,
	'even_CUN': evenCUN,
	'even_CUC': evenCUC,
	'n5_NLN': n5NLN,
	'n5_CUC': n5CUC,
	'k_zero': kZero,
	'alpha0_beta0': alpha0Beta0,
	'alpha0_beta1': alpha0Beta1
};


// VARIABLES //

var TRANSR_MAP = {
	'N': 'no-transpose',
	'C': 'conjugate-transpose'
};
var UPLO_MAP = {
	'L': 'lower',
	'U': 'upper'
};
var TRANS_MAP = {
	'N': 'no-transpose',
	'C': 'conjugate-transpose'
};


// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual array
* @param {*} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= tol, msg + '[' + i + ']: expected 0, got ' + actual[ i ] ); // eslint-disable-line max-len
		} else {
			relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
			assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* Runs a fixture-based test for one TRANSR/UPLO/TRANS combination.
*
* @private
* @param {string} name - fixture case name
*/
function runComboTest( name ) {
	var transr;
	var nrowa;
	var alpha;
	var cView;
	var trans;
	var uplo;
	var beta;
	var cArr;
	var aArr;
	var tc;
	var ka;
	var nt;
	var K;
	var N;
	var i;

	tc = fixtures[ name ];
	N = tc.N;
	K = tc.K;
	alpha = tc.alpha;
	beta = tc.beta;
	transr = TRANSR_MAP[ tc.transr ];
	uplo = UPLO_MAP[ tc.uplo ];
	trans = TRANS_MAP[ tc.trans ];

	if ( trans === 'no-transpose' ) {
		nrowa = N;
		ka = K;
	} else {
		nrowa = K;
		ka = N;
	}

	// Build A as Complex128Array from flat interleaved doubles:
	aArr = new Complex128Array( nrowa * ka );
	for ( i = 0; i < tc.A.length; i++ ) {
		reinterpret( aArr, 0 )[ i ] = tc.A[ i ];
	}

	// Build C as Complex128Array from flat interleaved doubles:
	nt = ( N * ( N + 1 ) ) / 2;
	cArr = new Complex128Array( nt );
	for ( i = 0; i < tc.C_input.length; i++ ) {
		reinterpret( cArr, 0 )[ i ] = tc.C_input[ i ];
	}

	// Column-major: strideA1=1, strideA2=nrowa
	zhfrk( transr, uplo, trans, N, K, alpha, aArr, 1, nrowa, 0, beta, cArr, 1, 0 ); // eslint-disable-line max-len

	cView = reinterpret( cArr, 0 );
	assertArrayClose( cView, tc.C_out, 1e-14, name );
}


// TESTS //

test( 'zhfrk: odd N, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runComboTest( 'odd_NLN' );
});

test( 'zhfrk: odd N, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runComboTest( 'odd_NLC' );
});

test( 'zhfrk: odd N, TRANSR=N, UPLO=U, TRANS=N', function t() {
	runComboTest( 'odd_NUN' );
});

test( 'zhfrk: odd N, TRANSR=N, UPLO=U, TRANS=C', function t() {
	runComboTest( 'odd_NUC' );
});

test( 'zhfrk: odd N, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runComboTest( 'odd_CLN' );
});

test( 'zhfrk: odd N, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runComboTest( 'odd_CLC' );
});

test( 'zhfrk: odd N, TRANSR=C, UPLO=U, TRANS=N', function t() {
	runComboTest( 'odd_CUN' );
});

test( 'zhfrk: odd N, TRANSR=C, UPLO=U, TRANS=C', function t() {
	runComboTest( 'odd_CUC' );
});

test( 'zhfrk: even N, TRANSR=N, UPLO=L, TRANS=N', function t() {
	runComboTest( 'even_NLN' );
});

test( 'zhfrk: even N, TRANSR=N, UPLO=L, TRANS=C', function t() {
	runComboTest( 'even_NLC' );
});

test( 'zhfrk: even N, TRANSR=N, UPLO=U, TRANS=N', function t() {
	runComboTest( 'even_NUN' );
});

test( 'zhfrk: even N, TRANSR=N, UPLO=U, TRANS=C', function t() {
	runComboTest( 'even_NUC' );
});

test( 'zhfrk: even N, TRANSR=C, UPLO=L, TRANS=N', function t() {
	runComboTest( 'even_CLN' );
});

test( 'zhfrk: even N, TRANSR=C, UPLO=L, TRANS=C', function t() {
	runComboTest( 'even_CLC' );
});

test( 'zhfrk: even N, TRANSR=C, UPLO=U, TRANS=N', function t() {
	runComboTest( 'even_CUN' );
});

test( 'zhfrk: even N, TRANSR=C, UPLO=U, TRANS=C', function t() {
	runComboTest( 'even_CUC' );
});

test( 'zhfrk: N=5 (larger odd), TRANSR=N, UPLO=L, TRANS=N', function t() { // eslint-disable-line max-len
	runComboTest( 'n5_NLN' );
});

test( 'zhfrk: N=5 (larger odd), TRANSR=C, UPLO=U, TRANS=C', function t() { // eslint-disable-line max-len
	runComboTest( 'n5_CUC' );
});

test( 'zhfrk: N=0 (quick return)', function t() {
	var cArr = new Complex128Array( 1 );
	var aArr = new Complex128Array( 1 );

	reinterpret( cArr, 0 )[ 0 ] = 99.0;
	reinterpret( cArr, 0 )[ 1 ] = 88.0;

	zhfrk( 'no-transpose', 'lower', 'no-transpose', 0, 0, 1.0, aArr, 1, 1, 0, 1.0, cArr, 1, 0 ); // eslint-disable-line max-len

	assert.equal( reinterpret( cArr, 0 )[ 0 ], 99.0 );
	assert.equal( reinterpret( cArr, 0 )[ 1 ], 88.0 );
});

test( 'zhfrk: K=0, beta=2 (scale only)', function t() {
	var cView;
	var cArr;
	var aArr;
	var tc;
	var nt;
	var i;

	tc = fixtures[ 'k_zero' ];
	nt = ( 3 * 4 ) / 2;
	cArr = new Complex128Array( nt );
	aArr = new Complex128Array( 1 );

	for ( i = 0; i < tc.C_input.length; i++ ) {
		reinterpret( cArr, 0 )[ i ] = tc.C_input[ i ];
	}

	zhfrk( 'no-transpose', 'lower', 'no-transpose', 3, 0, 1.0, aArr, 1, 3, 0, 2.0, cArr, 1, 0 ); // eslint-disable-line max-len

	cView = reinterpret( cArr, 0 );
	assertArrayClose( cView, tc.C_out, 1e-14, 'k_zero' );
});

test( 'zhfrk: alpha=0, beta=0 (zero out)', function t() {
	var cView;
	var cArr;
	var aArr;
	var tc;
	var nt;
	var i;

	tc = fixtures[ 'alpha0_beta0' ];
	nt = ( 3 * 4 ) / 2;
	cArr = new Complex128Array( nt );
	aArr = new Complex128Array( 3 * 2 );

	for ( i = 0; i < tc.C_input.length; i++ ) {
		reinterpret( cArr, 0 )[ i ] = tc.C_input[ i ];
	}

	zhfrk( 'no-transpose', 'lower', 'no-transpose', 3, 2, 0.0, aArr, 1, 3, 0, 0.0, cArr, 1, 0 ); // eslint-disable-line max-len

	cView = reinterpret( cArr, 0 );
	assertArrayClose( cView, tc.C_out, 1e-14, 'alpha0_beta0' );
});

test( 'zhfrk: alpha=0, beta=1 (quick return)', function t() {
	var cView;
	var cArr;
	var aArr;
	var tc;
	var nt;
	var i;

	tc = fixtures[ 'alpha0_beta1' ];
	nt = ( 3 * 4 ) / 2;
	cArr = new Complex128Array( nt );
	aArr = new Complex128Array( 3 * 2 );

	for ( i = 0; i < tc.C_input.length; i++ ) {
		reinterpret( cArr, 0 )[ i ] = tc.C_input[ i ];
	}

	zhfrk( 'no-transpose', 'lower', 'no-transpose', 3, 2, 0.0, aArr, 1, 3, 0, 1.0, cArr, 1, 0 ); // eslint-disable-line max-len

	cView = reinterpret( cArr, 0 );
	assertArrayClose( cView, tc.C_out, 1e-14, 'alpha0_beta1' );
});
