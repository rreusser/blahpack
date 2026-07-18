/**
* Property-based validation for zhptri, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `hp` -> HERMITIAN PACKED
* (schemes.packed, logical.hermitian — the mirror CONJUGATES and the diagonal is
* real); `tri` (inverse from a packed Bunch-Kaufman factor) -> RECONSTRUCTION:
* A0 * inv(A0) = I. Input is the packed Bunch-Kaufman factor + IPIV (produced by
* calling zhptrf in place); output overwrites the packed uplo triangle with
* inv(A), which is Hermitian — the opposite triangle is NOT stored. The FULL
* Hermitian logical matrix A0 is the independent oracle; the product of the
* original with the computed inverse must be the identity, at backward-error
* tolerance.
*
* FACTOR SOURCE — the natural packed factor `zhptrf`. Its UPPER-triangle path was
* fixed on 2026-07-17 (a running interchange index KX was off by one, conjugating
* the wrong off-diagonal element; see test/harness/LEARNINGS.md "zhptrf UPPER
* path"), so the natural pipeline zhptrf → zhptri is now validated end-to-end for
* BOTH uplo. The Bunch-Kaufman factor + IPIV are produced by factoring A0 once
* with `zhptrf` (tight packed) and reading the uplo triangle back; the inverse is
* then re-run across the full packed-layout set to stress zhptri's OWN addressing.
*
* The factor is produced ONCE (packed, tight) and only the INVERSE
* (zhptri) is re-run across the full packed-layout set (non-unit strides 2/3,
* negative −1/−2). That stresses zhptri's OWN packed addressing at every stride —
* exactly the class of the zpptri packed stride-mapping bug (offset+idx vs
* offset+idx*stride), which returned NaN for every non-unit packed stride.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zhptri from './../lib/ndarray.js';
import zhptrf from '../../zhptrf/lib/ndarray.js'; // natural packed factor source (upper path fixed 2026-07-17)

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLOS = [ 'upper', 'lower' ];

// Read the computed inverse (packed uplo triangle) back into a FULL HERMITIAN
// LogicalMatrix by mirroring the referenced triangle across the diagonal WITH
// conjugation (the diagonal is its own mirror; zhptri stores a real diagonal).
function readSymFull( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let v, i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				F.set( i, i, R.read( i, i ) );
			} else if ( uplo === 'upper' ) {
				v = R.read( j, i ); // referenced upper element
				F.set( j, i, v );
				F.set( i, j, sc.conj( v ) ); // Hermitian mirror (conj)
			} else {
				v = R.read( i, j ); // referenced lower element
				F.set( i, j, v );
				F.set( j, i, sc.conj( v ) );
			}
		}
	}
	return F;
}

// Read only the referenced packed uplo triangle back (opposite triangle exact
// zero) for bit-exact layout-invariance flattening AND for freezing the factor.
function readTri( R, n, uplo ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, R.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖ normalized by
// ‖A0‖·‖inv(A0)‖ + √n.
function assertInvResidual( A0, invA, P, n, label, factor ) {
	const R = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB / packed-stride bug
	const scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Freeze a valid Bunch-Kaufman factor for a given (uplo,n): factor A0 ONCE with
// the natural packed zhptrf (tight) and read the uplo triangle back as a
// LogicalMatrix, so the packed inverse can be re-run at arbitrary packed layouts
// off a fixed, correct factor. (zhptrf's upper path was fixed 2026-07-17 — see the
// file header and LEARNINGS.) Returns null on a rare singular draw.
const TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };

function freezeFactor( n, seed ) {
	const rng = new RNG( seed );
	const A0 = logical.hermitian( sc, rng, n );
	const UPLO = [ 'upper', 'lower' ];
	const out = {};
	let i;
	for ( i = 0; i < UPLO.length; i++ ) {
		out[ UPLO[ i ] ] = factorOne( A0, n, UPLO[ i ] );
		if ( out[ UPLO[ i ] ] === null ) {
			return null;
		}
	}
	out.A0 = A0;
	return out;
}

function factorOne( A0, n, uplo ) {
	const R = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHT );
	const ipiv = new Int32Array( Math.max( n, 1 ) );
	const info = zhptrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0 );
	if ( info !== 0 ) {
		return null; // rare singular draw
	}
	return {
		'factor': readTri( R, n, uplo ), // packed readTri: R.read(i,j) yields the value
		'ipiv': ipiv
	};
}

// Run ONLY the inverse from a frozen factor at a given packed layout; returns the
// realized packed buffer wrapper R so the caller can read the inverse back.
function invertAt( F, n, uplo, layout ) {
	const R = schemes.packed.realize( sc, F.factor, { 'part': uplo }, layout );
	const ipiv = F.ipiv.slice();
	const work = poisonedWork( sc, Math.max( n, 1 ) );
	const info = zhptri( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0, work, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'zhptri returned info='+info+' from a nonsingular frozen factor' );
	}
	return R;
}

// Steps 2-3-5: reconstruction A0*inv(A0)=I across the size sweep, both uplo flags,
// and EVERY packed storage layout (non-unit strides 2/3, negative −1/−2, pads).
// The factor is frozen at a tight layout; only zhptri runs per layout, so this
// certifies zhptri's own packed addressing across all strides at backward-error
// tolerance — the packed-stride NaN/garbage detector (zpptri-class bug).
test( 'zhptri: inverse reconstruction A*inv(A)=I (size sweep x uplo x all packed layouts)', function t() {
	SIZES_SMALL.forEach( function eachN( n ) {
		const F = freezeFactor( n, 0x100 + n );
		if ( F === null ) {
			return; // rare singular draw — inverse undefined
		}
		UPLOS.forEach( function eachUplo( uplo ) {
			schemes.packed.layouts().forEach( function eachLayout( layout ) {
				const R = invertAt( F[ uplo ], n, uplo, layout );
				const invA = readSymFull( R, n, uplo );
				const P = ref.matmul( sc, F.A0, invA );
				checked( 'zhptri', 'reconstruct', function run() {
					assertInvResidual( F.A0, invA, P, n, 'zhptri '+uplo+' n='+n, 100 );
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz on zhptri's OWN addressing. Our complex packed
// kernels (zdotc / zhpmv / zcopy) have NO unit-stride fast path that regroups the
// summation (see the dznrm2/zpptri LEARNINGS entries), so the complex Hermitian
// packed inverse is bit-exact across the FULL packed layout family (all strides +
// signs + pads). Any difference here is a genuine addressing bug. Records L3.
test( 'zhptri: bit-exact across all packed layouts', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		[ 9, 40 ].forEach( function eachN( n ) {
			runInvariance( uplo, n );
		});
	});
});

function runInvariance( uplo, n ) {
	const F = freezeFactor( n, 0xF00D );
	if ( F === null ) {
		throw new Error( 'zhptri invariance setup: zhptrf returned a singular factor' );
	}
	checked( 'zhptri', 'layout-invariance', function run() {
		layoutInvariant( schemes.packed.layouts(), function build( layout ) {
			const R = invertAt( F[ uplo ], n, uplo, layout );
			return check.flattenLogical( sc, readTri( R, n, uplo ) );
		}, { 'label': 'zhptri '+uplo+' n='+n+' packed layout invariance' } );
	});
}

// Step 4c: workspace conformance. zhptri's WORK is a fixed-size (len N) unblocked
// scratch column advertised by the ndarray wrapper (throws below N). Probe the
// smallest accepted length and assert it actually suffices with a POISONED buffer.
test( 'zhptri: workspace minimum (len N) suffices with a poisoned buffer', function t() {
	const uplo = 'upper';
	const N = 33;
	const F = freezeFactor( N, 0xC0FFEE );
	if ( F === null ) {
		throw new Error( 'zhptri workspace setup: zhptrf returned a singular factor' );
	}

	function run( workLen ) {
		const R = schemes.packed.realize( sc, F[ uplo ].factor, { 'part': uplo }, TIGHT );
		const ipiv = F[ uplo ].ipiv.slice();
		const work = poisonedWork( sc, workLen );
		zhptri( uplo, N, R.data, R.args[ 0 ], R.args[ 1 ], ipiv, 1, 0, work, 1, 0 );
		return check.flattenLogical( sc, readTri( R, N, uplo ) );
	}

	checked( 'zhptri', 'workspace', function check_() {
		const minLen = assertWorkspaceSufficient( run, {}, 'zhptri WORK@N=33 upper' );
		if ( minLen !== N ) {
			throw new Error( 'zhptri: advertised WORK minimum '+minLen+' != N='+N );
		}
	});
});
