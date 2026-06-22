/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlar1v from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlar1v.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ' + expected + ', got ' + actual );
		return;
	}
	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Builds LDL^T factors from a symmetric tridiagonal.
*
* @private
* @param {Array} td - diagonal
* @param {Array} te - sub-diagonal
* @returns {Array} `[ D, L, LD, LLD ]`
*/
function buildLDL( td, te ) {
	var LLD;
	var LD;
	var n;
	var D;
	var L;
	var k;

	n = td.length;
	D = new Float64Array( n );
	L = new Float64Array( n );
	LD = new Float64Array( n );
	LLD = new Float64Array( n );
	D[ 0 ] = td[ 0 ];
	for ( k = 0; k < n - 1; k += 1 ) {
		L[ k ] = te[ k ] / D[ k ];
		D[ k + 1 ] = td[ k + 1 ] - ( L[ k ] * te[ k ] );
		LD[ k ] = L[ k ] * D[ k ];
		LLD[ k ] = L[ k ] * L[ k ] * D[ k ];
	}
	return [ D, L, LD, LLD ];
}

/**
* Returns the Rayleigh residual `||(T - lambda*I)*z|| / ||z||` on a symmetric tridiagonal.
*
* @private
* @param {Array} td - diagonal
* @param {Array} te - sub-diagonal
* @param {number} lambda - shift
* @param {Float64Array} z - vector
* @param {integer} b1 - 1-based start index
* @param {integer} bn - 1-based end index
* @returns {number} residual
*/
function tridiagResid( td, te, lambda, z, b1, bn ) {
	var sum;
	var nz;
	var rr;
	var i;

	sum = 0.0;
	nz = 0.0;
	for ( i = b1 - 1; i <= bn - 1; i += 1 ) {
		rr = ( td[ i ] - lambda ) * z[ i ];
		if ( i > b1 - 1 ) {
			rr += te[ i - 1 ] * z[ i - 1 ];
		}
		if ( i < bn - 1 ) {
			rr += te[ i ] * z[ i + 1 ];
		}
		sum += rr * rr;
		nz += z[ i ] * z[ i ];
	}
	return Math.sqrt( sum / nz );
}

/**
* Invokes `dlar1v` with a fresh output buffer set and returns the outputs.
*
* @private
* @param {Array} factors - LDL factors `[D, L, LD, LLD]`
* @param {integer} n - order
* @param {integer} b1 - 1-based start
* @param {integer} bn - 1-based end
* @param {number} lambda - shift
* @param {number} gaptol - tolerance
* @param {boolean} wantnc - compute negcnt
* @param {integer} rin - initial twist
* @returns {Array} outputs `[Z, ISUPPZ, negcnt, ztz, mingma, r, nrminv, resid, rqcorr]`
*/
function runCase( factors, n, b1, bn, lambda, gaptol, wantnc, rin ) {
	var ISUPPZ;
	var negcnt;
	var mingma;
	var nrminv;
	var rqcorr;
	var pivmin;
	var resid;
	var WORK;
	var ztz;
	var Z;
	var r;

	pivmin = 1e-300;
	Z = new Float64Array( n );
	WORK = new Float64Array( 4 * n );
	ISUPPZ = new Int32Array( 2 );
	negcnt = new Int32Array( 1 );
	ztz = new Float64Array( 1 );
	mingma = new Float64Array( 1 );
	r = new Int32Array( [ rin ] );
	nrminv = new Float64Array( 1 );
	resid = new Float64Array( 1 );
	rqcorr = new Float64Array( 1 );

	dlar1v( n, b1, bn, lambda, factors[ 0 ], 1, 0, factors[ 1 ], 1, 0, factors[ 2 ], 1, 0, factors[ 3 ], 1, 0, pivmin, gaptol, Z, 1, 0, wantnc, negcnt, ztz, mingma, r, ISUPPZ, 1, 0, nrminv, resid, rqcorr, WORK, 1, 0 );

	return [ Z, ISUPPZ, negcnt[ 0 ], ztz[ 0 ], mingma[ 0 ], r[ 0 ], nrminv[ 0 ], resid[ 0 ], rqcorr[ 0 ] ];
}


// TESTS //

test( 'dlar1v ndarray: tridiag5 smallest eigenvector (Rayleigh residual)', function t() {
	var factors;
	var lambda;
	var out;
	var td;
	var te;
	var rr;
	var s;
	var i;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	lambda = 2.2679491924311229;
	out = runCase( factors, 5, 1, 5, lambda, 0.0, true, 0 );

	s = 0.0;
	for ( i = 0; i < 5; i += 1 ) {
		s += out[ 0 ][ i ] * out[ 0 ][ i ];
	}
	assertClose( out[ 3 ], s, 1e-13, 'ztz = sum(z^2)' );
	assertClose( out[ 6 ], 1.0 / Math.sqrt( out[ 3 ] ), 1e-13, 'nrminv' );
	assertClose( out[ 7 ], Math.abs( out[ 4 ] ) * out[ 6 ], 1e-13, 'resid' );
	assertClose( out[ 8 ], out[ 4 ] / out[ 3 ], 1e-13, 'rqcorr' );

	rr = tridiagResid( td, te, lambda, out[ 0 ], 1, 5 );
	assert.ok( rr < 1e-10, 'Rayleigh residual small: ' + rr );

	assert.equal( out[ 1 ][ 0 ], 1, 'isuppz[0]' );
	assert.equal( out[ 1 ][ 1 ], 5, 'isuppz[1]' );
	assert.ok( out[ 2 ] >= 0, 'negcnt >= 0 when wantnc=true' );
	assert.ok( out[ 5 ] >= 1 && out[ 5 ] <= 5, 'r in range' );
});

test( 'dlar1v ndarray: tridiag5 middle eigenvector (lambda=4)', function t() {
	var factors;
	var out;
	var td;
	var te;
	var rr;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 5, 1, 5, 4.0, 0.0, true, 0 );

	rr = tridiagResid( td, te, 4.0, out[ 0 ], 1, 5 );
	assert.ok( rr < 1e-10, 'Rayleigh residual small: ' + rr );
	assert.ok( out[ 3 ] > 0.0, 'ztz > 0' );
	assert.equal( out[ 2 ], 2, 'negcnt = 2' );
});

test( 'dlar1v ndarray: tridiag3 largest eigenvector', function t() {
	var factors;
	var out;
	var td;
	var te;
	var rr;

	td = [ 2.0, 3.0, 2.0 ];
	te = [ 1.0, 1.0 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 3, 1, 3, 4.0, 0.0, true, 0 );

	rr = tridiagResid( td, te, 4.0, out[ 0 ], 1, 3 );
	assert.ok( rr < 1e-10, 'Rayleigh residual small: ' + rr );
	assert.equal( out[ 2 ], 2, 'negcnt = 2' );
	assert.equal( out[ 1 ][ 0 ], 1, 'isuppz[0]' );
	assert.equal( out[ 1 ][ 1 ], 3, 'isuppz[1]' );
});

test( 'dlar1v ndarray: subrange b1=2 bn=4, wantnc=false', function t() {
	var factors;
	var out;
	var td;
	var te;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 5, 2, 4, 3.9, 0.0, false, 0 );

	assert.equal( out[ 0 ][ 0 ], 0.0, 'z[0]=0 outside subrange' );
	assert.equal( out[ 0 ][ 4 ], 0.0, 'z[4]=0 outside subrange' );
	assert.equal( out[ 2 ], -1, 'negcnt = -1 when wantnc=false' );
	assert.ok( out[ 5 ] >= 2 && out[ 5 ] <= 4, 'r in [2,4]' );
	assert.equal( out[ 1 ][ 0 ], 2, 'isuppz[0] = b1' );
	assert.equal( out[ 1 ][ 1 ], 4, 'isuppz[1] = bn' );
});

test( 'dlar1v ndarray: preset twist r=3', function t() {
	var factors;
	var out;
	var td;
	var te;
	var rr;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 5, 1, 5, 4.0, 0.0, true, 3 );

	assert.equal( out[ 5 ], 3, 'r fixed to input' );
	assert.equal( out[ 0 ][ 2 ], 1.0, 'z[r-1] = 1 initially' );
	assert.ok( out[ 3 ] >= 1.0, 'ztz >= 1' );

	rr = tridiagResid( td, te, 4.0, out[ 0 ], 1, 5 );
	assert.ok( rr < 1e-10, 'Rayleigh residual small: ' + rr );
});

test( 'dlar1v ndarray: nonzero gaptol truncates support', function t() {
	var factors;
	var out;
	var td;
	var te;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 5, 1, 5, 2.2679491924311229, 1.0e-1, true, 0 );

	assert.ok( out[ 1 ][ 0 ] >= 1, 'isuppz[0] >= 1' );
	assert.ok( out[ 1 ][ 1 ] <= 5, 'isuppz[1] <= 5' );
	assert.ok( out[ 1 ][ 0 ] <= out[ 1 ][ 1 ], 'isuppz sorted' );
	assert.ok( out[ 3 ] > 0, 'ztz > 0' );
});

test( 'dlar1v ndarray: huge gaptol truncates both sweeps', function t() {
	var factors;
	var out;
	var td;
	var te;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 5, 1, 5, 4.0, 1.0e9, true, 3 );

	assert.equal( out[ 0 ][ 2 ], 1.0, 'z[2]=1' );
	assert.equal( out[ 0 ][ 1 ], 0.0, 'z[1]=0 (truncated back)' );
	assert.equal( out[ 0 ][ 3 ], 0.0, 'z[3]=0 (truncated forward)' );
	assert.ok( out[ 1 ][ 0 ] > 1, 'isuppz[0] shrunk' );
	assert.ok( out[ 1 ][ 1 ] < 5, 'isuppz[1] shrunk' );
});

test( 'dlar1v ndarray: b1 != 1 initial WORK seed', function t() {
	var factors;
	var out;
	var td;
	var te;

	td = [ 5.0, 4.0, 3.0, 4.0, 5.0, 6.0 ];
	te = [ 1.0, 0.8, 0.9, 0.7, 0.6 ];
	factors = buildLDL( td, te );
	out = runCase( factors, 6, 3, 6, 3.5, 0.0, true, 0 );

	assert.ok( out[ 5 ] >= 3 && out[ 5 ] <= 6, 'r in [3,6]' );
	assert.ok( out[ 3 ] > 0, 'ztz > 0' );
	assert.equal( out[ 0 ][ 0 ], 0.0, 'z[0]=0' );
	assert.equal( out[ 0 ][ 1 ], 0.0, 'z[1]=0' );
	assert.equal( out[ 1 ][ 0 ], 3, 'isuppz[0]=b1' );
	assert.equal( out[ 1 ][ 1 ], 6, 'isuppz[1]=bn' );
});

test( 'dlar1v ndarray: stride support', function t() {
	var factors;
	var mingma;
	var nrminv;
	var rqcorr;
	var ISUPPZ;
	var negcnt;
	var resid;
	var LLD2;
	var WORK;
	var LD2;
	var ztz;
	var D2;
	var L2;
	var Z2;
	var td;
	var te;
	var rr;
	var z;
	var r;
	var i;

	td = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	te = [ 1.0, 1.0, 1.0, 1.0 ];
	factors = buildLDL( td, te );
	D2 = new Float64Array( 10 );
	L2 = new Float64Array( 10 );
	LD2 = new Float64Array( 10 );
	LLD2 = new Float64Array( 10 );
	Z2 = new Float64Array( 10 );
	WORK = new Float64Array( 4 * 5 );
	ISUPPZ = new Int32Array( 2 );
	negcnt = new Int32Array( 1 );
	ztz = new Float64Array( 1 );
	mingma = new Float64Array( 1 );
	r = new Int32Array( 1 );
	nrminv = new Float64Array( 1 );
	resid = new Float64Array( 1 );
	rqcorr = new Float64Array( 1 );
	for ( i = 0; i < 5; i += 1 ) {
		D2[ 2 * i ] = factors[ 0 ][ i ];
		L2[ 2 * i ] = factors[ 1 ][ i ];
		LD2[ 2 * i ] = factors[ 2 ][ i ];
		LLD2[ 2 * i ] = factors[ 3 ][ i ];
	}
	dlar1v( 5, 1, 5, 4.0, D2, 2, 0, L2, 2, 0, LD2, 2, 0, LLD2, 2, 0, 1e-300, 0.0, Z2, 2, 0, true, negcnt, ztz, mingma, r, ISUPPZ, 1, 0, nrminv, resid, rqcorr, WORK, 1, 0 );

	z = new Float64Array( 5 );
	for ( i = 0; i < 5; i += 1 ) {
		z[ i ] = Z2[ 2 * i ];
	}
	rr = tridiagResid( td, te, 4.0, z, 1, 5 );
	assert.ok( rr < 1e-10, 'strided z Rayleigh residual: ' + rr );
	assert.ok( ztz[ 0 ] > 0, 'ztz > 0' );
});

test( 'dlar1v ndarray: offset support', function t() {
	var factors;
	var mingma;
	var nrminv;
	var rqcorr;
	var ISUPPZ;
	var negcnt;
	var resid;
	var WORK;
	var LLD;
	var ztz;
	var LD;
	var td;
	var te;
	var rr;
	var D;
	var L;
	var Z;
	var z;
	var r;
	var i;

	td = [ 2.0, 3.0, 2.0 ];
	te = [ 1.0, 1.0 ];
	factors = buildLDL( td, te );
	D = new Float64Array( 5 );
	L = new Float64Array( 5 );
	LD = new Float64Array( 5 );
	LLD = new Float64Array( 5 );
	Z = new Float64Array( 5 );
	WORK = new Float64Array( 4 * 3 );
	ISUPPZ = new Int32Array( 2 );
	negcnt = new Int32Array( 1 );
	ztz = new Float64Array( 1 );
	mingma = new Float64Array( 1 );
	r = new Int32Array( 1 );
	nrminv = new Float64Array( 1 );
	resid = new Float64Array( 1 );
	rqcorr = new Float64Array( 1 );
	for ( i = 0; i < 3; i += 1 ) {
		D[ 2 + i ] = factors[ 0 ][ i ];
		L[ 2 + i ] = factors[ 1 ][ i ];
		LD[ 2 + i ] = factors[ 2 ][ i ];
		LLD[ 2 + i ] = factors[ 3 ][ i ];
	}
	dlar1v( 3, 1, 3, 4.0, D, 1, 2, L, 1, 2, LD, 1, 2, LLD, 1, 2, 1e-300, 0.0, Z, 1, 2, true, negcnt, ztz, mingma, r, ISUPPZ, 1, 0, nrminv, resid, rqcorr, WORK, 1, 0 );

	z = new Float64Array( 3 );
	for ( i = 0; i < 3; i += 1 ) {
		z[ i ] = Z[ 2 + i ];
	}
	rr = tridiagResid( td, te, 4.0, z, 1, 3 );
	assert.ok( rr < 1e-10, 'offset z Rayleigh residual: ' + rr );
});

test( 'dlar1v ndarray: exact fixture match (tridiag3_largest)', function t() {
	var factors;
	var sign;
	var dot;
	var out;
	var tc;
	var i;

	tc = findCase( 'tridiag3_largest' );
	factors = buildLDL( [ 2.0, 3.0, 2.0 ], [ 1.0, 1.0 ] );
	out = runCase( factors, 3, 1, 3, 4.0, 0.0, true, 0 );
	dot = 0.0;
	for ( i = 0; i < 3; i += 1 ) {
		dot += out[ 0 ][ i ] * tc.z[ i ];
	}
	sign = ( dot >= 0 ) ? 1.0 : -1.0;
	for ( i = 0; i < 3; i += 1 ) {
		assertClose( sign * out[ 0 ][ i ], tc.z[ i ], 1e-12, 'z[' + i + ']' );
	}
	assertClose( out[ 3 ], tc.ztz, 1e-12, 'ztz' );
	assert.equal( out[ 5 ], tc.r, 'r' );
	assert.equal( out[ 2 ], tc.negcnt, 'negcnt' );
});
