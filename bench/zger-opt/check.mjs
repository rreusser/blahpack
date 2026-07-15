// Correctness gate: v1 (register-blocked) vs v0 (reference) for BOTH zgeru and
// zgerc, over a case matrix spanning layouts, general/negative strides,
// 4-wide remainders, zero guards, and alpha special values.
//
// The blocked kernel only reschedules memory: every A[i,j] receives exactly
// the reference fused update `x[i] * (alpha*conj?(y[j]))` computed with the
// identical floating-point expression, and the reference `y[j] !== 0` guard is
// preserved. So the gate is the BIT-IDENTICAL tier (docs/optimization-policy.md):
// the FULL storage buffer of A must match bitwise (Object.is), which also proves
// no element outside the reference footprint is ever written.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0u from './variants/v0-zgeru.js';
import v0c from './variants/v0-zgerc.js';
import v1u from './variants/v1-zgeru.js';
import v1c from './variants/v1-zgerc.js';

// Build a Complex128Array of `nc` complex elements with random interleaved
// re/im doubles in [-1,1]; when `zeros`, make every 3rd complex element the
// exact complex zero (0,0) to exercise the column guard.
function randz( nc, zeros ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < nc; i++ ) {
		if ( zeros && ( i % 3 ) === 1 ) {
			buf[ 2 * i ] = 0.0;
			buf[ ( 2 * i ) + 1 ] = 0.0;
		} else {
			buf[ 2 * i ] = ( 2.0 * Math.random() ) - 1.0;
			buf[ ( 2 * i ) + 1 ] = ( 2.0 * Math.random() ) - 1.0;
		}
	}
	return new Complex128Array( buf );
}

let ncases = 0;
let failures = 0;

const sizes = [ 0, 1, 3, 4, 5, 7, 8, 17, 100 ];
const strideCombos = ( M, N ) => [
	{ sa1: 1, sa2: M + 1, tag: 'col' },
	{ sa1: N + 1, sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: ( 2 * M ) + 3, tag: 'gen-col' },
	{ sa1: ( 2 * N ) + 3, sa2: 2, tag: 'gen-row' },
	{ sa1: -1, sa2: M + 1, tag: 'neg-sa1' },
	{ sa1: 1, sa2: -( M + 1 ), tag: 'neg-sa2' }
];
const alphas = [ new Complex128( 0.0, 0.0 ), new Complex128( 1.0, 0.0 ), new Complex128( 0.7, -0.4 ), new Complex128( -0.2, 1.3 ) ];
const vecStrides = [ [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ -1, 1 ], [ 1, -1 ] ];

function bufOf( za ) {
	// Return the underlying Float64Array view for bitwise comparison.
	return new Float64Array( za.buffer, za.byteOffset, za.length * 2 );
}

for ( const [ name, v0, v1 ] of [ [ 'zgeru', v0u, v1u ], [ 'zgerc', v0c, v1c ] ] ) {
	for ( const M of sizes ) {
		for ( const N of sizes ) {
			for ( const sc of strideCombos( M, N ) ) {
				for ( const [ sx, sy ] of vecStrides ) {
					for ( const alpha of alphas ) {
						for ( const zeros of [ false, true ] ) {
							// Complex-element buffer sizes / offsets.
							const asa1 = Math.abs( sc.sa1 );
							const asa2 = Math.abs( sc.sa2 );
							const sizeA = ( asa1 * Math.max( M, 1 ) ) + ( asa2 * Math.max( N, 1 ) ) + 8;
							const oa = 2 + ( sc.sa1 < 0 ? asa1 * ( M - 1 ) : 0 ) + ( sc.sa2 < 0 ? asa2 * ( N - 1 ) : 0 );
							const A = randz( sizeA, false );
							const x = randz( Math.max( 1, M * Math.abs( sx ) ) + 2, zeros );
							const ox = sx < 0 ? ( M - 1 ) * Math.abs( sx ) : 1;
							const y = randz( Math.max( 1, N * Math.abs( sy ) ) + 2, zeros );
							const oy = sy < 0 ? ( N - 1 ) * Math.abs( sy ) : 1;

							const A0 = new Complex128Array( A.buffer.slice( 0 ) );
							const A1 = new Complex128Array( A.buffer.slice( 0 ) );
							v0( M, N, alpha, x, sx, ox, y, sy, oy, A0, sc.sa1, sc.sa2, oa );
							v1( M, N, alpha, x, sx, ox, y, sy, oy, A1, sc.sa1, sc.sa2, oa );
							ncases += 1;

							const b0 = bufOf( A0 );
							const b1 = bufOf( A1 );
							let bad = -1;
							for ( let i = 0; i < b0.length; i++ ) {
								if ( !Object.is( b0[ i ], b1[ i ] ) ) { bad = i; break; }
							}
							if ( bad >= 0 ) {
								failures += 1;
								if ( failures < 20 ) {
									console.log( `FAIL ${name} M=${M} N=${N} ${sc.tag} sx=${sx} sy=${sy} a=(${alpha.re},${alpha.im}) z=${zeros}: A[${bad}] v0=${b0[ bad ]} v1=${b1[ bad ]}` );
								}
							}
						}
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases (bit-identical), ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
