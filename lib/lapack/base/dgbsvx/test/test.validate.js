/**
* Property-based validation for dgbsvx, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `svx` (EXPERT LU-solve DRIVER)
* composes equilibration + banded LU factor (dgbtrf) + solve (dgbtrs) + iterative
* refinement (dgbrfs) + condition estimate (dgbcon). It therefore inherits the three
* independent properties of its parts, checked against the ORIGINAL A0/B0:
*   (a) residual   ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS  (a valid solve)
*   (b) rcond      returned rcond ≈ 1/κ vs an INDEPENDENT true 1/κ within factor F
*   (c) ferr/berr  BERR tiny (>=0); actual fwd error ‖Xtrue-X‖inf/‖X‖inf <= FERR*C;
*                  FERR ∈ [0,1).
*
* fact/equed/trans convention (confirmed from lib/base.js):
*   - fact='not-factored' forces equed='none' (rowequ=colequ=false): the
*     equilibration path is BYPASSED, so A/B are NOT scaled and X is the solution
*     of the ORIGINAL op(A0)*X = B0 directly — the residual oracle is A0/B0.
*   - rcond is returned in the result OBJECT (result.rcond), NOT via an array arg.
*   - `equed` is passed as a plain STRING argument ('none') and echoed in result.equed.
*   - trans in {no-transpose(one-norm), transpose/conjugate-transpose(inf-norm)};
*     for a real matrix transpose and conjugate-transpose coincide but both API
*     paths are exercised. gbcon uses the same norm gbsvx picks per trans.
*
* Storage: AB is BANDED input ((kl+ku+1) rows); AFB is BANDED with luFill ((2*kl+ku+1)
* rows — the top KL fill rows "need not be set" and stay NaN-poisoned, filled by the
* factor). B/X/FERR/BERR dense; R/C and WORK poisoned so any stray read trips a NaN.
*
* Oracle: the trusted banded solver dgbsv provides BOTH the independent true solution
* (op(A0)*Y=B0) and the true inverse (op(A0)*Y=I) for the condition number. op(A0) for
* trans is A0^T, itself a (ku,kl)-band matrix, realized from the transposed logical.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import dgbsvx from './../lib/ndarray.js';
import dgbsvxBase from './../lib/base.js';
import dgbsv from '../../dgbsv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const NRHS = [ 1, 2 ];
const RCOND_FACTOR = 5; // rcond estimate vs independent truth: within this factor
const FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Positive-first-dimension-stride banded layouts only: dgbtrf's inner idamax pivot
// search walks the band-array first dimension and is out of contract for a negative
// first-dim stride (see LEARNINGS.md getrf/getf2 family).
const BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});
const TIGHT_B = BANDED_POS[ 0 ];              // tight positive-sgn1 band storage
const TIGHT_D = schemes.dense.layouts()[ 0 ]; // tight col-major (B / X / oracle)

// Map an API transpose flag to a reference transpose code.
function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

// (kl,ku) sweep clamped to [0,N-1] and deduped.
function bands( N ) {
	const hi = Math.max( 0, N - 1 );
	const raw = [ [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 1, 2 ], [ 2, 2 ] ];
	const seen = {};
	const out = [];
	raw.forEach( function each( p ) {
		const kl = Math.min( p[ 0 ], hi );
		const ku = Math.min( p[ 1 ], hi );
		const key = kl + ':' + ku;
		if ( !seen[ key ] ) {
			seen[ key ] = true;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

// Read column j out of physical storage as an array of scalar values.
function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read a fully-referenced dense buffer back into a LogicalMatrix.
function readMat( R, rows, cols ) {
	const M = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

function zeros( rows, cols ) {
	return new LogicalMatrix( sc, rows, cols ); // inits to sc.zero
}

function identity( n ) {
	const M = new LogicalMatrix( sc, n, n );
	let i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

// Transpose of a LogicalMatrix (op(A0)=A0^T for a real matrix; a (kl,ku)-band
// matrix transposes to a (ku,kl)-band matrix).
function transposeLogical( M, n ) {
	const T = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			T.set( j, i, M.get( i, j ) );
		}
	}
	return T;
}

// 1-norm (max abs col sum) or inf-norm (max abs row sum) of the FULL logical band
// matrix (out-of-band entries are exact zero, so full sums are correct).
function normOf( M, which ) {
	let best = 0.0;
	let s, i, j;
	if ( which === 'one' ) {
		for ( j = 0; j < M.cols; j++ ) {
			s = 0.0;
			for ( i = 0; i < M.rows; i++ ) {
				s += sc.abs( M.get( i, j ) );
			}
			if ( s > best ) {
				best = s;
			}
		}
		return best;
	}
	for ( i = 0; i < M.rows; i++ ) {
		s = 0.0;
		for ( j = 0; j < M.cols; j++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > best ) {
			best = s;
		}
	}
	return best;
}

// inf-norm of a scalar-value vector (max modulus).
function infNormVec( a ) {
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( a[ i ] );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// inf-norm of the difference of two scalar-value vectors.
function diffInfNorm( a, b ) {
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// Solve op(A0)*Y = RHS with the trusted banded dgbsv on fresh copies. For 'n' the
// band is (kl,ku); for 't'/'c' op(A0)=A0^T is the (ku,kl)-band transpose.
function opBandSolve( A0, N, kl, ku, code, rhsLogical, nrhs ) {
	const Aop = ( code === 'n' ) ? A0 : transposeLogical( A0, N );
	const akl = ( code === 'n' ) ? kl : ku;
	const aku = ( code === 'n' ) ? ku : kl;
	const Ar = schemes.banded.realize( sc, Aop, { 'kl': akl, 'ku': aku, 'luFill': true }, TIGHT_B );
	const Br = schemes.dense.realize( sc, rhsLogical, { 'part': 'full' }, TIGHT_D );
	const ipiv = new Int32Array( N );
	const info = dgbsv( N, akl, aku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dgbsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Independent TRUE solution of op(A0)*X = B0.
function trueSolution( A0, B0, N, kl, ku, nrhs, code ) {
	return opBandSolve( A0, N, kl, ku, code, B0, nrhs );
}

// Independent true inverse of op(A0): solve op(A0)*Y = I.
function opInverse( A0, N, kl, ku, code ) {
	const Yr = opBandSolve( A0, N, kl, ku, code, identity( N ), N );
	return readMat( Yr, N, N );
}

// NaN-poisoned scale-factor array (never read on the fact='not-factored' path).
function poisonVec( n ) {
	const a = new Float64Array( Math.max( n, 1 ) );
	a.fill( NaN );
	return a;
}

// Drive dgbsvx (module `mod`, default the ndarray entry) on realized copies; return
// the physical output handles + result object.
function callGbsvx( mod, fact, trans, N, kl, ku, nrhs, A0, B0, abLayout, dLayout ) {
	const Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, abLayout );                        // AB input (kl+ku+1 rows)
	const AFr = schemes.banded.realize( sc, zeros( N, N ), { 'kl': kl, 'ku': ku, 'luFill': true }, abLayout ); // AFB (top KL rows poisoned)
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, dLayout );
	const Xr = schemes.dense.realize( sc, zeros( N, nrhs ), { 'part': 'full' }, dLayout );
	const ipiv = new Int32Array( N );
	const r = poisonVec( N );
	const c = poisonVec( N );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = poisonedWork( sc, Math.max( 1, 3 * N ) );
	const IWORK = new Int32Array( Math.max( N, 1 ) );
	const res = mod( fact, trans, N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, 'none', r, 1, 0, c, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	return {
		'X': Xr,
		'FERR': FERR,
		'BERR': BERR,
		'res': res
	};
}


// TESTS //

// Steps 2-3-5: three properties across trans flags, a size sweep, (kl,ku), and nrhs.
test( 'dgbsvx: residual + rcond + FERR/BERR bound (trans x N x (kl,ku) x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			bands( N ).forEach( function eachBand( b ) {
				NRHS.forEach( function eachNrhs( nrhs ) {
					runProperty( trans, N, b[ 0 ], b[ 1 ], nrhs );
				});
			});
		});
	});
});

function runProperty( trans, N, kl, ku, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 1000 ) + ( kl * 100 ) + ( ku * 10 ) + nrhs ); // reproducible
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const B0 = logical.general( sc, rng, N, nrhs );
	const code = transCode( trans );
	const which = ( code === 'n' ) ? 'one' : 'inf'; // gbsvx norm choice per trans

	const out = callGbsvx( dgbsvx, 'not-factored', trans, N, kl, ku, nrhs, A0, B0, TIGHT_B, TIGHT_D );
	const tag = 'dgbsvx '+trans+' N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs;

	// (a) residual: X solves op(A0)*X = B0 against the ORIGINAL band matrix.
	checked( 'dgbsvx', 'residual', function run() {
		if ( out.res.info !== 0 ) {
			throw new Error( tag+': info='+out.res.info+' (expected 0)' );
		}
		if ( out.res.equed !== 'none' ) {
			throw new Error( tag+': equed='+out.res.equed+' (expected none for fact=not-factored)' );
		}
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( out.X, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond ≈ 1/κ vs an INDEPENDENT true 1/κ (anorm·‖A0⁻¹‖) within factor F.
	checked( 'dgbsvx', 'property', function run() {
		const anorm = normOf( A0, which );
		const Ainv = opInverse( A0, N, kl, ku, code );
		const invnorm = normOf( Ainv, which );
		const trueRcond = 1.0 / ( anorm * invnorm );
		const r = out.res.rcond;
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( tag+': rcond='+r+' not in (0,1]' );
		}
		if ( !( r <= RCOND_FACTOR * trueRcond && trueRcond <= RCOND_FACTOR * r ) ) {
			throw new Error( tag+': rcond='+r.toExponential( 4 )+' disagrees with true_rcond='+trueRcond.toExponential( 4 )+' beyond factor '+RCOND_FACTOR+' (ratio '+( r / trueRcond ).toExponential( 3 )+')' );
		}
	});

	// (c) BERR tiny (>=0); actual forward error <= FERR*C; FERR ∈ [0,1).
	checked( 'dgbsvx', 'structural', function run() {
		const Xtrue = trueSolution( A0, B0, N, kl, ku, nrhs, code );
		const berrCap = Math.max( 1e-8, 8.0 * ( N + 1 ) * EPS );
		let xcol, tcol, eActual, eBound, j;
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( out.BERR[ j ] ) || !( out.BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+out.BERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( out.BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+out.BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
			if ( !Number.isFinite( out.FERR[ j ] ) || !( out.FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+out.FERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( out.FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+out.FERR[ j ].toExponential( 3 )+' absurdly loose (>=1) for well-conditioned input' );
			}
			xcol = readCol( out.X, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( out.FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual fwd error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+out.FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// base.js and ndarray.js must AGREE on rcond (the ndarray entry is a thin validating
// wrapper over base). Run both on identical fresh realized inputs and assert the
// returned rcond is bit-for-bit identical — a divergence would be a real bug.
test( 'dgbsvx: base and ndarray agree on rcond (Object.is)', function t() {
	checked( 'dgbsvx', 'property', function run() {
		TRANS.forEach( function eachTrans( trans ) {
			[ 5, 9, 16 ].forEach( function eachN( N ) {
				bands( N ).forEach( function eachBand( b ) {
					const rng = new RNG( 0xA5 + ( N * 100 ) + ( b[ 0 ] * 10 ) + b[ 1 ] );
					const A0 = logical.banded( sc, rng, N, N, b[ 0 ], b[ 1 ] );
					const B0 = logical.general( sc, rng, N, 2 );
					const oB = callGbsvx( dgbsvxBase, 'not-factored', trans, N, b[ 0 ], b[ 1 ], 2, A0, B0, TIGHT_B, TIGHT_D );
					const oN = callGbsvx( dgbsvx, 'not-factored', trans, N, b[ 0 ], b[ 1 ], 2, A0, B0, TIGHT_B, TIGHT_D );
					if ( !Object.is( oB.res.rcond, oN.res.rcond ) ) {
						throw new Error( 'dgbsvx '+trans+' N='+N+' kl='+b[ 0 ]+' ku='+b[ 1 ]+': base rcond='+oB.res.rcond+' != ndarray rcond='+oN.res.rcond );
					}
				});
			});
		});
	});
});

// Step 4: layout-invariance fuzz. dgbsvx factors AFB from scratch (dgbtrf: idamax
// pivot search => positive first-dim stride, BANDED_POS) and composes dgbcon/dgbtrs/
// dgbrfs whose inner kernels switch on a col<->row storage flip and legitimately
// reorder the accumulation (~1 ULP). So bit-exactness holds only WITHIN a single
// storage-order family (col / row); cross-order correctness is certified by the
// swept residual property above. AB/AFB are paired with B/X in the SAME order family
// so only addressing (offset, leading-dim pad, gap, second-dim stride sign) varies.
// Output vector = flatten(X) ++ [rcond] ++ FERR ++ BERR.
function byOrder( layouts, order ) {
	return layouts.filter( function pick( L ) {
		return ( order === 'row' ) === ( L.order === 'row' );
	});
}
const AB_COL = byOrder( BANDED_POS, 'col' );
const AB_ROW = byOrder( BANDED_POS, 'row' );
const D_COL = byOrder( schemes.dense.layouts(), 'col' );
const D_ROW = byOrder( schemes.dense.layouts(), 'row' );

test( 'dgbsvx: bit-exact within a storage-order family (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, AB_COL, D_COL, 'col' );
		runInvariance( trans, AB_ROW, D_ROW, 'row' );
	});
});

function runInvariance( trans, abFamily, dFamily, fam ) {
	const N = 11;
	const kl = 2;
	const ku = 3;
	const nrhs = 2;
	const SEED = 0xF00D;

	// Pair AB- and dense-layouts (each cycled within its own same-order family) so
	// every operand stays in one storage order while addressing varies.
	const n = Math.max( abFamily.length, dFamily.length );
	const variants = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		variants.push({
			'a': abFamily[ i % abFamily.length ],
			'd': dFamily[ i % dFamily.length ]
		});
	}

	checked( 'dgbsvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( v ) {
			const rng = new RNG( SEED ); // identical operand values every variant
			const A0 = logical.banded( sc, rng, N, N, kl, ku );
			const B0 = logical.general( sc, rng, N, nrhs );
			const out = callGbsvx( dgbsvx, 'not-factored', trans, N, kl, ku, nrhs, A0, B0, v.a, v.d );
			const flat = check.flattenLogical( sc, readMat( out.X, N, nrhs ) );
			let k;
			flat.push( out.res.rcond );
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.BERR[ k ] );
			}
			return flat;
		}, { 'label': 'dgbsvx '+trans+' layout invariance '+fam+'-major' } );
	});
}
