/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasq3 from './../lib/ndarray.js';

// FIXTURES //

import n0_lt_i0 from './fixtures/n0_lt_i0.json' with { type: 'json' };
import n0_eq_i0 from './fixtures/n0_eq_i0.json' with { type: 'json' };
import n0_eq_i0_plus_1 from './fixtures/n0_eq_i0_plus_1.json' with { type: 'json' };
import basic_n4_pp0 from './fixtures/basic_n4_pp0.json' with { type: 'json' };
import basic_n5_pp0 from './fixtures/basic_n5_pp0.json' with { type: 'json' };
import pp2_reset from './fixtures/pp2_reset.json' with { type: 'json' };
import dmin_negative_reversal from './fixtures/dmin_negative_reversal.json' with { type: 'json' };
import non_ieee from './fixtures/non_ieee.json' with { type: 'json' };
import deflation_last from './fixtures/deflation_last.json' with { type: 'json' };
import n3_minimal from './fixtures/n3_minimal.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'dlasq3: main export is a function', function t() {
	assert.strictEqual( typeof dlasq3, 'function' );
});

test( 'dlasq3: n0_lt_i0 — immediate return', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = n0_lt_i0;
	const z = new Float64Array( [ 4.0, 1.0, 4.0, 1.0 ] );
	n0[ 0 ] = 1;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 0.5;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 0.5;
	dmin2[ 0 ] = 0.5;
	dn[ 0 ] = 0.5;
	dn1[ 0 ] = 0.5;
	dn2[ 0 ] = 0.5;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 2, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( sigma[ 0 ], tc.sigma, 1e-14, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-14, 'desig' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
});

test( 'dlasq3: n0_eq_i0 — deflate single eigenvalue', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = n0_eq_i0;
	const z = new Float64Array( [ 4.0, 1.0, 4.0, 1.0 ] );
	n0[ 0 ] = 1;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 0.5;
	sigma[ 0 ] = 1.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 0.5;
	dmin2[ 0 ] = 0.5;
	dn[ 0 ] = 0.5;
	dn1[ 0 ] = 0.5;
	dn2[ 0 ] = 0.5;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assertClose( z[ 0 ], tc.z1, 1e-14, 'z[0]' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-14, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-14, 'desig' );
	assert.equal( iter[ 0 ], tc.iter );
});

test( 'dlasq3: n0_eq_i0_plus_1 — 2-eigenvalue deflation', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = n0_eq_i0_plus_1;
	const z = new Float64Array([
		4.0,
		0.5,
		4.0,
		0.5,
		3.0,
		0.0,
		3.0,
		0.0
	]);
	n0[ 0 ] = 2;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 0.5;
	sigma[ 0 ] = 1.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 0.5;
	dmin2[ 0 ] = 0.5;
	dn[ 0 ] = 3.0;
	dn1[ 0 ] = 4.0;
	dn2[ 0 ] = 0.5;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assertClose( sigma[ 0 ], tc.sigma, 1e-14, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-14, 'desig' );
	assertArrayClose( z, tc.z, 1e-14, 'z' );
	assert.equal( iter[ 0 ], tc.iter );
});

test( 'dlasq3: basic_n4_pp0 — main dqds path', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = basic_n4_pp0;
	const z = new Float64Array([
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
		1.0,
		0.0,
		1.0,
		0.0
	]);
	n0[ 0 ] = 4;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 1.0;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.0;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 1.0;
	dn1[ 0 ] = 2.0;
	dn2[ 0 ] = 3.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assertClose( qmax[ 0 ], tc.qmax, 1e-12, 'qmax' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( dmin1[ 0 ], tc.dmin1, 1e-12, 'dmin1' );
	assertClose( dmin2[ 0 ], tc.dmin2, 1e-12, 'dmin2' );
	assertClose( dn[ 0 ], tc.dn, 1e-12, 'dn' );
	assertClose( dn1[ 0 ], tc.dn1, 1e-12, 'dn1' );
	assertClose( dn2[ 0 ], tc.dn2, 1e-12, 'dn2' );
	assertClose( g[ 0 ], tc.g, 1e-12, 'g' );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: basic_n5_pp0 — larger problem', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = basic_n5_pp0;
	const z = new Float64Array([
		4.0,
		1.0,
		4.0,
		1.0,
		3.0,
		0.5,
		3.0,
		0.5,
		5.0,
		0.3,
		5.0,
		0.3,
		2.0,
		0.2,
		2.0,
		0.2,
		1.5,
		0.0,
		1.5,
		0.0
	]);
	n0[ 0 ] = 5;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 1.5;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 5.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.5;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 1.5;
	dn1[ 0 ] = 2.0;
	dn2[ 0 ] = 5.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assertClose( qmax[ 0 ], tc.qmax, 1e-12, 'qmax' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( dmin1[ 0 ], tc.dmin1, 1e-12, 'dmin1' );
	assertClose( dmin2[ 0 ], tc.dmin2, 1e-12, 'dmin2' );
	assertClose( dn[ 0 ], tc.dn, 1e-12, 'dn' );
	assertClose( dn1[ 0 ], tc.dn1, 1e-12, 'dn1' );
	assertClose( dn2[ 0 ], tc.dn2, 1e-12, 'dn2' );
	assertClose( g[ 0 ], tc.g, 1e-12, 'g' );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: pp2_reset — pp=2 gets reset to 0', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = pp2_reset;
	const z = new Float64Array([
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
		1.0,
		0.0,
		1.0,
		0.0
	]);
	n0[ 0 ] = 4;
	pp[ 0 ] = 2;
	dmin[ 0 ] = 1.0;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.0;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 1.0;
	dn1[ 0 ] = 2.0;
	dn2[ 0 ] = 3.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: dmin_negative_reversal — reversal path', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = dmin_negative_reversal;
	const z = new Float64Array([
		1.0,
		0.5,
		1.0,
		0.5,
		2.0,
		0.3,
		2.0,
		0.3,
		3.0,
		0.2,
		3.0,
		0.2,
		4.0,
		0.0,
		4.0,
		0.0
	]);
	n0[ 0 ] = 4;
	pp[ 0 ] = 0;
	dmin[ 0 ] = -0.1;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.0;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 4.0;
	dn1[ 0 ] = 3.0;
	dn2[ 0 ] = 2.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assertClose( qmax[ 0 ], tc.qmax, 1e-12, 'qmax' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( dmin1[ 0 ], tc.dmin1, 1e-12, 'dmin1' );
	assertClose( dmin2[ 0 ], tc.dmin2, 1e-12, 'dmin2' );
	assertClose( dn[ 0 ], tc.dn, 1e-12, 'dn' );
	assertClose( dn1[ 0 ], tc.dn1, 1e-12, 'dn1' );
	assertClose( dn2[ 0 ], tc.dn2, 1e-12, 'dn2' );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: non_ieee — non-IEEE arithmetic path', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = non_ieee;
	const z = new Float64Array([
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
		1.0,
		0.0,
		1.0,
		0.0
	]);
	n0[ 0 ] = 4;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 1.0;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.0;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 1.0;
	dn1[ 0 ] = 2.0;
	dn2[ 0 ] = 3.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, false, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: deflation_last — deflation of last eigenvalue', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = deflation_last;
	const z = new Float64Array([
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
		1.0e-30,
		5.0,
		1.0e-30,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	n0[ 0 ] = 5;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 1.0;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 5.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.0;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 1.0;
	dn1[ 0 ] = 5.0;
	dn2[ 0 ] = 2.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assert.equal( pp[ 0 ], tc.pp );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: n3_minimal — minimal 3-element problem', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const tc = n3_minimal;
	const z = new Float64Array([
		4.0,
		1.0,
		4.0,
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
	n0[ 0 ] = 3;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 2.0;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 2.0;
	dmin2[ 0 ] = 3.0;
	dn[ 0 ] = 2.0;
	dn1[ 0 ] = 3.0;
	dn2[ 0 ] = 4.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], tc.n0 );
	assertClose( dmin[ 0 ], tc.dmin, 1e-12, 'dmin' );
	assertClose( sigma[ 0 ], tc.sigma, 1e-12, 'sigma' );
	assertClose( desig[ 0 ], tc.desig, 1e-12, 'desig' );
	assert.equal( nfail[ 0 ], tc.nfail );
	assert.equal( iter[ 0 ], tc.iter );
	assert.equal( ndiv[ 0 ], tc.ndiv );
	assert.equal( ttype[ 0 ], tc.ttype );
	assertClose( tau[ 0 ], tc.tau, 1e-12, 'tau' );
	assertArrayClose( z, tc.z, 1e-12, 'z' );
});

test( 'dlasq3: 2eig_swap — 2-eigenvalue deflation with swap', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const z = new Float64Array([
		1.0,
		0.5,
		1.0,
		0.5,
		3.0,
		0.0,
		3.0,
		0.0
	]);
	n0[ 0 ] = 2;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 0.5;
	sigma[ 0 ] = 1.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 0.5;
	dmin2[ 0 ] = 0.5;
	dn[ 0 ] = 3.0;
	dn1[ 0 ] = 4.0;
	dn2[ 0 ] = 0.5;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], 0 );
	assertClose( sigma[ 0 ], 1.0, 1e-14, 'sigma' );
});

test( 'dlasq3: 2eig_s_le_t — 2-eigenvalue deflation s<=t branch', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const z = new Float64Array([
		4.0,
		0.5,
		4.0,
		0.5,
		2.0,
		0.0,
		2.0,
		0.0
	]);
	n0[ 0 ] = 2;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 0.5;
	sigma[ 0 ] = 1.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 0.5;
	dmin2[ 0 ] = 0.5;
	dn[ 0 ] = 2.0;
	dn1[ 0 ] = 4.0;
	dn2[ 0 ] = 0.5;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.equal( n0[ 0 ], 0 );
	assertClose( sigma[ 0 ], 1.0, 1e-14, 'sigma' );
});

test( 'dlasq3: tau_lt_sigma — tau < sigma path in sigma update', function t() {
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const z = new Float64Array([
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
		1.0,
		0.0,
		1.0,
		0.0
	]);
	n0[ 0 ] = 4;
	pp[ 0 ] = 0;
	dmin[ 0 ] = 1.0;
	sigma[ 0 ] = 5.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 4.0;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 1.0;
	dmin2[ 0 ] = 2.0;
	dn[ 0 ] = 1.0;
	dn1[ 0 ] = 2.0;
	dn2[ 0 ] = 3.0;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.ok( tau[ 0 ] < sigma[ 0 ], 'tau should be less than sigma' );
	assert.ok( dmin[ 0 ] >= 0, 'dmin should be non-negative' );
});

test( 'dlasq3: ttype_lt_neg22 — tau set to zero after repeated failures', function t() { // eslint-disable-line max-len
	const n0 = new Int32Array( 1 );
	const pp = new Int32Array( 1 );
	const dmin = new Float64Array( 1 );
	const sigma = new Float64Array( 1 );
	const desig = new Float64Array( 1 );
	const qmax = new Float64Array( 1 );
	const nfail = new Int32Array( 1 );
	const iter = new Int32Array( 1 );
	const ndiv = new Int32Array( 1 );
	const ttype = new Int32Array( 1 );
	const dmin1 = new Float64Array( 1 );
	const dmin2 = new Float64Array( 1 );
	const dn = new Float64Array( 1 );
	const dn1 = new Float64Array( 1 );
	const dn2 = new Float64Array( 1 );
	const g = new Float64Array( 1 );
	const tau = new Float64Array( 1 );

	const z = new Float64Array([
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
	n0[ 0 ] = 4;
	pp[ 0 ] = 0;
	dmin[ 0 ] = -1.0;
	sigma[ 0 ] = 0.0;
	desig[ 0 ] = 0.0;
	qmax[ 0 ] = 0.01;
	nfail[ 0 ] = 0;
	iter[ 0 ] = 0;
	ndiv[ 0 ] = 0;
	ttype[ 0 ] = 0;
	dmin1[ 0 ] = 0.01;
	dmin2[ 0 ] = 0.01;
	dn[ 0 ] = 0.01;
	dn1[ 0 ] = 0.01;
	dn2[ 0 ] = 0.01;
	g[ 0 ] = 0.0;
	tau[ 0 ] = 0.0;
	dlasq3( 1, n0, z, 1, 0, pp, dmin, sigma, desig, qmax, nfail, iter, ndiv, true, ttype, dmin1, dmin2, dn, dn1, dn2, g, tau ); // eslint-disable-line max-len
	assert.ok( nfail[ 0 ] >= 3, 'should have at least 3 failures' );
	assert.ok( dmin[ 0 ] >= 0, 'dmin should converge to non-negative' );
	assertClose( tau[ 0 ], 0.0, 1e-14, 'tau should be zero after safe fallback' ); // eslint-disable-line max-len
});
