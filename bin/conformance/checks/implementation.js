'use strict';

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'implementation';

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var baseContent = util.readFile( basePath );
	var ndarrayContent = util.readFile( ndarrayPath );

	if ( !ndarrayContent ) {
		// ndarray.js doesn't exist — all checks skip
		results.push( util.skip( ID + '.ndarray-early-return', 'No ndarray.js' ) );
		results.push( util.skip( ID + '.ndarray-not-private', 'No ndarray.js' ) );
	} else {
		// 3. ndarray.js has early return
		if ( baseContent && /if\s*\(\s*[MNK]\s*===\s*0/i.test( baseContent ) ) {
			if ( /if\s*\(\s*[MNK]\s*===\s*0/i.test( ndarrayContent ) || /return\s/.test( ndarrayContent ) ) {
				results.push( util.pass( ID + '.ndarray-early-return', 'ndarray.js has early return' ) );
			} else {
				results.push( util.warn(
					ID + '.ndarray-early-return',
					'ndarray.js has early return',
					1, [ 'ndarray.js' ],
					'base.js has early return but ndarray.js may not'
				));
			}
		} else {
			results.push( util.skip( ID + '.ndarray-early-return', 'No early return in base.js' ) );
		}

		// 4. ndarray.js is NOT @private
		if ( /@private/.test( ndarrayContent ) ) {
			results.push( util.fail(
				ID + '.ndarray-not-private',
				'ndarray.js is NOT @private',
				1, [ 'ndarray.js' ],
				'ndarray.js should be public API (not @private)'
			));
		} else {
			results.push( util.pass( ID + '.ndarray-not-private', 'ndarray.js is NOT @private' ) );
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
