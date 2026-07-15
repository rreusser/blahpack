// A/B benchmark: v0 (reference) vs v1 (register-blocked) for BOTH zgeru and
// zgerc. Min-of-trials, interleaved (bench/dgemm-opt methodology) — read the
// ratios, not the absolute numbers.
//
// Complex rank-1 does 4x the arithmetic per byte of the real dger, so the
// ceiling is less purely memory-bound. `alpha` is kept tiny so repeated
// in-place updates cannot grow A without bound across timing iterations.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0u from './variants/v0-zgeru.js';
import v0c from './variants/v0-zgerc.js';
import v1u from './variants/v1-zgeru.js';
import v1c from './variants/v1-zgerc.js';

function randz( nc ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return new Complex128Array( buf );
}

function race( cases, trials = 13, targetMs = 30 ) {
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

const ALPHA = new Complex128( 1.0e-9, 1.0e-9 );

for ( const [ name, v0, v1 ] of [ [ 'zgeru', v0u, v1u ], [ 'zgerc', v0c, v1c ] ] ) {
	console.log( '\n=== ' + name + ' ===' );
	console.log( 'case'.padEnd( 30 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'A GB/s (v1)'.padStart( 14 ) );
	for ( const n of [ 200, 500, 2000 ] ) {
		for ( const layout of [ 'col', 'row' ] ) {
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? n : 1;
			const A0 = randz( n * n );
			const A1 = new Complex128Array( A0.buffer.slice( 0 ) );
			const x = randz( n );
			const y = randz( n );
			const [ a, b ] = race( [
				{ fn: () => v0( n, n, ALPHA, x, 1, 0, y, 1, 0, A0, sa1, sa2, 0 ) },
				{ fn: () => v1( n, n, ALPHA, x, 1, 0, y, 1, 0, A1, sa1, sa2, 0 ) }
			] );
			// 8 flops per complex element (4 mul + 2 add for x*temp, 2 add into A).
			const gf = ( ms ) => ( 8 * n * n ) / ( ms * 1e6 );
			// A: one complex read + one complex write per element = 32 bytes.
			const gbs = ( ms ) => ( 32 * n * n ) / ( ms * 1e6 );
			console.log(
				( n + 'x' + n + ' ' + layout ).padEnd( 30 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
				( gbs( b.best ).toFixed( 1 ) ).padStart( 14 )
			);
		}
	}
}
