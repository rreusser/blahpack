// A/B benchmark: v0-reference vs v1-fastpath. Min-of-trials, interleaved
// (bench/dgemm-opt methodology) — read the ratios, not the absolute numbers.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-fastpath.js';

function randz( nc, scale ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( ( 2.0 * Math.random() ) - 1.0 ) * ( scale || 1.0 );
	return new Complex128Array( buf );
}

function race( cases, trials = 15, targetMs = 25 ) {
	for ( const c of cases ) {
		c.fn();
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

console.log( 'label'.padEnd( 40 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) );
for ( const N of [ 16, 128, 1024, 4096, 65536, 1 << 21 ] ) {
	for ( const [ tag, stride, scale ] of [ [ 'stride1', 1, 1.0 ], [ 'stride2', 2, 1.0 ], [ 'fallback(tiny)', 1, 1.0e-200 ] ] ) {
		const zx = randz( N * stride, scale );
		const [ a, b ] = race( [
			{ fn: () => v0( N, zx, stride, 0 ) },
			{ fn: () => v1( N, zx, stride, 0 ) }
		] );
		const gf = ( ms ) => ( 4 * N ) / ( ms * 1e6 ); // ~4 flops/complex elt
		console.log(
			( 'N=' + N + ' ' + tag ).padEnd( 40 ) +
			( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
		);
	}
}
