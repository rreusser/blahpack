// A/B benchmark: v0-reference vs v1-blocked, interleaved min-of-trials.
// Repeated in-place solves are kept bounded by using a near-identity A
// (unit-magnitude diagonal, off-diagonal scaled 0.5/n) and renormalizing B
// to unit max-magnitude after every solve; B is asserted finite/nonzero at
// the end so a degenerate run (underflow to zeros) cannot fake a speedup.
// Shipped register-tiled dgemm at the same n is printed as the roofline.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-blocked.js';
import dgemm from '../../lib/blas/base/dgemm/lib/base.js';

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

// Near-identity triangular A (col-major k x k), diag exactly 1.0:
function makeA( k, uplo ) {
	const A = new Float64Array( k * k );
	const scale = 0.5 / k;
	for ( let j = 0; j < k; j++ ) {
		for ( let i = 0; i < k; i++ ) {
			const stored = ( uplo === 'upper' ) ? ( j >= i ) : ( j <= i );
			if ( !stored ) continue;
			A[ i + ( j * k ) ] = ( i === j ) ? 1.0 : ( ( 2.0 * Math.random() ) - 1.0 ) * scale;
		}
	}
	return A;
}

// Rescale B to unit max-magnitude so repeated in-place solves stay bounded:
function renorm( B ) {
	let mx = 0.0;
	for ( let i = 0; i < B.length; i++ ) {
		const v = Math.abs( B[ i ] );
		if ( v > mx ) mx = v;
	}
	const s = 1.0 / mx;
	for ( let i = 0; i < B.length; i++ ) B[ i ] *= s;
}

function assertHealthy( B, label ) {
	let mx = 0.0;
	let nz = 0;
	for ( let i = 0; i < B.length; i++ ) {
		if ( !Number.isFinite( B[ i ] ) ) {
			throw new Error( `${label}: non-finite B[${i}] = ${B[ i ]}` );
		}
		const v = Math.abs( B[ i ] );
		if ( v > mx ) mx = v;
		if ( v === 0.0 ) nz += 1;
	}
	if ( !( mx > 1.0e-3 ) || nz > B.length / 100 ) {
		throw new Error( `${label}: degenerate B (max=${mx}, zeros=${nz}/${B.length})` );
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
			for ( let k = 0; k < c.batch; k++ ) c.fn();
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
	[ 'left', 'lower', 'transpose', 'col' ],
	[ 'left', 'upper', 'no-transpose', 'row' ],
	[ 'right', 'upper', 'no-transpose', 'col' ]
];

console.log( 'case'.padEnd( 44 ) + 'v0'.padStart( 12 ) + 'v1'.padStart( 12 ) + 'speedup'.padStart( 10 ) );
for ( const n of [ 128, 256, 512 ] ) {
	// dgemm roofline at this size (col-major NN):
	{
		const A = rand( n * n );
		const Bm = rand( n * n );
		const C = rand( n * n );
		const [ g ] = race( [
			{ fn: () => dgemm( 'no-transpose', 'no-transpose', n, n, n, 1.0, A, 1, n, 0, Bm, 1, n, 0, 0.0, C, 1, n, 0 ) }
		] );
		console.log( `--- n=${n}: shipped dgemm roofline ${( ( 2 * n * n * n ) / ( g.best * 1e6 ) ).toFixed( 2 )} GF/s ---` );
	}
	for ( const [ side, uplo, transa, layout ] of combos ) {
		const A = makeA( n, uplo );
		const sa1 = layout === 'col' ? 1 : n;
		const sa2 = layout === 'col' ? n : 1;
		const sb1 = layout === 'col' ? 1 : n;
		const sb2 = layout === 'col' ? n : 1;
		const Bseed = rand( n * n );
		const B0 = Bseed.slice();
		const B1 = Bseed.slice();
		const [ a, b ] = race( [
			{ fn: () => { v0( side, uplo, transa, 'non-unit', n, n, 1.0, A, sa1, sa2, 0, B0, sb1, sb2, 0 ); renorm( B0 ); } },
			{ fn: () => { v1( side, uplo, transa, 'non-unit', n, n, 1.0, A, sa1, sa2, 0, B1, sb1, sb2, 0 ); renorm( B1 ); } }
		] );
		assertHealthy( B0, 'v0 ' + side + '/' + uplo + '/' + transa + '/' + layout + ' n=' + n );
		assertHealthy( B1, 'v1 ' + side + '/' + uplo + '/' + transa + '/' + layout + ' n=' + n );
		const gf = ( ms ) => ( n * n * n ) / ( ms * 1e6 );
		console.log(
			( side + ' ' + uplo + ' ' + ( transa === 'no-transpose' ? 'N' : 'T' ) + ' ' + layout + ' n=' + n ).padEnd( 44 ) +
			( gf( a.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( gf( b.best ).toFixed( 2 ) + ' GF/s' ).padStart( 12 ) +
			( ( a.best / b.best ).toFixed( 2 ) + 'x' ).padStart( 10 )
		);
	}
}
