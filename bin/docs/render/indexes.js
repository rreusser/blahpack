/**
* Renders the home page, package index pages, the agents page and the sidebar.
*
* @module bin/docs/render/indexes
*/

import { esc, inline, codeBlock, page } from './common.js';
import { PACKAGES } from '../taxonomy.js';

const PREC_ORDER = { 'real': 0, 'complex': 1, 'mixed': 2, 'integer': 3, 'other': 4 };

/**
* Groups routines by package and navigation group, in display order.
*
* @param {Array<Object>} routines - routine IRs
* @returns {Map} package → Array<{ key, label, routines }>
*/
export function groupRoutines( routines ) {
	const out = new Map();
	for ( const pkg of Object.keys( PACKAGES ) ) {
		const groups = new Map();
		for ( const r of routines.filter( ( x ) => x.package === pkg ) ) {
			if ( !groups.has( r.group.key ) ) {
				groups.set( r.group.key, { 'key': r.group.key, 'label': r.group.label, 'rank': r.group.rank, 'routines': [] } );
			}
			groups.get( r.group.key ).routines.push( r );
		}
		const list = [ ...groups.values() ].sort( ( a, b ) => a.rank - b.rank );
		for ( const g of list ) {
			// Pair precisions: sort by stem, then real before complex.
			g.routines.sort( ( a, b ) => a.stem.localeCompare( b.stem ) || PREC_ORDER[ a.precision ] - PREC_ORDER[ b.precision ] || a.name.localeCompare( b.name ) );
		}
		if ( list.length ) {
			out.set( pkg, list );
		}
	}
	return out;
}

/**
* Returns a sidebar renderer for routine pages.
*
* @param {Map} grouped - output of groupRoutines
* @returns {Function} `( routine ) => html`
*/
export function sidebarFor( grouped ) {
	return ( r ) => {
		const groups = grouped.get( r.package );
		let html = '<div class="sb-title"><a href="index.html">' + PACKAGES[ r.package ].title + '</a></div><ul class="sb-groups">';
		for ( const g of groups ) {
			const open = g.key === r.group.key;
			html += '<li class="' + ( open ? 'open' : '' ) + '"><a class="sb-group" href="index.html#' + g.key + '">' + esc( g.label ) + ' <span class="count">' + g.routines.length + '</span></a>';
			if ( open ) {
				html += '<ul class="sb-routines">' + g.routines.map( ( x ) => '<li><a href="' + x.name + '.html"' + ( x.name === r.name ? ' aria-current="page"' : '' ) + '>' + esc( x.name ) + '</a></li>' ).join( '' ) + '</ul>';
			}
			html += '</li>';
		}
		return html + '</ul>';
	};
}

function routineTable( routines, root ) {
	return '<div class="table-wrap"><table class="routine-table"><thead><tr><th>Routine</th><th>Summary</th></tr></thead><tbody>' + routines.map( ( r ) => '<tr><td class="rt-name"><a href="' + root + 'reference/' + r.package + '/' + r.name + '.html"><code>' + esc( r.name ) + '</code></a><span class="prec prec-' + esc( r.precision ) + '" title="' + esc( r.precision ) + '">' + esc( r.precision[ 0 ] ) + '</span></td><td>' + inline( r.summary ) + '</td></tr>' ).join( '' ) + '</tbody></table></div>';
}

export function packageHTML( pkg, groups, site ) {
	const root = '../../';
	const meta = PACKAGES[ pkg ];
	const total = groups.reduce( ( n, g ) => n + g.routines.length, 0 );
	let body = '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="' + root + 'index.html">Reference</a><span>›</span><span>' + meta.title + '</span></nav>';
	body += '<h1>' + meta.title + ' <span class="h1-sub">' + esc( meta.long ) + '</span></h1>';
	body += '<p class="lead-p">' + total + ' routines translated from ' + esc( meta.source ) + ', grouped by ' + ( pkg === 'blas' ? 'level' : ( pkg === 'lapack' ? 'matrix type (characters 2–3 of the name)' : 'package' ) ) + '. The badge after each name gives its precision: <span class="prec prec-real">r</span> real, <span class="prec prec-complex">c</span> complex, <span class="prec prec-mixed">m</span> mixed.</p>';
	body += '<div class="filter"><input id="filter" type="search" placeholder="Filter this page…" aria-label="Filter routines on this page"></div>';
	for ( const g of groups ) {
		body += '<section class="group" id="' + g.key + '"><h2><a class="anchor" href="#' + g.key + '">' + esc( g.label ) + '</a> <span class="count">' + g.routines.length + '</span></h2>' + routineTable( g.routines, root ) + '</section>';
	}
	const sidebar = '<div class="sb-title">' + meta.title + '</div><ul class="sb-groups">' + groups.map( ( g ) => '<li><a class="sb-group" href="#' + g.key + '">' + esc( g.label ) + ' <span class="count">' + g.routines.length + '</span></a></li>' ).join( '' ) + '</ul>';
	return page({ root, 'title': meta.title + ' reference · ' + site.shortName, 'description': meta.long + ': ' + total + ' routines', body, sidebar, 'site': site, 'section': pkg, 'alternates': [ { 'type': 'text/plain', 'href': root + 'llms.txt' } ] });
}

export function homeHTML( grouped, site ) {
	const root = '';
	const counts = [ ...grouped ].map( ( [ pkg, groups ] ) => [ pkg, groups.reduce( ( n, g ) => n + g.routines.length, 0 ), groups ] );
	const total = counts.reduce( ( n, c ) => n + c[ 1 ], 0 );
	let body = '<section class="hero"><h1>' + esc( site.shortName ) + '</h1><p class="hero-tag">' + esc( site.description ) + '</p>';
	body += '<div class="hero-stats">' + counts.map( ( [ pkg, n ] ) => '<a class="stat" href="reference/' + pkg + '/index.html"><span class="stat-n">' + n + '</span><span class="stat-l">' + PACKAGES[ pkg ].title + ' routines</span></a>' ).join( '' ) + '</div>';
	body += codeBlock( 'import dgesv from \'' + site.name + '/lapack/dgesv\';\n\n// Solve A X = B (column-major, 2×2, one right-hand side):\nconst A = new Float64Array( [ 1.0, 3.0, 2.0, 4.0 ] );\nconst B = new Float64Array( [ 5.0, 11.0 ] );\nconst IPIV = new Int32Array( 2 );\n\nconst info = dgesv( \'column-major\', 2, 1, A, 2, IPIV, 1, B, 2 );\n// info => 0, B => [ 1.0, 2.0 ]' );
	body += '</section>';

	body += '<section class="cards">' + counts.map( ( [ pkg, n, groups ] ) => '<a class="card" href="reference/' + pkg + '/index.html"><h2>' + PACKAGES[ pkg ].title + '</h2><p>' + esc( PACKAGES[ pkg ].long ) + '</p><p class="card-meta">' + n + ' routines · ' + groups.length + ' groups</p></a>' ).join( '' ) + '</section>';

	body += '<section id="conventions"><h2><a class="anchor" href="#conventions">Calling conventions</a></h2>';
	body += '<p>Every routine is a plain function over typed arrays, with two entry points:</p>';
	body += '<dl class="defs"><dt><code>routine( order, …, A, LDA, … )</code></dt><dd>The <strong>layout API</strong>. Takes a storage layout (<code>\'row-major\'</code> or <code>\'column-major\'</code>) and leading dimensions, like CBLAS and LAPACKE.</dd>';
	body += '<dt><code>routine.ndarray( …, A, strideA1, strideA2, offsetA, … )</code></dt><dd>The <strong>strided API</strong>. Gives an explicit stride and offset for every array dimension, so it can address sub-matrices, transposes and views without copying.</dd></dl>';
	body += '<p>Complex arrays are <code>Complex128Array</code>; strides and offsets count complex elements. Argument checks throw <code>TypeError</code>/<code>RangeError</code> instead of returning LAPACK\'s negative <code>INFO</code>. Callers allocate all workspace.</p>';
	body += '<h3>Reading a signature</h3><p>Long signatures put one <em>operand group</em> on each line: an array followed by the leading dimension, strides and offset that address it. Parameter names are colored by role:</p>';
	body += '<pre class="sig legend"><span class="sig-p role-matrix">A</span> array   <span class="sig-p role-ld">LDA</span> leading dimension   <span class="sig-p role-stride">strideA1</span> stride   <span class="sig-p role-offset">offsetA</span> offset\n<span class="sig-p role-dim">N</span> dimension   <span class="sig-p role-flag">uplo</span> option   <span class="sig-p role-scalar">alpha</span> scalar   <span class="sig-p role-workspace">WORK</span> workspace</pre>';
	body += '<p>Parameter tables list each argument\'s <span class="intent intent-in">in</span> <span class="intent intent-out">out</span> <span class="intent intent-inout">in/out</span> intent and its logical shape. The tables also show the argument checks the routine enforces, all derived from the reference Fortran.</p></section>';

	body += '<section id="browse"><h2><a class="anchor" href="#browse">Browse by group</a></h2><div class="group-grid">';
	for ( const [ pkg, , groups ] of counts ) {
		body += '<div class="group-col"><h3>' + PACKAGES[ pkg ].title + '</h3><ul>' + groups.map( ( g ) => '<li><a href="reference/' + pkg + '/index.html#' + g.key + '">' + esc( g.label ) + '</a> <span class="count">' + g.routines.length + '</span></li>' ).join( '' ) + '</ul></div>';
	}
	body += '</div></section>';
	return page({ root, 'title': site.shortName + ': ' + site.description, 'description': site.description + ' (' + total + ' routines)', body, 'site': site, 'section': 'home', 'alternates': [ { 'type': 'text/plain', 'href': 'llms.txt' } ] });
}
