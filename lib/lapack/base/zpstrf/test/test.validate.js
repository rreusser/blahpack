/**
* Property-based validation for zpstrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `p` -> HPD dense
* (schemes.dense, logical.positiveDefinite -> Hermitian, real diagonal);
* `strf` (Cholesky with complete diagonal PIVOTING, BLOCKED) -> reconstruction
* with a permutation.
*
* Same math as zpstf2:  Pᵀ·A·P = Uᴴ·U (upper) / L·Lᴴ (lower), with the reference
* PIV convention (P(PIV(k),k)=1) giving (Pᵀ·A·P)[i,j] = A[PIV[i],PIV[j]] =
* (FᴴF)[i,j]. zpstrf blocks NB=64 and delegates to zpstf2 for N<=NB, so the size
* sweep is extended past 64 (65, 100) to exercise the blocked path (zgemv/zherk
* trailing update + inter-block pivoting). Inputs are diagonally-dominant HPD =>
* full rank. WORK is a REAL (Float64) array of length 2*N. PIV 0-based; default
* (negative-tol) stop.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zpstrf from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const real = S.real; // WORK is a real Float64 array
const LogicalMatrix = logical.LogicalMatrix;
const NB = 64; // block size hardcoded in base.js; blocked path taken when N > NB

const SIZES = SIZES_SMALL.concat( [ 65, 100 ] );

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

function permuteByPiv( A0, piv, n ) {
	const PA = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			PA.set( i, j, A0.get( piv[ i ], piv[ j ] ) );
		}
	}
	return PA;
}

test( 'zpstrf: pivoted Cholesky reconstruction Pᵀ·A·P = FᴴF (size sweep incl. blocked x uplo)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( n ) {
			const rng = new RNG( 0x400 + n );
			const A0 = logical.positiveDefinite( sc, rng, n );
			const R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			const piv = new Int32Array( n );
			const rank = new Int32Array( 1 );
			const work = poisonedWork( real, 2 * n );
			const info = zpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );

			if ( info !== 0 || rank[ 0 ] !== n ) {
				throw new Error( 'zpstrf '+uplo+' n='+n+': expected full rank (info=0, rank='+n+'), got info='+info+' rank='+rank[ 0 ] );
			}
			const F = readTri( R, n, uplo );
			const recon = ( uplo === 'upper' )
				? ref.matmul( sc, F, F, { 'transa': 'c' } )
				: ref.matmul( sc, F, F, { 'transb': 'c' } );
			const PA0 = permuteByPiv( A0, piv, n );
			checked( 'zpstrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, PA0, { 'factor': 100, 'label': 'zpstrf '+uplo+' n='+n } );
			});
		});
	});
});

// Step 4: layout-invariance on the BLOCKED path (N=100 > NB). Pure-addressing
// family only (data-dependent pivot search). Flat vector carries factor + PIV.
test( 'zpstrf: bit-exact factor + PIV across pure-addressing layouts (blocked)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const n = 100;
		const SEED = 0xF11E;
		checked( 'zpstrf', 'layout-invariance', function run() {
			layoutInvariant( schemes.dense.pureAddrLayouts(), function build( layout ) {
				const rng = new RNG( SEED );
				const A0 = logical.positiveDefinite( sc, rng, n );
				const R = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				const piv = new Int32Array( n );
				const rank = new Int32Array( 1 );
				const work = poisonedWork( real, 2 * n );
				zpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
				const flat = check.flattenLogical( sc, readTri( R, n, uplo ) );
				return flat.concat( Array.prototype.slice.call( piv ) );
			}, { 'label': 'zpstrf '+uplo+' layout invariance' } );
		});
	});
});

// Step 4c: WORKSPACE CONFORMANCE (plain assertion) on the BLOCKED path. WORK is
// real, length 2*N.
test( 'zpstrf: advertised WORK minimum (2N) suffices on the blocked path (Step 4c)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const n = 100;
		const SEED = 0xB235 + n;
		const label = 'zpstrf WORK-min '+uplo+' n='+n;

		function run( len ) {
			const rng = new RNG( SEED );
			const A0 = logical.positiveDefinite( sc, rng, n );
			const R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
			const piv = new Int32Array( n );
			const rank = new Int32Array( 1 );
			const work = poisonedWork( real, len );
			zpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );
		if ( minLen !== 2 * n ) {
			throw new Error( label+': advertised WORK minimum '+minLen+' != 2N='+( 2 * n ) );
		}
		if ( n <= NB ) {
			throw new Error( label+': case is not on the blocked path (N<=NB); pick larger N' );
		}

		const rng = new RNG( SEED );
		const A0 = logical.positiveDefinite( sc, rng, n );
		const R = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		const piv = new Int32Array( n );
		const rank = new Int32Array( 1 );
		const work = poisonedWork( real, minLen );
		zpstrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], piv, 1, 0, rank, -1.0, work );
		const F = readTri( R, n, uplo );
		const recon = ( uplo === 'upper' )
			? ref.matmul( sc, F, F, { 'transa': 'c' } )
			: ref.matmul( sc, F, F, { 'transb': 'c' } );
		check.assertReconstruct( sc, recon, permuteByPiv( A0, piv, n ), { 'factor': 100, 'label': label } );
	});
});
