// A/B benchmark: v0-reference vs v1-tiled, interleaved min-of-trials.
// Also prints the shipped register-tiled dgemm on the same size as a
// roofline reference (dsyrk does ~half the flops of the same-size dgemm).
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

console.log( 'case'.padEnd( 36 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'dgemm'.padStart( 12 ) );
for ( const n of [ 128, 256, 512 ] ) {
	const k = n;
	for ( const layout of [ 'col', 'row' ] ) {
		// A is n×k in both trans modes here (n=k), C is n×n
		const sa1 = layout === 'col' ? 1 : k;
		const sa2 = layout === 'col' ? n : 1;
		const sc1 = layout === 'col' ? 1 : n;
		const sc2 = layout === 'col' ? n : 1;
		const A = rand( n * k );
		const B = rand( n * k );
		const C = rand( n * n );
		const Cg = rand( n * n );

		// dgemm roofline on the same size/layout (2*n*n*k flops)
		const [ g ] = race( [
			{ fn: () => dgemm( 'no-transpose', 'no-transpose', n, n, k, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.0, Cg, sc1, sc2, 0 ) }
		] );
		const gemmGF = ( 2 * n * n * k ) / ( g.best * 1e6 );

		for ( const uplo of [ 'upper', 'lower' ] ) {
			for ( const trans of [ 'no-transpose', 'transpose' ] ) {
				const [ a, b ] = race( [
					{ fn: () => v0( uplo, trans, n, k, 1.0, A, sa1, sa2, 0, 0.0, C, sc1, sc2, 0 ) },
					{ fn: () => v1( uplo, trans, n, k, 1.0, A, sa1, sa2, 0, 0.0, C, sc1, sc2, 0 ) }
				] );
				const gf = ( ms ) => ( n * ( n + 1 ) * k ) / ( ms * 1e6 );
				console.log(
					( 'n=k=' + n + ' ' + layout + ' ' + uplo[ 0 ].toUpperCase() + ' ' + ( trans === 'no-transpose' ? 'N' : 'T' ) ).padEnd( 36 ) +
					( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
					( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
					( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
					( gemmGF.toFixed( 2 ) + ' GF/s' ).padStart( 12 )
				);
			}
		}
	}
}
