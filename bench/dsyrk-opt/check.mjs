// Correctness gate: v1-tiled vs v0-reference over a case matrix spanning
// uplo/trans, layouts (for A and C independently), sizes with remainders,
// and alpha/beta special values. The tiled kernel reorders summation, so the
// gate is the backward-error tier (docs/optimization-policy.md): elementwise
// comparison at a tolerance scaled to the reduction length. The FULL C
// storage is compared (both triangles plus padding), which also proves the
// opposite triangle is never touched.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

// Stride combos for an R×S matrix (col-major, row-major, general):
const combos = ( R, S ) => [
	{ s1: 1, s2: Math.max( R, 1 ), tag: 'col' },
	{ s1: Math.max( S, 1 ), s2: 1, tag: 'row' },
	{ s1: 2, s2: ( 2 * Math.max( R, 1 ) ) + 3, tag: 'gen' }
];

const sizeOf = ( R, S, s1, s2, off ) => off + ( R > 0 ? ( R - 1 ) * Math.abs( s1 ) : 0 ) + ( S > 0 ? ( S - 1 ) * Math.abs( s2 ) : 0 ) + 3;

let ncases = 0;
let failures = 0;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 12, 17, 33 ];
const alphabeta = [ [ 1.0, 0.0 ], [ 0.7, 0.3 ], [ 0.0, 0.3 ], [ 1.0, 1.0 ], [ -0.2, 0.0 ] ];

for ( const N of dims ) {
	for ( const K of dims ) {
		for ( const uplo of [ 'upper', 'lower' ] ) {
			for ( const trans of [ 'no-transpose', 'transpose' ] ) {
				// A dims: N×K (no-transpose) or K×N (transpose)
				const RA = ( trans === 'no-transpose' ) ? N : K;
				const SA = ( trans === 'no-transpose' ) ? K : N;
				for ( const la of combos( RA, SA ) ) {
					for ( const lc of combos( N, N ) ) {
						for ( const [ alpha, beta ] of alphabeta ) {
							const oa = 2;
							const oc = 1;
							const A = rand( sizeOf( RA, SA, la.s1, la.s2, oa ) );
							const Cin = rand( sizeOf( N, N, lc.s1, lc.s2, oc ) );
							const C0 = Cin.slice();
							const C1 = Cin.slice();
							v0( uplo, trans, N, K, alpha, A, la.s1, la.s2, oa, beta, C0, lc.s1, lc.s2, oc );
							v1( uplo, trans, N, K, alpha, A, la.s1, la.s2, oa, beta, C1, lc.s1, lc.s2, oc );
							ncases += 1;
							const tol = 1.0e-14 * Math.max( 4, K );
							let bad = -1;
							for ( let i = 0; i < C0.length; i++ ) {
								if ( !( Math.abs( C0[ i ] - C1[ i ] ) <= tol * Math.max( 1.0, Math.abs( C0[ i ] ) ) ) ) { bad = i; break; }
							}
							if ( bad >= 0 ) {
								failures += 1;
								console.log( `FAIL ${uplo} ${trans} N=${N} K=${K} A:${la.tag} C:${lc.tag} a=${alpha} b=${beta}: C[${bad}] v0=${C0[ bad ]} v1=${C1[ bad ]}` );
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
