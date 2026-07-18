/**
* Property-based validation for zgemm, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> dense general
* (schemes.dense, logical.general); `mm` -> matrix-matrix product with the
* residual property  C = alpha*op(A)*op(B) + beta*C  checked against an
* independent naive matmul oracle, swept over the full 9-way transa x transb
* cross product (including conjugate-transpose, which is distinct from transpose
* for complex), then fuzzed for bit-exact layout invariance (L3).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgemm from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// Accepted flag strings -> reference transpose code:
const FLAGS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// (M,N,K) triples: square, rectangular (both orientations), and the M=0 / N=0 /
// K=0 edges. K crosses the 4-wide unrolled-remainder boundary in the kernel.
const TRIPLES = [
	[ 1, 1, 1 ],
	[ 2, 3, 4 ],
	[ 3, 2, 5 ],
	[ 5, 5, 5 ],
	[ 8, 3, 2 ],
	[ 2, 8, 3 ],
	[ 16, 17, 8 ],
	[ 7, 6, 17 ],
	[ 0, 3, 4 ], // M = 0
	[ 3, 0, 4 ], // N = 0
	[ 3, 4, 0 ], // K = 0
	[ 4, 4, 0 ]  // K = 0, square
];

// alpha/beta combinations: general, plus the beta=0, beta=1, and alpha=0 code
// paths the reference kernel special-cases.
const COMBOS = [ 'gg', 'g0', 'g1', '0g' ];

// op(A) is M x K, so A is stored M x K ('n') or K x M ('t'/'c').
function shapeA( code, m, k ) {
	return ( code === 'n' ) ? [ m, k ] : [ k, m ];
}

// op(B) is K x N, so B is stored K x N ('n') or N x K ('t'/'c').
function shapeB( code, k, n ) {
	return ( code === 'n' ) ? [ k, n ] : [ n, k ];
}

// Resolve an alpha/beta spec ('g' random | '0' zero | '1' one) to a value.
function scalarSpec( spec, rng ) {
	if ( spec === '0' ) {
		return sc.zero;
	}
	if ( spec === '1' ) {
		return sc.one;
	}
	return sc.random( rng );
}

// Read the M x N result matrix C back out of poisoned storage.
function readC( R, m, n ) {
	const C = new LogicalMatrix( sc, m, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			C.set( i, j, R.read( i, j ) );
		}
	}
	return C;
}


// Steps 2/3/5: residual property over the full flag x size x scalar sweep.
test( 'zgemm: C = alpha*op(A)*op(B) + beta*C (transa x transb x sizes x scalars)', function t() {
	FLAGS.forEach( function eachA( fa, ti ) {
		FLAGS.forEach( function eachB( fb, tj ) {
			const ca = fa[ 1 ];
			const cb = fb[ 1 ];
			TRIPLES.forEach( function eachTriple( tr ) {
				const m = tr[ 0 ];
				const n = tr[ 1 ];
				const k = tr[ 2 ];
				const seed = 0x100 + ( ( ( m * 100 ) + ( n * 10 ) + k ) * 16 ) + ( ti * 4 ) + tj;
				const rng = new RNG( seed );
				const sa = shapeA( ca, m, k );
				const sb = shapeB( cb, k, n );
				const A = logical.general( sc, rng, sa[ 0 ], sa[ 1 ] );
				const B = logical.general( sc, rng, sb[ 0 ], sb[ 1 ] );
				const C0 = logical.general( sc, rng, m, n );
				const P = ref.matmul( sc, A, B, { 'transa': ca, 'transb': cb } );

				COMBOS.forEach( function eachCombo( combo ) {
					const alpha = scalarSpec( combo[ 0 ], rng );
					const beta = scalarSpec( combo[ 1 ], rng );

					const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
					const RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
					const RC = schemes.dense.realize( sc, C0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );

					zgemm( fa[ 0 ], fb[ 0 ], m, n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], sc.apiScalar( beta ), RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

					const got = readC( RC, m, n );
					const expected = new LogicalMatrix( sc, m, n );
					let i, j;
					for ( j = 0; j < n; j++ ) {
						for ( i = 0; i < m; i++ ) {
							expected.set( i, j, sc.add( sc.mul( alpha, P.get( i, j ) ), sc.mul( beta, C0.get( i, j ) ) ) );
						}
					}
					const label = 'zgemm ' + ca + cb + ' m=' + m + ' n=' + n + ' k=' + k + ' ' + combo;
					checked( 'zgemm', 'residual', function run() {
						check.assertReconstruct( sc, got, expected, { 'label': label } );
					});
				});
			});
		});
	});
});


// Step 4: layout-invariance fuzz — output must be BIT-EXACT across every dense
// layout (col/row-major, padding, negative strides), varying A, B, and C each.
test( 'zgemm: bit-exact across storage layouts', function t() {
	const m = 7;
	const n = 5;
	const k = 6;
	const SEED = 0xF00D;
	const layouts = schemes.dense.layouts();
	[ [ 'no-transpose', 'no-transpose' ], [ 'conjugate-transpose', 'no-transpose' ], [ 'conjugate-transpose', 'transpose' ] ].forEach( function eachCombo( fc ) {
		const codes = {
			'no-transpose': 'n',
			'transpose': 't',
			'conjugate-transpose': 'c'
		};
		const ca = codes[ fc[ 0 ] ];
		const cb = codes[ fc[ 1 ] ];
		checked( 'zgemm', 'layout-invariance', function run() {
			layoutInvariant( layouts, function build( layout, idx ) {
				const rng = new RNG( SEED ); // identical operand values every variant
				const sa = shapeA( ca, m, k );
				const sb = shapeB( cb, k, n );
				const A = logical.general( sc, rng, sa[ 0 ], sa[ 1 ] );
				const B = logical.general( sc, rng, sb[ 0 ], sb[ 1 ] );
				const C0 = logical.general( sc, rng, m, n );
				const alpha = sc.random( rng );
				const beta = sc.random( rng );

				// Vary each operand's layout independently across the sweep.
				const RA = schemes.dense.realize( sc, A, { 'part': 'full' }, layout );
				const RB = schemes.dense.realize( sc, B, { 'part': 'full' }, layouts[ ( idx + 1 ) % layouts.length ] );
				const RC = schemes.dense.realize( sc, C0, { 'part': 'full' }, layouts[ ( idx + 2 ) % layouts.length ] );

				zgemm( fc[ 0 ], fc[ 1 ], m, n, k, sc.apiScalar( alpha ), RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], sc.apiScalar( beta ), RC.data, RC.args[ 0 ], RC.args[ 1 ], RC.args[ 2 ] );

				return check.flattenLogical( sc, readC( RC, m, n ) );
			}, { 'label': 'zgemm ' + ca + cb + ' layout invariance' } );
		});
	});
});
