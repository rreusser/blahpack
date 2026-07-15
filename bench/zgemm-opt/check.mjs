// Correctness gate for complex zgemm tile variants vs v0-reference.
//
// Tiling reorders the K-summation, so this is the BACKWARD-ERROR tier
// (docs/optimization-policy.md): NaN-aware relative tolerance scaled by K,
// compared over the FULL C storage. Covers all 9 op combos (N/T/C x N/T/C),
// complex alpha/beta in {0,1,general}, strided/offset/padded layouts,
// col/row/negative strides for A/B/C, and K spanning tile remainders.
//
// Usage: node check.mjs [variant-file ...]   (default: all gen-*.js + pack-*.js)
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

// Build op(X)-storage with logical dims rows x cols.
// layout: 'col' (s1=1,s2=ld), 'row' (s1=ld,s2=1), 'neg' (col-major w/ negative
// row stride). pad adds leading-dim padding; off adds a complex-element offset.
function makeMat( rows, cols, layout, pad, off ) {
	let s1, s2, ld, ncomplex, base;
	if ( layout === 'row' ) {
		ld = cols + pad;
		s1 = ld; s2 = 1;
		ncomplex = off + ( ld * rows );
		base = off;
	} else if ( layout === 'neg' ) {
		ld = rows + pad;
		s1 = -1; s2 = ld;
		ncomplex = off + ( ld * cols );
		base = off + ( rows - 1 ); // first logical row sits at the high address
	} else { // 'col'
		ld = rows + pad;
		s1 = 1; s2 = ld;
		ncomplex = off + ( ld * cols );
		base = off;
	}
	return { data: new Complex128Array( randArray( 2 * Math.max( 1, ncomplex ) ) ), s1, s2, off: base };
}

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

function reinterpretFlat( c ) {
	return new Float64Array( c.data.buffer, c.data.byteOffset, c.data.length * 2 );
}

function runCase( fn, c ) {
	const nota = ( c.transa === 'no-transpose' );
	const notb = ( c.transb === 'no-transpose' );
	const aRows = nota ? c.M : c.K;
	const aCols = nota ? c.K : c.M;
	const bRows = notb ? c.K : c.N;
	const bCols = notb ? c.N : c.K;
	const A = makeMat( aRows, aCols, c.la, c.pad, c.off );
	const B = makeMat( bRows, bCols, c.lb, c.pad, c.off );
	const C = makeMat( c.M, c.N, c.lc, c.pad, c.off );

	const Cref = new Complex128Array( C.data );
	const Cvar = new Complex128Array( C.data );

	v0( c.transa, c.transb, c.M, c.N, c.K, c.alpha, A.data, A.s1, A.s2, A.off, B.data, B.s1, B.s2, B.off, c.beta, Cref, C.s1, C.s2, C.off );
	fn( c.transa, c.transb, c.M, c.N, c.K, c.alpha, A.data, A.s1, A.s2, A.off, B.data, B.s1, B.s2, B.off, c.beta, Cvar, C.s1, C.s2, C.off );

	return maxRelErr( reinterpretFlat( { data: Cref } ), reinterpretFlat( { data: Cvar } ) );
}

function check( fn ) {
	const modes = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
	const layouts = [ 'col', 'row', 'neg' ];
	const shapes = [
		{ M: 1, N: 1, K: 1 },
		{ M: 2, N: 2, K: 0 },
		{ M: 2, N: 3, K: 1 },
		{ M: 3, N: 2, K: 2 },
		{ M: 4, N: 4, K: 3 },
		{ M: 5, N: 7, K: 4 },
		{ M: 7, N: 5, K: 5 },
		{ M: 8, N: 8, K: 7 },
		{ M: 9, N: 9, K: 8 },
		{ M: 13, N: 11, K: 17 },
		{ M: 1, N: 8, K: 5 },
		{ M: 8, N: 1, K: 5 },
		{ M: 16, N: 16, K: 64 }
	];
	const scalars = [
		{ alpha: new Complex128( 1.0, 0.0 ), beta: new Complex128( 0.0, 0.0 ) },
		{ alpha: new Complex128( 1.0, 0.0 ), beta: new Complex128( 1.0, 0.0 ) },
		{ alpha: new Complex128( 2.0, -1.5 ), beta: new Complex128( -0.5, 0.75 ) },
		{ alpha: new Complex128( 0.0, 0.0 ), beta: new Complex128( 2.0, 1.0 ) },
		{ alpha: new Complex128( -1.0, 0.0 ), beta: new Complex128( 0.0, 0.0 ) },
		{ alpha: new Complex128( 0.0, 1.0 ), beta: new Complex128( 1.0, 0.0 ) }
	];
	let worst = 0;
	let ncase = 0;
	// Full transpose x layout coverage on a representative subset of scalars,
	// plus full scalar coverage on a smaller mode/layout subset (keeps the
	// gate thorough without a combinatorial blowup).
	for ( const transa of modes ) {
	for ( const transb of modes ) {
	for ( const la of layouts ) {
	for ( const lb of layouts ) {
	for ( const lc of layouts ) {
	for ( let s = 0; s < scalars.length; s++ ) {
		// Thin the scalar sweep except on plain col-major to bound runtime:
		if ( !( la === 'col' && lb === 'col' && lc === 'col' ) && s > 2 ) continue;
		for ( const sh of shapes ) {
			for ( const pad of [ 0, 2 ] ) {
				const off = ( pad === 0 ) ? 0 : 3;
				const tol = BASE_RTOL * ( sh.K + 4 );
				const e = runCase( fn, {
					transa, transb, la, lb, lc,
					M: sh.M, N: sh.N, K: sh.K,
					alpha: scalars[ s ].alpha, beta: scalars[ s ].beta,
					pad, off
				} );
				ncase += 1;
				if ( e > worst ) worst = e;
				if ( e > tol ) {
					console.log( 'FAIL ' + transa + '/' + transb + ' la=' + la + ' lb=' + lb + ' lc=' + lc + ' M=' + sh.M + ' N=' + sh.N + ' K=' + sh.K + ' s=' + s + ' pad=' + pad + ' err=' + e.toExponential( 3 ) );
					return { worst, ncase, fail: true };
				}
			}
		}
	}}}}}}
	return { worst, ncase, fail: false };
}

let files = process.argv.slice( 2 );
if ( files.length === 0 ) {
	files = readdirSync( join( __dirname, 'variants' ) )
		.filter( ( f ) => /\.js$/.test( f ) && f !== 'v0-reference.js' )
		.sort();
}

let totalFail = 0;
for ( const f of files ) {
	const spec = f.charAt( 0 ) === '.' || f.includes( '/' ) ? f : './variants/' + f;
	const mod = await import( spec );
	const fn = mod.default;
	const r = check( fn );
	if ( r.fail ) totalFail += 1;
	console.log( ( r.fail ? 'FAIL' : 'PASS' ) + '  ' + f + '  worstRelErr=' + r.worst.toExponential( 3 ) + '  cases=' + r.ncase );
}
console.log( ( totalFail === 0 ? 'PASS' : 'FAIL' ) + ': ' + files.length + ' variants, ' + totalFail + ' failures' );
process.exit( totalFail ? 1 : 0 );
