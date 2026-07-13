// Correctness gate: v1-tiled vs v0-reference over a case matrix spanning
// side/uplo, layouts (col/row/general/negative strides for A, B, C),
// non-square shapes, remainders, and alpha/beta special values. The tiled
// kernel reorders summation, so the gate is the backward-error tier
// (docs/optimization-policy.md): elementwise comparison at a tolerance
// scaled to the reduction length. Also verifies A and B are never written
// (bit-identical storage before/after).
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

// Storage size + offset for a d1 x d2 matrix with strides s1, s2:
function alloc( d1, d2, s1, s2 ) {
	const size = ( Math.abs( s1 ) * Math.max( d1, 1 ) ) + ( Math.abs( s2 ) * Math.max( d2, 1 ) ) + 4;
	const off = ( s1 < 0 ? Math.abs( s1 ) * ( d1 - 1 ) : 0 ) + ( s2 < 0 ? Math.abs( s2 ) * ( d2 - 1 ) : 0 );
	return { data: rand( size ), off };
}

let ncases = 0;
let failures = 0;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 12, 17, 33 ];
const shapes = [];
for ( const M of dims ) for ( const N of dims ) shapes.push( [ M, N ] );

// Stride styles, instantiated per-matrix with its own dims:
const styles = {
	col: ( d1, d2 ) => [ 1, Math.max( d1, 1 ) ],
	row: ( d1, d2 ) => [ Math.max( d2, 1 ), 1 ],
	gen: ( d1, d2 ) => [ 2, ( 2 * Math.max( d1, 1 ) ) + 3 ],
	neg: ( d1, d2 ) => [ -1, Math.max( d1, 1 ) ]
};
// Joint layout combos for (A, B, C):
const layoutCombos = [
	[ 'col', 'col', 'col' ],
	[ 'row', 'row', 'row' ],
	[ 'gen', 'gen', 'gen' ],
	[ 'col', 'row', 'gen' ],
	[ 'neg', 'col', 'row' ]
];

const alphaBetas = [ [ 1.0, 0.0 ], [ 0.7, 0.3 ], [ 0.0, 0.3 ], [ 1.0, 1.0 ], [ -0.2, 0.0 ] ];

for ( const [ M, N ] of shapes ) {
	for ( const side of [ 'left', 'right' ] ) {
		for ( const uplo of [ 'upper', 'lower' ] ) {
			const ka = ( side === 'left' ) ? M : N; // A is ka x ka
			for ( const [ la, lb, lc ] of layoutCombos ) {
				const [ sa1, sa2 ] = styles[ la ]( ka, ka );
				const [ sb1, sb2 ] = styles[ lb ]( M, N );
				const [ sc1, sc2 ] = styles[ lc ]( M, N );
				const Aa = alloc( ka, ka, sa1, sa2 );
				const Bb = alloc( M, N, sb1, sb2 );
				const Asnap = Aa.data.slice();
				const Bsnap = Bb.data.slice();
				for ( const [ alpha, beta ] of alphaBetas ) {
					const Cc = alloc( M, N, sc1, sc2 );
					const C0 = Cc.data.slice();
					const C1 = Cc.data.slice();
					v0( side, uplo, M, N, alpha, Aa.data, sa1, sa2, Aa.off, Bb.data, sb1, sb2, Bb.off, beta, C0, sc1, sc2, Cc.off );
					v1( side, uplo, M, N, alpha, Aa.data, sa1, sa2, Aa.off, Bb.data, sb1, sb2, Bb.off, beta, C1, sc1, sc2, Cc.off );
					ncases += 1;
					const tol = 1.0e-14 * Math.max( 4, Math.max( M, N ) );
					let bad = -1;
					for ( let i = 0; i < C0.length; i++ ) {
						if ( !( Math.abs( C0[ i ] - C1[ i ] ) <= tol * Math.max( 1.0, Math.abs( C0[ i ] ) ) ) ) { bad = i; break; }
					}
					if ( bad >= 0 ) {
						failures += 1;
						console.log( `FAIL ${side}/${uplo} M=${M} N=${N} A=${la} B=${lb} C=${lc} a=${alpha} b=${beta}: C[${bad}] v0=${C0[ bad ]} v1=${C1[ bad ]}` );
					}
				}
				// A and B must never be written:
				for ( let i = 0; i < Asnap.length; i++ ) {
					if ( !Object.is( Aa.data[ i ], Asnap[ i ] ) ) {
						failures += 1;
						console.log( `FAIL ${side}/${uplo} M=${M} N=${N} A=${la}: A modified at ${i}` );
						break;
					}
				}
				for ( let i = 0; i < Bsnap.length; i++ ) {
					if ( !Object.is( Bb.data[ i ], Bsnap[ i ] ) ) {
						failures += 1;
						console.log( `FAIL ${side}/${uplo} M=${M} N=${N} B=${lb}: B modified at ${i}` );
						break;
					}
				}
			}
		}
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
