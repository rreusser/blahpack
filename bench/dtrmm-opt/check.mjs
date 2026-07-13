// Correctness gate: v1-tiled vs v0-reference over the full (side, uplo,
// transa, diag) case table, col/row/general (and negative) strides for A and
// B, shapes with M != N, and alpha special values. The tiled kernel reorders
// summation, so the gate is the backward-error tier
// (docs/optimization-policy.md): elementwise comparison of the FULL B storage
// (catching stray writes) at a tolerance scaled to the reduction length.
// Also verifies A storage is bit-identical after the v1 call (A is
// read-only, and only the stored triangle may be read — the untouched
// triangle is filled with random garbage so any illegal read shows up as a
// mismatch vs v0).
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

let ncases = 0;
let failures = 0;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 12, 17, 33 ];
const alphas = [ 0.0, 1.0, 0.7, -0.2 ];

// Stride combos for a K x K matrix (A) or M x N matrix (B):
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
	// Base offset 3 exercises nonzero offsets; negative strides need room:
	return 3 +
		( s1 < 0 ? Math.abs( s1 ) * Math.max( d1 - 1, 0 ) : 0 ) +
		( s2 < 0 ? Math.abs( s2 ) * Math.max( d2 - 1, 0 ) : 0 );
}

function sizeFor( s1, s2, d1, d2 ) {
	return ( Math.abs( s1 ) * Math.max( d1, 1 ) ) + ( Math.abs( s2 ) * Math.max( d2, 1 ) ) + 8;
}

for ( const side of [ 'left', 'right' ] ) {
	for ( const uplo of [ 'upper', 'lower' ] ) {
		for ( const transa of [ 'no-transpose', 'transpose' ] ) {
			for ( const diag of [ 'unit', 'non-unit' ] ) {
				for ( const M of dims ) {
					for ( const N of dims ) {
						const K = ( side === 'left' ) ? M : N; // A is K x K
						for ( const la of layoutsA( K ) ) {
							for ( const lb of layoutsB( M, N ) ) {
								// Run negative-stride layouts on a subset to bound runtime:
								if ( ( la.tag === 'neg' || lb.tag === 'neg' ) && Math.max( M, N ) > 12 ) continue;
								const alpha = alphas[ ncases % alphas.length ];
								const oa = offsetFor( la.s1, la.s2, K, K );
								const ob = offsetFor( lb.s1, lb.s2, M, N );
								// Full random storage: garbage in the unstored triangle and
								// on the diagonal (for diag='unit') must never be read.
								const A = rand( oa + sizeFor( la.s1, la.s2, K, K ) );
								const B = rand( ob + sizeFor( lb.s1, lb.s2, M, N ) );
								const B0 = B.slice();
								const B1 = B.slice();
								const Aorig = A.slice();
								v0( side, uplo, transa, diag, M, N, alpha, A, la.s1, la.s2, oa, B0, lb.s1, lb.s2, ob );
								v1( side, uplo, transa, diag, M, N, alpha, A, la.s1, la.s2, oa, B1, lb.s1, lb.s2, ob );
								ncases += 1;
								// A must never be written:
								for ( let i = 0; i < A.length; i++ ) {
									if ( A[ i ] !== Aorig[ i ] ) {
										failures += 1;
										console.log( `FAIL (A modified) ${side}/${uplo}/${transa}/${diag} M=${M} N=${N} A:${la.tag} B:${lb.tag} a=${alpha}: A[${i}]` );
										break;
									}
								}
								const tol = 1.0e-14 * Math.max( 4, Math.max( M, N ) );
								let bad = -1;
								for ( let i = 0; i < B0.length; i++ ) {
									if ( !( Math.abs( B0[ i ] - B1[ i ] ) <= tol * Math.max( 1.0, Math.abs( B0[ i ] ) ) ) ) { bad = i; break; }
								}
								if ( bad >= 0 ) {
									failures += 1;
									console.log( `FAIL ${side}/${uplo}/${transa}/${diag} M=${M} N=${N} A:${la.tag} B:${lb.tag} a=${alpha}: B[${bad}] v0=${B0[ bad ]} v1=${B1[ bad ]}` );
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
