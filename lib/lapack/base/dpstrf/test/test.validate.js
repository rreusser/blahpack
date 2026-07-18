/**
* Property-based validation for dpstrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `p` -> SPD dense
* (schemes.dense, logical.positiveDefinite); `strf` (Cholesky with complete
* diagonal PIVOTING, BLOCKED) -> reconstruction with a permutation.
*
* Same math as the unblocked dpstf2:  Pᵀ·A·P = Uᴴ·U (upper) / L·Lᴴ (lower), with
* the reference PIV convention (P(PIV(k),k)=1) giving
*
*     (Pᵀ·A·P)[i,j] = A[ PIV[i], PIV[j] ] = (FᴴF)[i,j].
*
* dpstrf blocks NB=64 columns and delegates to dpstf2 for N<=NB, so the size
* sweep is extended past 64 (65, 100) to genuinely exercise the blocked path
* (the dgemv/dsyrk trailing update + inter-block pivoting). Inputs are
* diagonally-dominant SPD => full rank (rank === N, info === 0). WORK length 2*N.
* PIV is 0-based; default (negative-tol) stop.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dpstrf from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var NB = 64; // block size hardcoded in base.js; blocked path taken when N > NB

// Extend the sweep past NB so the blocked trailing-update path is exercised.
var SIZES = SIZES_SMALL.concat( [ 65, 100 ] );

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

test( 'dpstrf: pivoted Cholesky reconstruction Pᵀ·A·P = FᴴF (size sweep incl. blocked x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( n ) {
			var rng = new RNG( 0x300 + n );
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			var piv = new Int32Array( n );
			var rank = new Int32Array( 1 );
			var work = poisonedWork( sc, 2 * n );
			var info = dpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );

			if ( info !== 0 || rank[ 0 ] !== n ) {
				throw new Error( 'dpstrf '+uplo+' n='+n+': expected full rank (info=0, rank='+n+'), got info='+info+' rank='+rank[ 0 ] );
			}
			var F = readTri( R, n, uplo );
			var recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			var PA0 = permuteByPiv( A0, piv, n );
			checked( 'dpstrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, PA0, { 'factor': 100, 'label': 'dpstrf '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance on the BLOCKED path (N=100 > NB). Pure-addressing
// family only — the pivot search is data-dependent (see dpstf2 note). Flat
// vector carries factor + PIV.
test( 'dpstrf: bit-exact factor + PIV across pure-addressing layouts (blocked)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 100;
		var SEED = 0xF00D;
		checked( 'dpstrf', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.pureAddrLayouts(), function build( layout ) {
				var rng = new RNG( SEED );
				var A0 = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				var piv = new Int32Array( n );
				var rank = new Int32Array( 1 );
				var work = poisonedWork( sc, 2 * n );
				dpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
				var flat = check.flattenLogical( sc, readTri( R, n, uplo ) );
				return flat.concat( Array.prototype.slice.call( piv ) );
			}, { 'label': 'dpstrf '+uplo+' layout invariance' } );
		});
	});
});

// Step 4c: WORKSPACE CONFORMANCE (plain assertion) on the BLOCKED path. The
// reference WORK is length 2*N; probe the wrapper's advertised minimum, then run
// at exactly that length with a POISONED WORK on the blocked path (N > NB) and
// require finite output AND correct reconstruction.
test( 'dpstrf: advertised WORK minimum (2N) suffices on the blocked path (Step 4c)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 100;
		var SEED = 0xB135 + n;
		var label = 'dpstrf WORK-min '+uplo+' n='+n;

		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
			var piv = new Int32Array( n );
			var rank = new Int32Array( 1 );
			var work = poisonedWork( sc, len );
			dpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );
		if ( minLen !== 2 * n ) {
			throw new Error( label+': advertised WORK minimum '+minLen+' != 2N='+( 2 * n ) );
		}
		if ( n <= NB ) {
			throw new Error( label+': case is not on the blocked path (N<=NB); pick larger N' );
		}

		var rng = new RNG( SEED );
		var A0 = logical.positiveDefinite( sc, rng, n );
		var R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		var piv = new Int32Array( n );
		var rank = new Int32Array( 1 );
		var work = poisonedWork( sc, minLen );
		dpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
		var F = readTri( R, n, uplo );
		var recon = ( uplo === 'upper' )
			? ref.matmul( sc, F, F, { 'transa': 'c' } )
			: ref.matmul( sc, F, F, { 'transb': 'c' } );
		check.assertReconstruct( sc, recon, permuteByPiv( A0, piv, n ), { 'factor': 100, 'label': label } );
	});
});
