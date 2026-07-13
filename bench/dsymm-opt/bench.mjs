// A/B benchmark: v0-reference vs v1-tiled, interleaved min-of-trials.
// Shipped register-tiled dgemm at the same shape is printed as a roofline.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';
import dgemm from '../../lib/blas/base/dgemm/lib/base.js';

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

console.log( 'case'.padEnd( 34 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'dgemm'.padStart( 12 ) );
for ( const n of [ 128, 256, 512 ] ) {
	const M = n;
	const N = n;
	for ( const layout of [ 'col', 'row' ] ) {
		const sa1 = layout === 'col' ? 1 : n;
		const sa2 = layout === 'col' ? n : 1;
		const A = rand( n * n );
		const B = rand( M * N );
		const C = rand( M * N );
		for ( const [ side, uplo ] of [ [ 'left', 'upper' ], [ 'left', 'lower' ], [ 'right', 'upper' ], [ 'right', 'lower' ] ] ) {
			const [ a, b, g ] = race( [
				{ fn: () => v0( side, uplo, M, N, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.3, C, sa1, sa2, 0 ) },
				{ fn: () => v1( side, uplo, M, N, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.3, C, sa1, sa2, 0 ) },
				{ fn: () => dgemm( 'no-transpose', 'no-transpose', M, N, n, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.3, C, sa1, sa2, 0 ) }
			] );
			const gf = ( ms ) => ( 2 * M * N * n ) / ( ms * 1e6 );
			console.log(
				( n + ' ' + layout + ' ' + side + '/' + uplo ).padEnd( 34 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
				( gf( g.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 )
			);
		}
	}
}
