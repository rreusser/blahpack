/**
* Routine taxonomy for the documentation site.
*
* Everything here is derived from a routine's name and its spec. The labels
* follow the standard BLAS/LAPACK naming scheme (LAPACK Users' Guide §2.1.3),
* so they are reference data, not prose about any one routine.
*
* @module bin/docs/taxonomy
*/

// LAPACK matrix-type codes (characters 2–3 of the routine name).
export const MATRIX_TYPES = {
	'bd': 'Bidiagonal',
	'di': 'Diagonal',
	'gb': 'General band',
	'ge': 'General',
	'gg': 'General pair (generalized problems)',
	'gt': 'General tridiagonal',
	'hb': 'Hermitian band',
	'he': 'Hermitian',
	'hf': 'Hermitian, rectangular full packed (RFP)',
	'hg': 'Upper Hessenberg / triangular pair',
	'hp': 'Hermitian packed',
	'hs': 'Upper Hessenberg',
	'la': 'Auxiliary',
	'lag': 'Auxiliary',
	'op': 'Orthogonal, packed storage',
	'or': 'Orthogonal',
	'pb': 'Symmetric/Hermitian positive definite band',
	'pf': 'Symmetric/Hermitian positive definite, RFP',
	'po': 'Symmetric/Hermitian positive definite',
	'pp': 'Symmetric/Hermitian positive definite packed',
	'ps': 'Symmetric/Hermitian positive semidefinite (pivoted)',
	'pt': 'Symmetric/Hermitian positive definite tridiagonal',
	'sb': 'Symmetric band',
	'sf': 'Symmetric, rectangular full packed (RFP)',
	'sp': 'Symmetric packed',
	'st': 'Symmetric tridiagonal',
	'sy': 'Symmetric',
	'tb': 'Triangular band',
	'tf': 'Triangular, rectangular full packed (RFP)',
	'tg': 'Triangular pair (generalized)',
	'tp': 'Triangular packed',
	'tr': 'Triangular',
	'tz': 'Trapezoidal',
	'un': 'Unitary',
	'up': 'Unitary, packed storage'
};

// Order in which LAPACK groups are listed (most-used first, then storage variants).
const LAPACK_ORDER = [ 'ge', 'gb', 'gt', 'po', 'pp', 'pf', 'pb', 'pt', 'ps', 'sy', 'sp', 'sf', 'sb', 'st', 'he', 'hp', 'hf', 'hb', 'tr', 'tp', 'tf', 'tb', 'tz', 'or', 'op', 'un', 'up', 'hs', 'hg', 'gg', 'tg', 'bd', 'di', 'la', 'other' ];

export const PRECISIONS = {
	'd': 'real',
	'z': 'complex',
	'i': 'integer'
};

export const PACKAGES = {
	'blas': {
		'title': 'BLAS',
		'long': 'Basic Linear Algebra Subprograms',
		'source': 'Reference BLAS 3.12.0'
	},
	'lapack': {
		'title': 'LAPACK',
		'long': 'Linear Algebra PACKage',
		'source': 'Reference LAPACK 3.12.0'
	},
	'arpack': {
		'title': 'ARPACK',
		'long': 'ARnoldi PACKage: large-scale eigenvalue problems',
		'source': 'ARPACK-NG'
	}
};

export const BLAS_LEVELS = {
	'1': 'Level 1: vector operations',
	'2': 'Level 2: matrix-vector operations',
	'3': 'Level 3: matrix-matrix operations'
};

const BLAS3_SUFFIX = /(mm|sm|rk|r2k)$/;
const MATRIX_ROLES = new Set([ 'matrix', 'banded', 'packed' ]);

/**
* Returns the precision of a routine from its leading character(s).
*
* @param {string} name - routine name
* @returns {string} precision label
*/
export function precision( name ) {
	if ( /^(dz|zd|iz|dc)/.test( name ) && name !== 'dcopy' ) {
		return 'mixed';
	}
	return PRECISIONS[ name[ 0 ] ] || 'other';
}

/**
* Classifies a routine into a navigation group.
*
* @param {string} pkg - package name
* @param {string} name - routine name
* @param {(Object|null)} spec - routine spec
* @returns {Object} group key, label and sort rank
*/
export function classify( pkg, name, spec ) {
	if ( pkg === 'blas' ) {
		let level = '1';
		const matrices = ( spec ? spec.params : [] ).filter( ( p ) => MATRIX_ROLES.has( p.role ) );
		if ( BLAS3_SUFFIX.test( name ) ) {
			level = '3';
		} else if ( matrices.length > 0 ) {
			level = '2';
		}
		return { 'key': 'level' + level, 'label': BLAS_LEVELS[ level ], 'rank': Number( level ) };
	}
	if ( pkg === 'lapack' ) {
		const code = name.slice( 1, 3 );
		let key = MATRIX_TYPES[ code ] ? code : 'other';
		if ( !/^[dz]/.test( name ) ) {
			key = 'other';
		}
		const label = ( key === 'other' ) ? 'Utilities and machine parameters' : MATRIX_TYPES[ key ];
		return { 'key': key, 'label': label, 'rank': LAPACK_ORDER.indexOf( key ) };
	}
	return { 'key': pkg, 'label': PACKAGES[ pkg ] ? PACKAGES[ pkg ].long : pkg, 'rank': 0 };
}

/**
* Returns the precision-independent "stem" used to pair sibling routines (dgesv ↔ zgesv, dsytrf ↔ zhetrf).
*
* @param {string} name - routine name
* @returns {string} stem
*/
export function stem( name ) {
	return name.replace( /^(dz|zd|iz|id|d|z|i)/, '' ).replace( /^(he|sy)/, 'SY' ).replace( /^(un|or)/, 'OR' ).replace( /^(hp|sp)/, 'SP' ).replace( /^(hb|sb)/, 'SB' ).replace( /^(up|op)/, 'OP' );
}
