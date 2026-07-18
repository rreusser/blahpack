/**
* Property-based validation for zsytrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `sy` -> COMPLEX-SYMMETRIC dense
* (schemes.dense, logical.symmetric — NOT Hermitian: zsytrf factors A = A^T with
* NO conjugation, so a plain complex-symmetric matrix is the correct generator);
* `trs` (Bunch-Kaufman L*D*L^T / U*D*U^T solve, multiple RHS) -> RESIDUAL: the
* solve consumes a factorization (produced here by zsytrf), then we check
* `A0*X = B0` against the ORIGINAL complex-symmetric matrix A0. The residual is
* independent of the factorization's internal correctness — a wrong factorization
* would still have to yield an X reproducing B0 through A0 — so this one property
* certifies the zsytrf/zsytrs PAIR against A0.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zsytrs from './../lib/ndarray.js';
import zsytrf from '../../zsytrf/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

function readB( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

function readTri( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Steps 2-3-5: residual property over uplo x N x nrhs x every pivot-valid storage
// layout (factor and solve share the layout; zsytrf's pivot search restricts to
// positive-row-stride pivotLayouts). Sweeping col AND row order at backward-error
// tolerance certifies the solve's cross-storage-order addressing. Factor A0 with
// zsytrf, solve with zsytrs, then verify A0*X = B0 per RHS column against the
// ORIGINAL complex-symmetric matrix.
test( 'zsytrs: Bunch-Kaufman solve residual (uplo x N x nrhs x layout)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, layout ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.symmetric( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( N );

	zsytrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
	zsytrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'zsytrs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zsytrs '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. zsytrs consumes an already-computed
// factorization, so this test PRE-FACTORS once at a tight layout and then
// re-realizes those FIXED factor values (+ pivots) at each storage layout,
// running only zsytrs. This isolates zsytrs's OWN addressing from the pivoting
// factor (zsytrf's idamax-style pivot search is out of contract for a negative
// first-dimension stride; zsytrs has no pivot search). Its inner zgemv/zgeru
// reorder the summation on a col<->row storage FLIP (~1 ULP, not a defect —
// cross-order agreement is certified by the residual property above), so
// bit-exactness is asserted only WITHIN a storage-order family (col / row);
// offset, leading-dim padding, gap, and stride sign are fuzzed inside each.
const allLayouts = schemes.dense.layouts();
const colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zsytrs: bit-exact within storage-order family (solve isolated from factor)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, colLayouts, 'col' );
		runInvariance( uplo, rowLayouts, 'row' );
	});
});

function runInvariance( uplo, variants, fam ) {
	const N = 9;
	const nrhs = 3;
	const SEED = 0xBEEF;

	// Factor ONCE at the tight col-major layout to obtain a fixed factor +
	// pivots shared by every layout variant below:
	const rng = new RNG( SEED );
	const A0 = logical.symmetric( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const tight = schemes.dense.pivotLayouts()[ 0 ];
	const Af = schemes.dense.realize( sc, A0, { 'part': uplo }, tight );
	const ipiv = new Int32Array( N );
	zsytrf( uplo, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	const Afac = readTri( Af, N, uplo );

	checked( 'zsytrs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const Ar = schemes.dense.realize( sc, Afac, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			zsytrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zsytrs '+uplo+' layout invariance '+fam+'-major' } );
	});
}
