#!/usr/bin/env node
'use strict';

// One-off codemod (CONVENTIONS D1/D2, ratified 2026-11-19): a packed matrix
// in the wrapper takes no stride, and the wrapper takes `order`.
// Packed storage is LAPACK column-major packed, so — like the other packed
// wrappers — a wrapper that gains `order` rejects 'row-major'.
//
//   node bin/codemod-spec/packed-wrapper.cjs <routine> ...

var fs = require( 'fs' );
var lib = require( './lib.cjs' );

lib.modules( process.argv.slice( 2 ) ).forEach( function each( mod ) {
	var file = mod.files.wrapper;
	var src = fs.readFileSync( file, 'utf8' );
	var fn = lib.exported( lib.parse( src ) );
	var params = lib.params( fn );
	var addOrder = params[ 0 ] !== 'order';
	var sig = 'function ' + fn.id.name + '( ' + params.join( ', ' ) + ' )';
	var next = params.filter( function f( p ) {
		return p !== 'strideAP';
	});
	if ( addOrder ) {
		next.unshift( 'order' );
	}
	src = src.replace( sig, 'function ' + fn.id.name + '( ' + next.join( ', ' ) + ' )' );
	src = src.replace( /\n\tconst oap = stride2offset\( N \* \( N \+ 1 \) \/ 2, strideAP \);/, '' );
	src = src.replace( /\bAP, strideAP, oap\b/, 'AP, 1, 0' );
	src = src.replace( /\* @param \{integer\} strideAP[^\n]*\n/, '' );
	if ( addOrder ) {
		src = src.replace( /(\n\treturn base\()/, '\n\tif ( order === \'row-major\' ) {\n\t\tthrow new TypeError( format( \'invalid argument. First argument must be \\\'column-major\\\'; packed storage is LAPACK column-major packed. Value: `%s`.\', order ) );\n\t}$1' );
	}
	if ( /strideAP|\boap\b/.test( src.replace( /\/\*[\s\S]*?\*\//g, '' ) ) ) {
		console.log( mod.routine + ': strideAP/oap still referenced' );
	}
	if ( !/stride2offset\(/.test( src.replace( /^import[^\n]*\n/gm, '' ) ) ) {
		src = src.replace( /^import stride2offset[^\n]*\n/m, '' );
	}
	fs.writeFileSync( file, src );
	console.log( mod.routine + ': ' + next.join( ', ' ) );
});
