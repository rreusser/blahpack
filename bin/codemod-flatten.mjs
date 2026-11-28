#!/usr/bin/env node

/**
* Codemod: flatten `lib/<pkg>/base/<routine>/` to `lib/<pkg>/<routine>/` and
* every reference to it (ticket 0125; docs/ndarray-layer.md, "Migration plan").
*
* For each tracked text file (tickets/ excepted: they record history), it:
*
*   1. re-resolves every relative path written in the file against the old
*      layout and rewrites it for the new one: string literals that start
*      with `./` or `../` (imports, `require`, `new URL`, fixture paths),
*      `join`/`resolve( import.meta.dirname | __dirname, '..', … )` segment
*      lists, and Markdown links. A path changes only if the file or its
*      target moves;
*   2. rewrites written-out paths: `lib/<pkg>/base/` → `lib/<pkg>/`, and
*      `<pkg>/base/` in package names, subpaths and URLs. A match right after
*      `stdlib/` is stdlib's own (`@stdlib/blas/base/…`) and is left alone;
*   3. sets each module package.json `name` to `@rreusser/blahpack/<pkg>/<routine>`;
*
* then `git mv`s each module directory. Code that builds paths from a `'base'`
* segment cannot be rewritten safely by pattern; such places are listed for
* review (`--report`), and `--check` fails while any reference remains.
*
* Usage:
*   node bin/codemod-flatten.mjs [--dry] --all
*   node bin/codemod-flatten.mjs [--dry] --only ddot,zggev      prototype on a subset
*   node bin/codemod-flatten.mjs --report                        list what still names base/
*   node bin/codemod-flatten.mjs --check                         exit 1 while anything does
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve( import.meta.dirname, '..' );
const PKGS = [ 'blas', 'lapack', 'arpack' ];
const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const flag = ( name ) => argv.includes( name );
const onlyArg = argv[ argv.indexOf( '--only' ) + 1 ];
const ONLY = flag( '--only' ) ? new Set( onlyArg.split( ',' ) ) : null;

// Text files the codemod reads; tickets record history and are not rewritten.
const TEXT = /\.(?:js|mjs|cjs|ts|json|md|sh|py|yml|yaml|txt|html|css)$|^bin\/[^/.]+$/;
const SKIP = /^(?:tickets\/|node_modules\/|data\/(?:BLAS|lapack|arpack-ng))/;
// `<pkg>/base/` not preceded by `stdlib/` (stdlib's own paths).
const PKG_BASE = new RegExp( `(?<!stdlib/)\\b(${PKGS.join( '|' )})/base/`, 'g' );

function tracked() {
	return execFileSync( 'git', [ 'ls-files', '-z' ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 } ).split( '\0' ).filter( ( f ) => f && TEXT.test( f ) && !SKIP.test( f ) && fs.existsSync( path.join( ROOT, f ) ) );
}

function modules() {
	const out = [];
	for ( const pkg of PKGS ) {
		const dir = path.join( ROOT, 'lib', pkg, 'base' );
		if ( !fs.existsSync( dir ) ) {
			continue;
		}
		for ( const r of fs.readdirSync( dir ).sort() ) {
			if ( fs.statSync( path.join( dir, r ) ).isDirectory() && ( !ONLY || ONLY.has( r ) ) ) {
				out.push( { pkg, routine: r, from: path.join( dir, r ), to: path.join( ROOT, 'lib', pkg, r ) } );
			}
		}
	}
	return out;
}

// Forms in which tooling builds module paths from a `'base'` segment. Each
// entry is [ detector, rewrite ]; the rewrite drops the segment.
const SEGMENT_FORMS = [
	// join( 'lib', pkg, 'base', r ), join( ROOT, pkg, 'base' ), 'lapack', 'base'
	[ /((?:'lib'\s*,\s*[^,()'\n]+?|\b(?:pkg|package|pk|libDir\s*,\s*pkg)|pkgs\[\s*i\s*\]|spec\.package|where\[\s*routine\s*\]|'(?:blas|lapack|arpack)'))\s*,\s*'base'(?=\s*[,)])/g, '$1' ],
	// pathlib: 'lib' / pkg / 'base' / routine
	[ /('lib'\s*\/\s*[\w.]+\s*)\/\s*'base'\s*(?=\/)/g, '$1' ],
	// globs and templates: lib/*/base/, ${pkg}/base/, {package}/base/,
	// {blas,lapack}/base/, and the placeholder <pkg>/base/
	[ /([*}>])\/base\//g, '$1/' ],
	// concatenation: 'lib/' + pkg + '/base/' + r
	[ /(\+\s*)'\/base\/'(?=\s*\+)/g, "$1'/'" ],
	// regex literals: (?:blas|lapack)\/base\/, but not stdlib's own
	// (`@stdlib\/math\/base\/special`)
	[ /(?<!stdlib\\\/[a-z]+)\\\/base\\\//g, '\\/' ]
];

// --report / --check: every place outside tickets that still names base/.
function remaining() {
	const hits = [];
	const dirs = PKGS.filter( ( p ) => fs.existsSync( path.join( ROOT, 'lib', p, 'base' ) ) ).map( ( p ) => `lib/${p}/base/ still exists` );
	// lib/<pkg>/ holds only module directories, so tools can list it as-is.
	for ( const p of PKGS ) {
		const dir = path.join( ROOT, 'lib', p );
		for ( const e of ( fs.existsSync( dir ) ? fs.readdirSync( dir, { withFileTypes: true } ) : [] ) ) {
			if ( !e.isDirectory() ) {
				dirs.push( `lib/${p}/${e.name} is not a module directory (lib/<pkg>/ holds only modules)` );
			}
		}
	}
	for ( const f of tracked() ) {
		if ( f === 'bin/codemod-flatten.mjs' ) {
			continue;
		}
		const lines = fs.readFileSync( path.join( ROOT, f ), 'utf8' ).split( '\n' );
		lines.forEach( ( line, i ) => {
			const tooling = !f.startsWith( 'lib/' ) && SEGMENT_FORMS.some( ( [ re ] ) => new RegExp( re.source ).test( line ) );
			if ( new RegExp( PKG_BASE.source ).test( line ) || tooling ) {
				hits.push( `${f}:${i + 1}: ${line.trim().slice( 0, 140 )}` );
			}
		});
	}
	return dirs.concat( hits );
}

if ( flag( '--report' ) || flag( '--check' ) ) {
	const r = remaining();
	r.forEach( ( h ) => console.log( h ) );
	console.log( `${r.length} reference(s) to the base/ layout` );
	process.exit( flag( '--check' ) && r.length ? 1 : 0 );
}
if ( !flag( '--all' ) && !ONLY ) {
	console.error( 'usage: node bin/codemod-flatten.mjs [--dry] (--all | --only a,b) | --report | --check' );
	process.exit( 2 );
}

const mods = modules();
const moved = mods.map( ( m ) => [ m.from + path.sep, m.to + path.sep ] );
moved.push( [ path.join( ROOT, 'lib', 'lapack', 'base', 'fixture' ) + path.sep, path.join( ROOT, 'lib', 'lapack', 'fixture' ) + path.sep ] );
const movedNames = new Set( mods.map( ( m ) => `${m.pkg}/${m.routine}` ) );
function mapPath( abs ) {
	const p = abs.endsWith( path.sep ) ? abs : abs + path.sep;
	for ( const [ a, b ] of moved ) {
		if ( p.startsWith( a ) ) {
			return ( b + p.slice( a.length ) ).replace( /\/$/, abs.endsWith( path.sep ) ? '/' : '' );
		}
	}
	return abs;
}
function rel( fromDir, to, trailing ) {
	let r = path.relative( fromDir, to ) || '.';
	if ( !r.startsWith( '.' ) ) {
		r = './' + r;
	}
	return r + ( trailing && !r.endsWith( '/' ) ? '/' : '' );
}

const counts = { relative: 0, segments: 0, text: 0, tooling: 0, names: 0, files: 0 };
for ( const f of tracked() ) {
	const oldAbs = path.join( ROOT, f );
	const newAbs = mapPath( oldAbs );
	const oldDir = path.dirname( oldAbs );
	const newDir = path.dirname( newAbs );
	// Some files under test/harness/fixtures/ are verbatim copies of module
	// files, whose relative paths are written for a module's lib/; others were
	// adjusted to reach the real module from where they sit. Decide per path,
	// while the old tree still exists: a path that resolves to a file from the
	// fixture's own directory is real, one that resolves only from a module's
	// lib/ is a copy's (any module will do; only the depth matters).
	const copy = mods.length > 0 && f.startsWith( 'test/harness/fixtures/' );
	const VOLD = path.join( ROOT, 'lib', 'lapack', 'base', 'fixture', 'lib' );
	const VNEW = path.join( ROOT, 'lib', 'lapack', 'fixture', 'lib' );
	// Inside a module, example code in docs (README, LEARNINGS) is written for
	// the module's lib/; a path that finds nothing from the file's own
	// directory is resolved there.
	const home = mods.find( ( m ) => oldAbs.startsWith( m.from + path.sep ) );
	const dirsFor = ( spec ) => {
		if ( fs.existsSync( path.resolve( oldDir, spec ) ) ) {
			return [ oldDir, newDir ];
		}
		if ( copy && fs.existsSync( path.resolve( VOLD, spec ) ) ) {
			return [ VOLD, VNEW ];
		}
		if ( home && fs.existsSync( path.resolve( home.from, 'lib', spec ) ) ) {
			return [ path.join( home.from, 'lib' ), path.join( home.to, 'lib' ) ];
		}
		return [ oldDir, newDir ];
	};
	const src = fs.readFileSync( oldAbs, 'utf8' );
	let out = src;

	// 1a. join/resolve( import.meta.dirname | __dirname, '..', … ) segment lists,
	// first: its output is bare segments ('..'), which 1b does not match, so no
	// path is rewritten twice.
	out = out.replace( /((?:join|resolve)\(\s*(?:import\.meta\.dirname|__dirname))((?:\s*,\s*'[^'\n]*')+)/g, ( m, head, list ) => {
		const segs = [ ...list.matchAll( /'([^'\n]*)'/g ) ].map( ( x ) => x[ 1 ] );
		const target = path.resolve( oldDir, ...segs );
		const next = path.relative( newDir, mapPath( target ) ).split( path.sep ).filter( Boolean );
		if ( next.join( '/' ) === segs.join( '/' ) ) {
			return m;
		}
		counts.segments += 1;
		return `${head}, ${next.map( ( s ) => `'${s}'` ).join( ', ' )}`;
	});

	// 1b. Relative path literals and Markdown links. Keep a path as written
	// while it still names the same (moved) target.
	const fix = ( spec ) => {
		const [ from, to ] = dirsFor( spec );
		const old = path.resolve( from, spec );
		const target = mapPath( old );
		// A path to nothing is not this file's to fix: example code in a
		// README is written for the module's lib/, not the README's directory.
		if ( target === old && !fs.existsSync( old ) ) {
			return spec;
		}
		if ( path.resolve( to, spec ) === target ) {
			return spec;
		}
		return rel( to, target, spec.endsWith( '/' ) );
	};
	out = out.replace( /(['"`])(\.\.?\/[^'"`\s$]*)\1/g, ( m, q, spec ) => {
		const next = fix( spec );
		if ( next === spec ) {
			return m;
		}
		counts.relative += 1;
		return q + next + q;
	});
	out = out.replace( /\]\((\.\.?\/[^)\s#]+)(#[^)]*)?\)/g, ( m, spec, hash ) => {
		const next = fix( spec );
		if ( next === spec ) {
			return m;
		}
		counts.relative += 1;
		return `](${next}${hash || ''})`;
	});

	// 2. Written-out paths, package names, subpaths, URLs.
	out = out.replace( PKG_BASE, ( m, pkg, offset, s ) => {
		const name = /^[\w*{]+/.exec( s.slice( offset + m.length ) );
		if ( ONLY && !( name && movedNames.has( `${pkg}/${name[ 0 ]}` ) ) ) {
			return m;
		}
		counts.text += 1;
		return `${pkg}/`;
	});

	// 2b. Tooling that builds module paths from a `'base'` segment, in the
	// forms the repository uses: join/resolve/os.path.join argument lists
	// (`'lib', pkg, 'base', r`), pathlib (`'lib' / pkg / 'base' /`), globs
	// (`lib/*/base/*`) and regex literals (`(?:blas|lapack)\/base\/`).
	if ( !f.startsWith( 'lib/' ) && f !== 'bin/codemod-flatten.mjs' ) {
		const before = out;
		for ( const [ re, to ] of SEGMENT_FORMS ) {
			out = out.replace( re, to );
		}
		if ( out !== before ) {
			counts.tooling += 1;
		}
	}

	// 3. Module package.json name, computed from the module's own path.
	const mod = mods.find( ( m ) => oldAbs === path.join( m.from, 'package.json' ) );
	if ( mod ) {
		const pkgJson = JSON.parse( out );
		const want = `@rreusser/blahpack/${mod.pkg}/${mod.routine}`;
		if ( pkgJson.name !== want ) {
			out = out.replace( /("name":\s*)"[^"]*"/, `$1"${want}"` );
			counts.names += 1;
		}
	}

	if ( out !== src ) {
		counts.files += 1;
		if ( !DRY ) {
			fs.writeFileSync( oldAbs, out );
		}
	}
}

if ( !DRY ) {
	for ( const m of mods ) {
		execFileSync( 'git', [ 'mv', m.from, m.to ], { cwd: ROOT } );
	}
	for ( const p of PKGS ) {
		const dir = path.join( ROOT, 'lib', p, 'base' );
		if ( fs.existsSync( dir ) && fs.readdirSync( dir ).length === 0 ) {
			fs.rmdirSync( dir );
		}
	}
}

console.log( `${DRY ? 'would move' : 'moved'} ${mods.length} module(s); ${DRY ? 'would rewrite' : 'rewrote'} ${counts.files} file(s): ${counts.relative} relative paths, ${counts.segments} join/resolve segment lists, ${counts.text} written-out paths, ${counts.tooling} tooling files with base/ segments, ${counts.names} package names` );
