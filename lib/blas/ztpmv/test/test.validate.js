/**
* Property-based validation for ztpmv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tp` -> triangular packed
* (schemes.packed, logical.triangular); `mv` (matrix-vector) -> residual property
* `x := op(A)*x` against the independent matvec oracle over the FULL logical A.
* The complex seam exercises 'conjugate-transpose' as a distinct operation.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import ztpmv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const DIAG = [ 'non-unit', 'unit' ];

// trans flag -> reference transpose code.
const TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

// Scaled residual assertion mirroring dtrmv / dspmv (component-wise, so it works
// for the complex trait via sc.components).
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

// Steps 2a-5: residual over uplo x trans x diag x N sweep (incl N=0,1).
test( 'ztpmv: triangular packed matrix-vector residual (uplo x trans x diag x N sweep)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			const code = tr[ 1 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				SIZES.forEach( function eachN( N ) {
					const rng = new RNG( 0x100 + N );
					const A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
					const x = [];
					let i;
					for ( i = 0; i < N; i++ ) {
						x.push( sc.random( rng ) );
					}
					const AP = schemes.packed.realize( sc, A, { 'part': uplo, 'unit': unit }, schemes.packed.layouts()[ 0 ] );
					const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
					ztpmv( uplo, trans, diag, N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ] );
					const expected = ref.matvec( sc, A, x, { 'trans': code } );
					const got = [];
					for ( i = 0; i < N; i++ ) {
						got.push( X.read( i ) );
					}
					checked( 'ztpmv', 'residual', function run() {
						assertResidual( got, expected, 'ztpmv '+uplo+' '+trans+' '+diag+' N='+N, N );
					});
				});
			});
		});
	});
});

// Step 3: layout-invariance fuzz — the packed kernel's accumulation order is
// fixed by (uplo, trans) alone (it walks the packed array linearly with
// strideAP), so output must be bit-exact across ALL packed AP layouts (incl.
// negative packed strides) and strided/negative x vectors. No kernel-form
// family split is required.
test( 'ztpmv: output is bit-exact across storage layouts (packed AP + strided/negative vectors)', function t() {
	const N = 9;
	const SEED = 0xF11E;
	const apLayouts = schemes.packed.layouts();
	const vLayouts = schemes.vectorLayouts();
	UPLO.forEach( function eachUplo( uplo ) {
		TRANS.forEach( function eachTrans( tr ) {
			const trans = tr[ 0 ];
			DIAG.forEach( function eachDiag( diag ) {
				const unit = ( diag === 'unit' );
				checked( 'ztpmv', 'layout-invariance', function run() {
					layoutInvariant( apLayouts, function build( apL, idx ) {
						const rng = new RNG( SEED ); // identical values every variant
						const A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
						const x = [];
						let i;
						for ( i = 0; i < N; i++ ) {
							x.push( sc.random( rng ) );
						}
						const AP = schemes.packed.realize( sc, A, { 'part': uplo, 'unit': unit }, apL );
						const vL = vLayouts[ idx % vLayouts.length ];
						const X = schemes.realizeVector( sc, x, vL );
						ztpmv( uplo, trans, diag, N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ] );
						const out = new LogicalMatrix( sc, N, 1 );
						for ( i = 0; i < N; i++ ) {
							out.set( i, 0, X.read( i ) );
						}
						return check.flattenLogical( sc, out );
					}, { 'label': 'ztpmv '+uplo+' '+trans+' '+diag+' layout invariance' } );
				});
			});
		});
	});
});
