/**
* Property-based validation for dsymv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric matrix, one
* triangle stored in the dense scheme (schemes.dense with { part: uplo },
* logical.symmetric); `mv` (matrix-vector) -> residual property
* `y = alpha*A*x + beta*y` against the independent matvec oracle over the FULL
* symmetric matrix.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsymv from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

// Scaled residual assertion mirroring test.harness.js dspmv.
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

// Steps 2-3-5: residual over uplo x N size sweep (incl N=0,1), with random
// alpha,beta plus the beta=0 and beta=1 corner cases.
test( 'dsymv: symmetric matrix-vector residual (uplo x N sweep)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			var rng = new RNG( 0x300 + N );
			var A = logical.symmetric( sc, rng, N );
			var x = [];
			var y = [];
			var i;
			for ( i = 0; i < N; i++ ) {
				x.push( sc.random( rng ) );
			}
			for ( i = 0; i < N; i++ ) {
				y.push( sc.random( rng ) );
			}
			var betaCases = [ sc.random( rng ), sc.zero, sc.one ];
			betaCases.forEach( function eachBeta( beta ) {
				var alpha = sc.random( rng );
				var R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
				var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
				var Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
				dsymv( uplo, N, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				var ax = ref.matvec( sc, A, x );
				var expected = [];
				var got = [];
				for ( i = 0; i < N; i++ ) {
					expected.push( sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y[ i ] ) ) );
					got.push( Y.read( i ) );
				}
				checked( 'dsymv', 'residual', function run() {
					assertResidual( got, expected, 'dsymv '+uplo+' N='+N, N );
				});
			});
		});
	});
});

// The optimized kernel normalizes via symmetry to whichever triangle
// orientation has the smaller inner (row) stride: with (sa1,sa2) the strides of
// the upper-triangle view, it runs the "upper" kernel when |sa1| <= |sa2|, else
// the "lower" kernel (see lib/base.js). The two kernels reorder the summation,
// so output is bit-exact ONLY within a single kernel-form family (e.g. all
// column-major vs all row-major differ by ~1e-16 while the residual property
// holds at a backward-error tolerance, per the kernel's documented contract).
// We therefore split the dense layouts into kernel-form families and assert
// bit-exactness within each family.
function kernelForm( uplo, layout, n ) {
	var R = schemes.dense.realize( sc, new LogicalMatrix( sc, n, n ), { 'part': 'full' }, layout );
	var s1 = R.args[ 0 ];
	var s2 = R.args[ 1 ];
	var sa1 = ( uplo === 'upper' ) ? s1 : s2;
	var sa2 = ( uplo === 'upper' ) ? s2 : s1;
	return ( Math.abs( sa1 ) <= Math.abs( sa2 ) ) ? 'upper-kernel' : 'lower-kernel';
}

// Step 4: layout-invariance fuzz — output bit-exact across A layouts and
// strided/negative x,y vectors, within a kernel-form family.
test( 'dsymv: output is bit-exact across storage layouts (per kernel form)', function t() {
	var n = 9;
	var SEED = 0xD51;
	var vLayouts = schemes.vectorLayouts();
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		[ 'upper-kernel', 'lower-kernel' ].forEach( function eachForm( form ) {
			var aLayouts = schemes.dense.layouts().filter( function keep( L ) {
				return kernelForm( uplo, L, n ) === form;
			});
			if ( aLayouts.length < 2 ) {
				return; // need >= 2 layouts to compare
			}
			checked( 'dsymv', 'layout-invariance', function run() {
				layoutInvariant( aLayouts, function build( aL, idx ) {
					var rng = new RNG( SEED ); // identical values every variant
					var A = logical.symmetric( sc, rng, n );
					var x = [];
					var y = [];
					var i;
					for ( i = 0; i < n; i++ ) {
						x.push( sc.random( rng ) );
					}
					for ( i = 0; i < n; i++ ) {
						y.push( sc.random( rng ) );
					}
					var alpha = sc.random( rng );
					var beta = sc.random( rng );
					var R = schemes.dense.realize( sc, A, { 'part': uplo }, aL );
					var vL = vLayouts[ idx % vLayouts.length ];
					var X = schemes.realizeVector( sc, x, vL );
					var Y = schemes.realizeVector( sc, y, vL );
					dsymv( uplo, n, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
					var out = new LogicalMatrix( sc, n, 1 );
					for ( i = 0; i < n; i++ ) {
						out.set( i, 0, Y.read( i ) );
					}
					return check.flattenLogical( sc, out );
				}, { 'label': 'dsymv '+uplo+' '+form+' layout invariance' } );
			});
		});
	});
});
