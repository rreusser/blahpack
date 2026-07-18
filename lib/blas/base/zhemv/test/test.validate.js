/**
* Property-based validation for zhemv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian matrix, one
* triangle stored in the dense scheme (schemes.dense with { part: uplo },
* logical.hermitian: conjugate symmetry, real diagonal); `mv` (matrix-vector)
* -> residual property `y = alpha*A*x + beta*y` against the independent matvec
* oracle over the FULL Hermitian matrix.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhemv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// Scaled residual assertion mirroring test.harness.js dspmv/zhpmv.
function assertResidual( got, expected, label, n ) {
	check.assertFinite( sc, got, label+' output' );
	const errC = [];
	const scC = [];
	let i;
	for ( i = 0; i < got.length; i++ ) {
		sc.components( sc.sub( got[ i ], expected[ i ] ) ).forEach( function p( v ) { errC.push( v * v ); } );
		sc.components( expected[ i ] ).forEach( function p( v ) { scC.push( v * v ); } );
	}
	const err = Math.sqrt( errC.reduce( function s( a, b ) { return a + b; }, 0 ) );
	const scl = Math.sqrt( scC.reduce( function s( a, b ) { return a + b; }, 0 ) );
	check.assertScaled( err, scl, check.tol( n, 20 ), label );
}

// Steps 2-3-5: residual over uplo x N size sweep (incl N=0,1), with random
// alpha,beta plus the beta=0 and beta=1 corner cases.
test( 'zhemv: Hermitian matrix-vector residual (uplo x N sweep)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			const rng = new RNG( 0x300 + N );
			const A = logical.hermitian( sc, rng, N );
			const x = [];
			const y = [];
			let i;
			for ( i = 0; i < N; i++ ) {
				x.push( sc.random( rng ) );
			}
			for ( i = 0; i < N; i++ ) {
				y.push( sc.random( rng ) );
			}
			const betaCases = [ sc.random( rng ), sc.zero, sc.one ];
			betaCases.forEach( function eachBeta( beta ) {
				const alpha = sc.random( rng );
				const R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
				const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
				const Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
				zhemv( uplo, N, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				const ax = ref.matvec( sc, A, x );
				const expected = [];
				const got = [];
				for ( i = 0; i < N; i++ ) {
					expected.push( sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y[ i ] ) ) );
					got.push( Y.read( i ) );
				}
				checked( 'zhemv', 'residual', function run() {
					assertResidual( got, expected, 'zhemv '+uplo+' N='+N, N );
				});
			});
		});
	});
});

// Unlike dsymv, the zhemv kernel branches purely on `uplo` (it does NOT
// normalize via symmetry to the smaller-stride triangle), so for a fixed uplo
// the summation order is identical across every dense layout — changing only
// addressing must reproduce output BIT-FOR-BIT. Hence a single family per uplo,
// no kernel-form split needed.

// Step 4: layout-invariance fuzz — output bit-exact across all A layouts and
// strided/negative x,y vectors, for a fixed uplo.
test( 'zhemv: output is bit-exact across storage layouts', function t() {
	const n = 9;
	const SEED = 0x2E7;
	const vLayouts = schemes.vectorLayouts();
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const aLayouts = schemes.dense.layouts();
		checked( 'zhemv', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.hermitian( sc, rng, n );
				const x = [];
				const y = [];
				let i;
				for ( i = 0; i < n; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < n; i++ ) {
					y.push( sc.random( rng ) );
				}
				const alpha = sc.random( rng );
				const beta = sc.random( rng );
				const R = schemes.dense.realize( sc, A, { 'part': uplo }, aL );
				const vL = vLayouts[ idx % vLayouts.length ];
				const X = schemes.realizeVector( sc, x, vL );
				const Y = schemes.realizeVector( sc, y, vL );
				zhemv( uplo, n, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				const out = new LogicalMatrix( sc, n, 1 );
				for ( i = 0; i < n; i++ ) {
					out.set( i, 0, Y.read( i ) );
				}
				return check.flattenLogical( sc, out );
			}, { 'label': 'zhemv '+uplo+' layout invariance' } );
		});
	});
});
