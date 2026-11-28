'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'implementation';

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var stridedPath = path.join( mod.dir, 'lib', 'strided.js' );
	var baseContent = util.readFile( basePath );
	var stridedContent = util.readFile( stridedPath );

	if ( !stridedContent ) {
		// strided.js doesn't exist — all checks skip
		results.push( util.skip( ID + '.strided-early-return', 'No strided.js' ) );
		results.push( util.skip( ID + '.strided-not-private', 'No strided.js' ) );
	} else {
		// 3. strided.js has early return
		if ( baseContent && /if\s*\(\s*[MNK]\s*===\s*0/i.test( baseContent ) ) {
			if ( /if\s*\(\s*[MNK]\s*===\s*0/i.test( stridedContent ) || /return\s/.test( stridedContent ) ) {
				results.push( util.pass( ID + '.strided-early-return', 'strided.js has early return' ) );
			} else {
				results.push( util.warn(
					ID + '.strided-early-return',
					'strided.js has early return',
					1, [ 'strided.js' ],
					'base.js has early return but strided.js may not'
				));
			}
		} else {
			results.push( util.skip( ID + '.strided-early-return', 'No early return in base.js' ) );
		}

		// 4. strided.js is NOT @private
		if ( /@private/.test( stridedContent ) ) {
			results.push( util.fail(
				ID + '.strided-not-private',
				'strided.js is NOT @private',
				1, [ 'strided.js' ],
				'strided.js should be public API (not @private)'
			));
		} else {
			results.push( util.pass( ID + '.strided-not-private', 'strided.js is NOT @private' ) );
		}
	}

	// 5. base.js IS @private
	if ( baseContent ) {
		if ( /@private/.test( baseContent ) ) {
			results.push( util.pass( ID + '.base-is-private', 'base.js IS @private' ) );
		} else {
			results.push( util.warn(
				ID + '.base-is-private',
				'base.js IS @private',
				1, [ 'base.js' ],
				'base.js should be @private'
			));
		}
	}

	return results;
}

module.exports = check;
