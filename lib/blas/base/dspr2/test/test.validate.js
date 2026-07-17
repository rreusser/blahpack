/**
* Property-based validation for dspr2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sp` -> symmetric PACKED
* (schemes.packed one triangle, logical.symmetric); rank-2 update
* `A := alpha*x*y**T + alpha*y*x**T + A` validated by direct residual against an
* independent oracle `A(i,j) += alpha*( x_i*y_j + y_i*x_j )` over the referenced
* (uplo) triangle only. Unreferenced packed slots are left poisoned (NaN) and
* never read back.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dspr2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

// Read ONLY the referenced (uplo) triangle back out of physical storage;
// unreferenced entries are filled with zero (kept out of the comparison).
function readTri( R, n, uplo ) {
	var G = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				G.set( i, j, R.read( i, j ) );
			} else {
				G.set( i, j, sc.zero );
			}
		}
	}
	return G;
}

// Independent oracle over the referenced triangle:
//   expected(i,j) = A0(i,j) + alpha*( x_i*y_j + y_i*x_j ).
function expected( A0, alpha, x, y, n, uplo ) {
	var E = new LogicalMatrix( sc, n, n );
	var upd;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				upd = sc.add( sc.mul( x[ i ], y[ j ] ), sc.mul( y[ i ], x[ j ] ) );
				E.set( i, j, sc.add( A0.get( i, j ), sc.scale( upd, alpha ) ) );
			} else {
				E.set( i, j, sc.zero );
			}
		}
	}
	return E;
}

function values( rng, n ) {
	var v = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		v.push( sc.random( rng ) );
	}
	return v;
}

// Steps 2-3-5: residual across the size sweep (incl. N=0,1) x both uplo, with a
// mix of alpha values including alpha=0 (quick-return path).
test( 'dspr2: symmetric packed rank-2 update residual (size sweep x uplo, incl. alpha=0)', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			var rng = new RNG( 0x100 + N ); // reproducible; log on failure
			var A0 = logical.symmetric( sc, rng, N );
			var x = values( rng, N );
			var y = values( rng, N );
			var alpha = ( N % 4 === 3 ) ? 0.0 : rng.normal();

			var R = schemes.packed.realize( sc, A0, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
			var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
			var Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
			dspr2( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ] );

			var got = readTri( R, N, uplo );
			var exp = expected( A0, alpha, x, y, N, uplo );
			checked( 'dspr2', 'residual', function run() {
				check.assertReconstruct( sc, got, exp, { 'label': 'dspr2 '+uplo+' N='+N+' alpha='+alpha } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the updated triangle must be bit-exact across
// packed storage layouts (matrix AND strided/negative vectors).
test( 'dspr2: bit-exact across storage layouts', function t() {
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var N = 9;
		var SEED = 0xF00D;
		var aLayouts = schemes.packed.layouts();
		var vLayouts = schemes.vectorLayouts();
		checked( 'dspr2', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A0 = logical.symmetric( sc, rng, N );
				var x = values( rng, N );
				var y = values( rng, N );
				var alpha = rng.normal();

				var R = schemes.packed.realize( sc, A0, { 'part': uplo }, aL );
				var vL = vLayouts[ idx % vLayouts.length ];
				var X = schemes.realizeVector( sc, x, vL );
				var Y = schemes.realizeVector( sc, y, vL );
				dspr2( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ] );
				return check.flattenLogical( sc, readTri( R, N, uplo ) );
			}, { 'label': 'dspr2 '+uplo+' layout invariance' } );
		});
	});
});
