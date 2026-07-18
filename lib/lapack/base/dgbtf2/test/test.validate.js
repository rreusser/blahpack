/**
* Property-based validation for dgbtf2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> general BANDED
* (schemes.banded with kl/ku + `luFill`, logical.banded); `tf2` (unblocked LU
* factorization with partial pivoting) -> because reconstruction from the LU
* fill storage (KL extra rows on top, top rows NaN-poisoned) is messy, we
* validate via FACTOR + SOLVE RESIDUAL: factor with dgbtf2, solve with the
* already-validated dgbtrs, then assert `A0*X = B0` per RHS column against the
* ORIGINAL band matrix A0 (full logical, both zero and band entries). A wrong
* factorization would still have to produce an X that reproduces B0 through A0.
*
* Pivoting caveat: dgbtf2 does an `idamax` PIVOT SEARCH over a band sub-column,
* which walks the band array's FIRST dimension. A negative band-row stride
* (sgn1 = -1) is out of contract for the whole pivoting family (idamax returns
* -1 -> IPIV=-1 -> out-of-bounds reads; see LEARNINGS.md getrf/getf2 entry), so
* every layout sweep is restricted to positive band-row stride.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgbtf2 from './../lib/ndarray.js';
import dgbtrs from '../../dgbtrs/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const NS = [ 2, 3, 5, 8, 16, 17, 33 ];
const NRHS = [ 1, 2, 3 ];

// Positive band-row-stride banded layouts (drop sgn1 === -1: out of contract for
// the pivot search). Still fuzzes offset, leading-dim padding, negative COLUMN
// stride, and the col<->row storage-order flip.
const POSROW = schemes.banded.layouts().filter( function posRow( L ) {
	return L.sgn1 !== -1;
});

// (kl,ku) band-width pairs, clamped to [0, N-1] and de-duplicated: diagonal-only,
// pure-lower, pure-upper, symmetric small, wide asymmetric, and near-full.
function bandPairs( n ) {
	const hi = Math.max( 0, n - 1 );
	const raw = [ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ], [ 2, 3 ], [ 2, 2 ], [ hi, 0 ], [ 0, hi ] ];
	const seen = {};
	const out = [];
	raw.forEach( function each( p ) {
		const kl = Math.min( p[ 0 ], hi );
		const ku = Math.min( p[ 1 ], hi );
		const key = kl+','+ku;
		if ( !seen[ key ] ) {
			seen[ key ] = 1;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

// Read column j of the solution X out of physical B storage.
function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs solution back into a LogicalMatrix (for bit-exact
// layout comparison).
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

// Steps 2-3-5: factor+solve residual A0*X = B0 across N x (kl,ku) x nrhs. A
// single tight banded layout is used here; every layout is exercised by the
// invariance test below.
test( 'dgbtf2: banded LU factor+solve residual (N x (kl,ku) x nrhs)', function t() {
	NS.forEach( function eachN( N ) {
		bandPairs( N ).forEach( function eachBand( band ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( N, band[ 0 ], band[ 1 ], nrhs );
			});
		});
	});
});

function runResidual( N, kl, ku, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 100 ) + ( kl * 10 ) + ku ); // reproducible; log on failure
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, POSROW[ 0 ] );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	const ipiv = new Int32Array( N ); // 0-based pivots from dgbtf2

	dgbtf2( N, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
	dgbtrs( 'no-transpose', N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	checked( 'dgbtf2', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dgbtf2 N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. The factor+solve solution X must be bit-exact
// across storage layouts WITHIN a single storage-order family — dgbtf2's inner
// idamax/dger and dgbtrs's band solves legitimately reorder across the col<->row
// flip (optimized Level-2 kernels; see LEARNINGS.md dpotf2/getf2 entries), so
// cross-order correctness is certified by the residual sweep, not bit-equality.
// The band-array layout is fuzzed for AB and a same-order dense layout for B.
const colBand = POSROW.filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowBand = POSROW.filter( function isRow( L ) {
	return L.order === 'row';
});
const colDense = schemes.dense.layouts().filter( function cd( L ) {
	return L.sgn1 !== -1 && L.order !== 'row';
});
const rowDense = schemes.dense.layouts().filter( function rd( L ) {
	return L.sgn1 !== -1 && L.order === 'row';
});

test( 'dgbtf2: solution bit-exact within storage-order family (col / row)', function t() {
	runInvariance( 'col', colBand, colDense );
	runInvariance( 'row', rowBand, rowDense );
});

function runInvariance( fam, bandLayouts, denseLayouts ) {
	const N = 11;
	const kl = 2;
	const ku = 3;
	const nrhs = 2;
	const SEED = 0xF00D;

	checked( 'dgbtf2', 'layout-invariance', function run() {
		layoutInvariant( bandLayouts, function build( aL, idx ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.banded( sc, rng, N, N, kl, ku );
			const B0 = logical.general( sc, rng, N, nrhs );
			const Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, aL );
			const bL = denseLayouts[ idx % denseLayouts.length ];
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bL );
			const ipiv = new Int32Array( N );
			dgbtf2( N, N, kl, ku, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0 );
			dgbtrs( 'no-transpose', N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dgbtf2 '+fam+'-major layout invariance' } );
	});
}
