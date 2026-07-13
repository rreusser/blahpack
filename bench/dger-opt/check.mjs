// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning
// layouts, general/negative strides, remainders, zero guards, and alpha
// special values. The blocked kernel only reschedules memory — every element
// receives exactly the reference update `x[i] * (alpha*y[j])` with the
// reference `y[j] !== 0` guard — so the gate is the bit-identical tier
// (docs/optimization-policy.md): the FULL storage buffer of A must match
// bitwise (Object.is), which also proves no element outside the reference
// footprint is ever written.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand( n, zeros ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) {
		a[ i ] = ( zeros && i % 3 === 1 ) ? 0.0 : ( 2.0 * Math.random() ) - 1.0;
	}
	return a;
}

let ncases = 0;
let failures = 0;

const sizes = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 33, 64 ];
const strideCombos = ( M, N ) => [
	{ sa1: 1, sa2: M + 1, tag: 'col' },
	{ sa1: N + 1, sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: ( 2 * M ) + 3, tag: 'gen-col' },
	{ sa1: ( 2 * N ) + 3, sa2: 2, tag: 'gen-row' },
	{ sa1: -1, sa2: M + 1, tag: 'neg-sa1' }
];

for ( const M of sizes ) {
	for ( const N of sizes ) {
		for ( const sc of strideCombos( M, N ) ) {
			for ( const [ sx, sy ] of [ [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ -1, 1 ], [ 1, -1 ] ] ) {
				for ( const alpha of [ 0.0, 1.0, 0.7, -0.2 ] ) {
					for ( const zeros of [ false, true ] ) {
						const sizeA = ( Math.abs( sc.sa1 ) * Math.max( M, 1 ) ) + ( Math.abs( sc.sa2 ) * Math.max( N, 1 ) ) + 8;
						const oa = 2 + ( sc.sa1 < 0 ? Math.abs( sc.sa1 ) * ( M - 1 ) : 0 ) + ( sc.sa2 < 0 ? Math.abs( sc.sa2 ) * ( N - 1 ) : 0 );
						const A = rand( sizeA, false );
						const x = rand( Math.max( 1, M * Math.abs( sx ) ) + 2, zeros );
						const ox = sx < 0 ? ( M - 1 ) * Math.abs( sx ) : 1;
						const y = rand( Math.max( 1, N * Math.abs( sy ) ) + 2, zeros );
						const oy = sy < 0 ? ( N - 1 ) * Math.abs( sy ) : 1;
						const A0 = A.slice();
						const A1 = A.slice();
						v0( M, N, alpha, x, sx, ox, y, sy, oy, A0, sc.sa1, sc.sa2, oa );
						v1( M, N, alpha, x, sx, ox, y, sy, oy, A1, sc.sa1, sc.sa2, oa );
						ncases += 1;
						let bad = -1;
						for ( let i = 0; i < A0.length; i++ ) {
							if ( !Object.is( A0[ i ], A1[ i ] ) ) { bad = i; break; }
						}
						if ( bad >= 0 ) {
							failures += 1;
							if ( failures < 20 ) {
								console.log( `FAIL M=${M} N=${N} ${sc.tag} sx=${sx} sy=${sy} a=${alpha} z=${zeros}: A[${bad}] v0=${A0[ bad ]} v1=${A1[ bad ]}` );
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
