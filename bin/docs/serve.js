#!/usr/bin/env node
/**
* Minimal static server for previewing the built site.
*
* Usage: node bin/docs/serve.js [--dir site] [--port 4173]
*
* @module bin/docs/serve
*/

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve, extname, normalize } from 'node:path';

const args = process.argv.slice( 2 );
const opt = ( n, d ) => ( args.includes( '--' + n ) ? args[ args.indexOf( '--' + n ) + 1 ] : d );
const DIR = resolve( import.meta.dirname, '..', '..', opt( 'dir', 'site' ) );
const PORT = Number( opt( 'port', process.env.PORT || 4173 ) );
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };

createServer( async ( req, res ) => {
	const path = normalize( decodeURIComponent( new URL( req.url, 'http://x' ).pathname ) );
	let file = join( DIR, path );
	if ( !file.startsWith( DIR ) ) {
		res.writeHead( 403 ).end();
		return;
	}
	try {
		if ( ( await stat( file ) ).isDirectory() ) {
			file = join( file, 'index.html' );
		}
		const body = await readFile( file );
		res.writeHead( 200, { 'content-type': TYPES[ extname( file ) ] || 'application/octet-stream' } ).end( body );
	} catch ( err ) {
		res.writeHead( 404, { 'content-type': 'text/plain' } ).end( 'Not found: ' + path );
	}
}).listen( PORT, () => console.log( 'Serving ' + DIR + ' at http://localhost:' + PORT + '/' ) );
