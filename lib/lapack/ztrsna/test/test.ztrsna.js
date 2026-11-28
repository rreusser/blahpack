/* eslint-disable no-restricted-syntax, max-len, vars-on-top, require-jsdoc, no-unused-vars */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsna from './../lib/ztrsna.js';
import ztrsnaNdarray from './../lib/ndarray.js';


// FUNCTIONS //

function makeArgs() {
	return [ new Complex128Array( 4 ), new Complex128Array( 4 ), new Complex128Array( 4 ) ];
}


// TESTS //

test( 'ztrsna is a function', function t() {
	assert.strictEqual( typeof ztrsna, 'function', 'is a function' );
} );

test( 'ztrsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'invalid', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, TypeError );
} );

test( 'ztrsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, -1, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDT < N (row-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 0, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDT < M (column-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 0, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVL < N (row-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 0, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVL < M (column-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 0, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVR < N (row-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDVR < M (column-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 0, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 2, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDWORK < N (row-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'row-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 0, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna throws RangeError for LDWORK < M (column-major)', function t() {
	assert.throws( function throws() {
		const a = makeArgs();
		ztrsna( 'column-major', 'both', 'all', new Uint8Array( 2 ), 1, 2, a[ 0 ], 2, a[ 1 ], 2, a[ 2 ], 2, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Complex128Array( 4 ), 0, new Float64Array( 2 ) );
	}, RangeError );
} );

test( 'ztrsna: column-major path runs (1x1)', function t() {
	const T = new Complex128Array( [ 3.0, 0.0 ] );
	const VL = new Complex128Array( [ 1.0, 0.0 ] );
	const VR = new Complex128Array( [ 1.0, 0.0 ] );
	const SELECT = new Uint8Array( [ 1 ] );
	const s = new Float64Array( 1 );
	const SEP = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = ztrsna( 'column-major', 'both', 'all', SELECT, 1, 1, T, 1, VL, 1, VR, 1, s, 1, SEP, 1, 1, M, WORK, 1, RWORK );
	assert.equal( info, 0, 'info=0' );
} );

test( 'ztrsna: row-major path runs (1x1)', function t() {
	const T = new Complex128Array( [ 3.0, 0.0 ] );
	const VL = new Complex128Array( [ 1.0, 0.0 ] );
	const VR = new Complex128Array( [ 1.0, 0.0 ] );
	const SELECT = new Uint8Array( [ 1 ] );
	const s = new Float64Array( 1 );
	const SEP = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = ztrsna( 'row-major', 'both', 'all', SELECT, 1, 1, T, 1, VL, 1, VR, 1, s, 1, SEP, 1, 1, M, WORK, 1, RWORK );
	assert.equal( info, 0, 'info=0' );
} );

test( 'ztrsna: WORK=null and RWORK=null allocate workspace and match ndarray (both layouts)', function t() {
	const orders = [ 'column-major', 'row-major' ];
	const LD = 4;
	const N = 3;
	let s1;
	let s2;
	let i;
	let j;
	function fill( seed, upper, rowMajor ) {
		const out = new Complex128Array( LD * LD );
		const v = reinterpret( out, 0 );
		let r;
		let c;
		let k;
		for ( r = 0; r < N; r++ ) {
			for ( c = 0; c < N; c++ ) {
				if ( upper && c < r ) {
					continue;
				}
				k = ( rowMajor ) ? ( ( r * LD ) + c ) : ( r + ( c * LD ) );
				v[ 2 * k ] = Math.sin( ( seed * 31.0 ) + ( ( r + 1 ) * 1.3 ) + ( ( c + 1 ) * 2.9 ) ) + ( ( r === c && upper ) ? r + 1 : 0.0 );
				v[ ( 2 * k ) + 1 ] = Math.cos( ( seed * 17.0 ) + ( ( r + 1 ) * 0.7 ) + ( ( c + 1 ) * 1.1 ) );
			}
		}
		return out;
	}
	for ( i = 0; i < orders.length; i++ ) {
		const rowMajor = ( orders[ i ] === 'row-major' );
		const T = fill( 1, true, rowMajor );
		const VL = fill( 2, false, rowMajor );
		const VR = fill( 3, false, rowMajor );
		const SELECT = new Uint8Array( N );
		const sa = new Float64Array( N );
		const sepa = new Float64Array( N );
		const sb = new Float64Array( N );
		const sepb = new Float64Array( N );
		const Ma = new Int32Array( 1 );
		const Mb = new Int32Array( 1 );
		const infoA = ztrsna( orders[ i ], 'both', 'all', SELECT, 1, N, T, LD, VL, LD, VR, LD, sa, 1, sepa, 1, N, Ma, null, LD, null );
		if ( rowMajor ) {
			s1 = LD;
			s2 = 1;
		} else {
			s1 = 1;
			s2 = LD;
		}
		const infoB = ztrsnaNdarray( 'both', 'all', SELECT, 1, 0, N, T, s1, s2, 0, VL, s1, s2, 0, VR, s1, s2, 0, sb, 1, 0, sepb, 1, 0, N, Mb, new Complex128Array( LD * ( N + 1 ) ), s1, s2, 0, new Float64Array( N ), 1, 0 );
		assert.equal( infoA, 0, orders[ i ] + ': info' );
		assert.equal( infoB, 0, orders[ i ] + ': ndarray info' );
		assert.equal( Ma[ 0 ], N, orders[ i ] + ': M' );
		assert.equal( Mb[ 0 ], N, orders[ i ] + ': ndarray M' );
		for ( j = 0; j < N; j++ ) {
			assert.ok( sa[ j ] > 0.0 && sa[ j ] <= 1.0, orders[ i ] + ': s[' + j + '] in (0,1]' );
			assert.ok( sepa[ j ] > 0.0, orders[ i ] + ': SEP[' + j + '] > 0' );
			assert.strictEqual( sa[ j ], sb[ j ], orders[ i ] + ': s[' + j + ']' );
			assert.strictEqual( sepa[ j ], sepb[ j ], orders[ i ] + ': SEP[' + j + ']' );
		}
	}
});
