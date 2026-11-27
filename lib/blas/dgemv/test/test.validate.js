/**
* Property-based validation for dgemv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> dense general
* (schemes.dense, logical.general); `mv` (matrix-vector) -> residual property
* `y = alpha*op(A)*x + beta*y` against the independent matvec oracle.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dgemv from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

// trans flag -> reference transpose code and operand-length selector.
const TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];

function xLen( code, m, n ) {
	return ( code === 'n' ) ? n : m;
}
function yLen( code, m, n ) {
	return ( code === 'n' ) ? m : n;
}

// Scaled residual assertion mirroring test.harness.js dspmv.
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

// Steps 2-3-5: residual over trans x (M,N) size sweep (incl rectangular + 0),
// with random alpha,beta plus the beta=0 and beta=1 corner cases.
test( 'dgemv: matrix-vector residual (trans x M x N sweep)', function t() {
	TRANS.forEach( function eachTrans( tr ) {
		const trans = tr[ 0 ];
		const code = tr[ 1 ];
		SIZES.forEach( function eachM( M ) {
			SIZES.forEach( function eachN( N ) {
				const rng = new RNG( 0x100 + ( M * 100 ) + N );
				const A = logical.general( sc, rng, M, N );
				const nx = xLen( code, M, N );
				const ny = yLen( code, M, N );
				const x = [];
				const y = [];
				let i;
				for ( i = 0; i < nx; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < ny; i++ ) {
					y.push( sc.random( rng ) );
				}
				const betaCases = [ sc.random( rng ), sc.zero, sc.one ];
				betaCases.forEach( function eachBeta( beta ) {
					const alpha = sc.random( rng );
					const R = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
					const X = schemes.realizeVector( sc, x, { 'stride': 1 } );
					const Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
					dgemv( trans, M, N, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
					const ax = ref.matvec( sc, A, x, { 'trans': code } );
					// Reference BLAS quick-returns for degenerate dimensions:
					// when M===0 or N===0 the routine performs NO operation (y is
					// left untouched — beta is NOT applied), so expected == y0.
					const noop = ( M === 0 || N === 0 );
					const expected = [];
					const got = [];
					for ( i = 0; i < ny; i++ ) {
						expected.push( noop ? y[ i ] : sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y[ i ] ) ) );
						got.push( Y.read( i ) );
					}
					checked( 'dgemv', 'residual', function run() {
						assertResidual( got, expected, 'dgemv '+trans+' M='+M+' N='+N, Math.max( M, N ) );
					});
				});
			});
		});
	});
});

// The optimized kernel picks one of two summation orders — a "dot" form when
// B=op(A)'s second logical stride is the smaller (|sb2| <= |sb1|), else an
// "axpy" form (see lib/base.js). The two forms reorder the sum, so output is
// bit-exact ONLY within a single form (e.g. all column-major vs all row-major
// differ by ~1e-16 while the residual property holds — verified above at a
// backward-error tolerance, per the kernel's documented contract). We therefore
// split the dense layouts into kernel-form families and assert bit-exactness
// within each family.
function kernelForm( trans, layout, M, N ) {
	const R = schemes.dense.realize( sc, new LogicalMatrix( sc, M, N ), { 'part': 'full' }, layout );
	const sA1 = R.args[ 0 ];
	const sA2 = R.args[ 1 ];
	const sb1 = ( trans === 'no-transpose' ) ? sA1 : sA2;
	const sb2 = ( trans === 'no-transpose' ) ? sA2 : sA1;
	return ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) ? 'dot' : 'axpy';
}

// Step 4: layout-invariance fuzz — output bit-exact across A layouts and
// strided/negative x,y vectors, within a kernel-form family.
test( 'dgemv: output is bit-exact across storage layouts (per kernel form)', function t() {
	const M = 7;
	const N = 5;
	const SEED = 0xF00D;
	const vLayouts = schemes.vectorLayouts();
	TRANS.forEach( function eachTrans( tr ) {
		const trans = tr[ 0 ];
		const code = tr[ 1 ];
		const nx = xLen( code, M, N );
		const ny = yLen( code, M, N );
		[ 'dot', 'axpy' ].forEach( function eachForm( form ) {
			const aLayouts = schemes.dense.layouts().filter( function keep( L ) {
				return kernelForm( trans, L, M, N ) === form;
			});
			if ( aLayouts.length < 2 ) {
				return; // need >= 2 layouts to compare
			}
			checked( 'dgemv', 'layout-invariance', function run() {
				layoutInvariant( aLayouts, function build( aL, idx ) {
				const rng = new RNG( SEED ); // identical values every variant
				const A = logical.general( sc, rng, M, N );
				const x = [];
				const y = [];
				let i;
				for ( i = 0; i < nx; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < ny; i++ ) {
					y.push( sc.random( rng ) );
				}
				const alpha = sc.random( rng );
				const beta = sc.random( rng );
				const R = schemes.dense.realize( sc, A, { 'part': 'full' }, aL );
				const vL = vLayouts[ idx % vLayouts.length ];
				const X = schemes.realizeVector( sc, x, vL );
				const Y = schemes.realizeVector( sc, y, vL );
				dgemv( trans, M, N, sc.apiScalar( alpha ), R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				const out = new LogicalMatrix( sc, ny, 1 );
				for ( i = 0; i < ny; i++ ) {
					out.set( i, 0, Y.read( i ) );
				}
				return check.flattenLogical( sc, out );
			}, { 'label': 'dgemv '+trans+' '+form+'-form layout invariance' } );
			});
		});
	});
});
