/* eslint-disable no-restricted-syntax, max-len, vars-on-top, require-jsdoc */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrsna from './../lib/dtrsna.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

function buf( n ) {
	return new Float64Array( n );
}

function ibuf( n ) {
	return new Int32Array( n );
}

function sbuf( n ) {
	return new Uint8Array( n );
}


// Non-normal upper triangular T (column-major) with exact right (VR) and left (VL) eigenvectors as columns:
const T3 = [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ];
const VR3 = [ 1.0, 0.0, 0.0, 2.0/3.0, 1.0, 0.0, 1.6, 2.5, 1.0 ];
const VL3 = [ 1.0, -2.0/3.0, 1.0/15.0, 0.0, 1.0, -2.5, 0.0, 0.0, 1.0 ];

function transpose3( A ) {
	const out = new Float64Array( 9 );
	for ( let i = 0; i < 3; i++ ) {
		for ( let j = 0; j < 3; j++ ) {
			out[ ( i * 3 ) + j ] = A[ ( j * 3 ) + i ];
		}
	}
	return out;
}

function eigenvalueCondition( VL, VR, N ) {
	const out = new Float64Array( N );
	for ( let j = 0; j < N; j++ ) {
		let dot = 0.0;
		let nl = 0.0;
		let nr = 0.0;
		for ( let i = 0; i < N; i++ ) {
			dot += VL[ (j*N)+i ] * VR[ (j*N)+i ];
			nl += VL[ (j*N)+i ] * VL[ (j*N)+i ];
			nr += VR[ (j*N)+i ] * VR[ (j*N)+i ];
		}
		out[ j ] = Math.abs( dot ) / Math.sqrt( nl * nr );
	}
	return out;
}


// TESTS //

test( 'dtrsna is a function', function t() {
	assert.strictEqual( typeof dtrsna, 'function', 'is a function' );
} );

test( 'dtrsna has expected arity', function t() {
	assert.strictEqual( dtrsna.length, 21, 'has expected arity' );
} );

test( 'dtrsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'invalid', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, TypeError );
} );

test( 'dtrsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, -1, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDT < N (row-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDT < N (column-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVL < N (row-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVL < N (column-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVR < N (row-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVR < N (column-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 2, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDWORK < N (row-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 0, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDWORK < N (column-major)', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, m, buf( 16 ), 0, ibuf( 4 ) );
	}, RangeError );
} );

test( 'dtrsna: column-major wrapper matches the strided API and the |vl.vr|/(|vl||vr|) oracle (job=both, non-normal T)', function t() {
	const N = 3;
	const m = new Int32Array( 1 );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const info = dtrsna( 'column-major', 'both', 'all', sbuf( N ), 1, N, new Float64Array( T3 ), N, new Float64Array( VL3 ), N, new Float64Array( VR3 ), N, s, 1, SEP, 1, N, m, new Float64Array( N*( N+6 ) ), N, new Int32Array( 2*N ) );

	const mn = new Int32Array( 1 );
	const sn = new Float64Array( N );
	const SEPn = new Float64Array( N );
	const infon = strided( 'both', 'all', sbuf( N ), 1, 0, N, new Float64Array( T3 ), 1, N, 0, new Float64Array( VL3 ), 1, N, 0, new Float64Array( VR3 ), 1, N, 0, sn, 1, 0, SEPn, 1, 0, N, mn, new Float64Array( N*( N+6 ) ), 1, N, 0, new Int32Array( 2*N ), 1, 0 );

	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( infon, 0, 'info (strided)' );
	assert.strictEqual( m[ 0 ], N, 'm' );
	assert.strictEqual( mn[ 0 ], N, 'm (strided)' );
	assert.deepStrictEqual( s, sn, 's matches strided' );
	assert.deepStrictEqual( SEP, SEPn, 'SEP matches strided' );
	const expected = eigenvalueCondition( VL3, VR3, N );
	for ( let i = 0; i < N; i++ ) {
		assert.ok( Math.abs( s[ i ] - expected[ i ] ) < 1e-12, 's['+i+'] matches oracle' );
		assert.ok( SEP[ i ] > 0.0, 'SEP['+i+'] positive' );
	}
} );

test( 'dtrsna: row-major wrapper on transposed storage matches the column-major wrapper and the strided API (job=both, non-normal T)', function t() {
	const N = 3;
	const LDWORK = N + 6;
	const m = new Int32Array( 1 );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const info = dtrsna( 'row-major', 'both', 'all', sbuf( N ), 1, N, transpose3( T3 ), N, transpose3( VL3 ), N, transpose3( VR3 ), N, s, 1, SEP, 1, N, m, new Float64Array( N*LDWORK ), LDWORK, new Int32Array( 2*N ) );

	const mc = new Int32Array( 1 );
	const sc = new Float64Array( N );
	const SEPc = new Float64Array( N );
	dtrsna( 'column-major', 'both', 'all', sbuf( N ), 1, N, new Float64Array( T3 ), N, new Float64Array( VL3 ), N, new Float64Array( VR3 ), N, sc, 1, SEPc, 1, N, mc, new Float64Array( N*( N+6 ) ), N, new Int32Array( 2*N ) );

	const mn = new Int32Array( 1 );
	const sn = new Float64Array( N );
	const SEPn = new Float64Array( N );
	const infon = strided( 'both', 'all', sbuf( N ), 1, 0, N, transpose3( T3 ), N, 1, 0, transpose3( VL3 ), N, 1, 0, transpose3( VR3 ), N, 1, 0, sn, 1, 0, SEPn, 1, 0, N, mn, new Float64Array( N*LDWORK ), LDWORK, 1, 0, new Int32Array( 2*N ), 1, 0 );

	assert.strictEqual( info, 0, 'info' );
	assert.strictEqual( infon, 0, 'info (strided)' );
	assert.strictEqual( m[ 0 ], N, 'm' );
	assert.strictEqual( mn[ 0 ], N, 'm (strided)' );
	assert.deepStrictEqual( s, sn, 's matches strided' );
	assert.deepStrictEqual( SEP, SEPn, 'SEP matches strided' );
	assert.deepStrictEqual( s, sc, 's matches column-major' );
	assert.deepStrictEqual( SEP, SEPc, 'SEP matches column-major' );
	const expected = eigenvalueCondition( VL3, VR3, N );
	for ( let i = 0; i < N; i++ ) {
		assert.ok( Math.abs( s[ i ] - expected[ i ] ) < 1e-12, 's['+i+'] matches oracle' );
	}
} );

// Regression: the eigenvector-condition path ('both'/'eigenvectors') via the
// full documented layout signature. A vestigial `M` param once shifted the
// workspace args and crashed here; fixture helpers hid it by omitting `M`.
// See test/harness/LEARNINGS.md (2026-07-19 dtrsna).
test( 'dtrsna: documented signature, job=both, SEP path (regression)', function t() {
	const m = new Int32Array( 1 );
	const N = 3;
	const T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]); // diag(1,2,3)
	const VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
	const VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const WORK = new Float64Array( N * ( N + 6 ) );
	const IWORK = new Int32Array( 2 * N );

	const out = dtrsna( 'column-major', 'both', 'all', SELECT, 1, N, T, N, VL, N, VR, N, s, 1, SEP, 1, N, m, WORK, N, IWORK );

	assert.strictEqual( out, 0, 'info' );
	assert.strictEqual( m[ 0 ], N, 'm' );
	// Normal (diagonal) matrix: eigenvalue condition numbers are 1; the
	// eigenvalue separations equal the minimum gap (all 1 for diag(1,2,3)).
	for ( let i = 0; i < N; i++ ) {
		assert.ok( Math.abs( s[ i ] - 1.0 ) < 1e-12, 's['+i+']' );
		assert.ok( Math.abs( SEP[ i ] - 1.0 ) < 1e-12, 'SEP['+i+']' );
	}
});

test( 'dtrsna throws RangeError when a row-major LDWORK covers N but not the N+6 workspace columns (job=both)', function t() {
	const N = 3;
	const m = new Int32Array( 1 );
	assert.throws( function throws() {
		// LDWORK = N passes the LDWORK<1 guard but row-major needs >= N+6:
		dtrsna( 'row-major', 'both', 'all', sbuf( N ), 1, N, buf( N*N ), N, buf( N*N ), N, buf( N*N ), N, buf( N ), 1, buf( N ), 1, N, m, buf( N*( N+6 ) ), N, ibuf( 2*N ) );
	}, function check( err ) {
		assert.ok( err instanceof RangeError, 'is a RangeError' );
		assert.match( err.message, /Twentieth argument violates the reference leading-dimension rule \(row-major: must also cover the \( N < 2 \) \? N : N \+ 6 columns\)\. Value: `3`/ );
		return true;
	});
	assert.strictEqual( m[ 0 ], 0, 'm untouched' );
});

test( 'dtrsna allocates WORK and IWORK when passed null, matching an explicit workspace (job=both, non-normal T)', function t() {
	const N = 3;
	// Column-major upper triangular, non-normal T:
	const T = new Float64Array([ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ]);
	// Right eigenvectors (columns) of T, and left eigenvectors (columns) of T:
	const VR = new Float64Array([ 1.0, 0.0, 0.0, 2.0/3.0, 1.0, 0.0, 1.6, 2.5, 1.0 ]);
	const VL = new Float64Array([ 1.0, -2.0/3.0, 1.0/15.0, 0.0, 1.0, -2.5, 0.0, 0.0, 1.0 ]);
	const SELECT = sbuf( N );

	const s1 = new Float64Array( N );
	const sep1 = new Float64Array( N );
	const m1 = new Int32Array( 1 );
	const info1 = dtrsna( 'column-major', 'both', 'all', SELECT, 1, N, new Float64Array( T ), N, new Float64Array( VL ), N, new Float64Array( VR ), N, s1, 1, sep1, 1, N, m1, new Float64Array( N*( N+6 ) ), N, new Int32Array( 2*N ) );

	const s2 = new Float64Array( N );
	const sep2 = new Float64Array( N );
	const m2 = new Int32Array( 1 );
	const info2 = dtrsna( 'column-major', 'both', 'all', SELECT, 1, N, new Float64Array( T ), N, new Float64Array( VL ), N, new Float64Array( VR ), N, s2, 1, sep2, 1, N, m2, null, N, null );

	assert.strictEqual( info1, 0, 'info (explicit)' );
	assert.strictEqual( info2, info1, 'info' );
	assert.strictEqual( m2[ 0 ], N, 'm' );
	assert.strictEqual( m2[ 0 ], m1[ 0 ], 'm matches' );
	assert.deepStrictEqual( s2, s1, 's matches' );
	assert.deepStrictEqual( sep2, sep1, 'SEP matches' );
	for ( let i = 0; i < N; i++ ) {
		assert.ok( s1[ i ] > 0.0 && s1[ i ] <= 1.0, 's['+i+'] in (0,1]' );
		assert.ok( sep1[ i ] > 0.0, 'SEP['+i+'] positive' );
	}
	// Independent oracle: s(i) = |vl_i' * vr_i| / ( ||vl_i|| * ||vr_i|| ):
	for ( let j = 0; j < N; j++ ) {
		let dot = 0.0;
		let nl = 0.0;
		let nr = 0.0;
		for ( let i = 0; i < N; i++ ) {
			dot += VL[ (j*N)+i ] * VR[ (j*N)+i ];
			nl += VL[ (j*N)+i ] * VL[ (j*N)+i ];
			nr += VR[ (j*N)+i ] * VR[ (j*N)+i ];
		}
		const expected = Math.abs( dot ) / Math.sqrt( nl * nr );
		assert.ok( Math.abs( s1[ j ] - expected ) < 1e-12, 's['+j+'] matches |vl.vr|/(|vl||vr|)' );
	}
	// T is non-normal, so at least one eigenvalue is ill-conditioned (s < 1):
	assert.ok( Math.min( s1[ 0 ], s1[ 1 ], s1[ 2 ] ) < 1.0 - 1e-3, 'non-normal T gives s < 1' );
});

test( 'dtrsna: row-major N=1, job=eigenvectors accepts LDWORK=1 and returns SEP = |T(1,1)| as in column-major', function t() {
	// For N < 2 the row-major LDWORK floor is N (not N+6), so LDWORK=1 is valid:
	const mr = new Int32Array( 1 );
	const mc = new Int32Array( 1 );
	const sepr = new Float64Array( 1 );
	const sepc = new Float64Array( 1 );
	const sr = new Float64Array( 1 );
	const sc = new Float64Array( 1 );
	const infor = dtrsna( 'row-major', 'eigenvectors', 'all', sbuf( 1 ), 1, 1, new Float64Array( [ -3.5 ] ), 1, new Float64Array( [ 1.0 ] ), 1, new Float64Array( [ 1.0 ] ), 1, sr, 1, sepr, 1, 1, mr, new Float64Array( 7 ), 1, new Int32Array( 1 ) );
	const infoc = dtrsna( 'column-major', 'eigenvectors', 'all', sbuf( 1 ), 1, 1, new Float64Array( [ -3.5 ] ), 1, new Float64Array( [ 1.0 ] ), 1, new Float64Array( [ 1.0 ] ), 1, sc, 1, sepc, 1, 1, mc, new Float64Array( 7 ), 1, new Int32Array( 1 ) );
	assert.strictEqual( infor, 0, 'info' );
	assert.strictEqual( infoc, 0, 'info (column-major)' );
	assert.strictEqual( mr[ 0 ], 1, 'm' );
	assert.strictEqual( mc[ 0 ], 1, 'm (column-major)' );
	assert.strictEqual( sepr[ 0 ], 3.5, 'SEP = |T(1,1)|' );
	assert.strictEqual( sepc[ 0 ], 3.5, 'SEP = |T(1,1)| (column-major)' );
	assert.strictEqual( sr[ 0 ], 0.0, 's not referenced for job=eigenvectors' );
});
