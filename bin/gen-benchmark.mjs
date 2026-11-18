#!/usr/bin/env node

/**
* Probe-driven benchmark generator.
*
* Reads the JSDoc signature of a module's strided wrapper (`lib/<r>.js`) and
* offset form (`lib/ndarray.js`), picks an argument expression for every
* parameter, and then *probes* the real routine at a small size: whenever a
* call throws, the error message is used to identify the offending argument
* (`invalid argument. Fifth argument ...`) and that argument advances to its
* next candidate; unattributable errors grow the arrays. The first argument
* list that runs (repeatedly, without throwing) is emitted as a benchmark.
*
* Usage:
*   node bin/gen-benchmark.mjs <module-dir>... [--write] [--kind=strided|ndarray]
*
* Without --write, prints the probe outcome only. Exit code 1 if any probe
* failed to find a working argument list.
*/

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';


// VARIABLES //

const PROBE_N = 10;
const ORDINALS = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth' ];
const TENS = { 'twenty': 20, 'thirty': 30, 'forty': 40 };

// Known-good enum values by parameter name (first entry is the default).
const ENUMS = {
	'order': [ 'column-major', 'row-major' ],
	'uplo': [ 'upper', 'lower', 'all' ],
	'trans': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'transa': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'transb': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'trana': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'tranb': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'transr': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'diag': [ 'non-unit', 'unit' ],
	'side': [ 'left', 'right', 'both' ],
	'norm': [ 'max', 'one-norm', 'inf-norm', 'frobenius' ],
	'direct': [ 'forward', 'backward' ],
	'storev': [ 'columnwise', 'rowwise' ],
	'range': [ 'all', 'value', 'index' ],
	'jobz': [ 'compute-vectors', 'no-vectors' ],
	'jobvl': [ 'compute-vectors', 'no-vectors', 'compute', 'none' ],
	'jobvr': [ 'compute-vectors', 'no-vectors', 'compute', 'none' ],
	'jobvs': [ 'compute-vectors', 'no-vectors' ],
	'jobvsl': [ 'compute-vectors', 'no-vectors' ],
	'jobvsr': [ 'compute-vectors', 'no-vectors' ],
	'jobu': [ 'all-columns', 'economy', 'compute-vectors', 'compute', 'overwrite', 'none', 'initialize', 'update' ],
	'jobvt': [ 'all-rows', 'economy', 'overwrite', 'none' ],
	'jobv': [ 'compute-vectors', 'compute', 'compute-v', 'apply-v', 'no-v', 'none', 'initialize', 'update' ],
	'jobq': [ 'compute-vectors', 'compute', 'initialize', 'update', 'none' ],
	'compq': [ 'initialize', 'update', 'none' ],
	'compz': [ 'initialize', 'update', 'none' ],
	'balanc': [ 'both', 'none', 'permute', 'scale' ],
	'sense': [ 'none', 'eigenvalues', 'right-vectors', 'both' ],
	'sort': [ 'not-sorted', 'none', 'sorted', 'sort' ],
	'fact': [ 'not-factored', 'equilibrate', 'factored' ],
	'equed': [ 'none', 'row', 'column', 'both', 'yes' ],
	'howmny': [ 'all', 'backtransform', 'selected', 'select', 'partial' ],
	'vect': [ 'q-only', 'p-only', 'both', 'initialize', 'update', 'no-vectors' ],
	'normin': [ 'no', 'yes' ],
	'type': [ 'general', 'lower', 'upper', 'upper-hessenberg', 'band', 'lower-band', 'upper-band' ],
	'id': [ 'increasing', 'decreasing' ],
	'pivot': [ 'variable', 'top', 'bottom' ],
	'way': [ 'convert', 'revert' ],
	'bmat': [ 'standard', 'generalized' ],
	'initv': [ 'no-init', 'no', 'user' ],
	'eigsrc': [ 'qr', 'no' ],
	'ident': [ 'not-identity', 'identity' ],
	'jobt': [ 'ldl', 'tridiagonal' ]
};

// Integer parameter starting candidates by name (expressions in `N`).
const BAND = [ '2', '1', '0' ];
const INTS = {
	'KL': BAND,
	'KU': BAND,
	'KD': BAND,
	'KA': BAND,
	'KB': BAND,
	'K': [ 'N', '1', '2', '0', 'N-1' ],
	'ilo': [ '1', '0', 'N' ],
	'ihi': [ 'N', 'N-1', '1', '0' ],
	'ILO': [ '1', '0', 'N' ],
	'IHI': [ 'N', 'N-1', '1', '0' ],
	'il': [ '1', '0', 'N' ],
	'iu': [ 'N', 'N-1', '1' ],
	'IL': [ '1', '0', 'N' ],
	'IU': [ 'N', 'N-1', '1' ]
};
const DEFAULT_INTS = [ 'N', '1', '0', '2', 'N-1', 'N / 2', 'N + 1', '2 * N', '3', '-1' ];
const NUMBERS = [ '1.0', '0.5', '2.0', '0.0', '-1.0', '10.0' ];

// Array size tiers (expressions in `N`):
const SIZES_2D = [ 'N * N', '4 * N * N', '16 * N * N' ];
const WORK_2D = [ '(4 * N * N) + (64 * N)', '(16 * N * N) + (256 * N)', '(64 * N * N) + (1024 * N)' ];
const SIZES_1D = [ 'N', '4 * N', '16 * N' ];
const WORK_1D = [ '64 * N', '256 * N', '1024 * N' ];
const RE_WORK = /^(WORK|RWORK|IWORK|BWORK|LWORK|ZWORK|DWORK|SWORK|work|rwork|iwork|bwork)$/;


// FUNCTIONS //

/**
* Parses the JSDoc params + returns of the named function in a file.
*
* @param {string} src - source
* @param {string} fname - function name
* @returns {(Object|null)} signature
*/
function parseSignature( src, fname ) {
	const re = new RegExp( '/\\*\\*((?:(?!\\*/)[\\s\\S])*?)\\*/\\s*function\\s+' + fname + '\\s*\\(([^)]*)\\)' );
	const m = src.match( re );
	if ( !m ) {
		return null;
	}
	const names = m[ 2 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );
	const types = {};
	const pre = /@param\s+\{([^}]+)\}\s+(\[?[\w.]+)/g;
	let pm;
	while ( ( pm = pre.exec( m[ 1 ] ) ) !== null ) {
		// Normalize e.g. "(Complex128Array|null)" to its first non-null alternative:
		types[ pm[ 2 ].replace( /^\[/, '' ) ] = pm[ 1 ].replace( /[()]/g, '' ).split( '|' ).filter( ( a ) => a !== 'null' )[ 0 ] || pm[ 1 ];
	}
	const rm = m[ 1 ].match( /@returns\s+\{([^}]+)\}/ );
	return {
		'params': names.map( ( n ) => ( { 'name': n, 'type': types[ n ] || 'unknown' } ) ),
		'returns': ( rm ) ? rm[ 1 ] : 'void'
	};
}

/**
* Harvests string literals from a module's lib sources.
*
* @param {string} dir - module dir
* @returns {Array<string>} literals
*/
function harvestStrings( dir ) {
	const out = new Set();
	for ( const f of [ 'base.js', 'ndarray.js', basename( dir ) + '.js' ] ) {
		const p = join( dir, 'lib', f );
		if ( !existsSync( p ) ) {
			continue;
		}
		const src = readFileSync( p, 'utf8' ).replace( /\/\*[\s\S]*?\*\//g, '' ).replace( /\/\/.*$/gm, '' );
		for ( const m of src.matchAll( /'([A-Za-z][A-Za-z0-9-]*)'/g ) ) {
			out.add( m[ 1 ] );
		}
	}
	return [ ...out ];
}

/**
* Parses an ordinal-word position from an error message.
*
* @param {string} msg - message
* @returns {integer} zero-based index or -1
*/
function argIndex( msg ) {
	const m = msg.match( /\b([A-Z][a-z]+(?:-[a-z]+)?) argument/ );
	if ( !m ) {
		return -1;
	}
	const w = m[ 1 ].toLowerCase();
	let i = ORDINALS.indexOf( w );
	if ( i >= 0 ) {
		return i;
	}
	const parts = w.split( '-' );
	if ( parts.length === 2 && TENS[ parts[ 0 ] ] ) {
		i = ORDINALS.indexOf( parts[ 1 ] );
		if ( i >= 0 ) {
			return TENS[ parts[ 0 ] ] + i;
		}
	}
	if ( TENS[ w.replace( /ieth$/, 'y' ) ] ) {
		return TENS[ w.replace( /ieth$/, 'y' ) ] - 1;
	}
	return -1;
}

/**
* Builds the candidate list for every parameter.
*
* @param {Object} sig - signature
* @param {boolean} is2d - whether the routine takes matrices
* @param {Array<string>} literals - module string literals
* @returns {Array<Object>} parameter specs
*/
function buildSpecs( sig, is2d, literals ) {
	const names = sig.params.map( ( p ) => p.name );
	return sig.params.map( ( p ) => {
		const n = p.name;
		const t = p.type;
		let kind;
		let cands;
		if ( /Array/.test( t ) && !/^Array/.test( t ) ) {
			const work = RE_WORK.test( n );
			kind = 'array';
			cands = ( is2d ) ? ( work ? WORK_2D : SIZES_2D ) : ( work ? WORK_1D : SIZES_1D );
		} else if ( t === 'string' ) {
			kind = 'enum';
			const known = ENUMS[ n ] || ENUMS[ n.toLowerCase() ] || [];
			cands = [ ...new Set( [ ...known, ...literals ] ) ].map( ( s ) => `'${s}'` );
		} else if ( /^stride/.test( n ) ) {
			kind = 'int';
			const m = n.match( /^stride(\w+?)([12])$/ );
			if ( m && names.includes( `stride${m[ 1 ]}${( m[ 2 ] === '1' ) ? '2' : '1'}` ) ) {
				// Column-major 2D strides with LD = N:
				cands = ( m[ 2 ] === '1' ) ? [ '1', 'N' ] : [ 'N', '1', '2 * N' ];
			} else {
				cands = [ '1', '2' ];
			}
		} else if ( /^offset/.test( n ) ) {
			kind = 'int';
			cands = [ '0' ];
		} else if ( /^LD/i.test( n ) ) {
			kind = 'int';
			cands = [ 'N', '2 * N', '4 * N', '1' ];
		} else if ( t === 'number' ) {
			kind = 'num';
			cands = NUMBERS;
		} else if ( t === 'Complex128' ) {
			kind = 'cplx';
			cands = [ 'new Complex128( 1.0, 0.0 )', 'new Complex128( 0.5, 0.5 )', 'new Complex128( 0.0, 0.0 )' ];
		} else if ( t === 'boolean' ) {
			kind = 'bool';
			cands = [ 'true', 'false' ];
		} else if ( t === 'Function' ) {
			kind = 'fn';
			cands = [ 'select' ];
		} else if ( t === 'Object' ) {
			kind = 'obj';
			cands = [ '{}' ];
		} else if ( /^Array/.test( t ) ) {
			kind = 'obj';
			cands = ( n === 'equed' ) ? [ "[ 'none' ]", "[ 'yes' ]" ] : [ '[ 0 ]' ];
		} else if ( /integer|Integer/.test( t ) ) {
			kind = 'int';
			cands = INTS[ n ] || INTS[ n.toUpperCase() ] || DEFAULT_INTS;
		} else {
			kind = 'unknown';
			cands = [ 'null' ];
		}
		return { 'name': n, 'type': t, 'kind': kind, 'cands': cands, 'idx': 0 };
	}).map( ( s, k ) => {
		s.tag = 1 + ( 3 * k );
		return s;
	});
}

/**
* Evaluates an expression for a parameter spec at size N.
*
* @param {Object} spec - spec
* @param {integer} N - size
* @param {integer} tier - array size tier
* @returns {*} value
*/
function materialize( spec, N, tier ) {
	if ( spec.kind === 'array' ) {
		let len = Function( 'N', `return ${spec.cands[ Math.min( spec.idx + tier, spec.cands.length - 1 ) ]};` )( N );
		if ( spec.type === 'Float64Array' ) {
			// Distinct padding per array so a failed complex reinterpretation
			// ("Invalid typed array length: 2*len") identifies the array:
			len += spec.tag;
		}
		spec.probeLen = len;
		return makeArray( spec.type, len );
	}
	if ( spec.kind === 'fn' ) {
		return select;
	}
	return Function( 'N', 'Complex128', `return ( ${spec.cands[ spec.idx ]} );` )( N, Complex128 );
}

/**
* Selection callback used for routines that take one (never selects).
*
* @returns {boolean} false
*/
function select() {
	return false;
}

/**
* Creates a typed array filled the same way the emitted benchmark does.
*
* @param {string} type - type name
* @param {integer} len - length
* @returns {*} array
*/
function makeArray( type, len ) {
	let i;
	if ( type === 'Complex128Array' ) {
		const buf = new Float64Array( 2 * len );
		for ( i = 0; i < buf.length; i++ ) {
			buf[ i ] = ( Math.random() * 20.0 ) - 10.0;
		}
		return new Complex128Array( buf );
	}
	if ( type === 'Float64Array' ) {
		const a = new Float64Array( len );
		for ( i = 0; i < len; i++ ) {
			a[ i ] = ( Math.random() * 20.0 ) - 10.0;
		}
		return a;
	}
	if ( type === 'Int32Array' ) {
		return new Int32Array( len );
	}
	if ( type === 'Uint8Array' || type === 'BooleanArray' || type === 'Uint8Array|Array' ) {
		return new Uint8Array( len );
	}
	if ( type === 'Float32Array' ) {
		return new Float32Array( len );
	}
	return new Float64Array( len );
}

/**
* Checks whether a return value is NaN-like.
*
* @param {*} v - value
* @returns {boolean} boolean
*/
function isBad( v ) {
	if ( typeof v === 'number' ) {
		return v !== v;
	}
	if ( v instanceof Complex128 ) {
		return v.re !== v.re || v.im !== v.im;
	}
	return false;
}

/**
* Probes a function for a working argument list.
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @returns {Object} result
*/
function probe( fcn, specs ) {
	let tier = 0;
	let lastErr = '';
	for ( let iter = 0; iter < 200; iter++ ) {
		let args;
		try {
			args = specs.map( ( s ) => materialize( s, PROBE_N, tier ) );
		} catch ( e ) {
			return { 'ok': false, 'error': 'materialize: ' + e.message };
		}
		try {
			let v;
			for ( let k = 0; k < 3; k++ ) {
				v = fcn( ...args );
			}
			if ( isBad( v ) ) {
				throw new Error( 'NaN result' );
			}
			return { 'ok': true, 'tier': tier };
		} catch ( e ) {
			lastErr = String( e && e.message || e );
			if ( process.env.DEBUG ) {
				console.error( specs.map( ( s ) => s.cands[ s.idx ] ).join( ', ' ), '=>', ( process.env.DEBUG === '2' ) ? e.stack : lastErr );
			}
			const cm = lastErr.match( /Cannot create property '\w+' on number '(-?[\d.]+)'/ );
			if ( cm ) {
				// An integer-typed parameter that is really a one-element output array:
				const hit = specs.find( ( s, k ) => ( s.kind === 'int' || s.kind === 'num' ) && !/^(stride|offset|LD)/i.test( s.name ) && args[ k ] === Number( cm[ 1 ] ) );
				if ( hit && RE_WORK.test( hit.name ) ) {
					// A workspace documented as a scalar:
					hit.kind = 'array';
					hit.type = 'Float64Array';
					hit.cands = ( specs.is2d ) ? WORK_2D : WORK_1D;
					hit.idx = 0;
					continue;
				}
				if ( hit ) {
					hit.kind = 'obj';
					hit.cands = [ '[ 0 ]' ];
					hit.idx = 0;
					continue;
				}
			}
			const tm = lastErr.match( /Invalid typed array length: (\d+)/ );
			if ( tm ) {
				// A Float64Array (per its JSDoc) that the routine reinterprets as complex:
				const want = Number( tm[ 1 ] ) / 2;
				const hit = specs.find( ( s ) => s.type === 'Float64Array' && s.probeLen === want );
				if ( hit ) {
					hit.type = 'Complex128Array';
					hit.retyped = true;
					continue;
				}
			}
			let i = ( /invalid argument/i.test( lastErr ) ) ? argIndex( lastErr ) : -1;
			if ( i < 0 ) {
				const nm = lastErr.match( /`(\w+)` must be/ );
				if ( nm ) {
					i = specs.findIndex( ( s ) => s.name === nm[ 1 ] );
				}
			}
			if ( i >= 0 && i < specs.length && specs[ i ].kind !== 'enum' && /valid|must be one of/.test( lastErr ) && specs.literals ) {
				// Documented as non-string, validated as an enum:
				specs[ i ].kind = 'enum';
				specs[ i ].type = 'string';
				specs[ i ].cands = specs.literals.map( ( l ) => `'${l}'` );
				specs[ i ].idx = 0;
				continue;
			}
			if ( i >= 0 && i < specs.length && specs[ i ].kind !== 'array' && specs[ i ].idx + 1 < specs[ i ].cands.length ) {
				specs[ i ].idx += 1;
				continue;
			}
			if ( i >= 0 && i < specs.length && specs[ i ].kind === 'array' && specs[ i ].idx + 1 < specs[ i ].cands.length ) {
				specs[ i ].idx += 1;
				continue;
			}
			if ( tier < 2 ) {
				tier += 1;
				continue;
			}
			return { 'ok': false, 'error': lastErr };
		}
	}
	return { 'ok': false, 'error': 'iteration limit: ' + lastErr };
}

/**
* Emits benchmark source.
*
* @param {Object} o - options
* @returns {string} source
*/
function emit( o ) {
	const { routine, importPath, importName, specs, tier, is2d, ret, header } = o;
	const imports = [
		"import bench from '@stdlib/bench/lib/index.js';"
	];
	const types = new Set( specs.filter( ( s ) => s.kind === 'array' ).map( ( s ) => s.type ) );
	const needsUniform = types.has( 'Float64Array' ) || types.has( 'Complex128Array' );
	if ( needsUniform ) {
		imports.push( "import uniform from '@stdlib/random/array/uniform/lib/index.js';" );
	}
	if ( types.has( 'Complex128Array' ) ) {
		imports.push( "import Complex128Array from '@stdlib/array/complex128/lib/index.js';" );
	}
	if ( types.has( 'Int32Array' ) ) {
		imports.push( "import Int32Array from '@stdlib/array/int32/lib/index.js';" );
	}
	if ( types.has( 'Uint8Array' ) || types.has( 'BooleanArray' ) || types.has( 'Uint8Array|Array' ) ) {
		imports.push( "import Uint8Array from '@stdlib/array/uint8/lib/index.js';" );
	}
	if ( types.has( 'Float32Array' ) ) {
		imports.push( "import Float32Array from '@stdlib/array/float32/lib/index.js';" );
	}
	if ( specs.some( ( s ) => s.kind === 'cplx' ) || /^Complex128$/.test( ret ) ) {
		imports.push( "import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';" );
	}
	let check = null;
	if ( /^(number|integer|NonNegativeInteger|PositiveInteger|boolean)$/.test( ret ) ) {
		check = 'isnan( out )';
	} else if ( ret === 'Float64Array' ) {
		check = 'isnan( out[ i % out.length ] )';
	} else if ( ret === 'Complex128' ) {
		check = 'isnan( real( out ) )';
		imports.push( "import real from '@stdlib/complex/float64/real/lib/index.js';" );
	}
	if ( check ) {
		imports.push( "import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';" );
	}
	imports.push( "import pow from '@stdlib/math/base/special/pow/lib/index.js';" );
	imports.push( "import format from '@stdlib/string/format/lib/index.js';" );
	imports.push( "import pkgJson from './../package.json' with { type: 'json' };" );
	imports.push( `import ${importName} from '${importPath}';` );
	if ( specs.some( ( s ) => s.cands[ s.idx ] === 'new Complex128( 1.0, 0.0 )' ) && !imports.some( ( l ) => /complex\/float64\/ctor/.test( l ) ) ) {
		imports.push( "import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';" );
	}

	const decl = [];
	for ( const s of specs ) {
		if ( s.kind !== 'array' ) {
			continue;
		}
		const len = s.cands[ Math.min( s.idx + tier, s.cands.length - 1 ) ];
		if ( s.type === 'Complex128Array' ) {
			decl.push( `\tconst ${s.name} = new Complex128Array( uniform( 2 * ( ${len} ), -10.0, 10.0, options ) );` );
		} else if ( s.type === 'Float64Array' ) {
			decl.push( `\tconst ${s.name} = uniform( ${len}, -10.0, 10.0, options );` );
		} else if ( s.type === 'Int32Array' ) {
			decl.push( `\tconst ${s.name} = new Int32Array( ${len} );` );
		} else if ( s.type === 'Float32Array' ) {
			decl.push( `\tconst ${s.name} = new Float32Array( ${len} );` );
		} else {
			decl.push( `\tconst ${s.name} = new Uint8Array( ${len} );` );
		}
	}
	const args = specs.map( ( s ) => {
		if ( s.kind === 'array' || s.kind === 'fn' ) {
			return ( s.kind === 'fn' ) ? 'select' : s.name;
		}
		return s.cands[ s.idx ].replace( /^N-1$/, 'N - 1' );
	});
	const hasFn = specs.some( ( s ) => s.kind === 'fn' );
	const fnBlock = ( hasFn ) ? [
		'/**',
		'* Eigenvalue selection callback (selects nothing).',
		'*',
		'* @private',
		'* @returns {boolean} boolean',
		'*/',
		'function select() {',
		'\treturn false;',
		'}',
		'',
		''
	].join( '\n' ) : '';
	const loopCheck = ( check ) ? [
		`\t\t\tif ( ${check} ) {`,
		"\t\t\t\tb.fail( 'should not return NaN' );",
		'\t\t\t}'
	].join( '\n' ) + '\n' : '';
	const endCheck = ( check ) ? [
		`\t\tif ( ${check.replace( 'i % out.length', '0' )} ) {`,
		"\t\t\tb.fail( 'should not return NaN' );",
		'\t\t}'
	].join( '\n' ) + '\n' : '';
	const lets = ( ret === 'void' || ret === 'undefined' ) ? 'let i;' : 'let out, i;';
	const call = ( ret === 'void' || ret === 'undefined' ) ? `${importName}( ${args.join( ', ' )} );` : `out = ${importName}( ${args.join( ', ' )} );`;
	const max = ( is2d ) ? ( ( /\/lapack\//.test( o.dir ) ) ? 2 : 3 ) : 6;
	const opts = ( needsUniform ) ? "const options = {\n\t'dtype': 'float64'\n};\n" : '';
	return `${( header ) ? header + '\n' : ''}// MODULES //

${imports.join( '\n' )}


// VARIABLES //

const pkg = pkgJson.name;
${opts}

// FUNCTIONS //

${fnBlock}/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - problem size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
${decl.join( '\n' )}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		${lets}

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
			${call}
${loopCheck}		}
		b.toc();
${endCheck}		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	let N, f, i;

	const min = 1; // 10^min
	const max = ${max}; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:${o.label}N=%d', pkg, N ), f );
	}
}

main();
`;
}

/**
* Returns the leading license comment of a source file, if any.
*
* @param {string} src - source
* @returns {string} header (or empty string)
*/
function licenseHeader( src ) {
	const m = src.match( /^\/\*\*[\s\S]*?\*\// );
	return ( m && /@license/.test( m[ 0 ] ) ) ? m[ 0 ] + '\n' : '';
}

/**
* Processes one benchmark of one module.
*
* @param {string} dir - module dir
* @param {string} kind - 'strided' or 'ndarray'
* @param {boolean} write - whether to write
* @returns {Promise<Object>} result
*/
async function processOne( dir, kind, write ) {
	const routine = basename( dir );
	const libFile = ( kind === 'ndarray' ) ? 'ndarray.js' : `${routine}.js`;
	const libPath = join( dir, 'lib', libFile );
	const benchPath = join( dir, 'benchmark', ( kind === 'ndarray' ) ? 'benchmark.ndarray.js' : 'benchmark.js' );
	if ( !existsSync( libPath ) ) {
		return { 'ok': false, 'error': `missing ${libPath}` };
	}
	const src = readFileSync( libPath, 'utf8' );
	const em = src.match( /export default (\w+);/ );
	const fname = ( em ) ? em[ 1 ] : routine;
	const sig = parseSignature( src, fname );
	if ( !sig ) {
		return { 'ok': false, 'error': `cannot parse signature in ${libPath}` };
	}
	// Fill missing/unhelpful JSDoc types from the sibling files' JSDoc:
	for ( const f of [ 'base.js', 'ndarray.js', `${routine}.js` ] ) {
		const p = join( dir, 'lib', f );
		if ( f === libFile || !existsSync( p ) ) {
			continue;
		}
		const osrc = readFileSync( p, 'utf8' );
		const oem = osrc.match( /export default (\w+);/ );
		const other = parseSignature( osrc, ( oem ) ? oem[ 1 ] : fname );
		if ( !other ) {
			continue;
		}
		for ( const q of sig.params ) {
			if ( q.type === 'unknown' || q.type === '*' ) {
				const o = other.params.find( ( r ) => r.name === q.name );
				if ( o && o.type !== 'unknown' && o.type !== '*' ) {
					q.type = o.type;
				}
			}
		}
	}
	const names = sig.params.map( ( p ) => p.name );
	const is2d = names.some( ( n ) => /^LD/i.test( n ) || /^stride\w+[12]$/.test( n ) || /^(A|B)P$|^AFP$/.test( n ) ) || /\/lapack\//.test( dir );
	const literals = harvestStrings( dir );
	const specs = buildSpecs( sig, is2d, literals );
	specs.is2d = is2d;
	specs.literals = literals;
	const unknown = specs.filter( ( s ) => s.kind === 'unknown' );
	if ( unknown.length ) {
		return { 'ok': false, 'error': `unsupported param types: ${unknown.map( ( s ) => `${s.name}:${s.type}` ).join( ', ' )}` };
	}
	const mod = await import( pathToFileURL( resolve( libPath ) ).href );
	const res = probe( mod.default, specs );
	if ( !res.ok ) {
		return res;
	}
	if ( write ) {
		const old = ( existsSync( benchPath ) ) ? readFileSync( benchPath, 'utf8' ) : '';
		const header = licenseHeader( old ) || licenseHeader( readFileSync( join( dir, 'lib', 'index.js' ), 'utf8' ) ) || '';
		const out = emit({
			'dir': dir,
			'routine': routine,
			'importPath': `./../lib/${libFile}`,
			'importName': routine,
			'specs': specs,
			'tier': res.tier,
			'is2d': is2d,
			'ret': sig.returns,
			'header': header,
			'label': ( kind === 'ndarray' ) ? 'ndarray:' : ''
		});
		writeFileSync( benchPath, out );
	}
	return res;
}


// MAIN //

const argv = process.argv.slice( 2 );
const write = argv.includes( '--write' );
const km = argv.find( ( a ) => a.startsWith( '--kind=' ) );
const kinds = ( km ) ? [ km.slice( 7 ) ] : [ 'strided', 'ndarray' ];
let failed = 0;
for ( const dir of argv.filter( ( a ) => !a.startsWith( '--' ) ) ) {
	for ( const kind of kinds ) {
		let res;
		try {
			res = await processOne( dir.replace( /\/$/, '' ), kind, write );
		} catch ( e ) {
			res = { 'ok': false, 'error': String( e && e.stack || e ).split( '\n' )[ 0 ] };
		}
		if ( res.ok ) {
			console.log( `ok   ${dir} ${kind}` );
		} else {
			failed += 1;
			console.log( `FAIL ${dir} ${kind}: ${res.error}` );
		}
	}
}
process.exitCode = ( failed ) ? 1 : 0;
