// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning all
// three transpose modes (N/T/C), complex alpha/beta (including 0, 1, general),
// column/row/general/negative A strides, strided & negative x/y strides,
// non-square shapes, and M/N spanning the 4-wide remainder. The blocked kernel
// reorders summation, so the gate is the backward-error tier
// (docs/optimization-policy.md): elementwise comparison over the FULL y storage
// at a tolerance scaled to the reduction length.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

// Build a Complex128Array of `nc` complex elements with random components in
// [-1, 1].
function randz( nc ) {
	const buf = new Float64Array( 2 * Math.max( nc, 1 ) );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return new Complex128Array( buf );
}

let ncases = 0;
let failures = 0;

const shapes = [ [ 0, 3 ], [ 3, 0 ], [ 1, 1 ], [ 3, 1 ], [ 1, 3 ], [ 2, 3 ], [ 3, 2 ], [ 4, 4 ], [ 5, 4 ], [ 4, 5 ], [ 7, 9 ], [ 8, 8 ], [ 17, 13 ], [ 33, 21 ], [ 64, 64 ], [ 3, 100 ], [ 100, 3 ] ];

// A strides are in COMPLEX elements.
const strideCombos = ( M, N ) => [
	{ sa1: 1, sa2: M, tag: 'col' },
	{ sa1: N, sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: ( 2 * M ) + 3, tag: 'gen' },
	{ sa1: -1, sa2: M, tag: 'negrow' }
];

// Complex alpha/beta pairs: alpha in {0,1,general(complex)}, beta in
// {0,1,general(complex)}, plus a pure-imaginary alpha to exercise that path.
const scalarCombos = [
	[ new Complex128( 1.0, 0.0 ), new Complex128( 0.0, 0.0 ) ],
	[ new Complex128( 0.7, -0.4 ), new Complex128( 0.3, 0.2 ) ],
	[ new Complex128( 0.0, 0.0 ), new Complex128( 0.3, 0.2 ) ],
	[ new Complex128( 1.0, 0.0 ), new Complex128( 1.0, 0.0 ) ],
	[ new Complex128( -0.2, 0.9 ), new Complex128( 0.0, 0.0 ) ],
	[ new Complex128( 0.0, 1.3 ), new Complex128( 1.0, 0.0 ) ]
];

for ( const [ M, N ] of shapes ) {
	for ( const trans of [ 'no-transpose', 'transpose', 'conjugate-transpose' ] ) {
		const lenx = ( trans === 'no-transpose' ) ? N : M;
		const leny = ( trans === 'no-transpose' ) ? M : N;
		for ( const sc of strideCombos( M, N ) ) {
			for ( const [ sx, sy ] of [ [ 1, 1 ], [ 2, 1 ], [ 1, 3 ], [ -1, 1 ], [ 2, -2 ] ] ) {
				for ( const [ alpha, beta ] of scalarCombos ) {
					// A storage (complex elements) sized to cover max index over
					// both dims; offset handles negative strides.
					const sizeA = ( Math.abs( sc.sa1 ) * Math.max( M, 1 ) ) + ( Math.abs( sc.sa2 ) * Math.max( N, 1 ) ) + 4;
					const oa = ( sc.sa1 < 0 ? Math.abs( sc.sa1 ) * ( M - 1 ) : 0 ) + ( sc.sa2 < 0 ? Math.abs( sc.sa2 ) * ( N - 1 ) : 0 );
					const A = randz( sizeA );
					const x = randz( Math.max( 1, lenx * Math.abs( sx ) ) + 2 );
					const ox = sx < 0 ? ( lenx - 1 ) * Math.abs( sx ) : 1;
					const y = randz( Math.max( 1, leny * Math.abs( sy ) ) + 2 );
					const oy = sy < 0 ? ( leny - 1 ) * Math.abs( sy ) : 1;

					// Independent copies of y for the two kernels.
					const y0 = new Complex128Array( reinterpret( y, 0 ).slice() );
					const y1 = new Complex128Array( reinterpret( y, 0 ).slice() );
					v0( trans, M, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y0, sy, oy );
					v1( trans, M, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y1, sy, oy );
					ncases += 1;
					const d0 = reinterpret( y0, 0 );
					const d1 = reinterpret( y1, 0 );
					const tol = 1.0e-13 * Math.max( 4, lenx );
					let bad = -1;
					for ( let i = 0; i < d0.length; i++ ) {
						const a = d0[ i ];
						const b = d1[ i ];
						const ok = Number.isNaN( a ) ? Number.isNaN( b ) : Math.abs( a - b ) <= tol * Math.max( 1.0, Math.abs( a ) );
						if ( !ok ) { bad = i; break; }
					}
					if ( bad >= 0 ) {
						failures += 1;
						console.log( `FAIL ${trans} M=${M} N=${N} ${sc.tag} sx=${sx} sy=${sy} a=(${real( alpha )},${imag( alpha )}) b=(${real( beta )},${imag( beta )}): d[${bad}] v0=${d0[ bad ]} v1=${d1[ bad ]}` );
					}
				}
			}
		}
	}
}

function real( z ) { return z.re; }
function imag( z ) { return z.im; }

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
