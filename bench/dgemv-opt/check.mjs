// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning
// transpose modes, layouts, general/negative strides, remainders, and
// alpha/beta special values. The blocked kernel reorders summation, so the
// gate is the backward-error tier (docs/optimization-policy.md): elementwise
// comparison at a tolerance scaled to the reduction length.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

let ncases = 0;
let failures = 0;

const shapes = [ [ 0, 3 ], [ 3, 0 ], [ 1, 1 ], [ 2, 3 ], [ 3, 2 ], [ 4, 4 ], [ 5, 4 ], [ 4, 5 ], [ 7, 9 ], [ 8, 8 ], [ 17, 13 ], [ 33, 21 ], [ 64, 64 ], [ 3, 100 ], [ 100, 3 ] ];
const strideCombos = ( M, N ) => [
	{ sa1: 1, sa2: M, tag: 'col' },
	{ sa1: N, sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: 2 * M + 3, tag: 'gen' },
	{ sa1: -1, sa2: M, tag: 'negrow' }
];

for ( const [ M, N ] of shapes ) {
	for ( const trans of [ 'no-transpose', 'transpose' ] ) {
		for ( const sc of strideCombos( M, N ) ) {
			for ( const [ sx, sy ] of [ [ 1, 1 ], [ 2, 1 ], [ 1, 3 ], [ -1, 1 ], [ 2, -2 ] ] ) {
				for ( const [ alpha, beta ] of [ [ 1.0, 0.0 ], [ 0.7, 0.3 ], [ 0.0, 0.3 ], [ 1.0, 1.0 ], [ -0.2, 0.0 ] ] ) {
					const lenx = ( trans === 'no-transpose' ) ? N : M;
					const leny = ( trans === 'no-transpose' ) ? M : N;
					// A storage sized to cover max index over both dims
					const sizeA = ( Math.abs( sc.sa1 ) * Math.max( M, 1 ) ) + ( Math.abs( sc.sa2 ) * Math.max( N, 1 ) ) + 4;
					const oa = ( sc.sa1 < 0 ? Math.abs( sc.sa1 ) * ( M - 1 ) : 0 ) + ( sc.sa2 < 0 ? Math.abs( sc.sa2 ) * ( N - 1 ) : 0 );
					const A = rand( sizeA );
					const x = rand( Math.max( 1, lenx * Math.abs( sx ) ) + 2 );
					const ox = sx < 0 ? ( lenx - 1 ) * Math.abs( sx ) : 1;
					const y = rand( Math.max( 1, leny * Math.abs( sy ) ) + 2 );
					const oy = sy < 0 ? ( leny - 1 ) * Math.abs( sy ) : 1;
					const y0 = y.slice();
					const y1 = y.slice();
					v0( trans, M, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y0, sy, oy );
					v1( trans, M, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y1, sy, oy );
					ncases += 1;
					const tol = 1.0e-14 * Math.max( 4, lenx );
					let bad = -1;
					for ( let i = 0; i < y0.length; i++ ) {
						if ( !( Math.abs( y0[ i ] - y1[ i ] ) <= tol * Math.max( 1.0, Math.abs( y0[ i ] ) ) ) ) { bad = i; break; }
					}
					if ( bad >= 0 ) {
						failures += 1;
						console.log( `FAIL ${trans} M=${M} N=${N} ${sc.tag} sx=${sx} sy=${sy} a=${alpha} b=${beta}: y[${bad}] v0=${y0[ bad ]} v1=${y1[ bad ]}` );
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
