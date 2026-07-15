// A/B benchmark: v0-reference vs complex tile variants. Min-of-trials,
// interleaved (bench/dgemm-opt methodology) — read the RATIOS, not absolutes.
//
// Benchmark-trap guard (from the d-campaign): fresh finite A/B every case,
// alpha=1/beta=0 so each call OVERWRITES C (operands never underflow toward
// zero across repeated calls); C is asserted finite after the race.
//
// Usage: node bench.mjs [variant-file ...]   (default: representative set)
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';

const ALPHA = new Complex128( 1.0, 0.0 );
const BETA = new Complex128( 0.0, 0.0 );

function randz( nc ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return new Complex128Array( buf );
}

function race( cases, trials = 12, targetMs = 40 ) {
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

// Modes to sweep. Column-major (s1=1,s2=ld) for all operands.
const MODES = [
	[ 'NN', 'no-transpose', 'no-transpose' ],
	[ 'CN', 'conjugate-transpose', 'no-transpose' ],
	[ 'NC', 'no-transpose', 'conjugate-transpose' ],
	[ 'CC', 'conjugate-transpose', 'conjugate-transpose' ],
	[ 'TN', 'transpose', 'no-transpose' ]
];
const SIZES = [ 8, 16, 32, 64, 128, 256 ];

let files = process.argv.slice( 2 );
if ( files.length === 0 ) {
	files = [ 'gen-2x2.js', 'gen-4x2.js', 'gen-2x4.js', 'pack-2x2.js' ];
}
const variants = [];
for ( const f of files ) {
	const spec = f.includes( '/' ) ? f : './variants/' + f;
	variants.push( { name: f.replace( /\.js$/, '' ), fn: ( await import( spec ) ).default } );
}

// Header
const hdr = 'size/mode'.padEnd( 14 ) + 'v0 GF/s'.padStart( 10 );
console.log( hdr + variants.map( ( v ) => ( v.name + ' x' ).padStart( 16 ) ).join( '' ) );

// Track geometric-mean speedup per variant across the sweep.
const gm = variants.map( () => ( { sum: 0, n: 0 } ) );

for ( const N of SIZES ) {
	for ( const [ tag, ta, tb ] of MODES ) {
		const ld = N;
		const A = randz( ld * N );
		const B = randz( ld * N );
		const C = new Complex128Array( ld * N );
		const gf = ( ms ) => ( 8 * N * N * N ) / ( ms * 1e6 );

		const cases = [ { fn: () => v0( ta, tb, N, N, N, ALPHA, A, 1, ld, 0, B, 1, ld, 0, BETA, C, 1, ld, 0 ) } ];
		for ( const v of variants ) {
			cases.push( { fn: () => v.fn( ta, tb, N, N, N, ALPHA, A, 1, ld, 0, B, 1, ld, 0, BETA, C, 1, ld, 0 ) } );
		}
		race( cases );
		assertFinite( C, tag + ' N=' + N );

		const base = cases[ 0 ].best;
		let line = ( 'N=' + N + ' ' + tag ).padEnd( 14 ) + gf( base ).toFixed( 2 ).padStart( 10 );
		for ( let i = 0; i < variants.length; i++ ) {
			const sp = base / cases[ i + 1 ].best;
			gm[ i ].sum += Math.log( sp );
			gm[ i ].n += 1;
			line += ( gf( cases[ i + 1 ].best ).toFixed( 1 ) + ' ' + sp.toFixed( 2 ) + 'x' ).padStart( 16 );
		}
		console.log( line );
	}
}

console.log( '\ngeomean speedup:' );
for ( let i = 0; i < variants.length; i++ ) {
	console.log( '  ' + variants[ i ].name.padEnd( 14 ) + Math.exp( gm[ i ].sum / gm[ i ].n ).toFixed( 3 ) + 'x' );
}
