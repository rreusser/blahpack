// A/B benchmark: v0-reference vs v1-blocked. Min-of-trials, interleaved
// (bench/dgemm-opt methodology) — read the ratios, not the absolute numbers.
//
// Memory-bound symmetric rank-2 update: one read + one write per stored
// triangle element for four flops, so the ceiling is streaming bandwidth.
// `alpha` is kept tiny so repeated in-place updates stay bounded.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
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

const ALPHA = 1.0e-9;

console.log( 'case'.padEnd( 34 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'A GB/s (v1)'.padStart( 14 ) );
for ( const n of [ 500, 2000 ] ) {
	for ( const layout of [ 'col', 'row' ] ) {
		for ( const uplo of [ 'upper', 'lower' ] ) {
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? n : 1;
			const A0 = rand( n * n );
			const A1 = A0.slice();
			const x = rand( n );
			const y = rand( n );
			const [ a, b ] = race( [
				{ fn: () => v0( uplo, n, ALPHA, x, 1, 0, y, 1, 0, A0, sa1, sa2, 0 ) },
				{ fn: () => v1( uplo, n, ALPHA, x, 1, 0, y, 1, 0, A1, sa1, sa2, 0 ) }
			] );
			// ~half the matrix (the stored triangle) at 4 flops per element:
			const gf = ( ms ) => ( 2 * n * n ) / ( ms * 1e6 );
			const gbs = ( ms ) => ( 8 * n * n ) / ( ms * 1e6 );
			console.log(
				( n + 'x' + n + ' ' + layout + ' ' + uplo ).padEnd( 34 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
				( gbs( b.best ).toFixed( 1 ) ).padStart( 14 )
			);
		}
	}
}
