/**
* Property-based validation for zher2k, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian result C
* (one triangle referenced, real diagonal); `r2k` -> Hermitian rank-2k update
*
*   trans = 'no-transpose'          (A,B are N x K):
*       C = alpha*A*B^H + conj(alpha)*B*A^H + beta*C
*   trans = 'conjugate-transpose'   (A,B are K x N):
*       C = alpha*A^H*B + conj(alpha)*B^H*A + beta*C
*
* alpha is a complex scalar, beta is REAL. Only the `uplo` triangle of C is
* referenced/updated; the other triangle stays poisoned. The updated diagonal is
* real. Validated as a residual against an independent naive-matmul oracle over
* uplo x trans x sizes x scalars, then fuzzed for bit-exact layout invariance
* (L3).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zher2k from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// Accepted trans flag strings -> kind ('n' no-transpose | 'h' conj-transpose);
// the transposed operand uses the conjugate transpose 'c':
const FLAGS = [
	[ 'no-transpose', 'n' ],
	[ 'conjugate-transpose', 'h' ]
];

// (N,K) pairs: square, rectangular (both orientations spanning A shape), and the
// K = 0 edge. N values sampled from SIZES_SMALL to cross unroll/block thresholds.
const PAIRS = [
	[ 1, 0 ],
	[ 1, 1 ],
	[ 2, 3 ],
	[ 3, 2 ],
	[ 3, 0 ],
	[ 5, 4 ],
	[ 5, 0 ],
	[ 8, 3 ],
	[ 16, 5 ],
	[ 17, 4 ],
	[ 33, 2 ],
	[ 64, 3 ]
];

// alpha/beta specs ('g' random | '0' zero | '1' one): exercise the alpha=0,
// beta=0, and beta=1 special-cased code paths.
const COMBOS = [
	[ 'g', 'g' ],
	[ 'g', '0' ],
	[ 'g', '1' ],
	[ '0', 'g' ]
];

// Resolve a complex alpha spec to a value in the scalar trait's representation.
function alphaSpec( spec, rng ) {
	if ( spec === '0' ) {
		return sc.zero;
	}
	if ( spec === '1' ) {
		return sc.one;
	}
	return sc.random( rng );
}

// Resolve a REAL beta spec to a plain JS number.
function betaSpec( spec, rng ) {
	if ( spec === '0' ) {
		return 0.0;
	}
	if ( spec === '1' ) {
		return 1.0;
	}
	return rng.normal();
}

// Read the referenced `uplo` triangle of the N x N result back out of poisoned
// storage; the non-referenced triangle is set to zero (so it cancels in the
// residual and never touches poisoned slots).
function readTri( R, n, uplo ) {
	const C = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				C.set( i, j, R.read( i, j ) );
			} else {
				C.set( i, j, sc.zero );
			}
		}
	}
	return C;
}

// Compute P1, P2 for the given trans kind. no-transpose: P1 = A*B^H,
// P2 = B*A^H; conj-transpose: P1 = A^H*B, P2 = B^H*A.
function products( knd, A, B ) {
	if ( knd === 'n' ) {
		return [
			ref.matmul( sc, A, B, { 'transa': 'n', 'transb': 'c' } ),
			ref.matmul( sc, B, A, { 'transa': 'n', 'transb': 'c' } )
		];
	}
	return [
		ref.matmul( sc, A, B, { 'transa': 'c', 'transb': 'n' } ),
		ref.matmul( sc, B, A, { 'transa': 'c', 'transb': 'n' } )
	];
}

// expected referenced entry: alpha*P1 + conj(alpha)*P2 + beta*C0 (Hermitian
// variant; beta real). On the diagonal the routine forces the result exactly
// real; the oracle's tiny imaginary roundoff there stays within tolerance.
function expectedTri( n, uplo, P, C0, alpha, beta ) {
	const E = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				E.set( i, j, sc.add( sc.add( sc.mul( alpha, P[ 0 ].get( i, j ) ), sc.mul( sc.conj( alpha ), P[ 1 ].get( i, j ) ) ), sc.scale( C0.get( i, j ), beta ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}


// Steps 2/3/5: residual property over uplo x trans x sizes x scalars.
test( 'zher2k: C = alpha*A*B^H + conj(alpha)*B*A^H + beta*C (uplo x trans x sizes x scalars)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		FLAGS.forEach( function eachFlag( flag ) {
			const fstr = flag[ 0 ];
			const knd = flag[ 1 ];
			PAIRS.forEach( function eachPair( pr ) {
				const n = pr[ 0 ];
				const k = pr[ 1 ];
				const rng = new RNG( 0x100 + ( n * 10 ) + k );
				const shp = ( knd === 'n' ) ? [ n, k ] : [ k, n ];
				const A = logical.general( sc, rng, shp[ 0 ], shp[ 1 ] );
				const B = logical.general( sc, rng, shp[ 0 ], shp[ 1 ] );
				const C0 = logical.hermitian( sc, rng, n );
				const P = products( knd, A, B );

				COMBOS.forEach( function eachCombo( combo ) {
					const alpha = alphaSpec( combo[ 0 ], rng );
					const beta = betaSpec( combo[ 1 ], rng );

					const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
					const RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
					const RC = schemes.dense.realize( sc, C0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );

					zher2k( uplo, fstr, n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], beta, RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

					const got = readTri( RC, n, uplo );
					const expected = expectedTri( n, uplo, P, C0, alpha, beta );
					const label = 'zher2k ' + uplo + ' ' + knd + ' n=' + n + ' k=' + k + ' ' + combo.join( '' );
					checked( 'zher2k', 'residual', function run() {
						check.assertReconstruct( sc, got, expected, { 'label': label } );
					});
				});
			});
		});
	});
});


// Step 4: layout-invariance fuzz — output must be BIT-EXACT across every dense
// layout (col/row-major, padding, negative strides), varying A, B, and C.
test( 'zher2k: bit-exact across storage layouts', function t() {
	const n = 6;
	const k = 4;
	const SEED = 0xF00D;
	const layouts = schemes.dense.layouts();
	[ [ 'upper', 'no-transpose' ], [ 'lower', 'no-transpose' ], [ 'upper', 'conjugate-transpose' ], [ 'lower', 'conjugate-transpose' ] ].forEach( function eachCase( cs ) {
		const uplo = cs[ 0 ];
		const fstr = cs[ 1 ];
		const knd = ( fstr === 'no-transpose' ) ? 'n' : 'h';
		checked( 'zher2k', 'layout-invariance', function run() {
			layoutInvariant( layouts, function build( layout, idx ) {
				const rng = new RNG( SEED ); // identical operand values every variant
				const shp = ( knd === 'n' ) ? [ n, k ] : [ k, n ];
				const A = logical.general( sc, rng, shp[ 0 ], shp[ 1 ] );
				const B = logical.general( sc, rng, shp[ 0 ], shp[ 1 ] );
				const C0 = logical.hermitian( sc, rng, n );
				const alpha = sc.random( rng );
				const beta = rng.normal();

				const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, layout );
				const RB = schemes.dense.realize( sc, B, { 'part': 'full' }, layouts[ ( idx + 1 ) % layouts.length ] );
				const RC = schemes.dense.realize( sc, C0, { 'part': uplo }, layouts[ ( idx + 2 ) % layouts.length ] );

				zher2k( uplo, fstr, n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], beta, RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

				return check.flattenLogical( sc, readTri( RC, n, uplo ) );
			}, { 'label': 'zher2k ' + uplo + ' ' + knd + ' layout invariance' } );
		});
	});
});
