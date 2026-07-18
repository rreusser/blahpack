/**
* Property-based validation for zpbsvx, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pb` -> HPD BANDED (schemes.banded
* with half-bandwidth kd, logical.positiveDefiniteBanded); `svx` (EXPERT
* Cholesky-solve DRIVER: optional equilibration + factor + condition estimate +
* solve + iterative refinement + error bounds, all in one call) -> a COMPOSITE of
* the three properties already proven for its constituent routines (zpbsv/zpbrfs
* residual, zpbcon rcond, zpbrfs FERR/BERR). We drive zpbsvx with
* fact='not-factored' (factor A in place, NO equilibration -> equed='none', so X
* solves the ORIGINAL A0*X=B0 directly) and assert, against the ORIGINAL full
* Hermitian band A0 (both triangles reconstructed by the oracle):
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (a valid solve).
*   (b) rcond estimates 1/κ₁(A0): within a small factor F of the INDEPENDENT true
*       reciprocal condition number (anorm from A0, ‖A0⁻¹‖₁ from a trusted banded
*       zpbsv solve of A0*X=I), and in (0,1].
*   (c) BERR tiny and >= 0; the ACTUAL forward error ‖Xtrue-X‖inf/‖X‖inf <=
*       FERR*C; FERR in [0,1) (a valid, not-absurdly-loose bound), Xtrue from the
*       trusted zpbsv.
* NOTE the complex signature: WORK is a Complex128Array of 2N elements and the
* final workspace is a real RWORK of N (not IWORK); base returns a plain integer
* `info` and writes `equed[0]` into the caller's array; `rcond` is an explicit
* Float64Array out-array after offsetX. Only the uplo band triangle of AB / AFB is
* realized; everything else stays poisoned, so a wrong-triangle / out-of-band read
* trips a NaN.
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zpbsvx from './../lib/ndarray.js';
import zpbsv from '../../zpbsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var KDS = [ 0, 1, 2 ];
var NRHS = [ 1, 2 ];
var TIGHT_B = schemes.banded.layouts()[ 0 ]; // tight band storage
var TIGHT_D = schemes.dense.layouts()[ 0 ];   // tight col-major (B / X)
var F = 5; // rcond estimate must be within this factor of the true reciprocal cond.
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Read column j out of physical storage as an array of scalar values.
function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs matrix out of physical storage into a LogicalMatrix.
function readMat( R, n, nrhs ) {
	var X = new LogicalMatrix( sc, n, nrhs );
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// inf-norm of a vector of scalar values (max modulus).
function infNormVec( a ) {
	var mx = 0.0;
	var m;
	var i;
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
	var mx = 0.0;
	var m;
	var i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// 1-norm (max abs column sum) of the FULL Hermitian band logical matrix
// (out-of-band entries are exact zero in the logical, so full sum is correct).
function norm1Full( M, n ) {
	var mx = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted banded zpbsv on a fresh
// copy (X = A0⁻¹, full dense N x N), then return the 1-norm (max abs col sum).
function invNorm1( A0, n, kd, uplo ) {
	var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_B );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT_D );
	var info = zpbsv( uplo, n, kd, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zpbsv failed (info='+info+'); matrix not HPD?' );
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

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zpbsv.
function trueSolution( A0, B0, N, kd, nrhs, uplo ) {
	var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, TIGHT_B );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT_D );
	var info = zpbsv( uplo, N, kd, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zpbsv failed (info='+info+'); matrix not HPD?' );
	}
	return Br;
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

// Drive zpbsvx (fact='not-factored', no equilibration) and return the physical X
// reader plus the rcond/FERR/BERR outputs, integer info, and the equed string.
function drive( uplo, N, kd, nrhs, A0, B0, abLayout, bLayout ) {
	var Ar = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, abLayout );
	var AFr = schemes.banded.realize( sc, A0, { 'part': uplo, 'k': kd }, abLayout ); // overwritten by zcopy+zpbtrf
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout ); // overwritten by zlacpy+zpbtrs
	var equed = [ '' ];
	var s = new Float64Array( Math.max( N, 1 ) );
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Complex128Array( Math.max( 2 * N, 1 ) );
	var RWORK = new Float64Array( Math.max( N, 1 ) );
	var info = zpbsvx( 'not-factored', uplo, N, kd, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], equed, s, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	return {
		'Xr': Xr,
		'rcond': rcond,
		'FERR': FERR,
		'BERR': BERR,
		'info': info,
		'equed': equed[ 0 ]
	};
}

// Steps 2-3-5: the three composite properties across uplo x N x kd x nrhs (incl
// diagonal kd=0).
test( 'zpbsvx: expert-driver residual + rcond + FERR/BERR (uplo x N x kd x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			KDS.forEach( function eachKd( kd0 ) {
				var kd = Math.min( kd0, Math.max( 0, N - 1 ) );
				NRHS.forEach( function eachNrhs( nrhs ) {
					runProperty( uplo, N, kd, nrhs );
				});
			});
		});
	});
});

function runProperty( uplo, N, kd, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 100 ) + ( kd * 10 ) + nrhs ); // reproducible
	var A0 = logical.positiveDefiniteBanded( sc, rng, N, kd ); // full HPD band oracle
	var B0 = logical.general( sc, rng, N, nrhs );
	var anorm = norm1Full( A0, N );

	var d = drive( uplo, N, kd, nrhs, A0, B0, TIGHT_B, TIGHT_D );
	var tag = 'zpbsvx '+uplo+' N='+N+' kd='+kd+' nrhs='+nrhs;

	if ( d.info !== 0 ) {
		throw new Error( tag+': zpbsvx returned info='+d.info+' (expected 0 for well-conditioned HPD input)' );
	}
	if ( d.equed !== 'none' ) {
		throw new Error( tag+': expected equed=none for fact=not-factored, got '+d.equed );
	}

	// (a) residual: X solves the ORIGINAL A0*X = B0 (no equilibration).
	checked( 'zpbsvx', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( d.Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond estimates 1/κ₁(A0) within factor F, in (0,1].
	checked( 'zpbsvx', 'property', function run() {
		var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, kd, uplo ) );
		assertRcond( d.rcond[ 0 ], trueRcond, tag );
	});

	// (c) BERR tiny and >= 0; FERR a valid, not-absurdly-loose forward-error bound.
	checked( 'zpbsvx', 'structural', function run() {
		var Xtrue = trueSolution( A0, B0, N, kd, nrhs, uplo );
		var xcol;
		var tcol;
		var berrCap;
		var eActual;
		var eBound;
		var j;
		berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( d.BERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': BERR not finite ('+d.BERR[ j ]+')' );
			}
			if ( !( d.BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+d.BERR[ j ]+' is negative' );
			}
			if ( !( d.BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+d.BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
			if ( !Number.isFinite( d.FERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': FERR not finite ('+d.FERR[ j ]+')' );
			}
			if ( !( d.FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+d.FERR[ j ]+' is negative' );
			}
			if ( !( d.FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+d.FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( d.Xr, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( d.FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+d.FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. zpbsvx routes through zpbtrf + zpbtrs (ztbsv) +
// zpbcon (zlatbs/zlacn2) + zpbrfs (zhbmv/zaxpy); none reorder their reductions with
// storage strides, so banded storage is a SINGLE addressing family (col AND row,
// incl negative strides — as zpbsv/zpbrfs already certify). Changing ONLY
// addressing must reproduce X ++ rcond ++ FERR ++ BERR bit-for-bit across ALL
// banded AB/AFB layouts and ALL dense B/X layouts.
var aLayouts = schemes.banded.layouts();
var bLayouts = schemes.dense.layouts();

test( 'zpbsvx: bit-exact across storage layouts (single family)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 11;
	var kd = 3;
	var nrhs = 2;
	var SEED = 0xBEEF;
	checked( 'zpbsvx', 'layout-invariance', function run() {
		layoutInvariant( aLayouts, function build( aL, idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.positiveDefiniteBanded( sc, rng, N, kd );
			var B0 = logical.general( sc, rng, N, nrhs );
			var bL = bLayouts[ idx % bLayouts.length ];
			var d = drive( uplo, N, kd, nrhs, A0, B0, aL, bL );
			var out = check.flattenLogical( sc, readMat( d.Xr, N, nrhs ) );
			var m;
			out.push( d.rcond[ 0 ] );
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.FERR[ m ] );
			}
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.BERR[ m ] );
			}
			return out;
		}, { 'label': 'zpbsvx '+uplo+' layout invariance' } );
	});
}
