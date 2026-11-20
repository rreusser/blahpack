/**
* Property-based validation for zlatps, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `tp` -> triangular PACKED
* (schemes.packed, logical.triangular); `latps` (scaled packed triangular
* solve) -> residual property `op(A)*x = s*b` against the independent oracle,
* where `s = scale[0]` is the scale factor zlatps chose to prevent overflow.
*
* zlatps has two solve paths: a fast path that delegates to ztpsv when the
* growth bound is safe, and a CAREFUL path (its own scaled substitution loops,
* `computeTransposeSum`, CNORM-driven bounds) taken when it is not. Ordinary
* well-conditioned inputs only ever reach the fast path, so every property and
* invariance check here runs on two input families:
*
* -   `nominal`: diagonally dominant (fast path).
* -   `stress`: off-diagonals scaled up so the growth bound fails and the
*     careful path must run. The test asserts `scale < 1` so this family can
*     never silently fall back onto the fast path and pass vacuously.
*
* Layout invariance is BIT-EXACT across packed offsets and positive strides,
* for both `normin` values, with the CNORM output included in the comparison.
* This is the regression test for tickets/0019 (LEARNINGS 2026-07-17 zlatps
* AP base offset entry): the lower CNORM loop used to add `offsetAP` twice, so
* any nonzero offset fed wrong column norms into the careful path. Negative
* packed strides are excluded: zlatps computes CNORM with dzasum, which returns
* 0 for a non-positive stride (see tickets/0044).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zlatps from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const DIAG = [ 'non-unit', 'unit' ];
const TRANS = [
	[ 'no-transpose', 'n' ],
	[ 'transpose', 't' ],
	[ 'conjugate-transpose', 'c' ]
];
const FAMILIES = [ 'nominal', 'stress' ];

// Off-diagonal magnification for the stress family. Large enough that the
// growth bound fails and, for N >= STRESS_MIN_N, the careful path must rescale.
const STRESS = 1.0e40;

// Positive-stride packed layouts only (see header comment):
const AP_LAYOUTS = schemes.packed.layouts().filter( function keep( L ) {
	return L.stride > 0;
});
const X_LAYOUTS = schemes.vectorLayouts().filter( function keep( L ) {
	return L.stride > 0;
});

function buildMatrix( family, rng, N, uplo, unit ) {
	const A = logical.triangular( sc, rng, N, { 'uplo': uplo, 'unit': unit } );
	let i;
	let j;
	if ( family === 'stress' ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < N; i++ ) {
				if ( i !== j ) {
					A.set( i, j, sc.scale( A.get( i, j ), STRESS ) );
				}
			}
		}
	}
	return A;
}

function buildRhs( rng, N ) {
	const b = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		b.push( sc.random( rng ) );
	}
	return b;
}

// Run zlatps once with normin='no' and return { x, scale, cnorm }.
function solve( uplo, trans, diag, N, A, b, apL, xL ) {
	const unit = ( diag === 'unit' );
	const AP = schemes.packed.realize( sc, A, { 'part': uplo, 'unit': unit }, apL );
	const X = schemes.realizeVector( sc, b, xL );
	const scale = new Float64Array( 1 );
	const CNORM = new Float64Array( N + 1 );
	zlatps( uplo, trans, diag, 'no', N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], scale, CNORM, 1, 0 );
	const x = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		x.push( X.read( i ) );
	}
	return { 'x': x, 'scale': scale[ 0 ], 'cnorm': CNORM };
}

// Step 2-5: residual `op(A)*x = s*b` over uplo x trans x diag x family x N.
test( 'zlatps: scaled packed solve residual op(A)*x = s*b (uplo x trans x diag x family x N)', function t() {
	FAMILIES.forEach( function eachFamily( family ) {
		UPLO.forEach( function eachUplo( uplo ) {
			TRANS.forEach( function eachTrans( tr ) {
				DIAG.forEach( function eachDiag( diag ) {
					SIZES_SMALL.forEach( function eachN( N ) {
						runResidual( family, uplo, tr[ 0 ], tr[ 1 ], diag, N );
					});
				});
			});
		});
	});
});

// Smallest N at which the stress family is guaranteed to overflow without
// rescaling (growth ~ STRESS^(N-1) exceeds the overflow threshold).
const STRESS_MIN_N = 9;

function maxAbs( values ) {
	let mx = 0.0;
	let i;
	for ( i = 0; i < values.length; i++ ) {
		mx = Math.max( mx, sc.abs( values[ i ] ) );
	}
	return mx;
}

function runResidual( family, uplo, trans, code, diag, N ) {
	const rng = new RNG( 0x200 + N );
	const A = buildMatrix( family, rng, N, uplo, diag === 'unit' );
	const b = buildRhs( rng, N );
	const r = solve( uplo, trans, diag, N, A, b, AP_LAYOUTS[ 0 ], X_LAYOUTS[ 0 ] );
	const label = 'zlatps '+family+' '+uplo+' '+trans+' '+diag+' N='+N;
	checked( 'zlatps', 'residual', function run() {
		let i;
		let j;
		if ( !( r.scale >= 0.0 && r.scale <= 1.0 ) ) {
			throw new Error( label+': scale '+r.scale+' not in [0,1]' );
		}
		if ( family === 'stress' && N >= STRESS_MIN_N && !( r.scale < 1.0 ) ) {
			throw new Error( label+': stress input did not reach the careful (rescaling) path' );
		}
		// The backward error ‖op(A)x - s*b‖ / (‖A‖‖x‖ + ‖s*b‖) is invariant under
		// A -> A/alpha, x -> x/beta, s*b -> s*b/(alpha*beta). Normalize so the
		// oracle's ‖A‖‖x‖ cannot overflow on the stress family.
		const entries = [];
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < N; i++ ) {
				entries.push( A.get( i, j ) );
			}
		}
		const alpha = maxAbs( entries ) || 1.0;
		const beta = maxAbs( r.x ) || 1.0;
		const An = new LogicalMatrix( sc, N, N );
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < N; i++ ) {
				An.set( i, j, sc.scale( A.get( i, j ), 1.0 / alpha ) );
			}
		}
		const xn = r.x.map( function scaleX( v ) {
			return sc.scale( v, 1.0 / beta );
		});
		const sb = b.map( function scaleB( v ) {
			return sc.scale( sc.scale( sc.scale( v, r.scale ), 1.0 / alpha ), 1.0 / beta );
		});
		check.assertResidual( sc, An, xn, sb, { 'trans': code, 'factor': 100, 'label': label } );
	});
}

// Step 3: layout invariance — x, scale and CNORM bit-exact across packed AP
// offsets/positive strides and strided x, on both the fast and careful paths.
// Also covers normin='yes' (CNORM supplied by the first call), the way the
// *ppcon callers chain a no-transpose solve into a conjugate-transpose solve.
test( 'zlatps: output is bit-exact across packed AP offsets and positive strides (fast + careful paths)', function t() {
	const N = 9;
	const SEED = 0x19;
	FAMILIES.forEach( function eachFamily( family ) {
		UPLO.forEach( function eachUplo( uplo ) {
			TRANS.forEach( function eachTrans( tr ) {
				DIAG.forEach( function eachDiag( diag ) {
					checked( 'zlatps', 'layout-invariance', function run() {
						layoutInvariant( AP_LAYOUTS, function build( apL, idx ) {
							return chained( family, uplo, tr[ 0 ], diag, N, SEED, apL, X_LAYOUTS[ idx % X_LAYOUTS.length ] );
						}, { 'label': 'zlatps '+family+' '+uplo+' '+tr[ 0 ]+' '+diag+' layout invariance' } );
					});
				});
			});
		});
	});
});

// Solve op(A)*x = s*b with normin='no', then reuse CNORM for a second solve
// with normin='yes' and the given trans; flatten every output.
function chained( family, uplo, trans, diag, N, seed, apL, xL ) {
	const rng = new RNG( seed ); // identical values every variant
	const unit = ( diag === 'unit' );
	const A = buildMatrix( family, rng, N, uplo, unit );
	const b = buildRhs( rng, N );
	const AP = schemes.packed.realize( sc, A, { 'part': uplo, 'unit': unit }, apL );
	const X = schemes.realizeVector( sc, b, xL );
	const scale = new Float64Array( 2 );
	const CNORM = new Float64Array( N );
	const out = new LogicalMatrix( sc, ( 2 * N ) + 2, 1 );
	let i;

	zlatps( uplo, 'no-transpose', diag, 'no', N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], scale, CNORM, 1, 0 );
	for ( i = 0; i < N; i++ ) {
		out.set( i, 0, X.read( i ) );
	}
	zlatps( uplo, trans, diag, 'yes', N, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], scale.subarray( 1 ), CNORM, 1, 0 );
	for ( i = 0; i < N; i++ ) {
		out.set( N + i, 0, X.read( i ) );
	}
	out.set( 2 * N, 0, sc.fromReal( scale[ 0 ] ) );
	out.set( ( 2 * N ) + 1, 0, sc.fromReal( scale[ 1 ] ) );
	return check.flattenLogical( sc, out ).concat( Array.from( CNORM ) );
}

// Guard against the stress family drifting back onto the fast path at the
// invariance size (otherwise the careful-path invariance check is vacuous).
test( 'zlatps: stress family reaches the careful path at the invariance size', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		DIAG.forEach( function eachDiag( diag ) {
			const rng = new RNG( 0x19 );
			const A = buildMatrix( 'stress', rng, 9, uplo, diag === 'unit' );
			const b = buildRhs( rng, 9 );
			const r = solve( uplo, 'conjugate-transpose', diag, 9, A, b, AP_LAYOUTS[ 0 ], X_LAYOUTS[ 0 ] );
			if ( !( r.scale < 1.0 ) ) {
				throw new Error( 'zlatps stress '+uplo+' '+diag+': scale '+r.scale+' (careful path not reached)' );
			}
		});
	});
});
