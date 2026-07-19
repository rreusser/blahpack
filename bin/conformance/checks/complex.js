'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'complex';

// Variables that indicate complex array indexing (not real-only arrays like IPIV, RWORK, WORK)
var COMPLEX_VIEW_PATTERN = /(Av|Bv|Cv|Hv|Zv|Qv|Tv|Uv|Xv|VTv|VLv|VRv)\[/;

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var baseContent = util.readFile( basePath );

	if ( !util.isZPrefix( mod.routine ) ) {
		results.push( util.skip( ID + '.reinterpret', 'Not z/c-prefix' ) );
		results.push( util.skip( ID + '.no-inline-division', 'Not z/c-prefix' ) );
		return results;
	}

	if ( !baseContent ) {
		results.push( util.skip( ID + '.reinterpret', 'No base.js' ) );
		results.push( util.skip( ID + '.no-inline-division', 'No base.js' ) );
		return results;
	}

	// 1. Uses reinterpret() when indexing complex arrays
	if ( /reinterpret/.test( baseContent ) ) {
		results.push( util.pass( ID + '.reinterpret', 'z-prefix uses reinterpret()' ) );
	} else if ( COMPLEX_VIEW_PATTERN.test( baseContent ) ) {
		results.push( util.fail(
			ID + '.reinterpret',
			'z-prefix uses reinterpret()',
			1, [ 'base.js' ],
			'Indexes Complex128Array views without reinterpret()'
		));
	} else {
		// No complex view indexing found — might use Float64Array API directly
		results.push( util.warn(
			ID + '.reinterpret',
			'z-prefix uses reinterpret()',
			1, [ 'base.js' ],
			'z-prefix base.js missing reinterpret (may use Float64Array API)'
		));
	}

	// 2. No inline complex division
	// Look for patterns like: (a*c + b*d) / (c*c + d*d) which suggest manual division
	var divisionPattern = /\/\s*\(\s*\w+\s*\*\s*\w+\s*\+\s*\w+\s*\*\s*\w+\s*\)/;
	if ( divisionPattern.test( baseContent ) && !/cmplx\.div|cmplx\.divAt/.test( baseContent ) ) {
		results.push( util.warn(
			ID + '.no-inline-division',
			'No inline complex division',
			1, [ 'base.js' ],
			'Possible inline complex division detected — use cmplx.div()'
		));
	} else {
		results.push( util.pass( ID + '.no-inline-division', 'No inline complex division' ) );
	}

	return results;
}

module.exports = check;
