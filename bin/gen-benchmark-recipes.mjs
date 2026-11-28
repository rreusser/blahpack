/**
* Structured-input recipes for `bin/gen-benchmark.mjs`.
*
* A uniform random matrix is the wrong input for most of LAPACK.
*
* -   Householder consumers (`xORGQR`, `xUNMTR`, `xLARFT`, ...) multiply by
*     `I - tau v v^H`, which is unitary only for the `TAU`/`V` a factorization
*     produced. Random `TAU` grows the data to Inf at N=100.
* -   Refinement routines (`xxxRFS`) need `AF` to be the factorization of `A`,
*     and `X` a solution of `A X = B`.
* -   Positive-definite routines exit early (`info > 0`) on a matrix that isn't.
* -   Schur-form consumers (`xLAEXC`, `xTGEX2`, ...) need triangular inputs.
*
* A recipe matches a routine family and returns setup code that runs once,
* after the arrays are allocated and before timing. The same code is executed
* by the probe and emitted into the benchmark, so a wrong template fails at
* generation time rather than producing a benchmark that measures nothing.
* Setup code calls the routine's LAPACK *producer* (`xGEQRF` for `xORGQR`,
* `xHETRF` + `xHETRS` for `xHERFS`) through its strided form, column-major
* with leading dimension `N`. Each recipe therefore requires that layout for
* the arrays it touches (checked by `dense`/`vec`), and every dimension `N`.
*
* Setup code may use the loop variables `j` and `k` (declared by the caller),
* `N`, the routine's array arguments by name, the producers by name,
* `reinterpret`, `Float64Array`, `Complex128Array` and `Int32Array`.
*/


// FUNCTIONS //

/**
* Returns lines that make a dense N-by-N matrix Hermitian positive definite in
* the eyes of a routine that reads one triangle: a real diagonal that
* dominates every row (|offdiag| <= 10*sqrt(2), N-1 of them).
*
* @param {Object} ctx - context
* @param {string} name - array name
* @returns {Array<string>} lines
*/
function spdDense( ctx, name ) {
	if ( ctx.cplx ) {
		const v = ctx.tmp( name + 'View' );
		return [
			`const ${v} = reinterpret( ${name}, 0 );`,
			'for ( j = 0; j < N; j++ ) {',
			`\t${v}[ 2 * j * ( N + 1 ) ] += 20.0 * N;`,
			`\t${v}[ ( 2 * j * ( N + 1 ) ) + 1 ] = 0.0;`,
			'}'
		];
	}
	return [
		'for ( j = 0; j < N; j++ ) {',
		`\t${name}[ j * ( N + 1 ) ] += 20.0 * N;`,
		'}'
	];
}

/**
* Returns lines that make the diagonal of a packed or band matrix dominant
* (and real), given the index expression of element (j,j).
*
* @param {Object} ctx - context
* @param {string} name - array name
* @param {string} idx - index of the j-th diagonal element (in elements)
* @returns {Array<string>} lines
*/
function spdAt( ctx, name, idx ) {
	if ( ctx.cplx ) {
		const v = ctx.tmp( name + 'View' );
		return [
			`const ${v} = reinterpret( ${name}, 0 );`,
			'for ( j = 0; j < N; j++ ) {',
			`\t${v}[ 2 * ( ${idx} ) ] += 20.0 * N;`,
			`\t${v}[ ( 2 * ( ${idx} ) ) + 1 ] = 0.0;`,
			'}'
		];
	}
	return [
		'for ( j = 0; j < N; j++ ) {',
		`\t${name}[ ${idx} ] += 20.0 * N;`,
		'}'
	];
}

/**
* Returns the index expression of diagonal element (j,j) of a packed matrix.
*
* @param {string} uplo - chosen `uplo` literal
* @returns {string} expression
*/
function packedDiag( uplo ) {
	return ( uplo === '\'lower\'' ) ? '( j * ( ( 2 * N ) - j + 1 ) ) / 2' : 'j + ( ( j * ( j + 1 ) ) / 2 )';
}

/**
* Returns lines that zero the strictly lower triangle of a dense N-by-N matrix
* (an upper triangular matrix is a Schur form with 1-by-1 blocks).
*
* @param {Object} ctx - context
* @param {string} name - array name
* @returns {Array<string>} lines
*/
function upperTriangular( ctx, name ) {
	if ( ctx.cplx ) {
		const v = ctx.tmp( name + 'View' );
		return [
			`const ${v} = reinterpret( ${name}, 0 );`,
			'for ( j = 0; j < N; j++ ) {',
			'\tfor ( k = j + 1; k < N; k++ ) {',
			`\t\t${v}[ 2 * ( k + ( j * N ) ) ] = 0.0;`,
			`\t\t${v}[ ( 2 * ( k + ( j * N ) ) ) + 1 ] = 0.0;`,
			'\t}',
			'}'
		];
	}
	return [
		'for ( j = 0; j < N; j++ ) {',
		'\tfor ( k = j + 1; k < N; k++ ) {',
		`\t\t${name}[ k + ( j * N ) ] = 0.0;`,
		'\t}',
		'}'
	];
}

/**
* Builds a Householder-consumer recipe: the reflectors come from a producer.
*
* @param {string} prod - producer suffix (e.g. `geqrf`)
* @returns {Function} build function
*/
function householder( prod ) {
	return function build( ctx ) {
		const A = ctx.pick( 'A', 'V' );
		const T = ctx.pick( 'TAU', 'tau' );
		if ( !A || !T || !ctx.dense( A ) || !ctx.vec( T ) || !ctx.allN() ) {
			return null;
		}
		const fn = ctx.p + prod;
		return {
			'producers': [ fn ],
			'lines': [
				`const ${ctx.tmp( 'setupWork' )} = new ${ctx.CA}( 256 * N );`,
				`${fn}( N, N, ${A}, 1, N, 0, ${T}, 1, 0, ${ctx.tmp( 'setupWork' )}, 1, 0 );`
			]
		};
	};
}


// RECIPES //

/**
* Recipes, in priority order. `match` takes the routine name; `build` returns
* `{ producers, lines }` or `null` when the chosen layout doesn't fit.
*/
const RECIPES = [
	{
		'name': 'QR reflectors (xGEQRF)',
		'match': ( r ) => /^[dz](org|ung)(2r|qr)$|^[dz](orm|unm)(2r|qr)$|^[dz]larft$/.test( r ),
		'build': householder( 'geqrf' )
	},
	{
		'name': 'QL reflectors (xGEQLF)',
		'match': ( r ) => /^[dz](org|ung|orm|unm)(2l|ql)$/.test( r ),
		'build': householder( 'geqlf' )
	},
	{
		'name': 'LQ reflectors (xGELQF)',
		'match': ( r ) => /^[dz](org|ung|orm|unm)(l2|lq)$/.test( r ),
		'build': householder( 'gelqf' )
	},
	{
		'name': 'RQ reflectors (xGERQF)',
		'match': ( r ) => /^[dz](org|ung|orm|unm)(r2|rq)$/.test( r ),
		'build': householder( 'gerqf' )
	},
	{
		'name': 'Hessenberg reflectors (xGEHRD)',
		'match': ( r ) => /^[dz](org|ung|orm|unm)hr$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.dense( 'A' ) || !ctx.vec( 'TAU' ) || !ctx.allN() ) {
				return null;
			}
			const fn = ctx.p + 'gehrd';
			const w = ctx.tmp( 'setupWork' );
			return {
				'producers': [ fn ],
				'lines': [
					`const ${w} = new ${ctx.CA}( 256 * N );`,
					`${fn}( N, ${ctx.arg( 'ilo' )}, ${ctx.arg( 'ihi' )}, A, 1, N, 0, TAU, 1, 0, ${w}, 1, 0 );`
				]
			};
		}
	},
	{
		'name': 'Tridiagonal reflectors (xSYTRD/xHETRD)',
		'match': ( r ) => /^[dz](org|ung|orm|unm)tr$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.dense( 'A' ) || !ctx.vec( 'TAU' ) || !ctx.allN() ) {
				return null;
			}
			const fn = ( ctx.cplx ) ? 'zhetrd' : 'dsytrd';
			const [ d, e, w ] = [ ctx.tmp( 'setupD' ), ctx.tmp( 'setupE' ), ctx.tmp( 'setupWork' ) ];
			return {
				'producers': [ fn ],
				'lines': [
					`const ${d} = new Float64Array( N );`,
					`const ${e} = new Float64Array( N );`,
					`const ${w} = new ${ctx.CA}( 256 * N );`,
					`${fn}( ${ctx.arg( 'uplo' )}, N, A, 1, N, 0, ${d}, 1, 0, ${e}, 1, 0, TAU, 1, 0, ${w}, 1, 0 );`
				]
			};
		}
	},
	{
		'name': 'Packed tridiagonal reflectors (xSPTRD/xHPTRD)',
		'match': ( r ) => /^[dz](op|up)(gtr|mtr)$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.vec( 'AP' ) || !ctx.vec( 'TAU' ) || !ctx.allN() ) {
				return null;
			}
			const fn = ( ctx.cplx ) ? 'zhptrd' : 'dsptrd';
			const [ d, e ] = [ ctx.tmp( 'setupD' ), ctx.tmp( 'setupE' ) ];
			return {
				'producers': [ fn ],
				'lines': [
					`const ${d} = new Float64Array( N );`,
					`const ${e} = new Float64Array( N );`,
					`${fn}( ${ctx.arg( 'uplo' )}, N, AP, 1, 0, ${d}, 1, 0, ${e}, 1, 0, TAU, 1, 0 );`
				]
			};
		}
	},
	{
		'name': 'Bidiagonal reflectors (xGEBRD)',
		'match': ( r ) => /^[dz](org|ung|orm|unm)br$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.dense( 'A' ) || !ctx.vec( 'TAU' ) || !ctx.allN() ) {
				return null;
			}
			const fn = ctx.p + 'gebrd';
			const [ d, e, w, t ] = [ ctx.tmp( 'setupD' ), ctx.tmp( 'setupE' ), ctx.tmp( 'setupWork' ), ctx.tmp( 'setupTau' ) ];
			const q = ( ctx.arg( 'vect' ) === '\'apply-Q\'' );
			return {
				'producers': [ fn ],
				'lines': [
					`const ${d} = new Float64Array( N );`,
					`const ${e} = new Float64Array( N );`,
					`const ${t} = new ${ctx.CA}( N );`,
					`const ${w} = new ${ctx.CA}( 256 * N );`,
					`${fn}( N, N, A, 1, N, 0, ${d}, 1, 0, ${e}, 1, 0, ${( q ) ? 'TAU' : t}, 1, 0, ${( q ) ? t : 'TAU'}, 1, 0, ${w}, 1, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of an LU solve (xGETRF + xGETRS)',
		'match': ( r ) => /^[dz]gerfs$|^[dz]la_gerfsx_extended$/.test( r ),
		'build': ( ctx ) => {
			const X = ctx.pick( 'X', 'Y' );
			if ( !X || ![ 'A', 'AF', 'B', X ].every( ( n ) => ctx.dense( n ) ) || !ctx.vec( 'IPIV' ) || !ctx.allN() ) {
				return null;
			}
			const [ f, s ] = [ ctx.p + 'getrf', ctx.p + 'getrs' ];
			return {
				'producers': [ f, s ],
				'lines': [
					ctx.copy( 'AF', 'A' ),
					`${f}( N, N, AF, 1, N, 0, IPIV, 1, 0 );`,
					ctx.copy( X, 'B' ),
					`${s}( ${ctx.arg( 'trans' ) || ctx.arg( 'trans_type' )}, N, ${ctx.arg( 'nrhs' )}, AF, 1, N, 0, IPIV, 1, 0, ${X}, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of a Cholesky solve (xPOTRF + xPOTRS)',
		'match': ( r ) => /^[dz]porfs$|^[dz]la_porfsx_extended$/.test( r ),
		'build': ( ctx ) => {
			const X = ctx.pick( 'X', 'Y' );
			if ( !X || ![ 'A', 'AF', 'B', X ].every( ( n ) => ctx.dense( n ) ) || !ctx.allN() ) {
				return null;
			}
			const [ f, s, u ] = [ ctx.p + 'potrf', ctx.p + 'potrs', ctx.arg( 'uplo' ) ];
			return {
				'producers': [ f, s ],
				'lines': [
					...spdDense( ctx, 'A' ),
					ctx.copy( 'AF', 'A' ),
					`${f}( ${u}, N, AF, 1, N, 0 );`,
					ctx.copy( X, 'B' ),
					`${s}( ${u}, N, ${ctx.arg( 'nrhs' )}, AF, 1, N, 0, ${X}, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of a symmetric/Hermitian indefinite solve (xSYTRF/xHETRF + xSYTRS/xHETRS)',
		'match': ( r ) => /^[dz](sy|he)rfs$|^[dz]la_(sy|he)rfsx_extended$/.test( r ),
		'build': ( ctx ) => {
			const X = ctx.pick( 'X', 'Y' );
			if ( !X || ![ 'A', 'AF', 'B', X ].every( ( n ) => ctx.dense( n ) ) || !ctx.vec( 'IPIV' ) || !ctx.allN() ) {
				return null;
			}
			const t = ctx.routine.match( /(sy|he)rfs/ )[ 1 ];
			const [ f, s, u, w ] = [ ctx.p + t + 'trf', ctx.p + t + 'trs', ctx.arg( 'uplo' ), ctx.tmp( 'setupWork' ) ];
			return {
				'producers': [ f, s ],
				'lines': [
					ctx.copy( 'AF', 'A' ),
					`const ${w} = new ${ctx.CA}( 256 * N );`,
					`${f}( ${u}, N, AF, 1, N, 0, IPIV, 1, 0, ${w}, 1, 0 );`,
					ctx.copy( X, 'B' ),
					`${s}( ${u}, N, ${ctx.arg( 'nrhs' )}, AF, 1, N, 0, IPIV, 1, 0, ${X}, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of a packed symmetric/Hermitian indefinite solve (xSPTRF/xHPTRF + xSPTRS/xHPTRS)',
		'match': ( r ) => /^[dz](sp|hp)rfs$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.vec( 'AP' ) || !ctx.vec( 'AFP' ) || !ctx.vec( 'IPIV' ) || ![ 'B', 'X' ].every( ( n ) => ctx.dense( n ) ) || !ctx.allN() ) {
				return null;
			}
			const t = ctx.routine.slice( 1, 3 );
			const [ f, s, u ] = [ ctx.p + t + 'trf', ctx.p + t + 'trs', ctx.arg( 'uplo' ) ];
			return {
				'producers': [ f, s ],
				'lines': [
					ctx.copy( 'AFP', 'AP' ),
					`${f}( ${u}, N, AFP, 1, 0, IPIV, 1, 0 );`,
					ctx.copy( 'X', 'B' ),
					`${s}( ${u}, N, ${ctx.arg( 'nrhs' )}, AFP, 1, 0, IPIV, 1, 0, X, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of a packed Cholesky solve (xPPTRF + xPPTRS)',
		'match': ( r ) => /^[dz]pprfs$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.vec( 'AP' ) || !ctx.vec( 'AFP' ) || ![ 'B', 'X' ].every( ( n ) => ctx.dense( n ) ) || !ctx.allN() ) {
				return null;
			}
			const [ f, s, u ] = [ ctx.p + 'pptrf', ctx.p + 'pptrs', ctx.arg( 'uplo' ) ];
			return {
				'producers': [ f, s ],
				'lines': [
					...spdAt( ctx, 'AP', packedDiag( u ) ),
					ctx.copy( 'AFP', 'AP' ),
					`${f}( ${u}, N, AFP, 1, 0 );`,
					ctx.copy( 'X', 'B' ),
					`${s}( ${u}, N, ${ctx.arg( 'nrhs' )}, AFP, 1, 0, X, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of a positive definite tridiagonal solve (xPTTRF + xPTTRS)',
		'match': ( r ) => /^[dz]ptrfs$/.test( r ),
		'build': ( ctx ) => {
			if ( ![ 'd', 'e', 'DF', 'EF' ].every( ( n ) => ctx.vec( n ) ) || ![ 'B', 'X' ].every( ( n ) => ctx.dense( n ) ) || !ctx.allN() ) {
				return null;
			}
			const [ f, s ] = [ ctx.p + 'pttrf', ctx.p + 'pttrs' ];
			const solveHead = ( ctx.cplx ) ? `${s}( ${ctx.arg( 'uplo' )}, N,` : `${s}( N,`;
			return {
				'producers': [ f, s ],
				'lines': [
					// |e| <= 10*sqrt(2), so d >= 30 dominates both neighbors:
					'for ( j = 0; j < N; j++ ) {',
					'\td[ j ] += 40.0;',
					'}',
					ctx.copy( 'DF', 'd' ),
					ctx.copy( 'EF', 'e' ),
					`${f}( N, DF, 1, 0, EF, 1, 0 );`,
					ctx.copy( 'X', 'B' ),
					`${solveHead} ${ctx.arg( 'nrhs' )}, DF, 1, 0, EF, 1, 0, X, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Refinement of a general tridiagonal solve (xGTTRF + xGTTRS)',
		'match': ( r ) => /^[dz]gtrfs$/.test( r ),
		'build': ( ctx ) => {
			if ( ![ 'DL', 'd', 'DU', 'DLF', 'DF', 'DUF', 'DU2', 'IPIV' ].every( ( n ) => ctx.vec( n ) ) || ![ 'B', 'X' ].every( ( n ) => ctx.dense( n ) ) || !ctx.allN() ) {
				return null;
			}
			const [ f, s ] = [ ctx.p + 'gttrf', ctx.p + 'gttrs' ];
			return {
				'producers': [ f, s ],
				'lines': [
					ctx.copy( 'DLF', 'DL' ),
					ctx.copy( 'DF', 'd' ),
					ctx.copy( 'DUF', 'DU' ),
					`${f}( N, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );`,
					ctx.copy( 'X', 'B' ),
					`${s}( ${ctx.arg( 'trans' )}, N, ${ctx.arg( 'nrhs' )}, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 1, N, 0 );`
				]
			};
		}
	},
	{
		'name': 'Positive definite dense matrix',
		'match': ( r ) => /^[dz]po(trf|tf2|trf2|sv|svx|equ|equb|trs|tri|con)$|^[dz]pst(f2|rf)$|^[dz](sy|he)gvx?$/.test( r ),
		'build': ( ctx ) => {
			// The generalized drivers need B positive definite; the rest, A:
			const name = ( /gvx?$/.test( ctx.routine ) ) ? 'B' : 'A';
			if ( !ctx.dense( name ) || !ctx.allN() ) {
				return null;
			}
			return { 'producers': [], 'lines': spdDense( ctx, name ) };
		}
	},
	{
		'name': 'Positive definite packed matrix',
		'match': ( r ) => /^[dz]pp(trf|sv|svx|equ|trs|tri|con)$|^[dz](sp|hp)gvx?$/.test( r ),
		'build': ( ctx ) => {
			const name = ( /gvx?$/.test( ctx.routine ) ) ? 'BP' : 'AP';
			if ( !ctx.vec( name ) || !ctx.allN() ) {
				return null;
			}
			return { 'producers': [], 'lines': spdAt( ctx, name, packedDiag( ctx.arg( 'uplo' ) ) ) };
		}
	},
	{
		'name': 'Positive definite band matrix',
		'match': ( r ) => /^[dz]pb(trf|tf2|sv|svx|equ|trs|con|stf)$|^[dz](sb|hb)gvx?$/.test( r ),
		'build': ( ctx ) => {
			const gv = /gvx?$/.test( ctx.routine );
			const name = ( gv ) ? 'BB' : 'AB';
			const kd = ctx.arg( ( gv ) ? 'kb' : 'kd' );
			const ld = ctx.ld( name );
			if ( !kd || !ld || ctx.stride1( name ) !== '1' || ctx.offset( name ) !== '0' || !ctx.allN() ) {
				return null;
			}
			const idx = ( ctx.arg( 'uplo' ) === '\'lower\'' ) ? `j * ${ld}` : `${kd} + ( j * ${ld} )`;
			return { 'producers': [], 'lines': spdAt( ctx, name, idx ) };
		}
	},
	{
		'name': 'Positive definite tridiagonal matrix',
		'match': ( r ) => /^[dz]pt(trf|sv|svx|trs|con|eqr)$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.vec( 'd' ) || !ctx.allN() ) {
				return null;
			}
			return { 'producers': [], 'lines': [ 'for ( j = 0; j < N; j++ ) {', '\td[ j ] += 40.0;', '}' ] };
		}
	},
	{
		'name': 'Upper triangular (Schur form with 1-by-1 blocks)',
		'match': ( r ) => /^[dz](laexc|trexc|tgex2|tgexc|tgsy2|tgsyl|trsyl|trsen|tgsen|tgevc)$/.test( r ),
		'build': ( ctx ) => {
			const names = [ 'T', 'A', 'B', 'D', 'E', 'S', 'P' ].filter( ( n ) => ctx.has( n ) && ctx.isMatrix( n ) );
			if ( !names.length || !names.every( ( n ) => ctx.dense( n ) ) || !ctx.allN() ) {
				return null;
			}
			return { 'producers': [], 'lines': names.flatMap( ( n ) => upperTriangular( ctx, n ) ) };
		}
	},
	{
		'name': 'Eigenvalues of the tridiagonal matrix (DSTEBZ)',
		'match': ( r ) => /^[dz]stein$/.test( r ),
		'build': ( ctx ) => {
			if ( ![ 'd', 'e', 'w', 'IBLOCK', 'ISPLIT' ].every( ( n ) => ctx.vec( n ) ) || !ctx.allN() ) {
				return null;
			}
			const [ m, ns, w, iw ] = [ ctx.tmp( 'setupM' ), ctx.tmp( 'setupNsplit' ), ctx.tmp( 'setupWork' ), ctx.tmp( 'setupIwork' ) ];
			return {
				'producers': [ 'dstebz' ],
				'lines': [
					`const ${m} = new Int32Array( 1 );`,
					`const ${ns} = new Int32Array( 1 );`,
					`const ${w} = new Float64Array( 4 * N );`,
					`const ${iw} = new Int32Array( 3 * N );`,
					`dstebz( 'all', 'block', N, 0.0, 0.0, 1, N, 0.0, d, 1, 0, e, 1, 0, ${m}, ${ns}, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, ${w}, 1, 0, ${iw}, 1, 0 );`
				]
			};
		}
	},
	{
		'name': 'Sorted eigenvalues',
		'match': ( r ) => /^ddisna$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.vec( 'd' ) ) {
				return null;
			}
			return { 'producers': [], 'lines': [ 'd.sort();' ] };
		}
	},
	{
		'name': 'Positive qd array',
		'match': ( r ) => /^dlasq2$/.test( r ),
		'build': ( ctx ) => {
			if ( !ctx.vec( 'z' ) ) {
				return null;
			}
			return { 'producers': [], 'lines': [ 'for ( j = 0; j < z.length; j++ ) {', '\tif ( z[ j ] < 0.0 ) {', '\t\tz[ j ] = -z[ j ];', '\t}', '}' ] };
		}
	}
];


// EXPORTS //

export default RECIPES;
