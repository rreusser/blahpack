/**
* Property-based validation for zhemm, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense operand A
* (schemes.dense, logical.hermitian, real diagonal); `mm` (matrix-matrix) -> residual property
* `C = alpha*A*B + beta*C` (side='left') or `C = alpha*B*A + beta*C`
* (side='right'), validated against an independent matmul oracle.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhemm from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// (M,N) shapes: squares, rectangles (both orientations), unrolled remainders,
// and 0-dim edge cases.
const CASES = [
	[ 0, 3 ], [ 3, 0 ], [ 0, 0 ], [ 1, 1 ], [ 2, 3 ], [ 3, 2 ], [ 5, 5 ],
	[ 8, 4 ], [ 4, 8 ], [ 16, 17 ], [ 17, 16 ], [ 33, 5 ], [ 7, 33 ], [ 64, 2 ]
];

// Read an M x N general result back out of physical storage into a logical
// matrix (NaN in any referenced slot trips assertFinite).
function readGeneral( R, m, n ) {
	const G = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			G.set( i, j, R.read( i, j ) );
		}
	}
	return G;
}

// expected(i,j) = alpha*P(i,j) + beta*C0(i,j)
function combine( P, C0, alpha, beta, m, n ) {
	const E = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			E.set( i, j, sc.add( sc.mul( alpha, P.get( i, j ) ), sc.mul( beta, C0.get( i, j ) ) ) );
		}
	}
	return E;
}

function pickAlpha( idx, rng ) {
	return ( idx % 3 === 0 ) ? sc.one : sc.random( rng );
}

function pickBeta( idx, rng ) {
	if ( idx % 3 === 0 ) {
		return sc.zero;
	}
	if ( idx % 3 === 1 ) {
		return sc.one;
	}
	return sc.random( rng );
}

// Steps 2-3-5: residual property over side x uplo x shape sweep.
test( 'zhemm: C = alpha*A*B + beta*C residual (side x uplo x shape sweep)', function t() {
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			CASES.forEach( function eachCase( shape, idx ) {
				const M = shape[ 0 ];
				const N = shape[ 1 ];
				const k = ( side === 'left' ) ? M : N; // order of symmetric A
				const rng = new RNG( 0x100 + ( M * 10 ) + N ); // reproducible; log on failure
				const A = logical.hermitian( sc, rng, k );
				const B = logical.general( sc, rng, M, N );
				const C0 = logical.general( sc, rng, M, N );
				const alpha = pickAlpha( idx, rng );
				const beta = pickBeta( idx, rng );

				const lay = schemes.dense.layouts()[ 0 ];
				const Ar = schemes.dense.realize( sc, A, { 'part': uplo }, lay );
				const Br = schemes.dense.realize( sc, B, {}, lay );
				const Cr = schemes.dense.realize( sc, C0, {}, lay );

				zhemm(
					side, uplo, M, N, sc.apiScalar( alpha ),
					Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
					Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ],
					sc.apiScalar( beta ),
					Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ]
				);

				const P = ( side === 'left' )
					? ref.matmul( sc, A, B )
					: ref.matmul( sc, B, A );
				const expected = combine( P, C0, alpha, beta, M, N );
				const gotC = readGeneral( Cr, M, N );
				checked( 'zhemm', 'residual', function run() {
					check.assertReconstruct( sc, gotC, expected, { 'label': 'zhemm '+side+' '+uplo+' '+M+'x'+N } );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — output must be bit-exact across storage layouts.
test( 'zhemm: bit-exact across storage layouts', function t() {
	const M = 6;
	const N = 5;
	const SEED = 0xF00D;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			const k = ( side === 'left' ) ? M : N;
			checked( 'zhemm', 'layout-invariance', function run() {
				layoutInvariant( schemes.dense.layouts(), function build( layout ) {
					const rng = new RNG( SEED ); // identical values every variant
					const A = logical.hermitian( sc, rng, k );
					const B = logical.general( sc, rng, M, N );
					const C0 = logical.general( sc, rng, M, N );
					const alpha = sc.random( rng );
					const beta = sc.random( rng );
					const Ar = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
					const Br = schemes.dense.realize( sc, B, {}, layout );
					const Cr = schemes.dense.realize( sc, C0, {}, layout );
					zhemm(
						side, uplo, M, N, sc.apiScalar( alpha ),
						Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
						Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ],
						sc.apiScalar( beta ),
						Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ]
					);
					return check.flattenLogical( sc, readGeneral( Cr, M, N ) );
				}, { 'label': 'zhemm '+side+' '+uplo+' layout invariance' } );
			});
		});
	});
});
