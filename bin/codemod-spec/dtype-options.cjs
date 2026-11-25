#!/usr/bin/env node
'use strict';

// Codemod (benchmarks, examples, tests): give a `{ 'dtype': '<dtype>' }`
// options object its literal type (ticket 0094). Unannotated, the property
// widens to `string`, so stdlib's `uniform( N, a, b, options )` cannot pick
// its Float64Array overload and every later use of the array is unchecked.
//
//   /** @type {{ dtype: 'float64' }} */
//   const options = {
//
//   node bin/codemod-spec/dtype-options.cjs [--dry] <file ...>

var fs = require( 'fs' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var RE = /^(\t*)((?:const|let|var) [\w$]+ = \{\n\s*'dtype': '([\w]+)'\n\s*\};)/gm;
var n = 0;

argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
}).forEach( function each( f ) {
	var src = fs.readFileSync( f, 'utf8' );
	var next = src.replace( RE, function r( m, ind, decl, dtype, off ) {
		var before = src.slice( Math.max( 0, off - 200 ), off );
		if ( /@type \{\{ dtype: '[\w]+' \}\} \*\/\n\t*$/.test( before ) ) {
			return m;
		}
		return ind + '/** @type {{ dtype: \'' + dtype + '\' }} */\n' + ind + decl;
	});
	if ( next !== src ) {
		n += 1;
		if ( !DRY ) {
			fs.writeFileSync( f, next );
		}
	}
});
console.log( ( DRY ? 'would write: ' : 'written: ' ) + n );
