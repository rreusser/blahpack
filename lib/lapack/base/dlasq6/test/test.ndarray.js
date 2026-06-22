/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq6 from './../lib/index.js';


// FUNCTIONS //

/**
* AssertApprox.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertApprox( actual, expected, tol, msg ) {
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': got ' + actual + ', expected ' + expected ); // eslint-disable-line max-len
	} else {
		var rel = Math.abs( ( actual - expected ) / expected );
		assert.ok( rel <= tol, msg + ': got ' + actual + ', expected ' + expected + ' (rel=' + rel + ')' ); // eslint-disable-line max-len
	}
}

/**
* AssertArrayApprox.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayApprox( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertApprox( actual[i], expected[i], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dlasq6: main export is a function', function t() {
	assert.strictEqual( typeof dlasq6, 'function' );
});

test( 'dlasq6: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlasq6.ndarray, 'function' );
});

test( 'dlasq6.ndarray: quick return when n0 - i0 - 1 <= 0', function t() {
	var result;
	var z;

	z = new Float64Array( [ 1.0, 0.5, 1.0, 0.5 ] );
	result = dlasq6.ndarray( 1, 2, z, 1, 0, 0 );
	assert.equal( typeof result, 'object' );
	assert.equal( result.dmin, 0.0 );
	assert.equal( result.dn, 0.0 );
});

test( 'dlasq6.ndarray: basic pp=0 (n=5)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 8.0, 4.0, 1.5, 3.0, 4.5, 3.0, 1.33333333333333326, 2.0, 2.66666666666666652, 2.0, 3.75, 5.0, 6.25, 5.0, 0.800000000000000044, 1.0, 0.200000000000000011, 1.0, 1.33333333333333326 ]; // eslint-disable-line max-len
	z = new Float64Array([
		4.0,
		1.0,
		4.0,
		1.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.200000000000000011, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 0.666666666666666630, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.666666666666666630, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.200000000000000011, 1e-12, 'dn' );
	assertApprox( result.dnm1, 1.25, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.666666666666666630, 1e-12, 'dnm2' );
});

test( 'dlasq6.ndarray: basic pp=1 (n=5)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 2.0, 1.0, 0.25, 1.0, 0.75, 0.5, 0.199999999999999983, 0.5, 0.399999999999999967, 0.3, 0.150000000000000022, 0.3, 0.25, 0.2, 0.0, 0.2, 0.0, 0.0, 0.199999999999999983, 0.0 ]; // eslint-disable-line max-len
	z = new Float64Array([
		4.0,
		1.0,
		4.0,
		1.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 1 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dmin1, 0.0500000000000000097, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.0999999999999999917, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 0.0500000000000000097, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.0999999999999999917, 1e-12, 'dnm2' );
});

test( 'dlasq6.ndarray: n=4, pp=0', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 8.0, 4.0, 1.5, 3.0, 4.5, 3.0, 1.33333333333333326, 2.0, 2.66666666666666652, 2.0, 3.75, 5.0, 1.25, 5.0, 1.5 ]; // eslint-disable-line max-len
	z = new Float64Array([
		4.0,
		1.0,
		4.0,
		1.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2
	]);
	result = dlasq6.ndarray( 1, 4, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.666666666666666630, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 0.666666666666666630, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 1.5, 1e-12, 'dmin2' );
	assertApprox( result.dn, 1.25, 1e-12, 'dn' );
	assertApprox( result.dnm1, 0.666666666666666630, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 1.5, 1e-12, 'dnm2' );
});

test( 'dlasq6.ndarray: n=3, pp=0 (minimal)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 8.0, 4.0, 1.5, 3.0, 4.5, 3.0, 1.33333333333333326, 2.0, 0.666666666666666630, 2.0, 3.0 ]; // eslint-disable-line max-len
	z = new Float64Array([
		4.0,
		1.0,
		4.0,
		1.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3
	]);
	result = dlasq6.ndarray( 1, 3, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.666666666666666630, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 1.5, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 4.0, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.666666666666666630, 1e-12, 'dn' );
	assertApprox( result.dnm1, 1.5, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 4.0, 1e-12, 'dnm2' );
});

test( 'dlasq6.ndarray: zero element pp=0 (n=5)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 8.0, 4.0, 1.5, 3.0, 4.5, 3.0, 1.33333333333333326, 2.0, 2.66666666666666652, 2.0, 3.75, 5.0, 6.25, 5.0, 0.800000000000000044, 1.0, 0.200000000000000011, 1.0, 1.33333333333333326 ]; // eslint-disable-line max-len
	z = new Float64Array([
		4.0,
		0.0,
		4.0,
		0.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.200000000000000011, 1e-12, 'dmin' );
	assertApprox( result.dn, 0.200000000000000011, 1e-12, 'dn' );
});

test( 'dlasq6.ndarray: larger values pp=0 (n=5)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 10.0, 20.0, 10.0, 4.0, 8.0, 12.0, 8.0, 4.0, 6.0, 8.0, 6.0, 3.0, 4.0, 5.0, 4.0, 1.6, 2.0, 0.4, 2.0, 4.0 ]; // eslint-disable-line max-len
	z = new Float64Array([
		10.0,
		2.0,
		10.0,
		2.0,
		8.0,
		1.5,
		8.0,
		1.5,
		6.0,
		1.0,
		6.0,
		1.0,
		4.0,
		0.5,
		4.0,
		0.5,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.4, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 1.0, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 2.0, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.4, 1e-12, 'dn' );
	assertApprox( result.dnm1, 1.0, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 2.0, 1e-12, 'dnm2' );
});

test( 'dlasq6.ndarray: very small values pp=0 (unsafe computation branch)', function t() { // eslint-disable-line max-len
	var expected_z;
	var result;
	var z;

	expected_z = [ 1e-300, 2e-300, 1e-300, 5e-301, 1e-300, 1.5e-300, 1e-300, 6.66666666666666683e-301, 1e-300, 1.33333333333333337e-300, 1e-300, 7.5e-301, 1e-300, 1.25e-300, 1e-300, 8.00000000000000053e-301, 1e-300, 2.00000000000000013e-301, 1e-300, 5e-301 ]; // eslint-disable-line max-len
	z = new Float64Array([
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		1e-300,
		0.0,
		1e-300,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-10, 'z' );
	assertApprox( result.dmin, 2.00000000000000013e-301, 1e-10, 'dmin' );
	assertApprox( result.dn, 2.00000000000000013e-301, 1e-10, 'dn' );
});

test( 'dlasq6.ndarray: zero denominator in unrolled step (n=3)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 8.0, 4.0, 1.5, 3.0, 4.5, 3.0, 0.0, 0.0, 0.0, 0.0, 3.0 ];
	z = new Float64Array([
		4.0,
		1.0,
		4.0,
		1.0,
		3.0,
		0.5,
		3.0,
		0.5,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 3, z, 1, 0, 0 );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dmin1, 1.5, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 4.0, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 1.5, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 4.0, 1e-12, 'dnm2' );
});

test( 'dlasq6.ndarray: pp=0 zero denominator in main loop', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.0,
		1.0,
		0.0,
		0.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 0 );
	assertApprox( result.dmin, 0.25, 1e-12, 'dmin' );
	assertApprox( result.dn, 0.25, 1e-12, 'dn' );
});

test( 'dlasq6.ndarray: pp=1 zero denominator in main loop', function t() {
	var result;
	var z;

	z = new Float64Array([
		1.0,
		0.0,
		1.0,
		0.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 1 );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq6.ndarray: pp=0 unsafe division branch (subnormal values)', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		5e-324,
		0.0,
		5e-324,
		0.0,
		3.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 0 );
	assertApprox( result.dmin, 5e-324, 1e-10, 'dmin' );
	assertApprox( result.dn, 0.2, 1e-12, 'dn' );
});

test( 'dlasq6.ndarray: pp=1 unsafe division branch (subnormal values)', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		1.0,
		5e-324,
		1.0,
		0.0,
		3.0,
		1.0,
		3.0,
		1.0,
		2.0,
		0.3,
		2.0,
		0.3,
		5.0,
		0.2,
		5.0,
		0.2,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 5, z, 1, 0, 1 );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq6.ndarray: unrolled step 1 zero denominator (n=3)', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.0,
		1.0,
		0.0,
		0.0,
		3.0,
		0.5,
		3.0,
		0.5,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 3, z, 1, 0, 0 );
	assertApprox( result.dmin, 1.0, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 3.0, 1e-12, 'dmin1' );
	assertApprox( result.dnm2, 0.0, 1e-14, 'dnm2' );
	assertApprox( result.dnm1, 3.0, 1e-12, 'dnm1' );
	assertApprox( result.dn, 1.0, 1e-12, 'dn' );
});

test( 'dlasq6.ndarray: unrolled step 2 zero denominator (n=3)', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		0.0,
		0.5,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 3, z, 1, 0, 0 );
	assertApprox( result.dmin, 2.0, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 0.0, 1e-14, 'dmin1' );
	assertApprox( result.dnm2, 0.0, 1e-14, 'dnm2' );
	assertApprox( result.dnm1, 0.0, 1e-14, 'dnm1' );
	assertApprox( result.dn, 2.0, 1e-12, 'dn' );
});

test( 'dlasq6.ndarray: unrolled unsafe division branch (n=3)', function t() {
	var result;
	var z;

	z = new Float64Array([
		5e-324,
		1.0,
		0.0,
		1.0,
		1.0,
		0.5,
		1.0,
		0.5,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq6.ndarray( 1, 3, z, 1, 0, 0 );
	assertApprox( result.dmin, 5e-324, 1e-10, 'dmin' );
	assertApprox( result.dnm2, 5e-324, 1e-10, 'dnm2' );
	assertApprox( result.dn, 1.0, 1e-12, 'dn' );
});
