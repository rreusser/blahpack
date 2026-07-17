/**
* Property-based validation for ztbmv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tb` -> triangular BANDED
* (schemes.banded with half-bandwidth k + uplo, logical.triangularBanded); `mv`
* (matrix-vector) -> residual property `x := op(A)*x` against the independent
* matvec oracle on the FULL logical A, sweeping uplo x trans x diag. The `c`
* (conjugate-transpose) code exercises complex conjugation the real routine cannot.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztbmv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var DIAG = [ 'non-unit', 'unit' ];
var NS = [ 1, 2, 3, 5, 8, 16, 17, 33 ];

// trans flag -> reference transpose code.
var TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Unique half-bandwidths in {0,1,2,N-1} clamped to [0,N-1] (diagonal-only through
// full band).
function bands( n ) {
	var hi = Math.max( 0, n - 1 );
	var out = [];
	[ 0, 1, 2, hi ].forEach( function each( k ) {
		var v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

// Scaled residual assertion mirroring test.harness.js dtrmv / dspmv.
function assertResidual( got, expected, label, n ) {
	check.assertFinite( sc, got, label+' output' );
	var errC = [];
	var scC = [];
	var i;
	for ( i = 0; i < got.length; i++ ) {
		sc.components( sc.sub( got[ i ], expected[ i ] ) ).forEach( function p( v ) { errC.push( v * v ); } );
		sc.components( expected[ i ] ).forEach( function p( v ) { scC.push( v * v ); } );
	}
	var err = Math.sqrt( errC.reduce( function s( a, b ) { return a + b; }, 0 ) );
	var scl = Math.sqrt( scC.reduce( function s( a, b ) { return a + b; }, 0 ) );
	check.assertScaled( err, scl, check.tol( n, 20 ), label );
}

// Steps 2-5: residual over uplo x trans x diag x N x K sweep.
test( 'ztbmv: triangular-banded matrix-vector residual (uplo x trans x diag x N x K sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			var code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				NS.forEach( function eachN( N ) {
					bands( N ).forEach( function eachK( K ) {
						var rng = new RNG( 0x100 + ( N * 10 ) + K );
						var A = logical.triangularBanded( sc, rng, N, K, { 'uplo': uplo, 'unit': unit } );
						var x = [];
						var i;
						for ( i = 0; i < N; i++ ) {
							x.push( sc.random( rng ) );
						}
						var R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': K, 'unit': unit }, schemes.banded.layouts()[ 0 ] );
						var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
						ztbmv( uplo, trans, diag, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
						var expected = ref.matvec( sc, A, x, { 'trans': code } );
						var got = [];
						for ( i = 0; i < N; i++ ) {
							got.push( X.read( i ) );
						}
						checked( 'ztbmv', 'residual', function run() {
							assertResidual( got, expected, 'ztbmv '+uplo+' '+trans+' '+diag+' N='+N+' K='+K, N );
						});
					});
				});
			});
		});
	});
});

// Step 3: layout-invariance fuzz. The tbmv kernel picks its loop direction and
// summation order by (uplo, trans) alone; the inner sum runs over a fixed index
// order independent of the band-array strides, so changing only addressing
// (band-array layout + strided/negative x) must reproduce output BIT-FOR-BIT
// across ALL band layouts for a fixed (uplo, trans, diag) — no col/row family
// split required (cf. dsbmv).
test( 'ztbmv: output is bit-exact across storage layouts', function t() {
	var N = 11;
	var K = 3;
	var SEED = 0xF11E;
	var vLayouts = schemes.vectorLayouts();
	var aLayouts = schemes.banded.layouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				checked( 'ztbmv', 'layout-invariance', function run() {
					layoutInvariant( aLayouts, function build( aL, idx ) {
						var rng = new RNG( SEED ); // identical values every variant
						var A = logical.triangularBanded( sc, rng, N, K, { 'uplo': uplo, 'unit': unit } );
						var x = [];
						var i;
						for ( i = 0; i < N; i++ ) {
							x.push( sc.random( rng ) );
						}
						var R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': K, 'unit': unit }, aL );
						var vL = vLayouts[ idx % vLayouts.length ];
						var X = schemes.realizeVector( sc, x, vL );
						ztbmv( uplo, trans, diag, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
						var out = new LogicalMatrix( sc, N, 1 );
						for ( i = 0; i < N; i++ ) {
							out.set( i, 0, X.read( i ) );
						}
						return check.flattenLogical( sc, out );
					}, { 'label': 'ztbmv '+uplo+' '+trans+' '+diag+' layout invariance' } );
				});
			});
		});
	});
});
