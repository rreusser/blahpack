// A/B benchmark: v0-reference vs v1-blocked, interleaved min-of-trials
// (bench/dgemm-opt methodology). Read the speedup ratios, not the absolute
// GF/s. Sweeps sizes, layouts, and all three ops (N/T/C).
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';

function randz( nc ) {
	const buf = new Float64Array( 2 * Math.max( nc, 1 ) );
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

const alpha = new Complex128( 0.7, -0.4 );
const beta = new Complex128( 0.3, 0.2 );

const opTag = { 'no-transpose': 'N', 'transpose': 'T', 'conjugate-transpose': 'C' };

console.log( 'case'.padEnd( 40 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) );
const shapes = [ [ 500, 500 ], [ 2000, 2000 ], [ 5000, 100 ], [ 100, 5000 ] ];
for ( const [ M, N ] of shapes ) {
	for ( const layout of [ 'col', 'row' ] ) {
		// Strides in complex elements.
		const sa1 = layout === 'col' ? 1 : N;
		const sa2 = layout === 'col' ? M : 1;
		const A = randz( M * N );
		for ( const trans of [ 'no-transpose', 'transpose', 'conjugate-transpose' ] ) {
			const lenx = trans === 'no-transpose' ? N : M;
			const leny = trans === 'no-transpose' ? M : N;
			const x = randz( lenx );
			const y = randz( leny );
			const [ a, b ] = race( [
				{ fn: () => v0( trans, M, N, alpha, A, sa1, sa2, 0, x, 1, 0, beta, y, 1, 0 ) },
				{ fn: () => v1( trans, M, N, alpha, A, sa1, sa2, 0, x, 1, 0, beta, y, 1, 0 ) }
			] );
			// ~8 flops per complex madd, one per matrix element.
			const gf = ( ms ) => ( 8 * M * N ) / ( ms * 1e6 );
			console.log(
				( M + 'x' + N + ' ' + layout + ' ' + opTag[ trans ] ).padEnd( 40 ) +
				( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
				( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
			);
		}
	}
}
