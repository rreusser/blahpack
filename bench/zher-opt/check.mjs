// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning
// uplo, layouts, general/negative strides, remainders, zero/garbage guards,
// and real-alpha special values. The blocked kernel only reschedules memory —
// every element receives exactly the reference update `x[i]*(alpha*conj(x[j]))`
// (`j` the column index), the reference `x[j] !== 0` column guard is preserved,
// and every stored diagonal has its imaginary part written to 0.0 exactly as
// the reference does (including for zero columns). So the gate is the
// BIT-IDENTICAL tier (docs/optimization-policy.md): the FULL interleaved
// storage of A must match bitwise (Object.is), which also proves the unstored
// triangle and padding are never written.
//
// CRITICAL: the stored diagonal is initialized with nonzero GARBAGE imaginary
// parts, so a kernel that fails to zero the diagonal imag will be caught.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

// Build an interleaved Float64Array of length 2*nc with random re/im in
// [-1,1]; every third complex element is zeroed when `zeros` is set (to
// exercise the reference column guard and its diagonal-zeroing path).
function randBuf( nc, zeros ) {
	const a = new Float64Array( 2 * nc );
	for ( let i = 0; i < nc; i++ ) {
		if ( zeros && ( i % 3 === 1 ) ) {
			a[ 2 * i ] = 0.0;
			a[ ( 2 * i ) + 1 ] = 0.0;
		} else {
			a[ 2 * i ] = ( 2.0 * Math.random() ) - 1.0;
			a[ ( 2 * i ) + 1 ] = ( 2.0 * Math.random() ) - 1.0;
		}
	}
	return a;
}

let ncases = 0;
let failures = 0;

const sizes = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 100 ];
const strideCombos = ( N ) => [
	{ sa1: 1, sa2: N + 1, tag: 'col' },
	{ sa1: N + 1, sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: ( 2 * N ) + 3, tag: 'gen-col' },
	{ sa1: ( 2 * N ) + 3, sa2: 2, tag: 'gen-row' },
	{ sa1: -1, sa2: N + 1, tag: 'neg-sa1' },
	{ sa1: N + 1, sa2: -1, tag: 'neg-sa2' }
];

for ( const N of sizes ) {
	for ( const uplo of [ 'upper', 'lower' ] ) {
		for ( const sc of strideCombos( N ) ) {
			for ( const sx of [ 1, 2, -1 ] ) {
				for ( const alpha of [ 0.0, 1.0, 0.7, -0.2 ] ) {
					for ( const zeros of [ false, true ] ) {
						const NN = Math.max( N, 1 );
						// storage size for A (complex elements), padded
						const ncA = ( Math.abs( sc.sa1 ) * NN ) + ( Math.abs( sc.sa2 ) * NN ) + 8;
						// offset (complex) so negative strides stay in bounds
						const oa = 2 +
							( sc.sa1 < 0 ? Math.abs( sc.sa1 ) * ( NN - 1 ) : 0 ) +
							( sc.sa2 < 0 ? Math.abs( sc.sa2 ) * ( NN - 1 ) : 0 );
						// GARBAGE imaginary parts everywhere in A (incl. diagonal)
						const Abuf = randBuf( ncA, false );

						const xnc = Math.max( 1, N * Math.abs( sx ) ) + 2;
						const xbuf = randBuf( xnc, zeros );
						const ox = sx < 0 ? ( N - 1 ) * Math.abs( sx ) : 1;

						const A0buf = Abuf.slice();
						const A1buf = Abuf.slice();
						v0( uplo, N, alpha, new Complex128Array( xbuf ), sx, ox, new Complex128Array( A0buf ), sc.sa1, sc.sa2, oa );
						v1( uplo, N, alpha, new Complex128Array( xbuf ), sx, ox, new Complex128Array( A1buf ), sc.sa1, sc.sa2, oa );
						ncases += 1;

						const r0 = reinterpret( new Complex128Array( A0buf ), 0 );
						const r1 = reinterpret( new Complex128Array( A1buf ), 0 );
						let bad = -1;
						for ( let k = 0; k < r0.length; k++ ) {
							if ( !Object.is( r0[ k ], r1[ k ] ) ) { bad = k; break; }
						}
						if ( bad >= 0 ) {
							failures += 1;
							if ( failures < 20 ) {
								console.log( `FAIL N=${N} ${uplo} ${sc.tag} sx=${sx} a=${alpha} z=${zeros}: buf[${bad}] v0=${r0[ bad ]} v1=${r1[ bad ]}` );
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
