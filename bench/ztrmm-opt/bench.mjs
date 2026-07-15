// A/B benchmark: v0-reference vs v1-tiled, interleaved min-of-trials, with the
// shipped register-tiled zgemm as a roofline. ztrmm is in-place, so each timed
// call resets B from a pristine copy (an O(n^2) cost against O(n^3) work, paid
// identically by both variants); A is near-identity triangular and alpha = 1
// so a single application never under/overflows, and B is asserted finite and
// nonzero afterward (a prior d-campaign benchmark produced fake numbers when B
// underflowed to zeros and the reference's !== 0 guards skipped all work).
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-tiled.js';
import zgemm from '../../lib/blas/base/zgemm/lib/base.js';

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

// Near-identity triangular A (n x n, col-major, interleaved; full storage
// random garbage in the unstored triangle):
function triA( n, uplo, seedscale ) {
	const buf = new Float64Array( 2 * n * n );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( 2.0 * Math.random() ) - 1.0;
	for ( let j = 0; j < n; j++ ) {
		for ( let i = 0; i < n; i++ ) {
			const stored = ( uplo === 'upper' ) ? ( i <= j ) : ( i >= j );
			if ( !stored ) continue;
			const idx = 2 * ( i + ( j * n ) );
			if ( i === j ) {
				buf[ idx ] = 1.0 + ( 0.1 * Math.random() );
				buf[ idx + 1 ] = 0.05 * Math.random();
			} else {
				buf[ idx ] = seedscale * ( ( 2.0 * Math.random() ) - 1.0 );
				buf[ idx + 1 ] = seedscale * ( ( 2.0 * Math.random() ) - 1.0 );
			}
		}
	}
	return new Complex128Array( buf );
}

function assertSane( B, label ) {
	const f = reinterpret( B, 0 );
	let nz = 0;
	for ( let i = 0; i < f.length; i++ ) {
		if ( !Number.isFinite( f[ i ] ) ) throw new Error( label + ': B not finite at ' + i );
		if ( f[ i ] !== 0.0 ) nz += 1;
	}
	if ( nz === 0 ) throw new Error( label + ': B is all zeros — benchmark invalid' );
}

const ALPHA = new Complex128( 1.0, 0.0 );
const sizes = [ 64, 128, 256, 512 ];
const combos = [
	// [side, uplo, transa, B-layout]
	[ 'left', 'upper', 'no-transpose', 'col' ],
	[ 'left', 'lower', 'no-transpose', 'col' ],
	[ 'left', 'upper', 'transpose', 'col' ],
	[ 'left', 'upper', 'conjugate-transpose', 'col' ],
	[ 'left', 'lower', 'conjugate-transpose', 'col' ],
	[ 'left', 'upper', 'no-transpose', 'row' ],
	[ 'right', 'upper', 'no-transpose', 'col' ],
	[ 'right', 'lower', 'conjugate-transpose', 'col' ]
];

console.log( 'case'.padEnd( 44 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) + 'zgemm'.padStart( 12 ) );
for ( const n of sizes ) {
	// zgemm roofline (col-major, NN):
	const Ag = triA( n, 'upper', 0.3 );
	const Bg = triA( n, 'upper', 0.3 );
	const Cg = new Complex128Array( 2 * n * n );
	const [ g ] = race( [
		{ fn: () => zgemm( 'no-transpose', 'no-transpose', n, n, n, ALPHA, Ag, 1, n, 0, Bg, 1, n, 0, new Complex128( 0.0, 0.0 ), Cg, 1, n, 0 ) }
	] );
	const gemmGf = ( 8 * n * n * n ) / ( g.best * 1e6 ); // complex madd ~ 8 flops

	for ( const [ side, uplo, transa, blayout ] of combos ) {
		const A = triA( n, uplo, 0.5 / n );
		const seed = new Float64Array( 2 * n * n ).map( () => ( 2.0 * Math.random() ) - 1.0 );
		const sb1 = ( blayout === 'col' ) ? 1 : n;
		const sb2 = ( blayout === 'col' ) ? n : 1;
		const Bw0 = new Complex128Array( 2 * n * n );
		const Bw1 = new Complex128Array( 2 * n * n );
		const f0 = reinterpret( Bw0, 0 );
		const f1 = reinterpret( Bw1, 0 );
		const [ a, b ] = race( [
			{ fn: () => { f0.set( seed ); v0( side, uplo, transa, 'non-unit', n, n, ALPHA, A, 1, n, 0, Bw0, sb1, sb2, 0 ); } },
			{ fn: () => { f1.set( seed ); v1( side, uplo, transa, 'non-unit', n, n, ALPHA, A, 1, n, 0, Bw1, sb1, sb2, 0 ); } }
		] );
		assertSane( Bw0, 'v0 ' + side + '/' + uplo + '/' + transa );
		assertSane( Bw1, 'v1 ' + side + '/' + uplo + '/' + transa );
		// Complex triangular matmul: ~n^3 complex madds = 8 n^3 flops.
		const gf = ( ms ) => ( 8 * n * n * n ) / ( ms * 1e6 );
		const tt = ( transa === 'no-transpose' ) ? 'N' : ( transa === 'transpose' ? 'T' : 'C' );
		console.log(
			( n + ' ' + side + '/' + uplo + '/' + tt + ' B:' + blayout ).padEnd( 44 ) +
			( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 ) +
			( gemmGf.toFixed( 2 ) + ' GF/s' ).padStart( 12 )
		);
	}
}
