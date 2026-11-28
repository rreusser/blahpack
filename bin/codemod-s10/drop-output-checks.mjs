// Drop argument validation of output scalars in the wrappers (S10).
//
// The scaffolded wrappers validate every integer param, including outputs the
// routine itself sets (`if ( M < 0 ) { throw new RangeError( … ) }` for the
// M of dtrevc). Once an output is a length-1 array that check is meaningless
// (`Int32Array < 0` is always false), so it and the test asserting it go.
//
//   node bin/codemod-s10/drop-output-checks.mjs [--dry] <routine...>

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT } from '../codemod-strided-wrapper/lib.mjs';

const require = createRequire( import.meta.url );
const specLib = require( path.join( ROOT, 'lint', 'lib', 'spec.cjs' ) );

function esc( s ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

export function dropOutputChecks( routine, dry ) {
	const spec = specLib.load( routine );
	const outs = spec.params.filter( ( p ) => p.role === 'scalar' && p.intent === 'out' ).map( ( p ) => p.name );
	const dir = path.join( ROOT, 'lib', spec.package, routine );
	const changed = [];
	for ( const f of [ routine + '.js', 'ndarray.js' ] ) {
		const file = path.join( dir, 'lib', f );
		if ( !fs.existsSync( file ) ) {
			continue;
		}
		let src = fs.readFileSync( file, 'utf8' );
		const before = src;
		for ( const o of outs ) {
			// `\tif ( M < 0 ) {\n\t\tthrow …;\n\t}\n` (one throw statement).
			const re = new RegExp( '\\n[\\t ]*if \\( ' + esc( o ) + ' < [01] \\) \\{\\n[\\t ]*throw [^\\n]*\\n[\\t ]*\\}(?=\\n)', 'gi' );
			src = src.replace( re, '' );
			// The @throws line documenting it, if dedicated to this param.
		}
		if ( src !== before ) {
			changed.push( file );
			if ( !dry ) {
				fs.writeFileSync( file, src );
			}
		}
	}
	// Tests of the dropped checks: `test( '<r> throws RangeError for negative M', … } );`.
	const tdir = path.join( dir, 'test' );
	for ( const f of fs.existsSync( tdir ) ? fs.readdirSync( tdir ) : [] ) {
		if ( !f.endsWith( '.js' ) ) {
			continue;
		}
		const file = path.join( tdir, f );
		let src = fs.readFileSync( file, 'utf8' );
		const before = src;
		for ( const o of outs ) {
			// Only `… throws … for negative M` / `… invalid M` (not "non-negative r").
			const re = new RegExp( '\\ntest\\( \'[^\'\\n]*\\bthrows\\b[^\'\\n]*[^-\\w](negative|invalid) ' + esc( o ) + '\'[\\s\\S]*?\\n\\} ?\\);\\n', 'gi' );
			src = src.replace( re, '\n' );
		}
		src = src.replace( /\n{3,}(?=test\()/g, '\n\n' );
		if ( src !== before ) {
			changed.push( file );
			if ( !dry ) {
				fs.writeFileSync( file, src );
			}
		}
	}
	return changed;
}

if ( import.meta.url === 'file://' + process.argv[ 1 ] ) {
	const argv = process.argv.slice( 2 );
	const dry = argv.includes( '--dry' );
	for ( const r of argv.filter( ( a ) => !a.startsWith( '--' ) ) ) {
		for ( const f of dropOutputChecks( r, dry ) ) {
			console.log( path.relative( ROOT, f ) );
		}
	}
}
