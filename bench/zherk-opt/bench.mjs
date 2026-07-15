// A/B benchmark: v0-reference vs v1-tiled zherk. Min-of-trials, interleaved
// (bench/dgemm-opt methodology) — read the RATIOS, not the absolutes. Sweeps
// size × uplo × trans (N: A*A^H, C: A^H*A). Fresh finite operands each case;
// alpha=1/beta=0 so each call overwrites C (operands never drift toward zero).
//
// Usage: node bench.mjs [variant-file ...]   (default: v1-tiled.js)
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import v0 from './variants/v0-reference.js';

function randz( nc ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return new Complex128Array( buf );
}

function race( cases, trials = 12, targetMs = 35 ) {
	for ( const c of cases ) {
		c.fn(); c.fn();
		const t0 = performance.now();
		c.fn();
		c.batch = Math.max( 1, Math.round( targetMs / Math.max( performance.now() - t0, 1e-4 ) ) );
		c.best = Infinity;
	}
	for ( let t = 0; t < trials; t++ ) {
		for ( const c of cases ) {
			const t0 = performance.now();
			for ( let k = 0; k < c.batch; k++ ) c.fn();
			c.best = Math.min( c.best, ( performance.now() - t0 ) / c.batch );
		}
	}
	return cases;
}

function assertFinite( C, label ) {
	const v = new Float64Array( C.buffer, C.byteOffset, C.length * 2 );
	for ( let i = 0; i < v.length; i++ ) {
		if ( !Number.isFinite( v[ i ] ) ) throw new Error( 'non-finite C in ' + label );
	}
}

const SIZES = [ 8, 16, 32, 64, 128, 256 ];

let files = process.argv.slice( 2 );
if ( files.length === 0 ) {
	files = [ 'v1-tiled.js' ];
}
const variants = [];
for ( const f of files ) {
	const spec = f.includes( '/' ) ? f : './variants/' + f;
	variants.push( { name: f.replace( /\.js$/, '' ), fn: ( await import( spec ) ).default } );
}

const hdr = 'size/mode'.padEnd( 16 ) + 'v0 GF/s'.padStart( 10 );
console.log( hdr + variants.map( ( v ) => ( v.name + ' x' ).padStart( 18 ) ).join( '' ) );

const gm = variants.map( () => ( { sum: 0, n: 0 } ) );

for ( const N of SIZES ) {
	const K = N;
	const ld = N;
	for ( const layout of [ 'col', 'row' ] ) {
		const sa1 = layout === 'col' ? 1 : ld;
		const sa2 = layout === 'col' ? ld : 1;
		const sc1 = layout === 'col' ? 1 : ld;
		const sc2 = layout === 'col' ? ld : 1;
		const A = randz( ld * N );
		const C = randz( ld * N );
		// zherk does N*(N+1)*K real-equivalent... complex flops ~ 4*N*(N+1)*K
		// (half of a same-size zgemm's 8*N*N*K). Report GF/s with this count.
		const gf = ( ms ) => ( 4 * N * ( N + 1 ) * K ) / ( ms * 1e6 );

		for ( const uplo of [ 'upper', 'lower' ] ) {
			for ( const [ tag, trans ] of [ [ 'N', 'no-transpose' ], [ 'C', 'conjugate-transpose' ] ] ) {
				const cases = [ { fn: () => v0( uplo, trans, N, K, 1.0, A, sa1, sa2, 0, 0.0, C, sc1, sc2, 0 ) } ];
				for ( const v of variants ) {
					cases.push( { fn: () => v.fn( uplo, trans, N, K, 1.0, A, sa1, sa2, 0, 0.0, C, sc1, sc2, 0 ) } );
				}
				race( cases );
				assertFinite( C, uplo + tag + ' N=' + N );
				const base = cases[ 0 ].best;
				let line = ( 'N=' + N + ' ' + layout + ' ' + uplo[ 0 ].toUpperCase() + tag ).padEnd( 16 ) + gf( base ).toFixed( 2 ).padStart( 10 );
				for ( let i = 0; i < variants.length; i++ ) {
					const sp = base / cases[ i + 1 ].best;
					gm[ i ].sum += Math.log( sp );
					gm[ i ].n += 1;
					line += ( gf( cases[ i + 1 ].best ).toFixed( 1 ) + ' ' + sp.toFixed( 2 ) + 'x' ).padStart( 18 );
				}
				console.log( line );
			}
		}
	}
}

console.log( '\ngeomean speedup:' );
for ( let i = 0; i < variants.length; i++ ) {
	console.log( '  ' + variants[ i ].name.padEnd( 14 ) + Math.exp( gm[ i ].sum / gm[ i ].n ).toFixed( 3 ) + 'x' );
}
