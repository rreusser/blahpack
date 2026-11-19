// Detect how a routine currently delivers its output scalars (the "old form"),
// so the S10 codemod can rewrite the routine and every caller to one caller-
// provided length-1 array per output scalar (CONVENTIONS S10).
//
// Old forms, per output scalar:
//   field     returned in a result object: `return { 'info': info, 'ilo': ilo }`
//             (complex: two fields, `<name>r`/`<name>i` or `<name>R`/`<name>I`)
//   outIndex  packed into a Float64Array param: `out[ k ]`
//   outField  packed into an Object param: `out.M`
//   return    the function's return value is the scalar itself
//   value     an in/out scalar passed by value whose updated value is returned
//             as a result-object field (`dlasq4`'s `g`)
//   array     already its own length-1 array (`X[ 0 ]`): conforming
//
// Usage: node bin/codemod-s10/forms.mjs [routine...]   (prints the table)

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as walk from 'acorn-walk';
import { ROOT, parse, exportedName, paramsOf } from '../codemod-strided-wrapper/lib.mjs';

const require = createRequire( import.meta.url );
const specLib = require( path.join( ROOT, 'lint', 'lib', 'spec.cjs' ) );

export const OVERRIDES = JSON.parse( fs.readFileSync( new URL( './overrides.json', import.meta.url ), 'utf8' ) );

export function moduleDir( spec ) {
	return path.join( ROOT, 'lib', spec.package, 'base', spec.routine );
}

// S10 output scalars of a spec: role scalar, intent out/inout (INFO has role info).
export function outScalars( spec ) {
	return spec.params.filter( ( p ) => p.role === 'scalar' && p.intent !== 'in' && p.dtype !== 'string' );
}

export function isComplex( p ) {
	return /^complex/.test( p.dtype );
}

export function mainFunction( ast, fn ) {
	let out = null;
	for ( const node of ast.body ) {
		if ( node.type === 'FunctionDeclaration' && node.id.name === fn ) {
			out = node;
		}
	}
	return out;
}

// Return statements belonging to `fnNode` itself (not nested functions).
export function ownReturns( fnNode ) {
	const out = [];
	( function visit( node, top ) {
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( !top && ( node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression' ) ) {
			return;
		}
		if ( node.type === 'ReturnStatement' ) {
			out.push( node );
		}
		for ( const k of Object.keys( node ).filter( ( x ) => !x.startsWith( "__" ) ) ) {
			const v = node[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( ( c ) => c && typeof c.type === 'string' && visit( c, false ) );
			} else if ( v && typeof v.type === 'string' && k !== 'type' && !k.startsWith( '__' ) ) {
				visit( v, false );
			}
		}
	})( fnNode.body, true );
	return out;
}

export function keyName( prop ) {
	if ( prop.type !== 'Property' || prop.computed ) {
		return null;
	}
	return prop.key.type === 'Identifier' ? prop.key.name : String( prop.key.value );
}

// Parse a packed-`out` JSDoc line into index → name: "out[0]=c, out[1]=s",
// "`out[0]` is `sestpr`", "[p, q]".
function outIndexMap( doc, names ) {
	const map = {};
	let m;
	const re = /out\[\s*(\d+)\s*\]`?\s*(?:=|is)\s*`?([A-Za-z0-9_]+)/g;
	while ( ( m = re.exec( doc ) ) !== null ) {
		map[ m[ 2 ].toLowerCase() ] = Number( m[ 1 ] );
	}
	if ( !Object.keys( map ).length && ( m = /\[\s*([A-Za-z0-9_]+(?:\s*,\s*[A-Za-z0-9_]+)+)\s*\]/.exec( doc ) ) ) {
		m[ 1 ].split( ',' ).forEach( ( s, i ) => {
			map[ s.trim().toLowerCase() ] = i;
		});
	}
	const out = {};
	for ( const n of names ) {
		if ( map[ n.toLowerCase() ] !== void 0 ) {
			out[ n ] = map[ n.toLowerCase() ];
		}
	}
	return out;
}

export function detect( routine ) {
	const spec = specLib.load( routine );
	if ( !spec ) {
		return { routine, error: 'no spec' };
	}
	const dir = moduleDir( spec );
	const bfile = path.join( dir, 'lib', 'base.js' );
	if ( !fs.existsSync( bfile ) ) {
		return { routine, error: 'no base.js' };
	}
	const src = fs.readFileSync( bfile, 'utf8' );
	const fn = exportedName( src );
	const params = paramsOf( src );
	const ast = parse( src );
	const main = mainFunction( ast, fn );
	const ov = OVERRIDES[ routine ] || {};
	const outs = outScalars( spec );
	const lower = params.map( ( p ) => p.toLowerCase() );
	const rets = ownReturns( main );
	const objRets = rets.filter( ( r ) => r.argument && r.argument.type === 'ObjectExpression' );
	const keys = new Set();
	objRets.forEach( ( r ) => r.argument.properties.forEach( ( p ) => keys.add( keyName( p ) ) ) );
	const jsdoc = src.slice( 0, main.start );
	const outDoc = ( /@param \{([^}]*)\} out - ([^\n]*)/.exec( jsdoc ) || [] );
	const form = {};
	const problems = [];
	for ( const p of outs ) {
		const name = p.name;
		if ( ov.forms && ov.forms[ name ] ) {
			form[ name ] = ov.forms[ name ];
			continue;
		}
		const pi = lower.indexOf( name.toLowerCase() );
		const fieldKey = [ ...keys ].find( ( k ) => k && k.toLowerCase() === name.toLowerCase() );
		const cKeys = isComplex( p ) ? [ ...keys ].filter( ( k ) => k && ( k.toLowerCase() === name.toLowerCase() + 'r' || k.toLowerCase() === name.toLowerCase() + 'i' ) ) : [];
		if ( pi !== -1 ) {
			const pname = params[ pi ];
			const indexed = new RegExp( '(^|[^.\\w])' + pname + '\\s*\\[' ).test( src.slice( main.body.start ) );
			if ( isComplex( p ) || indexed ) {
				form[ name ] = { kind: 'array', param: pname };
			} else if ( fieldKey ) {
				form[ name ] = { kind: 'value', param: pname, key: fieldKey };
			} else {
				problems.push( name + ': by-value param, no result field' );
			}
			continue;
		}
		if ( fieldKey && !isComplex( p ) ) {
			form[ name ] = { kind: 'field', key: fieldKey };
			continue;
		}
		if ( cKeys.length === 2 ) {
			const re = cKeys.find( ( k ) => /r$/i.test( k ) );
			const im = cKeys.find( ( k ) => /i$/i.test( k ) );
			form[ name ] = { kind: 'cfield', re, im };
			continue;
		}
		if ( outDoc[ 1 ] && /Float64Array|Array/.test( outDoc[ 1 ] ) ) {
			const map = outIndexMap( outDoc[ 2 ], outs.map( ( x ) => x.name ) );
			if ( map[ name ] !== void 0 ) {
				form[ name ] = { kind: 'outIndex', param: 'out', index: map[ name ] };
				continue;
			}
		}
		if ( outDoc[ 1 ] === 'Object' && new RegExp( 'out\\.' + name + '\\b', 'i' ).test( src ) ) {
			const k = new RegExp( 'out\\.(' + name + ')\\b', 'i' ).exec( src )[ 1 ];
			form[ name ] = { kind: 'outField', param: 'out', key: k };
			continue;
		}
		problems.push( name + ': not found' );
	}
	// What the function returns today, besides the outputs.
	const fieldKeys = new Set( Object.values( form ).flatMap( ( f ) => ( f.kind === 'cfield' ? [ f.re, f.im ] : ( f.key && f.kind !== 'outField' ? [ f.key ] : [] ) ) ) );
	// Keys naming a Fortran input (`qmax` of dlasq3, `ifst` of ztgexc) are not
	// outputs of the routine: they are dropped, not kept as extras.
	const inputs = new Set( spec.params.filter( ( p ) => p.intent === 'in' ).map( ( p ) => p.name.toLowerCase() ) );
	const dropped = [ ...keys ].filter( ( k ) => k && !fieldKeys.has( k ) && k !== 'info' && inputs.has( k.toLowerCase() ) );
	const extras = [ ...keys ].filter( ( k ) => k && !fieldKeys.has( k ) && k !== 'info' && !inputs.has( k.toLowerCase() ) );
	const outP = Object.values( form ).find( ( f ) => f.kind === 'outIndex' || f.kind === 'outField' );
	const retContainer = !!outP && rets.some( ( r ) => r.argument && r.argument.type === 'Identifier' && r.argument.name === outP.param );
	return {
		routine,
		spec,
		retContainer,
		dir,
		fn,
		params,
		form,
		extras,
		dropped,
		hasInfoKey: keys.has( 'info' ),
		objReturns: objRets.length,
		returns: rets.length,
		problems,
		override: ov
	};
}

// Routines with at least one S10 output scalar not already in array form.
export function worklist() {
	const out = [];
	for ( const f of fs.readdirSync( specLib.SPEC_DIR ) ) {
		if ( !f.endsWith( '.json' ) || f === 'schema.json' || f === 'options.json' ) {
			continue;
		}
		const spec = JSON.parse( fs.readFileSync( path.join( specLib.SPEC_DIR, f ), 'utf8' ) );
		if ( !spec.routine || !outScalars( spec ).length ) {
			continue;
		}
		if ( !fs.existsSync( path.join( moduleDir( spec ), 'lib', 'base.js' ) ) ) {
			continue;
		}
		const d = detect( spec.routine );
		if ( d.problems.length || Object.values( d.form ).some( ( x ) => x.kind !== 'array' ) ) {
			out.push( d );
		}
	}
	return out;
}

if ( import.meta.url === 'file://' + process.argv[ 1 ] ) {
	const only = process.argv.slice( 2 );
	const list = only.length ? only.map( detect ) : worklist();
	for ( const d of list ) {
		const f = Object.entries( d.form ).map( ( [ k, v ] ) => k + '=' + v.kind + ( v.key ? '(' + v.key + ')' : '' ) + ( v.index !== void 0 ? '[' + v.index + ']' : '' ) ).join( ' ' );
		console.log( d.routine.padEnd( 14 ) + ( d.spec ? d.spec.returns.kind : '' ).padEnd( 9 ) + f + ( d.extras && d.extras.length ? '  EXTRA:' + d.extras.join( ',' ) : '' ) + ( d.problems && d.problems.length ? '  PROBLEM:' + d.problems.join( '; ' ) : '' ) + ( d.error ? ' ERROR ' + d.error : '' ) );
	}
	console.error( list.length + ' routines' );
}
