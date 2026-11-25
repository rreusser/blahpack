#!/usr/bin/env node
// Blahpack dev dashboard: a local, observational status page.
//
//   node dashboard/server.mjs [--port 4317]
//
// Serves dashboard/public and a small JSON + SSE API. It reads the repo's own
// sources (CI workflow, bin/checks.json, lint/rules, tickets, CONVENTIONS.md)
// and runs only commands those sources define, by id. It writes nothing
// outside dashboard/.state/ (gitignored). See dashboard/README.md.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import * as src from './lib/sources.mjs';
import { createRunner } from './lib/runner.mjs';

const args = process.argv.slice( 2 );
const PORT = Number( args[ args.indexOf( '--port' ) + 1 ] || process.env.PORT || 4317 ) || 4317;
const HOST = '127.0.0.1';
const PUBLIC = path.join( src.ROOT, 'dashboard', 'public' );

// ---------------------------------------------------------------------------
// Server-sent events

const clients = new Set();

function broadcast( type, data ) {
	const msg = 'event: ' + type + '\ndata: ' + JSON.stringify( data ) + '\n\n';
	for ( const res of clients ) {
		res.write( msg );
	}
}

const runner = createRunner({
	'concurrency': Number( process.env.DASH_CONCURRENCY ) || 2,
	'onEvent': broadcast
});

// Every runnable command, by id. Rebuilt per run request so edits to ci.yml
// or lint/rules are picked up; the client can only name an id from here.
function commandTable() {
	const table = new Map();
	for ( const g of src.gates() ) {
		for ( const gate of g.gates ) {
			table.set( gate.id, gate );
		}
	}
	for ( const rule of src.lintRules() ) {
		for ( const r of rule.runs ) {
			table.set( r.id, r );
		}
	}
	return table;
}

// Watch the sources and tell clients to refetch.
let pending = null;
function changed( what ) {
	clearTimeout( pending );
	pending = setTimeout( () => broadcast( 'changed', { what } ), 300 );
}
for ( const [ rel, what, recursive ] of [
	[ 'tickets', 'tickets', false ],
	[ 'lint/rules', 'lint', true ],
	[ 'CONVENTIONS.md', 'conventions', false ],
	[ '.github/workflows', 'gates', false ],
	[ 'bin/checks.json', 'gates', false ]
] ) {
	try {
		fs.watch( path.join( src.ROOT, rel ), { recursive }, () => changed( what ) );
	} catch ( err ) {
		console.warn( 'watch failed for', rel, err.message );
	}
}

// ---------------------------------------------------------------------------
// HTTP

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

function json( res, code, body ) {
	res.writeHead( code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } );
	res.end( JSON.stringify( body ) );
}

// Only this machine, only this page: reject foreign Host headers (DNS
// rebinding) and require a custom header on POST (a cross-site form or fetch
// cannot set it without a CORS preflight, which is never granted).
function allowed( req ) {
	const host = ( req.headers.host || '' ).replace( /:\d+$/, '' );
	if ( host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]' ) {
		return false;
	}
	if ( req.method === 'POST' && req.headers[ 'x-dashboard' ] !== '1' ) {
		return false;
	}
	return true;
}

function body( req ) {
	return new Promise( ( resolve ) => {
		let s = '';
		req.on( 'data', ( c ) => {
			s += c;
		});
		req.on( 'end', () => {
			try {
				resolve( JSON.parse( s || '{}' ) );
			} catch {
				resolve( {} );
			}
		});
	});
}

async function api( req, res, url ) {
	const p = url.pathname;
	if ( req.method === 'GET' ) {
		switch ( p ) {
		case '/api/overview':
			return json( res, 200, { 'git': src.git(), 'results': runner.all(), 'root': src.ROOT } );
		case '/api/gates':
			return json( res, 200, src.gates() );
		case '/api/lint':
			return json( res, 200, src.lintRules() );
		case '/api/tickets':
			return json( res, 200, src.tickets() );
		case '/api/conventions':
			return json( res, 200, src.conventions() );
		case '/api/results':
			return json( res, 200, runner.all() );
		case '/api/output': {
			const r = runner.get( url.searchParams.get( 'id' ) );
			return json( res, 200, r ? { 'id': r.id, 'output': r.output || '' } : { 'output': '' } );
		}
		case '/api/events':
			res.writeHead( 200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', 'connection': 'keep-alive' } );
			res.write( 'retry: 2000\n\n' );
			clients.add( res );
			req.on( 'close', () => clients.delete( res ) );
			return;
		}
	}
	if ( req.method === 'POST' ) {
		const b = await body( req );
		if ( p === '/api/run' ) {
			const table = commandTable();
			const ids = Array.isArray( b.ids ) ? b.ids : [ b.id ];
			const started = [];
			const refused = [];
			for ( const id of ids ) {
				const entry = table.get( id );
				if ( !entry || !entry.runnable ) {
					refused.push({ id, 'why': entry ? entry.why : 'unknown id' });
					continue;
				}
				started.push( runner.enqueue( id, entry.cmd ) );
			}
			return json( res, refused.length && !started.length ? 400 : 200, { started, refused } );
		}
		if ( p === '/api/stop' ) {
			if ( b.all ) {
				runner.stopAll();
				return json( res, 200, { 'ok': true } );
			}
			return json( res, 200, { 'ok': runner.stop( b.id ) } );
		}
	}
	return json( res, 404, { 'error': 'not found' } );
}

function serveStatic( res, p ) {
	const rel = p === '/' ? 'index.html' : p.replace( /^\/+/, '' );
	const file = path.join( PUBLIC, rel );
	if ( !file.startsWith( PUBLIC + path.sep ) || !fs.existsSync( file ) || fs.statSync( file ).isDirectory() ) {
		res.writeHead( 404 );
		return res.end( 'not found' );
	}
	res.writeHead( 200, { 'content-type': TYPES[ path.extname( file ) ] || 'application/octet-stream', 'cache-control': 'no-store' } );
	fs.createReadStream( file ).pipe( res );
}

const server = http.createServer( async ( req, res ) => {
	if ( !allowed( req ) ) {
		res.writeHead( 403 );
		return res.end( 'forbidden' );
	}
	const url = new URL( req.url, 'http://localhost' );
	try {
		if ( url.pathname.startsWith( '/api/' ) ) {
			return await api( req, res, url );
		}
		return serveStatic( res, url.pathname );
	} catch ( err ) {
		console.error( err );
		return json( res, 500, { 'error': err.message } );
	}
});

// Keep SSE connections alive through idle periods.
setInterval( () => {
	for ( const res of clients ) {
		res.write( ': ping\n\n' );
	}
}, 20000 ).unref();

function shutdown() {
	runner.stopAll();
	process.exit( 0 );
}
process.on( 'SIGINT', shutdown );
process.on( 'SIGTERM', shutdown );

server.listen( PORT, HOST, () => {
	console.log( 'blahpack dashboard: http://localhost:' + PORT );
});
