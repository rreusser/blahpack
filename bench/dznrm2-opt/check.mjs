// Correctness gate: v1-fastpath vs v0-reference over a case matrix.
//
// Two tiers (docs/optimization-policy.md):
// - Inputs that take the scaled fallback (extremes, NaN/Inf) must match the
//   reference BIT-IDENTICALLY (same code path, no reordering).
// - Normal-range inputs use the fast path, which reorders summation; gate at
//   a documented relative tolerance instead.
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import v0 from './variants/v0-reference.js';
import v1 from './variants/v1-fastpath.js';

const RTOL = 1.0e-14; // reassociated sum of 2N squares; error ~ 2N*eps/2

// Build a Complex128Array whose interleaved re/im doubles are random in
// [-scale, scale]. Buffer holds `nc` complex elements.
function randz( nc, scale ) {
	const buf = new Float64Array( 2 * nc );
	for ( let i = 0; i < buf.length; i++ ) buf[ i ] = ( ( 2.0 * Math.random() ) - 1.0 ) * scale;
	return new Complex128Array( buf );
}

let ncases = 0;
let failures = 0;

function compare( label, N, zx, stride, offset, exact ) {
	const r0 = v0( N, zx, stride, offset );
	const r1 = v1( N, zx, stride, offset );
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
				const nc = offset + Math.max( 1, N * stride );
				compare( 'normal(scale=' + scale + ')', N, randz( nc, scale ), stride, offset, false );
			}
		}
	}
}

// negative strides (fast path exercises the strided branch; last element
// of the logical vector is at offset, walking backwards)
for ( const N of [ 1, 4, 7, 16, 100 ] ) {
	for ( const stride of [ -1, -2 ] ) {
		const offset = ( N - 1 ) * -stride;
		const nc = offset + 1;
		compare( 'negstride', N, randz( nc, 1.0 ), stride, offset, false );
	}
}

// extreme / special inputs (fallback, bit-identical tier). Each entry is a
// list of [re, im] complex components.
const specials = [
	[ 'big', [ [ 1.0e200, 3.0 ], [ 4.0, 5.0 ] ] ],
	[ 'two-big', [ [ 1.0e200, 0.0 ], [ 0.0, 1.0e200 ] ] ],
	[ 'big-imag', [ [ 3.0, 1.0e200 ] ] ],
	[ 'tiny', [ [ 1.0e-200, 1.0e-201 ] ] ],
	[ 'tiny+med-sub-window', [ [ 1.0e-200, 1.0e-100 ], [ 1.0e-100, 0.0 ] ] ],
	[ 'big+tiny', [ [ 1.0e200, 1.0e-200 ] ] ],
	[ 'all-zero', [ [ 0.0, 0.0 ], [ 0.0, 0.0 ] ] ],
	[ 'nan-re', [ [ 1.0, 2.0 ], [ NaN, 3.0 ] ] ],
	[ 'nan-im', [ [ 1.0, NaN ] ] ],
	[ 'nan-only', [ [ NaN, NaN ] ] ],
	[ 'inf-re', [ [ 1.0, 2.0 ], [ Infinity, 3.0 ] ] ],
	[ 'inf-im', [ [ 1.0, -Infinity ] ] ],
	[ 'nan+big', [ [ NaN, 0.0 ], [ 1.0e200, 0.0 ] ] ],
	[ 'denormal', [ [ 5.0e-324, 5.0e-324 ], [ 5.0e-324, 0.0 ] ] ],
	[ 'near-overflow', [ [ 1.3e154, 1.3e154 ] ] ],
	[ 'sub-window-med', [ [ 1.0e-75, 1.0e-75 ], [ 1.0e-75, 0.0 ] ] ]
];
for ( const [ label, comps ] of specials ) {
	const flat = new Float64Array( comps.length * 2 );
	for ( let i = 0; i < comps.length; i++ ) {
		flat[ i * 2 ] = comps[ i ][ 0 ];
		flat[ ( i * 2 ) + 1 ] = comps[ i ][ 1 ];
	}
	compare( label, comps.length, new Complex128Array( flat ), 1, 0, true );

	// strided view of the same complex values (stride 2, padded)
	const flat2 = new Float64Array( comps.length * 4 );
	for ( let i = 0; i < comps.length; i++ ) {
		flat2[ i * 4 ] = comps[ i ][ 0 ];
		flat2[ ( i * 4 ) + 1 ] = comps[ i ][ 1 ];
	}
	compare( label + '/stride2', comps.length, new Complex128Array( flat2 ), 2, 0, true );
}

// randomized mixed-magnitude fuzzing (tolerance tier — may or may not take
// the fast path; compare with NaN-aware relative tolerance)
for ( let t = 0; t < 500; t++ ) {
	const N = 1 + Math.floor( Math.random() * 64 );
	const flat = new Float64Array( 2 * N );
	for ( let i = 0; i < flat.length; i++ ) {
		const mag = ( Math.random() * 600 ) - 300; // 1e-300 .. 1e300
		flat[ i ] = ( Math.random() < 0.5 ? -1 : 1 ) * Math.pow( 10, mag );
	}
	const zx = new Complex128Array( flat );
	const r0 = v0( N, zx, 1, 0 );
	const r1 = v1( N, zx, 1, 0 );
	ncases += 1;
	const ok = Number.isNaN( r0 ) ? Number.isNaN( r1 ) : Math.abs( r1 - r0 ) <= 1.0e-13 * Math.abs( r0 );
	if ( !ok ) {
		failures += 1;
		console.log( 'FAIL fuzz: N=' + N + ' v0=' + r0 + ' v1=' + r1 );
	}
}

console.log( ( failures === 0 ? 'PASS' : 'FAIL' ) + ': ' + ncases + ' cases, ' + failures + ' failures' );
process.exit( failures === 0 ? 0 : 1 );
