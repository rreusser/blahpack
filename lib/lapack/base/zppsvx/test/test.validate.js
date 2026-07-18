/**
* Property-based validation for zppsvx, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pp` -> HPD PACKED (schemes.packed,
* logical.positiveDefinite); `svx` (EXPERT Cholesky-solve DRIVER: optional
* equilibration + factor + condition estimate + solve + iterative refinement +
* error bounds, all in one call) -> a COMPOSITE of the three properties already
* proven for its constituent routines (zppsv/zpprfs residual, zppcon rcond,
* zpprfs FERR/BERR). We drive zppsvx with fact='not-factored' (factor A in place,
* NO equilibration -> equed='none', so X solves the ORIGINAL A0*X=B0 directly)
* and assert, against the ORIGINAL full Hermitian A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (a valid solve).
*   (b) rcond estimates 1/κ₁(A0): within a small factor F of the INDEPENDENT true
*       reciprocal condition number (anorm from A0, ‖A0⁻¹‖₁ from a trusted packed
*       zppsv solve of A0*X=I), and in (0,1].
*   (c) BERR tiny and >= 0; the ACTUAL forward error ‖Xtrue-X‖inf/‖X‖inf <=
*       FERR*C; FERR in [0,1) (a valid, not-absurdly-loose bound), Xtrue from the
*       trusted zppsv.
* NOTE the complex signature: WORK is a Complex128Array of 2N elements and the
* final workspace is a real RWORK of N (not IWORK); base returns a plain integer
* `info` and writes `equed[0]` into the caller's array; `rcond` is an explicit
* Float64Array out-array after offsetX. AP / AFP are PACKED (only the uplo triangle
* exists); B / X are dense. Poisoned unreferenced slots trip a NaN on any
* stride/offset addressing bug (the zpptri class).
*/

import test from 'node:test';

import Complex128Array from '@stdlib/array/complex128/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zppsvx from './../lib/ndarray.js';
import zppsv from '../../zppsv/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const NRHS = [ 1, 2 ];
const TIGHTP = schemes.packed.layouts()[ 0 ]; // tight packed (AP / AFP)
const TIGHTD = schemes.dense.layouts()[ 0 ];   // tight col-major (B / X)
const F = 5; // rcond estimate must be within this factor of the true reciprocal cond.
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

// 1-norm (max abs column sum) of the FULL Hermitian logical matrix.
function norm1Full( M, n ) {
	let mx = 0.0;
	let s, i, j;
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
	const I = new LogicalMatrix( sc, n, n );
	let i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted packed zppsv on a fresh
// copy; X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	const Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHTD );
	const info = zppsv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zppsv failed (info='+info+'); matrix not HPD?' );
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

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zppsv.
function trueSolution( A0, B0, N, nrhs, uplo ) {
	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHTD );
	const info = zppsv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zppsv failed (info='+info+'); matrix not HPD?' );
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

// Drive zppsvx (fact='not-factored', no equilibration) and return the physical X
// reader plus the rcond/FERR/BERR outputs, integer info, and the equed string.
function drive( uplo, N, nrhs, A0, B0, apLayout, bLayout ) {
	const Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout );
	const AFr = schemes.packed.realize( sc, A0, { 'part': uplo }, apLayout ); // overwritten by zcopy+zpptrf
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout );
	const Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout ); // overwritten by zlacpy+zpptrs
	const equed = [ '' ];
	const s = new Float64Array( Math.max( N, 1 ) );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( Math.max( 2 * N, 1 ) );
	const RWORK = new Float64Array( Math.max( N, 1 ) );
	const info = zppsvx( 'not-factored', uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], equed, s, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	return {
		'Xr': Xr,
		'rcond': rcond,
		'FERR': FERR,
		'BERR': BERR,
		'info': info,
		'equed': equed[ 0 ]
	};
}

// Steps 2-3-5: the three composite properties across uplo flags, a size sweep,
// and nrhs.
test( 'zppsvx: expert-driver residual + rcond + FERR/BERR (uplo x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runProperty( uplo, N, nrhs );
			});
		});
	});
});

function runProperty( uplo, N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.positiveDefinite( sc, rng, N ); // full Hermitian/HPD oracle
	const B0 = logical.general( sc, rng, N, nrhs );
	const anorm = norm1Full( A0, N );

	const d = drive( uplo, N, nrhs, A0, B0, TIGHTP, TIGHTD );
	const tag = 'zppsvx '+uplo+' N='+N+' nrhs='+nrhs;

	if ( d.info !== 0 ) {
		throw new Error( tag+': zppsvx returned info='+d.info+' (expected 0 for well-conditioned HPD input)' );
	}
	if ( d.equed !== 'none' ) {
		throw new Error( tag+': expected equed=none for fact=not-factored, got '+d.equed );
	}

	// (a) residual: X solves the ORIGINAL A0*X = B0 (no equilibration).
	checked( 'zppsvx', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( d.Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond estimates 1/κ₁(A0) within factor F, in (0,1].
	checked( 'zppsvx', 'property', function run() {
		const trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
		assertRcond( d.rcond[ 0 ], trueRcond, tag );
	});

	// (c) BERR tiny and >= 0; FERR a valid, not-absurdly-loose forward-error bound.
	checked( 'zppsvx', 'structural', function run() {
		const Xtrue = trueSolution( A0, B0, N, nrhs, uplo );
		let xcol, tcol, eActual, eBound, j;
		const berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
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

// Step 4: layout-invariance fuzz. Packed storage is a SINGLE addressing family
// (the packed loops do not switch summation form on stride, unlike dense col/row),
// and zppsvx's inner kernels (zpptrf/zpptrs via ztpsv, zppcon via zlatps/zlacn2,
// zpprfs via zhpmv/zaxpy) walk AP / B / X by stride without reordering their
// reductions — so changing ONLY addressing must reproduce X ++ rcond ++ FERR ++
// BERR bit-for-bit across ALL packed AP layouts (incl stride 2/3 and negative
// packed strides — the class that bit zpptri) and ALL dense B/X layouts (row/col,
// padding, negative strides). A divergence on any non-unit / negative / row-major
// stride is a genuine storage-mapping bug.
const apLayouts = schemes.packed.layouts();
const bLayouts = schemes.dense.layouts();

test( 'zppsvx: bit-exact across the storage layout family (packed AP + dense B/X)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 9;
	const nrhs = 2;
	const SEED = 0xBEEF;
	const nVariants = Math.max( apLayouts.length, bLayouts.length );
	const variants = [];
	let k;
	for ( k = 0; k < nVariants; k++ ) {
		variants.push( k );
	}
	checked( 'zppsvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( idx ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.positiveDefinite( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const d = drive( uplo, N, nrhs, A0, B0, apLayouts[ idx % apLayouts.length ], bLayouts[ idx % bLayouts.length ] );
			const out = check.flattenLogical( sc, readMat( d.Xr, N, nrhs ) );
			let m;
			out.push( d.rcond[ 0 ] );
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.FERR[ m ] );
			}
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.BERR[ m ] );
			}
			return out;
		}, { 'label': 'zppsvx '+uplo+' layout invariance' } );
	});
}
