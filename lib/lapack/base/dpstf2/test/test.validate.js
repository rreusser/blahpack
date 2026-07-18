/**
* Property-based validation for dpstf2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `p` -> SPD/HPD dense
* (schemes.dense, logical.positiveDefinite); `stf2` (Cholesky with complete
* diagonal PIVOTING, unblocked) -> reconstruction with a permutation.
*
* The factorization computes  Pᵀ·A·P = Uᴴ·U (upper) or L·Lᴴ (lower), where P is
* the permutation encoded by the pivot vector PIV. The reference LAPACK
* convention (P(PIV(k),k)=1, applied as a running sequence of symmetric swaps)
* means the permuted input equals the reconstruction elementwise:
*
*     (Pᵀ·A·P)[i,j] = A[ PIV[i], PIV[j] ] = (FᴴF)[i,j]
*
* so we permute A0 by PIV and compare to FᴴF — no permutation matrix / inverse
* needed. For the diagonally-dominant SPD inputs here the factorization is full
* rank (rank === N, info === 0), and the reconstruction is exact up to rounding.
*
* PIV is 0-based; the default (negative-tol) stopping value is used so these
* well-conditioned inputs always run to full rank.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dpstf2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

// Read the Cholesky factor triangle back into a full LogicalMatrix (opposite
// triangle zeroed) for reconstruction.
function readTri( R, n, uplo ) {
	var F = new LogicalMatrix( sc, n, n );
	var i;
	var j;
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

// Symmetrically permute A0 by PIV: PA0[i,j] = A0[ PIV[i], PIV[j] ] = (Pᵀ·A0·P).
function permuteByPiv( A0, piv, n ) {
	var PA = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			PA.set( i, j, A0.get( piv[ i ], piv[ j ] ) );
		}
	}
	return PA;
}

// Steps 2-3-5: reconstruction across the size sweep and both uplo flags.
test( 'dpstf2: pivoted Cholesky reconstruction Pᵀ·A·P = FᴴF (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			var rng = new RNG( 0x100 + n ); // reproducible; log on failure
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			var piv = new Int32Array( n );
			var rank = new Int32Array( 1 );
			var work = poisonedWork( sc, 2 * n );
			var info = dpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );

			if ( info !== 0 || rank[ 0 ] !== n ) {
				throw new Error( 'dpstf2 '+uplo+' n='+n+': expected full rank (info=0, rank='+n+'), got info='+info+' rank='+rank[ 0 ] );
			}
			var F = readTri( R, n, uplo );
			var recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			var PA0 = permuteByPiv( A0, piv, n );
			checked( 'dpstf2', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, PA0, { 'factor': 100, 'label': 'dpstf2 '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz. The pivot search selects the max updated
// diagonal (WORK), a DATA-DEPENDENT choice that can flip on last-ULP layout
// changes (as with Bunch-Kaufman, see the zhetrf LEARNINGS). So bit-exactness is
// asserted only over a PURE-ADDRESSING family (tight col-major, unit strides,
// varying only offset + leading-dim pad) — which reorders no arithmetic — and
// cross-order / sign / gap correctness is certified by the reconstruction sweep
// above. The returned flat vector carries both the factor triangle AND PIV, so a
// layout-flipped pivot decision would trip the bit-exact check.
test( 'dpstf2: bit-exact factor + PIV across pure-addressing layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 13;
		var SEED = 0xF00D;
		checked( 'dpstf2', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.pureAddrLayouts(), function build( layout ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A0 = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				var piv = new Int32Array( n );
				var rank = new Int32Array( 1 );
				var work = poisonedWork( sc, 2 * n );
				dpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
				var flat = check.flattenLogical( sc, readTri( R, n, uplo ) );
				return flat.concat( Array.prototype.slice.call( piv ) );
			}, { 'label': 'dpstf2 '+uplo+' layout invariance' } );
		});
	});
});

// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The reference
// WORK is length 2*N; probe the wrapper's advertised minimum via its throw
// boundary, then run at exactly that length with a POISONED WORK and require
// finite output (no NaN leak from an over-read) AND correct reconstruction.
test( 'dpstf2: advertised WORK minimum (2N) suffices (Step 4c)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 17;
		var SEED = 0xB105 + n;
		var label = 'dpstf2 WORK-min '+uplo+' n='+n;

		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
			var piv = new Int32Array( n );
			var rank = new Int32Array( 1 );
			var work = poisonedWork( sc, len );
			dpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );
		if ( minLen !== 2 * n ) {
			throw new Error( label+': advertised WORK minimum '+minLen+' != 2N='+( 2 * n ) );
		}

		// And reconstruction must hold at exactly that minimum.
		var rng = new RNG( SEED );
		var A0 = logical.positiveDefinite( sc, rng, n );
		var R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		var piv = new Int32Array( n );
		var rank = new Int32Array( 1 );
		var work = poisonedWork( sc, minLen );
		dpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
		var F = readTri( R, n, uplo );
		var recon = ( uplo === 'upper' )
			? ref.matmul( sc, F, F, { 'transa': 'c' } )
			: ref.matmul( sc, F, F, { 'transb': 'c' } );
		check.assertReconstruct( sc, recon, permuteByPiv( A0, piv, n ), { 'factor': 100, 'label': label } );
	});
});
