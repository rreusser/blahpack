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
const shapes = [ [ 500, 500 ], [ 2000, 2000 ], [ 5000, 100 ], [ 100, 5000 ] ];
for ( const [ M, N ] of shapes ) {
	for ( const layout of [ 'col', 'row' ] ) {
		const sa1 = layout === 'col' ? 1 : N;
		const sa2 = layout === 'col' ? M : 1;
		const A = rand( M * N );
		for ( const trans of [ 'no-transpose', 'transpose' ] ) {
			const lenx = trans === 'no-transpose' ? N : M;
			const leny = trans === 'no-transpose' ? M : N;
			const x = rand( lenx );
			const y = rand( leny );
			const [ a, b ] = race( [
				{ fn: () => v0( trans, M, N, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ) },
				{ fn: () => v1( trans, M, N, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ) }
			] );
			const gf = ( ms ) => ( 2 * M * N ) / ( ms * 1e6 );
			console.log(
				( M + 'x' + N + ' ' + layout + ' ' + ( trans === 'no-transpose' ? 'N' : 'T' ) ).padEnd( 44 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
			);
		}
	}
}
