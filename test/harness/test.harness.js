/**
* Self-tests for the validation harness AND live property validation of a
* representative routine from each storage scheme, across real and complex.
*
* Running this file both (a) guards the harness against regressions and (b)
* records validation levels into the ledger, so `bin/validation-level.js` can
* report which routines have received property / layout-fuzzing scrutiny.
*/

import test from 'node:test';
import assert from 'node:assert/strict';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from './index.js';
import { checked } from './ledger.js';

import dpotrf from '../../lib/lapack/base/dpotrf/lib/ndarray.js';
import zpotrf from '../../lib/lapack/base/zpotrf/lib/ndarray.js';
import dpbtrf from '../../lib/lapack/base/dpbtrf/lib/ndarray.js';
import zpbtrf from '../../lib/lapack/base/zpbtrf/lib/ndarray.js';
import dspmv from '../../lib/blas/base/dspmv/lib/ndarray.js';
import zhpmv from '../../lib/blas/base/zhpmv/lib/ndarray.js';

var LogicalMatrix = logical.LogicalMatrix;

// HELPERS //

function readTri( sc, R, n, which, unit ) {
	var U = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( i === j && unit ) {
				U.set( i, j, sc.one );
			} else if ( which === 'upper' ? i <= j : i >= j ) {
				U.set( i, j, R.read( i, j ) );
			} else {
				U.set( i, j, sc.zero );
			}
		}
	}
	return U;
}

function readBandTri( sc, R, n, k, which ) {
	var U = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			U.set( i, j, sc.zero );
		}
	}
	for ( j = 0; j < n; j++ ) {
		if ( which === 'upper' ) {
			for ( i = Math.max( 0, j - k ); i <= j; i++ ) {
				U.set( i, j, R.read( i, j ) );
			}
		} else {
			for ( i = j; i <= Math.min( n - 1, j + k ); i++ ) {
				U.set( i, j, R.read( i, j ) );
			}
		}
	}
	return U;
}


// HARNESS SELF-TESTS //

test( 'schemes round-trip: realize then read-back reproduces the logical matrix', function t() {
	[ S.real, S.complex ].forEach( function each( sc ) {
		var rng = new RNG( 11 );
		var A = logical.general( sc, rng, 5, 4 );
		schemes.dense.layouts().forEach( function eachLayout( L ) {
			var R = schemes.dense.realize( sc, A, { 'part': 'full' }, L );
			var i;
			var j;
			for ( j = 0; j < 4; j++ ) {
				for ( i = 0; i < 5; i++ ) {
					assert.ok( sc.eq( R.read( i, j ), A.get( i, j ) ), 'round-trips at ('+i+','+j+') layout '+JSON.stringify( L ) );
				}
			}
		});
	});
});

test( 'unreferenced storage is poisoned (NaN)', function t() {
	var sc = S.real;
	var rng = new RNG( 12 );
	var A = logical.positiveDefinite( sc, rng, 6 );
	// upper triangle referenced; strict lower must remain NaN-poisoned:
	var R = schemes.dense.realize( sc, A, { 'part': 'upper' }, { 'ldaExtra': 2, 'lead': 3 } );
	assert.ok( Number.isNaN( R.read( 4, 1 ) ), 'strict-lower slot is poisoned' );
});


// PROPERTY VALIDATION (records to the ledger) //

test( 'dpotrf/zpotrf: dense Cholesky reconstruction', function t() {
	[ [ S.real, dpotrf, 'dpotrf' ], [ S.complex, zpotrf, 'zpotrf' ] ].forEach( function each( row ) {
		var sc = row[ 0 ];
		var fn = row[ 1 ];
		var name = row[ 2 ];
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			SIZES_SMALL.forEach( function eachN( n ) {
				var rng = new RNG( 0x100 + n );
				var A = logical.positiveDefinite( sc, rng, n );
				var R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
				fn( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
				var F = readTri( sc, R, n, uplo, false );
				var recon = ( uplo === 'upper' )
					? ref.matmul( sc, F, F, { 'transa': 'c' } )
					: ref.matmul( sc, F, F, { 'transb': 'c' } );
				checked( name, 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A, { 'label': name+' '+uplo+' n='+n } );
				});
			});
		});
	});
});

test( 'dpbtrf/zpbtrf: banded Cholesky reconstruction', function t() {
	[ [ S.real, dpbtrf, 'dpbtrf' ], [ S.complex, zpbtrf, 'zpbtrf' ] ].forEach( function each( row ) {
		var sc = row[ 0 ];
		var fn = row[ 1 ];
		var name = row[ 2 ];
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			[ 1, 2, 3, 5, 8, 16, 33 ].forEach( function eachN( n ) {
				[ 0, 1, 3 ].forEach( function eachK( kraw ) {
					var k = Math.min( kraw, Math.max( 0, n - 1 ) );
					var rng = new RNG( 0x200 + ( n * 31 ) + k );
					var A = logical.positiveDefiniteBanded( sc, rng, n, k );
					var R = schemes.banded.realize( sc, A, { 'part': uplo, 'k': k }, schemes.banded.layouts()[ 0 ] );
					fn( uplo, n, k, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ] );
					var F = readBandTri( sc, R, n, k, uplo );
					var recon = ( uplo === 'upper' )
						? ref.matmul( sc, F, F, { 'transa': 'c' } )
						: ref.matmul( sc, F, F, { 'transb': 'c' } );
					checked( name, 'reconstruct', function run() {
						check.assertReconstruct( sc, recon, A, { 'label': name+' '+uplo+' n='+n+' k='+k } );
					});
				});
			});
		});
	});
});

test( 'dspmv/zhpmv: packed matrix-vector residual', function t() {
	[ [ S.real, dspmv, 'dspmv', false ], [ S.complex, zhpmv, 'zhpmv', true ] ].forEach( function each( row ) {
		var sc = row[ 0 ];
		var fn = row[ 1 ];
		var name = row[ 2 ];
		var herm = row[ 3 ];
		[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
			[ 1, 2, 3, 5, 8, 17 ].forEach( function eachN( n ) {
				var rng = new RNG( 0x300 + n );
				var A = herm ? logical.hermitian( sc, rng, n ) : logical.symmetric( sc, rng, n );
				var x = [];
				var y = [];
				var i;
				for ( i = 0; i < n; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < n; i++ ) {
					y.push( sc.random( rng ) );
				}
				var alpha = sc.random( rng );
				var beta = sc.random( rng );
				var AP = schemes.packed.realize( sc, A, { 'part': uplo }, schemes.packed.layouts()[ 0 ] );
				var X = schemes.realizeVector( sc, x, { 'stride': 1 } );
				var Y = schemes.realizeVector( sc, y, { 'stride': 1 } );
				fn( uplo, n, sc.apiScalar( alpha ), AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], sc.apiScalar( beta ), Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				var ax = ref.matvec( sc, A, x );
				var expected = [];
				var got = [];
				var diff = [];
				for ( i = 0; i < n; i++ ) {
					expected.push( sc.add( sc.mul( alpha, ax[ i ] ), sc.mul( beta, y[ i ] ) ) );
					got.push( Y.read( i ) );
				}
				for ( i = 0; i < n; i++ ) {
					diff.push( sc.sub( got[ i ], expected[ i ] ) );
				}
				checked( name, 'residual', function run() {
					check.assertFinite( sc, got, name+' output' );
					var errC = [];
					var scC = [];
					diff.forEach( function push( d ) {
						sc.components( d ).forEach( function p( v ) { errC.push( v * v ); } );
					});
					expected.forEach( function push( e ) {
						sc.components( e ).forEach( function p( v ) { scC.push( v * v ); } );
					});
					var err = Math.sqrt( errC.reduce( function s( a, b ) { return a + b; }, 0 ) );
					var scl = Math.sqrt( scC.reduce( function s( a, b ) { return a + b; }, 0 ) );
					check.assertScaled( err, scl, check.tol( n, 20 ), name+' '+uplo+' n='+n );
				});
			});
		});
	});
});


// LAYOUT-INVARIANCE FUZZING (records L3) //

test( 'dspmv: output is bit-exact across storage layouts (packed AP + strided/negative vectors)', function t() {
	var sc = S.real;
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		var n = 9;
		var SEED = 0xABCD;
		var apLayouts = schemes.packed.layouts();
		var vLayouts = schemes.vectorLayouts();
		checked( 'dspmv', 'layout-invariance', function run() {
			layoutInvariant( apLayouts, function build( apL, idx ) {
				var rng = new RNG( SEED ); // fixed seed => identical values
				var A = logical.symmetric( sc, rng, n );
				var x = [];
				var y = [];
				var i;
				for ( i = 0; i < n; i++ ) {
					x.push( sc.random( rng ) );
				}
				for ( i = 0; i < n; i++ ) {
					y.push( sc.random( rng ) );
				}
				var alpha = sc.random( rng );
				var beta = sc.random( rng );
				var AP = schemes.packed.realize( sc, A, { 'part': uplo }, apL );
				var vL = vLayouts[ idx % vLayouts.length ];
				var X = schemes.realizeVector( sc, x, vL );
				var Y = schemes.realizeVector( sc, y, vL );
				dspmv( uplo, n, alpha, AP.data, AP.args[ 0 ], AP.args[ 1 ], X.data, X.args[ 0 ], X.args[ 1 ], beta, Y.data, Y.args[ 0 ], Y.args[ 1 ] );
				var out = new LogicalMatrix( sc, n, 1 );
				for ( i = 0; i < n; i++ ) {
					out.set( i, 0, Y.read( i ) );
				}
				return check.flattenLogical( sc, out );
			}, { 'label': 'dspmv '+uplo+' layout invariance' } );
		});
	});
});
