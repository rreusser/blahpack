// Correctness gate: every variant vs v0-reference over a case matrix.
//
// Two tiers (docs/optimization-policy.md):
// - Inputs that take the scaled fallback (extremes, NaN/Inf) must match the
//   reference BIT-IDENTICALLY (same code path, no reordering).
// - Normal-range inputs use the fast path, which reorders summation; gate at
//   a documented relative tolerance instead.
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-fastpath.js';

const RTOL = 1.0e-14; // reassociated sum of N squares; error ~ N*eps/2

function rand( n, scale ) {
	const a = new Float64Array( n );
	for ( let i = 0; i < n; i++ ) a[ i ] = ( ( 2.0 * Math.random() ) - 1.0 ) * scale;
	return a;
}

let ncases = 0;
let failures = 0;

function compare( label, N, x, stride, offset, exact ) {
	const r0 = v0( N, x, stride, offset );
	const r1 = v1( N, x, stride, offset );
	ncases += 1;
	let ok;
	if ( exact ) {
		ok = Object.is( r0, r1 );
	} else {
		ok = Number.isNaN( r0 ) ? Number.isNaN( r1 ) : Math.abs( r1 - r0 ) <= RTOL * Math.abs( r0 );
	}
	if ( !ok ) {
		failures += 1;
		console.log( 'FAIL ' + label + ': N=' + N + ' stride=' + stride + ' offset=' + offset + ' v0=' + r0 + ' v1=' + r1 );
	}
}

// normal-range inputs (fast path, tolerance tier)
for ( const N of [ 0, 1, 2, 3, 4, 5, 7, 8, 15, 16, 17, 100, 1000, 4097 ] ) {
	for ( const stride of [ 1, 2, 3 ] ) {
		for ( const offset of [ 0, 5 ] ) {
			for ( const scale of [ 1.0, 1.0e-30, 1.0e30, 1.0e-69, 1.0e69 ] ) {
				const x = rand( offset + Math.max( 1, N * stride ), scale );
				compare( 'normal(scale=' + scale + ')', N, x, stride, offset, false );
			}
		}
	}
}

// extreme / special inputs (fallback, bit-identical tier)
const specials = [
	[ 'big', [ 1.0e200, 3.0, 4.0 ] ],
	[ 'two-big', [ 1.0e200, 1.0e200 ] ],
	[ 'tiny', [ 1.0e-200, 1.0e-201 ] ],
	[ 'tiny+med-sub-window', [ 1.0e-200, 1.0e-100, 1.0e-100 ] ],
	[ 'big+tiny', [ 1.0e200, 1.0e-200 ] ],
	[ 'all-zero', [ 0.0, 0.0, 0.0, 0.0, 0.0 ] ],
	[ 'nan', [ 1.0, NaN, 3.0 ] ],
	[ 'nan-only', [ NaN ] ],
	[ 'inf', [ 1.0, Infinity, 3.0 ] ],
	[ '-inf', [ -Infinity ] ],
	[ 'nan+big', [ NaN, 1.0e200 ] ],
	[ 'denormal', [ 5.0e-324, 5.0e-324, 5.0e-324 ] ],
	[ 'near-overflow', [ 1.3e154, 1.3e154 ] ],
	[ 'sub-window-med', [ 1.0e-75, 1.0e-75 ] ]
];
for ( const [ label, vals ] of specials ) {
	const x = new Float64Array( vals );
	compare( label, x.length, x, 1, 0, true );
	// strided view of the same values
	const xs = new Float64Array( vals.length * 2 );
	for ( let i = 0; i < vals.length; i++ ) xs[ i * 2 ] = vals[ i ];
	compare( label + '/stride2', vals.length, xs, 2, 0, true );
}

// randomized mixed-magnitude fuzzing (tolerance tier — may or may not
// take the fast path; compare with NaN-aware relative tolerance)
for ( let t = 0; t < 500; t++ ) {
	const N = 1 + Math.floor( Math.random() * 64 );
	const x = new Float64Array( N );
	for ( let i = 0; i < N; i++ ) {
		const mag = ( Math.random() * 600 ) - 300; // 1e-300 .. 1e300
		x[ i ] = ( Math.random() < 0.5 ? -1 : 1 ) * Math.pow( 10, mag );
	}
	const r0 = v0( N, x, 1, 0 );
	const r1 = v1( N, x, 1, 0 );
	ncases += 1;
	const ok = Number.isNaN( r0 ) ? Number.isNaN( r1 ) : Math.abs( r1 - r0 ) <= 1.0e-13 * Math.abs( r0 );
	if ( !ok ) {
		failures += 1;
		console.log( 'FAIL fuzz: v0=' + r0 + ' v1=' + r1, x );
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
