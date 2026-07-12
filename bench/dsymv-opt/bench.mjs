// A/B benchmark: v0-reference vs v1-blocked, interleaved min-of-trials.
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

console.log( 'case'.padEnd( 44 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) );
for ( const n of [ 500, 2000 ] ) {
	for ( const layout of [ 'col', 'row' ] ) {
		const sa1 = layout === 'col' ? 1 : n;
		const sa2 = layout === 'col' ? n : 1;
		const A = rand( n * n );
		for ( const uplo of [ 'upper', 'lower' ] ) {
			const x = rand( n );
			const y = rand( n );
			const [ a, b ] = race( [
				{ fn: () => v0( uplo, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ) },
				{ fn: () => v1( uplo, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ) }
			] );
			const gf = ( ms ) => ( 2 * n * n ) / ( ms * 1e6 );
			console.log(
				( n + 'x' + n + ' ' + layout + ' ' + uplo ).padEnd( 44 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
			);
		}
	}
}
