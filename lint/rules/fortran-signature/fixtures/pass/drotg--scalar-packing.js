// PASS — output scalars packed into caller arrays.
// Fortran: SUBROUTINE DROTG(DA,DB,C,S)  (four inout scalars)
// A JS by-value parameter cannot return a written scalar, so DA,DB are packed
// into `ab` and C,S into `cs`. The count lands within the flexible range the
// four scalar-inout slots allow.
function drotg( ab, strideAB, offsetAB, cs, strideCS, offsetCS ) {
	return ab[ offsetAB ] + cs[ offsetCS ] + strideAB + strideCS;
}
export default drotg;
