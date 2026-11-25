#!/usr/bin/env node
'use strict';

// Codemod: make the JSDoc of base.js / ndarray.js / <routine>.js agree with
// the spec (lint/lib/jsdoc-spec.cjs) — the fix for the `spec-jsdoc` rule.
//
// - `@param`: one per parameter in order, with the spec's type and the code's
//   name. An existing tag's description is kept; a missing one is borrowed
//   from the same parameter in the module's other forms, else derived from
//   its role (stride/offset/leading dimension of an array).
// - `@throws`: the generated prologue's (ndarray.js, <routine>.js), followed
//   by any existing `@throws` that is not an argument check (workspace ones).
// - `@returns`: the S11 type (description kept), or removed when the spec
//   returns nothing.
//
//   node bin/codemod-spec/jsdoc.cjs [--dry] [routine ...]

var fs = require( 'fs' );
var lib = require( './lib.cjs' );
var specLib = require( '../../lint/lib/spec.cjs' );
var J = require( '../../lint/lib/jsdoc-spec.cjs' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var only = argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
});

var ORDINAL_RE = /^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty|thirty|forty|fiftieth|fifty)/i;

// Split a JSDoc comment value into { head: [lines], tags: [ { tag, lines } ] }.
function split( value ) {
	var lines = value.split( '\n' );
	var head = [];
	var tags = [];
	var cur = null;
	lines.forEach( function each( line, i ) {
		var m = /^\s*\*\s?@(\w+)/.exec( line );
		if ( m ) {
			cur = { 'tag': m[ 1 ], 'lines': [ line ] };
			tags.push( cur );
		} else if ( cur ) {
			cur.lines.push( line );
		} else {
			head.push( line );
		}
	});
	return { 'head': head, 'tags': tags };
}

// Trailing blank `*` lines of a tag belong between tags; strip them.
function trimBlock( lines ) {
	var out = lines.slice();
	var tail = [];
	while ( out.length > 1 && /^\s*\*?\s*$/.test( out[ out.length - 1 ] ) ) {
		tail.unshift( out.pop() );
	}
	return { 'lines': out, 'tail': tail };
}

function paramInfo( block ) {
	var m = /^\s*\*\s?@param\s+\{([^}]*)\}\s+\[?([\w$]+)\]?\s*(?:-\s*)?(.*)$/.exec( block.lines[ 0 ] );
	return m ? { 'type': m[ 1 ], 'name': m[ 2 ], 'desc': m[ 3 ], 'more': block.lines.slice( 1 ) } : null;
}

// Descriptions of every @param in a module's three forms, by lower-cased name.
function borrowed( mod ) {
	var out = {};
	[ 'base', 'ndarray', 'strided' ].forEach( function each( form ) {
		var src;
		var ast;
		var fn;
		var doc;
		if ( !fs.existsSync( mod.files[ form ] ) ) {
			return;
		}
		src = fs.readFileSync( mod.files[ form ], 'utf8' );
		try {
			ast = lib.parse( src );
		} catch ( e ) {
			return;
		}
		fn = lib.exported( ast );
		doc = fn && lib.leadingJSDoc( ast, fn );
		if ( !doc ) {
			return;
		}
		split( doc.value ).tags.forEach( function each( t ) {
			var p;
			if ( t.tag !== 'param' ) {
				return;
			}
			p = paramInfo( trimBlock( t.lines ) );
			if ( p && p.desc && !out[ p.name.toLowerCase() ] ) {
				out[ p.name.toLowerCase() ] = p;
			}
		});
	});
	return out;
}

function derived( name, all ) {
	var m;
	if ( name === 'order' ) {
		return 'storage layout';
	}
	if ( ( m = /^stride(.+?)(1|2)?$/.exec( name ) ) ) {
		return ( m[ 2 ] ? ( ( m[ 2 ] === '1' ) ? 'stride of the first dimension of ' : 'stride of the second dimension of ' ) : 'stride length for ' ) + '`' + arrayName( m[ 1 ], all ) + '`';
	}
	if ( ( m = /^offset(.+)$/.exec( name ) ) ) {
		return 'starting index for `' + arrayName( m[ 1 ], all ) + '`';
	}
	if ( ( m = /^LD(.+)$/.exec( name ) ) ) {
		return 'leading dimension of `' + arrayName( m[ 1 ], all ) + '`';
	}
	return '`' + name + '`';
}

function arrayName( suffix, all ) {
	var hit = all.filter( function f( n ) {
		return n.toLowerCase() === suffix.toLowerCase() || n.toLowerCase() === suffix.toLowerCase().replace( /work/, 'work' );
	})[ 0 ];
	return hit || suffix;
}

// Is an existing @throws one the generated prologue replaces? It is when it
// documents a check on an argument the prologue checks (same ordinal), or is
// the scaffold's catch-all ("if a numerical argument does not satisfy …").
function isArgThrows( block, ordinals ) {
	var m = /^\s*\*\s?@throws\s+\{[^}]*\}\s*(.*)$/.exec( block.lines[ 0 ] );
	var t = m ? m[ 1 ] : '';
	var o = /^([a-z]+(?:-[a-z]+)?) argument/i.exec( t );
	if ( /numerical argument does not satisfy/i.test( t ) ) {
		return true;
	}
	return !!o && ordinals[ o[ 1 ].toLowerCase() ] === true;
}

function rewrite( src, spec, form, mod, borrow ) {
	var ast = lib.parse( src );
	var fn = lib.exported( ast );
	var doc;
	var parts;
	var params;
	var want;
	var ret;
	var throws;
	var out = [];
	var pre = [];
	var post = [];
	var keptThrows = [];
	var oldReturns = null;
	var oldParams = {};
	var seenParam = false;
	var gap = '*';
	if ( !fn ) {
		return null;
	}
	params = lib.params( fn );
	if ( !sameNames( params, ( form === 'strided' ) ? specLib.strided( spec ) : specLib.base( spec ) ) ) {
		return null;
	}
	doc = lib.leadingJSDoc( ast, fn );
	if ( !doc ) {
		return null;
	}
	var ordinals = {};
	J.throwsDocs( spec, form, params ).forEach( function each( t ) {
		ordinals[ /^(\S+) argument/.exec( t.text )[ 1 ] ] = true;
	});
	parts = split( doc.value );
	parts.tags.forEach( function each( t ) {
		var b = trimBlock( t.lines );
		var p;
		if ( t.tag === 'param' ) {
			seenParam = true;
			p = paramInfo( b );
			if ( p ) {
				oldParams[ p.name.toLowerCase() ] = p;
			}
		} else if ( t.tag === 'throws' ) {
			if ( !isArgThrows( b, ordinals ) ) {
				keptThrows.push( b.lines );
			}
		} else if ( t.tag === 'returns' || t.tag === 'return' ) {
			oldReturns = b.lines;
		} else if ( seenParam || t.tag === 'example' ) {
			post.push( t.lines );
		} else {
			pre.push( t.lines );
		}
	});
	want = J.params( spec, form, params );
	out = out.concat( parts.head );
	pre.forEach( function each( l ) {
		out = out.concat( l );
	});
	want.forEach( function each( w ) {
		var p = oldParams[ w.name.toLowerCase() ] || borrow[ w.name.toLowerCase() ];
		var desc = ( p && p.desc ) ? p.desc : derived( w.name, params );
		var type = w.type;
		// Keep an `Object` parameter's `@typedef` name (spec-jsdoc accepts it).
		if ( type === 'Object' && p && oldParams[ w.name.toLowerCase() ] && new RegExp( '@typedef \\{Object\\} ' + p.type + '\\b' ).test( src ) ) {
			type = p.type;
		}
		out.push( '* @param {' + type + '} ' + w.name + ' - ' + desc );
		if ( p && oldParams[ w.name.toLowerCase() ] ) {
			out = out.concat( p.more );
		}
	});
	throws = J.throwsDocs( spec, form, params );
	throws.forEach( function each( t ) {
		out.push( '* @throws {' + t.type + '} ' + t.text );
	});
	keptThrows.forEach( function each( l ) {
		out = out.concat( l );
	});
	ret = J.returns( spec );
	if ( ret ) {
		if ( oldReturns ) {
			out.push( oldReturns[ 0 ].replace( /@returns?\s+\{[^}]*\}/, '@returns {' + ret + '}' ) );
			out = out.concat( oldReturns.slice( 1 ) );
		} else {
			out.push( '* @returns {' + ret + '} ' + returnsDesc( spec ) );
		}
	}
	if ( post.length ) {
		out.push( gap );
		post.forEach( function each( l, i ) {
			var b = trimBlock( l );
			out = out.concat( b.lines );
			if ( i < post.length - 1 ) {
				out = out.concat( b.tail.length ? b.tail : [] );
			}
		});
	}
	var text = '/*' + out.join( '\n' ) + ( /\n\s*$/.test( doc.value ) ? '' : '' );
	if ( !/\n$/.test( out[ out.length - 1 ] ) ) {
		text += '\n';
	}
	text += '*/';
	return src.slice( 0, doc.range[ 0 ] ) + text + src.slice( doc.range[ 1 ] );
}

function returnsDesc( spec ) {
	var r = spec.returns;
	if ( r.kind === 'info' ) {
		return 'status code';
	}
	if ( r.kind === 'array' ) {
		return '`' + r.param + '`';
	}
	return 'result';
}

function sameNames( a, b ) {
	return a.length === b.length && a.every( function every( x, i ) {
		return x && x.toLowerCase() === b[ i ].toLowerCase();
	});
}

function main() {
	var written = 0;
	var skipped = [];
	lib.modules( only ).forEach( function each( mod ) {
		var spec = specLib.load( mod.routine );
		var borrow;
		if ( !spec ) {
			return;
		}
		borrow = borrowed( mod );
		[ 'base', 'ndarray', 'strided' ].forEach( function each( form ) {
			var file = mod.files[ form ];
			var src;
			var out;
			if ( !fs.existsSync( file ) ) {
				return;
			}
			src = fs.readFileSync( file, 'utf8' );
			try {
				out = rewrite( src, spec, form, mod, borrow );
			} catch ( err ) {
				skipped.push( mod.routine + ' ' + form + ': ' + err.message );
				return;
			}
			if ( out === null ) {
				skipped.push( mod.routine + ' ' + form );
				return;
			}
			if ( out !== src ) {
				written += 1;
				if ( DRY ) {
					console.log( 'would write: ' + file );
				} else {
					fs.writeFileSync( file, out );
				}
			}
		});
	});
	console.log( 'written: ' + written );
	skipped.forEach( function each( s ) {
		console.log( 'skipped: ' + s );
	});
}

main();
