/* eslint-disable camelcase, max-len */

// MODULES //

import bench from '@stdlib/bench/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import pow from '@stdlib/math/base/special/pow/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import { name as pkg } from './../package.json' with { type: 'json' };
import zla_gbrfsx_extended from './../lib/zla_gbrfsx_extended.js';


// FUNCTIONS //

/**
* Creates a benchmark function for a given problem size.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	let ERR_BNDS_NORM, ERR_BNDS_COMP, BERR_OUT, Y_TAIL, LDAFB, LDAB, IPIV, AYB;
	let AFB, RES, AB, DY, KL, KU, B, C, Y, i, j;

	KL = 1;
	KU = 1;
	LDAB = KL + KU + 1;
	LDAFB = ( 2 * KL ) + KU + 1;
	AB = new Complex128Array( LDAB * N );
	AFB = new Complex128Array( LDAFB * N );
	IPIV = new Int32Array( N );
	B = new Complex128Array( N );
	Y = new Complex128Array( N );
	RES = new Complex128Array( N );
	DY = new Complex128Array( N );
	Y_TAIL = new Complex128Array( N );
	C = new Float64Array( N );
	AYB = new Float64Array( N );
	BERR_OUT = new Float64Array( 1 );
	ERR_BNDS_NORM = new Float64Array( 3 );
	ERR_BNDS_COMP = new Float64Array( 3 );
	const av = reinterpret( AB, 0 );
	const fv = reinterpret( AFB, 0 );
	const bv = reinterpret( B, 0 );
	const yv = reinterpret( Y, 0 );

	// Build a diagonally dominant complex tridiagonal band.
	for ( j = 0; j < N; j++ ) {
		if ( j > 0 ) {
			av[ ( ( KU - 1 ) + ( j * LDAB ) ) * 2 ] = 0.5;
		}
		av[ ( KU + ( j * LDAB ) ) * 2 ] = 4.0;
		av[ ( ( KU + ( j * LDAB ) ) * 2 ) + 1 ] = 1.0;
		if ( j < N - 1 ) {
			av[ ( ( KU + 1 ) + ( j * LDAB ) ) * 2 ] = -1.0;
		}
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < KL + KU + 1; i++ ) {
			fv[ ( ( i + KL ) + ( j * LDAFB ) ) * 2 ] = av[ ( i + ( j * LDAB ) ) * 2 ];
			fv[ ( ( ( i + KL ) + ( j * LDAFB ) ) * 2 ) + 1 ] = av[ ( ( i + ( j * LDAB ) ) * 2 ) + 1 ];
		}
	}
	zgbtrf( N, N, KL, KU, AFB, 1, LDAFB, 0, IPIV, 1, 0 );
	for ( i = 0; i < N; i++ ) {
		bv[ 2 * i ] = i + 1;
		yv[ 2 * i ] = i + 1;
		C[ i ] = 1.0;
	}
	ERR_BNDS_NORM[ 0 ] = 1.0;
	ERR_BNDS_COMP[ 0 ] = 1.0;
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		let info, k;

		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			info = zla_gbrfsx_extended( 'column-major', 1, 'no-transpose', N, KL, KU, 1, AB, LDAB, AFB, LDAFB, IPIV, 1, 0, false, C, 1, B, N, Y, N, BERR_OUT, 1, 2, ERR_BNDS_NORM, 1, ERR_BNDS_COMP, 1, RES, 1, AYB, 1, DY, 1, Y_TAIL, 1, 1.0, 10, 0.5, 0.25, false );
			if ( info !== 0 ) {
				b.fail( 'unexpected info' );
			}
		}
		b.toc();
		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	let len, f, i;

	const min = 1;
	const max = 3;
	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:len=%d', pkg, len ), f );
	}
}

main();
