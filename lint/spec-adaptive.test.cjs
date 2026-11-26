'use strict';

// The spec's workspace `adaptive` fact (CONVENTIONS W6; lint rule
// workspace-adaptive) comes from bin/spec-gen/extract.cjs: an IF after the
// argument checks that compares a workspace length, other than to reject it or
// to answer a workspace query. These cases pin what counts.
//
// Run:  node --test lint/spec-adaptive.test.cjs

var test = require( 'node:test' );
var assert = require( 'node:assert' );
var extractOne = require( '../bin/spec-gen/extract.cjs' ).extractOne;

function fortran( body ) {
	return [
		'      SUBROUTINE DTEST( N, A, WORK, LWORK, INFO )',
		'      INTEGER N, LWORK, INFO',
		'      DOUBLE PRECISION A( * ), WORK( * )',
		'      LOGICAL LQUERY',
		'      INFO = 0',
		'      LQUERY = ( LWORK.EQ.-1 )',
		'      IF( N.LT.0 ) THEN',
		'         INFO = -1',
		'      ELSE IF( LWORK.LT.MAX( 1, N ) .AND. .NOT.LQUERY ) THEN',
		'         INFO = -4',
		'      END IF',
		'      IF( INFO.NE.0 ) THEN',
		'         CALL XERBLA( \'DTEST\', -INFO )',
		'         RETURN',
		'      END IF'
	].concat( body, [ '      RETURN', '      END' ] ).join( '\n' );
}

function adaptive( body ) {
	return extractOne( fortran( body ), false, null ).adaptive || [];
}

test( 'a block size shrunk to fit LWORK is adaptive (DGEQRF)', function t() {
	assert.deepStrictEqual( adaptive( [
		'      NB = 32',
		'      IF( LWORK.LT.N*NB ) THEN',
		'         NB = LWORK / N',
		'      END IF'
	] ), [ 'LWORK' ] );
});

test( 'a path chosen by LWORK is adaptive (DSYSV)', function t() {
	assert.deepStrictEqual( adaptive( [
		'      IF( LWORK.GE.N*N ) A( 1 ) = 0.0D0'
	] ), [ 'LWORK' ] );
});

test( 'the argument check itself is not', function t() {
	assert.deepStrictEqual( adaptive( [] ), [] );
});

test( 'a later rejection (INFO = -k) is not (DTGEX2)', function t() {
	assert.deepStrictEqual( adaptive( [
		'      IF( LWORK.LT.2*N ) THEN',
		'         INFO = -4',
		'         RETURN',
		'      END IF'
	] ), [] );
});

test( 'a workspace query is not', function t() {
	assert.deepStrictEqual( adaptive( [
		'      IF( LQUERY .AND. LWORK.LT.N ) RETURN'
	] ), [] );
});

test( 'a leading dimension (LDWORK) is not a length', function t() {
	assert.deepStrictEqual( adaptive( [
		'      LDWORK = N',
		'      IF( LDWORK.LT.N ) A( 1 ) = 0.0D0'
	] ), [] );
});
