/**
* Load hook for bin/workspace-optimum.mjs (registered in its worker with
* `module.register`). It rewrites ONE wrapper (`data.target`):
*
* -   every null-workspace allocation goes through `globalThis.__wsGuard`
*     (the rewrite of bin/workspace-guard-loader.mjs), which the checker
*     defines to record the requested size;
* -   the module's own `base.js` / `ndarray.js` default import is replaced by
*     `globalThis.__wsOptStop`, which throws a sentinel: the call stops after
*     validation and allocation, before the algorithm runs.
*/

import * as espree from 'espree';
import { transform } from './workspace-guard-loader.mjs';

let target = null;

export async function initialize( data ) {
	target = data && data.target;
}

function stopOwnEntry( src ) {
	const ast = espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true } );
	const edits = [];
	ast.body.forEach( ( st ) => {
		if ( st.type !== 'ImportDeclaration' || ![ './base.js', './ndarray.js' ].includes( st.source.value ) ) {
			return;
		}
		const def = st.specifiers.find( ( s ) => s.type === 'ImportDefaultSpecifier' );
		if ( !def ) {
			return;
		}
		edits.push( [ def.local.range[ 0 ], def.local.range[ 1 ], '__wsOptReal_' + def.local.name ] );
		edits.push( [ st.range[ 1 ], st.range[ 1 ], '\nconst ' + def.local.name + ' = globalThis.__wsOptStop;' ] );
	});
	edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
	let out = src;
	for ( const e of edits ) {
		out = out.slice( 0, e[ 0 ] ) + e[ 2 ] + out.slice( e[ 1 ] );
	}
	return out;
}

export async function load( url, context, nextLoad ) {
	if ( target && url === target ) {
		const res = await nextLoad( url, context );
		const tag = url.replace( /^.*\/lib\/[a-z]+\/base\//, '' ).replace( /\/lib\/.*$/, '' );
		return { 'format': 'module', 'source': stopOwnEntry( transform( String( res.source ), tag ) ), 'shortCircuit': true };
	}
	return nextLoad( url, context );
}
