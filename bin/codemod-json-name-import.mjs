// Rewrite `import { name as pkg } from './../package.json' with { type: 'json' };`
// to a default import: Node's JSON modules expose only a default export, so the
// named import throws "does not provide an export named 'name'" at load time.
//
//   import pkgJson from './../package.json' with { type: 'json' };
//   …
//   // VARIABLES //
//
//   const pkg = pkgJson.name;
//
// Usage: node bin/codemod-json-name-import.mjs [--dry] [dir=lib]

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const root = argv.find( ( a ) => !a.startsWith( '--' ) ) || 'lib';
const RE = /^import \{ name as pkg \} from '(\.\/\.\.\/package\.json)' with \{ type: 'json' \};$/m;

function walk( dir, out ) {
	for ( const e of fs.readdirSync( dir ) ) {
		if ( e === 'node_modules' || e === 'fixtures' ) {
			continue;
		}
		const f = path.join( dir, e );
		if ( fs.statSync( f ).isDirectory() ) {
			walk( f, out );
		} else if ( e.endsWith( '.js' ) ) {
			out.push( f );
		}
	}
	return out;
}

let n = 0;
let bad = 0;
for ( const f of walk( root, [] ) ) {
	let s = fs.readFileSync( f, 'utf8' );
	if ( !RE.test( s ) ) {
		continue;
	}
	s = s.replace( RE, 'import pkgJson from \'$1\' with { type: \'json\' };' );
	const decl = 'const pkg = pkgJson.name;\n';
	if ( s.includes( '// VARIABLES //\n\n' ) ) {
		s = s.replace( '// VARIABLES //\n\n', '// VARIABLES //\n\n' + decl );
	} else {
		const m = /\n\n\n(\/\/ (FUNCTIONS|MAIN) \/\/)/.exec( s );
		if ( !m ) {
			console.error( 'no section to insert into: ' + f );
			bad += 1;
			continue;
		}
		s = s.slice( 0, m.index ) + '\n\n\n// VARIABLES //\n\n' + decl + s.slice( m.index );
	}
	n += 1;
	if ( !DRY ) {
		fs.writeFileSync( f, s );
	}
}
console.log( 'rewritten: ' + n + ', unhandled: ' + bad + ( DRY ? ' (dry)' : '' ) );
