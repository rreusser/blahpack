/**
* Property-based validation for dsyrk, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense C
* (schemes.dense, logical.symmetric for C0; logical.general for A); `rk` ->
* rank-k update with the residual property
*   C = alpha*A*A^T + beta*C    (trans = 'no-transpose', A is N x K)
*   C = alpha*A^T*A + beta*C     (trans = 'transpose',    A is K x N)
* checked against an independent naive matmul oracle over ONLY the referenced
* (uplo) triangle of C, then fuzzed for bit-exact layout invariance (L3).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsyrk from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

// Accepted trans flag strings -> reference transpose code. dsyrk (real
// symmetric) treats 'conjugate-transpose' identically to 'transpose'.
const FLAGS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ] // for a real scalar, 'c' == 't'
];

// (N,K) pairs: square, rectangular (both orientations), K=0 edge, and sizes
// that straddle the kernel's unrolled-remainder boundaries.
const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];
const KS = [ 0, 1, 2, 4, 7, 16 ];

// alpha/beta combinations exercising the beta=0, beta=1, and alpha=0 code paths.
const COMBOS = [ 'gg', 'g0', 'g1', '0g' ];

function scalarSpec( spec, rng ) {
	if ( spec === '0' ) {
		return sc.zero;
	}
	if ( spec === '1' ) {
		return sc.one;
	}
	return sc.random( rng );
}

// Read ONLY the uplo triangle of C back out of poisoned storage; the opposite
// triangle (never referenced/written by the routine) is set to zero so it does
// not participate in the comparison.
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

// Build the expected C over ONLY the uplo triangle (opposite triangle zeroed).
function expectedTri( P, C0, alpha, beta, n, uplo ) {
	const E = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				E.set( i, j, sc.add( sc.mul( alpha, P.get( i, j ) ), sc.mul( beta, C0.get( i, j ) ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}


// Steps 2/3/5: residual property over the full uplo x trans x size x scalar
// sweep.
test( 'dsyrk: C = alpha*op(A)*op(A)^T + beta*C (uplo x trans x sizes x scalars)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		FLAGS.forEach( function eachFlag( fl ) {
			const code = fl[ 1 ];
			const nota = ( code === 'n' );
			NS.forEach( function eachN( n ) {
				KS.forEach( function eachK( k ) {
					const rng = new RNG( 0x100 + ( n * 10 ) + k );

					// A is N x K for no-transpose, K x N otherwise.
					const A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
					const C0 = logical.symmetric( sc, rng, n );

					// Oracle: P = A*A^T (no-transpose) or A^T*A (transpose). The
					// oracle always applies the plain transpose ('t') to the
					// operand being transposed ('c' == 't' for a real scalar).
					const P = nota
						? ref.matmul( sc, A, A, { 'transb': 't' } )
						: ref.matmul( sc, A, A, { 'transa': 't' } );

					COMBOS.forEach( function eachCombo( combo ) {
						const alpha = scalarSpec( combo[ 0 ], rng );
						const beta = scalarSpec( combo[ 1 ], rng );

						const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
						const RC = schemes.dense.realize( sc, C0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );

						dsyrk( uplo, fl[ 0 ], n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], sc.apiScalar( beta ), RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

						const got = readTri( RC, n, uplo );
						const expected = expectedTri( P, C0, alpha, beta, n, uplo );
						const label = 'dsyrk ' + uplo + ' ' + code + ' n=' + n + ' k=' + k + ' ' + combo;
						checked( 'dsyrk', 'residual', function run() {
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
test( 'dsyrk: bit-exact across storage layouts', function t() {
	const n = 6;
	const k = 4;
	const SEED = 0xF00D;
	const layouts = schemes.dense.layouts();
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		[ [ 'no-transpose', 'n' ], [ 'transpose', 't' ] ].forEach( function eachFlag( fl ) {
			const code = fl[ 1 ];
			const nota = ( code === 'n' );
			checked( 'dsyrk', 'layout-invariance', function run() {
				layoutInvariant( layouts, function build( layout, idx ) {
					const rng = new RNG( SEED ); // identical operand values every variant
					const A = nota ? logical.general( sc, rng, n, k ) : logical.general( sc, rng, k, n );
					const C0 = logical.symmetric( sc, rng, n );
					const alpha = sc.random( rng );
					const beta = sc.random( rng );

					const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, layout );
					const RC = schemes.dense.realize( sc, C0, { 'part': uplo }, layouts[ ( idx + 1 ) % layouts.length ] );

					dsyrk( uplo, fl[ 0 ], n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], sc.apiScalar( beta ), RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

					return check.flattenLogical( sc, readTri( RC, n, uplo ) );
				}, { 'label': 'dsyrk ' + uplo + ' ' + code + ' layout invariance' } );
			});
		});
	});
});
