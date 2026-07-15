// Correctness gate: v1-blocked vs v0-reference for complex Hermitian mat-vec.
//
// The blocked kernel reorders summation, so this is the backward-error tier
// (docs/optimization-policy.md): elementwise comparison over the FULL y
// storage at a NaN-aware relative tolerance scaled to the reduction length.
//
// Coverage:
// - both triangles (uplo upper/lower)
// - GARBAGE nonzero imaginary parts on the stored diagonal (top failure risk;
//   the reference uses only DBLE(A(j,j)) and both variants must ignore the
//   stored imaginary part identically)
// - complex alpha/beta including {0, 1, general}
// - strided/offset/NEGATIVE-stride x and y
// - N spanning the 4-wide remainder: 0,1,3,4,5,7,8,17,100
// - full (non-Hermitian) random A so any read of the wrong triangle is caught
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

let ncases = 0;
let failures = 0;

const sizes = [ 0, 1, 3, 4, 5, 7, 8, 17, 100 ];
const strideCombos = ( N ) => [
	{ sa1: 1, sa2: Math.max( N, 1 ), tag: 'col' },
	{ sa1: Math.max( N, 1 ), sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: ( 2 * Math.max( N, 1 ) ) + 3, tag: 'gen' },
	{ sa1: -1, sa2: Math.max( N, 1 ), tag: 'negrow' }
];
const xyStrides = [ [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ -1, 1 ], [ 2, -1 ], [ -1, -1 ] ];
// alpha/beta as [re, im] pairs spanning {0,1,general}
const scalars = [
	[ [ 1.0, 0.0 ], [ 0.0, 0.0 ] ],
	[ [ 0.7, -0.4 ], [ 0.3, 0.2 ] ],
	[ [ 0.0, 0.0 ], [ 0.5, -0.3 ] ],
	[ [ 1.0, 0.0 ], [ 1.0, 0.0 ] ],
	[ [ -0.2, 0.9 ], [ 0.0, 0.0 ] ],
	[ [ 0.6, 0.0 ], [ 0.0, 1.0 ] ]
];

for ( const N of sizes ) {
	for ( const uplo of [ 'upper', 'lower' ] ) {
		for ( const sc of strideCombos( N ) ) {
			for ( const [ sx, sy ] of xyStrides ) {
				for ( const [ av, bv ] of scalars ) {
					const alpha = new Complex128( av[ 0 ], av[ 1 ] );
					const beta = new Complex128( bv[ 0 ], bv[ 1 ] );
					const n1 = Math.max( N, 1 );

					// A storage sized to cover the max index over both dims;
					// filled with full random complex data (interleaved).
					const sizeA = ( Math.abs( sc.sa1 ) * n1 ) + ( Math.abs( sc.sa2 ) * n1 ) + 4;
					const oa = ( sc.sa1 < 0 ? Math.abs( sc.sa1 ) * ( n1 - 1 ) : 0 ) + ( sc.sa2 < 0 ? Math.abs( sc.sa2 ) * ( n1 - 1 ) : 0 );
					const Abuf = rand( 2 * sizeA );
					// GARBAGE: force nonzero imaginary parts onto the stored
					// diagonal A[j,j] (index oa + j*(sa1+sa2), complex-doubled).
					for ( let jj = 0; jj < N; jj++ ) {
						const di = 2 * ( oa + ( jj * ( sc.sa1 + sc.sa2 ) ) );
						Abuf[ di + 1 ] = 3.14159 + jj; // nonzero garbage imag
					}
					const A = new Complex128Array( Abuf );

					const ox = sx < 0 ? ( n1 - 1 ) * Math.abs( sx ) : 1;
					const oy = sy < 0 ? ( n1 - 1 ) * Math.abs( sy ) : 1;
					const xbuf = rand( 2 * ( Math.max( 1, N * Math.abs( sx ) ) + ox + 2 ) );
					const ybuf = rand( 2 * ( Math.max( 1, N * Math.abs( sy ) ) + oy + 2 ) );
					const x = new Complex128Array( xbuf );
					const y0buf = ybuf.slice();
					const y1buf = ybuf.slice();
					const y0 = new Complex128Array( y0buf );
					const y1 = new Complex128Array( y1buf );

					v0( uplo, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y0, sy, oy );
					v1( uplo, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y1, sy, oy );
					ncases += 1;

					const tol = 1.0e-13 * Math.max( 4, N );
					let bad = -1;
					for ( let i = 0; i < y0buf.length; i++ ) {
						const a = y0buf[ i ];
						const b = y1buf[ i ];
						const ok = Number.isNaN( a ) ? Number.isNaN( b ) : Math.abs( a - b ) <= tol * Math.max( 1.0, Math.abs( a ) );
						if ( !ok ) { bad = i; break; }
					}
					if ( bad >= 0 ) {
						failures += 1;
						console.log( `FAIL ${uplo} N=${N} ${sc.tag} sx=${sx} sy=${sy} a=${av} b=${bv}: y[${bad}] v0=${y0buf[ bad ]} v1=${y1buf[ bad ]}` );
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
