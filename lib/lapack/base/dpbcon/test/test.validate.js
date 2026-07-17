/**
* Property-based validation for dpbcon, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pb` -> SPD BANDED (schemes.banded
* with half-bandwidth kd, logical.positiveDefiniteBanded = real symmetric PD band
* matrix under conj=identity); `con` (condition-number estimate from a banded
* Cholesky factor) -> PROPERTY: the returned RCOND estimates `1/κ₁(A)` where
* `κ₁ = ‖A‖₁·‖A⁻¹‖₁`. dpbcon consumes the banded Cholesky factorization (produced
* here by the already-validated dpbtrf) plus a caller-supplied `anorm = ‖A0‖₁`.
* RCOND is an ESTIMATE (dlacn2 gives a lower bound on ‖A⁻¹‖₁, so RCOND is an UPPER
* estimate, tight for these well-conditioned diagonally-dominant SPD band
* matrices). We compute the TRUE reciprocal condition number INDEPENDENTLY:
* `anorm` from the full symmetric A0, and `‖A⁻¹‖₁` from an independent solve
* `A0·X = I` via the trusted banded dpbsv (X = A⁻¹). RCOND must lie within a small
* factor F of the truth and in (0,1]. Only the uplo triangle of the band factor is
* realized; the rest stays poisoned, so a stray read trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, norms } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dpbcon from './../lib/ndarray.js';
import dpbtrf from '../../dpbtrf/lib/ndarray.js';
import dpbsv from '../../dpbsv/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NS = [ 2, 3, 5, 8, 16, 17, 33 ];
var TIGHT_BAND = schemes.banded.layouts()[ 0 ]; // tight col-major band
var TIGHT_DENSE = schemes.dense.layouts()[ 0 ];
var F = 3; // estimate must be within this factor of the true reciprocal cond.

// Unique half-bandwidths in {0,1,2,N-1} clamped to [0, N-1].
function bands( n ) {
	var hi = Math.max( 0, n - 1 );
	var out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		var v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Identity logical matrix (n x n).
function identity( n ) {
	var I = new LogicalMatrix( sc, n, n );
	var i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted banded dpbsv on a fresh
// copy (X = A0⁻¹, full dense N x N), then return the 1-norm (max abs col sum).
function invNorm1( A0, n, kd, uplo ) {
	var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_BAND );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT_DENSE );
	var info = dpbsv( uplo, n, kd, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dpbsv failed (info='+info+'); matrix not SPD?' );
	}
	var mx = 0.0;
	var s;
	var i;
	var j;
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
	var Tri = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	var lo;
	var hi;
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
// bands). Factor a copy with dpbtrf, estimate with dpbcon, then compare against
// the independently computed true reciprocal condition number.
test( 'dpbcon: rcond estimates 1/kappa1(A) (uplo x N x kd)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		NS.forEach( function eachN( N ) {
			bands( N ).forEach( function eachKd( kd ) {
				runProperty( uplo, N, kd );
			});
		});
	});
});

function runProperty( uplo, N, kd ) {
	var rng = new RNG( 0x100 + ( N * 100 ) + kd ); // reproducible; log on failure
	var A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
	var anorm = norms.oneNorm( sc, A0 ); // full symmetric band 1-norm

	var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_BAND );
	dpbtrf( uplo, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ] );

	var rcond = new Float64Array( 1 );
	var WORK = new Float64Array( ( 3 * N ) + 4 );
	var IWORK = new Int32Array( N + 4 );
	dpbcon( uplo, N, kd, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );

	var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, kd, uplo ) );
	checked( 'dpbcon', 'property', function run() {
		assertRcond( rcond[ 0 ], trueRcond, 'dpbcon '+uplo+' N='+N+' kd='+kd );
	});
}

// Step 4: layout-invariance fuzz. The band factor is built ONCE and re-realized
// per banded layout, isolating dpbcon from dpbtrf's own reordering. dpbcon's inner
// dlatbs (band triangular solves + column-norm reductions) and dlacn2/idamax read
// the band by value with algorithm-fixed loop order, so the rcond estimate is
// bit-exact across ALL banded layouts (col AND row, incl. negative strides).
test( 'dpbcon: bit-exact across all banded storage layouts', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 11;
	var kd = 3;
	var SEED = 0xF00D;
	var rng = new RNG( SEED );
	var A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
	var anorm = norms.oneNorm( sc, A0 );
	var layouts = schemes.banded.layouts();

	// Factor ONCE, extract the fixed band factor triangle:
	var Ar0 = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, layouts[ 0 ] );
	dpbtrf( uplo, N, kd, Ar0.data, Ar0.args[ 0 ], Ar0.args[ 1 ], Ar0.args[ 2 ] );
	var Lfac = readBandTri( Ar0, N, kd, uplo );

	checked( 'dpbcon', 'layout-invariance', function run() {
		var ref = null;
		var idx = 0;
		layouts.forEach( function each( layout ) {
			var Fr = schemes.banded.realize( sc, Lfac, { 'part': uplo, 'k': kd }, layout );
			var rcond = new Float64Array( 1 );
			var WORK = new Float64Array( ( 3 * N ) + 4 );
			var IWORK = new Int32Array( N + 4 );
			dpbcon( uplo, N, kd, Fr.data, Fr.args[ 0 ], Fr.args[ 1 ], Fr.args[ 2 ], anorm, rcond, WORK, 1, 0, IWORK, 1, 0 );
			if ( !Number.isFinite( rcond[ 0 ] ) ) {
				throw new Error( 'dpbcon '+uplo+' variant '+idx+': non-finite rcond (OOB read into poisoned padding?)' );
			}
			if ( ref === null ) {
				ref = rcond[ 0 ];
			} else if ( !Object.is( rcond[ 0 ], ref ) ) {
				throw new Error( 'dpbcon '+uplo+' layout variant '+idx+': '+rcond[ 0 ]+' != '+ref );
			}
			idx += 1;
		});
	});
}
