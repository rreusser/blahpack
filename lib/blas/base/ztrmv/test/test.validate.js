/**
* Property-based validation for ztrmv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tr` -> dense triangular
* (schemes.dense, logical.triangular); `mv` (matrix-vector) -> residual property
* `x := op(A)*x` against the independent matvec oracle.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztrmv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var DIAG = [ 'non-unit', 'unit' ];

// trans flag -> reference transpose code.
var TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Scaled residual assertion mirroring test.harness.js dspmv / dgemv.
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

// Steps 2a-5: residual over uplo x trans x diag x N sweep (incl N=0,1).
test( 'ztrmv: triangular matrix-vector residual (uplo x trans x diag x N sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			var code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				SIZES.forEach( function eachN( N ) {
					var rng = new RNG( 0x100 + N );
					var A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
					var x = [];
					var i;
					for ( i = 0; i < N; i++ ) {
						x.push( sc.random( rng ) );
					}
					var R = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, schemes.dense.layouts()[ 0 ] );
					var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
					ztrmv( uplo, trans, diag, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
					var expected = ref.matvec( sc, A, x, { 'trans': code } );
					var got = [];
					for ( i = 0; i < N; i++ ) {
						got.push( X.read( i ) );
					}
					checked( 'ztrmv', 'residual', function run() {
						assertResidual( got, expected, 'ztrmv '+uplo+' '+trans+' '+diag+' N='+N, N );
					});
				});
			});
		});
	});
});

// The optimized kernel picks a summation order by which folded stride is
// smaller (dot form when |sb2| <= |sb1|, else axpy) — the two forms reorder the
// sum, so output is bit-exact ONLY within one form (col-major vs row-major
// differ by ~1e-16 while the residual property holds at backward-error
// tolerance). We split the dense layouts into kernel-form families.
function kernelForm( trans, layout ) {
	var R = schemes.dense.realize( sc, new LogicalMatrix( sc, 9, 9 ), { 'part': 'full' }, layout );
	var sA1 = R.args[ 0 ];
	var sA2 = R.args[ 1 ];
	var sb1 = ( trans === 'no-transpose' ) ? sA1 : sA2;
	var sb2 = ( trans === 'no-transpose' ) ? sA2 : sA1;
	return ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) ? 'dot' : 'axpy';
}

// Step 3: layout-invariance fuzz — output bit-exact across A layouts and
// strided/negative x vectors, within a kernel-form family.
test( 'ztrmv: output is bit-exact across storage layouts (per kernel form)', function t() {
	var N = 9;
	var SEED = 0xF33E;
	var vLayouts = schemes.vectorLayouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			var trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				var unit = ( diag === 'unit' );
				[ 'dot', 'axpy' ].forEach( function eachForm( form ) {
					var aLayouts = schemes.dense.layouts().filter( function keep( L ) {
						return kernelForm( trans, L ) === form;
					});
					if ( aLayouts.length < 2 ) {
						return; // need >= 2 layouts to compare
					}
					checked( 'ztrmv', 'layout-invariance', function run() {
						layoutInvariant( aLayouts, function build( aL, idx ) {
							var rng = new RNG( SEED ); // identical values every variant
							var A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
							var x = [];
							var i;
							for ( i = 0; i < N; i++ ) {
								x.push( sc.random( rng ) );
							}
							var R = schemes.dense.realize( sc, A, { 'part': uplo, 'unit': unit }, aL );
							var vL = vLayouts[ idx % vLayouts.length ];
							var X = schemes.realizeVector( sc, x, vL );
							ztrmv( uplo, trans, diag, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ] );
							var out = new LogicalMatrix( sc, N, 1 );
							for ( i = 0; i < N; i++ ) {
								out.set( i, 0, X.read( i ) );
							}
							return check.flattenLogical( sc, out );
						}, { 'label': 'ztrmv '+uplo+' '+trans+' '+diag+' '+form+'-form layout invariance' } );
					});
				});
			});
		});
	});
});
