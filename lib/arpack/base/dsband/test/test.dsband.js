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

/* eslint-disable no-restricted-syntax */

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
		order: 'column-major',
		rvec: true,
		howmny: 'all',
		select: new Int32Array( ncv ),
		strideSelect: 1,
		d: new Float64Array( ncv ),
		strideD: 1,
		Z: new Float64Array( n * ncv ),
		LDZ: n,
		sigma: 0.0,
		N: n,
		AB: new Float64Array( lda * n ),
		MB: new Float64Array( lda * n ),
		LDAB: lda,
		LDMB: lda,
		LDRFAC: lda,
		RFAC: new Float64Array( lda * n ),
		kl: 1,
		ku: 1,
		which: 'LM',
		bmat: 'standard',
		nev: 2,
		tol: 0.0,
		resid: new Float64Array( n ),
		strideResid: 1,
		ncv: ncv,
		V: new Float64Array( n * ncv ),
		LDV: n,
		iparam: new Int32Array( 11 ),
		strideIparam: 1,
		workd: new Float64Array( 3 * n ),
		workl: new Float64Array( ( ncv * ncv ) + ( 8 * ncv ) ),
		lworkl: ( ncv * ncv ) + ( 8 * ncv ),
		iwork: new Int32Array( n ),
		infoIn: 0
	};
	if ( over ) {
		Object.assign( o, over );
	}
	return [ o.order, o.rvec, o.howmny, o.select, o.strideSelect, o.d, o.strideD, o.Z, o.LDZ, o.sigma, o.N, o.AB, o.LDAB, o.MB, o.LDMB, o.RFAC, o.LDRFAC, o.kl, o.ku, o.which, o.bmat, o.nev, o.tol, o.resid, o.strideResid, o.ncv, o.V, o.LDV, o.iparam, o.strideIparam, o.workd, o.workl, o.lworkl, o.iwork, o.infoIn ];
}


// TESTS //

test( 'dsband is a function', function t() {
	assert.strictEqual( typeof dsband, 'function', 'is a function' );
});

test( 'dsband has expected arity', function t() {
	assert.strictEqual( dsband.length, 35, 'has expected arity' );
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

	const info = dsband( 'column-major', true, 'all', select, 1, d, 1, V, n, 0.0, n, AB, lda, MB, lda, RFAC, lda, kl, ku, 'LM', 'generalized', nev, 0.0, resid, 1, ncv, V, n, iparam, 1, workd, workl, lworkl, iwork, 1 );

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

test( 'dsband throws TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		dsband.apply( null, args({ order: 'foo' }) );
	}, TypeError );
});

/**
* Solves the 1-D FEM generalized eigenproblem in the given layout and returns the Ritz values and (column-major) Ritz vectors.
*
* @private
* @param {string} order - storage layout
* @param {boolean} nullWork - whether to pass `null` workspaces
* @returns {Object} results
*/
function solveFEM( order, nullWork ) {
	const n = 12;
	const nev = 3;
	const ncv = 8;
	const kl = 1;
	const ku = 1;
	const nb = ( 2 * kl ) + ku + 1;
	const ld = ( order === 'column-major' ) ? nb : n;
	const ldv = ( order === 'column-major' ) ? n : ncv;
	const AB = new Float64Array( nb * n );
	const MB = new Float64Array( nb * n );
	const RFAC = new Float64Array( nb * n );
	const h = 1.0 / ( n + 1 );
	let idx;
	let j;

	// Band element (row i, column j), 0-based, in the given layout:
	idx = function idx( i, jj ) {
		return ( order === 'column-major' ) ? i + ( jj * ld ) : ( i * ld ) + jj;
	};
	for ( j = 0; j < n; j++ ) {
		AB[ idx( kl + ku, j ) ] = 2.0 / h;
		MB[ idx( kl + ku, j ) ] = ( 4.0 / 6.0 ) * h;
		if ( j > 0 ) {
			AB[ idx( kl + ku - 1, j ) ] = -1.0 / h;
			MB[ idx( kl + ku - 1, j ) ] = h / 6.0;
		}
		if ( j < n - 1 ) {
			AB[ idx( kl + ku + 1, j ) ] = -1.0 / h;
			MB[ idx( kl + ku + 1, j ) ] = h / 6.0;
		}
	}
	const V = new Float64Array( n * ncv );
	const d = new Float64Array( ncv );
	const resid = new Float64Array( n );
	for ( j = 0; j < n; j++ ) {
		resid[ j ] = 1.0 + ( 0.1 * ( j + 1 ) );
	}
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const iparam = new Int32Array( 11 );
	iparam[ 2 ] = 300;
	iparam[ 6 ] = 3;
	const workd = ( nullWork ) ? null : new Float64Array( 3 * n );
	const workl = ( nullWork ) ? null : new Float64Array( lworkl );
	const iwork = ( nullWork ) ? null : new Int32Array( n );
	const info = dsband( order, true, 'all', new Int32Array( ncv ), 1, d, 1, V, ldv, 0.0, n, AB, ld, MB, ld, RFAC, ld, kl, ku, 'LM', 'generalized', nev, 0.0, resid, 1, ncv, V, ldv, iparam, 1, workd, workl, lworkl, iwork, 1 );
	const Z = [];
	let c;
	for ( c = 0; c < nev; c++ ) {
		for ( j = 0; j < n; j++ ) {
			Z.push( ( order === 'column-major' ) ? V[ j + ( c * ldv ) ] : V[ ( j * ldv ) + c ] );
		}
	}
	return {
		'info': info,
		'd': Array.from( d.subarray( 0, nev ) ),
		'Z': Z
	};
}

test( 'dsband null-workspace call reproduces the caller-owned-workspace result exactly', function t() {
	const ref = solveFEM( 'column-major', false );
	assert.strictEqual( ref.info, 0, 'info is 0' );
	assert.deepStrictEqual( solveFEM( 'column-major', true ), ref, 'null workspaces match caller-owned workspaces' );
});

test( 'dsband row-major call matches the column-major result', function t() {
	// Not bit-exact: row-major `V` columns have non-unit stride, so `ddot` takes its (reference-BLAS) non-unrolled path and rounds differently.
	const ref = solveFEM( 'column-major', false );
	const out = solveFEM( 'row-major', false );
	let i;
	assert.strictEqual( out.info, 0, 'info is 0' );
	for ( i = 0; i < ref.d.length; i++ ) {
		assert.ok( Math.abs( out.d[ i ] - ref.d[ i ] ) <= 1e-12 * Math.abs( ref.d[ i ] ), 'eigenvalue ' + i );
	}
	for ( i = 0; i < ref.Z.length; i++ ) {
		assert.ok( Math.abs( out.Z[ i ] - ref.Z[ i ] ) <= 1e-12, 'eigenvector element ' + i );
	}
});

test( 'dsband throws RangeError for undersized workspaces', function t() {
	assert.throws( function throws() {
		dsband.apply( null, args({ workd: new Float64Array( 23 ) }) );
	}, RangeError );
	assert.throws( function throws() {
		dsband.apply( null, args({ workl: new Float64Array( 83 ) }) );
	}, RangeError );

	// A missing (non-null) workspace is rejected rather than allocated:
	assert.throws( function throws() {
		dsband.apply( null, args({ workd: void 0 }) );
	}, RangeError );
	assert.throws( function throws() {
		dsband.apply( null, args({ workl: void 0 }) );
	}, RangeError );
});

test( 'dsband rejects LDMB or LDRFAC below 2*kl+ku+1 in column-major order', function t() {
	// kl = ku = 1: the factored band needs 2*kl + ku + 1 = 4 rows.
	const n = 6;
	const ncv = 4;
	const call = function call( LDMB, LDRFAC ) {
		dsband( 'column-major', false, 'all', new Int32Array( ncv ), 1, new Float64Array( ncv ), 1, new Float64Array( n * ncv ), n, 0.0, n, new Float64Array( 4 * n ), 4, new Float64Array( LDMB * n ), LDMB, new Float64Array( LDRFAC * n ), LDRFAC, 1, 1, 'LM', 'standard', 2, 0.0, new Float64Array( n ), 1, ncv, new Float64Array( n * ncv ), n, new Int32Array( 11 ), 1, new Float64Array( 3 * n ), new Float64Array( ( ncv * ncv ) + ( 8 * ncv ) ), ( ncv * ncv ) + ( 8 * ncv ), new Int32Array( n ), 0 );
	};
	assert.throws( function mb() {
		call( 3, 4 );
	}, /Fifteenth argument must be greater than or equal to max\(1,2\*kl\+ku\+1\)\. Value: `3`/ );
	assert.throws( function rfac() {
		call( 4, 3 );
	}, /Seventeenth argument must be greater than or equal to max\(1,2\*kl\+ku\+1\)\. Value: `3`/ );
});
