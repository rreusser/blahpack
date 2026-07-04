#!/usr/bin/env node
'use strict';

/**
 * Codemod: guard minWork formulas against zero-dimension early-return cases.
 *
 * Many ndarray.js files have `var minWork = Math.max(1, expr)`. Because
 * Math.max(1, ...) is always >= 1, the WORK length guard fires even when
 * N=0 (or M=0 or K=0), for which LAPACK routines return immediately without
 * using WORK at all. Tests that pass empty WORK for N=0 quick-returns then
 * get a spurious RangeError.
 *
 * This codemod applies targeted substitutions to the 15 ndarray.js files that
 * exhibit this bug, changing the minWork formula to return 0 when the
 * early-return dimension condition applies.
 *
 * Usage:
 *   node bin/codemod-minwork-zero.js [--dry-run]
 */

var fs = require( 'fs' );
var path = require( 'path' );

var dryRun = process.argv.includes( '--dry-run' );
var ROOT = path.resolve( __dirname, '..' );

function lib( routine ) {
	return path.join( ROOT, 'lib', 'lapack', 'base', routine, 'lib', 'ndarray.js' );
}

/**
 * Replace the first occurrence of `search` with `replacement` in `content`.
 * Returns the modified string, or null if `search` wasn't found.
 */
function replaceFirst( content, search, replacement ) {
	var idx = content.indexOf( search );
	if ( idx === -1 ) return null;
	return content.slice( 0, idx ) + replacement + content.slice( idx + search.length );
}

// Each entry: [ filepath, searchString, replacementString ]
var FIXES = [
	// N=0 early return — formula only uses N:
	[ lib( 'dgbcon' ),   'Math.max( 1, 3*N )',          'N === 0 ? 0 : Math.max( 1, 3*N )' ],
	[ lib( 'dgbrfs' ),   'Math.max( 1, 3*N )',          'N === 0 ? 0 : Math.max( 1, 3*N )' ],
	[ lib( 'dgtcon' ),   'Math.max( 1, 2*N )',          'N === 0 ? 0 : Math.max( 1, 2*N )' ],
	[ lib( 'dggsvd3' ),  'Math.max( 1, 2 * N )',        'N === 0 ? 0 : Math.max( 1, 2 * N )' ],
	[ lib( 'dlaqr4' ),   'Math.max( 1, N )',            'N === 0 ? 0 : Math.max( 1, N )' ],

	// dgees already has `(N === 0) ? 1 :` but should return 0, not 1:
	[ lib( 'dgees' ),    '( N === 0 ) ? 1 :', '( N === 0 ) ? 0 :' ],

	// M=0 or N=0 early return:
	[ lib( 'dgbbrd' ),   '2 * Math.max( M, N )',
	                     '(M === 0 || N === 0) ? 0 : 2 * Math.max( M, N )' ],
	[ lib( 'dggsvp3' ),  'Math.max( 1, M, N, p )',
	                     '(M === 0 || N === 0) ? 0 : Math.max( 1, M, N, p )' ],

	// K=min(M,N)=0 early return (formula uses M or N, not K directly):
	[ lib( 'dgerqf' ),   'Math.max( 1, M )',
	                     'Math.min( M, N ) === 0 ? 0 : Math.max( 1, M )' ],
	[ lib( 'dgeqrt' ),   'nb * N',
	                     'Math.min( M, N ) === 0 ? 0 : nb * N' ],

	// M=0 or N=0 or K=0 early return (K is a direct param):
	[ lib( 'dgemqrt' ),
	  '( side === \'left\' ) ? Math.max( 1, N ) * nb : Math.max( 1, M ) * nb',
	  '(M === 0 || N === 0 || K === 0) ? 0 : ( side === \'left\' ) ? Math.max( 1, N ) * nb : Math.max( 1, M ) * nb' ],
	[ lib( 'dgemlqt' ),
	  '( side === \'left\' ) ? Math.max( 1, N ) * mb : Math.max( 1, M ) * mb',
	  '(M === 0 || N === 0 || K === 0) ? 0 : ( side === \'left\' ) ? Math.max( 1, N ) * mb : Math.max( 1, M ) * mb' ],
	[ lib( 'dlamswlq' ),
	  '( side === \'left\' ) ? Math.max( 1, nb ) * mb : Math.max( 1, M ) * mb',
	  '(M === 0 || N === 0 || K === 0) ? 0 : ( side === \'left\' ) ? Math.max( 1, nb ) * mb : Math.max( 1, M ) * mb' ],

	// nw=0 early return (window size is the controlling dimension):
	[ lib( 'dlaqr2' ),   'Math.max( 1, nw )',           'nw === 0 ? 0 : Math.max( 1, nw )' ],
	[ lib( 'dlaqr3' ),   'Math.max( 1, nw )',           'nw === 0 ? 0 : Math.max( 1, nw )' ]
];

var fixed = 0;
var skipped = 0;

FIXES.forEach( function( fix ) {
	var filePath = fix[ 0 ];
	var search = fix[ 1 ];
	var replacement = fix[ 2 ];
	var routine = path.basename( path.dirname( path.dirname( filePath ) ) );

	var content;
	try {
		content = fs.readFileSync( filePath, 'utf8' );
	} catch ( e ) {
		console.log( 'SKIP (not found): ' + routine );
		skipped++;
		return;
	}

	var updated = replaceFirst( content, search, replacement );
	if ( updated === null ) {
		if ( content.includes( replacement ) ) {
			console.log( 'ALREADY-FIXED: ' + routine );
		} else {
			console.log( 'SKIP (pattern not found): ' + routine + ' — looking for: ' + search.slice( 0, 60 ) );
			skipped++;
		}
		return;
	}

	if ( dryRun ) {
		console.log( 'DRY-RUN: ' + routine );
		console.log( '  - ' + search );
		console.log( '  + ' + replacement );
	} else {
		fs.writeFileSync( filePath, updated, 'utf8' );
		console.log( 'FIXED: ' + routine );
		fixed++;
	}
} );

if ( !dryRun ) {
	console.log( '\nDone: fixed=' + fixed + ' skipped=' + skipped );
}
