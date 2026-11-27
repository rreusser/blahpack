/**
* Property-based validation for zpbcon, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pb` -> HPD BANDED (schemes.banded
* with half-bandwidth kd, logical.positiveDefiniteBanded = Hermitian positive-
* definite band matrix); `con` (condition-number estimate from a banded Cholesky
* factor) -> PROPERTY: the returned RCOND estimates `1/κ₁(A)` where
* `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. zpbcon consumes the banded Cholesky factorization (produced
* here by the already-validated zpbtrf) plus a caller-supplied `anorm = ‖A0‖₁`.
* RCOND is an ESTIMATE (zlacn2 gives a lower bound on ‖A⁻¹‖₁). We compute the TRUE
* reciprocal condition number INDEPENDENTLY: `anorm` from the full Hermitian A0,
* and `‖A⁻¹‖₁` from an independent solve `A0·X = I` via the trusted banded zpbsv.
* RCOND must lie within a small factor F of the truth and in (0,1]. NOTE the
* complex signature: WORK is a Complex128Array of 2N and the final workspace is a
* real RWORK of N (not IWORK).
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, norms } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zpbcon from './../lib/ndarray.js';
import zpbtrf from '../../zpbtrf/lib/ndarray.js';
import zpbsv from '../../zpbsv/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const NS = [ 2, 3, 5, 8, 16, 17, 33 ];
const TIGHT_BAND = schemes.banded.layouts()[ 0 ]; // tight col-major band
const TIGHT_DENSE = schemes.dense.layouts()[ 0 ];
const F = 3; // estimate must be within this factor of the true reciprocal cond.

// Unique half-bandwidths in {0,1,2,N-1} clamped to [0, N-1].
function bands( n ) {
	const hi = Math.max( 0, n - 1 );
	const out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		const v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Identity logical matrix (n x n).
function identity( n ) {
	const I = new LogicalMatrix( sc, n, n );
	let i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted banded zpbsv on a fresh
// copy (X = A0⁻¹, full dense N x N), then return the 1-norm (max abs col sum).
function invNorm1( A0, n, kd, uplo ) {
	const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_BAND );
	const Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT_DENSE );
	const info = zpbsv( uplo, n, kd, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zpbsv failed (info='+info+'); matrix not HPD?' );
	}
	let mx = 0.0;
	let s, i, j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( Br.read( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Read the referenced uplo band triangle of a factor back into a LogicalMatrix
// (positions outside the band / opposite triangle exact zero).
function readBandTri( R, n, kd, uplo ) {
	const Tri = new LogicalMatrix( sc, n, n );
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
			Tri.set( i, j, R.read( i, j ) );
		}
	}
	return Tri;
}

function assertRcond( rcond, trueRcond, label ) {
	if ( !Number.isFinite( rcond ) ) {
		throw new Error( label+': rcond is not finite ('+rcond+')' );
	}
	if ( !( rcond > 0.0 && rcond <= 1.0 + 1e-9 ) ) {
		throw new Error( label+': rcond '+rcond+' not in (0,1]' );
	}
	if ( !( rcond <= F * trueRcond && rcond >= trueRcond / F ) ) {
		throw new Error( label+': rcond '+rcond.toExponential( 6 )+' not within factor '+F+' of true '+trueRcond.toExponential( 6 ) );
	}
}

// Steps 2-3-5: property across uplo x N x kd (incl diagonal kd=0 and near-full
// bands). Factor a copy with zpbtrf, estimate with zpbcon, then compare against
// the independently computed true reciprocal condition number.
test( 'zpbcon: rcond estimates 1/kappa1(A) (uplo x N x kd)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		NS.forEach( function eachN( N ) {
			bands( N ).forEach( function eachKd( kd ) {
				runProperty( uplo, N, kd );
			});
		});
	});
});

function runProperty( uplo, N, kd ) {
	const rng = new RNG( 0x100 + ( N * 100 ) + kd ); // reproducible; log on failure
	const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
	const anorm = norms.oneNorm( sc, A0 ); // full Hermitian band 1-norm

	const Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_BAND );
	zpbtrf( uplo, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ] );

	const rcond = new Float64Array( 1 );
	const WORK = new Complex128Array( ( 2 * N ) + 2 );
	const RWORK = new Float64Array( N + 2 );
	zpbcon( uplo, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );

	const trueRcond = 1.0 / ( anorm * invNorm1( A0, N, kd, uplo ) );
	checked( 'zpbcon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'zpbcon '+uplo+' N='+N+' kd='+kd );
	});
}

// Step 4: layout-invariance fuzz. The band factor is built ONCE and re-realized
// per banded layout, isolating zpbcon from zpbtrf's own reordering. zpbcon's inner
// zlatbs (band triangular solves + column-norm reductions) and zlacn2/izamax read
// the band by value with algorithm-fixed loop order, so the rcond estimate is
// bit-exact across ALL banded layouts (col AND row, incl. negative strides).
test( 'zpbcon: bit-exact across all banded storage layouts', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 11;
	const kd = 3;
	const SEED = 0xF00D;
	const rng = new RNG( SEED );
	const A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
	const anorm = norms.oneNorm( sc, A0 );
	const layouts = schemes.banded.layouts();

	// Factor ONCE, extract the fixed band factor triangle:
	const Ar0 = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, layouts[ 0 ] );
	zpbtrf( uplo, N, kd, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ], Ar0.args[ 2 ] );
	const Lfac = readBandTri( Ar0, N, kd, uplo );

	checked( 'zpbcon', 'layout-invariance', function run() {
		let ref = null;
		let idx = 0;
		layouts.forEach( function each( layout ) {
			const Fr = schemes.banded.realize( sc, Lfac, { 'part': uplo, 'k': kd }, layout );
			const rcond = new Float64Array( 1 );
			const WORK = new Complex128Array( ( 2 * N ) + 2 );
			const RWORK = new Float64Array( N + 2 );
			zpbcon( uplo, N, kd, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], Fr.args[ 2 ], anorm, rcond, WORK, 1, 0, RWORK, 1, 0 );
			if ( !Number.isFinite( rcond[ 0 ] ) ) {
				throw new Error( 'zpbcon '+uplo+' variant '+idx+': non-finite rcond (OOB read into poisoned padding?)' );
			}
			if ( ref === null ) {
				ref = rcond[ 0 ];
			} else if ( !Object.is( rcond[ 0 ], ref ) ) {
				throw new Error( 'zpbcon '+uplo+' layout variant '+idx+': '+rcond[ 0 ]+' != '+ref );
			}
			idx += 1;
		});
	});
}
