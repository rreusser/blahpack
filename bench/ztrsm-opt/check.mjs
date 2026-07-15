// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning all
// 24 (side, uplo, transa in {N,T,C}, diag) combos, col/row/general/negative
// strides for A and B, remainder shapes, and complex-alpha special values.
//
// The blocked kernel reorders summation, so the gate is the backward-error
// tier (docs/optimization-policy.md): elementwise comparison over the full B
// storage at a NaN-aware relative tolerance scaled to the substitution length.
// The unstored triangle of A -- and the diagonal when diag='unit' -- is
// poisoned with NaN so any forbidden read propagates and fails the comparison,
// and A's backing buffer is bit-compared before/after to prove A is never
// written.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand() {
	return ( 2.0 * Math.random() ) - 1.0;
}

// Stride combo generator for a dim1 x dim2 matrix (strides in COMPLEX elements):
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

// Build a well-conditioned k x k complex triangular A as a Complex128Array.
// Everything outside the stored triangle is NaN; the diagonal is NaN when
// diag='unit' (must never be read).
function makeA( k, uplo, diag, scale, sc ) {
	const buf = new Float64Array( sc.size * 2 ).fill( NaN );
	for ( let i = 0; i < k; i++ ) {
		for ( let j = 0; j < k; j++ ) {
			const stored = ( uplo === 'upper' ) ? ( j >= i ) : ( j <= i );
			if ( !stored ) { continue; }
			const idx = ( sc.off + ( i * sc.s1 ) + ( j * sc.s2 ) ) * 2;
			if ( i === j ) {
				if ( diag === 'unit' ) {
					buf[ idx ] = NaN; buf[ idx + 1 ] = NaN;
				} else {
					// Diagonally dominant, well away from zero:
					buf[ idx ] = 1.0 + ( 0.1 * Math.random() );
					buf[ idx + 1 ] = 0.1 * Math.random();
				}
			} else {
				buf[ idx ] = rand() * scale;
				buf[ idx + 1 ] = rand() * scale;
			}
		}
	}
	return new Complex128Array( buf );
}

function randB( sc ) {
	const buf = new Float64Array( sc.size * 2 );
	for ( let i = 0; i < buf.length; i++ ) { buf[ i ] = rand(); }
	return new Complex128Array( buf );
}

let ncases = 0;
let failures = 0;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 64 ];
const stridePairs = [
	[ 'col', 'col' ], [ 'row', 'row' ], [ 'gen', 'gen' ],
	[ 'col', 'row' ], [ 'row', 'gen' ], [ 'neg', 'neg' ]
];
const alphas = [
	new Complex128( 0.0, 0.0 ),
	new Complex128( 1.0, 0.0 ),
	new Complex128( 0.7, -0.4 ),
	new Complex128( -0.2, 0.9 )
];
const transas = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];

function run( label, side, uplo, transa, diag, M, N, alpha, A, sa, B0, B1, sb, tol ) {
	const Abits = new Uint8Array( new Uint8Array( reinterpretBuffer( A ) ).slice() );
	v0( side, uplo, transa, diag, M, N, alpha, A, sa.s1, sa.s2, sa.off, B0, sb.s1, sb.s2, sb.off );
	// A must survive v0 untouched too (v0 is the oracle); restore not needed
	// because both read the same A, but assert v0 did not write it:
	v1( side, uplo, transa, diag, M, N, alpha, A, sa.s1, sa.s2, sa.off, B1, sb.s1, sb.s2, sb.off );
	ncases += 1;

	const Anow = new Uint8Array( reinterpretBuffer( A ) );
	for ( let i = 0; i < Anow.length; i++ ) {
		if ( Anow[ i ] !== Abits[ i ] ) {
			failures += 1;
			console.log( `FAIL(A written) ${label}` );
			return;
		}
	}
	const b0 = reinterpretView( B0 );
	const b1 = reinterpretView( B1 );
	let bad = -1;
	for ( let i = 0; i < b0.length; i++ ) {
		if ( !( Math.abs( b0[ i ] - b1[ i ] ) <= tol * Math.max( 1.0, Math.abs( b0[ i ] ) ) ) ) {
			if ( Number.isNaN( b0[ i ] ) && Number.isNaN( b1[ i ] ) ) { continue; }
			bad = i; break;
		}
	}
	if ( bad >= 0 ) {
		failures += 1;
		console.log( `FAIL ${label}: B[${bad}] v0=${b0[ bad ]} v1=${b1[ bad ]}` );
	}
}

// Complex128Array underlying Float64 buffer as a Float64Array view:
function reinterpretView( z ) {
	return new Float64Array( z.buffer, z.byteOffset, z.length * 2 );
}
function reinterpretBuffer( z ) {
	return new Uint8Array( z.buffer, z.byteOffset, z.length * 16 );
}

for ( const M of dims ) {
	for ( const N of dims ) {
		for ( const side of [ 'left', 'right' ] ) {
			const k = ( side === 'left' ) ? M : N;
			const scale = 0.5 / Math.max( 1, M, N );
			for ( const uplo of [ 'upper', 'lower' ] ) {
				for ( const transa of transas ) {
					for ( const diag of [ 'non-unit', 'unit' ] ) {
						for ( const [ tagA, tagB ] of stridePairs ) {
							const sa = combo( k, k, tagA );
							const sb = combo( M, N, tagB );
							const A = makeA( k, uplo, diag, scale, sa );
							const Bseed = randB( sb );
							const B0 = new Complex128Array( reinterpretView( Bseed ).slice() );
							const B1 = new Complex128Array( reinterpretView( Bseed ).slice() );
							const alpha = alphas[ ncases % alphas.length ];
							const tol = 1.0e-12 * Math.max( 4, M, N );
							run(
								`${side} ${uplo} ${transa} ${diag} M=${M} N=${N} A:${tagA} B:${tagB} a=(${alpha.re},${alpha.im})`,
								side, uplo, transa, diag, M, N, alpha, A, sa, B0, B1, sb, tol
							);
						}
					}
				}
			}
		}
	}
}

// Exercise every alpha against every (side,uplo,transa,diag) at a tile-spanning
// shape so no alpha class is left untested for a combo:
for ( const alpha of alphas ) {
	for ( const side of [ 'left', 'right' ] ) {
		for ( const uplo of [ 'upper', 'lower' ] ) {
			for ( const transa of transas ) {
				for ( const diag of [ 'non-unit', 'unit' ] ) {
					const M = 17;
					const N = 12;
					const k = ( side === 'left' ) ? M : N;
					const sa = combo( k, k, 'col' );
					const sb = combo( M, N, 'col' );
					const A = makeA( k, uplo, diag, 0.5 / 17, sa );
					const Bseed = randB( sb );
					const B0 = new Complex128Array( reinterpretView( Bseed ).slice() );
					const B1 = new Complex128Array( reinterpretView( Bseed ).slice() );
					run(
						`alpha-sweep ${side} ${uplo} ${transa} ${diag} a=(${alpha.re},${alpha.im})`,
						side, uplo, transa, diag, M, N, alpha, A, sa, B0, B1, sb, 1.0e-12 * 17
					);
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
