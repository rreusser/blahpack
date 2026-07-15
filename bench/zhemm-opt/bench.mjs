// A/B benchmark: v0-reference vs v1-packed. Min-of-trials, interleaved
// (bench/dgemm-opt methodology) — read the RATIOS, not absolutes. Sweeps
// size x side x uplo. Shipped zgemm at the same shape is a roofline.
//
// Benchmark-trap guard: fresh finite A/B/C every size, alpha=1/beta=0.3 (C is
// read+written but operands never drift toward underflow across repeats); C is
// asserted finite after each race.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-packed.js';
import zgemm from '../../lib/blas/base/zgemm/lib/base.js';

const ALPHA = new Complex128( 1.0, 0.0 );
const BETA = new Complex128( 0.3, 0.0 );

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

const SIZES = [ 32, 64, 128, 256, 512 ];
const SU = [ [ 'left', 'upper' ], [ 'left', 'lower' ], [ 'right', 'upper' ], [ 'right', 'lower' ] ];

console.log( 'case'.padEnd( 26 ) + 'v0 GF/s'.padStart( 12 ) + 'v1 GF/s'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'zgemm'.padStart( 12 ) );

let sumLog = 0;
let nRatio = 0;

for ( const n of SIZES ) {
	const M = n;
	const N = n;
	const ld = n;
	const A = randz( ld * n );
	const B = randz( ld * N );
	const C = randz( M * N );
	const gf = ( ms ) => ( 8 * M * N * n ) / ( ms * 1e6 );
	for ( const [ side, uplo ] of SU ) {
		const cases = race( [
			{ fn: () => v0( side, uplo, M, N, ALPHA, A, 1, ld, 0, B, 1, ld, 0, BETA, C, 1, ld, 0 ) },
			{ fn: () => v1( side, uplo, M, N, ALPHA, A, 1, ld, 0, B, 1, ld, 0, BETA, C, 1, ld, 0 ) },
			{ fn: () => zgemm( 'no-transpose', 'no-transpose', M, N, n, ALPHA, A, 1, ld, 0, B, 1, ld, 0, BETA, C, 1, ld, 0 ) }
		] );
		assertFinite( C, side + '/' + uplo + ' N=' + n );
		const sp = cases[ 0 ].best / cases[ 1 ].best;
		sumLog += Math.log( sp ); nRatio += 1;
		console.log(
			( n + ' ' + side + '/' + uplo ).padEnd( 26 ) +
			gf( cases[ 0 ].best ).toFixed( 2 ).padStart( 12 ) +
			gf( cases[ 1 ].best ).toFixed( 2 ).padStart( 12 ) +
			( sp.toFixed( 2 ) + 'x' ).padStart( 10 ) +
			gf( cases[ 2 ].best ).toFixed( 2 ).padStart( 12 )
		);
	}
}

console.log( '\ngeomean speedup: ' + Math.exp( sumLog / nRatio ).toFixed( 3 ) + 'x' );
