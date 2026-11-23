#!/usr/bin/env node

/**
* Codemod (ticket 0068): rewrite the length argument of a wrapper's
* `stride2offset( n, strideX )` to the spec's length for that vector, for
* every vector the wrapper replay reported as disagreeing with the spec.
*
* Usage:
*   node bin/wrapper-replay.mjs --json <routines...> > report.json
*   node bin/codemod-vector-lengths.mjs report.json [--dry-run]
*
* Only expressions built from the wrapper's own parameters, numbers, `min`,
* `max` and arithmetic are applied; a `min`/`max` import is added if needed.
* Every change must then be verified by rerunning the replay on the module:
* a spec length that is itself wrong (flattened SIDE/TRANS conditionals,
* ticket 0062) shows up as `shorter-than-touched` and must be reverted.
*/

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as espree from 'espree';

const require = createRequire( import.meta.url );
const specLib = require( '../lint/lib/spec.cjs' );
const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const IMPORTS = {
	'min': "import min from '@stdlib/math/base/special/fast/min/lib/index.js';",
	'max': "import max from '@stdlib/math/base/special/fast/max/lib/index.js';"
};

function wrapperPath( r ) {
	for ( const pkg of [ 'blas', 'lapack', 'arpack' ] ) {
		const f = path.join( ROOT, 'lib', pkg, 'base', r, 'lib', r + '.js' );
		if ( fs.existsSync( f ) ) {
			return f;
		}
	}
	return null;
}

// Rewrite `expr` with the wrapper's own parameter spelling (the spec may say
// `P` where the wrapper says `p`); null if it names anything else.
function inWrapperTerms( expr, params ) {
	if ( !/^[\w\s(),+\-*]+$/.test( expr ) ) {
		return null;
	}
	let ok = true;
	const out = expr.replace( /[A-Za-z_]\w*/g, ( id ) => {
		if ( id === 'min' || id === 'max' ) {
			return id;
		}
		const hit = params.find( ( p ) => p.toLowerCase() === id.toLowerCase() );
		if ( !hit ) {
			ok = false;
		}
		return hit || id;
	});
	return ok ? out : null;
}

function wrapperParams( src, routine ) {
	const m = new RegExp( 'function ' + routine + '\\s*\\(([^)]*)\\)' ).exec( src );
	return m ? m[ 1 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean ) : [];
}

function main() {
	const argv = process.argv.slice( 2 );
	const dry = argv.includes( '--dry-run' );
	const report = JSON.parse( fs.readFileSync( argv.find( ( a ) => !a.startsWith( '--' ) ), 'utf8' ) );
	const summary = { 'changed': [], 'skipped': [] };
	for ( const r of report ) {
		const want = {};
		( r.lengths || [] ).filter( ( l ) => l.kind === 'disagrees-with-spec' ).forEach( ( l ) => {
			want[ l.param ] = true;
		});
		const names = Object.keys( want );
		if ( !names.length ) {
			continue;
		}
		const file = wrapperPath( r.routine );
		const spec = specLib.load( r.routine );
		if ( !file || !spec ) {
			summary.skipped.push( r.routine + ': no wrapper or spec' );
			continue;
		}
		const groups = specLib.baseGroups( spec );
		let src = fs.readFileSync( file, 'utf8' );
		const params = wrapperParams( src, r.routine );
		const ast = espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true } );
		const edits = [];
		const needs = new Set();
		( function walk( n ) {
			if ( !n || typeof n.type !== 'string' ) {
				return;
			}
			if ( n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'stride2offset' && n.arguments.length === 2 && n.arguments[ 1 ].type === 'Identifier' ) {
				const strideName = n.arguments[ 1 ].name;
				const g = groups.find( ( x ) => x.names.length === 3 && x.names[ 1 ] === strideName );
				if ( g && want[ g.param.name ] ) {
					const specExpr = g.param.length && g.param.length.js;
					const expr = specExpr && inWrapperTerms( specExpr, params );
					const a0 = n.arguments[ 0 ];
					if ( !expr ) {
						summary.skipped.push( r.routine + '.' + g.param.name + ': spec length ' + JSON.stringify( specExpr ) + ' not expressible' );
					} else if ( a0.type === 'Identifier' && !params.includes( a0.name ) ) {
						// A local the wrapper computed (`lenx`): its own, likely
						// flag-conditional, length; the spec's is the flattened
						// one (ticket 0062).
						summary.skipped.push( r.routine + '.' + g.param.name + ': wrapper computes its own length (' + a0.name + '); spec says ' + specExpr );
					} else {
						const old = src.slice( a0.range[ 0 ], a0.range[ 1 ] );
						if ( /\?/.test( old ) ) {
							// Already flag-conditional: the spec's single
							// expression is the flattened one (ticket 0062).
							summary.skipped.push( r.routine + '.' + g.param.name + ': wrapper is already conditional (' + old + '); spec says ' + expr );
						} else if ( old !== expr ) {
							edits.push( [ a0.range[ 0 ], a0.range[ 1 ], expr ] );
							summary.changed.push( r.routine + '.' + g.param.name + ': ' + old + ' -> ' + expr );
							[ 'min', 'max' ].forEach( ( f ) => {
								if ( new RegExp( '\\b' + f + '\\s*\\(' ).test( expr ) ) {
									needs.add( f );
								}
							});
						}
					}
				}
			}
			for ( const k of Object.keys( n ) ) {
				const v = n[ k ];
				if ( Array.isArray( v ) ) {
					v.forEach( walk );
				} else if ( v && typeof v.type === 'string' ) {
					walk( v );
				}
			}
		})( ast );
		if ( !edits.length ) {
			continue;
		}
		edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
		for ( const e of edits ) {
			src = src.slice( 0, e[ 0 ] ) + e[ 2 ] + src.slice( e[ 1 ] );
		}
		needs.forEach( ( f ) => {
			if ( !new RegExp( '^import ' + f + ' from ', 'm' ).test( src ) ) {
				const imports = [ ...src.matchAll( /^import .*;$/gm ) ];
				const last = imports.filter( ( m ) => !/from '\.\//.test( m[ 0 ] ) ).pop() || imports[ imports.length - 1 ];
				const at = last.index + last[ 0 ].length;
				src = src.slice( 0, at ) + '\n' + IMPORTS[ f ] + src.slice( at );
			}
		});
		if ( !dry ) {
			fs.writeFileSync( file, src );
		}
	}
	console.log( summary.changed.join( '\n' ) );
	console.log( '\nchanged ' + summary.changed.length + ' offsets; skipped ' + summary.skipped.length );
	summary.skipped.forEach( ( s ) => console.log( '  skipped ' + s ) );
}

main();
