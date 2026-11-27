/**
* Property-based validation for zherk, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> HERMITIAN dense C
* (logical.hermitian — conjugate symmetry, REAL diagonal); `rk` -> Hermitian
* rank-k update with the residual property
*   C = alpha*A*A^H + beta*C    (trans = 'no-transpose',         A is N x K)
*   C = alpha*A^H*A + beta*C     (trans = 'conjugate-transpose', A is K x N)
* alpha and beta are REAL doubles (plain numbers), and the C diagonal is real by
* construction. Only 'no-transpose'/'conjugate-transpose' are defined. Checked
* against an independent naive matmul oracle over ONLY the referenced (uplo)
* triangle of C, then fuzzed for bit-exact layout invariance (L3).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zherk from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// Accepted trans flag strings -> reference (conjugate) transpose code.
const FLAGS = [
	[ 'no-transpose', 'n' ],
	[ 'conjugate-transpose', 'c' ]
];

const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
const KS = [ 0, 1, 2, 4, 7, 16 ];

const COMBOS = [ 'gg', 'g0', 'g1', '0g' ];

// alpha/beta are REAL doubles for herk.
function realSpec( spec, rng ) {
	if ( spec === '0' ) {
		return 0.0;
	}
	if ( spec === '1' ) {
		return 1.0;
	}
	return rng.normal();
}

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

// Expected over ONLY the uplo triangle; alpha/beta are real so scaling uses the
// scalar trait's real-scale operation.
function expectedTri( P, C0, alpha, beta, n, uplo ) {
	const E = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				E.set( i, j, sc.add( sc.scale( P.get( i, j ), alpha ), sc.scale( C0.get( i, j ), beta ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}


// Steps 2/3/5: residual property over the full uplo x trans x size x scalar
// sweep.
test( 'zherk: C = alpha*op(A)*op(A)^H + beta*C (uplo x trans x sizes x scalars)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		FLAGS.forEach( function eachFlag( fl ) {
			const code = fl[ 1 ];
			const nota = ( code === 'n' );
			NS.forEach( function eachN( n ) {
				KS.forEach( function eachK( k ) {
					const rng = new RNG( 0x100 + ( n * 10 ) + k );

					const A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
					const C0 = logical.hermitian( sc, rng, n );

					// Oracle: P = A*A^H (no-transpose) or A^H*A (conjugate-transpose).
					const P = nota
						? ref.matmul( sc, A, A, { 'transb': 'c' } )
						: ref.matmul( sc, A, A, { 'transa': 'c' } );

					COMBOS.forEach( function eachCombo( combo ) {
						const alpha = realSpec( combo[ 0 ], rng );
						const beta = realSpec( combo[ 1 ], rng );

						const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
						const RC = schemes.dense.realize( sc, C0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );

						// alpha/beta are plain REAL numbers (NOT apiScalar / Complex128).
						zherk( uplo, fl[ 0 ], n, k, alpha, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], beta, RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

						const got = readTri( RC, n, uplo );
						const expected = expectedTri( P, C0, alpha, beta, n, uplo );
						const label = 'zherk ' + uplo + ' ' + code + ' n=' + n + ' k=' + k + ' ' + combo;
						checked( 'zherk', 'residual', function run() {
							check.assertReconstruct( sc, got, expected, { 'label': label } );
						});
					});
				});
			});
		});
	});
});


// Step 4: layout-invariance fuzz — output must be BIT-EXACT across every dense
// layout (col/row-major, padding, negative strides) for A and C.
test( 'zherk: bit-exact across storage layouts', function t() {
	const n = 6;
	const k = 4;
	const SEED = 0xF00D;
	const layouts = schemes.dense.layouts();
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		FLAGS.forEach( function eachFlag( fl ) {
			const code = fl[ 1 ];
			const nota = ( code === 'n' );
			checked( 'zherk', 'layout-invariance', function run() {
				layoutInvariant( layouts, function build( layout, idx ) {
					const rng = new RNG( SEED );
					const A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
					const C0 = logical.hermitian( sc, rng, n );
					const alpha = rng.normal();
					const beta = rng.normal();

					const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, layout );
					const RC = schemes.dense.realize( sc, C0, { 'part': uplo }, layouts[ ( idx + 1 ) % layouts.length ] );

					zherk( uplo, fl[ 0 ], n, k, alpha, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], beta, RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

					return check.flattenLogical( sc, readTri( RC, n, uplo ) );
				}, { 'label': 'zherk ' + uplo + ' ' + code + ' layout invariance' } );
			});
		});
	});
});
