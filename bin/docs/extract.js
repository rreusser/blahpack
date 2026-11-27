/**
* Extracts the documentation model ("IR") for every routine.
*
* Sources, in order of authority:
*
*   1. JSDoc in the module source: `lib/index.js` (module summary, examples,
*      and the layout wrapper it default-exports) and `lib/ndarray.js`.
*   2. `spec/<routine>.json`: parameter roles, intents, shapes and argument
*      checks, generated from the reference Fortran.
*   3. `lib/base.js` imports: the call graph.
*
* Nothing here is hand-written prose about a routine. The site is a pure function
* of the code, so it can be deleted and rebuilt at any time.
*
* @module bin/docs/extract
*/

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import doctrine from 'doctrine';
import { createRequire } from 'node:module';
import { classify, precision, stem } from './taxonomy.js';

const ROOT = resolve( import.meta.dirname, '..', '..' );
const H = createRequire( import.meta.url )( '../../lint/lib/doc-health.cjs' );
const PACKAGE_JSON = JSON.parse( readFileSync( join( ROOT, 'package.json' ), 'utf8' ) );
const ARRAY_ROLES = new Set([ 'matrix', 'banded', 'packed', 'vector', 'workspace', 'index', 'result' ]);
const DTYPE_ARRAY = {
	'float64': 'Float64Array',
	'complex128': 'Complex128Array',
	'int32': 'Int32Array'
};


// HELPERS //

function read( path ) {
	return existsSync( path ) ? readFileSync( path, 'utf8' ) : null;
}

/**
* Returns the JSDoc block immediately preceding `function <name>(`, and the declared parameter list.
*
* @private
* @param {string} src - source text
* @param {string} name - function name
* @returns {(Object|null)} `{ comment, params }`
*/
function functionDoc( src, name ) {
	const re = new RegExp( '(\\/\\*\\*(?:(?!\\*\\/)[\\s\\S])*\\*\\/)\\s*function\\s+' + name + '\\s*\\(([^)]*)\\)' );
	const m = src.match( re );
	if ( !m ) {
		return null;
	}
	const params = m[ 2 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );
	return { 'comment': m[ 1 ], params };
}

/**
* Returns the first module-level JSDoc block that is not the license header.
*
* @private
* @param {string} src - source text
* @returns {(string|null)} comment
*/
function moduleDoc( src ) {
	const blocks = src.match( /\/\*\*(?:(?!\*\/)[\s\S])*\*\//g ) || [];
	for ( const b of blocks ) {
		// Skip the license, empty blocks, and the inline type cast on the
		// default export (`/** @type {…} */ ( fn )`), which is not module doc.
		if ( !/@license/.test( b ) && !/^\/\*\*\s*\*\s*\/$/.test( b ) && !/^\/\*\*\s*@type\b/.test( b ) ) {
			return b;
		}
	}
	return null;
}

function parseDoc( comment ) {
	if ( !comment ) {
		return { 'description': '', 'tags': [] };
	}
	// Same parser as the lint gate (lint/lib/doc-health.cjs); takes the comment value.
	return H.parse( comment.replace( /^\/\*/, '' ).replace( /\*\/$/, '' ) );
}

function typeString( t ) {
	if ( !t ) {
		return null;
	}
	try {
		return doctrine.type.stringify( t, { 'compact': true } );
	} catch ( err ) {
		return null;
	}
}

/**
* Splits `name - description` (as used in `@returns {integer} info - ...`).
*
* @private
* @param {string} s - description
* @returns {Object} `{ name, description }`
*/
function splitNamed( s ) {
	const m = ( s || '' ).match( /^([A-Za-z_$][\w$]*)\s+-\s+([\s\S]*)$/ );
	return m ? { 'name': m[ 1 ], 'description': m[ 2 ] } : { 'name': null, 'description': s || '' };
}

const firstSentence = ( md ) => H.firstSentence( md );

function importedFile( src, ident ) {
	const m = src.match( new RegExp( 'import\\s+' + ident + '\\s+from\\s+\'\\./([\\w-]+)\\.js\'' ) );
	return m ? m[ 1 ] : null;
}

function exportedIdent( src ) {
	// `export default fn;` or the typed `export default /** @type {…} */ ( fn );`
	const m = src.match( /export\s+default\s+(?:\/\*\*(?:(?!\*\/)[\s\S])*\*\/\s*)?\(?\s*([A-Za-z_$][\w$]*)\s*\)?\s*;/ );
	return m ? m[ 1 ] : null;
}

/**
* Maps a stride/offset/leading-dimension parameter name to the array operand it addresses.
*
* @private
* @param {string} name - parameter name
* @param {Map} arrays - lowercase array name → array name
* @returns {(Object|null)} `{ operand, aux }`
*/
function operandOf( name, arrays ) {
	const rules = [
		[ /^stride(.+)()$/i, 'stride' ],
		[ /^stride(.+?)([12])$/i, 'stride' ],
		[ /^offset(.+)$/i, 'offset' ],
		[ /^ld(.+)$/i, 'ld' ],
		[ /^inc(.+)$/i, 'stride' ]
	];
	for ( const [ re, aux ] of rules ) {
		const m = name.match( re );
		if ( m ) {
			const key = m[ 1 ].toLowerCase();
			if ( arrays.has( key ) ) {
				return { 'operand': arrays.get( key ), aux, 'dim': m[ 2 ] ? Number( m[ 2 ] ) : null };
			}
		}
	}
	return null;
}

function expr( e ) {
	if ( !e ) {
		return null;
	}
	return e.js || e.fortran || null;
}

/**
* Builds a human/agent-readable shape string from a spec parameter.
*
* @private
* @param {Object} sp - spec parameter
* @returns {(string|null)} shape
*/
function shapeOf( sp ) {
	if ( !sp ) {
		return null;
	}
	if ( sp.rows || sp.cols ) {
		const wrap = ( e ) => ( /[?:]/.test( e || '' ) ? '(' + e + ')' : e );
		return wrap( expr( sp.rows ) ) + ' × ' + wrap( expr( sp.cols ) );
	}
	if ( sp.minLength ) {
		return '≥ ' + expr( sp.minLength );
	}
	if ( sp.length ) {
		return expr( sp.length );
	}
	return null;
}


/**
* Rebuilds the full Fortran signature (the spec keeps only the statement's first line).
*
* @private
* @param {Object} spec - routine spec
* @returns {string} signature
*/
function fortranSignature( spec ) {
	const head = ( spec.signature || '' ).split( '(' )[ 0 ].trim();
	const args = spec.params.filter( ( p ) => p.fortran && p.position ).sort( ( a, b ) => a.position - b.position ).map( ( p ) => p.fortran );
	return head + '( ' + args.join( ', ' ) + ' )';
}


// MAIN //

/**
* Builds the IR for one signature (layout wrapper or ndarray).
*
* @private
* @param {Object} ctx - routine context
* @param {string} kind - `'layout'` or `'ndarray'`
* @param {string} file - repo-relative source path
* @param {string} fname - function name in that file
* @returns {(Object|null)} signature IR
*/
function signature( ctx, kind, file, fname ) {
	const src = read( join( ROOT, file ) );
	if ( !src ) {
		return null;
	}
	const fd = functionDoc( src, fname );
	if ( !fd ) {
		ctx.health.push({ 'code': 'no-jsdoc', 'where': file, 'message': 'no JSDoc block found above `function ' + fname + '`' });
		return null;
	}
	const doc = parseDoc( fd.comment );
	const tags = doc.tags || [];
	const ptags = new Map( tags.filter( ( t ) => t.title === 'param' ).map( ( t ) => [ t.name, t ] ) );

	// Arrays, for grouping strides/offsets/LDs with their operand:
	const arrays = new Map();
	for ( const name of fd.params ) {
		const t = typeString( ptags.get( name ) && ptags.get( name ).type ) || '';
		const sp = ctx.specByName.get( name.toLowerCase() );
		if ( /Array$/.test( t ) || ( sp && ARRAY_ROLES.has( sp.role ) ) ) {
			arrays.set( name.toLowerCase(), name );
		}
	}

	const params = fd.params.map( ( name ) => {
		const tag = ptags.get( name );
		const sp = ctx.specByName.get( name.toLowerCase() ) || null;
		const op = operandOf( name, arrays );
		const type = typeString( tag && tag.type );
		const p = {
			name,
			type,
			'description': tag ? ( tag.description || '' ) : '',
			'role': sp ? sp.role : ( op ? op.aux : null ),
			'intent': sp ? sp.intent : ( op ? 'in' : null ),
			'dtype': sp ? sp.dtype : null,
			'shape': shapeOf( sp ),
			'fortran': sp ? sp.fortran : null,
			'operand': ( op && !arrays.has( name.toLowerCase() ) ) ? op.operand : null,
			'aux': ( op && !arrays.has( name.toLowerCase() ) ) ? op.aux : null,
			'values': null,
			'constraints': []
		};
		if ( !sp && name === 'order' ) {
			p.role = 'layout';
			p.intent = 'in';
			p.values = [ 'row-major', 'column-major' ];
		}
		if ( sp && sp.format ) {
			p.format = sp.format;
		}
		if ( sp && sp.ld ) {
			p.ld = sp.ld;
		}
		// Argument checks from the spec (derived from the Fortran INFO checks):
		for ( const c of ctx.checksByParam.get( ( sp && sp.fortran ) || '' ) || [] ) {
			if ( c.kind === 'enum' ) {
				p.values = c.values;
			} else if ( c.kind === 'nonnegative' ) {
				p.constraints.push({ 'kind': 'nonnegative', 'label': 'requires', 'text': name + ' ≥ 0' });
			} else if ( c.kind === 'nonzero' ) {
				p.constraints.push({ 'kind': 'nonzero', 'label': 'requires', 'text': name + ' ≠ 0' });
			} else if ( c.kind === 'ld' ) {
				if ( kind === 'layout' ) {
					const cm = expr( c.min );
					p.constraints.push({ 'kind': 'ld', 'label': c.rowMajor ? 'column-major requires' : 'requires', 'text': name + ' ≥ ' + cm, 'layout': c.rowMajor ? 'column-major' : null });
					if ( c.rowMajor ) {
						const m = c.rowMajor.match( /^\s*\w+\s*<\s*(max\s*\([\s\S]*\))\s*$/ );
						p.constraints.push( m ? { 'kind': 'ld', 'label': 'row-major requires', 'text': name + ' ≥ ' + m[ 1 ], 'layout': 'row-major' } : { 'kind': 'ld', 'label': 'row-major rejects', 'text': c.rowMajor, 'layout': 'row-major' } );
					}
				}
			} else if ( c.kind === 'expr' && c.js ) {
				if ( kind === 'layout' || !/\bld[a-z]+\b/i.test( c.js ) ) {
					p.constraints.push({ 'kind': 'expr', 'label': 'rejects', 'text': c.js });
				}
			}
		}
		// Health checks (surface doc defects; see ticket 0002):
		if ( !tag ) {
			ctx.health.push({ 'code': 'param-undocumented', 'where': file, 'message': '`' + name + '` has no @param' });
		} else if ( H.isPlaceholderParam( name, p.description ) ) {
			ctx.health.push({ 'code': 'param-description-is-name', 'where': file, 'message': '`' + name + '` description just repeats its name' });
		}
		if ( sp && type && DTYPE_ARRAY[ sp.dtype ] && ARRAY_ROLES.has( sp.role ) && type.replace( /^\(|\|null\)$/g, '' ) !== DTYPE_ARRAY[ sp.dtype ] ) {
			ctx.health.push({ 'code': 'param-type-vs-spec', 'where': file, 'message': '`' + name + '` documented as `' + type + '`, spec says ' + sp.dtype + ' ' + sp.role });
		}
		return p;
	});
	for ( const name of ptags.keys() ) {
		if ( !fd.params.includes( name ) ) {
			ctx.health.push({ 'code': 'param-stale', 'where': file, 'message': '@param `' + name + '` is not a parameter of `' + fname + '`' });
		}
	}

	const ret = tags.find( ( t ) => t.title === 'returns' || t.title === 'return' );
	const rn = splitNamed( ret ? ret.description : '' );
	return {
		kind,
		'call': kind === 'ndarray' ? ctx.name + '.ndarray' : ctx.name,
		file,
		'description': doc.description || '',
		params,
		'returns': ret ? { 'type': typeString( ret.type ), 'name': rn.name, 'description': rn.description } : null,
		'throws': tags.filter( ( t ) => t.title === 'throws' ).map( ( t ) => ({ 'type': typeString( t.type ), 'description': t.description || '' }) ),
		'examples': tags.filter( ( t ) => t.title === 'example' ).map( ( t ) => t.description )
	};
}

/**
* Extracts the IR for one routine.
*
* @param {string} pkg - package (`blas`, `lapack`, `arpack`)
* @param {string} name - routine name
* @returns {Object} routine IR
*/
export function extractRoutine( pkg, name ) {
	const dir = join( 'lib', pkg, 'base', name );
	const spec = JSON.parse( read( join( ROOT, 'spec', name + '.json' ) ) || 'null' );
	const ctx = {
		name,
		'health': [],
		'specByName': new Map(),
		'checksByParam': new Map()
	};
	for ( const sp of ( spec ? spec.params : [] ) ) {
		ctx.specByName.set( sp.name.toLowerCase(), sp );
	}
	for ( const c of ( spec ? spec.checks || [] : [] ) ) {
		const list = ctx.checksByParam.get( c.param ) || [];
		list.push( c );
		ctx.checksByParam.set( c.param, list );
	}

	// Module doc (summary + examples):
	const indexSrc = read( join( ROOT, dir, 'lib', 'index.js' ) ) || '';
	const mdoc = parseDoc( moduleDoc( indexSrc.replace( /^[\s\S]*?@license[\s\S]*?\*\//, '' ) ) );
	const moduleExamples = ( mdoc.tags || [] ).filter( ( t ) => t.title === 'example' ).map( ( t ) => t.description );

	// Layout wrapper: whatever `lib/index.js` default-exports (ticket 0124).
	const ident = exportedIdent( indexSrc );
	const wrapperFile = ident ? importedFile( indexSrc, ident ) : null;
	const signatures = [];
	if ( wrapperFile && wrapperFile !== 'ndarray' ) {
		const wsrc = read( join( ROOT, dir, 'lib', wrapperFile + '.js' ) ) || '';
		const s = signature( ctx, 'layout', join( dir, 'lib', wrapperFile + '.js' ), exportedIdent( wsrc ) || name );
		if ( s ) {
			signatures.push( s );
		}
	}
	const nsrc = read( join( ROOT, dir, 'lib', 'ndarray.js' ) ) || '';
	const ns = signature( ctx, 'ndarray', join( dir, 'lib', 'ndarray.js' ), exportedIdent( nsrc ) || name );
	if ( ns ) {
		if ( !wrapperFile || wrapperFile === 'ndarray' ) {
			ns.call = name;
		}
		signatures.push( ns );
	}

	const pkgJson = JSON.parse( read( join( ROOT, dir, 'package.json' ) ) || '{}' );
	let description = ( mdoc.description || '' ).trim() || signatures.map( ( s ) => s.description.trim() ).find( Boolean ) || '';
	if ( !description ) {
		ctx.health.push({ 'code': 'no-summary', 'where': dir, 'message': 'no description in the JSDoc of lib/index.js, the wrapper or ndarray.js (fell back to package.json)' });
		description = pkgJson.description || '';
	}
	const summary = firstSentence( description );
	const sp = H.summaryProblem({ description, 'tags': [] });
	if ( sp ) {
		ctx.health.push({ 'code': 'summary', 'where': dir, 'message': sp });
	}
	const examples = moduleExamples.concat( ...signatures.map( ( s ) => s.examples ) );
	if ( examples.length === 0 ) {
		ctx.health.push({ 'code': 'no-example', 'where': dir, 'message': 'no @example anywhere in lib/' });
	} else if ( examples.some( ( e ) => H.exampleProblem( e ) ) ) {
		ctx.health.push({ 'code': 'example-commonjs', 'where': dir, 'message': '@example uses CommonJS `require`; the package is ESM' });
	}
	if ( !spec ) {
		ctx.health.push({ 'code': 'no-spec', 'where': 'spec/' + name + '.json', 'message': 'no spec; intents, shapes and checks are unavailable' });
	}

	// Call graph from base.js imports:
	const baseSrc = read( join( ROOT, dir, 'lib', 'base.js' ) ) || '';
	const uses = [ ...new Set( [ ...baseSrc.matchAll( /from\s+'[./]*(?:(?:blas|lapack|arpack)\/base\/)?(\w+)\/lib\/(?:base|ndarray|main|index)\.js'/g ) ].map( ( m ) => m[ 1 ] ).filter( ( n ) => n !== name ) ) ].sort();

	const exportKey = './' + pkg + '/base/' + name;
	return {
		name,
		'package': pkg,
		'path': dir,
		'importPath': PACKAGE_JSON.exports && PACKAGE_JSON.exports[ exportKey ] ? PACKAGE_JSON.name + '/' + pkg + '/base/' + name : null,
		summary,
		description,
		'precision': precision( name ),
		'group': classify( pkg, name, spec ),
		'stem': stem( name ),
		'fortran': spec ? { 'signature': fortranSignature( spec ), 'kind': spec.kind } : null,
		'returns': spec ? spec.returns : null,
		'quickReturn': spec ? ( spec.quickReturn || [] ).map( ( q ) => q.js || q.fortran ) : [],
		signatures,
		examples,
		uses,
		'usedBy': [],
		'siblings': [],
		'health': ctx.health
	};
}

/**
* Extracts the IR for every routine under `lib/<pkg>/base/`.
*
* @param {Object} [opts] - options
* @param {Array<string>} [opts.only] - restrict to these routine names
* @returns {Array<Object>} routine IRs, sorted by name
*/
export function extractAll( opts = {} ) {
	const out = [];
	for ( const pkg of [ 'blas', 'lapack', 'arpack' ] ) {
		const base = join( ROOT, 'lib', pkg, 'base' );
		if ( !existsSync( base ) ) {
			continue;
		}
		for ( const name of readdirSync( base ).sort() ) {
			if ( opts.only && !opts.only.includes( name ) ) {
				continue;
			}
			if ( existsSync( join( base, name, 'lib', 'index.js' ) ) ) {
				out.push( extractRoutine( pkg, name ) );
			}
		}
	}
	// Cross-links: reverse call graph and precision siblings.
	const byName = new Map( out.map( ( r ) => [ r.name, r ] ) );
	const byStem = new Map();
	for ( const r of out ) {
		r.uses = r.uses.filter( ( u ) => byName.has( u ) );
		for ( const u of r.uses ) {
			byName.get( u ).usedBy.push( r.name );
		}
		const k = r.package + ':' + r.stem;
		byStem.set( k, ( byStem.get( k ) || [] ).concat( r.name ) );
	}
	for ( const r of out ) {
		r.siblings = byStem.get( r.package + ':' + r.stem ).filter( ( n ) => n !== r.name );
		r.usedBy.sort();
	}
	return out;
}

export { ROOT, PACKAGE_JSON };
