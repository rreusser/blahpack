// Correctness gate: v1-packed vs v0-reference over a case matrix spanning
// side (left/right), uplo (upper/lower), layouts (col/row/gen/neg for A/B/C),
// complex alpha/beta in {0,1,general}, non-square shapes, tile remainders, and
// GARBAGE stored diagonal imaginary parts on A (the top failure risk: the
// reference references only DBLE(A(j,j))).
//
// The tiled kernel reorders the K-summation, so this is the BACKWARD-ERROR tier
// (docs/optimization-policy.md): NaN-aware relative tolerance scaled by K,
// compared over the FULL C storage. Also verifies A and B are never written.
//
// Usage: node check.mjs [variant-file ...]   (default: all v*.js except v0)
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

const BASE_RTOL = 2.0e-15; // per-term backward error; scaled by K below

function randArray( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( Math.random() * 4.0 ) - 2.0;
	return a;
}

// Storage size + offset for a d1 x d2 matrix with (complex-element) strides.
function alloc( d1, d2, s1, s2 ) {
	const ncomplex = ( Math.abs( s1 ) * Math.max( d1, 1 ) ) + ( Math.abs( s2 ) * Math.max( d2, 1 ) ) + 4;
	const off = ( s1 < 0 ? Math.abs( s1 ) * ( d1 - 1 ) : 0 ) + ( s2 < 0 ? Math.abs( s2 ) * ( d2 - 1 ) : 0 );
	return { data: new Complex128Array( randArray( 2 * ncomplex ) ), off };
}

// Stride styles (complex-element), instantiated per-matrix with its own dims:
const styles = {
	col: ( d1 ) => [ 1, Math.max( d1, 1 ) ],
	row: ( d1, d2 ) => [ Math.max( d2, 1 ), 1 ],
	gen: ( d1 ) => [ 2, ( 2 * Math.max( d1, 1 ) ) + 3 ],
	neg: ( d1 ) => [ -1, Math.max( d1, 1 ) ]
};
// Joint layout combos for (A, B, C):
const layoutCombos = [
	[ 'col', 'col', 'col' ],
	[ 'row', 'row', 'row' ],
	[ 'gen', 'gen', 'gen' ],
	[ 'col', 'row', 'gen' ],
	[ 'neg', 'col', 'row' ]
];

const scalars = [
	{ alpha: new Complex128( 1.0, 0.0 ), beta: new Complex128( 0.0, 0.0 ) },
	{ alpha: new Complex128( 1.0, 0.0 ), beta: new Complex128( 1.0, 0.0 ) },
	{ alpha: new Complex128( 2.0, -1.5 ), beta: new Complex128( -0.5, 0.75 ) },
	{ alpha: new Complex128( 0.0, 0.0 ), beta: new Complex128( 2.0, 1.0 ) },
	{ alpha: new Complex128( 0.0, 1.0 ), beta: new Complex128( 1.0, 0.0 ) }
];

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 64 ];
const shapes = [];
for ( const M of dims ) for ( const N of dims ) shapes.push( [ M, N ] );

// NaN-aware combined abs/rel error over interleaved re/im doubles.
function maxRelErr( x, y ) {
	let e = 0;
	for ( let i = 0; i < x.length; i++ ) {
		const xi = x[ i ];
		const yi = y[ i ];
		if ( Number.isNaN( xi ) || Number.isNaN( yi ) ) {
			if ( Number.isNaN( xi ) !== Number.isNaN( yi ) ) return Infinity;
			continue;
		}
		const d = Math.abs( xi - yi );
		let rel = d / ( Math.abs( xi ) + Math.abs( yi ) + 1e-300 );
		if ( d < rel ) rel = d; // min(absolute, relative)
		if ( rel > e ) e = rel;
	}
	return e;
}

function flat( c ) {
	return new Float64Array( c.buffer, c.byteOffset, c.length * 2 );
}

function check( fn ) {
	let worst = 0;
	let ncase = 0;
	let failures = 0;
	for ( const [ M, N ] of shapes ) {
		const big = ( M > 17 || N > 17 );
		const combos = big ? [ [ 'col', 'col', 'col' ] ] : layoutCombos;
		const scal = big ? scalars.slice( 0, 3 ) : scalars;
		for ( const side of [ 'left', 'right' ] ) {
			for ( const uplo of [ 'upper', 'lower' ] ) {
				const ka = ( side === 'left' ) ? M : N; // A is ka x ka
				for ( const [ la, lb, lc ] of combos ) {
					const [ sa1, sa2 ] = styles[ la ]( ka, ka );
					const [ sb1, sb2 ] = styles[ lb ]( M, N );
					const [ sc1, sc2 ] = styles[ lc ]( M, N );
					const Aa = alloc( ka, ka, sa1, sa2 );
					// Poison A's stored diagonal imaginary parts with garbage
					// the reference must ignore (DBLE(A(j,j))):
					const Av = flat( Aa.data );
					for ( let d = 0; d < ka; d++ ) {
						Av[ ( ( Aa.off + ( d * sa1 ) + ( d * sa2 ) ) * 2 ) + 1 ] = 1.0e6 * ( d + 1 );
					}
					const Bb = alloc( M, N, sb1, sb2 );
					const Asnap = Av.slice();
					const Bsnap = flat( Bb.data ).slice();
					for ( const { alpha, beta } of scal ) {
						const Cc = alloc( M, N, sc1, sc2 );
						const C0 = new Complex128Array( Cc.data );
						const C1 = new Complex128Array( Cc.data );
						v0( side, uplo, M, N, alpha, Aa.data, sa1, sa2, Aa.off, Bb.data, sb1, sb2, Bb.off, beta, C0, sc1, sc2, Cc.off );
						fn( side, uplo, M, N, alpha, Aa.data, sa1, sa2, Aa.off, Bb.data, sb1, sb2, Bb.off, beta, C1, sc1, sc2, Cc.off );
						ncase += 1;
						const tol = BASE_RTOL * ( Math.max( M, N ) + 4 );
						const e = maxRelErr( flat( C0 ), flat( C1 ) );
						if ( e > worst ) worst = e;
						if ( e > tol ) {
							failures += 1;
							console.log( `FAIL ${side}/${uplo} M=${M} N=${N} A=${la} B=${lb} C=${lc} a=(${alpha.re},${alpha.im}) b=(${beta.re},${beta.im}) err=${e.toExponential( 3 )}` );
						}
					}
					// A and B must never be written:
					const Anow = flat( Aa.data );
					for ( let i = 0; i < Asnap.length; i++ ) {
						if ( !Object.is( Anow[ i ], Asnap[ i ] ) ) { failures += 1; console.log( `FAIL A modified ${side}/${uplo} M=${M} N=${N}` ); break; }
					}
					const Bnow = flat( Bb.data );
					for ( let i = 0; i < Bsnap.length; i++ ) {
						if ( !Object.is( Bnow[ i ], Bsnap[ i ] ) ) { failures += 1; console.log( `FAIL B modified ${side}/${uplo} M=${M} N=${N}` ); break; }
					}
				}
			}
		}
	}
	return { worst, ncase, failures };
}

let files = process.argv.slice( 2 );
if ( files.length === 0 ) {
	files = readdirSync( join( __dirname, 'variants' ) )
		.filter( ( f ) => /^v\d.*\.js$/.test( f ) && f !== 'v0-reference.js' )
		.sort();
}

let totalFail = 0;
let totalCases = 0;
for ( const f of files ) {
	const spec = f.charAt( 0 ) === '.' || f.includes( '/' ) ? f : './variants/' + f;
	const fn = ( await import( spec ) ).default;
	const r = check( fn );
	totalFail += r.failures;
	totalCases += r.ncase;
	console.log( ( r.failures ? 'FAIL' : 'PASS' ) + '  ' + f + '  worstRelErr=' + r.worst.toExponential( 3 ) + '  cases=' + r.ncase );
}
console.log( ( totalFail === 0 ? 'PASS' : 'FAIL' ) + ': ' + totalCases + ' cases, ' + totalFail + ' failures' );
process.exit( totalFail ? 1 : 0 );
