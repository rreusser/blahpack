'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'jsdoc';

// Stale Fortran parameter names that should have been converted
var STALE_FORTRAN = /\bLDA\b|\bLDB\b|\bLDC\b|\bINCX\b|\bINCY\b|\bLDZ\b|\bLDQ\b|\bLDH\b|\bLDU\b|\bLDVT\b|\bLDVL\b|\bLDVR\b/;

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var baseContent = util.readFile( basePath );
	var ndarrayContent = util.readFile( ndarrayPath );
	var hits;
	var locs;
	var i;

	// 1. @example in base.js
	if ( baseContent ) {
		if ( /@example/.test( baseContent ) ) {
			results.push( util.pass( ID + '.base-example', 'base.js has @example' ) );
		} else {
			results.push( util.warn( ID + '.base-example', 'base.js has @example', 1, [ 'base.js' ] ) );
		}
	} else {
		results.push( util.skip( ID + '.base-example', 'No base.js' ) );
	}

	// 2. @example in ndarray.js
	if ( ndarrayContent ) {
		if ( /@example/.test( ndarrayContent ) ) {
			results.push( util.pass( ID + '.ndarray-example', 'ndarray.js has @example' ) );
		} else {
			results.push( util.warn( ID + '.ndarray-example', 'ndarray.js has @example', 1, [ 'ndarray.js' ] ) );
		}
	} else {
		results.push( util.skip( ID + '.ndarray-example', 'No ndarray.js' ) );
	}

	// 3. No stale Fortran names in JSDoc
	if ( baseContent ) {
		// Only check in JSDoc blocks (lines starting with * or @)
		hits = util.grepFile( basePath, STALE_FORTRAN );
		// Filter to only JSDoc lines
		locs = [];
		for ( i = 0; i < hits.length; i++ ) {
			if ( /^\s*\*|@param|@returns/.test( hits[ i ].text ) ) {
				locs.push( 'base.js:' + hits[ i ].line );
			}
		}
		if ( locs.length === 0 ) {
			results.push( util.pass( ID + '.no-stale-fortran', 'No stale Fortran names in JSDoc' ) );
		} else {
			results.push( util.fail(
				ID + '.no-stale-fortran',
				'No stale Fortran names in JSDoc',
				locs.length, locs,
				'Found LDA/INCX/etc. in JSDoc — use strideA1/strideX/etc.'
			));
		}
	} else {
		results.push( util.skip( ID + '.no-stale-fortran', 'No base.js' ) );
	}

	return results;
}

module.exports = check;
