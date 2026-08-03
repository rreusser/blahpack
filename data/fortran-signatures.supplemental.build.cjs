'use strict';

// Authoring script for supplemental.json.
//
// A handful of translated routines have no entry in data/routines.json because
// their reference Fortran source is not vendored in this repository: the ARPACK
// symmetric family, plus a few LAPACK/BLAS routines whose automated extraction
// produced no argument list. Their signatures are transcribed HERE, verbatim
// from the reference Fortran, in the SAME shape routines.json uses
// ({ name, direction, type }). This extends the coverage of the signature
// derivation; it is not a validation waiver. The corpus gate
// (`node lint/verify-corpus.cjs`) checks each transcription against the actual
// `base.js`, so a wrong transcription surfaces as a mismatch rather than
// silently passing.
//
// Run:  node data/fortran-signatures.supplemental.build.cjs
//   then: node bin/gen_fortran_signatures.js   (folds this into the cache)
// Emits: supplemental.json (next to this file).

var fs = require( 'fs' );
var path = require( 'path' );

// Type-string builders (mirroring how routines.json spells Fortran types).
var T = {
	'char': 'CHARACTER',
	'int': 'INTEGER',
	'logical': 'LOGICAL',
	'dbl': 'DOUBLE PRECISION',
	'darr': 'DOUBLE PRECISION array, dimension (*)',
	'darr2': 'DOUBLE PRECISION array, dimension (LD,*)', // 2D: top-level comma
	'iarr': 'INTEGER array, dimension (*)',
	'larr': 'LOGICAL array, dimension (*)',
	'carr': 'COMPLEX*16 array, dimension (0:*)',
	'work': 'DOUBLE PRECISION array, dimension (*)'
};

// arg( name, direction, tag )
function a( name, direction, tag ) {
	return { 'name': name, 'direction': direction, 'type': T[ tag ] };
}

function routine( name, kind, signature, args ) {
	return { 'name': name, 'kind': kind, 'signature': signature, 'arguments': args };
}

var routines = {};
function add( r ) {
	routines[ r.name.toLowerCase() ] = r;
}

// --- BLAS ------------------------------------------------------------------

// DOUBLE PRECISION FUNCTION DSDOT(N,SX,INCX,SY,INCY)
add( routine( 'DSDOT', 'function',
	'DOUBLE PRECISION FUNCTION DSDOT(N,SX,INCX,SY,INCY)', [
		a( 'N', 'in', 'int' ),
		a( 'SX', 'in', 'darr' ),
		a( 'INCX', 'in', 'int' ),
		a( 'SY', 'in', 'darr' ),
		a( 'INCY', 'in', 'int' )
	] ) );

// --- LAPACK ----------------------------------------------------------------

// DOUBLE PRECISION FUNCTION DLAMCH( CMACH )
add( routine( 'DLAMCH', 'function',
	'DOUBLE PRECISION FUNCTION DLAMCH( CMACH )', [
		a( 'CMACH', 'in', 'char' )
	] ) );

// DOUBLE PRECISION FUNCTION ZLANSF( NORM, TRANSR, UPLO, N, A, WORK )
add( routine( 'ZLANSF', 'function',
	'DOUBLE PRECISION FUNCTION ZLANSF( NORM, TRANSR, UPLO, N, A, WORK )', [
		a( 'NORM', 'in', 'char' ),
		a( 'TRANSR', 'in', 'char' ),
		a( 'UPLO', 'in', 'char' ),
		a( 'N', 'in', 'int' ),
		a( 'A', 'in', 'carr' ),
		a( 'WORK', 'out', 'work' )
	] ) );

// --- ARPACK (symmetric) ----------------------------------------------------
// Reference signatures from the ARPACK SRC (…/dsaupd.f, dseupd.f, etc.).

// SUBROUTINE DGETV0( IDO, BMAT, ITRY, INITV, N, J, V, LDV, RESID, RNORM, IPNTR, WORKD, IERR )
add( routine( 'DGETV0', 'subroutine',
	'SUBROUTINE DGETV0( IDO, BMAT, ITRY, INITV, N, J, V, LDV, RESID, RNORM, IPNTR, WORKD, IERR )', [
		a( 'IDO', 'inout', 'int' ),
		a( 'BMAT', 'in', 'char' ),
		a( 'ITRY', 'in', 'int' ),
		a( 'INITV', 'in', 'logical' ),
		a( 'N', 'in', 'int' ),
		a( 'J', 'in', 'int' ),
		a( 'V', 'inout', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'RNORM', 'inout', 'dbl' ),
		a( 'IPNTR', 'out', 'iarr' ),
		a( 'WORKD', 'inout', 'darr' ),
		a( 'IERR', 'out', 'int' )
	] ) );

// SUBROUTINE DSAITR( IDO, BMAT, N, K, NP, MODE, RESID, RNORM, V, LDV, H, LDH, IPNTR, WORKD, INFO )
add( routine( 'DSAITR', 'subroutine',
	'SUBROUTINE DSAITR( IDO, BMAT, N, K, NP, MODE, RESID, RNORM, V, LDV, H, LDH, IPNTR, WORKD, INFO )', [
		a( 'IDO', 'inout', 'int' ),
		a( 'BMAT', 'in', 'char' ),
		a( 'N', 'in', 'int' ),
		a( 'K', 'in', 'int' ),
		a( 'NP', 'in', 'int' ),
		a( 'MODE', 'in', 'int' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'RNORM', 'inout', 'dbl' ),
		a( 'V', 'inout', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'H', 'inout', 'darr2' ),
		a( 'LDH', 'in', 'int' ),
		a( 'IPNTR', 'out', 'iarr' ),
		a( 'WORKD', 'inout', 'darr' ),
		a( 'INFO', 'out', 'int' )
	] ) );

// SUBROUTINE DSAPPS( N, KEV, NP, SHIFT, V, LDV, H, LDH, RESID, Q, LDQ, WORKD )
add( routine( 'DSAPPS', 'subroutine',
	'SUBROUTINE DSAPPS( N, KEV, NP, SHIFT, V, LDV, H, LDH, RESID, Q, LDQ, WORKD )', [
		a( 'N', 'in', 'int' ),
		a( 'KEV', 'in', 'int' ),
		a( 'NP', 'in', 'int' ),
		a( 'SHIFT', 'in', 'darr' ),
		a( 'V', 'inout', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'H', 'inout', 'darr2' ),
		a( 'LDH', 'in', 'int' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'Q', 'inout', 'darr2' ),
		a( 'LDQ', 'in', 'int' ),
		a( 'WORKD', 'out', 'darr' )
	] ) );

// SUBROUTINE DSAUP2( IDO, BMAT, N, WHICH, NEV, NP, TOL, RESID, MODE, IUPD,
//                    ISHIFT, MXITER, V, LDV, H, LDH, RITZ, BOUNDS, Q, LDQ,
//                    WORKL, IPNTR, WORKD, INFO )
add( routine( 'DSAUP2', 'subroutine',
	'SUBROUTINE DSAUP2( IDO, BMAT, N, WHICH, NEV, NP, TOL, RESID, MODE, IUPD, ISHIFT, MXITER, V, LDV, H, LDH, RITZ, BOUNDS, Q, LDQ, WORKL, IPNTR, WORKD, INFO )', [
		a( 'IDO', 'inout', 'int' ),
		a( 'BMAT', 'in', 'char' ),
		a( 'N', 'in', 'int' ),
		a( 'WHICH', 'in', 'char' ),
		a( 'NEV', 'inout', 'int' ),
		a( 'NP', 'inout', 'int' ),
		a( 'TOL', 'in', 'dbl' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'MODE', 'in', 'int' ),
		a( 'IUPD', 'in', 'int' ),
		a( 'ISHIFT', 'in', 'int' ),
		a( 'MXITER', 'inout', 'int' ),
		a( 'V', 'inout', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'H', 'inout', 'darr2' ),
		a( 'LDH', 'in', 'int' ),
		a( 'RITZ', 'out', 'darr' ),
		a( 'BOUNDS', 'out', 'darr' ),
		a( 'Q', 'inout', 'darr2' ),
		a( 'LDQ', 'in', 'int' ),
		a( 'WORKL', 'out', 'darr' ),
		a( 'IPNTR', 'out', 'iarr' ),
		a( 'WORKD', 'inout', 'darr' ),
		a( 'INFO', 'inout', 'int' )
	] ) );

// SUBROUTINE DSAUPD( IDO, BMAT, N, WHICH, NEV, TOL, RESID, NCV, V, LDV,
//                    IPARAM, IPNTR, WORKD, WORKL, LWORKL, INFO )
add( routine( 'DSAUPD', 'subroutine',
	'SUBROUTINE DSAUPD( IDO, BMAT, N, WHICH, NEV, TOL, RESID, NCV, V, LDV, IPARAM, IPNTR, WORKD, WORKL, LWORKL, INFO )', [
		a( 'IDO', 'inout', 'int' ),
		a( 'BMAT', 'in', 'char' ),
		a( 'N', 'in', 'int' ),
		a( 'WHICH', 'in', 'char' ),
		a( 'NEV', 'in', 'int' ),
		a( 'TOL', 'in', 'dbl' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'NCV', 'in', 'int' ),
		a( 'V', 'out', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'IPARAM', 'inout', 'iarr' ),
		a( 'IPNTR', 'out', 'iarr' ),
		a( 'WORKD', 'inout', 'darr' ),
		a( 'WORKL', 'inout', 'darr' ),
		a( 'LWORKL', 'in', 'int' ),
		a( 'INFO', 'inout', 'int' )
	] ) );

// SUBROUTINE DSBAND( RVEC, HOWMNY, SELECT, D, Z, LDZ, SIGMA, N, AB, MB, LDA,
//                    RFAC, KL, KU, WHICH, BMAT, NEV, TOL, RESID, NCV, V, LDV,
//                    IPARAM, WORKD, WORKL, LWORKL, IWORK, INFO )
add( routine( 'DSBAND', 'subroutine',
	'SUBROUTINE DSBAND( RVEC, HOWMNY, SELECT, D, Z, LDZ, SIGMA, N, AB, MB, LDA, RFAC, KL, KU, WHICH, BMAT, NEV, TOL, RESID, NCV, V, LDV, IPARAM, WORKD, WORKL, LWORKL, IWORK, INFO )', [
		a( 'RVEC', 'in', 'logical' ),
		a( 'HOWMNY', 'in', 'char' ),
		a( 'SELECT', 'inout', 'larr' ),
		a( 'D', 'out', 'darr' ),
		a( 'Z', 'out', 'darr2' ),
		a( 'LDZ', 'in', 'int' ),
		a( 'SIGMA', 'in', 'dbl' ),
		a( 'N', 'in', 'int' ),
		a( 'AB', 'in', 'darr2' ),
		a( 'MB', 'in', 'darr2' ),
		a( 'LDA', 'in', 'int' ),
		a( 'RFAC', 'inout', 'darr2' ),
		a( 'KL', 'in', 'int' ),
		a( 'KU', 'in', 'int' ),
		a( 'WHICH', 'in', 'char' ),
		a( 'BMAT', 'in', 'char' ),
		a( 'NEV', 'in', 'int' ),
		a( 'TOL', 'in', 'dbl' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'NCV', 'in', 'int' ),
		a( 'V', 'out', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'IPARAM', 'inout', 'iarr' ),
		a( 'WORKD', 'inout', 'darr' ),
		a( 'WORKL', 'inout', 'darr' ),
		a( 'LWORKL', 'in', 'int' ),
		a( 'IWORK', 'inout', 'iarr' ),
		a( 'INFO', 'inout', 'int' )
	] ) );

// SUBROUTINE DSCONV( N, RITZ, BOUNDS, TOL, NCONV )
add( routine( 'DSCONV', 'subroutine',
	'SUBROUTINE DSCONV( N, RITZ, BOUNDS, TOL, NCONV )', [
		a( 'N', 'in', 'int' ),
		a( 'RITZ', 'in', 'darr' ),
		a( 'BOUNDS', 'in', 'darr' ),
		a( 'TOL', 'in', 'dbl' ),
		a( 'NCONV', 'out', 'int' )
	] ) );

// SUBROUTINE DSEIGT( RNORM, N, H, LDH, EIG, BOUNDS, WORKL, IERR )
add( routine( 'DSEIGT', 'subroutine',
	'SUBROUTINE DSEIGT( RNORM, N, H, LDH, EIG, BOUNDS, WORKL, IERR )', [
		a( 'RNORM', 'in', 'dbl' ),
		a( 'N', 'in', 'int' ),
		a( 'H', 'in', 'darr2' ),
		a( 'LDH', 'in', 'int' ),
		a( 'EIG', 'out', 'darr' ),
		a( 'BOUNDS', 'out', 'darr' ),
		a( 'WORKL', 'out', 'darr' ),
		a( 'IERR', 'out', 'int' )
	] ) );

// SUBROUTINE DSESRT( WHICH, APPLY, N, X, NA, A, LDA )
add( routine( 'DSESRT', 'subroutine',
	'SUBROUTINE DSESRT( WHICH, APPLY, N, X, NA, A, LDA )', [
		a( 'WHICH', 'in', 'char' ),
		a( 'APPLY', 'in', 'logical' ),
		a( 'N', 'in', 'int' ),
		a( 'X', 'inout', 'darr' ),
		a( 'NA', 'in', 'int' ),
		a( 'A', 'inout', 'darr2' ),
		a( 'LDA', 'in', 'int' )
	] ) );

// SUBROUTINE DSEUPD( RVEC, HOWMNY, SELECT, D, Z, LDZ, SIGMA, BMAT, N, WHICH,
//                    NEV, TOL, RESID, NCV, V, LDV, IPARAM, IPNTR, WORKD, WORKL,
//                    LWORKL, INFO )
add( routine( 'DSEUPD', 'subroutine',
	'SUBROUTINE DSEUPD( RVEC, HOWMNY, SELECT, D, Z, LDZ, SIGMA, BMAT, N, WHICH, NEV, TOL, RESID, NCV, V, LDV, IPARAM, IPNTR, WORKD, WORKL, LWORKL, INFO )', [
		a( 'RVEC', 'in', 'logical' ),
		a( 'HOWMNY', 'in', 'char' ),
		a( 'SELECT', 'inout', 'larr' ),
		a( 'D', 'out', 'darr' ),
		a( 'Z', 'out', 'darr2' ),
		a( 'LDZ', 'in', 'int' ),
		a( 'SIGMA', 'in', 'dbl' ),
		a( 'BMAT', 'in', 'char' ),
		a( 'N', 'in', 'int' ),
		a( 'WHICH', 'in', 'char' ),
		a( 'NEV', 'in', 'int' ),
		a( 'TOL', 'in', 'dbl' ),
		a( 'RESID', 'inout', 'darr' ),
		a( 'NCV', 'in', 'int' ),
		a( 'V', 'inout', 'darr2' ),
		a( 'LDV', 'in', 'int' ),
		a( 'IPARAM', 'in', 'iarr' ),
		a( 'IPNTR', 'inout', 'iarr' ),
		a( 'WORKD', 'in', 'darr' ),
		a( 'WORKL', 'inout', 'darr' ),
		a( 'LWORKL', 'in', 'int' ),
		a( 'INFO', 'out', 'int' )
	] ) );

// SUBROUTINE DSGETS( ISHIFT, WHICH, KEV, NP, RITZ, BOUNDS, SHIFTS )
add( routine( 'DSGETS', 'subroutine',
	'SUBROUTINE DSGETS( ISHIFT, WHICH, KEV, NP, RITZ, BOUNDS, SHIFTS )', [
		a( 'ISHIFT', 'in', 'int' ),
		a( 'WHICH', 'in', 'char' ),
		a( 'KEV', 'in', 'int' ),
		a( 'NP', 'in', 'int' ),
		a( 'RITZ', 'inout', 'darr' ),
		a( 'BOUNDS', 'inout', 'darr' ),
		a( 'SHIFTS', 'out', 'darr' )
	] ) );

// SUBROUTINE DSORTR( WHICH, APPLY, N, X1, X2 )
add( routine( 'DSORTR', 'subroutine',
	'SUBROUTINE DSORTR( WHICH, APPLY, N, X1, X2 )', [
		a( 'WHICH', 'in', 'char' ),
		a( 'APPLY', 'in', 'logical' ),
		a( 'N', 'in', 'int' ),
		a( 'X1', 'inout', 'darr' ),
		a( 'X2', 'inout', 'darr' )
	] ) );

// SUBROUTINE DSTQRB( N, D, E, Z, WORK, INFO )
add( routine( 'DSTQRB', 'subroutine',
	'SUBROUTINE DSTQRB( N, D, E, Z, WORK, INFO )', [
		a( 'N', 'in', 'int' ),
		a( 'D', 'inout', 'darr' ),
		a( 'E', 'inout', 'darr' ),
		a( 'Z', 'out', 'darr' ),
		a( 'WORK', 'out', 'work' ),
		a( 'INFO', 'out', 'int' )
	] ) );

var out = path.join( __dirname, 'fortran-signatures.supplemental.json' );
fs.writeFileSync( out, JSON.stringify( routines, null, '\t' ) + '\n' );
console.log( 'Wrote ' + Object.keys( routines ).length + ' routines to ' + out );
