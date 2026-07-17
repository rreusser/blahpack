/**
* Property-based validation for zsysv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `sy` -> COMPLEX-SYMMETRIC dense
* (schemes.dense, logical.symmetric — NOT Hermitian: zsytrf factors A = A^T with
* NO conjugation, so a plain complex-symmetric matrix is the correct generator);
* `sv` (Bunch-Kaufman indefinite linear-solve DRIVER: factor A = U*D*U^T /
* L*D*L^T with zsytrf, then solve A*X = B with zsytrs2, in ONE call) -> RESIDUAL.
* On exit A holds the factor, B holds X, IPIV the pivots. We check `A0*X = B0`
* against the ORIGINAL complex-symmetric matrix A0 — independent of the factor
* the driver produced, so the residual certifies the factor+solve driver against
* A0. zsysv takes a caller-owned WORK array (length >= N for the zsytrs2 solve);
* Step 4c probes the advertised minimum under NaN poison.
*/

import test from 'node:test';
import Int32Array from '@stdlib/array/int32/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zsysv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var NRHS = [ 1, 2, 3 ];

function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

function readB( R, n, nrhs ) {
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

// Steps 2-3-5: residual property over uplo x N x nrhs x every pivot-valid
// storage layout. The driver factors A in place (zsytrf's pivot search is out
// of contract for a negative first-dimension stride), so A is realized with
// pivotLayouts(); factor and solve share that layout. Sweeping col AND row order
// at backward-error tolerance certifies cross-storage-order addressing.
// Factor+solve in one zsysv call, then verify A0*X = B0 per RHS column against
// the ORIGINAL complex-symmetric matrix. WORK (length N, the min) is
// NaN-poisoned so any read-before-write is caught.
test( 'zsysv: Bunch-Kaufman solve-driver residual (uplo x N x nrhs x layout)', function t() {
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
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );

	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var work = sc.alloc( Math.max( N, 1 ) ); // caller-owned, poisoned scratch

	zsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );

	checked( 'zsysv', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zsysv '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. zsysv is a ONE-SHOT driver: its pivot search
// is data-dependent, and factor+solve are coupled, so the factor's choices
// cannot be isolated from the solve. Bit-exact invariance therefore holds only
// across a PURE-ADDRESSING family — layouts that change ONLY base offset and
// leading-dimension padding (always tight col-major, unit positive strides),
// which cannot reorder any arithmetic in either the factor or the solve.
// Cross-order/sign correctness is certified by the residual property above.
// Both A and B are fuzzed over pureAddrLayouts(); WORK stays a tight length-N
// array.
test( 'zsysv: bit-exact across pure-addressing layouts (one-shot driver)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var nrhs = 3;
	var SEED = 0xBEEF;

	var rng = new RNG( SEED );
	var A0 = logical.symmetric( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var variants = schemes.dense.pureAddrLayouts();

	checked( 'zsysv', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			var ipiv = new Int32Array( N );
			var work = sc.alloc( N );
			zsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zsysv '+uplo+' pure-addressing layout invariance' } );
	});
}

// Step 4c: WORK conformance. zsysv advertises a minimum workspace of N for the
// zsytrs2 solve. At a blocked size (N = 64) with EXACTLY N poisoned elements,
// the solve must never read past the buffer (a NaN would surface as a
// non-finite residual) and still produce the correct X. This pins the
// advertised minimum as both sufficient and honest.
test( 'zsysv: minimum WORK (length N) suffices at blocked N=64', function t() {
	var N = 64;
	var nrhs = 3;
	var rng = new RNG( 0xC0FFEE );
	UPLO.forEach( function eachUplo( uplo ) {
		var A0 = logical.symmetric( sc, rng, N );
		var B0 = logical.general( sc, rng, N, nrhs );
		var layout = schemes.dense.pivotLayouts()[ 0 ];
		var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
		var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
		var ipiv = new Int32Array( N );
		var work = sc.alloc( N ); // exactly the advertised minimum, NaN-poisoned

		zsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );

		checked( 'zsysv', 'residual', function run() {
			var j;
			for ( j = 0; j < nrhs; j++ ) {
				check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
					'trans': 'n',
					'factor': 100,
					'label': 'zsysv min-WORK '+uplo+' N='+N+' col='+j
				});
			}
		});
	});
});
