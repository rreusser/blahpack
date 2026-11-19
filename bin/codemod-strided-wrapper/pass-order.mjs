// Pass 2: add `order` to strided wrappers that take a matrix (CONVENTIONS D1).
//
// For each `<routine>.js` whose strided projection starts with `order` but whose
// signature does not:
//   * prepend `order` (+ JSDoc, `isLayout` validation, argument ordinals +1);
//   * rename leading-dimension params to the projected spelling (`ldv` → `LDV`);
//   * make each 2-D matrix's two base-call strides order-aware:
//       column-major → (1, LD), row-major → (LD, 1)
//     whether the wrapper passed them inline (`A, 1, LDA, 0`) or via constants
//     (`const sa1 = 1; const sa2 = LDA;`);
//   * guard each existing column-major LD validation `LD < max( 1, rows )` with
//     `order === 'column-major'` and add the row-major counterpart
//     `LD < max( 1, cols )`, where `cols` is the matrix's second Fortran
//     dimension (data/fortran-signatures.json) mapped to the wrapper's params;
//   * routines whose only matrices are packed (no LD) accept `order` but reject
//     'row-major': the packed array is LAPACK column-major packed storage.
// Call sites get `'column-major'` inserted, reproducing prior behavior exactly.
//
// Anything not matching these shapes is skipped and listed for the residue.
//
// Usage: node bin/codemod-strided-wrapper/pass-order.mjs [--dry] [routine...]

import fs from 'node:fs';
import path from 'node:path';
import * as walk from 'acorn-walk';
import { ROOT, loadModules, parse, findCallSites, buildMapping, callEdit, applyEdits, rewriteTextCalls, ordinal, isStride, isOffset } from './lib.mjs';

const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const only = argv.filter( ( a ) => !a.startsWith( '--' ) );
const FSIG = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-signatures.json' ), 'utf8' ) );

const ORD = [];
for ( let i = 1; i <= 40; i++ ) {
	ORD.push( ordinal( i ) );
}

function esc( s ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

// Shift every `<Ordinal> argument` mention by +1 (error strings, @throws).
function shiftOrdinals( s ) {
	const re = new RegExp( '\\b(' + ORD.slice().sort( ( a, b ) => b.length - a.length ).map( esc ).join( '|' ) + ')( argument)', 'gi' );
	return s.replace( re, ( all, w, rest ) => {
		const i = ORD.findIndex( ( o ) => o.toLowerCase() === w.toLowerCase() );
		if ( i === -1 || i + 1 >= ORD.length ) {
			return all;
		}
		let n = ORD[ i + 1 ];
		if ( w[ 0 ] === w[ 0 ].toLowerCase() ) {
			n = n[ 0 ].toLowerCase() + n.slice( 1 );
		}
		return n + rest;
	});
}

// Second Fortran dimension of argument `name` of `routine`, as a JS expression
// over the wrapper params, or null.
function colsExpr( routine, name, params ) {
	const sig = FSIG[ routine ];
	if ( !sig ) {
		return null;
	}
	const arg = sig.arguments.find( ( a ) => a.name.toLowerCase() === name.toLowerCase() );
	if ( !arg ) {
		return null;
	}
	const m = /dimension\s*\((.*)\)\s*$/i.exec( arg.type );
	if ( !m ) {
		return null;
	}
	// Split at top-level commas.
	const parts = [];
	let depth = 0;
	let cur = '';
	for ( const c of m[ 1 ] ) {
		if ( c === '(' ) {
			depth += 1;
		} else if ( c === ')' ) {
			depth -= 1;
		} else if ( c === ',' && depth === 0 ) {
			parts.push( cur.trim() );
			cur = '';
			continue;
		}
		cur += c;
	}
	parts.push( cur.trim() );
	if ( parts.length !== 2 ) {
		return null;
	}
	const e = parts[ 1 ];
	if ( !/^[A-Za-z0-9_+\-* ]+$/.test( e ) || e.includes( '**' ) ) {
		return null;
	}
	const lower = params.map( ( p ) => p.toLowerCase() );
	let ok = true;
	const js = e.replace( /[A-Za-z_][A-Za-z0-9_]*/g, ( id ) => {
		const j = lower.indexOf( id.toLowerCase() );
		if ( j === -1 ) {
			ok = false;
			return id;
		}
		return params[ j ];
	});
	if ( !ok ) {
		return null;
	}
	return js.replace( /\s+/g, '' ).replace( /([+\-*])/g, ' $1 ' );
}

const ORDER_CHECK = ( tab ) => tab + 'if ( !isLayout( order ) ) {\n' + tab + '\tthrow new TypeError( format( \'invalid argument. First argument must be a valid order. Value: `%s`.\', order ) );\n' + tab + '}\n';
const PACKED_CHECK = ( tab ) => tab + 'if ( order === \'row-major\' ) {\n' + tab + '\tthrow new TypeError( format( \'invalid argument. First argument must be \\\'column-major\\\'; packed storage is LAPACK column-major packed. Value: `%s`.\', order ) );\n' + tab + '}\n';

function transform( m ) {
	let src = fs.readFileSync( m.wrapper, 'utf8' );
	const why = [];

	// --- LD renames to projected spelling.
	const want = m.want.slice( 1 );
	const got = m.got.slice();
	const wantLower = new Map( want.map( ( p ) => [ p.toLowerCase(), p ] ) );
	const renames = [];
	got.forEach( ( p, i ) => {
		const w = wantLower.get( p.toLowerCase() );
		if ( w && w !== p && /^ld/i.test( p ) ) {
			renames.push( [ p, w ] );
			got[ i ] = w;
		}
	});
	for ( const [ a, b ] of renames ) {
		if ( new RegExp( '\\b' + esc( b ) + '\\b' ).test( src ) ) {
			return { residue: 'rename clash ' + a + '→' + b };
		}
		src = src.replace( new RegExp( '\\b' + esc( a ) + '\\b', 'g' ), b );
	}

	// --- Matrices of base: [ { name, i } ] for P, s1, s2, off groups.
	const mats = [];
	for ( let i = 0; i < m.base.length; i++ ) {
		if ( isStride( m.base[ i + 1 ] || '' ) && isStride( m.base[ i + 2 ] || '' ) && isOffset( m.base[ i + 3 ] || '' ) ) {
			mats.push( { name: m.base[ i ], i } );
		}
	}
	const ldMats = mats.filter( ( x ) => !/^[a-z]?work[a-z0-9]*$/i.test( x.name ) );

	// --- AST: base calls.
	let ast;
	try {
		ast = parse( src );
	} catch ( e ) {
		return { residue: 'parse: ' + e.message };
	}
	const calls = [];
	walk.simple( ast, {
		CallExpression( n ) {
			if ( n.callee.type === 'Identifier' && n.callee.name === 'base' ) {
				calls.push( n );
			}
		}
	});
	if ( !calls.length ) {
		return { residue: 'no base call' };
	}
	const fn = ast.body.find( ( n ) => n.type === 'FunctionDeclaration' && n.id.name === m.fn );
	if ( !fn ) {
		return { residue: 'no function decl' };
	}

	const edits = [];
	const consts = new Map(); // const name → { kind: 1 | 'LD', ld }
	const inlineDecls = [];
	for ( const call of calls ) {
		if ( call.arguments.length !== m.base.length ) {
			return { residue: 'base call arity ' + call.arguments.length + ' != ' + m.base.length };
		}
		for ( const mt of ldMats ) {
			const ld = 'LD' + mt.name.toUpperCase();
			if ( !got.some( ( p ) => p === ld ) ) {
				return { residue: 'no LD param ' + ld };
			}
			const a1 = call.arguments[ mt.i + 1 ];
			const a2 = call.arguments[ mt.i + 2 ];
			if ( a1.type === 'Literal' && a1.value === 1 && a2.type === 'Identifier' && a2.name === ld ) {
				const n1 = 's' + mt.name.toLowerCase() + '1';
				const n2 = 's' + mt.name.toLowerCase() + '2';
				if ( !inlineDecls.some( ( d ) => d.n1 === n1 ) ) {
					if ( new RegExp( '\\b(' + n1 + '|' + n2 + ')\\b' ).test( src ) ) {
						return { residue: 'stride name clash ' + n1 };
					}
					inlineDecls.push( { n1, n2, ld } );
				}
				edits.push( { start: a1.start, end: a2.end, text: n1 + ', ' + n2 } );
			} else if ( a1.type === 'Identifier' && a2.type === 'Identifier' ) {
				consts.set( a1.name, { kind: 1, ld } );
				consts.set( a2.name, { kind: 'LD', ld } );
			} else {
				return { residue: 'matrix ' + mt.name + ' strides `' + src.slice( a1.start, a2.end ) + '`' };
			}
		}
	}
	src = applyEdits( src, edits );

	// Constants: exactly one assignment each, to 1 / LD.
	for ( const [ name, c ] of consts ) {
		const assigns = src.match( new RegExp( '(^|[^.\\w$])' + esc( name ) + ' = [^;\\n]*;', 'g' ) ) || [];
		if ( assigns.length !== 1 ) {
			return { residue: 'stride const ' + name + ' assigned ' + assigns.length + 'x' };
		}
		const rhs = /= ([^;]*);/.exec( assigns[ 0 ] )[ 1 ].trim();
		const exp = c.kind === 1 ? '1' : c.ld;
		if ( rhs !== exp ) {
			return { residue: 'stride const ' + name + ' = ' + rhs };
		}
		const tern = c.kind === 1 ? '( order === \'column-major\' ) ? 1 : ' + c.ld : '( order === \'column-major\' ) ? ' + c.ld + ' : 1';
		src = src.replace( new RegExp( '((?:^|[^.\\w$])' + esc( name ) + ' = )' + esc( rhs ) + ';' ), '$1' + tern + ';' );
	}

	// --- LD validations.
	const params = [ 'order' ].concat( got );
	for ( const mt of ldMats ) {
		const ld = 'LD' + mt.name.toUpperCase();
		const blockRe = new RegExp( '\\n(\\t+)if \\( ' + esc( ld ) + ' < ([^\\n]*) \\) \\{\\n(\\t+throw [^\\n]*)\\n\\1\\}', 'g' );
		let found = 0;
		src = src.replace( blockRe, ( all, tab, cond, thr ) => {
			found += 1;
			const out = '\n' + tab + 'if ( order === \'column-major\' && ' + ld + ' < ' + cond + ' ) {\n' + thr + '\n' + tab + '}';
			const mm = /^max\( 1, (.+) \)$/.exec( cond );
			const cols = colsExpr( m.routine, mt.name, params );
			if ( !mm || !cols ) {
				why.push( 'no row-major LD check for ' + ld + ( cols ? '' : ' (cols unmappable)' ) );
				return out;
			}
			const rows = mm[ 1 ];
			let thr2 = thr.replace( 'max(1,' + rows.replace( /\s+/g, '' ) + ')', 'max(1,' + cols.replace( /\s+/g, '' ) + ')' );
			if ( thr2 === thr ) {
				thr2 = thr.replace( /max\(1,[^)]*\)/, 'max(1,' + cols.replace( /\s+/g, '' ) + ')' );
			}
			return '\n' + tab + 'if ( order === \'row-major\' && ' + ld + ' < max( 1, ' + cols + ' ) ) {\n' + thr2 + '\n' + tab + '}' + out;
		});
		if ( !found ) {
			why.push( 'no LD validation for ' + ld );
		}
		// A `if ( LD < … ) {` that the block regex did not cover (multi-line, compound).
		const residual = new RegExp( 'if \\( ' + esc( ld ) + ' < ' ).test( src );
		if ( residual ) {
			return { residue: 'unguarded LD validation shape for ' + ld };
		}
	}

	// --- Signature.
	src = src.replace( new RegExp( '(function\\s+' + m.fn + '\\s*\\()[^)]*\\)' ), '$1 ' + params.join( ', ' ) + ' )' );

	// --- Ordinals (+1) everywhere they name an argument position.
	src = shiftOrdinals( src );

	// --- Body: order validation (+ packed rejection, + inline stride decls)
	// right after leading `let` declarations / blank lines.
	const fnStart = src.search( new RegExp( 'function\\s+' + m.fn + '\\s*\\(' ) );
	const braceIdx = src.indexOf( '{', src.indexOf( ')', fnStart ) );
	let pos = src.indexOf( '\n', braceIdx ) + 1;
	for ( ;; ) {
		const lineEnd = src.indexOf( '\n', pos );
		const line = src.slice( pos, lineEnd );
		if ( /^\s*$/.test( line ) || /^\s*let [^=]*;\s*$/.test( line ) ) {
			pos = lineEnd + 1;
			continue;
		}
		break;
	}
	let ins = ORDER_CHECK( '\t' );
	if ( !ldMats.length ) {
		ins += PACKED_CHECK( '\t' );
	}
	for ( const d of inlineDecls ) {
		ins += '\tconst ' + d.n1 + ' = ( order === \'column-major\' ) ? 1 : ' + d.ld + ';\n';
		ins += '\tconst ' + d.n2 + ' = ( order === \'column-major\' ) ? ' + d.ld + ' : 1;\n';
	}
	// Keep a blank line between the declarations and the first statement.
	const prev = src.slice( 0, pos );
	const needBlank = /let [^=]*;\n$/.test( prev );
	src = prev + ( needBlank ? '\n' : '' ) + ins + src.slice( pos );

	// --- JSDoc.
	const jsStart = src.lastIndexOf( '/**', fnStart );
	let jsdoc = src.slice( jsStart, src.indexOf( '*/', jsStart ) + 2 );
	const origJsdoc = jsdoc;
	for ( const [ a, b ] of renames ) {
		jsdoc = jsdoc.replace( new RegExp( '\\b' + esc( a ) + '\\b', 'g' ), b );
	}
	jsdoc = jsdoc.replace( /\n\* @param/, '\n* @param {string} order - storage layout (\'row-major\' or \'column-major\')\n* @param' );
	if ( !/@param \{string\} order/.test( jsdoc ) ) {
		return { residue: 'no @param in JSDoc' };
	}
	const throwLine = '* @throws {TypeError} first argument must be a valid order';
	if ( /\n\* @throws/.test( jsdoc ) ) {
		jsdoc = jsdoc.replace( /\n\* @throws/, '\n' + throwLine + '\n* @throws' );
	} else {
		jsdoc = jsdoc.replace( /\n\* @returns/, '\n' + throwLine + '\n* @returns' );
	}
	src = src.slice( 0, jsStart ) + jsdoc + src.slice( jsStart + origJsdoc.length );
	src = src.replace( /(\/\*\*[\s\S]*?\*\/)/g, ( c ) => rewriteTextCalls( c, m.fn, m.got, params, ( p ) => ( p === 'order' ? '\'column-major\'' : null ) ) );

	// --- Imports.
	const addImport = ( local, spec ) => {
		if ( new RegExp( 'import ' + local + ' from' ).test( src ) ) {
			return;
		}
		src = src.replace( /(\/\/ MODULES \/\/\n\n)/, '$1import ' + local + ' from \'' + spec + '\';\n' );
	};
	addImport( 'format', '@stdlib/string/format/lib/index.js' );
	addImport( 'isLayout', '@stdlib/blas/base/assert/is-layout/lib/index.js' );
	if ( /(^|[^.\w])max\( /m.test( src ) ) {
		addImport( 'max', '@stdlib/math/base/special/fast/max/lib/index.js' );
	}
	if ( !/\/\/ MODULES \/\//.test( src ) ) {
		return { residue: 'no MODULES section' };
	}
	return { src, params, why };
}

const modules = loadModules();
const changed = [];
const skipped = [];
const notes = [];
for ( const m of modules ) {
	if ( m.ok || ( only.length && !only.includes( m.routine ) ) ) {
		continue;
	}
	if ( m.want[ 0 ] !== 'order' || m.got[ 0 ] === 'order' ) {
		continue;
	}
	const r = transform( m );
	if ( r.residue ) {
		skipped.push( m.routine + ': ' + r.residue );
		continue;
	}
	m.newSrc = r.src;
	m.newParams = r.params;
	changed.push( m );
	for ( const w of r.why ) {
		notes.push( m.routine + ': ' + w );
	}
}

let problems = 0;
const sites = findCallSites( changed );
const wrapperFiles = new Set( changed.map( ( m ) => m.wrapper ) );
const fileEdits = new Map();
let ncalls = 0;
let nlen = 0;
for ( const [ file, bindings ] of sites ) {
	if ( wrapperFiles.has( file ) ) {
		console.error( 'CALL SITE INSIDE CHANGED WRAPPER ' + path.relative( ROOT, file ) );
		problems += 1;
		continue;
	}
	const src = fs.readFileSync( file, 'utf8' );
	const edits = [];
	for ( const b of bindings ) {
		const m = b.module;
		const mapping = buildMapping( m.got, m.newParams, ( p ) => {
			if ( p === 'order' ) {
				return '\'column-major\'';
			}
			throw new Error( m.routine + ': cannot insert ' + p );
		});
		for ( const c of b.calls ) {
			edits.push( callEdit( src, c, mapping ) );
			ncalls += 1;
		}
		for ( const sp of b.spreads ) {
			console.error( 'SPREAD call in ' + path.relative( ROOT, file ) + ' for ' + m.routine );
			problems += 1;
		}
		for ( const L of b.lengths ) {
			const after = src.slice( L.end, L.end + 20 );
			const mm = /^(\s*,\s*)(\d+)/.exec( after );
			if ( mm && Number( mm[ 2 ] ) === m.got.length ) {
				edits.push( { start: L.end + mm[ 1 ].length, end: L.end + mm[ 0 ].length, text: String( m.newParams.length ) } );
				nlen += 1;
			}
		}
	}
	fileEdits.set( file, applyEdits( src, edits ) );
}

console.log( 'wrappers: ' + changed.length + ', calls: ' + ncalls + ', arity asserts: ' + nlen + ', problems: ' + problems + ', skipped: ' + skipped.length );
for ( const s of skipped ) {
	console.log( '  SKIP ' + s );
}
for ( const s of notes ) {
	console.log( '  NOTE ' + s );
}
if ( !DRY ) {
	for ( const m of changed ) {
		fs.writeFileSync( m.wrapper, m.newSrc );
	}
	for ( const [ file, src ] of fileEdits ) {
		fs.writeFileSync( file, src );
	}
}
