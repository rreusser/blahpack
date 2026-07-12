// A/B benchmark: v0-reference vs v1-tiled, interleaved min-of-trials, with
// the shipped register-tiled dgemm as a roofline. dtrmm is in-place, so each
// timed call resets B from a pristine copy (an O(n^2) cost against O(n^3)
// work, paid identically by both variants); A is near-identity triangular and
// alpha = 1.0 so a single application never under/overflows, and B is
// asserted finite and nonzero afterward (a prior benchmark produced fake
// numbers when B underflowed to zeros and the reference's !== 0 guards
// skipped all work).
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';
import dgemm from '../../lib/blas/base/dgemm/lib/base.js';

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

// Near-identity triangular A (n x n, col-major, full storage random garbage
// in the unstored triangle):
function triA( n, uplo, seedscale ) {
	const A = new Float64Array( n * n );
	for ( let i = 0; i < n * n; i++ ) A[ i ] = ( 2.0 * Math.random() ) - 1.0;
	for ( let j = 0; j < n; j++ ) {
		for ( let i = 0; i < n; i++ ) {
			const stored = ( uplo === 'upper' ) ? ( i <= j ) : ( i >= j );
			if ( !stored ) continue;
			A[ i + ( j * n ) ] = ( i === j ) ?
				1.0 + ( 0.1 * Math.random() ) :
				( seedscale * ( ( 2.0 * Math.random() ) - 1.0 ) );
		}
	}
	return A;
}

function assertSane( B, label ) {
	let nz = 0;
	for ( let i = 0; i < B.length; i++ ) {
		if ( !Number.isFinite( B[ i ] ) ) throw new Error( label + ': B not finite at ' + i );
		if ( B[ i ] !== 0.0 ) nz += 1;
	}
	if ( nz === 0 ) throw new Error( label + ': B is all zeros — benchmark invalid' );
}

const sizes = [ 128, 256, 512 ];
const combos = [
	// [side, uplo, transa, B-layout]
	[ 'left', 'upper', 'no-transpose', 'col' ],
	[ 'left', 'lower', 'no-transpose', 'col' ],
	[ 'left', 'upper', 'transpose', 'col' ],
	[ 'left', 'lower', 'transpose', 'col' ],
	[ 'left', 'upper', 'no-transpose', 'row' ],
	[ 'right', 'upper', 'no-transpose', 'col' ]
];

console.log( 'case'.padEnd( 40 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'dgemm'.padStart( 12 ) );
for ( const n of sizes ) {
	// dgemm roofline (col-major, NN):
	const Ag = new Float64Array( n * n ).map( () => ( 2.0 * Math.random() ) - 1.0 );
	const Bg = new Float64Array( n * n ).map( () => ( 2.0 * Math.random() ) - 1.0 );
	const Cg = new Float64Array( n * n );
	const [ g ] = race( [
		{ fn: () => dgemm( 'no-transpose', 'no-transpose', n, n, n, 1.0, Ag, 1, n, 0, Bg, 1, n, 0, 0.0, Cg, 1, n, 0 ) }
	] );
	const gemmGf = ( 2 * n * n * n ) / ( g.best * 1e6 );

	for ( const [ side, uplo, transa, blayout ] of combos ) {
		const A = triA( n, uplo, 0.5 / n );
		const B0seed = new Float64Array( n * n ).map( () => ( 2.0 * Math.random() ) - 1.0 );
		const sb1 = ( blayout === 'col' ) ? 1 : n;
		const sb2 = ( blayout === 'col' ) ? n : 1;
		const Bw0 = new Float64Array( n * n );
		const Bw1 = new Float64Array( n * n );
		const [ a, b ] = race( [
			{ fn: () => { Bw0.set( B0seed ); v0( side, uplo, transa, 'non-unit', n, n, 1.0, A, 1, n, 0, Bw0, sb1, sb2, 0 ); } },
			{ fn: () => { Bw1.set( B0seed ); v1( side, uplo, transa, 'non-unit', n, n, 1.0, A, 1, n, 0, Bw1, sb1, sb2, 0 ); } }
		] );
		assertSane( Bw0, 'v0 ' + side + '/' + uplo + '/' + transa );
		assertSane( Bw1, 'v1 ' + side + '/' + uplo + '/' + transa );
		// Triangular matmul: ~n^2*N multiply-adds = n^3 flops for square B.
		const gf = ( ms ) => ( n * n * n ) / ( ms * 1e6 );
		console.log(
			( n + ' ' + side + '/' + uplo + '/' + ( transa === 'no-transpose' ? 'N' : 'T' ) + ' B:' + blayout ).padEnd( 40 ) +
			( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
			( gemmGf.toFixed( 2 ) + ' GF/s' ).padStart( 12 )
		);
	}
}
