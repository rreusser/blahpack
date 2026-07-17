/**
* Property-based validation for dsyr, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense, one
* triangle referenced (schemes.dense with part=uplo, logical.symmetric);
* symmetric rank-1 update `A := alpha*x*x**T + A` validated by direct residual
* against an independent oracle `A(i,j) += alpha*x_i*x_j` over the referenced
* triangle only (the other triangle stays poisoned and is never read).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsyr from './../lib/ndarray.js';

var sc = S.real; // d-routine
var CONJ = false; // A := alpha*x*x**T + A (no conjugation)
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
test( 'dsyr: symmetric rank-1 update residual (size + uplo sweep, incl. alpha=0)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES.forEach( function eachN( N ) {
			var rng = new RNG( 0x100 + N );
			var A0 = logical.symmetric( sc, rng, N );
			var x = values( rng, N );
			var alpha = ( N % 8 === 0 ) ? 0.0 : rng.normal(); // includes alpha=0

			var R = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
			var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
			dsyr( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );

			var got = readTri( R, uplo, N );
			var exp = expectedTri( A0, alpha, x, uplo, N );
			checked( 'dsyr', 'residual', function run() {
				check.assertReconstruct( sc, got, exp, { 'label': 'dsyr uplo='+uplo+' N='+N } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — output bit-exact across storage layouts
// (matrix triangle AND strided/negative vectors), for both uplo.
test( 'dsyr: bit-exact across storage layouts', function t() {
	var N = 9;
	var SEED = 0xF00D;
	var aLayouts = schemes.dense.layouts();
	var vLayouts = schemes.vectorLayouts();
	UPLOS.forEach( function eachUplo( uplo ) {
		checked( 'dsyr', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A0 = logical.symmetric( sc, rng, N );
				var x = values( rng, N );
				var alpha = rng.normal();

				var R = schemes.dense.realize( sc, A0, { 'part': uplo }, aL );
				var vL = vLayouts[ idx % vLayouts.length ];
				var X = schemes.realizeVector( sc, x, vL );
				dsyr( uplo, N, alpha, X.data, X.args[ 0 ], X.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				return check.flattenLogical( sc, readTri( R, uplo, N ) );
			}, { 'label': 'dsyr layout invariance uplo='+uplo } );
		});
	});
});
