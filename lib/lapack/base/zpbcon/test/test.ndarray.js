import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbtrf from './../../zpbtrf/lib/base.js';
import zpbcon from './../lib/ndarray.js';

// FIXTURES //

import upper_kd1 from './fixtures/upper_kd1.json' with { type: 'json' };
import lower_kd1 from './fixtures/lower_kd1.json' with { type: 'json' };
import upper_kd2 from './fixtures/upper_kd2.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function complexBandedMatrix( ldab, n, entries ) {
	const ab = new Complex128Array( ldab * n );
	const abv = reinterpret( ab, 0 );
	let idx, i;
	for ( i = 0; i < entries.length; i++ ) {
		idx = ( ( entries[ i ][ 1 ] * ldab ) + entries[ i ][ 0 ] ) * 2;
		abv[ idx ] = entries[ i ][ 2 ];
		abv[ idx + 1 ] = entries[ i ][ 3 ];
	}
	return ab;
}

test( 'zpbcon: upper, KD=1 (4x4 HPD)', function t() {
	const tc = upper_kd1;
	const n = 4;
	const kd = 1;
	const ldab = 3;
	// Upper banded: row 0 = superdiag, row 1 = main
	// But with ldab=3, row 0 unused for col 1; row kd=1 = superdiag; row kd+1=2 would be off.
	// Actually for upper storage: AB(kd+1-j+i, j) stores A(i,j) for max(1,j-kd)<=i<=j
	// With LDAB=KD+1=2 in Fortran but we used LDAB=3. Let me match Fortran test.
	// In Fortran test: ab(1,2)=(1+i), ab(2,1)=(4,0) etc. Using LDAB=3 (KD+1=2 padded to 3)
	// Row indices 0-based: row 0=superdiag(kd-0), row 1=main
	const ab = complexBandedMatrix( ldab, n, [
		[ 1, 0, 4.0, 0.0 ],
		[ 0, 1, 1.0, 1.0 ], [ 1, 1, 5.0, 0.0 ],
		[ 0, 2, 1.0, 1.0 ], [ 1, 2, 6.0, 0.0 ],
		[ 0, 3, 2.0, 1.0 ], [ 1, 3, 7.0, 0.0 ]
	]);
	const work = new Complex128Array( 2 * n );
	const rwork = new Float64Array( n );
	const rcond = new Float64Array( 1 );

	let info = zpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0, 'zpbtrf info' );
	info = zpbcon( 'upper', n, kd, ab, 1, ldab, 0, tc.anorm, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0, 'zpbcon info' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zpbcon: lower, KD=1 (4x4 HPD)', function t() {
	const tc = lower_kd1;
	const n = 4;
	const kd = 1;
	const ldab = 3;
	// Lower banded: row 0=main, row 1=subdiag
	const ab = complexBandedMatrix( ldab, n, [
		[ 0, 0, 4.0, 0.0 ], [ 1, 0, 1.0, -1.0 ],
		[ 0, 1, 5.0, 0.0 ], [ 1, 1, 1.0, -1.0 ],
		[ 0, 2, 6.0, 0.0 ], [ 1, 2, 2.0, -1.0 ],
		[ 0, 3, 7.0, 0.0 ]
	]);
	const work = new Complex128Array( 2 * n );
	const rwork = new Float64Array( n );
	const rcond = new Float64Array( 1 );

	let info = zpbtrf( 'lower', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0 );
	info = zpbcon( 'lower', n, kd, ab, 1, ldab, 0, tc.anorm, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zpbcon: upper, KD=2 (4x4 HPD)', function t() {
	const tc = upper_kd2;
	const n = 4;
	const kd = 2;
	const ldab = 3;
	const ab = complexBandedMatrix( ldab, n, [
		[ 2, 0, 10.0, 0.0 ],
		[ 1, 1, 2.0, 1.0 ], [ 2, 1, 10.0, 0.0 ],
		[ 0, 2, 1.0, 0.0 ], [ 1, 2, 3.0, 1.0 ], [ 2, 2, 10.0, 0.0 ],
		[ 0, 3, 1.0, 0.0 ], [ 1, 3, 2.0, 1.0 ], [ 2, 3, 10.0, 0.0 ]
	]);
	const work = new Complex128Array( 2 * n );
	const rwork = new Float64Array( n );
	const rcond = new Float64Array( 1 );

	let info = zpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0 );
	info = zpbcon( 'upper', n, kd, ab, 1, ldab, 0, tc.anorm, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zpbcon: N=0 (rcond=1)', function t() {
	const ab = new Complex128Array( 1 );
	const work = new Complex128Array( 0 );
	const rwork = new Float64Array( 0 );
	const rcond = new Float64Array( 1 );
	const info = zpbcon( 'upper', 0, 0, ab, 1, 1, 0, 0.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], 1.0 );
});

test( 'zpbcon: N=1', function t() {
	const tc = n_one;
	const ab = new Complex128Array( 3 );
	const abv = reinterpret( ab, 0 );
	abv[ 0 ] = 4.0;
	abv[ 1 ] = 0.0;
	const work = new Complex128Array( 2 );
	const rwork = new Float64Array( 1 );
	const rcond = new Float64Array( 1 );

	let info = zpbtrf( 'upper', 1, 0, ab, 1, 3, 0 );
	assert.equal( info, 0 );
	info = zpbcon( 'upper', 1, 0, ab, 1, 3, 0, 4.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zpbcon: anorm=0 (rcond=0)', function t() {
	const n = 4;
	const kd = 1;
	const ldab = 3;
	const ab = complexBandedMatrix( ldab, n, [
		[ 1, 0, 4.0, 0.0 ],
		[ 0, 1, 1.0, 0.0 ], [ 1, 1, 5.0, 0.0 ],
		[ 0, 2, 1.0, 0.0 ], [ 1, 2, 6.0, 0.0 ],
		[ 0, 3, 2.0, 0.0 ], [ 1, 3, 7.0, 0.0 ]
	]);
	const work = new Complex128Array( 2 * n );
	const rwork = new Float64Array( n );
	const rcond = new Float64Array( 1 );

	let info = zpbtrf( 'upper', n, kd, ab, 1, ldab, 0 );
	assert.equal( info, 0 );
	info = zpbcon( 'upper', n, kd, ab, 1, ldab, 0, 0.0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( rcond[ 0 ], 0.0 );
});
