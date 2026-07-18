/**
* Property-based validation for zpstf2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `p` -> HPD dense
* (schemes.dense, logical.positiveDefinite -> Hermitian, real diagonal);
* `stf2` (Cholesky with complete diagonal PIVOTING, unblocked) -> reconstruction
* with a permutation.
*
* The factorization computes  Pᵀ·A·P = Uᴴ·U (upper) or L·Lᴴ (lower). With the
* reference PIV convention (P(PIV(k),k)=1) the permuted input equals the
* reconstruction elementwise:
*
*     (Pᵀ·A·P)[i,j] = A[ PIV[i], PIV[j] ] = (FᴴF)[i,j]
*
* so we permute A0 by PIV and compare to FᴴF. Inputs are diagonally-dominant HPD
* => full rank (rank === N, info === 0). WORK is a REAL (Float64) array of length
* 2*N even for the complex routine. PIV is 0-based; default (negative-tol) stop.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zpstf2 from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var real = S.real; // WORK is a real Float64 array
var LogicalMatrix = logical.LogicalMatrix;

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

test( 'zpstf2: pivoted Cholesky reconstruction Pᵀ·A·P = FᴴF (size sweep x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( n ) {
			var rng = new RNG( 0x200 + n );
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			var piv = new Int32Array( n );
			var rank = new Int32Array( 1 );
			var work = poisonedWork( real, 2 * n );
			var info = zpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );

			if ( info !== 0 || rank[ 0 ] !== n ) {
				throw new Error( 'zpstf2 '+uplo+' n='+n+': expected full rank (info=0, rank='+n+'), got info='+info+' rank='+rank[ 0 ] );
			}
			var F = readTri( R, n, uplo );
			var recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			var PA0 = permuteByPiv( A0, piv, n );
			checked( 'zpstf2', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, PA0, { 'factor': 100, 'label': 'zpstf2 '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance — pure-addressing family only (data-dependent pivot
// search; see the dpstf2 note). Flat vector carries factor + PIV.
test( 'zpstf2: bit-exact factor + PIV across pure-addressing layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 13;
		var SEED = 0xF11E;
		checked( 'zpstf2', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.pureAddrLayouts(), function build( layout ) {
				var rng = new RNG( SEED );
				var A0 = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				var piv = new Int32Array( n );
				var rank = new Int32Array( 1 );
				var work = poisonedWork( real, 2 * n );
				zpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
				var flat = check.flattenLogical( sc, readTri( R, n, uplo ) );
				return flat.concat( Array.prototype.slice.call( piv ) );
			}, { 'label': 'zpstf2 '+uplo+' layout invariance' } );
		});
	});
});

// Step 4c: WORKSPACE CONFORMANCE (plain assertion). WORK length 2*N (real).
test( 'zpstf2: advertised WORK minimum (2N) suffices (Step 4c)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 17;
		var SEED = 0xB205 + n;
		var label = 'zpstf2 WORK-min '+uplo+' n='+n;

		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.positiveDefinite( sc, rng, n );
			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
			var piv = new Int32Array( n );
			var rank = new Int32Array( 1 );
			var work = poisonedWork( real, len );
			zpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );
		if ( minLen !== 2 * n ) {
			throw new Error( label+': advertised WORK minimum '+minLen+' != 2N='+( 2 * n ) );
		}

		var rng = new RNG( SEED );
		var A0 = logical.positiveDefinite( sc, rng, n );
		var R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		var piv = new Int32Array( n );
		var rank = new Int32Array( 1 );
		var work = poisonedWork( real, minLen );
		zpstf2( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
		var F = readTri( R, n, uplo );
		var recon = ( uplo === 'upper' )
			? ref.matmul( sc, F, F, { 'transa': 'c' } )
			: ref.matmul( sc, F, F, { 'transb': 'c' } );
		check.assertReconstruct( sc, recon, permuteByPiv( A0, piv, n ), { 'factor': 100, 'label': label } );
	});
});
