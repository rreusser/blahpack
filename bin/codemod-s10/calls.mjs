// Rewrite every call site of the migrating routines to the S10 form.
//
// Call sites are found by resolving imports (base.js, ndarray.js, <r>.js,
// main.js, index.js; `.ndarray` member calls on the latter two). For each
// call, the argument list is remapped by name from the old to the new
// parameter list; each output scalar gets a caller-side length-1 array, and
// the places that read the output are rewritten:
//
//   res = f( ... ); … res.ilo …          → f( …, ilo, … ); … ilo[ 0 ] …
//   f( …, out ); … out[ 1 ] …             → f( …, c, s, r ); … s[ 0 ] …
//   f( …, out ); … out.M …                → f( …, M, … ); … M[ 0 ] …
//
// A result that escapes (passed whole to a helper, compared as an object) is
// rebuilt in its old shape right after the call, so the caller's behavior is
// unchanged: `res = { 'info': f( … ), 'ilo': ilo[ 0 ], … }`; a packed Float64
// `out` container is passed as `out.subarray( k, k + 1 )` views.
//
// In-out scalars passed by value (`g` of dlasq4) are copied into their array
// before the call: `g[ 0 ] = <old argument>;`.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, parse, buildMapping } from '../codemod-strided-wrapper/lib.mjs';
import { annotate, walkParents, isFunction, isReference, usedNames, lineIndent, finalize, render, enclosingFunction } from './edits.mjs';
import { isComplex } from './forms.mjs';
import { arrayType, offsetName } from './plan.mjs';

const SKIP_DIRS = new Set( [ 'node_modules', '.git', 'data', 'fixtures', 'coverage', 'dist' ] );
const IMPORT_C128 = 'import Complex128Array from \'@stdlib/array/complex128/lib/index.js\';';
const IMPORT_REINTERPRET = 'import reinterpret from \'@stdlib/strided/base/reinterpret-complex128/lib/index.js\';';

function listSources( dir, out ) {
	for ( const e of fs.readdirSync( dir ) ) {
		if ( SKIP_DIRS.has( e ) ) {
			continue;
		}
		const full = path.join( dir, e );
		const st = fs.statSync( full );
		if ( st.isDirectory() ) {
			listSources( full, out );
		} else if ( /\.(m?js)$/.test( e ) ) {
			out.push( full );
		}
	}
	return out;
}

export function allSources() {
	const files = [];
	for ( const d of [ 'lib', 'test', 'bench', 'examples', 'notebooks' ] ) {
		const full = path.join( ROOT, d );
		if ( fs.existsSync( full ) ) {
			listSources( full, files );
		}
	}
	return files;
}

// entry file → { plan, kind } where kind is the default export's form.
function entryIndex( plans ) {
	const idx = new Map();
	for ( const P of plans ) {
		const lib = path.join( P.dir, 'lib' );
		idx.set( path.join( lib, 'base.js' ), { P, kind: 'base' } );
		idx.set( path.join( lib, 'ndarray.js' ), { P, kind: 'ndarray' } );
		idx.set( path.join( lib, P.routine + '.js' ), { P, kind: 'strided' } );
		idx.set( path.join( lib, 'main.js' ), { P, kind: 'strided', hasNdarray: true } );
		idx.set( path.join( lib, 'index.js' ), { P, kind: 'strided', hasNdarray: true } );
	}
	return idx;
}

function lists( P, kind ) {
	if ( kind === 'base' ) {
		return [ P.oldBase, P.newBase ];
	}
	if ( kind === 'ndarray' ) {
		return [ P.oldNd || P.oldBase, P.newNd || P.newBase ];
	}
	return [ P.oldStrided, P.newStrided ];
}

function lc( s ) {
	return s.toLowerCase();
}

// References to `name` in function `fn` (not crossing a rebinding function).
function refsIn( fn, name ) {
	const refs = [];
	walkParents( fn.body || fn, ( n ) => {
		if ( n !== fn && isFunction( n ) && n.params.some( ( p ) => p.type === 'Identifier' && p.name === name ) ) {
			return false;
		}
		if ( n.type === 'Identifier' && n.name === name && isReference( n ) ) {
			refs.push( n );
		}
		return true;
	});
	return refs;
}

function statementOf( node ) {
	let n = node;
	while ( n.__parent && !( n.__parent.type === 'BlockStatement' || n.__parent.type === 'Program' || n.__parent.type === 'SwitchCase' ) ) {
		n = n.__parent;
	}
	return n;
}

export class FileRewriter {
	constructor( file, plansByEntry, selfPlans ) {
		this.file = file;
		this.src = fs.readFileSync( file, 'utf8' );
		this.ast = annotate( parse( this.src ) );
		this.edits = [];
		this.problems = [];
		this.taken = usedNames( this.ast );
		this.alloc = new Map(); // fnNode → Map(key → { name, decl })
		this.containers = new Set();
		this.plansByEntry = plansByEntry;
		this.selfPlans = selfPlans; // plans whose base.js / wrappers this file is
		this.needC128 = false;
		this.needReinterpret = false;
		this.changed = false;
		this.dropIfUnused = [];
		this.warnings = [];
		for ( const S of selfPlans ) {
			if ( path.join( S.dir, 'lib', 'base.js' ) === file ) {
				Object.values( S.pname ).forEach( ( n ) => this.taken.add( n ) );
			}
		}
	}

	line( pos ) {
		return this.src.slice( 0, pos ).split( '\n' ).length;
	}

	problem( msg, node ) {
		this.problems.push( path.relative( ROOT, this.file ) + ':' + this.line( node.start ) + ': ' + msg );
	}

	// Caller-side array for output `p`, keyed by (function, key).
	arrayFor( fn, key, p ) {
		const scope = fn || this.ast;
		if ( !this.alloc.has( scope ) ) {
			this.alloc.set( scope, new Map() );
		}
		const m = this.alloc.get( scope );
		if ( m.has( key ) ) {
			return m.get( key ).name;
		}
		const base = p.name;
		const cands = [ base, base + 'Out' ];
		for ( let i = 2; i < 20; i++ ) {
			cands.push( base + 'Out' + i );
		}
		if ( !this.scopeTaken ) {
			this.scopeTaken = new Map();
		}
		if ( !this.scopeTaken.has( scope ) ) {
			this.scopeTaken.set( scope, new Set() );
		}
		const st = this.scopeTaken.get( scope );
		const name = cands.find( ( c ) => !this.taken.has( c ) && !st.has( c ) );
		st.add( name );
		const t = arrayType( p );
		const decls = [ 'const ' + name + ' = new ' + t + '( 1 );' ];
		if ( isComplex( p ) ) {
			this.needC128 = true;
			this.needReinterpret = true;
			st.add( name + 'v' );
			decls.push( 'const ' + name + 'v = reinterpret( ' + name + ', 0 );' );
		}
		m.set( key, { name, decls } );
		return name;
	}

	importBindings() {
		const out = [];
		for ( const node of this.ast.body ) {
			if ( node.type !== 'ImportDeclaration' || !node.source.value.startsWith( '.' ) ) {
				continue;
			}
			const target = path.resolve( path.dirname( this.file ), node.source.value );
			const e = this.plansByEntry.get( target );
			if ( !e ) {
				continue;
			}
			// A module's own main.js / index.js re-export; never call.
			if ( path.dirname( this.file ) === path.join( e.P.dir, 'lib' ) && /^(main|index)\.js$/.test( path.basename( this.file ) ) ) {
				continue;
			}
			for ( const s of node.specifiers ) {
				if ( s.type === 'ImportDefaultSpecifier' ) {
					out.push( { local: s.local.name, ...e } );
				}
			}
		}
		return out;
	}

	run() {
		const bindings = this.importBindings();
		if ( !bindings.length ) {
			return false;
		}
		const byName = new Map( bindings.map( ( b ) => [ b.local, b ] ) );
		// Module-level aliases: `const dgeevx = ndarrayFn;`.
		for ( const node of this.ast.body ) {
			if ( node.type === 'VariableDeclaration' ) {
				for ( const d of node.declarations ) {
					if ( d.id.type === 'Identifier' && d.init && d.init.type === 'Identifier' && byName.has( d.init.name ) ) {
						byName.set( d.id.name, { ...byName.get( d.init.name ), local: d.id.name } );
					}
				}
			}
		}
		// Routines passed as an argument: `function callX( mod, … ) { mod( … ) }`
		// where every call of callX passes the same migrating routine's
		// base/ndarray entry (same signature) in that position.
		const paramBindings = new Map(); // fn node → Map(param name → binding)
		const fnDecls = new Map();
		walkParents( this.ast, ( n ) => {
			if ( n.type === 'FunctionDeclaration' ) {
				fnDecls.set( n.id.name, n );
			}
			return true;
		});
		const callsOf = new Map();
		walkParents( this.ast, ( n ) => {
			if ( n.type === 'CallExpression' && n.callee.type === 'Identifier' && fnDecls.has( n.callee.name ) ) {
				if ( !callsOf.has( n.callee.name ) ) {
					callsOf.set( n.callee.name, [] );
				}
				callsOf.get( n.callee.name ).push( n );
			}
			return true;
		});
		for ( const [ fname, fnode ] of fnDecls ) {
			const cs = callsOf.get( fname ) || [];
			fnode.params.forEach( ( prm, i ) => {
				if ( prm.type !== 'Identifier' || !cs.length ) {
					return;
				}
				const bs = cs.map( ( c ) => c.arguments[ i ] && c.arguments[ i ].type === 'Identifier' && byName.get( c.arguments[ i ].name ) );
				if ( bs.some( ( b ) => !b ) ) {
					return;
				}
				const sig = ( b ) => JSON.stringify( lists( b.P, b.kind ) );
				if ( bs.some( ( b ) => b.P !== bs[ 0 ].P || sig( b ) !== sig( bs[ 0 ] ) ) ) {
					return;
				}
				if ( !paramBindings.has( fnode ) ) {
					paramBindings.set( fnode, new Map() );
				}
				paramBindings.get( fnode ).set( prm.name, { ...bs[ 0 ], local: prm.name } );
			});
		}
		const paramBinding = ( node, name ) => {
			let fn = enclosingFunction( node );
			while ( fn ) {
				if ( fn.params.some( ( q ) => q.type === 'Identifier' && q.name === name ) ) {
					return paramBindings.has( fn ) ? paramBindings.get( fn ).get( name ) || null : null;
				}
				fn = enclosingFunction( fn );
			}
			return null;
		};
		const calls = [];
		walkParents( this.ast, ( n ) => {
			if ( n.type === 'CallExpression' && n.callee.type === 'Identifier' && !byName.has( n.callee.name ) ) {
				const pb = paramBinding( n, n.callee.name );
				if ( pb ) {
					calls.push( { node: n, b: pb, kind: pb.kind } );
				}
			}
			if ( n.type === 'CallExpression' ) {
				if ( n.callee.type === 'Identifier' && byName.has( n.callee.name ) && !paramBinding( n, n.callee.name ) ) {
					calls.push( { node: n, b: byName.get( n.callee.name ), kind: byName.get( n.callee.name ).kind } );
				} else if ( n.callee.type === 'MemberExpression' && !n.callee.computed && n.callee.object.type === 'Identifier' && byName.has( n.callee.object.name ) && n.callee.property.name === 'ndarray' && byName.get( n.callee.object.name ).hasNdarray ) {
					calls.push( { node: n, b: byName.get( n.callee.object.name ), kind: 'ndarray' } );
				}
			}
			if ( n.type === 'MemberExpression' && !n.computed && n.object.type === 'Identifier' && byName.has( n.object.name ) && n.property.name === 'length' ) {
				this.lengthRef( n, byName.get( n.object.name ) );
			}
			return true;
		});
		this.waveCalls = new Set( calls.map( ( c ) => c.node ) );
		for ( const c of calls ) {
			this.rewriteCall( c );
		}
		return this.changed;
	}

	lengthRef( n, b ) {
		// `fn.length` arity assertions: `assert.strictEqual( fn.length, 3, … )`.
		const p = n.__parent;
		if ( p.type === 'CallExpression' && p.arguments[ 0 ] === n && p.arguments[ 1 ] && p.arguments[ 1 ].type === 'Literal' ) {
			const [ oldL, newL ] = lists( b.P, b.kind );
			if ( oldL && newL && p.arguments[ 1 ].value === oldL.length ) {
				this.edits.push( { start: p.arguments[ 1 ].start, end: p.arguments[ 1 ].end, text: String( newL.length ) } );
				this.changed = true;
			}
		}
	}

	// Is this call inside the routine's own wrapper (ndarray.js / <r>.js)
	// calling base, so outputs pass straight through by name?
	isOwnWrapper( b ) {
		const lib = path.join( b.P.dir, 'lib' );
		return path.dirname( this.file ) === lib && ( path.basename( this.file ) === 'ndarray.js' || path.basename( this.file ) === b.P.routine + '.js' );
	}

	// The migrating routine whose main function encloses `node` in this file
	// (this file being that routine's base.js), or null.
	selfPlanAt( node ) {
		for ( const S of this.selfPlans ) {
			if ( path.join( S.dir, 'lib', 'base.js' ) !== this.file ) {
				continue;
			}
			let fn = enclosingFunction( node );
			while ( fn ) {
				if ( fn.type === 'FunctionDeclaration' && fn.id.name === S.fn ) {
					return S;
				}
				fn = enclosingFunction( fn );
			}
		}
		return null;
	}

	rewriteCall( c ) {
		const { node } = c;
		const P = c.b.P;
		const [ oldL, newL ] = lists( P, c.kind );
		if ( !oldL || !newL ) {
			this.problem( 'no signature for ' + c.kind, node );
			return;
		}
		if ( node.arguments.some( ( a ) => a.type === 'SpreadElement' ) ) {
			this.problem( 'spread call of ' + P.routine, node );
			return;
		}
		const nargs = node.arguments.length;
		let truncated = false;
		if ( nargs !== oldL.length ) {
			if ( nargs === newL.length && oldL.length !== newL.length ) {
				return; // already migrated
			}
			if ( nargs < oldL.length && nargs > 0 ) {
				// Trailing arguments omitted (argument-validation tests): map
				// the given ones by name; trailing omissions stay omitted.
				truncated = true;
			}
		}
		if ( nargs !== oldL.length && !truncated ) {
			// Not a call of the old signature (argument-validation tests with
			// too few args, or an example that was already wrong): leave it.
			this.warnings.push( path.relative( ROOT, this.file ) + ':' + this.line( node.start ) + ': ' + P.routine + ' called with ' + nargs + ' args, old signature has ' + oldL.length + ' (left unchanged)' );
			return;
		}
		const src = this.src;
		const argText = node.arguments.map( ( a ) => src.slice( a.start, a.end ) );
		const fn = enclosingFunction( node );
		const own = this.isOwnWrapper( c.b );
		const stmt = statementOf( node );
		const pre = [];   // statements before the call statement
		const post = [];  // statements after the call statement
		const arr = {};   // output name → caller array name
		const outs = P.outs;

		// Container param (packed `out`) argument.
		const contForm = Object.values( P.form ).find( ( f ) => f.kind === 'outIndex' || f.kind === 'outField' );
		let contArg = null;
		if ( contForm ) {
			const ci = oldL.findIndex( ( x ) => lc( x ) === lc( contForm.param ) );
			contArg = node.arguments[ ci ];
		}
		const selfP = own ? null : this.selfPlanAt( node );

		// Result binding.
		const parent = node.__parent;
		let resVar = null;
		let resKind = 'other';
		if ( parent.type === 'VariableDeclarator' && parent.init === node && parent.id.type === 'Identifier' ) {
			resVar = parent.id.name;
			resKind = 'decl';
		} else if ( parent.type === 'AssignmentExpression' && parent.right === node && parent.operator === '=' && parent.left.type === 'Identifier' && parent.__parent.type === 'ExpressionStatement' ) {
			resVar = parent.left.name;
			resKind = 'assign';
		} else if ( parent.type === 'ExpressionStatement' ) {
			resKind = 'discard';
		} else if ( parent.type === 'ReturnStatement' ) {
			resKind = 'return';
		}

		// Arrays for each output.
		let contName = null;
		let contMode = null;
		if ( contArg ) {
			if ( contArg.type === 'Identifier' ) {
				contName = contArg.name;
			}
		}
		for ( const p of outs ) {
			const f = P.form[ p.name ];
			if ( own ) {
				arr[ p.name ] = P.pname[ p.name ];
				continue;
			}
			if ( ( f.kind === 'outIndex' || f.kind === 'outField' ) && selfP && contName ) {
				// Passing the caller's own packed `out` through.
				const sf = Object.entries( selfP.form ).find( ( [ , g ] ) => ( g.kind === 'outIndex' || g.kind === 'outField' ) && g.param === contName && ( ( g.kind === 'outField' && f.kind === 'outField' && lc( g.key ) === lc( f.key ) ) || ( g.kind === 'outIndex' && f.kind === 'outIndex' && g.index === f.index ) ) );
				if ( sf ) {
					arr[ p.name ] = selfP.pname[ sf[ 0 ] ];
					contMode = 'self';
					continue;
				}
			}
			// Arrays are shared by every call feeding the same container or
			// result variable through the same slot, so reads after branches
			// that call different routines (`obj = dlaev2()` / `obj = dlae2()`)
			// see whichever ran.
			let key;
			if ( contName && ( f.kind === 'outIndex' || f.kind === 'outField' ) ) {
				key = 'c:' + contName + ':' + ( f.kind === 'outIndex' ? f.index : lc( f.key ) );
			} else if ( resVar && f.kind !== 'value' ) {
				key = 'r:' + resVar + ':' + ( f.kind === 'return' ? '()' : ( f.key || f.re || p.name ) );
			} else {
				key = 'x:' + P.routine + ':' + p.name;
			}
			key += ':' + arrayType( p );
			arr[ p.name ] = this.arrayFor( fn, key, p );
		}

		// Container reads after the call.
		let contFallback = false;
		if ( contArg && !own && contMode !== 'self' && contName ) {
			const ok = this.rewriteContainerReads( fn, contName, node, P, arr, false );
			if ( !ok ) {
				contFallback = true;
			}
			this.containers.add( contName );
		}
		// The call's value WAS the container (`return out`): its reads too.
		let aliasRebuild = null;
		if ( contForm && P.retContainer && !own && resVar ) {
			const ok = this.rewriteContainerReads( fn, resVar, node, P, arr, true );
			if ( ok ) {
				aliasRebuild = 'drop';
			} else if ( contFallback ) {
				aliasRebuild = contName;
			} else if ( contForm.kind === 'outIndex' ) {
				const n = Math.max( ...outs.map( ( p ) => P.form[ p.name ].index ) ) + 1;
				const items = [];
				for ( let i = 0; i < n; i++ ) {
					const p = outs.find( ( q ) => P.form[ q.name ].index === i );
					items.push( p ? arr[ p.name ] + '[ 0 ]' : '0.0' );
				}
				aliasRebuild = 'new Float64Array( [ ' + items.join( ', ' ) + ' ] )';
			} else {
				aliasRebuild = '{ ' + outs.map( ( p ) => '\'' + P.form[ p.name ].key + '\': ' + arr[ p.name ] + '[ 0 ]' ).join( ', ' ) + ' }';
			}
		}

		// New argument list.
		const mapping = buildMapping( oldL, newL, ( name ) => {
			const p = outs.find( ( q ) => lc( q.name ) === lc( name ) || lc( P.pname[ q.name ] ) === lc( name ) );
			if ( p ) {
				return { out: p };
			}
			const cp = outs.find( ( q ) => isComplex( q ) && lc( offsetName( q ) ) === lc( name ) );
			if ( cp ) {
				return { offsetOf: cp };
			}
			throw new Error( 'no value for inserted param ' + name + ' of ' + P.routine );
		});
		let lastNew = mapping.length - 1;
		if ( truncated ) {
			lastNew = -1;
			mapping.forEach( ( m, i ) => {
				if ( m.from !== void 0 && m.from < nargs ) {
					lastNew = i;
				}
			});
		}
		const newArgs = mapping.slice( 0, lastNew + 1 ).map( ( m ) => {
			if ( m.from !== void 0 && m.from >= nargs ) {
				return 'void 0';
			}
			if ( m.from !== void 0 ) {
				const p = outs.find( ( q ) => P.form[ q.name ].kind === 'value' && lc( oldL[ m.from ] ) === lc( P.form[ q.name ].param ) );
				if ( p && !own ) {
					// By-value in/out: copy the old argument in first.
					pre.push( arr[ p.name ] + '[ 0 ] = ' + render( src, this.edits, node.arguments[ m.from ].start, node.arguments[ m.from ].end ) + ';' );
					return arr[ p.name ];
				}
				if ( p && own ) {
					return arr[ p.name ];
				}
				return render( src, this.edits, node.arguments[ m.from ].start, node.arguments[ m.from ].end );
			}
			const ins = m.insert;
			if ( ins.out && P.form[ ins.out.name ].kind === 'slot' && !own ) {
				// Strided slot `ab[ offsetAB + k*strideAB ]`: pass a view, so the
				// caller's array keeps receiving the values.
				const f = P.form[ ins.out.name ];
				const at = ( n ) => argText[ oldL.findIndex( ( x ) => lc( x ) === lc( n ) ) ];
				const off = at( f.offset );
				const st = at( f.stride );
				let i0;
				if ( /^\d+$/.test( off ) && /^\d+$/.test( st ) ) {
					i0 = String( Number( off ) + ( f.index * Number( st ) ) );
					return at( f.param ) + '.subarray( ' + i0 + ', ' + ( Number( i0 ) + 1 ) + ' )';
				}
				i0 = f.index === 0 ? off : off + ' + ' + ( f.index === 1 ? st : f.index + '*' + st );
				return at( f.param ) + '.subarray( ' + i0 + ', ' + i0 + ' + 1 )';
			}
			if ( ins.out ) {
				const p = ins.out;
				const f = P.form[ p.name ];
				if ( contFallback && f.kind === 'outIndex' && contName ) {
					const ct = argText[ oldL.findIndex( ( x ) => lc( x ) === lc( f.param ) ) ];
					return ct + '.subarray( ' + f.index + ', ' + ( f.index + 1 ) + ' )';
				}
				if ( contFallback && f.kind === 'outField' && contName ) {
					const ct = argText[ oldL.findIndex( ( x ) => lc( x ) === lc( f.param ) ) ];
					post.push( ct + '.' + f.key + ' = ' + arr[ p.name ] + '[ 0 ];' );
				}
				return arr[ p.name ];
			}
			if ( ins.offsetOf ) {
				return own && c.kind !== 'strided' ? offsetName( ins.offsetOf ) : '0';
			}
			return ins;
		});
		const open = src.indexOf( '(', node.callee.end );
		const callText = src.slice( node.start, open ) + '( ' + newArgs.join( ', ' ) + ' )';

		// Result reads.
		let replaceCall = callText;
		const hasFieldOuts = !own && outs.some( ( p ) => [ 'field', 'cfield', 'return' ].includes( P.form[ p.name ].kind ) || ( P.form[ p.name ].kind === 'value' && P.form[ p.name ].key ) );
		if ( hasFieldOuts ) {
			const res = this.rewriteResultReads( { fn, node, P, resVar, resKind, arr, callText, stmt, pre, post } );
			if ( res === null ) {
				// The rewrite placed its own edits (binding dropped / split).
				this.changed = true;
				if ( pre.length || post.length ) {
					const ind = lineIndent( src, stmt.start );
					if ( pre.length ) {
						this.edits.push( { start: stmt.start, end: stmt.start, text: pre.join( '\n' + ind ) + '\n' + ind, order: -1 } );
					}
					if ( post.length ) {
						this.edits.push( { start: stmt.end, end: stmt.end, text: '\n' + ind + post.join( '\n' + ind ), order: 1 } );
					}
				}
				return;
			}
			replaceCall = res;
		}
		if ( aliasRebuild === 'drop' ) {
			if ( resKind === 'assign' ) {
				this.edits.push( { start: node.__parent.start, end: node.__parent.end, text: callText, renders: true } );
				this.dropIfUnused.push( { name: resVar } );
			} else {
				const decl = node.__parent.__parent;
				if ( decl.declarations.length !== 1 ) {
					this.problem( 'multi-declarator result of ' + P.routine, node );
					return;
				}
				this.edits.push( { start: decl.start, end: decl.end, text: callText + ';', renders: true } );
			}
		} else if ( aliasRebuild ) {
			pre.push( callText + ';' );
			this.edits.push( { start: node.start, end: node.end, text: aliasRebuild, renders: true } );
		} else {
			this.edits.push( { start: node.start, end: node.end, text: replaceCall, renders: true } );
		}
		if ( pre.length || post.length ) {
			if ( !( stmt.__parent.type === 'BlockStatement' || stmt.__parent.type === 'Program' || stmt.__parent.type === 'SwitchCase' ) ) {
				this.problem( 'cannot insert statements around call of ' + P.routine, node );
			}
			const ind = lineIndent( src, stmt.start );
			if ( pre.length ) {
				this.edits.push( { start: stmt.start, end: stmt.start, text: pre.join( '\n' + ind ) + '\n' + ind, order: -1 } );
			}
			if ( post.length ) {
				this.edits.push( { start: stmt.end, end: stmt.end, text: '\n' + ind + post.join( '\n' + ind ), order: 1 } );
			}
		}
		this.changed = true;
	}

	// Rewrite `C[ k ]` / `C.KEY` reads that follow this call (up to the next
	// call that passes C). Returns false if C is used in a way we can't follow.
	rewriteContainerReads( fn, C, call, P, arr, byAssign ) {
		const scope = fn || this.ast;
		const refs = refsIn( scope, C );
		let segEnd = Infinity;
		if ( byAssign ) {
			// Result alias: the segment ends at the next assignment to C.
			const as = refs.filter( ( r ) => r.__parent.type === 'AssignmentExpression' && r.__parent.left === r && r.start > call.end ).map( ( r ) => r.start );
			segEnd = as.length ? Math.min( ...as ) : Infinity;
		} else {
			// Calls to migrating routines that fill C, and reassignments of C,
			// end the segment. Passing C anywhere else is an escape.
			const ends = refs.filter( ( r ) => ( r.__parent.type === 'CallExpression' && r.__parent.arguments.includes( r ) && this.waveCalls.has( r.__parent ) ) || ( r.__parent.type === 'AssignmentExpression' && r.__parent.left === r ) ).map( ( r ) => r.start ).filter( ( x ) => x > call.end );
			segEnd = ends.length ? Math.min( ...ends ) : Infinity;
		}
		const byIndex = new Map();
		const byKey = new Map();
		for ( const p of P.outs ) {
			const f = P.form[ p.name ];
			if ( f.kind === 'outIndex' ) {
				byIndex.set( f.index, arr[ p.name ] );
			} else if ( f.kind === 'outField' ) {
				byKey.set( lc( f.key ), arr[ p.name ] );
			}
		}
		const seg = refs.filter( ( r ) => r.start > call.end && r.start < segEnd && !( r.__parent.type === 'AssignmentExpression' && r.__parent.left === r ) );
		const edits = [];
		for ( const r of seg ) {
			const m = r.__parent;
			if ( m.type === 'MemberExpression' && m.object === r ) {
				if ( m.computed && m.property.type === 'Literal' && byIndex.has( m.property.value ) ) {
					edits.push( { start: m.start, end: m.end, text: byIndex.get( m.property.value ) + '[ 0 ]' } );
					continue;
				}
				if ( !m.computed && byKey.has( lc( m.property.name ) ) ) {
					edits.push( { start: m.start, end: m.end, text: byKey.get( lc( m.property.name ) ) + '[ 0 ]' } );
					continue;
				}
			}
			// Declarator / reassignment of C ends the segment's meaning; any
			// other use (whole-container compare, pass-through) escapes.
			return false;
		}
		this.edits.push( ...edits );
		return true;
	}

	rewriteResultReads( ctx ) {
		const { fn, node, P, resVar, resKind, arr, callText, stmt, pre } = ctx;
		const src = this.src;
		const outs = P.outs;
		const fieldOf = ( key ) => outs.find( ( p ) => {
			const f = P.form[ p.name ];
			return ( f.kind === 'field' || f.kind === 'value' ) && f.key === key;
		});
		const cfieldOf = ( key ) => outs.find( ( p ) => P.form[ p.name ].kind === 'cfield' && ( P.form[ p.name ].re === key || P.form[ p.name ].im === key ) );
		const retOut = outs.find( ( p ) => P.form[ p.name ].kind === 'return' );
		const readOf = ( key ) => {
			const p = fieldOf( key );
			if ( p ) {
				return arr[ p.name ] + '[ 0 ]';
			}
			const c = cfieldOf( key );
			if ( c ) {
				return arr[ c.name ] + 'v[ ' + ( P.form[ c.name ].im === key ? 1 : 0 ) + ' ]';
			}
			return null;
		};
		// Old object shape (for the fallback rebuild).
		const oldKeys = [];
		if ( P.hasInfoKey ) {
			oldKeys.push( 'info' );
		}
		for ( const p of outs ) {
			const f = P.form[ p.name ];
			if ( f.kind === 'field' || f.kind === 'value' ) {
				if ( f.key ) {
					oldKeys.push( f.key );
				}
			} else if ( f.kind === 'cfield' ) {
				oldKeys.push( f.re, f.im );
			}
		}
		const extras = P.extras;
		const infoNow = P.ret === 'info' && !extras.length;

		if ( retOut ) {
			// The call's value WAS the scalar.
			if ( resKind === 'discard' ) {
				return callText;
			}
			if ( resKind === 'decl' || resKind === 'assign' ) {
				ctx.post.unshift( resVar + ' = ' + arr[ retOut.name ] + '[ 0 ];' );
				if ( resKind === 'decl' ) {
					const decl = node.__parent.__parent;
					if ( decl.declarations.length !== 1 ) {
						this.problem( 'multi-declarator result of ' + P.routine, node );
						return null;
					}
					// `const x = f()` → `f(); const x = arr[ 0 ];`
					const ind = lineIndent( src, decl.start );
					this.edits.push( { start: decl.start, end: decl.end, text: callText + ';\n' + ind + decl.kind + ' ' + resVar + ' = ' + arr[ retOut.name ] + '[ 0 ];', renders: true } );
					ctx.post.shift();
					this.changed = true;
					return null;
				}
				// `x = f()` → `f(); x = arr[ 0 ];`
				this.edits.push( { start: node.__parent.start, end: node.__parent.end, text: callText, renders: true } );
				return null;
			}
			if ( node.__parent.type === 'AssignmentExpression' && node.__parent.operator === '=' && node.__parent.__parent.type === 'ExpressionStatement' ) {
				// `state.x = f()` → `f(); state.x = arr[ 0 ];`
				const a = node.__parent;
				const ind = lineIndent( src, stmt.start );
				this.edits.push( { start: a.start, end: a.end, text: callText + ';\n' + ind + src.slice( a.left.start, a.left.end ) + ' = ' + arr[ retOut.name ] + '[ 0 ]', renders: true } );
				return null;
			}
			// Used inline (`if ( f() > 0 )`): comma-free form needs a statement.
			this.problem( 'inline use of scalar-returning ' + P.routine, node );
			return null;
		}

		if ( resKind === 'discard' ) {
			return callText;
		}

		if ( resVar ) {
			const scope = fn || this.ast;
			const refs = refsIn( scope, resVar );
			// Assignments to resVar delimit segments.
			const assigns = refs.filter( ( r ) => ( r.__parent.type === 'AssignmentExpression' && r.__parent.left === r ) ).map( ( r ) => r.__parent.start );
			const declPos = node.__parent.type === 'VariableDeclarator' ? node.__parent.start : node.__parent.start;
			const bounds = assigns.concat( [ declPos ] ).sort( ( a, b ) => a - b );
			const nextAssign = bounds.find( ( x ) => x > declPos );
			const seg = refs.filter( ( r ) => r.start > node.end && ( nextAssign === void 0 || r.start < nextAssign ) && !( r.__parent.type === 'AssignmentExpression' && r.__parent.left === r ) );
			const edits = [];
			let escapes = false;
			let infoUses = 0;
			for ( const r of seg ) {
				const m = r.__parent;
				if ( m.type === 'MemberExpression' && m.object === r && !m.computed ) {
					const k = m.property.name;
					const rd = readOf( k );
					if ( rd ) {
						// Must be a read, not a write.
						if ( m.__parent.type === 'AssignmentExpression' && m.__parent.left === m ) {
							escapes = true;
							break;
						}
						edits.push( { start: m.start, end: m.end, text: rd } );
						continue;
					}
					if ( k === 'info' && infoNow ) {
						edits.push( { start: m.start, end: m.end, text: resVar } );
						infoUses += 1;
						continue;
					}
					if ( extras.includes( k ) || ( k === 'info' && extras.length ) ) {
						continue;
					}
				}
				escapes = true;
				break;
			}
			if ( !escapes ) {
				this.edits.push( ...edits );
				// Keep the binding only if something still reads it (`res.info`,
				// an extra field, or the info value itself) anywhere in scope.
				const live = refs.filter( ( r ) => {
					const m = r.__parent;
					if ( m.type === 'AssignmentExpression' && m.left === r ) {
						return false;
					}
					if ( m.type === 'VariableDeclarator' && m.id === r ) {
						return false;
					}
					if ( m.type === 'MemberExpression' && m.object === r && !m.computed && readOf( m.property.name ) ) {
						return false;
					}
					return true;
				});
				const keepVar = ( infoNow || extras.length ) && live.length;
				if ( keepVar ) {
					return callText;
				}
				// The binding no longer carries anything: drop it.
				if ( resKind === 'assign' ) {
					this.edits.push( { start: node.__parent.start, end: node.__parent.end, text: callText, renders: true } );
					this.dropIfUnused.push( { fn: scope, name: resVar } );
					return null;
				}
				const decl = node.__parent.__parent;
				if ( decl.declarations.length === 1 ) {
					this.edits.push( { start: decl.start, end: decl.end, text: callText + ';', renders: true } );
					return null;
				}
				this.problem( 'multi-declarator result of ' + P.routine, node );
				return null;
			}
			void infoUses;
		}
		// Fallback: rebuild the old object after the call.
		const props = oldKeys.filter( ( k ) => k !== 'info' ).map( ( k ) => '\'' + k + '\': ' + readOf( k ) );
		if ( P.ret === 'info' ) {
			if ( extras.length ) {
				// The call still returns an object with info + extras: merge.
				return 'Object.assign( ' + callText + ', { ' + props.join( ', ' ) + ' } )';
			}
			return '{ ' + ( P.hasInfoKey ? [ '\'info\': ' + callText ] : [] ).concat( props ).join( ', ' ) + ' }';
		}
		if ( resKind === 'decl' || resKind === 'assign' || resKind === 'return' ) {
			pre.push( callText + ';' );
			return '{ ' + props.join( ', ' ) + ' }';
		}
		this.problem( 'cannot rebuild result of ' + P.routine + ' inline', node );
		return callText;
	}

	// Insert allocations, imports; remove dead containers / bindings.
	finish() {
		for ( const [ scope, m ] of this.alloc ) {
			const decls = [ ...m.values() ].flatMap( ( x ) => x.decls );
			if ( !decls.length ) {
				continue;
			}
			if ( scope === this.ast ) {
				// Module level: before the first non-import statement.
				const first = this.ast.body.find( ( n ) => n.type !== 'ImportDeclaration' );
				this.edits.push( { start: first.start, end: first.start, text: decls.join( '\n' ) + '\n\n', order: -2 } );
				continue;
			}
			const body = scope.body;
			if ( body.type !== 'BlockStatement' ) {
				this.problem( 'arrow function without block', scope );
				continue;
			}
			const firstStmt = body.body[ 0 ];
			const ind = firstStmt ? lineIndent( this.src, firstStmt.start ) : '\t';
			// After the line holding `{` (keeps a trailing `// eslint-disable-line` on its line).
			const eol = this.src.indexOf( '\n', body.start );
			this.edits.push( { start: eol, end: eol, text: '\n' + ind + decls.join( '\n' + ind ), order: -2 } );
		}
		let out = finalize( this.src, this.edits );
		const imports = [];
		if ( this.needC128 && !/import Complex128Array from/.test( out ) ) {
			imports.push( IMPORT_C128 );
		}
		if ( this.needReinterpret && !/import reinterpret from/.test( out ) ) {
			imports.push( IMPORT_REINTERPRET );
		}
		if ( imports.length ) {
			const ast = parse( out );
			const last = ast.body.filter( ( n ) => n.type === 'ImportDeclaration' ).pop();
			out = out.slice( 0, last.end ) + '\n' + imports.join( '\n' ) + out.slice( last.end );
		}
		const allocated = [];
		for ( const m of this.alloc.values() ) {
			for ( const x of m.values() ) {
				allocated.push( x.name );
			}
		}
		out = removeDead( out, [ ...this.containers ].concat( this.dropIfUnused.map( ( x ) => x.name ), allocated ) );
		return out;
	}
}

// Remove declarators (and plain `x = …;` statements for dropped bindings) of
// names in `names` that are no longer referenced; follow simple aliases
// (`const dout = DOUT;`).
export function removeDead( src, names, anyInit ) {
	const force = new Set( anyInit || [] );
	let todo = [ ...new Set( names ) ];
	for ( let iter = 0; iter < 5 && todo.length; iter++ ) {
		const ast = annotate( parse( src ) );
		const edits = [];
		const next = [];
		const deadDecls = [];
		for ( const name of todo ) {
			const decls = [];
			walkParents( ast, ( n ) => {
				if ( n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.id.name === name ) {
					decls.push( n );
				}
				return true;
			});
			for ( const d of decls ) {
				const scope = enclosingFunction( d ) || ast;
				// Refs bound to this declarator: refs in its scope not under a
				// nested function that declares the name itself.
				const refs = [];
				walkParents( scope.body || scope, ( n ) => {
					if ( n !== scope && isFunction( n ) ) {
						let own = n.params.some( ( p ) => p.type === 'Identifier' && p.name === name );
						walkParents( n.body, ( m ) => {
							if ( m.type === 'VariableDeclarator' && m.id.type === 'Identifier' && m.id.name === name ) {
								own = true;
							}
							return !isFunction( m ) || m === n.body;
						});
						if ( own ) {
							return false;
						}
					}
					if ( n.type === 'Identifier' && n.name === name && isReference( n ) && !( n.__parent.type === 'VariableDeclarator' && n.__parent.id === n ) ) {
						refs.push( n );
					}
					return true;
				});
				// Plain writes `x = new …;` / `x = <literal>;` don't keep x alive.
				const writes = refs.filter( ( r ) => r.__parent.type === 'AssignmentExpression' && r.__parent.left === r && r.__parent.operator === '=' && r.__parent.__parent.type === 'ExpressionStatement' && /^(NewExpression|ObjectExpression|ArrayExpression|Literal)$/.test( r.__parent.right.type ) );
				if ( refs.length !== writes.length ) {
					continue;
				}
				for ( const w of writes ) {
					const st = w.__parent.__parent;
					const ls = src.lastIndexOf( '\n', st.start - 1 );
					edits.push( { start: ls, end: st.end, text: '' } );
				}
				deadDecls.push( d );
			}
		}
		const byDecl = new Map();
		for ( const d of deadDecls ) {
			if ( d.init && !force.has( d.id.name ) && !/^(NewExpression|Identifier|ObjectExpression|ArrayExpression|Literal)$/.test( d.init.type ) ) {
				continue;
			}
			if ( d.init && d.init.type === 'Identifier' ) {
				next.push( d.init.name );
			}
			const decl = d.__parent;
			if ( decl.__parent.type === 'ForStatement' || decl.__parent.type === 'ExportNamedDeclaration' ) {
				continue;
			}
			if ( !byDecl.has( decl ) ) {
				byDecl.set( decl, new Set() );
			}
			byDecl.get( decl ).add( d );
		}
		for ( const [ decl, dead ] of byDecl ) {
			const keep = decl.declarations.filter( ( x ) => !dead.has( x ) );
			if ( !keep.length ) {
				let ls = src.lastIndexOf( '\n', decl.start - 1 );
				// Take the comment lines directly above with it.
				for ( ;; ) {
					const prev = src.lastIndexOf( '\n', ls - 1 );
					if ( prev === -1 || !/^\s*\/\//.test( src.slice( prev + 1, ls ) ) ) {
						break;
					}
					ls = prev;
				}
				edits.push( { start: ls, end: decl.end, text: '' } );
			} else {
				edits.push( { start: decl.start, end: decl.end, text: decl.kind + ' ' + keep.map( ( x ) => src.slice( x.start, x.end ) ).join( ', ' ) + ';' } );
			}
		}
		if ( !edits.length ) {
			break;
		}
		src = finalize( src, edits );
		todo = next;
	}
	return src;
}
