/**
* Property-based validation for zhbmv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hb` -> Hermitian BANDED
* (schemes.banded with half-bandwidth k, logical.hermitianBanded: real diagonal,
* conjugate-symmetric band); `mv` (matrix-vector) -> residual property
* `y = alpha*A*x + beta*y` against the independent matvec oracle on the FULL
* logical Hermitian A, sweeping uplo.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhbmv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];

// Unique half-bandwidths in {0,1,2, N-1} clamped to [0, N-1] (diagonal-only
// through full band).
function bands( n ) {
	const hi = Math.max( 0, n - 1 );
	const out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		const v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Scaled residual assertion mirroring test.harness.js dspmv / dgbmv.
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

// Steps 2-3-5: residual over uplo x N x K sweep (incl diagonal K=0 and near-full
// bands), with random complex alpha,beta plus the beta=0 and beta=1 corners.
test( 'zhbmv: Hermitian-banded matrix-vector residual (uplo x N x K sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		NS.forEach( function eachN( N ) {
			bands( N ).forEach( function eachK( K ) {
				const rng = new RNG( 0x300 + ( N * 10 ) + K );
				const A = logical.hermitianBanded( sc, rng, N, K );
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
					const R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': K }, schemes.banded.layouts()[ 0 ] );
					const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
					const Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
					zhbmv( uplo, N, K, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
					const ax = ref.matvec( sc, A, x );
					const expected = [];
					const got = [];
					for ( i = 0; i < N; i++ ) {
						expected.push( sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y[ i ] ) ) );
						got.push( Y.read( i ) );
					}
					checked( 'zhbmv', 'residual', function run() {
						assertResidual( got, expected, 'zhbmv '+uplo+' N='+N+' K='+K, N );
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. The hbmv kernel picks its summation form by
// `uplo` alone; the inner sum runs over a fixed index order independent of the
// band-array strides, so changing only addressing (band-array layout + strided/
// negative x,y) must reproduce output BIT-FOR-BIT across ALL layouts for a fixed
// uplo (no col/row family split required).
test( 'zhbmv: output is bit-exact across storage layouts', function t() {
	const N = 11;
	const K = 3;
	const SEED = 0xF00D;
	const vLayouts = schemes.vectorLayouts();
	const aLayouts = schemes.banded.layouts();
	UPLO.forEach( function eachUplo( uplo ) {
		checked( 'zhbmv', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.hermitianBanded( sc, rng, N, K );
				const x = [];
				const y = [];
				let i;
				for ( i = 0; i < N; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < N; i++ ) {
					y.push( sc.random( rng ) );
				}
				const alpha = sc.random( rng );
				const beta = sc.random( rng );
				const R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': K }, aL );
				const vL = vLayouts[ idx % vLayouts.length ];
				const X = schemes.realizeVector( sc, x, vL );
				const Y = schemes.realizeVector( sc, y, vL );
				zhbmv( uplo, N, K, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				const out = new LogicalMatrix( sc, N, 1 );
				for ( i = 0; i < N; i++ ) {
					out.set( i, 0, Y.read( i ) );
				}
				return check.flattenLogical( sc, out );
			}, { 'label': 'zhbmv '+uplo+' layout invariance' } );
		});
	});
});
