/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsband from './../lib/dsband.js';


// FUNCTIONS //

function args( over ) {
	// A minimally-sized valid argument list, with named overrides for the throw tests.
	const ncv = 6;
	const n = 8;
	const lda = 4;
	const o = {
		rvec: true,
		howmny: 'all',
		select: new Int32Array( ncv ),
		d: new Float64Array( ncv ),
		Z: new Float64Array( n * ncv ),
		ldz: n,
		sigma: 0.0,
		N: n,
		AB: new Float64Array( lda * n ),
		MB: new Float64Array( lda * n ),
		lda: lda,
		RFAC: new Float64Array( lda * n ),
		kl: 1,
		ku: 1,
		which: 'LM',
		bmat: 'standard',
		nev: 2,
		tol: 0.0,
		resid: new Float64Array( n ),
		ncv: ncv,
		V: new Float64Array( n * ncv ),
		ldv: n,
		iparam: new Int32Array( 11 ),
		workd: new Float64Array( 3 * n ),
		workl: new Float64Array( ( ncv * ncv ) + ( 8 * ncv ) ),
		lworkl: ( ncv * ncv ) + ( 8 * ncv ),
		iwork: new Int32Array( n ),
		infoIn: 0
	};
	if ( over ) {
		Object.assign( o, over );
	}
	return [ o.rvec, o.howmny, o.select, o.d, o.Z, o.ldz, o.sigma, o.N, o.AB, o.MB, o.lda, o.RFAC, o.kl, o.ku, o.which, o.bmat, o.nev, o.tol, o.resid, o.ncv, o.V, o.ldv, o.iparam, o.workd, o.workl, o.lworkl, o.iwork, o.infoIn ];
}


// TESTS //

test( 'dsband is a function', function t() {
	assert.strictEqual( typeof dsband, 'function', 'is a function' );
});

test( 'dsband has expected arity', function t() {
	assert.strictEqual( dsband.length, 28, 'has expected arity' );
});

test( 'dsband throws TypeError for invalid bmat', function t() {
	assert.throws( function throws() {
		dsband.apply( null, args({ bmat: 'X' }) );
	}, TypeError );
});

test( 'dsband throws TypeError for invalid which', function t() {
	assert.throws( function throws() {
		dsband.apply( null, args({ which: 'ZZ' }) );
	}, TypeError );
});

test( 'dsband throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsband.apply( null, args({ N: -1 }) );
	}, RangeError );
});

test( 'dsband main API solves a banded generalized eigenproblem', function t() {
	// K x = lambda M x for the 1-D FEM Laplacian K and consistent mass M.
	const n = 20;
	const nev = 4;
	const ncv = 10;
	const lda = 4;
	const kl = 1;
	const ku = 1;
	const idiag = kl + ku + 1;
	const isup = kl + ku;
	const isub = kl + ku + 2;
	const AB = new Float64Array( lda * n );
	const MB = new Float64Array( lda * n );
	const h = 1.0 / ( n + 1 );
	const r1 = 4.0 / 6.0;
	const r2 = 1.0 / 6.0;
	let j;
	for ( j = 1; j <= n; j++ ) {
		AB[ ( idiag - 1 ) + ( ( j - 1 ) * lda ) ] = 2.0 / h;
		MB[ ( idiag - 1 ) + ( ( j - 1 ) * lda ) ] = r1 * h;
	}
	for ( j = 1; j <= n - 1; j++ ) {
		AB[ ( isup - 1 ) + ( j * lda ) ] = -1.0 / h;
		AB[ ( isub - 1 ) + ( ( j - 1 ) * lda ) ] = -1.0 / h;
		MB[ ( isup - 1 ) + ( j * lda ) ] = r2 * h;
		MB[ ( isub - 1 ) + ( ( j - 1 ) * lda ) ] = r2 * h;
	}

	const RFAC = new Float64Array( lda * n );
	const V = new Float64Array( n * ncv );
	const d = new Float64Array( ncv );
	const resid = new Float64Array( n );
	let r;
	for ( r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const workd = new Float64Array( 3 * n );
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const workl = new Float64Array( lworkl );
	const iparam = new Int32Array( 11 );
	iparam[ 2 ] = 300;
	iparam[ 6 ] = 3; // shift-invert mode
	const iwork = new Int32Array( n );
	const select = new Int32Array( ncv );

	const info = dsband( true, 'all', select, d, V, n, 0.0, n, AB, MB, lda, RFAC, kl, ku, 'LM', 'generalized', nev, 0.0, resid, ncv, V, n, iparam, workd, workl, lworkl, iwork, 1 );

	assert.strictEqual( info, 0, 'info is 0' );
	assert.strictEqual( iparam[ 4 ], nev, 'all requested eigenvalues converged' );

	// Smallest generalized eigenvalue approximates the fundamental (k*pi)^2:
	assert.ok( Math.abs( d[ 0 ] - ( Math.PI * Math.PI ) ) < 0.05, 'smallest eigenvalue ' + d[ 0 ] + ' near pi^2' );

	// Verify each pair: || K z - d M z || is small (K, M as dense tridiagonals).
	let maxRes = 0.0;
	let c;
	for ( c = 0; c < nev; c++ ) {
		for ( r = 0; r < n; r++ ) {
			let kz = ( 2.0 / h ) * V[ ( c * n ) + r ];
			let mz = ( r1 * h ) * V[ ( c * n ) + r ];
			if ( r > 0 ) {
				kz += ( -1.0 / h ) * V[ ( c * n ) + r - 1 ];
				mz += ( r2 * h ) * V[ ( c * n ) + r - 1 ];
			}
			if ( r < n - 1 ) {
				kz += ( -1.0 / h ) * V[ ( c * n ) + r + 1 ];
				mz += ( r2 * h ) * V[ ( c * n ) + r + 1 ];
			}
			maxRes = Math.max( maxRes, Math.abs( kz - ( d[ c ] * mz ) ) );
		}
	}
	assert.ok( maxRes < 1e-8, 'residual || K z - d M z || is small (' + maxRes + ')' );
});
