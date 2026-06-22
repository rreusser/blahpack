/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq5 from './../lib/index.js';


// FUNCTIONS //

var EPS = 2.220446049250313e-16;

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

test( 'dlasq5: main export is a function', function t() {
	assert.strictEqual( typeof dlasq5, 'function' );
});

test( 'dlasq5: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof dlasq5.ndarray, 'function' );
});

test( 'dlasq5.ndarray: quick return when n0 - i0 - 1 <= 0', function t() {
	var result;
	var z;

	z = new Float64Array( [ 1.0, 0.5, 1.0, 0.5 ] );
	result = dlasq5.ndarray( 1, 2, z, 1, 0, 0, 0.1, 1.0, true, EPS );
	assert.equal( typeof result, 'object' );
	assert.equal( result.dmin, 0.0 );
	assert.equal( result.dn, 0.0 );
});

test( 'dlasq5.ndarray: basic IEEE pp=0 (n=5, tau=0.1, sigma=1.0)', function t() { // eslint-disable-line max-len
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 7.9, 4.0, 1.51898734177215178, 3.0, 4.38101265822784747, 3.0, 1.36954637388038170, 2.0, 2.53045362611961888, 2.0, 3.95186060585300103, 5.0, 5.94813939414699888, 5.0, 0.840598995531279369, 1.0, 0.0594010044687205696, 1.0, 1.36954637388038170 ]; // eslint-disable-line max-len
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.1, 1.0, true, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.0594010044687205696, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 0.530453626119618660, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.530453626119618660, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0594010044687205696, 1e-12, 'dn' );
	assertApprox( result.dnm1, 0.948139394146998660, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.530453626119618660, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: basic IEEE pp=1 (n=5, tau=0.1, sigma=1.0)', function t() { // eslint-disable-line max-len
	var expected_z;
	var result;
	var z;

	expected_z = [ 1.89999999999999991, 1.0, 0.263157894736842091, 1.0, 0.636842105263157876, 0.5, 0.235537190082644621, 0.5, 0.264462809917355324, 0.3, 0.226875000000000049, 0.3, 0.0731249999999999956, 0.2, 0.0, 0.2, -0.100000000000000006, 0.0, 0.235537190082644621, 0.0 ]; // eslint-disable-line max-len
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.1, 1.0, true, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, -0.126875000000000016, 1e-12, 'dmin' );
	assertApprox( result.dmin1, -0.126875000000000016, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, -0.0355371900826446444, 1e-12, 'dmin2' );
	assertApprox( result.dn, -0.100000000000000006, 1e-12, 'dn' );
	assertApprox( result.dnm1, -0.126875000000000016, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, -0.0355371900826446444, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: tau=0 IEEE pp=0 (n=5, sigma=1.0)', function t() {
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.0, 1.0, true, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.200000000000000011, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 0.666666666666666630, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.666666666666666630, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.200000000000000011, 1e-12, 'dn' );
	assertApprox( result.dnm1, 1.25, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.666666666666666630, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: non-IEEE pp=0 (n=5, tau=0.1, sigma=1.0)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 7.9, 4.0, 1.51898734177215156, 3.0, 4.38101265822784747, 3.0, 1.36954637388038170, 2.0, 2.53045362611961888, 2.0, 3.95186060585300103, 5.0, 5.94813939414699888, 5.0, 0.840598995531279369, 1.0, 0.0594010044687205696, 1.0, 1.36954637388038170 ]; // eslint-disable-line max-len
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.1, 1.0, false, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.0594010044687205696, 1e-12, 'dmin' );
	assertApprox( result.dmin1, 0.530453626119618660, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.530453626119618660, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0594010044687205696, 1e-12, 'dn' );
	assertApprox( result.dnm1, 0.948139394146998660, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.530453626119618660, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=0 (n=5, sigma=1.0)', function t() {
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.0, 1.0, false, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.200000000000000011, 1e-12, 'dmin' );
	assertApprox( result.dn, 0.200000000000000011, 1e-12, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=1 (n=5, sigma=1.0)', function t() {
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.0, 1.0, false, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dmin1, 0.0500000000000000028, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.0999999999999999917, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 0.0500000000000000028, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.0999999999999999917, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: n=4, IEEE pp=0', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 7.8, 4.0, 1.53846153846153855, 3.0, 4.26153846153846150, 3.0, 1.40794223826714804, 2.0, 2.39205776173285178, 2.0, 4.18050105644431103, 5.0, 0.619498943555689685, 5.0, 1.53846153846153855 ]; // eslint-disable-line max-len
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
	result = dlasq5.ndarray( 1, 4, z, 1, 0, 0, 0.2, 0.5, true, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.392057761732851950, 1e-12, 'dmin' );
	assertApprox( result.dn, 0.619498943555689685, 1e-12, 'dn' );
});

test( 'dlasq5.ndarray: non-IEEE pp=1 (n=5, tau=0.1, sigma=1.0)', function t() {
	var result;
	var z;

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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.1, 1.0, false, EPS );
	assertApprox( result.dmin, -0.0355371900826446235, 1e-12, 'dmin' );
	assertApprox( result.dmin2, -0.0355371900826446235, 1e-12, 'dmin2' );
	assertApprox( result.dnm2, -0.0355371900826446235, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: tau=0 IEEE pp=1 (n=5, sigma=1.0)', function t() {
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.0, 1.0, true, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dmin1, 0.0500000000000000028, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.0999999999999999917, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 0.0500000000000000028, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.0999999999999999917, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: n=3, IEEE pp=0 (minimal)', function t() {
	var expected_z;
	var result;
	var z;

	expected_z = [ 4.0, 7.9, 4.0, 1.51898734177215156, 3.0, 4.38101265822784747, 3.0, 1.36954637388038170, 2.0, 0.530453626119618660, 2.0, 3.0 ]; // eslint-disable-line max-len
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
	result = dlasq5.ndarray( 1, 3, z, 1, 0, 0, 0.1, 0.5, true, EPS );
	assertArrayApprox( z, expected_z, 1e-12, 'z' );
	assertApprox( result.dmin, 0.530453626119618660, 1e-12, 'dmin' );
	assertApprox( result.dn, 0.530453626119618660, 1e-12, 'dn' );
	assertApprox( result.dnm1, 1.38101265822784791, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 3.89999999999999991, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: non-IEEE pp=0, d<0 early return in main loop', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		0.5,
		1.0,
		0.5,
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 1.0, 1.0, false, EPS );
	assertApprox( result.dmin, -0.5, 1e-12, 'dmin' );
	assertApprox( result.dmin1, -0.5, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.0, 1e-14, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 0.0, 1e-14, 'dnm1' );
	assertApprox( result.dnm2, 0.0, 1e-14, 'dnm2' );
});

test( 'dlasq5.ndarray: non-IEEE pp=1, d<0 early return in main loop', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		0.5,
		1.0,
		0.5,
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 1.0, 1.0, false, EPS );
	assertApprox( result.dmin, -1.0, 1e-12, 'dmin' );
	assertApprox( result.dmin1, -1.0, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.0, 1e-14, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 0.0, 1e-14, 'dnm1' );
	assertApprox( result.dnm2, 0.0, 1e-14, 'dnm2' );
});

test( 'dlasq5.ndarray: non-IEEE pp=0, dnm1<0 in unrolled step (n=3)', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		0.6,
		1.0,
		0.6,
		1.0,
		3.0,
		0.1,
		3.0,
		0.1,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq5.ndarray( 1, 3, z, 1, 0, 0, 0.5, 0.5, false, EPS );
	assertApprox( result.dmin, -0.07142857142857151, 1e-12, 'dmin' );
	assertApprox( result.dmin1, -0.07142857142857151, 1e-12, 'dmin1' );
	assertApprox( result.dmin2, 0.09999999999999998, 1e-12, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, -0.07142857142857151, 1e-12, 'dnm1' );
	assertApprox( result.dnm2, 0.09999999999999998, 1e-12, 'dnm2' );
});

test( 'dlasq5.ndarray: tau=0 IEEE pp=0, d<dthresh clamping', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		0.0,
		0.1,
		0.0
	]);
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.0, 1e15, true, EPS );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 IEEE pp=1, d<dthresh clamping', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.0,
		0.01,
		0.0
	]);
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.0, 1e15, true, EPS );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=0, d<dthresh clamping', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		1.0,
		0.1,
		0.0,
		0.1,
		0.0
	]);
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.0, 1e15, false, EPS );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=1, d<dthresh clamping', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.01,
		0.0,
		0.01,
		0.0
	]);
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.0, 1e15, false, EPS );
	assertApprox( result.dmin, 0.0, 1e-14, 'dmin' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=0, d<0 guard (negative Z)', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		-0.1,
		1.0,
		-0.1,
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 0, 0.0, 1.0, false, EPS );
	assertApprox( result.dmin, -0.1, 1e-12, 'dmin' );
	assertApprox( result.dmin2, 0.0, 1e-14, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=1, d<0 guard (negative Z)', function t() { // eslint-disable-line max-len
	var result;
	var z;

	z = new Float64Array([
		1.0,
		-0.1,
		1.0,
		-0.1,
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
	result = dlasq5.ndarray( 1, 5, z, 1, 0, 1, 0.0, 1.0, false, EPS );
	assertApprox( result.dmin, -0.1, 1e-12, 'dmin' );
	assertApprox( result.dmin2, 0.0, 1e-14, 'dmin2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=0, dnm2<0 guard', function t() {
	var result;
	var z;

	z = new Float64Array([
		-0.1,
		1.0,
		-0.1,
		1.0,
		 3.0,
		0.5,
		3.0,
		0.5,
		 2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq5.ndarray( 1, 3, z, 1, 0, 0, 0.0, 1.0, false, EPS );
	assertApprox( result.dmin, -0.1, 1e-12, 'dmin' );
	assertApprox( result.dnm2, -0.1, 1e-12, 'dnm2' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
	assertApprox( result.dnm1, 0.0, 1e-14, 'dnm1' );
});

test( 'dlasq5.ndarray: tau=0 non-IEEE pp=0, dnm1<0 guard', function t() {
	var result;
	var z;

	z = new Float64Array([
		0.1,
		1.0,
		0.1,
		1.0,
		-0.5,
		0.5,
		-0.5,
		0.5,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	result = dlasq5.ndarray( 1, 3, z, 1, 0, 0, 0.0, 1.0, false, EPS );
	assertApprox( result.dmin, -0.25, 1e-12, 'dmin' );
	assertApprox( result.dnm2, 0.1, 1e-12, 'dnm2' );
	assertApprox( result.dnm1, -0.25, 1e-12, 'dnm1' );
	assertApprox( result.dn, 0.0, 1e-14, 'dn' );
});
