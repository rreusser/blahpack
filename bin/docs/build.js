#!/usr/bin/env node
/**
* Builds the API reference site from the code.
*
* The site is a pure function of the JSDoc in `lib/` and `spec/*.json`. The
* output directory can be deleted at any time without losing anything.
*
* Usage:
*
*   node bin/docs/build.js [--out <dir>] [--only dgesv,zgemm] [--quiet]
*
* Writes:
*
*   index.html                                   home
*   reference/<pkg>/index.html                   package index, grouped
*   reference/<pkg>/<name>.{html,md,json}        one routine
*   llms.txt, llms-full.txt                      agent entry points (llmstxt.org)
*   api.json, api-index.json, search-index.json  the documentation model
*   doc-health.json                              documentation defects found while building
*
* @module bin/docs/build
*/

import { mkdirSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { extractAll, ROOT, PACKAGE_JSON } from './extract.js';
import { routineHTML, routineMarkdown } from './render/routine.js';
import { groupRoutines, sidebarFor, packageHTML, homeHTML } from './render/indexes.js';
import { PACKAGES } from './taxonomy.js';


// ARGS //

const args = process.argv.slice( 2 );
function opt( name, dflt ) {
	const i = args.indexOf( '--' + name );
	return ( i >= 0 ) ? args[ i + 1 ] : dflt;
}
const OUT = resolve( ROOT, opt( 'out', 'site' ) );
const ONLY = opt( 'only', null );
const QUIET = args.includes( '--quiet' );


// MAIN //

function write( rel, content ) {
	const path = join( OUT, rel );
	mkdirSync( join( path, '..' ), { 'recursive': true } );
	writeFileSync( path, content );
	return Buffer.byteLength( content );
}

function main() {
	const t0 = Date.now();
	const repo = ( PACKAGE_JSON.repository && PACKAGE_JSON.repository.url || '' ).replace( /^git\+/, '' ).replace( /\.git$/, '' );
	const site = {
		'name': PACKAGE_JSON.name,
		'shortName': PACKAGE_JSON.name.replace( /^@[^/]+\//, '' ),
		'version': PACKAGE_JSON.version,
		'license': PACKAGE_JSON.license,
		'description': PACKAGE_JSON.description,
		repo
	};

	const routines = extractAll( ONLY ? { 'only': ONLY.split( ',' ) } : {} );
	const byName = new Map( routines.map( ( r ) => [ r.name, r ] ) );
	const grouped = groupRoutines( routines );
	const sidebar = sidebarFor( grouped );
	const ctx = { site, byName, sidebar };

	// Routine pages (HTML + Markdown + JSON):
	const mdAll = [];
	for ( const r of routines ) {
		const base = join( 'reference', r.package, r.name );
		write( base + '.html', routineHTML( r, ctx ) );
		const md = routineMarkdown( r, ctx );
		write( base + '.md', md );
		mdAll.push( md );
		const { health, ...pub } = r;
		write( base + '.json', JSON.stringify( pub, null, '\t' ) );
	}

	// Package indexes + home:
	for ( const [ pkg, groups ] of grouped ) {
		write( join( 'reference', pkg, 'index.html' ), packageHTML( pkg, groups, site ) );
	}
	write( 'index.html', homeHTML( grouped, site ) );

	// Machine-readable outputs:
	const pub = routines.map( ( { health, ...rest } ) => rest );
	write( 'api.json', JSON.stringify( pub ) );
	write( 'api-index.json', JSON.stringify( routines.map( ( r ) => ({
		'name': r.name,
		'package': r.package,
		'group': r.group.key,
		'precision': r.precision,
		'summary': r.summary,
		'html': 'reference/' + r.package + '/' + r.name + '.html',
		'md': 'reference/' + r.package + '/' + r.name + '.md',
		'json': 'reference/' + r.package + '/' + r.name + '.json'
	}) ) ) );
	write( 'search-index.json', JSON.stringify( routines.map( ( r ) => [ r.name, r.package, r.group.label, r.summary.replace( /`/g, '' ) ] ) ) );

	const llms = [ '# ' + site.shortName, '', '> ' + site.description + '. ' + routines.length + ' routines, each with a layout API `f( order, ..., A, LDA, ... )` and a strided API `f.ndarray( ..., A, strideA1, strideA2, offsetA, ... )`.', '', 'Each link below is a compact Markdown page with the routine\'s signatures, a parameter table (type, intent, shape, constraints), returns, throws and examples. `api.json` holds the same data as JSON.', '' ];
	for ( const [ pkg, groups ] of grouped ) {
		llms.push( '## ' + PACKAGES[ pkg ].title );
		llms.push( '' );
		for ( const g of groups ) {
			for ( const r of g.routines ) {
				llms.push( '- [' + r.name + '](reference/' + pkg + '/' + r.name + '.md): ' + r.summary.replace( /\s+/g, ' ' ) );
			}
		}
		llms.push( '' );
	}
	llms.push( '## Optional', '', '- [llms-full.txt](llms-full.txt): every routine page concatenated', '- [api.json](api.json): the full documentation model', '' );
	write( 'llms.txt', llms.join( '\n' ) );
	write( 'llms-full.txt', mdAll.join( '\n\n---\n\n' ) );

	// Documentation health:
	const health = {};
	for ( const r of routines ) {
		for ( const h of r.health ) {
			( health[ h.code ] = health[ h.code ] || [] ).push({ 'routine': r.name, 'where': h.where, 'message': h.message });
		}
	}
	write( 'doc-health.json', JSON.stringify( health, null, '\t' ) );

	// Static assets:
	const assets = join( import.meta.dirname, 'assets' );
	mkdirSync( join( OUT, 'assets' ), { 'recursive': true } );
	for ( const f of readdirSync( assets ) ) {
		copyFileSync( join( assets, f ), join( OUT, 'assets', f ) );
	}
	// KaTeX stylesheet and fonts for the build-time-typeset math of the reference-documentation sections:
	const katexDist = join( dirname( createRequire( import.meta.url ).resolve( 'katex/package.json' ) ), 'dist' );
	mkdirSync( join( OUT, 'assets', 'katex', 'fonts' ), { 'recursive': true } );
	copyFileSync( join( katexDist, 'katex.min.css' ), join( OUT, 'assets', 'katex', 'katex.min.css' ) );
	for ( const f of readdirSync( join( katexDist, 'fonts' ) ).filter( ( x ) => x.endsWith( '.woff2' ) ) ) {
		copyFileSync( join( katexDist, 'fonts', f ), join( OUT, 'assets', 'katex', 'fonts', f ) );
	}
	write( '.nojekyll', '' );

	if ( !QUIET ) {
		console.log( 'Built ' + routines.length + ' routines into ' + OUT + ' in ' + ( Date.now() - t0 ) + ' ms' );
		console.log( 'Doc health (see doc-health.json):' );
		for ( const [ code, list ] of Object.entries( health ).sort( ( a, b ) => b[ 1 ].length - a[ 1 ].length ) ) {
			console.log( '  ' + String( list.length ).padStart( 5 ) + '  ' + code );
		}
	}
}

main();
