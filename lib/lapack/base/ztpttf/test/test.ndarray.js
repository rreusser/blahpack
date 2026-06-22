import __imp0 from './fixtures/n1_n_l.json' with { type: 'json' };
import __imp1 from './fixtures/n1_c_u.json' with { type: 'json' };
import __imp2 from './fixtures/n5_n_l.json' with { type: 'json' };
import __imp3 from './fixtures/n5_n_u.json' with { type: 'json' };
import __imp4 from './fixtures/n5_c_l.json' with { type: 'json' };
import __imp5 from './fixtures/n5_c_u.json' with { type: 'json' };
import __imp6 from './fixtures/n6_n_l.json' with { type: 'json' };
import __imp7 from './fixtures/n6_n_u.json' with { type: 'json' };
import __imp8 from './fixtures/n6_c_l.json' with { type: 'json' };
import __imp9 from './fixtures/n6_c_u.json' with { type: 'json' };
import __imp10 from './fixtures/n7_n_l.json' with { type: 'json' };
import __imp11 from './fixtures/n7_n_u.json' with { type: 'json' };
import __imp12 from './fixtures/n7_c_l.json' with { type: 'json' };
import __imp13 from './fixtures/n7_c_u.json' with { type: 'json' };
import __imp14 from './fixtures/n8_n_l.json' with { type: 'json' };
import __imp15 from './fixtures/n8_n_u.json' with { type: 'json' };
import __imp16 from './fixtures/n8_c_l.json' with { type: 'json' };
import __imp17 from './fixtures/n8_c_u.json' with { type: 'json' };



// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpttf from './../lib/ndarray.js';


// FIXTURES //

var fixtures = {
	'n1_N_L': __imp0,
	'n1_C_U': __imp1,
	'n5_N_L': __imp2,
	'n5_N_U': __imp3,
	'n5_C_L': __imp4,
	'n5_C_U': __imp5,
	'n6_N_L': __imp6,
	'n6_N_U': __imp7,
	'n6_C_L': __imp8,
	'n6_C_U': __imp9,
	'n7_N_L': __imp10,
	'n7_N_U': __imp11,
	'n7_C_L': __imp12,
	'n7_C_U': __imp13,
	'n8_N_L': __imp14,
	'n8_N_U': __imp15,
	'n8_C_L': __imp16,
	'n8_C_U': __imp17
};


// FUNCTIONS //

/**
* Runs a standard ztpttf test case against a fixture.
*
* @private
* @param {string} transr - transr string
* @param {string} uplo - uplo string
* @param {NonNegativeInteger} N - matrix order
* @param {string} caseName - fixture case name
*/
function runTest( transr, uplo, N, caseName ) {
	var expected;
	var actual;
	var info;
	var APv;
	var tc;
	var nt;
	var AP;
	var i;

	tc = fixtures[ caseName ];
	nt = ( N * ( N + 1 ) ) / 2;
	AP = new Complex128Array( nt );
	APv = reinterpret( AP, 0 );
	for ( i = 0; i < 2 * nt; i += 1 ) {
		APv[ i ] = tc.AP[ i ];
	}
	actual = new Complex128Array( nt );
	expected = new Float64Array( tc.ARF );

	info = ztpttf( transr, uplo, N, AP, 1, 0, actual, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
	var actualv = reinterpret( actual, 0 );
	for ( i = 0; i < 2 * nt; i += 1 ) {
		assert.equal( actualv[ i ], expected[ i ], 'ARF[' + i + '] mismatch' );
	}
}


// TESTS //

test( 'ztpttf is a function', function t() {
	assert.equal( typeof ztpttf, 'function' );
});

test( 'ztpttf: N=0 quick return', function t() {
	var ARF;
	var AP;
	var info;

	AP = new Complex128Array( 0 );
	ARF = new Complex128Array( 0 );
	info = ztpttf( 'no-transpose', 'lower', 0, AP, 1, 0, ARF, 1, 0 );
	assert.equal( info, 0, 'info should be 0 for N=0' );
});

test( 'ztpttf: N=1, no-transpose, lower', function t() {
	var tc = fixtures.n1_N_L;
	var ARFv;
	var ARF;
	var APv;
	var AP;
	var info;

	AP = new Complex128Array( 1 );
	APv = reinterpret( AP, 0 );
	APv[ 0 ] = 42.0;
	APv[ 1 ] = 7.0;
	ARF = new Complex128Array( 1 );
	info = ztpttf( 'no-transpose', 'lower', 1, AP, 1, 0, ARF, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
	ARFv = reinterpret( ARF, 0 );
	assert.equal( ARFv[ 0 ], tc.ARF[ 0 ], 'ARF[0] real' );
	assert.equal( ARFv[ 1 ], tc.ARF[ 1 ], 'ARF[0] imag' );
});

test( 'ztpttf: N=1, conjugate-transpose, upper', function t() {
	var tc = fixtures.n1_C_U;
	var ARFv;
	var ARF;
	var APv;
	var AP;
	var info;

	AP = new Complex128Array( 1 );
	APv = reinterpret( AP, 0 );
	APv[ 0 ] = 99.0;
	APv[ 1 ] = -3.0;
	ARF = new Complex128Array( 1 );
	info = ztpttf( 'conjugate-transpose', 'upper', 1, AP, 1, 0, ARF, 1, 0 );
	assert.equal( info, 0, 'info should be 0' );
	ARFv = reinterpret( ARF, 0 );
	assert.equal( ARFv[ 0 ], tc.ARF[ 0 ], 'ARF[0] real' );
	assert.equal( ARFv[ 1 ], tc.ARF[ 1 ], 'ARF[0] imag' );
});

// N=5 (odd) — all 4 combinations
test( 'ztpttf: N=5, no-transpose, lower (odd, normal, lower)', function t() {
	runTest( 'no-transpose', 'lower', 5, 'n5_N_L' );
});

test( 'ztpttf: N=5, no-transpose, upper (odd, normal, upper)', function t() {
	runTest( 'no-transpose', 'upper', 5, 'n5_N_U' );
});

test( 'ztpttf: N=5, conjugate-transpose, lower (odd, conj-trans, lower)', function t() {
	runTest( 'conjugate-transpose', 'lower', 5, 'n5_C_L' );
});

test( 'ztpttf: N=5, conjugate-transpose, upper (odd, conj-trans, upper)', function t() {
	runTest( 'conjugate-transpose', 'upper', 5, 'n5_C_U' );
});

// N=6 (even) — all 4 combinations
test( 'ztpttf: N=6, no-transpose, lower (even, normal, lower)', function t() {
	runTest( 'no-transpose', 'lower', 6, 'n6_N_L' );
});

test( 'ztpttf: N=6, no-transpose, upper (even, normal, upper)', function t() {
	runTest( 'no-transpose', 'upper', 6, 'n6_N_U' );
});

test( 'ztpttf: N=6, conjugate-transpose, lower (even, conj-trans, lower)', function t() {
	runTest( 'conjugate-transpose', 'lower', 6, 'n6_C_L' );
});

test( 'ztpttf: N=6, conjugate-transpose, upper (even, conj-trans, upper)', function t() {
	runTest( 'conjugate-transpose', 'upper', 6, 'n6_C_U' );
});

// N=7 (odd, larger) — all 4 combinations
test( 'ztpttf: N=7, no-transpose, lower (odd, normal, lower)', function t() {
	runTest( 'no-transpose', 'lower', 7, 'n7_N_L' );
});

test( 'ztpttf: N=7, no-transpose, upper (odd, normal, upper)', function t() {
	runTest( 'no-transpose', 'upper', 7, 'n7_N_U' );
});

test( 'ztpttf: N=7, conjugate-transpose, lower (odd, conj-trans, lower)', function t() {
	runTest( 'conjugate-transpose', 'lower', 7, 'n7_C_L' );
});

test( 'ztpttf: N=7, conjugate-transpose, upper (odd, conj-trans, upper)', function t() {
	runTest( 'conjugate-transpose', 'upper', 7, 'n7_C_U' );
});

// N=8 (even, larger) — all 4 combinations
test( 'ztpttf: N=8, no-transpose, lower (even, normal, lower)', function t() {
	runTest( 'no-transpose', 'lower', 8, 'n8_N_L' );
});

test( 'ztpttf: N=8, no-transpose, upper (even, normal, upper)', function t() {
	runTest( 'no-transpose', 'upper', 8, 'n8_N_U' );
});

test( 'ztpttf: N=8, conjugate-transpose, lower (even, conj-trans, lower)', function t() {
	runTest( 'conjugate-transpose', 'lower', 8, 'n8_C_L' );
});

test( 'ztpttf: N=8, conjugate-transpose, upper (even, conj-trans, upper)', function t() {
	runTest( 'conjugate-transpose', 'upper', 8, 'n8_C_U' );
});
