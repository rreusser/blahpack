// Benchmark: which translated BLAS routines have real optimization headroom?
//
// Methodology (matches bench/dgemm-opt): min-of-trials, round-robin
// interleaved timing so drift affects all cases equally. Ratios are the
// headline result, not absolute GFLOP/s.
//
// Usage: node bench-candidates.mjs <section>   (l1 | l2 | l3 | proto)

import { createRequire } from 'node:module';

const ROOT = new URL( "..", import.meta.url ).pathname.replace( /\/$/, "" );
const require = createRequire( ROOT + '/bench/dgemm-opt/package.json' );

const ddot = ( await import( ROOT + '/lib/blas/base/ddot/lib/base.js' ) ).default;
const daxpy = ( await import( ROOT + '/lib/blas/base/daxpy/lib/base.js' ) ).default;
const dcopy = ( await import( ROOT + '/lib/blas/base/dcopy/lib/base.js' ) ).default;
const dscal = ( await import( ROOT + '/lib/blas/base/dscal/lib/base.js' ) ).default;
const dswap = ( await import( ROOT + '/lib/blas/base/dswap/lib/base.js' ) ).default;
const drot = ( await import( ROOT + '/lib/blas/base/drot/lib/base.js' ) ).default;
const dnrm2 = ( await import( ROOT + '/lib/blas/base/dnrm2/lib/base.js' ) ).default;
const idamax = ( await import( ROOT + '/lib/blas/base/idamax/lib/base.js' ) ).default;
const dgemv = ( await import( ROOT + '/lib/blas/base/dgemv/lib/base.js' ) ).default;
const dsymv = ( await import( ROOT + '/lib/blas/base/dsymv/lib/base.js' ) ).default;
const dtrmv = ( await import( ROOT + '/lib/blas/base/dtrmv/lib/base.js' ) ).default;
const dtrsv = ( await import( ROOT + '/lib/blas/base/dtrsv/lib/base.js' ) ).default;
const dger = ( await import( ROOT + '/lib/blas/base/dger/lib/base.js' ) ).default;
const dsyr = ( await import( ROOT + '/lib/blas/base/dsyr/lib/base.js' ) ).default;
const dsyr2 = ( await import( ROOT + '/lib/blas/base/dsyr2/lib/base.js' ) ).default;
const dgbmv = ( await import( ROOT + '/lib/blas/base/dgbmv/lib/base.js' ) ).default;
const dtbsv = ( await import( ROOT + '/lib/blas/base/dtbsv/lib/base.js' ) ).default;
const dgemm = ( await import( ROOT + '/lib/blas/base/dgemm/lib/base.js' ) ).default;
const dsyrk = ( await import( ROOT + '/lib/blas/base/dsyrk/lib/base.js' ) ).default;
const dsyr2k = ( await import( ROOT + '/lib/blas/base/dsyr2k/lib/base.js' ) ).default;
const dsymm = ( await import( ROOT + '/lib/blas/base/dsymm/lib/base.js' ) ).default;
const dtrmm = ( await import( ROOT + '/lib/blas/base/dtrmm/lib/base.js' ) ).default;
const dtrsm = ( await import( ROOT + '/lib/blas/base/dtrsm/lib/base.js' ) ).default;
const dgemmTiled = require( ROOT + '/bench/dgemm-opt/variants/v4-general4x4.js' );

function rand( n ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( 2.0 * Math.random() ) - 1.0;
	return a;
}

// Interleaved min-of-trials. cases: [{label, fn, flops, bytes}]
function race( cases, { trials = 11, targetMs = 30 } = {} ) {
	// calibrate batch sizes
	for ( const c of cases ) {
		c.fn();
		let t0 = performance.now();
		c.fn();
		const one = Math.max( performance.now() - t0, 1e-4 );
		c.batch = Math.max( 1, Math.round( targetMs / one ) );
		c.best = Infinity;
	}
	for ( let t = 0; t < trials; t++ ) {
		for ( const c of cases ) {
			const t0 = performance.now();
			for ( let k = 0; k < c.batch; k++ ) c.fn();
			const per = ( performance.now() - t0 ) / c.batch;
			if ( per < c.best ) c.best = per;
		}
	}
	for ( const c of cases ) {
		const ms = c.best;
		const gf = c.flops ? c.flops / ( ms * 1e6 ) : 0;
		const gb = c.bytes ? c.bytes / ( ms * 1e6 ) : 0;
		console.log(
			'  ' + c.label.padEnd( 44 ) +
			( ms >= 1 ? ms.toFixed( 2 ) + ' ms' : ( ms * 1000 ).toFixed( 1 ) + ' us' ).padStart( 10 ) +
			( gf ? ( gf.toFixed( 2 ) + ' GF/s' ).padStart( 12 ) : ''.padStart( 12 ) ) +
			( gb ? ( gb.toFixed( 1 ) + ' GB/s' ).padStart( 12 ) : '' )
		);
	}
	return cases;
}

function header( s ) {
	console.log( '\n== ' + s + ' ==' );
}

const section = process.argv[ 2 ] || 'all';

// ---------------------------------------------------------------- LEVEL 1
if ( section === 'l1' || section === 'all' ) {
	for ( const N of [ 4096, 1 << 21 ] ) {
		header( 'Level 1, N=' + N + ( N * 8 > 4e6 ? ' (DRAM)' : ' (cache)' ) );
		const x = rand( N ), y = rand( N );
		race( [
			{ label: 'ddot (2 rd)', fn: () => ddot( N, x, 1, 0, y, 1, 0 ), flops: 2 * N, bytes: 16 * N },
			{ label: 'daxpy (2 rd + 1 wr)', fn: () => daxpy( N, 1.0000001, x, 1, 0, y, 1, 0 ), flops: 2 * N, bytes: 24 * N },
			{ label: 'dcopy (1 rd + 1 wr)', fn: () => dcopy( N, x, 1, 0, y, 1, 0 ), flops: 0, bytes: 16 * N },
			{ label: 'dscal (1 rd + 1 wr)', fn: () => dscal( N, 1.0000001, x, 1, 0 ), flops: N, bytes: 16 * N },
			{ label: 'dswap (2 rd + 2 wr)', fn: () => dswap( N, x, 1, 0, y, 1, 0 ), flops: 0, bytes: 32 * N },
			{ label: 'drot (2 rd + 2 wr)', fn: () => drot( N, x, 1, 0, y, 1, 0, 0.8, 0.6 ), flops: 6 * N, bytes: 32 * N },
			{ label: 'dnrm2 (1 rd, scaled ssq)', fn: () => dnrm2( N, x, 1, 0 ), flops: 2 * N, bytes: 8 * N },
			{ label: 'idamax (1 rd)', fn: () => idamax( N, x, 1, 0 ), flops: 0, bytes: 8 * N }
		] );
	}
}

// ---------------------------------------------------------------- LEVEL 2
function l2cases( n, layout ) {
	// col-major: sa1=1, sa2=n ; row-major: sa1=n, sa2=1
	const sa1 = layout === 'col' ? 1 : n;
	const sa2 = layout === 'col' ? n : 1;
	const A = rand( n * n );
	const x = rand( n ), y = rand( n );
	const bytesA = 8 * n * n;          // full matrix traffic
	const bytesTri = 4 * n * n;        // triangular half traffic
	return [
		{ label: 'dgemv N', fn: () => dgemv( 'no-transpose', n, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: bytesA },
		{ label: 'dgemv T', fn: () => dgemv( 'transpose', n, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: bytesA },
		{ label: 'dsymv upper', fn: () => dsymv( 'upper', n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: bytesTri },
		{ label: 'dtrmv upper N', fn: () => dtrmv( 'upper', 'no-transpose', 'non-unit', n, A, sa1, sa2, 0, x, 1, 0 ), flops: n * n, bytes: bytesTri },
		{ label: 'dtrsv upper N', fn: () => dtrsv( 'upper', 'no-transpose', 'non-unit', n, A, sa1, sa2, 0, x, 1, 0 ), flops: n * n, bytes: bytesTri },
		{ label: 'dger', fn: () => dger( n, n, 1e-9, x, 1, 0, y, 1, 0, A, sa1, sa2, 0 ), flops: 2 * n * n, bytes: 2 * bytesA },
		{ label: 'dsyr upper', fn: () => dsyr( 'upper', n, 1e-9, x, 1, 0, A, sa1, sa2, 0 ), flops: n * n, bytes: 2 * bytesTri },
		{ label: 'dsyr2 upper', fn: () => dsyr2( 'upper', n, 1e-9, x, 1, 0, y, 1, 0, A, sa1, sa2, 0 ), flops: 2 * n * n, bytes: 2 * bytesTri }
	];
}

if ( section === 'l2' || section === 'all' ) {
	for ( const n of [ 500, 2000 ] ) {
		for ( const layout of [ 'col', 'row' ] ) {
			header( 'Level 2 dense, n=' + n + ', ' + layout + '-major (A = ' + ( 8 * n * n / 1e6 ).toFixed( 0 ) + ' MB)' );
			race( l2cases( n, layout ) );
		}
	}
	// band routines: n large, narrow band — dominated by short inner loops
	for ( const [ n, k ] of [ [ 2000, 8 ], [ 2000, 64 ] ] ) {
		for ( const layout of [ 'col', 'row' ] ) {
			header( 'Band, n=' + n + ', k=' + k + ', ' + layout + '-major' );
			const lda = 2 * k + 1;
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? lda : 1;
			const Ab = rand( lda * n + n );
			const Atb = rand( ( k + 1 ) * n + n );
			const sa1t = layout === 'col' ? 1 : n;
			const sa2t = layout === 'col' ? ( k + 1 ) : 1;
			const x = rand( n ), y = rand( n );
			// keep dtbsv stable: diagonally dominant surrogate — use unit diag
			race( [
				{ label: 'dgbmv N kl=ku=' + k, fn: () => dgbmv( 'no-transpose', n, n, k, k, 1.0, Ab, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * ( 2 * k + 1 ), bytes: 8 * n * ( 2 * k + 1 ) },
				{ label: 'dtbsv upper N k=' + k, fn: () => dtbsv( 'upper', 'no-transpose', 'unit', n, k, Atb, sa1t, sa2t, 0, x, 1, 0 ), flops: 2 * n * k, bytes: 8 * n * ( k + 1 ) }
			] );
		}
	}
}

// ---------------------------------------------------------------- LEVEL 3
if ( section === 'l3' || section === 'all' ) {
	for ( const n of [ 128, 256, 512 ] ) {
		for ( const layout of [ 'col', 'row' ] ) {
			header( 'Level 3, n=' + n + ', ' + layout + '-major' );
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? n : 1;
			const A = rand( n * n ), B = rand( n * n ), C = rand( n * n );
			const Bt = rand( n * n ); // for trsm/trmm in-place operand
			race( [
				{ label: 'dgemm NN (current)', fn: () => dgemm( 'no-transpose', 'no-transpose', n, n, n, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.0, C, sa1, sa2, 0 ), flops: 2 * n * n * n },
				{ label: 'dgemm NN (4x4 tile, study)', fn: () => dgemmTiled( 'no-transpose', 'no-transpose', n, n, n, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.0, C, sa1, sa2, 0 ), flops: 2 * n * n * n },
				{ label: 'dsyrk upper N', fn: () => dsyrk( 'upper', 'no-transpose', n, n, 1.0, A, sa1, sa2, 0, 0.0, C, sa1, sa2, 0 ), flops: n * n * n },
				{ label: 'dsyrk upper T', fn: () => dsyrk( 'upper', 'transpose', n, n, 1.0, A, sa1, sa2, 0, 0.0, C, sa1, sa2, 0 ), flops: n * n * n },
				{ label: 'dsyr2k upper N', fn: () => dsyr2k( 'upper', 'no-transpose', n, n, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.0, C, sa1, sa2, 0 ), flops: 2 * n * n * n },
				{ label: 'dsymm left upper', fn: () => dsymm( 'left', 'upper', n, n, 1.0, A, sa1, sa2, 0, B, sa1, sa2, 0, 0.0, C, sa1, sa2, 0 ), flops: 2 * n * n * n },
				{ label: 'dtrmm left upper N', fn: () => dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', n, n, 1.0, A, sa1, sa2, 0, Bt, sa1, sa2, 0 ), flops: n * n * n },
				{ label: 'dtrsm left upper N', fn: () => dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', n, n, 1e-9, A, sa1, sa2, 0, Bt, sa1, sa2, 0 ), flops: n * n * n }
			], { trials: 9, targetMs: 40 } );
		}
	}
}

// ------------------------------------- L3FIX: trmm/trsm with bounded operand
// Repeated in-place B := op(A)·B underflowed to zero with the previous setup,
// letting the reference kernels short-circuit on zero entries. Use a
// near-identity triangular A so B stays bounded and dense.
if ( section === 'l3fix' ) {
	for ( const n of [ 128, 256, 512 ] ) {
		for ( const layout of [ 'col', 'row' ] ) {
			header( 'trmm/trsm (bounded), n=' + n + ', ' + layout + '-major' );
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? n : 1;
			const A = new Float64Array( n * n );
			for ( let j = 0; j < n; j++ ) {
				for ( let i = 0; i <= j; i++ ) {
					A[ ( i * sa1 ) + ( j * sa2 ) ] = ( i === j ) ? 1.0 + ( 0.1 * Math.random() ) : ( ( 2.0 * Math.random() ) - 1.0 ) * ( 0.5 / n );
				}
			}
			const Bt = rand( n * n );
			race( [
				{ label: 'dtrmm left upper N', fn: () => dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', n, n, 1.0, A, sa1, sa2, 0, Bt, sa1, sa2, 0 ), flops: n * n * n },
				{ label: 'dtrsm left upper N', fn: () => dtrsm( 'left', 'upper', 'no-transpose', 'non-unit', n, n, 1.0, A, sa1, sa2, 0, Bt, sa1, sa2, 0 ), flops: n * n * n }
			], { trials: 9, targetMs: 40 } );
			let finite = true;
			for ( let i = 0; i < n * n; i++ ) { if ( !Number.isFinite( Bt[ i ] ) || Bt[ i ] === 0.0 ) { finite = false; break; } }
			console.log( '  operand stayed dense/finite: ' + finite );
		}
	}
}

// ------------------------------------------- PROTOTYPE: layout-adaptive dgemv
// The shipped dgemv always walks strideA1 in the inner loop. For row-major
// (strideA1 = lda) that's a stride-n walk. Swapping loop order gives unit
// stride for both layouts. This quantifies the gap.
function dgemvAdaptive( trans, M, N, alpha, A, sa1, sa2, oa, x, sx, ox, beta, y, sy, oy ) {
	const noTrans = ( trans === 'no-transpose' );
	const leny = noTrans ? M : N;
	if ( beta !== 1.0 ) {
		let iy = oy;
		for ( let i = 0; i < leny; i++ ) { y[ iy ] = ( beta === 0.0 ) ? 0.0 : y[ iy ] * beta; iy += sy; }
	}
	if ( alpha === 0.0 ) return y;
	// choose form so the inner loop walks the unit-stride dimension
	const dotForm = noTrans ? ( Math.abs( sa2 ) < Math.abs( sa1 ) ) : ( Math.abs( sa1 ) < Math.abs( sa2 ) );
	if ( noTrans && !dotForm ) {
		// axpy form: inner over rows (sa1 unit)
		let jx = ox;
		for ( let j = 0; j < N; j++ ) {
			const t = alpha * x[ jx ];
			let iy = oy, ia = oa + ( j * sa2 );
			for ( let i = 0; i < M; i++ ) { y[ iy ] += t * A[ ia ]; iy += sy; ia += sa1; }
			jx += sx;
		}
	} else if ( noTrans ) {
		// dot form: inner over cols (sa2 unit): y[i] = dot(A[i,:], x)
		let iy = oy;
		for ( let i = 0; i < M; i++ ) {
			let t = 0.0, ix = ox, ia = oa + ( i * sa1 );
			for ( let j = 0; j < N; j++ ) { t += A[ ia ] * x[ ix ]; ix += sx; ia += sa2; }
			y[ iy ] += alpha * t;
			iy += sy;
		}
	} else if ( dotForm ) {
		// y[j] = dot(A[:,j], x): inner over rows (sa1 unit)
		let jy = oy;
		for ( let j = 0; j < N; j++ ) {
			let t = 0.0, ix = ox, ia = oa + ( j * sa2 );
			for ( let i = 0; i < M; i++ ) { t += A[ ia ] * x[ ix ]; ix += sx; ia += sa1; }
			y[ jy ] += alpha * t;
			jy += sy;
		}
	} else {
		// axpy form over rows: y += alpha*x[i]*A[i,:] (sa2 unit)
		let ix = ox;
		for ( let i = 0; i < M; i++ ) {
			const t = alpha * x[ ix ];
			let jy = oy, ia = oa + ( i * sa1 );
			for ( let j = 0; j < N; j++ ) { y[ jy ] += t * A[ ia ]; jy += sy; ia += sa2; }
			ix += sx;
		}
	}
	return y;
}

// 4 independent accumulators to break the FP-add dependency chain
function ddot4( N, x, sx, ox, y, sy, oy ) {
	let s0 = 0.0, s1 = 0.0, s2 = 0.0, s3 = 0.0;
	let ix = ox, iy = oy, i = 0;
	if ( sx === 1 && sy === 1 ) {
		const m = N & ~3;
		for ( ; i < m; i += 4 ) {
			s0 += x[ ix ] * y[ iy ];
			s1 += x[ ix + 1 ] * y[ iy + 1 ];
			s2 += x[ ix + 2 ] * y[ iy + 2 ];
			s3 += x[ ix + 3 ] * y[ iy + 3 ];
			ix += 4; iy += 4;
		}
	}
	for ( ; i < N; i++ ) { s0 += x[ ix ] * y[ iy ]; ix += sx; iy += sy; }
	return ( s0 + s1 ) + ( s2 + s3 );
}

// fast path: plain unrolled sum of squares; fall back to scaled loop only if
// the result is outside the safe range (over/underflow risk or non-finite)
function dnrm2fast( N, x, stride, offset ) {
	if ( stride === 1 ) {
		let s0 = 0.0, s1 = 0.0, s2 = 0.0, s3 = 0.0;
		let i = offset;
		const end = offset + ( N & ~3 );
		for ( ; i < end; i += 4 ) {
			s0 += x[ i ] * x[ i ];
			s1 += x[ i + 1 ] * x[ i + 1 ];
			s2 += x[ i + 2 ] * x[ i + 2 ];
			s3 += x[ i + 3 ] * x[ i + 3 ];
		}
		for ( ; i < offset + N; i++ ) s0 += x[ i ] * x[ i ];
		const ssq = ( s0 + s1 ) + ( s2 + s3 );
		if ( ssq > 1.0e-140 && ssq < 1.0e140 ) return Math.sqrt( ssq );
	}
	return dnrm2( N, x, stride, offset );
}

// dgemv T, col-major: process 4 columns per pass (4 dots share the x stream)
function dgemvT4( M, N, alpha, A, lda, oa, x, y ) {
	let j = 0;
	const n4 = N & ~3;
	for ( ; j < n4; j += 4 ) {
		let s0 = 0.0, s1 = 0.0, s2 = 0.0, s3 = 0.0;
		let a0 = oa + ( j * lda ), a1 = a0 + lda, a2 = a1 + lda, a3 = a2 + lda;
		for ( let i = 0; i < M; i++ ) {
			const xv = x[ i ];
			s0 += A[ a0 + i ] * xv;
			s1 += A[ a1 + i ] * xv;
			s2 += A[ a2 + i ] * xv;
			s3 += A[ a3 + i ] * xv;
		}
		y[ j ] += alpha * s0;
		y[ j + 1 ] += alpha * s1;
		y[ j + 2 ] += alpha * s2;
		y[ j + 3 ] += alpha * s3;
	}
	for ( ; j < N; j++ ) {
		let s = 0.0;
		const a0 = oa + ( j * lda );
		for ( let i = 0; i < M; i++ ) s += A[ a0 + i ] * x[ i ];
		y[ j ] += alpha * s;
	}
	return y;
}

// dgemv N, col-major: 4 columns per pass — y streamed once per 4 columns
function dgemvN4( M, N, alpha, A, lda, oa, x, y ) {
	let j = 0;
	const n4 = N & ~3;
	for ( ; j < n4; j += 4 ) {
		const t0 = alpha * x[ j ], t1 = alpha * x[ j + 1 ], t2 = alpha * x[ j + 2 ], t3 = alpha * x[ j + 3 ];
		const a0 = oa + ( j * lda ), a1 = a0 + lda, a2 = a1 + lda, a3 = a2 + lda;
		for ( let i = 0; i < M; i++ ) {
			y[ i ] += ( t0 * A[ a0 + i ] ) + ( t1 * A[ a1 + i ] ) + ( t2 * A[ a2 + i ] ) + ( t3 * A[ a3 + i ] );
		}
	}
	for ( ; j < N; j++ ) {
		const t = alpha * x[ j ];
		const a0 = oa + ( j * lda );
		for ( let i = 0; i < M; i++ ) y[ i ] += t * A[ a0 + i ];
	}
	return y;
}

if ( section === 'proto1' ) {
	// correctness
	{
		const N = 1003;
		const x = rand( N ), y = rand( N );
		const r1 = ddot( N, x, 1, 0, y, 1, 0 ), r2 = ddot4( N, x, 1, 0, y, 1, 0 );
		if ( Math.abs( r1 - r2 ) > 1e-10 * Math.abs( r1 ) + 1e-12 ) { console.log( 'ddot4 MISMATCH', r1, r2 ); process.exit( 1 ); }
		const n1 = dnrm2( N, x, 1, 0 ), n2 = dnrm2fast( N, x, 1, 0 );
		if ( Math.abs( n1 - n2 ) > 1e-12 * n1 ) { console.log( 'dnrm2fast MISMATCH', n1, n2 ); process.exit( 1 ); }
		// extreme values take the fallback
		const xs = new Float64Array( 100 ).fill( 1e-170 );
		if ( Math.abs( dnrm2fast( 100, xs, 1, 0 ) - 1e-169 ) > 1e-180 ) { console.log( 'dnrm2fast underflow MISMATCH' ); process.exit( 1 ); }
		const m = 300, n = 200;
		const A = rand( m * n ), xx = rand( m ), yy0 = rand( n );
		const y1 = yy0.slice(), y2 = yy0.slice();
		dgemv( 'transpose', m, n, 0.7, A, 1, m, 0, xx, 1, 0, 1.0, y1, 1, 0 );
		dgemvT4( m, n, 0.7, A, m, 0, xx, y2 );
		let e = 0; for ( let i = 0; i < n; i++ ) e = Math.max( e, Math.abs( y1[ i ] - y2[ i ] ) );
		if ( e > 1e-12 ) { console.log( 'dgemvT4 MISMATCH', e ); process.exit( 1 ); }
		const xN = rand( n ), yN0 = rand( m );
		const z1 = yN0.slice(), z2 = yN0.slice();
		dgemv( 'no-transpose', m, n, 0.7, A, 1, m, 0, xN, 1, 0, 1.0, z1, 1, 0 );
		dgemvN4( m, n, 0.7, A, m, 0, xN, z2 );
		e = 0; for ( let i = 0; i < m; i++ ) e = Math.max( e, Math.abs( z1[ i ] - z2[ i ] ) );
		if ( e > 1e-12 ) { console.log( 'dgemvN4 MISMATCH', e ); process.exit( 1 ); }
		console.log( 'prototype correctness: OK' );
	}
	for ( const N of [ 4096, 1 << 21 ] ) {
		header( 'ddot / dnrm2 prototypes, N=' + N );
		const x = rand( N ), y = rand( N );
		race( [
			{ label: 'ddot shipped', fn: () => ddot( N, x, 1, 0, y, 1, 0 ), flops: 2 * N, bytes: 16 * N },
			{ label: 'ddot 4-acc', fn: () => ddot4( N, x, 1, 0, y, 1, 0 ), flops: 2 * N, bytes: 16 * N },
			{ label: 'dnrm2 shipped', fn: () => dnrm2( N, x, 1, 0 ), flops: 2 * N, bytes: 8 * N },
			{ label: 'dnrm2 fast-path', fn: () => dnrm2fast( N, x, 1, 0 ), flops: 2 * N, bytes: 8 * N }
		] );
	}
	for ( const n of [ 500, 2000 ] ) {
		header( 'dgemv col-major blocked prototypes, n=' + n );
		const A = rand( n * n ), x = rand( n ), y = rand( n );
		race( [
			{ label: 'dgemv T shipped', fn: () => dgemv( 'transpose', n, n, 1.0, A, 1, n, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: 8 * n * n },
			{ label: 'dgemv T 4-col', fn: () => { y.fill( 0 ); dgemvT4( n, n, 1.0, A, n, 0, x, y ); }, flops: 2 * n * n, bytes: 8 * n * n },
			{ label: 'dgemv N shipped', fn: () => dgemv( 'no-transpose', n, n, 1.0, A, 1, n, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: 8 * n * n },
			{ label: 'dgemv N 4-col', fn: () => { y.fill( 0 ); dgemvN4( n, n, 1.0, A, n, 0, x, y ); }, flops: 2 * n * n, bytes: 8 * n * n }
		] );
	}
}

if ( section === 'proto' || section === 'all' ) {
	// correctness check first
	{
		const n = 37, m = 23;
		for ( const trans of [ 'no-transpose', 'transpose' ] ) {
			for ( const [ sa1, sa2 ] of [ [ 1, m ], [ n, 1 ] ] ) {
				const A = rand( m * n ), x = rand( n + m ), y0 = rand( n + m );
				const y1 = y0.slice(), y2 = y0.slice();
				dgemv( trans, m, n, 0.7, A, sa1, sa2, 0, x, 1, 0, 0.3, y1, 1, 0 );
				dgemvAdaptive( trans, m, n, 0.7, A, sa1, sa2, 0, x, 1, 0, 0.3, y2, 1, 0 );
				let maxerr = 0;
				for ( let i = 0; i < y1.length; i++ ) maxerr = Math.max( maxerr, Math.abs( y1[ i ] - y2[ i ] ) );
				if ( maxerr > 1e-12 ) { console.log( 'MISMATCH', trans, sa1, sa2, maxerr ); process.exit( 1 ); }
			}
		}
		console.log( 'dgemv prototype correctness: OK' );
	}
	for ( const n of [ 500, 2000 ] ) {
		for ( const layout of [ 'col', 'row' ] ) {
			header( 'dgemv shipped vs layout-adaptive, n=' + n + ', ' + layout + '-major' );
			const sa1 = layout === 'col' ? 1 : n;
			const sa2 = layout === 'col' ? n : 1;
			const A = rand( n * n ), x = rand( n ), y = rand( n );
			race( [
				{ label: 'dgemv N shipped', fn: () => dgemv( 'no-transpose', n, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: 8 * n * n },
				{ label: 'dgemv N adaptive', fn: () => dgemvAdaptive( 'no-transpose', n, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: 8 * n * n },
				{ label: 'dgemv T shipped', fn: () => dgemv( 'transpose', n, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: 8 * n * n },
				{ label: 'dgemv T adaptive', fn: () => dgemvAdaptive( 'transpose', n, n, 1.0, A, sa1, sa2, 0, x, 1, 0, 0.0, y, 1, 0 ), flops: 2 * n * n, bytes: 8 * n * n }
			] );
		}
	}
}
