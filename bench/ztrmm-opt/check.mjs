// Correctness gate: v1-tiled vs v0-reference over the full (side, uplo,
// transa, diag) case table, col/row/general (and negative) strides for A and
// B, shapes with M != N, and complex-alpha special values. The tiled kernel
// reorders summation, so the gate is the backward-error tier
// (docs/optimization-policy.md): elementwise NaN-aware relative comparison of
// the FULL B storage (interleaved re/im doubles — catching stray writes) at a
// tolerance scaled to the reduction length. Also verifies A storage is
// bit-identical after the v1 call (A is read-only; the untouched triangle is
// random garbage, so any illegal read shows up as a mismatch vs v0).
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';

// Random interleaved re/im buffer of `nc` complex elements:
function randz( nc ) {
	const b = new Float64Array( 2 * nc );
	for ( let i = 0; i < b.length; i++ ) b[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return b;
}

let ncases = 0;
let failures = 0;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 64 ];
const alphas = [
	new Complex128( 0.0, 0.0 ),
	new Complex128( 1.0, 0.0 ),
	new Complex128( 0.7, -0.4 )
];

// Stride combos (in complex elements) for a K x K matrix (A) or M x N (B):
const layoutsA = ( K ) => [
	{ s1: 1, s2: Math.max( K, 1 ), tag: 'col' },
	{ s1: Math.max( K, 1 ), s2: 1, tag: 'row' },
	{ s1: 2, s2: ( 2 * Math.max( K, 1 ) ) + 3, tag: 'gen' },
	{ s1: -1, s2: Math.max( K, 1 ), tag: 'neg' }
];
const layoutsB = ( M, N ) => [
	{ s1: 1, s2: Math.max( M, 1 ), tag: 'col' },
	{ s1: Math.max( N, 1 ), s2: 1, tag: 'row' },
	{ s1: 2, s2: ( 2 * Math.max( M, 1 ) ) + 3, tag: 'gen' },
	{ s1: Math.max( N, 1 ), s2: -1, tag: 'neg' }
];

function offsetFor( s1, s2, d1, d2 ) {
	return 3 +
		( s1 < 0 ? Math.abs( s1 ) * Math.max( d1 - 1, 0 ) : 0 ) +
		( s2 < 0 ? Math.abs( s2 ) * Math.max( d2 - 1, 0 ) : 0 );
}
function sizeFor( s1, s2, d1, d2 ) {
	return ( Math.abs( s1 ) * Math.max( d1, 1 ) ) + ( Math.abs( s2 ) * Math.max( d2, 1 ) ) + 8;
}

for ( const side of [ 'left', 'right' ] ) {
	for ( const uplo of [ 'upper', 'lower' ] ) {
		for ( const transa of [ 'no-transpose', 'transpose', 'conjugate-transpose' ] ) {
			for ( const diag of [ 'unit', 'non-unit' ] ) {
				for ( const M of dims ) {
					for ( const N of dims ) {
						const K = ( side === 'left' ) ? M : N; // A is K x K
						for ( const la of layoutsA( K ) ) {
							for ( const lb of layoutsB( M, N ) ) {
								// Bound runtime on the largest shapes:
								if ( ( la.tag === 'neg' || lb.tag === 'neg' ) && Math.max( M, N ) > 17 ) continue;
								if ( Math.max( M, N ) > 17 && ( la.tag === 'gen' || lb.tag === 'gen' ) ) continue;
								const alpha = alphas[ ncases % alphas.length ];
								const oa = offsetFor( la.s1, la.s2, K, K );
								const ob = offsetFor( lb.s1, lb.s2, M, N );
								const Abuf = randz( oa + sizeFor( la.s1, la.s2, K, K ) );
								const Bbuf = randz( ob + sizeFor( lb.s1, lb.s2, M, N ) );
								const A0 = new Complex128Array( Abuf.slice() );
								const A1 = new Complex128Array( Abuf.slice() );
								const B0 = new Complex128Array( Bbuf.slice() );
								const B1 = new Complex128Array( Bbuf.slice() );
								v0( side, uplo, transa, diag, M, N, alpha, A0, la.s1, la.s2, oa, B0, lb.s1, lb.s2, ob );
								v1( side, uplo, transa, diag, M, N, alpha, A1, la.s1, la.s2, oa, B1, lb.s1, lb.s2, ob );
								ncases += 1;

								// A must never be written:
								const a0 = reinterpret( A0, 0 );
								const a1 = reinterpret( A1, 0 );
								let amod = -1;
								for ( let i = 0; i < a0.length; i++ ) {
									if ( a0[ i ] !== Abuf[ i ] || a1[ i ] !== Abuf[ i ] ) { amod = i; break; }
								}
								if ( amod >= 0 ) {
									failures += 1;
									console.log( `FAIL (A modified) ${side}/${uplo}/${transa}/${diag} M=${M} N=${N} A:${la.tag} B:${lb.tag}: idx ${amod}` );
								}

								const f0 = reinterpret( B0, 0 );
								const f1 = reinterpret( B1, 0 );
								const tol = 1.0e-13 * Math.max( 4, Math.max( M, N ) );
								let bad = -1;
								for ( let i = 0; i < f0.length; i++ ) {
									const x = f0[ i ];
									const y = f1[ i ];
									const ok = Number.isNaN( x ) ? Number.isNaN( y ) : ( Math.abs( x - y ) <= tol * Math.max( 1.0, Math.abs( x ) ) );
									if ( !ok ) { bad = i; break; }
								}
								if ( bad >= 0 ) {
									failures += 1;
									console.log( `FAIL ${side}/${uplo}/${transa}/${diag} M=${M} N=${N} A:${la.tag} B:${lb.tag} a=(${alpha.re},${alpha.im}): B[${bad}] v0=${f0[ bad ]} v1=${f1[ bad ]}` );
								}
							}
						}
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
