import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlascl from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zlascl_basic from './fixtures/zlascl_basic.json' with { type: 'json' };
import zlascl_half from './fixtures/zlascl_half.json' with { type: 'json' };
import zlascl_m_zero from './fixtures/zlascl_m_zero.json' with { type: 'json' };
import zlascl_upper from './fixtures/zlascl_upper.json' with { type: 'json' };
import zlascl_lower from './fixtures/zlascl_lower.json' with { type: 'json' };
import zlascl_identity from './fixtures/zlascl_identity.json' with { type: 'json' };
import zlascl_hessenberg from './fixtures/zlascl_hessenberg.json' with { type: 'json' };
import zlascl_large_ratio from './fixtures/zlascl_large_ratio.json' with { type: 'json' };
import zlascl_large_ratio_inv from './fixtures/zlascl_large_ratio_inv.json' with { type: 'json' };
import zlascl_lower_band from './fixtures/zlascl_lower_band.json' with { type: 'json' };
import zlascl_upper_band from './fixtures/zlascl_upper_band.json' with { type: 'json' };
import zlascl_band from './fixtures/zlascl_band.json' with { type: 'json' };
// HELPERS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= 1e-14, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, msg ) {
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

function c128( arr ) {
	return new Complex128Array( arr );
}

function extractCMatrix( Av, strideA1, strideA2, offsetA, M, N ) {
	var out = [];
	var ai;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ai = offsetA + 2 * ( i * strideA1 + j * strideA2 );
			out.push( Av[ ai ] );
			out.push( Av[ ai + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zlascl: main export is a function', function t() {
	assert.strictEqual( typeof zlascl, 'function' );
});

test( 'zlascl: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlascl.ndarray, 'function' );
});

test( 'zlascl: basic scaling (multiply by 2)', function t() {
	var tc = zlascl_basic;
	var A = c128( new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] ) );
	var info = base( 'general', 0, 0, 1.0, 2.0, 2, 2, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_basic a' );
});

test( 'zlascl: scaling by 0.5 (cfrom=2, cto=1)', function t() {
	var tc = zlascl_half;
	var A = c128( new Float64Array( [ 2, 4, 6, 8, 10, 12, 14, 16 ] ) );
	var info = base( 'general', 0, 0, 2.0, 1.0, 2, 2, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_half a' );
});

test( 'zlascl: M=0 quick return', function t() {
	var tc = zlascl_m_zero;
	var A = c128( new Float64Array( [ 99, 88 ] ) );
	var info = base( 'general', 0, 0, 1.0, 2.0, 0, 2, A, 1, 1, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_m_zero a' );
});

test( 'zlascl: upper triangular', function t() {
	var tc = zlascl_upper;
	var A = c128( new Float64Array( [
		1, 0,  0, 0,  0, 0,
		2, 0,  4, 0,  0, 0,
		3, 0,  5, 0,  6, 0
	] ) );
	var Av = reinterpret( A, 0 );
	var info = base( 'upper', 0, 0, 1.0, 3.0, 3, 3, A, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	var result = extractCMatrix( Av, 1, 3, 0, 3, 3 );
	assertArrayClose( result, tc.a, 'zlascl_upper a' );
});

test( 'zlascl: lower triangular', function t() {
	var tc = zlascl_lower;
	var A = c128( new Float64Array( [
		1, 0,  2, 0,  3, 0,
		0, 0,  4, 0,  5, 0,
		0, 0,  0, 0,  6, 0
	] ) );
	var Av = reinterpret( A, 0 );
	var info = base( 'lower', 0, 0, 1.0, 3.0, 3, 3, A, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	var result = extractCMatrix( Av, 1, 3, 0, 3, 3 );
	assertArrayClose( result, tc.a, 'zlascl_lower a' );
});

test( 'zlascl: identity (cfrom=cto)', function t() {
	var tc = zlascl_identity;
	var A = c128( new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] ) );
	var info = base( 'general', 0, 0, 5.0, 5.0, 2, 2, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_identity a' );
});

test( 'zlascl: upper Hessenberg', function t() {
	var tc = zlascl_hessenberg;
	var A = c128( new Float64Array( [
		1, 0,  2, 0,  0, 0,
		3, 0,  4, 0,  5, 0,
		6, 0,  7, 0,  8, 0
	] ) );
	var Av = reinterpret( A, 0 );
	var info = base( 'upper-hessenberg', 0, 0, 1.0, 2.0, 3, 3, A, 1, 3, 0 );
	assert.strictEqual( info, tc.info );
	var result = extractCMatrix( Av, 1, 3, 0, 3, 3 );
	assertArrayClose( result, tc.a, 'zlascl_hessenberg a' );
});

test( 'zlascl: large cfrom/cto ratio (iterative scaling, mul=smlnum)', function t() {
	var tc = zlascl_large_ratio;
	var A = c128( new Float64Array( [ 1, 1, 2, 3 ] ) );
	var info = base( 'general', 0, 0, 1e300, 1e-300, 2, 1, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_large_ratio a' );
});

test( 'zlascl: large cto/cfrom ratio (iterative scaling, mul=bignum)', function t() {
	var tc = zlascl_large_ratio_inv;
	var A = c128( new Float64Array( [ 1e-150, 1e-150, 2e-150, 3e-150 ] ) );
	var info = base( 'general', 0, 0, 1e-150, 1e150, 2, 1, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_large_ratio_inv a' );
});

test( 'zlascl: lower band matrix (type B)', function t() {
	var tc = zlascl_lower_band;
	var A = c128( new Float64Array( [
		1, 0,  4, 0,
		2, 0,  5, 0,
		3, 0,  0, 0
	] ) );
	var info = base( 'lower-band', 1, 1, 1.0, 3.0, 3, 3, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_lower_band a' );
});

test( 'zlascl: upper band matrix (type Q)', function t() {
	var tc = zlascl_upper_band;
	var A = c128( new Float64Array( [
		0, 0,  3, 0,
		1, 0,  4, 0,
		2, 0,  5, 0
	] ) );
	var info = base( 'upper-band', 1, 1, 1.0, 3.0, 3, 3, A, 1, 2, 0 );
	assert.strictEqual( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.a, 'zlascl_upper_band a' );
});

test( 'zlascl: full band matrix (type Z)', function t() {
	var tc = zlascl_band;
	var A = c128( new Float64Array( [
		0, 0,  3, 0,  6, 0,  9, 0,
		1, 0,  4, 0,  7, 0,  10, 0,
		2, 0,  5, 0,  8, 0,  0, 0
	] ) );
	var Av = reinterpret( A, 0 );
	var info = base( 'band', 1, 1, 1.0, 2.0, 3, 3, A, 1, 4, 0 );
	assert.strictEqual( info, tc.info );
	var result = extractCMatrix( Av, 1, 4, 0, 4, 3 );
	assertArrayClose( result, tc.a, 'zlascl_band a' );
});

test( 'zlascl: invalid type throws TypeError', function t() {
	var A = c128( new Float64Array( [ 1, 2, 3, 4 ] ) );
	assert.throws( function badCall() {
		base( 'X', 0, 0, 1.0, 2.0, 1, 1, A, 1, 1, 0 );
	}, TypeError );
});

test( 'zlascl: cfrom=Infinity (lines 115-117)', function t() {
	// cfrom is Infinity: cfrom1 = Inf * smlnum = Inf === cfrom, so mul = cto/cfrom
	var A = c128( new Float64Array( [ 1e100, 2e100, 3e100, 4e100 ] ) );
	var info = base( 'general', 0, 0, Infinity, 1.0, 1, 2, A, 1, 1, 0 );
	assert.strictEqual( info, 0 );
	// mul = 1.0 / Infinity = 0, so everything should be 0
	var Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), [ 0, 0, 0, 0 ], 'cfrom_inf a' );
});

test( 'zlascl: cto=0 (lines 121-124)', function t() {
	// cto=0: cto1 = 0/bignum = 0 === ctoc, so mul = 0
	var A = c128( new Float64Array( [ 5, 6, 7, 8 ] ) );
	var info = base( 'general', 0, 0, 1.0, 0.0, 1, 2, A, 1, 1, 0 );
	assert.strictEqual( info, 0 );
	var Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), [ 0, 0, 0, 0 ], 'cto_zero a' );
});

test( 'zlascl: small cfrom, large cto (lines 130-132, mul=bignum path)', function t() {
	// Need abs(cto1) > abs(cfromc) where cto1 = ctoc/bignum
	// and NOT cfrom1 === cfromc, NOT cto1 === ctoc, NOT cfrom1 > ctoc
	// cfrom = 1e-300, cto = 1e300
	// cfrom1 = 1e-300 * smlnum ~ 1e-300 * 2.2e-308 = 2.2e-608 (not equal to cfrom)
	// cto1 = 1e300 / bignum ~ 1e300 / 4.5e307 ~ 2.2e-8 (not equal to cto)
	// cfrom1 > ctoc? 2.2e-608 > 1e300? NO
	// cto1 > cfromc? 2.2e-8 > 1e-300? YES -> hits lines 130-132
	var A = c128( new Float64Array( [ 1, 2, 3, 4 ] ) );
	var info = base( 'general', 0, 0, 1e-300, 1e300, 1, 2, A, 1, 1, 0 );
	assert.strictEqual( info, 0 );
	// The iterative scaling should eventually reach the right ratio
	var Av = reinterpret( A, 0 );
	// Each element should be multiplied by 1e300/1e-300 = 1e600
	// But this is done iteratively, so the result should be huge
	// Just verify they're non-zero and scaled up
	assert.ok( Av[ 0 ] > 1e100, 'scaled up: ' + Av[ 0 ] );
});
