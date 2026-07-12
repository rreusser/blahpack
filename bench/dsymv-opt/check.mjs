// Correctness gate: v1-blocked vs v0-reference over a case matrix spanning
// uplo values, layouts, general/negative strides, remainders, and
// alpha/beta special values. The blocked kernel reorders summation, so the
// gate is the backward-error tier (docs/optimization-policy.md): elementwise
// comparison at a tolerance scaled to the reduction length. A is filled with
// a full (non-symmetric) random matrix so that any read of the wrong
// triangle changes the answer and is caught.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

let ncases = 0;
let failures = 0;

const sizes = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 33, 64 ];
const strideCombos = ( N ) => [
	{ sa1: 1, sa2: Math.max( N, 1 ), tag: 'col' },
	{ sa1: Math.max( N, 1 ), sa2: 1, tag: 'row' },
	{ sa1: 2, sa2: ( 2 * Math.max( N, 1 ) ) + 3, tag: 'gen' },
	{ sa1: -1, sa2: Math.max( N, 1 ), tag: 'negrow' }
];

for ( const N of sizes ) {
	for ( const uplo of [ 'upper', 'lower' ] ) {
		for ( const sc of strideCombos( N ) ) {
			for ( const [ sx, sy ] of [ [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ -1, 1 ], [ 2, -1 ], [ -1, -1 ] ] ) {
				for ( const [ alpha, beta ] of [ [ 1.0, 0.0 ], [ 0.7, 0.3 ], [ 0.0, 0.3 ], [ 1.0, 1.0 ], [ -0.2, 0.0 ] ] ) {
					// A storage sized to cover max index over both dims:
					const n1 = Math.max( N, 1 );
					const sizeA = ( Math.abs( sc.sa1 ) * n1 ) + ( Math.abs( sc.sa2 ) * n1 ) + 4;
					const oa = ( sc.sa1 < 0 ? Math.abs( sc.sa1 ) * ( n1 - 1 ) : 0 ) + ( sc.sa2 < 0 ? Math.abs( sc.sa2 ) * ( n1 - 1 ) : 0 );
					const A = rand( sizeA );
					const x = rand( Math.max( 1, N * Math.abs( sx ) ) + 2 );
					const ox = sx < 0 ? ( n1 - 1 ) * Math.abs( sx ) : 1;
					const y = rand( Math.max( 1, N * Math.abs( sy ) ) + 2 );
					const oy = sy < 0 ? ( n1 - 1 ) * Math.abs( sy ) : 1;
					const y0 = y.slice();
					const y1 = y.slice();
					v0( uplo, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y0, sy, oy );
					v1( uplo, N, alpha, A, sc.sa1, sc.sa2, oa, x, sx, ox, beta, y1, sy, oy );
					ncases += 1;
					const tol = 1.0e-14 * Math.max( 4, N );
					let bad = -1;
					for ( let i = 0; i < y0.length; i++ ) {
						if ( !( Math.abs( y0[ i ] - y1[ i ] ) <= tol * Math.max( 1.0, Math.abs( y0[ i ] ) ) ) ) { bad = i; break; }
					}
					if ( bad >= 0 ) {
						failures += 1;
						console.log( `FAIL ${uplo} N=${N} ${sc.tag} sx=${sx} sy=${sy} a=${alpha} b=${beta}: y[${bad}] v0=${y0[ bad ]} v1=${y1[ bad ]}` );
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
