/**
* Property-based validation for zpbrfs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pb` -> HPD BANDED (schemes.banded
* with half-bandwidth kd, logical.positiveDefiniteBanded — a Hermitian PD band
* matrix); `rfs` (iterative refinement + error bounds) -> three independent
* properties. zpbrfs refines an approximate solution X to A*X = B and returns
* FERR (forward-error bound) and BERR (componentwise backward error). The Cholesky
* band factor AFB is produced by the already-validated zpbtrf; the un-refined
* initial X by zpbtrs; the TRUE solution independently by the trusted zpbsv. We
* assert, against the ORIGINAL full Hermitian band A0 (both triangles
* reconstructed by the oracle):
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* NOTE the complex signature: WORK is a Complex128Array of 2N and the final
* workspace is a real RWORK of N (not IWORK). Only the uplo triangle of AB / AFB
* is realized (band storage); outside the band and the opposite triangle stay
* poisoned, so a wrong-triangle / out-of-band read trips a NaN.
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zpbrfs from './../lib/ndarray.js';
import zpbtrf from '../../zpbtrf/lib/ndarray.js';
import zpbtrs from '../../zpbtrs/lib/ndarray.js';
import zpbsv from '../../zpbsv/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const NS = [ 3, 5, 8, 16, 17, 33 ];
const KDS = [ 0, 1, 2 ];
const NRHS = [ 1, 2 ];
const TIGHT_B = schemes.banded.layouts()[ 0 ]; // tight band storage
const TIGHT_D = schemes.dense.layouts()[ 0 ];  // tight col-major
const FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Read column j out of physical storage as an array of scalar values.
function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs matrix out of physical storage into a LogicalMatrix.
function readMat( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// inf-norm of a vector of scalar values (max modulus).
function infNormVec( a ) {
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( a[ i ] );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// inf-norm of the difference of two scalar-value vectors.
function diffInfNorm( a, b ) {
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// Copy the referenced (uplo triangle, in-band) factor cells into a LogicalMatrix.
function readBandFactor( R, n, kd, uplo ) {
	const L = new LogicalMatrix( sc, n, n );
	let i, j, lo, hi;
	for ( j = 0; j < n; j++ ) {
		if ( uplo === 'upper' ) {
			lo = Math.max( 0, j - kd );
			hi = j;
		} else {
			lo = j;
			hi = Math.min( n - 1, j + kd );
		}
		for ( i = lo; i <= hi; i++ ) {
			L.set( i, j, R.read( i, j ) );
		}
	}
	return L;
}

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zpbsv.
function trueSolution( A0, B0, N, kd, nrhs, uplo ) {
	const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_B );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT_D );
	const info = zpbsv( uplo, N, kd, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zpbsv failed (info='+info+'); matrix not HPD?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across uplo x N x kd x nrhs.
test( 'zpbrfs: refinement residual + BERR + FERR bound (uplo x N x kd x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		NS.forEach( function eachN( N ) {
			KDS.forEach( function eachKd( kd0 ) {
				const kd = Math.min( kd0, N - 1 );
				NRHS.forEach( function eachNrhs( nrhs ) {
					runProperty( uplo, N, kd, nrhs );
				});
			});
		});
	});
});

function runProperty( uplo, N, kd, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 100 ) + ( kd * 10 ) + nrhs ); // reproducible
	const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd ); // full HPD band oracle
	const B0 = logical.general( sc, rng, N, nrhs );

	// AB = original HPD band (uplo triangle); AFB = its Cholesky band factor:
	const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_B );
	const AFr = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_B );
	zpbtrf( uplo, N, kd, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ] );

	// B (RHS, unchanged) and X (initial un-refined solve, refined in place):
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT_D );
	const Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT_D );
	zpbtrs( uplo, N, kd, nrhs, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );
	zpbrfs( uplo, N, kd, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	const Xtrue = trueSolution( A0, B0, N, kd, nrhs, uplo );

	const tag = 'zpbrfs '+uplo+' N='+N+' kd='+kd+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of A0*X = B0.
	checked( 'zpbrfs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error: BERR[j] tiny and >= 0; (c) forward-error bound valid.
	checked( 'zpbrfs', 'structural', function run() {
		let xcol, tcol, eActual, eBound, j;
		const berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
		for ( j = 0; j < nrhs; j++ ) {
			// BERR:
			if ( !Number.isFinite( BERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': BERR not finite ('+BERR[ j ]+')' );
			}
			if ( !( BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ]+' is negative' );
			}
			if ( !( BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}

			// FERR bound validity vs the independent true solution:
			if ( !Number.isFinite( FERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': FERR not finite ('+FERR[ j ]+')' );
			}
			if ( !( FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ]+' is negative' );
			}
			if ( !( FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( Xr, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. The band Cholesky factor AFB and the initial X
// are produced ONCE (fixed values), then re-realized per layout together with the
// fixed A0 and B0; zpbrfs's internal kernels (zhbmv, zpbtrs, zaxpy, zcopy,
// zlacn2) walk the band/vectors by stride and do NOT reorder their reductions
// with storage strides, so changing only ADDRESSING must reproduce the refined
// X + FERR + BERR BIT-FOR-BIT across ALL banded layouts for AB/AFB (incl negative
// strides) and ALL dense layouts for B/X — a single family (as zpbsv itself is).
const aLayouts = schemes.banded.layouts();
const bLayouts = schemes.dense.layouts();

test( 'zpbrfs: bit-exact across storage layouts (single family)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 11;
	const kd = 3;
	const nrhs = 2;
	const SEED = 0xBEEF;
	const rng = new RNG( SEED );
	const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
	const B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE and read the fixed band-factor cells + fixed initial X:
	const AF0 = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_B );
	zpbtrf( uplo, N, kd, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ] );
	const Lfac = readBandFactor( AF0, N, kd, uplo );

	const X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT_D );
	zpbtrs( uplo, N, kd, nrhs, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ], X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	const Xinit = readMat( X0r, N, nrhs );

	checked( 'zpbrfs', 'layout-invariance', function run() {
		layoutInvariant( aLayouts, function build( aL, idx ) {
			const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, aL );
			const AFr = schemes.banded.realize( sc, Lfac, { 'part': uplo, 'k': kd }, aL );
			const bL = bLayouts[ idx % bLayouts.length ];
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bL );
			const Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, bL );
			const FERR = new Float64Array( nrhs );
			const BERR = new Float64Array( nrhs );
			const WORK = new Complex128Array( 2 * N );
			const RWORK = new Float64Array( N );
			zpbrfs( uplo, N, kd, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
			const out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			let k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'zpbrfs '+uplo+' layout invariance' } );
	});
}
