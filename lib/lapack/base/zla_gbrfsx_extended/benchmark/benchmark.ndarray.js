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
import zla_gbrfsx_extended from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Creates a benchmark function for a given problem size.
*
* @private
* @param {PositiveInteger} N - matrix order
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
	var ERR_BNDS_NORM;
	var ERR_BNDS_COMP;
	var BERR_OUT;
	var Y_TAIL;
	var LDAFB;
	var LDAB;
	var IPIV;
	var AYB;
	var AFB;
	var RES;
	var AB;
	var DY;
	var KL;
	var KU;
	var av;
	var bv;
	var fv;
	var yv;
	var B;
	var C;
	var Y;
	var i;
	var j;

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
	av = reinterpret( AB, 0 );
	fv = reinterpret( AFB, 0 );
	bv = reinterpret( B, 0 );
	yv = reinterpret( Y, 0 );

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
		var info;
		var k;

		b.tic();
		for ( k = 0; k < b.iterations; k++ ) {
			info = zla_gbrfsx_extended( 1, 'no-transpose', N, KL, KU, 1, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, N, 0, Y, 1, N, 0, BERR_OUT, 1, 0, 2, ERR_BNDS_NORM, 1, 1, 0, ERR_BNDS_COMP, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, 1.0, 10, 0.5, 0.25, false );
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
	var len;
	var min;
	var max;
	var f;
	var i;

	min = 1;
	max = 3;
	for ( i = min; i <= max; i++ ) {
		len = pow( 10, i );
		f = createBenchmark( len );
		bench( format( '%s:ndarray:len=%d', pkg, len ), f );
	}
}

main();
