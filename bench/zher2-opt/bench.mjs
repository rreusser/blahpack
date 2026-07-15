// A/B benchmark: v0-reference vs v1-blocked. Min-of-trials, interleaved
// (bench/dgemm-opt methodology) — read the ratios, not the absolute numbers.
//
// Hermitian rank-2 update `A += alpha*x*y^H + conj(alpha)*y*x^H`: one read +
// one write of the stored triangle per complex element, two fused complex
// terms (16 flops) each. `alpha` is kept tiny so repeated in-place updates
// stay bounded.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

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

const ALPHA = new Complex128( 1.0e-9, 0.5e-9 );

console.log( 'case'.padEnd( 30 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'A GB/s (v1)'.padStart( 14 ) );
for ( const n of [ 100, 500, 2000 ] ) {
	for ( const layout of [ 'col', 'row' ] ) {
		for ( const uplo of [ 'upper', 'lower' ] ) {
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? n : 1;
			const A0 = randz( n * n );
			const A1 = randz( n * n );
			const x = randz( n );
			const y = randz( n );
			const [ a, b ] = race( [
				{ fn: () => v0( uplo, n, ALPHA, x, 1, 0, y, 1, 0, A0, sa1, sa2, 0 ) },
				{ fn: () => v1( uplo, n, ALPHA, x, 1, 0, y, 1, 0, A1, sa1, sa2, 0 ) }
			] );
			// ~half the matrix (the stored triangle) at 16 flops/complex element:
			const gf = ( ms ) => ( 8 * n * n ) / ( ms * 1e6 );
			// one read + one write of a complex element (16 bytes) over the triangle:
			const gbs = ( ms ) => ( 16 * n * n ) / ( ms * 1e6 );
			console.log(
				( n + 'x' + n + ' ' + layout + ' ' + uplo ).padEnd( 30 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
				( gbs( b.best ).toFixed( 1 ) ).padStart( 14 )
			);
		}
	}
}
