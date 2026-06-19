
'use strict';

// MODULES //

var setReadOnly = require( '@stdlib/utils/define-nonenumerable-read-only-property' );
var dlaeda = require( './dlaeda.js' );
var ndarray = require( './ndarray.js' );


// MAIN //

setReadOnly( dlaeda, 'ndarray', ndarray );


// EXPORTS //

module.exports = dlaeda;
