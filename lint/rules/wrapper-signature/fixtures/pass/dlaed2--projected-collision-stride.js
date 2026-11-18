// PASS — collision-form stride in the strided projection. In base.js, array
// `Q2` sits beside the 2-D matrix `Q`, whose second stride is `strideQ2`, so
// Q2's stride is disambiguated as `strideQ21`. Projected, Q carries `LDQ`,
// and `strideQ21` keeps its base.js name.
function dlaed2( order, N, n1, d, strideD, Q, LDQ, Q2, strideQ21 ) {
	return order + N + n1 + d[ 0 ] + strideD + Q[ 0 ] + LDQ + Q2[ 0 ] + strideQ21;
}
export default dlaed2;
