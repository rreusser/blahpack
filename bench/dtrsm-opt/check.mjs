// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning
// all 16 (side, uplo, transa, diag) combos, col/row/general/negative strides
// for A and B, remainder shapes, and alpha special values. The blocked kernel
// reorders summation, so the gate is the backward-error tier
// (docs/optimization-policy.md): elementwise comparison at a tolerance scaled
// to the substitution length. The unstored triangle of A — and the diagonal
// when diag='unit' — are poisoned with NaN so any forbidden read propagates
// and fails the comparison, and A is bit-compared before/after to prove it is
// never written.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand() {
	return ( 2.0 * Math.random() ) - 1.0;
}

// Stride combo generator for a dim1 x dim2 matrix:
function combo( dim1, dim2, tag ) {
	let s1;
	let s2;
	if ( tag === 'col' ) {
		s1 = 1; s2 = Math.max( 1, dim1 );
	} else if ( tag === 'row' ) {
		s1 = Math.max( 1, dim2 ); s2 = 1;
	} else if ( tag === 'gen' ) {
		s1 = 2; s2 = ( 2 * Math.max( 1, dim1 ) ) + 3;
	} else { // 'neg'
		s1 = -1; s2 = Math.max( 1, dim1 );
	}
	const off = ( s1 < 0 ? Math.abs( s1 ) * Math.max( 0, dim1 - 1 ) : 0 ) +
		( s2 < 0 ? Math.abs( s2 ) * Math.max( 0, dim2 - 1 ) : 0 );
	const size = ( Math.abs( s1 ) * Math.max( 0, dim1 - 1 ) ) +
		( Math.abs( s2 ) * Math.max( 0, dim2 - 1 ) ) + 5;
	return { s1, s2, off, size, tag };
}

// Build a well-conditioned k x k triangular A. Everything outside the stored
// triangle is NaN; the diagonal is NaN when diag='unit' (must never be read).
function makeA( k, uplo, diag, scale, sc ) {
	const A = new Float64Array( sc.size ).fill( NaN );
	for ( let i = 0; i < k; i++ ) {
		for ( let j = 0; j < k; j++ ) {
			const stored = ( uplo === 'upper' ) ? ( j >= i ) : ( j <= i );
			if ( !stored ) { continue; }
			const idx = sc.off + ( i * sc.s1 ) + ( j * sc.s2 );
			if ( i === j ) {
				A[ idx ] = ( diag === 'unit' ) ? NaN : 1.0 + ( 0.1 * Math.random() );
			} else {
				A[ idx ] = rand() * scale;
			}
		}
	}
	return A;
}

let ncases = 0;
let failures = 0;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 12, 17, 33 ];
const stridePairs = [
	[ 'col', 'col' ], [ 'row', 'row' ], [ 'gen', 'gen' ],
	[ 'col', 'row' ], [ 'row', 'gen' ], [ 'neg', 'neg' ]
];
const alphas = [ 0.0, 1.0, 0.7, -0.2 ];

for ( const M of dims ) {
	for ( const N of dims ) {
		for ( const side of [ 'left', 'right' ] ) {
			const k = ( side === 'left' ) ? M : N;
			const scale = 0.5 / Math.max( 1, M, N );
			for ( const uplo of [ 'upper', 'lower' ] ) {
				for ( const transa of [ 'no-transpose', 'transpose' ] ) {
					for ( const diag of [ 'non-unit', 'unit' ] ) {
						for ( const [ tagA, tagB ] of stridePairs ) {
							const sa = combo( k, k, tagA );
							const sb = combo( M, N, tagB );
							const A = makeA( k, uplo, diag, scale, sa );
							const Abits = new Uint8Array( new Uint8Array( A.buffer ).slice() );
							const B = new Float64Array( sb.size );
							for ( let i = 0; i < B.length; i++ ) { B[ i ] = rand(); }
							const alpha = alphas[ ncases % alphas.length ];
							const B0 = B.slice();
							const B1 = B.slice();
							v0( side, uplo, transa, diag, M, N, alpha, A, sa.s1, sa.s2, sa.off, B0, sb.s1, sb.s2, sb.off );
							v1( side, uplo, transa, diag, M, N, alpha, A, sa.s1, sa.s2, sa.off, B1, sb.s1, sb.s2, sb.off );
							ncases += 1;

							// A must never be written (bit-compare, NaN-safe):
							const Anow = new Uint8Array( A.buffer );
							let awrote = false;
							for ( let i = 0; i < Anow.length; i++ ) {
								if ( Anow[ i ] !== Abits[ i ] ) { awrote = true; break; }
							}
							if ( awrote ) {
								failures += 1;
								console.log( `FAIL(A written) ${side} ${uplo} ${transa} ${diag} M=${M} N=${N} A:${tagA} B:${tagB} a=${alpha}` );
								continue;
							}

							// Elementwise compare full B storage:
							const tol = 1.0e-12 * Math.max( 4, M, N );
							let bad = -1;
							for ( let i = 0; i < B0.length; i++ ) {
								if ( !( Math.abs( B0[ i ] - B1[ i ] ) <= tol * Math.max( 1.0, Math.abs( B0[ i ] ) ) ) ) { bad = i; break; }
							}
							if ( bad >= 0 ) {
								failures += 1;
								console.log( `FAIL ${side} ${uplo} ${transa} ${diag} M=${M} N=${N} A:${tagA} B:${tagB} a=${alpha}: B[${bad}] v0=${B0[ bad ]} v1=${B1[ bad ]}` );
							}
						}
					}
				}
			}
		}
	}
}

// Run all four alphas over a subset to make sure each alpha is exercised for
// each combo class (the main sweep cycles alphas by case index):
for ( const alpha of alphas ) {
	for ( const side of [ 'left', 'right' ] ) {
		for ( const uplo of [ 'upper', 'lower' ] ) {
			for ( const transa of [ 'no-transpose', 'transpose' ] ) {
				for ( const diag of [ 'non-unit', 'unit' ] ) {
					const M = 12;
					const N = 17;
					const k = ( side === 'left' ) ? M : N;
					const sa = combo( k, k, 'col' );
					const sb = combo( M, N, 'col' );
					const A = makeA( k, uplo, diag, 0.5 / 17, sa );
					const B = new Float64Array( sb.size );
					for ( let i = 0; i < B.length; i++ ) { B[ i ] = rand(); }
					const B0 = B.slice();
					const B1 = B.slice();
					v0( side, uplo, transa, diag, M, N, alpha, A, sa.s1, sa.s2, sa.off, B0, sb.s1, sb.s2, sb.off );
					v1( side, uplo, transa, diag, M, N, alpha, A, sa.s1, sa.s2, sa.off, B1, sb.s1, sb.s2, sb.off );
					ncases += 1;
					const tol = 1.0e-12 * 17;
					let bad = -1;
					for ( let i = 0; i < B0.length; i++ ) {
						if ( !( Math.abs( B0[ i ] - B1[ i ] ) <= tol * Math.max( 1.0, Math.abs( B0[ i ] ) ) ) ) { bad = i; break; }
					}
					if ( bad >= 0 ) {
						failures += 1;
						console.log( `FAIL(alpha sweep) ${side} ${uplo} ${transa} ${diag} a=${alpha}: B[${bad}] v0=${B0[ bad ]} v1=${B1[ bad ]}` );
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
