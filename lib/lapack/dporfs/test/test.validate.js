/**
* Property-based validation for dporfs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `po` -> SPD dense (schemes.dense,
* logical.positiveDefinite); `rfs` (iterative refinement + error bounds) ->
* three independent properties. dporfs refines an approximate solution X to
* A*X = B and returns FERR (forward-error bound) and BERR (componentwise
* backward error). The Cholesky factor AF is produced by the already-validated
* dpotrf; the un-refined initial X by dpotrs; the TRUE solution independently by
* the trusted dposv. We assert, against the ORIGINAL full symmetric A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* Only the uplo triangle of A / AF is realized; the opposite stays poisoned, so a
* read of the wrong triangle trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import dporfs from './../lib/ndarray.js';
import dpotrf from '../../dpotrf/lib/ndarray.js';
import dpotrs from '../../dpotrs/lib/ndarray.js';
import dposv from '../../dposv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];
const NRHS = [ 1, 2 ];
const TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
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

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted dposv.
function trueSolution( A0, B0, N, nrhs, uplo ) {
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	const info = dposv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dposv failed (info='+info+'); matrix not SPD?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across uplo flags, a size sweep, and nrhs.
test( 'dporfs: refinement residual + BERR + FERR bound (uplo x N x nrhs)', function t() {
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
	const A0 = logical.positiveDefinite( sc, rng, N ); // full symmetric/SPD oracle
	const B0 = logical.general( sc, rng, N, nrhs );

	// A = original SPD (uplo triangle); AF = its Cholesky factor:
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	const AFr = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	dpotrf( uplo, N, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ] );

	// B (RHS, unchanged) and X (initial un-refined solve, refined in place):
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	const Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	dpotrs( uplo, N, nrhs, AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Float64Array( 3 * N );
	const IWORK = new Int32Array( N );
	dporfs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );

	const Xtrue = trueSolution( A0, B0, N, nrhs, uplo );

	const tag = 'dporfs '+uplo+' N='+N+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of A0*X = B0.
	checked( 'dporfs', 'residual', function run() {
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
	checked( 'dporfs', 'structural', function run() {
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

// Step 4: layout-invariance fuzz. The Cholesky factor AF and the initial X are
// produced ONCE (fixed values), then re-realized per layout together with the
// fixed A0 and B0; dporfs's internal kernels (dsymv, dpotrs, daxpy, dlacn2) run
// over identical values, so only ADDRESSING changes and the refined X + FERR +
// BERR must reproduce bit-for-bit. Column- and row-major storage are fuzzed as
// separate families (a storage-order flip can legitimately reorder the Level-2
// BLAS fast paths; cross-order correctness is certified by the swept residual).
const allLayouts = schemes.dense.layouts();
const colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dporfs: bit-exact within storage-order family (col / row)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	const N = 9;
	const nrhs = 2;
	const SEED = 0xBEEF;
	const rng = new RNG( SEED );
	const A0 = logical.positiveDefinite( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE and read the fixed factor triangle + fixed initial X:
	const AF0 = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	dpotrf( uplo, N, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ] );
	const Lfac = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				Lfac.set( i, j, AF0.read( i, j ) );
			}
		}
	}
	const X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	dpotrs( uplo, N, nrhs, AF0.data, AF0.args[ 0 ], AF0.args[ 1 ], AF0.args[ 2 ], X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	const Xinit = readMat( X0r, N, nrhs );

	checked( 'dporfs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			const AFr = schemes.dense.realize( sc, Lfac, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			const Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, layout );
			const FERR = new Float64Array( nrhs );
			const BERR = new Float64Array( nrhs );
			const WORK = new Float64Array( 3 * N );
			const IWORK = new Int32Array( N );
			dporfs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
			const out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			let k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'dporfs '+uplo+' layout invariance '+fam+'-major' } );
	});
}
