// A/B benchmark: v0-reference vs v1-blocked, interleaved min-of-trials
// (bench/dgemm-opt methodology) -- read the ratios, not the absolute numbers.
//
// Repeated in-place solves are kept bounded by using a near-identity A
// (unit-magnitude diagonal, off-diagonal scaled 0.5/n) and renormalizing B to
// unit max-magnitude after every solve; B is asserted finite/nonzero at the
// end so a degenerate run (underflow to zeros) cannot fake a speedup. The
// shipped zgemm at the same n is printed as the roofline.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';
import zgemm from '../../lib/blas/base/zgemm/lib/base.js';

const ONE = new Complex128( 1.0, 0.0 );
const ZERO = new Complex128( 0.0, 0.0 );

function randz( nc ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < buf.length; i++ ) { buf[ i ] = ( 2.0 * Math.random() ) - 1.0; }
	return new Complex128Array( buf );
}

// Near-identity complex triangular A (col-major k x k), diag exactly 1+0i:
function makeA( k, uplo ) {
	const buf = new Float64Array( 2 * k * k );
	const scale = 0.5 / k;
	for ( let j = 0; j < k; j++ ) {
		for ( let i = 0; i < k; i++ ) {
			const stored = ( uplo === 'upper' ) ? ( j >= i ) : ( j <= i );
			if ( !stored ) { continue; }
			const idx = ( i + ( j * k ) ) * 2;
			if ( i === j ) {
				buf[ idx ] = 1.0; buf[ idx + 1 ] = 0.0;
			} else {
				buf[ idx ] = ( ( 2.0 * Math.random() ) - 1.0 ) * scale;
				buf[ idx + 1 ] = ( ( 2.0 * Math.random() ) - 1.0 ) * scale;
			}
		}
	}
	return new Complex128Array( buf );
}

function view( z ) {
	return new Float64Array( z.buffer, z.byteOffset, z.length * 2 );
}

// Rescale B to unit max-magnitude so repeated in-place solves stay bounded:
function renorm( B ) {
	const v = view( B );
	let mx = 0.0;
	for ( let i = 0; i < v.length; i++ ) {
		const a = Math.abs( v[ i ] );
		if ( a > mx ) { mx = a; }
	}
	const s = 1.0 / mx;
	for ( let i = 0; i < v.length; i++ ) { v[ i ] *= s; }
}

function assertHealthy( B, label ) {
	const v = view( B );
	let mx = 0.0;
	let nz = 0;
	for ( let i = 0; i < v.length; i++ ) {
		if ( !Number.isFinite( v[ i ] ) ) {
			throw new Error( `${label}: non-finite B[${i}] = ${v[ i ]}` );
		}
		const a = Math.abs( v[ i ] );
		if ( a > mx ) { mx = a; }
		if ( a === 0.0 ) { nz += 1; }
	}
	if ( !( mx > 1.0e-3 ) || nz > v.length / 100 ) {
		throw new Error( `${label}: degenerate B (max=${mx}, zeros=${nz}/${v.length})` );
	}
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
			for ( let k = 0; k < c.batch; k++ ) { c.fn(); }
			c.best = Math.min( c.best, ( performance.now() - t0 ) / c.batch );
		}
	}
	return cases;
}

const combos = [
	// [side, uplo, transa, layout]
	[ 'left', 'upper', 'no-transpose', 'col' ],
	[ 'left', 'lower', 'no-transpose', 'col' ],
	[ 'left', 'upper', 'transpose', 'col' ],
	[ 'left', 'upper', 'conjugate-transpose', 'col' ],
	[ 'left', 'lower', 'conjugate-transpose', 'col' ],
	[ 'left', 'upper', 'no-transpose', 'row' ],
	[ 'right', 'upper', 'no-transpose', 'col' ],
	[ 'right', 'lower', 'conjugate-transpose', 'col' ]
];

console.log( 'case'.padEnd( 48 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) );
for ( const n of [ 128, 256, 512 ] ) {
	// zgemm roofline at this size (col-major NN); ~8 flops/complex madd:
	{
		const A = randz( n * n );
		const Bm = randz( n * n );
		const C = randz( n * n );
		const [ g ] = race( [
			{ fn: () => zgemm( 'no-transpose', 'no-transpose', n, n, n, ONE, A, 1, n, 0, Bm, 1, n, 0, ZERO, C, 1, n, 0 ) }
		] );
		console.log( `--- n=${n}: shipped zgemm roofline ${( ( 8 * n * n * n ) / ( g.best * 1e6 ) ).toFixed( 2 )} GF/s ---` );
	}
	for ( const [ side, uplo, transa, layout ] of combos ) {
		const A = makeA( n, uplo );
		const sa1 = layout === 'col' ? 1 : n;
		const sa2 = layout === 'col' ? n : 1;
		const sb1 = layout === 'col' ? 1 : n;
		const sb2 = layout === 'col' ? n : 1;
		const Bseed = randz( n * n );
		const B0 = new Complex128Array( view( Bseed ).slice() );
		const B1 = new Complex128Array( view( Bseed ).slice() );
		const [ a, b ] = race( [
			{ fn: () => { v0( side, uplo, transa, 'non-unit', n, n, ONE, A, sa1, sa2, 0, B0, sb1, sb2, 0 ); renorm( B0 ); } },
			{ fn: () => { v1( side, uplo, transa, 'non-unit', n, n, ONE, A, sa1, sa2, 0, B1, sb1, sb2, 0 ); renorm( B1 ); } }
		] );
		assertHealthy( B0, 'v0 ' + side + '/' + uplo + '/' + transa + '/' + layout + ' n=' + n );
		assertHealthy( B1, 'v1 ' + side + '/' + uplo + '/' + transa + '/' + layout + ' n=' + n );
		// ~4 complex mults * (n^3 madds over the triangle ~ n^3/2) -> use 4*n^3
		// as a consistent per-solve work proxy; ratios are what matter:
		const gf = ( ms ) => ( 4 * n * n * n ) / ( ms * 1e6 );
		const t = ( transa === 'no-transpose' ) ? 'N' : ( transa === 'transpose' ? 'T' : 'C' );
		console.log(
			( side + ' ' + uplo + ' ' + t + ' ' + layout + ' n=' + n ).padEnd( 48 ) +
			( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
		);
	}
}
