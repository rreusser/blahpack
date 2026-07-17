/**
* Property-based validation for zher, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense, one
* triangle referenced (schemes.dense with part=uplo, logical.hermitian);
* Hermitian rank-1 update `A := alpha*x*x**H + A` (alpha a REAL scalar)
* validated by direct residual against an independent oracle
* `A(i,j) += alpha*x_i*conj(x_j)` over the referenced triangle only (the other
* triangle stays poisoned and is never read). The routine forces the diagonal
* to be exactly real; the scaled tolerance absorbs any imaginary rounding.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zher from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var CONJ = true; // A := alpha*x*x**H + A (conjugate the second factor)
var LogicalMatrix = logical.LogicalMatrix;

function isRef( uplo, i, j ) {
	return ( uplo === 'upper' ) ? ( i <= j ) : ( i >= j );
}

// Read back ONLY the referenced (uplo) triangle; non-referenced -> sc.zero.
function readTri( R, uplo, n ) {
	var G = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			G.set( i, j, isRef( uplo, i, j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return G;
}

// Independent oracle over the referenced triangle only.
function expectedTri( A0, alpha, x, uplo, n ) {
	var E = new LogicalMatrix( sc, n, n );
	var xj;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		xj = CONJ ? sc.conj( x[ j ] ) : x[ j ];
		for ( i = 0; i < n; i++ ) {
			if ( isRef( uplo, i, j ) ) {
				E.set( i, j, sc.add( A0.get( i, j ), sc.scale( sc.mul( x[ i ], xj ), alpha ) ) );
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

var UPLOS = [ 'upper', 'lower' ];

// Steps 2-3-5: residual across the size sweep (incl. N=0,1 and alpha=0) x uplo.
test( 'zher: Hermitian rank-1 update residual (size + uplo sweep, incl. alpha=0)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			var rng = new RNG( 0x100 + N );
			var A0 = logical.hermitian( sc, rng, N );
			var x = values( rng, N );
			var alpha = ( N % 8 === 0 ) ? 0.0 : rng.normal(); // real scalar; includes alpha=0

			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
			zher( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );

			var got = readTri( R, uplo, N );
			var exp = expectedTri( A0, alpha, x, uplo, N );
			checked( 'zher', 'residual', function run() {
				check.assertReconstruct( sc, got, exp, { 'label': 'zher uplo='+uplo+' N='+N } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — output bit-exact across storage layouts
// (matrix triangle AND strided/negative vectors), for both uplo.
test( 'zher: bit-exact across storage layouts', function t() {
	var N = 9;
	var SEED = 0xF00D;
	var aLayouts = schemes.dense.layouts();
	var vLayouts = schemes.vectorLayouts();
	UPLOS.forEach( function eachUplo( uplo ) {
		checked( 'zher', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A0 = logical.hermitian( sc, rng, N );
				var x = values( rng, N );
				var alpha = rng.normal();

				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, aL );
				var vL = vLayouts[ idx % vLayouts.length ];
				var X = schemes.realizeVector( sc, x, vL );
				zher( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, uplo, N ) );
			}, { 'label': 'zher layout invariance uplo='+uplo } );
		});
	});
});
