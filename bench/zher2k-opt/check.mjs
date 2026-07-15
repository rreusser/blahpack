// Correctness gate: v1 tiled vs v0-reference for zher2k over a case matrix
// spanning uplo, trans (no-transpose = A*B^H + B*A^H, conjugate-transpose =
// A^H*B + B^H*A), layouts (col/row/general, for A, B and C independently),
// sizes with tile remainders, COMPLEX alpha in {0,1,general}, REAL beta in
// {0,1,general}, offsets, and GARBAGE imaginary parts injected on the stored
// diagonal of C (the diagonal is real by construction — the kernel must ignore
// any stored imag there and store imag=0).
//
// The tiled kernel reorders the K-summation, so this is the backward-error
// tier (docs/optimization-policy.md): elementwise comparison over the FULL C
// storage at a tolerance scaled by K. Comparing the full storage also proves
// the opposite triangle is never touched.
//
// Usage: node check.mjs [variant-file ...]   (default: all non-reference variants)
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

function randz( nc ) {
	const buf = new Float64Array( 2 * Math.max( 1, nc ) );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return new Complex128Array( buf );
}

function flat( c ) {
	return new Float64Array( c.buffer, c.byteOffset, c.length * 2 );
}

// Stride combos for an R×S matrix (complex elements): col-major, row-major, gen.
const combos = ( R, S ) => [
	{ s1: 1, s2: Math.max( R, 1 ), tag: 'col' },
	{ s1: Math.max( S, 1 ), s2: 1, tag: 'row' },
	{ s1: 2, s2: ( 2 * Math.max( R, 1 ) ) + 3, tag: 'gen' }
];

// Size (in complex elements) needed for an R×S view with the given strides/offset.
const sizeOf = ( R, S, s1, s2, off ) => off + ( R > 0 ? ( R - 1 ) * Math.abs( s1 ) : 0 ) + ( S > 0 ? ( S - 1 ) * Math.abs( s2 ) : 0 ) + 3;

const dims = [ 0, 1, 2, 3, 4, 5, 7, 8, 17, 64 ];
// [ alphaR, alphaI, beta ]: complex alpha, real beta, in {0,1,general}.
const params = [
	[ 1.0, 0.0, 0.0 ],
	[ 1.0, 0.0, 1.0 ],
	[ 0.7, -0.4, 0.6 ],
	[ 0.0, 0.0, 0.5 ],
	[ 0.0, 0.0, 1.0 ],
	[ -0.3, 0.9, 1.0 ],
	[ 2.0, -1.5, -0.5 ]
];

function check( v1 ) {
	let ncases = 0;
	let failures = 0;
	let firstFail = null;
	for ( const N of dims ) {
		for ( const K of dims ) {
			for ( const uplo of [ 'upper', 'lower' ] ) {
				for ( const trans of [ 'no-transpose', 'conjugate-transpose' ] ) {
					// A,B dims: N×K (no-transpose) or K×N (conjugate-transpose)
					const RA = ( trans === 'no-transpose' ) ? N : K;
					const SA = ( trans === 'no-transpose' ) ? K : N;
					for ( const la of combos( RA, SA ) ) {
						for ( const lb of combos( RA, SA ) ) {
							for ( const lc of combos( N, N ) ) {
								for ( const [ alphaR, alphaI, beta ] of params ) {
									const oa = 2;
									const ob = 1;
									const oc = 3;
									const A = randz( sizeOf( RA, SA, la.s1, la.s2, oa ) );
									const B = randz( sizeOf( RA, SA, lb.s1, lb.s2, ob ) );
									const Cin = randz( sizeOf( N, N, lc.s1, lc.s2, oc ) );

									// Inject large garbage into the stored-diagonal
									// imaginary parts of C (must be ignored).
									const cf = flat( Cin );
									for ( let d = 0; d < N; d++ ) {
										const idx = ( oc + ( d * lc.s1 ) + ( d * lc.s2 ) ) * 2;
										cf[ idx + 1 ] = ( ( 2.0 * Math.random() ) - 1.0 ) * 1.0e6;
									}

									const alpha = new Complex128( alphaR, alphaI );
									const C0 = new Complex128Array( Cin );
									const C1 = new Complex128Array( Cin );
									v0( uplo, trans, N, K, alpha, A, la.s1, la.s2, oa, B, lb.s1, lb.s2, ob, beta, C0, lc.s1, lc.s2, oc );
									v1( uplo, trans, N, K, alpha, A, la.s1, la.s2, oa, B, lb.s1, lb.s2, ob, beta, C1, lc.s1, lc.s2, oc );
									ncases += 1;

									const f0 = flat( C0 );
									const f1 = flat( C1 );
									const tol = 1.0e-13 * Math.max( 4, K );
									let bad = -1;
									for ( let i = 0; i < f0.length; i++ ) {
										const a = f0[ i ];
										const b = f1[ i ];
										if ( Number.isNaN( a ) || Number.isNaN( b ) ) {
											if ( Number.isNaN( a ) !== Number.isNaN( b ) ) { bad = i; break; }
											continue;
										}
										if ( !( Math.abs( a - b ) <= tol * Math.max( 1.0, Math.abs( a ) ) ) ) { bad = i; break; }
									}
									if ( bad >= 0 ) {
										failures += 1;
										if ( !firstFail ) {
											firstFail = `${uplo} ${trans} N=${N} K=${K} A:${la.tag} B:${lb.tag} C:${lc.tag} aR=${alphaR} aI=${alphaI} b=${beta}: idx=${bad} v0=${f0[ bad ]} v1=${f1[ bad ]}`;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return { ncases, failures, firstFail };
}

let files = process.argv.slice( 2 );
if ( files.length === 0 ) {
	files = readdirSync( join( __dirname, 'variants' ) )
		.filter( ( f ) => /\.js$/.test( f ) && f !== 'v0-reference.js' )
		.sort();
}

let totalFail = 0;
let totalCases = 0;
for ( const f of files ) {
	const spec = f.charAt( 0 ) === '.' || f.includes( '/' ) ? f : './variants/' + f;
	const v1 = ( await import( spec ) ).default;
	const r = check( v1 );
	totalFail += r.failures;
	totalCases += r.ncases;
	console.log( ( r.failures === 0 ? 'PASS' : 'FAIL' ) + '  ' + f + '  ' + r.ncases + ' cases, ' + r.failures + ' failures' + ( r.firstFail ? ( '  first: ' + r.firstFail ) : '' ) );
}
console.log( ( totalFail === 0 ? 'PASS' : 'FAIL' ) + ': ' + totalCases + ' cases, ' + totalFail + ' failures' );
process.exit( totalFail ? 1 : 0 );
