/**
* Property-based validation for zhpmv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hp` -> Hermitian packed
* (schemes.packed, logical.hermitian); matrix-vector `y = alpha*A*x + beta*y`
* -> residual property `‖(alpha*A*x + beta*y0) - y‖` scaled.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhpmv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var SIZES = [ 1, 2, 3, 5, 8, 17, 33 ];

// alpha/beta combinations, including beta = 0 (overwrite) and beta = 1
// (accumulate) special paths, plus a general random complex pair.
function scalarCombos( rng ) {
	return [
		[ sc.random( rng ), sc.zero ], // beta = 0
		[ sc.random( rng ), sc.one ], // beta = 1
		[ sc.random( rng ), sc.random( rng ) ] // general complex
	];
}

// Compute the scaled residual of the two scalar-value arrays and assert.
function assertVecClose( got, expected, n, label ) {
	var errC = [];
	var scC = [];
	var d;
	var i;
	check.assertFinite( sc, got, label+' output' );
	for ( i = 0; i < n; i++ ) {
		d = sc.sub( got[ i ], expected[ i ] );
		sc.components( d ).forEach( function push( v ) { errC.push( v * v ); } );
		sc.components( expected[ i ] ).forEach( function push( v ) { scC.push( v * v ); } );
	}
	var err = Math.sqrt( errC.reduce( function s( a, b ) { return a + b; }, 0 ) );
	var scl = Math.sqrt( scC.reduce( function s( a, b ) { return a + b; }, 0 ) );
	check.assertScaled( err, scl, check.tol( n, 20 ), label );
}

// Steps 2-3-5: residual across the size sweep, both uplo flags, and alpha/beta
// combinations (incl. beta = 0 and beta = 1).
test( 'zhpmv: Hermitian packed matrix-vector residual (size sweep x uplo x alpha/beta)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( n ) {
			var rng = new RNG( 0x300 + n ); // reproducible; log on failure
			var A = logical.hermitian( sc, rng, n );
			var x = [];
			var y0 = [];
			var i;
			for ( i = 0; i < n; i++ ) {
				x.push( sc.random( rng ) );
			}
			for ( i = 0; i < n; i++ ) {
				y0.push( sc.random( rng ) );
			}
			var ax = ref.matvec( sc, A, x ); // oracle over the FULL logical A
			scalarCombos( rng ).forEach( function eachAB( ab ) {
				var alpha = ab[ 0 ];
				var beta = ab[ 1 ];
				var AP = schemes.packed.realize( sc, A, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
				var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
				var Y = schemes.realizeVector( sc, y0, { 'stride': 1 } );
				zhpmv( uplo, n, sc.apiScalar( alpha ), AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				var expected = [];
				var got = [];
				for ( i = 0; i < n; i++ ) {
					expected.push( sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y0[ i ] ) ) );
					got.push( Y.read( i ) );
				}
				checked( 'zhpmv', 'residual', function run() {
					assertVecClose( got, expected, n, 'zhpmv '+uplo+' n='+n );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz — output must be bit-exact across packed AP
// layouts (incl. negative packed strides) and strided/negative vectors.
test( 'zhpmv: output is bit-exact across storage layouts (packed AP + strided/negative vectors)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 9;
		var SEED = 0xABCD;
		var apLayouts = schemes.packed.layouts();
		var vLayouts = schemes.vectorLayouts();
		checked( 'zhpmv', 'layout-invariance', function run() {
			layoutInvariant( apLayouts, function build( apL, idx ) {
				var rng = new RNG( SEED ); // fixed seed => identical values
				var A = logical.hermitian( sc, rng, n );
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
				var AP = schemes.packed.realize( sc, A, { 'part': uplo }, apL );
				var vL = vLayouts[ idx % vLayouts.length ];
				var X = schemes.realizeVector( sc, x, vL );
				var Y = schemes.realizeVector( sc, y, vL );
				zhpmv( uplo, n, sc.apiScalar( alpha ), AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				var out = new LogicalMatrix( sc, n, 1 );
				for ( i = 0; i < n; i++ ) {
					out.set( i, 0, Y.read( i ) );
				}
				return check.flattenLogical( sc, out );
			}, { 'label': 'zhpmv '+uplo+' layout invariance' } );
		});
	});
});
