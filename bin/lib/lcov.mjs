/**
* lcov parsing for bin/coverage.mjs (tickets 0064, 0069).
*/

import path from 'node:path';

// Parse an lcov file into { file: { lf, lh, brf, brh, uncovered, uncoveredBranches } },
// counting a line covered if any record for the file covers it.
//
// One file can appear in several records: a test that re-imports it through
// importWithConstants/importWithDependencies gets its own copy. V8 reports
// detailed blocks only for functions a copy ran, so two copies can list a
// different number of branches on one line, and positions then do not
// correspond. Per line: records listing the most branches there are merged
// position by position (same count, same blocks); records listing fewer
// are not counted. That never invents untaken branches (a copy's partial
// list used to add zero-hit "branches" on every line it did not run), and
// at worst under-credits a branch reached only through a partial copy.
function parseLcov( text, root ) {
	const raw = {};
	let cur = null;
	text.split( '\n' ).forEach( ( line ) => {
		const i = line.indexOf( ':' );
		const k = ( i < 0 ) ? line : line.slice( 0, i );
		const v = ( i < 0 ) ? '' : line.slice( i + 1 );
		if ( k === 'SF' ) {
			const key = path.relative( root, path.resolve( root, v ) );
			raw[ key ] = raw[ key ] || [];
			cur = { 'lines': new Map(), 'branches': new Map() };
			raw[ key ].push( cur );
		} else if ( !cur ) {
			// ignore
		} else if ( k === 'DA' ) {
			const [ ln, hits ] = v.split( ',' );
			cur.lines.set( Number( ln ), Math.max( cur.lines.get( Number( ln ) ) || 0, Number( hits ) ) );
		} else if ( k === 'BRDA' ) {
			const parts = v.split( ',' );
			const ln = Number( parts[ 0 ] );
			const hits = ( parts[ 3 ] === '-' ) ? 0 : Number( parts[ 3 ] );
			if ( !cur.branches.has( ln ) ) {
				cur.branches.set( ln, [] );
			}
			cur.branches.get( ln ).push( hits );
		}
	});
	const out = {};
	Object.keys( raw ).forEach( ( f ) => {
		const lines = new Map();
		const branchLines = new Map();
		raw[ f ].forEach( ( rec ) => {
			rec.lines.forEach( ( h, ln ) => lines.set( ln, Math.max( lines.get( ln ) || 0, h ) ) );
			rec.branches.forEach( ( list, ln ) => {
				const prev = branchLines.get( ln );
				if ( !prev || list.length > prev.length ) {
					branchLines.set( ln, list.slice() );
				} else if ( list.length === prev.length ) {
					list.forEach( ( h, b ) => {
						prev[ b ] = Math.max( prev[ b ], h );
					});
				}
			});
		});
		const L = [ ...lines.entries() ];
		const B = [];
		branchLines.forEach( ( list, ln ) => list.forEach( ( h ) => B.push( [ ln, h ] ) ) );
		out[ f ] = {
			'lf': L.length,
			'lh': L.filter( ( e ) => e[ 1 ] > 0 ).length,
			'brf': B.length,
			'brh': B.filter( ( e ) => e[ 1 ] > 0 ).length,
			'uncovered': L.filter( ( e ) => e[ 1 ] === 0 ).map( ( e ) => e[ 0 ] ).sort( ( a, b ) => a - b ),
			'uncoveredBranches': B.filter( ( e ) => e[ 1 ] === 0 ).map( ( e ) => e[ 0 ] )
		};
	});
	return out;
}

export { parseLcov };
