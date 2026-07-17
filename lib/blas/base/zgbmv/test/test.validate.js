/**
* Property-based validation for zgbmv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gb` -> general BANDED
* (schemes.banded with kl/ku, logical.banded); `mv` (matrix-vector) -> residual
* property `y = alpha*op(A)*x + beta*y` against the independent matvec oracle,
* with op(A) the M-by-N band matrix (kl sub-, ku super-diagonals).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgbmv from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

// trans flag -> reference transpose code and operand-length selectors.
var TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// no-transpose: x len N, y len M. transpose/conj: x len M, y len N.
function xLen( code, m, n ) {
	return ( code === 'n' ) ? n : m;
}
function yLen( code, m, n ) {
	return ( code === 'n' ) ? m : n;
}

// Bounded size subset (straddles unrolled-remainder crossovers, includes 0).
var MN = SIZES.filter( function keep( s ) {
	return s <= 17;
}); // [ 0, 1, 2, 3, 4, 5, 7, 8, 15, 16, 17 ]

// Unique bandwidths in {0,1,2, min(M,N)-1} clamped to [0, hi].
function bands( m, n, hi ) {
	var mn = Math.min( m, n ) - 1;
	var out = [];
	[ 0, 1, 2, mn ].forEach( function each( k ) {
		var v = Math.max( 0, Math.min( hi, k ) );
		if ( out.indexOf( v ) === -1 ) {
			out.push( v );
		}
	});
	return out;
}

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

// Steps 2-3-5: residual over trans x (M,N) x (KL,KU) sweep (incl rectangular,
// diagonal KL=KU=0, near-full bands, and M=0/N=0 edges), with random alpha,beta
// plus the beta=0 and beta=1 corner cases.
test( 'zgbmv: banded matrix-vector residual (trans x M x N x KL x KU sweep)', function t() {
	TRANS.forEach( function eachTrans( tr ) {
		var trans = tr[ 0 ];
		var code = tr[ 1 ];
		MN.forEach( function eachM( M ) {
			MN.forEach( function eachN( N ) {
				bands( M, N, M - 1 ).forEach( function eachKL( KL ) {
					bands( M, N, N - 1 ).forEach( function eachKU( KU ) {
						var rng = new RNG( 0x100 + ( M * 1000 ) + ( N * 10 ) + ( KL * 3 ) + KU );
						var A = logical.banded( sc, rng, M, N, KL, KU );
						var nx = xLen( code, M, N );
						var ny = yLen( code, M, N );
						var x = [];
						var y = [];
						var i;
						for ( i = 0; i < nx; i++ ) {
							x.push( sc.random( rng ) );
						}
						for ( i = 0; i < ny; i++ ) {
							y.push( sc.random( rng ) );
						}
						var betaCases = [ sc.random( rng ), sc.zero, sc.one ];
						betaCases.forEach( function eachBeta( beta ) {
							var alpha = sc.random( rng );
							var R = schemes.banded.realize( sc, A, { 'kl': KL, 'ku': KU }, schemes.banded.layouts()[ 0 ] );
							var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
							var Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
							zgbmv( trans, M, N, KL, KU, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
							var ax = ref.matvec( sc, A, x, { 'trans': code } );
							// Reference BLAS quick-returns for degenerate dims: when
							// M===0 or N===0 the routine performs NO operation (y left
							// untouched — beta NOT applied), so expected == y0.
							var noop = ( M === 0 || N === 0 );
							var expected = [];
							var got = [];
							for ( i = 0; i < ny; i++ ) {
								expected.push( noop ? y[ i ] : sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y[ i ] ) ) );
								got.push( Y.read( i ) );
							}
							checked( 'zgbmv', 'residual', function run() {
								assertResidual( got, expected, 'zgbmv '+trans+' M='+M+' N='+N+' KL='+KL+' KU='+KU, Math.max( M, N ) );
							});
						});
					});
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. The gbmv kernel picks its summation form by
// `trans` alone (no-transpose = axpy accumulation into y; transpose/conj = dot
// accumulation into a temp), and in BOTH forms the inner sum runs over i in
// ascending order independent of the band-array strides. Changing only
// addressing (band-array layout, and strided/negative x,y) must therefore
// reproduce output BIT-FOR-BIT across ALL layouts for a fixed trans — no
// col/row family split is required (verified: the test passes with every band
// layout compared together).
test( 'zgbmv: output is bit-exact across storage layouts', function t() {
	var M = 9;
	var N = 7;
	var KL = 2;
	var KU = 3;
	var SEED = 0xF00D;
	var vLayouts = schemes.vectorLayouts();
	var aLayouts = schemes.banded.layouts();
	TRANS.forEach( function eachTrans( tr ) {
		var trans = tr[ 0 ];
		var code = tr[ 1 ];
		var nx = xLen( code, M, N );
		var ny = yLen( code, M, N );
		checked( 'zgbmv', 'layout-invariance', function run() {
			layoutInvariant( aLayouts, function build( aL, idx ) {
				var rng = new RNG( SEED ); // identical values every variant
				var A = logical.banded( sc, rng, M, N, KL, KU );
				var x = [];
				var y = [];
				var i;
				for ( i = 0; i < nx; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < ny; i++ ) {
					y.push( sc.random( rng ) );
				}
				var alpha = sc.random( rng );
				var beta = sc.random( rng );
				var R = schemes.banded.realize( sc, A, { 'kl': KL, 'ku': KU }, aL );
				var vL = vLayouts[ idx % vLayouts.length ];
				var X = schemes.realizeVector( sc, x, vL );
				var Y = schemes.realizeVector( sc, y, vL );
				zgbmv( trans, M, N, KL, KU, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				var out = new LogicalMatrix( sc, ny, 1 );
				for ( i = 0; i < ny; i++ ) {
					out.set( i, 0, Y.read( i ) );
				}
				return check.flattenLogical( sc, out );
			}, { 'label': 'zgbmv '+trans+' layout invariance' } );
		});
	});
});
