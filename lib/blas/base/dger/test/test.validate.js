/**
* Property-based validation for dger, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); rank-1 update `A := alpha*x*y**T + A`
* validated by direct residual against an independent oracle
* `A(i,j) += alpha*x_i*y_j`.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dger from './../lib/ndarray.js';

var sc = S.real; // d-routine
var CONJ = false; // A := alpha*x*y**T + A (no conjugation)
var LogicalMatrix = logical.LogicalMatrix;

// Read the updated matrix back out of physical storage into a LogicalMatrix.
function readMatrix( R, m, n ) {
	var G = new LogicalMatrix( sc, m, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			G.set( i, j, R.read( i, j ) );
		}
	}
	return G;
}

// Independent oracle: expected(i,j) = A0(i,j) + alpha*x_i*(conj?)y_j.
function expected( A0, alpha, x, y, m, n ) {
	var E = new LogicalMatrix( sc, m, n );
	var yj;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		yj = CONJ ? sc.conj( y[ j ] ) : y[ j ];
		for ( i = 0; i < m; i++ ) {
			E.set( i, j, sc.add( A0.get( i, j ), sc.mul( alpha, sc.mul( x[ i ], yj ) ) ) );
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

// Steps 2-3-5: residual across a full (M,N) size sweep incl. rectangular + 0.
test( 'dger: rank-1 update residual (size sweep MxN, incl. alpha=0)', function t() {
	SIZES.forEach( function eachM( M ) {
		SIZES.forEach( function eachN( N ) {
			var rng = new RNG( 0x100 + ( M * 100 ) + N ); // reproducible
			var A0 = logical.general( sc, rng, M, N );
			var x = values( rng, M );
			var y = values( rng, N );
			var alpha = ( ( ( M * 7 ) + N ) % 11 === 0 ) ? sc.zero : sc.random( rng );

			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
			var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
			var Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
			dger( M, N, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );

			var got = readMatrix( R, M, N );
			var exp = expected( A0, alpha, x, y, M, N );
			checked( 'dger', 'residual', function run() {
				check.assertReconstruct( sc, got, exp, { 'label': 'dger M='+M+' N='+N } );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — output must be bit-exact across storage
// layouts (matrix AND strided/negative vectors).
test( 'dger: bit-exact across storage layouts', function t() {
	var M = 7;
	var N = 5;
	var SEED = 0xF00D;
	var aLayouts = schemes.dense.layouts();
	var vLayouts = schemes.vectorLayouts();
	checked( 'dger', 'layout-invariance', function run() {
		layoutInvariant( aLayouts, function build( aL, idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var x = values( rng, M );
			var y = values( rng, N );
			var alpha = sc.random( rng );

			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, aL );
			var vL = vLayouts[ idx % vLayouts.length ];
			var X = schemes.realizeVector( sc, x, vL );
			var Y = schemes.realizeVector( sc, y, vL );
			dger( M, N, sc.apiScalar( alpha ), X.data, X.args[ 0 ], X.args[ 1 ], Y.data, Y.args[ 0 ], Y.args[ 1 ], R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
			return check.flattenLogical( sc, readMatrix( R, M, N ) );
		}, { 'label': 'dger layout invariance' } );
	});
});
