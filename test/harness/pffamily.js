/**
* Shared property-based driver for the Rectangular Full Packed (RFP) positive-
* definite family: pftrf (Cholesky), pftri (inverse from the factor), pftrs
* (solve). One driver serves both the real (`d`, transr 'no-transpose'/
* 'transpose') and complex (`z`, transr 'no-transpose'/'conjugate-transpose')
* variants via the scalar trait.
*
* RFP is a STORAGE FORMAT, not a new algorithm: an SPD/HPD matrix's referenced
* triangle is packed into a length-N*(N+1)/2 buffer whose internal addressing
* the pf* routines interpret as a (padded) column-major triangle. So we never
* hand-encode the RFP map — we bridge RFP<->dense TR with the already-validated
* converters trttf / tfttr, and validate the pf* routines by the SAME
* mathematical properties as their dense (po) siblings:
*
*   pftrf  reconstruct  A0 = FᴴF (upper) / F Fᴴ (lower), F the factor triangle
*   pftri  reconstruct  A0 * inv(A0) = I  (backward-error residual)
*   pftrs  residual     ‖A0*X - B0‖ per RHS against the ORIGINAL Hermitian A0
*
* The oracle is always the FULL logical positiveDefinite matrix A0; only its
* referenced (uplo) triangle is ever realized into (poisoned) storage, so a read
* of the wrong triangle or out of the RFP buffer trips a NaN.
*
* LAYOUT INVARIANCE (L3): the 1-D RFP buffer's internal kernels address it purely
* through the caller stride (strideA1 = s, strideA2 = s*lda), so a uniform stride
* rescale / offset shift cannot reorder any arithmetic — MOST of the pf* family is
* bit-exact across ALL linear RFP layouts (stride sign and magnitude included),
* and pftrs is additionally bit-exact across ALL dense B layouts (row/col,
* negative strides). Verified empirically; asserted with Object.is bit-equality.
*
* EXCEPTION — the REAL Cholesky inverse dpftri delegates to dlauum/dsyrk, which
* take a unit-stride (incx==1) BLAS fast path that reorders accumulation on any
* stride change (the RFP analog of the dense dpotri/dlauum family; see
* schemes.pureAddrLayouts and test/harness/LEARNINGS.md, 2026-07-18). It is only
* bit-exact across PURE-ADDRESSING layouts (stride fixed at +1, base offset / pad
* varied). So the invariance drivers accept an optional RFP-layout list; pass
* `pureAddrRfpLayouts()` for such routines and lean on the numeric reconstruct
* property (swept over the full size set) for cross-stride correctness. The
* complex zpftri has no such fast path and stays fully bit-exact.
*/

import test from 'node:test';
import { RNG, logical, schemes, ref, norms, check, SIZES_SMALL } from './index.js';
import { checked } from './ledger.js';

var LogicalMatrix = logical.LogicalMatrix;
var UPLOS = [ 'upper', 'lower' ];

var DENSE_TIGHT = { 'order': 'col' };

// Curated 1-D layouts for the opaque RFP buffer (stride sign, base offset,
// leading/trailing poison pad). Index k ranges contiguously 0..npk-1.
function linearLayouts() {
	return [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 3, 'tail': 2 },
		{ 'stride': 2, 'lead': 0, 'tail': 1 },
		{ 'stride': 3, 'lead': 2, 'tail': 0 },
		{ 'stride': -1, 'lead': 4, 'tail': 1 },
		{ 'stride': -2, 'lead': 1, 'tail': 2 }
	];
}

// Pure-addressing RFP layouts: stride fixed at +1, only base offset / leading /
// trailing poison pad varied. Changing these cannot reorder any arithmetic, so a
// routine with a unit-stride BLAS fast path that legitimately reorders on stride
// changes (dpftri -> dlauum/dsyrk; the RFP analog of schemes.dense.pureAddrLayouts)
// is still bit-exact across them. Cross-stride correctness for such routines is
// certified by the numeric reconstruct/residual property swept over the sizes.
function pureAddrRfpLayouts() {
	return [
		{ 'stride': 1, 'lead': 0, 'tail': 0 },
		{ 'stride': 1, 'lead': 3, 'tail': 2 },
		{ 'stride': 1, 'lead': 1, 'tail': 4 },
		{ 'stride': 1, 'lead': 5, 'tail': 1 }
	];
}

// A poisoned, opaque 1-D RFP buffer of `npk` slots with a fuzzable stride/offset.
function rfpAlloc( sc, npk, layout ) {
	var L = layout || {};
	var stride = ( L.stride === void 0 ) ? 1 : L.stride;
	var lead = ( L.lead === void 0 ) ? 0 : L.lead;
	var tail = ( L.tail === void 0 ) ? 0 : L.tail;
	var span = ( npk > 0 ) ? ( npk - 1 ) * Math.abs( stride ) : 0;
	var offset = ( stride < 0 ) ? ( lead + span ) : lead;
	var data = sc.alloc( lead + span + tail + 1 );
	return {
		'data': data,
		'stride': stride,
		'offset': offset
	};
}


// FAMILY //

/**
* Build the check-runner bundle for one scalar type.
*
* @param {Object} sc - scalar trait (S.real | S.complex)
* @param {Object} conv - { trttf, tfttr } RFP<->TR ndarray converters
* @param {Object} ops - { pftrf, pftri, pftrs } ndarray routines
* @param {Array<string>} transrs - RFP variants ('no-transpose' + 'transpose'|'conjugate-transpose')
* @returns {Object} per-routine test drivers
*/
function family( sc, conv, ops, transrs ) {
	var npkOf = function npkOf( n ) {
		return ( n * ( n + 1 ) ) / 2;
	};

	// TR (dense) -> RFP buffer, then Cholesky-factor it in place. Returns the RFP
	// buffer handle.
	function factorInto( A0, transr, uplo, n, dL, rL ) {
		var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, dL );
		var arf = rfpAlloc( sc, npkOf( n ), rL );
		conv.trttf( transr, uplo, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], arf.data, arf.stride, arf.offset );
		arf.info = ops.pftrf( transr, uplo, n, arf.data, arf.stride, arf.offset );
		return arf;
	}

	// RFP buffer -> dense TR buffer (poisoned; only uplo triangle written).
	function rfpToDense( arf, transr, uplo, n, tfL ) {
		var out = schemes.denseAlloc( sc, n, n, tfL || DENSE_TIGHT );
		conv.tfttr( transr, uplo, n, arf.data, arf.stride, arf.offset, out.data, out.s1, out.s2, out.offset );
		return out;
	}

	// Read the referenced (uplo) triangle of a dense buffer into a LogicalMatrix;
	// opposite triangle -> exact zero.
	function readTri( out, n, uplo ) {
		var F = new LogicalMatrix( sc, n, n );
		var i;
		var j;
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i < n; i++ ) {
				if ( uplo === 'upper' ? i <= j : i >= j ) {
					F.set( i, j, sc.read( out.data, out.addr( i, j ) ) );
				} else {
					F.set( i, j, sc.zero );
				}
			}
		}
		return F;
	}

	// Read the computed inverse (symmetric/Hermitian, stored in the uplo triangle)
	// into a FULL LogicalMatrix by conjugate-mirroring across the diagonal.
	function readSymFull( out, n, uplo ) {
		var F = new LogicalMatrix( sc, n, n );
		var v;
		var i;
		var j;
		for ( j = 0; j < n; j++ ) {
			for ( i = j; i < n; i++ ) {
				if ( i === j ) {
					F.set( i, i, sc.read( out.data, out.addr( i, i ) ) );
				} else if ( uplo === 'upper' ) {
					v = sc.read( out.data, out.addr( j, i ) ); // referenced upper element
					F.set( j, i, v );
					F.set( i, j, sc.conj( v ) );
				} else {
					v = sc.read( out.data, out.addr( i, j ) ); // referenced lower element
					F.set( i, j, v );
					F.set( j, i, sc.conj( v ) );
				}
			}
		}
		return F;
	}

	// Backward-error residual for the inverse: ‖A0*inv - I‖ / (‖A0‖·‖inv‖ + ‖I‖).
	function assertInvResidual( A0, invA, P, n, label, factor ) {
		var R = new LogicalMatrix( sc, n, n );
		var i;
		var j;
		for ( j = 0; j < n; j++ ) {
			for ( i = 0; i < n; i++ ) {
				R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
			}
		}
		check.assertFinite( sc, R, label+' (residual)' );
		var scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
		check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
	}

	function readCol( out, n, j ) {
		var col = [];
		var i;
		for ( i = 0; i < n; i++ ) {
			col.push( sc.read( out.data, out.addr( i, j ) ) );
		}
		return col;
	}
	function logicalCol( M, n, j ) {
		var col = [];
		var i;
		for ( i = 0; i < n; i++ ) {
			col.push( M.get( i, j ) );
		}
		return col;
	}
	function readFull( out, rows, cols ) {
		var M = new LogicalMatrix( sc, rows, cols );
		var i;
		var j;
		for ( j = 0; j < cols; j++ ) {
			for ( i = 0; i < rows; i++ ) {
				M.set( i, j, sc.read( out.data, out.addr( i, j ) ) );
			}
		}
		return M;
	}

	// Cross product of RFP linear layouts with a set of dense layouts (for pftrs).
	function crossLayouts( rfpLs, denseLs ) {
		var out = [];
		var i;
		var j;
		for ( i = 0; i < rfpLs.length; i++ ) {
			for ( j = 0; j < denseLs.length; j++ ) {
				out.push( { 'r': rfpLs[ i ], 'd': denseLs[ j ] } );
			}
		}
		return out;
	}


	// --- pftrf: Cholesky reconstruction --- //

	function pftrfSweep( subject ) {
		test( subject+': Cholesky reconstruction A=FᴴF/FFᴴ (transr x uplo x size sweep)', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					SIZES_SMALL.forEach( function eachN( n ) {
						var rng = new RNG( 0x100 + n );
						var A0 = logical.positiveDefinite( sc, rng, n );
						var arf = factorInto( A0, transr, uplo, n, DENSE_TIGHT, linearLayouts()[ 0 ] );
						var out = rfpToDense( arf, transr, uplo, n, DENSE_TIGHT );
						var F = readTri( out, n, uplo );
						check.assertFinite( sc, F, subject+' factor triangle' );
						var recon = ( uplo === 'upper' )
							? ref.matmul( sc, F, F, { 'transa': 'c' } )
							: ref.matmul( sc, F, F, { 'transb': 'c' } );
						checked( subject, 'reconstruct', function run() {
							check.assertReconstruct( sc, recon, A0, { 'label': subject+' '+transr+' '+uplo+' n='+n, 'factor': 100 } );
						});
					});
				});
			});
		});
	}

	function pftrfInvariance( subject, rfpLs ) {
		var LS = rfpLs || linearLayouts();
		test( subject+': bit-exact factor across all RFP layouts', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					[ 9, 12 ].forEach( function eachN( n ) {
						checked( subject, 'layout-invariance', function run() {
							var outs = [];
							LS.forEach( function eachL( rL ) {
								var rng = new RNG( 0xF00D );
								var A0 = logical.positiveDefinite( sc, rng, n );
								var arf = factorInto( A0, transr, uplo, n, DENSE_TIGHT, rL );
								var out = rfpToDense( arf, transr, uplo, n, DENSE_TIGHT );
								var F = readTri( out, n, uplo );
								check.assertFinite( sc, F, subject+' factor triangle' );
								outs.push( check.flattenLogical( sc, F ) );
							});
							check.assertAllExactEqual( outs, subject+' '+transr+' '+uplo+' n='+n+' RFP layout invariance' );
						});
					});
				});
			});
		});
	}


	// --- pftri: inverse reconstruction A0*inv=I --- //

	function pftriSweep( subject ) {
		test( subject+': inverse reconstruction A*inv(A)=I (transr x uplo x size sweep)', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					SIZES_SMALL.forEach( function eachN( n ) {
						var rng = new RNG( 0x100 + n );
						var A0 = logical.positiveDefinite( sc, rng, n );
						var arf = factorInto( A0, transr, uplo, n, DENSE_TIGHT, linearLayouts()[ 0 ] );
						ops.pftri( transr, uplo, n, arf.data, arf.stride, arf.offset );
						var out = rfpToDense( arf, transr, uplo, n, DENSE_TIGHT );
						var invA = readSymFull( out, n, uplo );
						check.assertFinite( sc, invA, subject+' inverse' );
						var P = ref.matmul( sc, A0, invA );
						checked( subject, 'reconstruct', function run() {
							assertInvResidual( A0, invA, P, n, subject+' '+transr+' '+uplo+' n='+n, 100 );
						});
					});
				});
			});
		});
	}

	function pftriInvariance( subject, rfpLs ) {
		var LS = rfpLs || linearLayouts();
		test( subject+': bit-exact inverse across all RFP layouts', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					[ 9, 12 ].forEach( function eachN( n ) {
						checked( subject, 'layout-invariance', function run() {
							var outs = [];
							LS.forEach( function eachL( rL ) {
								var rng = new RNG( 0xF00D );
								var A0 = logical.positiveDefinite( sc, rng, n );
								var arf = factorInto( A0, transr, uplo, n, DENSE_TIGHT, rL );
								ops.pftri( transr, uplo, n, arf.data, arf.stride, arf.offset );
								var out = rfpToDense( arf, transr, uplo, n, DENSE_TIGHT );
								var F = readTri( out, n, uplo ); // referenced triangle only
								check.assertFinite( sc, F, subject+' inverse triangle' );
								outs.push( check.flattenLogical( sc, F ) );
							});
							check.assertAllExactEqual( outs, subject+' '+transr+' '+uplo+' n='+n+' RFP layout invariance' );
						});
					});
				});
			});
		});
	}


	// --- pftrs: solve residual --- //

	var NRHS = [ 1, 2 ];

	function pftrsSweep( subject ) {
		test( subject+': solve residual ‖A0*X-B0‖ (transr x uplo x size x nrhs)', function t() {
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					SIZES_SMALL.forEach( function eachN( n ) {
						NRHS.forEach( function eachNrhs( nrhs ) {
							var rng = new RNG( 0x100 + ( n * 10 ) + nrhs );
							var A0 = logical.positiveDefinite( sc, rng, n );
							var B0 = logical.general( sc, rng, n, nrhs );
							var arf = factorInto( A0, transr, uplo, n, DENSE_TIGHT, linearLayouts()[ 0 ] );
							var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, DENSE_TIGHT );
							ops.pftrs( transr, uplo, n, nrhs, arf.data, arf.stride, arf.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
							checked( subject, 'residual', function run() {
								var j;
								for ( j = 0; j < nrhs; j++ ) {
									check.assertResidual( sc, A0, readColB( Br, n, j ), logicalCol( B0, n, j ), {
										'trans': 'n',
										'factor': 100,
										'label': subject+' '+transr+' '+uplo+' n='+n+' nrhs='+nrhs+' col='+j
									});
								}
							});
						});
					});
				});
			});
		});
	}

	function readColB( Br, n, j ) {
		var col = [];
		var i;
		for ( i = 0; i < n; i++ ) {
			col.push( Br.read( i, j ) );
		}
		return col;
	}
	function readBFull( Br, n, nrhs ) {
		var X = new LogicalMatrix( sc, n, nrhs );
		var i;
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < n; i++ ) {
				X.set( i, j, Br.read( i, j ) );
			}
		}
		return X;
	}

	function pftrsInvariance( subject, rfpLs ) {
		test( subject+': bit-exact solution across all RFP x B layouts', function t() {
			var variants = crossLayouts( rfpLs || linearLayouts(), schemes.dense.layouts() );
			var n = 9;
			var nrhs = 3;
			transrs.forEach( function eachT( transr ) {
				UPLOS.forEach( function eachU( uplo ) {
					checked( subject, 'layout-invariance', function run() {
						var outs = [];
						variants.forEach( function eachV( v ) {
							var rng = new RNG( 0xBEEF );
							var A0 = logical.positiveDefinite( sc, rng, n );
							var B0 = logical.general( sc, rng, n, nrhs );
							var arf = factorInto( A0, transr, uplo, n, DENSE_TIGHT, v.r );
							var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, v.d );
							ops.pftrs( transr, uplo, n, nrhs, arf.data, arf.stride, arf.offset, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
							var X = readBFull( Br, n, nrhs );
							check.assertFinite( sc, X, subject+' solution' );
							outs.push( check.flattenLogical( sc, X ) );
						});
						check.assertAllExactEqual( outs, subject+' '+transr+' '+uplo+' RFP x B layout invariance' );
					});
				});
			});
		});
	}

	// silence unused-helper lint in variants that don't use them:
	void readCol;
	void readFull;

	return {
		'pftrf': { 'sweep': pftrfSweep, 'invariance': pftrfInvariance },
		'pftri': { 'sweep': pftriSweep, 'invariance': pftriInvariance },
		'pftrs': { 'sweep': pftrsSweep, 'invariance': pftrsInvariance }
	};
}

export { family, pureAddrRfpLayouts };
