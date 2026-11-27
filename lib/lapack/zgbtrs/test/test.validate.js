/**
* Property-based validation for zgbtrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `trs` (solve given an LU band
* factor) -> RESIDUAL: the solve consumes an LU factorization (produced here by the
* already-validated zgbtrf), then we check `op(A0)*X = B0` against the ORIGINAL band
* matrix A0. The residual property is independent of zgbtrf's correctness — a wrong
* factorization would still have to yield an X that reproduces B0 through op(A0).
*
* The factored band array carries KL EXTRA fill rows on top (ldab = 2*kl+ku+1) for
* the fill-in partial pivoting generates; the factor's U therefore has kl+ku
* superdiagonals. Input to zgbtrf is realized with `schemes.banded {kl,ku,luFill}`,
* whose top KL rows stay NaN-poisoned on entry (LAPACK: "need not be set").
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgbtrs from './../lib/ndarray.js';
import zgbtrf from '../../zgbtrf/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const NS = [ 2, 3, 5, 8, 16, 17, 33 ];
const NRHS = [ 1, 2, 3 ];

// Map an API transpose flag to a reference transpose code.
function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

// (kl,ku) pairs clamped to [0,N-1], deduped: diagonal-only, tridiagonal, an
// asymmetric band, and a full-lower / no-upper band.
function bands( N ) {
	const hi = Math.max( 0, N - 1 );
	const raw = [ [ 0, 0 ], [ 1, 1 ], [ 2, 3 ], [ hi, 0 ] ];
	const seen = {};
	const out = [];
	raw.forEach( function each( p ) {
		const kl = Math.min( p[ 0 ], hi );
		const ku = Math.min( p[ 1 ], hi );
		const key = kl + ':' + ku;
		if ( !seen[ key ] ) {
			seen[ key ] = true;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

// Column j of physical B storage as an array of scalar values.
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

// Read the full N x nrhs solution back into a LogicalMatrix (bit-exact compare).
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

// Positive-first-dimension-stride banded layouts only: zgbtrf's inner idamax
// pivot search walks the band-array first dimension and is out of contract for a
// negative first-dim stride (see LEARNINGS.md getrf/getf2 family). zgbtrs itself
// carries no pivot search, but we keep AB on the same positive-sgn1 layouts so the
// frozen factor is realized exactly as zgbtrf would accept it.
const BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});

// Realize a copy of the band matrix A0 in LU-fill storage and factor it in place
// with zgbtrf, returning the physical realization R and its 0-based IPIV.
function factor( A0, N, kl, ku, layout ) {
	const R = schemes.banded.realize( sc, A0.copy(), { 'kl': kl, 'ku': ku, 'luFill': true }, layout );
	const ipiv = new Int32Array( N );
	zgbtrf( N, N, kl, ku, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0 );
	return { 'R': R, 'ipiv': ipiv };
}

// Capture the frozen LU factor out of a factored band realization R into an N x N
// LogicalMatrix over the FULL LU band (U has kl+ku superdiagonals; L has kl
// subdiagonals). The band-row map is identical to the {kl,ku,luFill} realize
// (bandrow = kl+ku+i-j), so R.read(i,j) reads the correct physical cell.
function captureFactor( R, N, kl, ku ) {
	const kuLU = kl + ku;
	const F = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - kuLU ); i <= Math.min( N - 1, j + kl ); i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Re-realize a captured factor F into a fresh band array at `layout`; geometry
// {kl, ku:kl+ku} reproduces ldab = 2*kl+ku+1 and bandrow = kl+ku+i-j exactly as
// zgbtrs expects (called below with the ORIGINAL kl, ku).
function realizeFactor( F, kl, ku, layout ) {
	return schemes.banded.realize( sc, F, { 'kl': kl, 'ku': kl + ku }, layout );
}


// Steps 2-3-5: residual property across trans x (kl,ku) x N x nrhs. Factor once
// per (N,kl,ku) at a tight positive-sgn1 layout (zgbtrs reads AB read-only, so the
// same factor serves every trans/nrhs), solve with zgbtrs, then verify
// op(A0)*X = B0 per RHS column against the ORIGINAL band matrix.
test( 'zgbtrs: banded LU solve residual (trans x (kl,ku) x N x nrhs)', function t() {
	NS.forEach( function eachN( N ) {
		bands( N ).forEach( function eachBand( b ) {
			runResidual( N, b[ 0 ], b[ 1 ] );
		});
	});
});

function runResidual( N, kl, ku ) {
	const rng = new RNG( 0x2000 + ( N * 100 ) + ( kl * 10 ) + ku ); // reproducible
	const A0 = logical.banded( sc, rng, N, N, kl, ku );

	const aLayout = BANDED_POS[ 0 ]; // tight col-major
	const f = factor( A0, N, kl, ku, aLayout );

	TRANS.forEach( function eachTrans( trans ) {
		const code = transCode( trans );
		NRHS.forEach( function eachNrhs( nrhs ) {
			const B0 = logical.general( sc, rng, N, nrhs );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

			zgbtrs( trans, N, kl, ku, nrhs, f.R.data, f.R.args[ 0 ], f.R.args[ 1 ], f.R.args[ 2 ], f.ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

			checked( 'zgbtrs', 'residual', function run() {
				let j;
				for ( j = 0; j < nrhs; j++ ) {
					check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
						'trans': code,
						'factor': 100,
						'label': 'zgbtrs '+trans+' N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs+' col='+j
					});
				}
			});
		});
	});
}

// Step 4: layout-invariance fuzz. zgbtrs consumes an already-computed factor, so
// this PRE-FACTORS once at a tight layout, freezes the factor + pivots, then
// re-realizes the FIXED factor values at every positive-sgn1 banded layout and runs
// ONLY zgbtrs (isolating its addressing from the pivoting factor, which is out of
// contract for a negative band-array first-dim stride; see LEARNINGS.md). zgbtrs's
// L-application (dgemv/dger) and its triangular band solve (dtbsv) both reorder the
// summation on a col<->row FLIP of EITHER operand (the optimized dgemv dot/axpy form
// switch), so bit-exactness holds only WITHIN a single storage-order family for BOTH
// AB and B; cross-order correctness is certified by the residual property above. The
// family split keeps offset, leading-dim padding, gaps, and negative COLUMN/ROW
// strides within each order — the real addressing-bug detectors.
function byOrder( layouts, order ) {
	return layouts.filter( function pick( L ) {
		return ( order === 'row' ) === ( L.order === 'row' );
	});
}
const AB_COL = byOrder( BANDED_POS, 'col' );
const AB_ROW = byOrder( BANDED_POS, 'row' );
const B_COL = byOrder( schemes.dense.layouts(), 'col' );
const B_ROW = byOrder( schemes.dense.layouts(), 'row' );

test( 'zgbtrs: bit-exact within a single storage-order family for AB and B (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, AB_COL, B_COL, 'col' );
		runInvariance( trans, AB_ROW, B_ROW, 'row' );
	});
});

function runInvariance( trans, abFamily, bFamily, fam ) {
	const N = 11;
	const kl = 2;
	const ku = 3;
	const nrhs = 3;
	const SEED = 0xBEEF;

	const rng = new RNG( SEED );
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE at the tight col-major layout; freeze factor + pivots:
	const f = factor( A0, N, kl, ku, BANDED_POS[ 0 ] );
	const Fac = captureFactor( f.R, N, kl, ku );
	const ipiv = f.ipiv;

	// Pair AB- and B-layouts (each cycled within its own same-order family) so both
	// operands stay in one storage order while offset/pad/gap/stride-sign vary.
	const n = Math.max( abFamily.length, bFamily.length );
	const variants = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		variants.push({
			'a': abFamily[ i % abFamily.length ],
			'b': bFamily[ i % bFamily.length ]
		});
	}

	checked( 'zgbtrs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( v ) {
			const Ar = realizeFactor( Fac, kl, ku, v.a );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, v.b );
			zgbtrs( trans, N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zgbtrs '+trans+' '+fam+'-major (AB) layout invariance' } );
	});
}
