/*
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import dgesvd = require( './index' );


// TESTS //

// The function returns a number...
{
	const A = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const U = new Float64Array( 9 );
	const VT = new Float64Array( 9 );
	dgesvd( 'row-major', 'all-columns', 'all-rows', 3, 3, A, 3, s, 1, U, 3, VT, 3 ); // $ExpectType number
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dgesvd(); // $ExpectError
	dgesvd( 'row-major' ); // $ExpectError
}

// Attached to the main export is an `ndarray` method which returns a number...
{
	const A = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const U = new Float64Array( 9 );
	const VT = new Float64Array( 9 );
	dgesvd.ndarray( 'all-columns', 'all-rows', 3, 3, A, 1, 3, 0, s, 1, 0, U, 1, 3, 0, VT, 1, 3, 0 ); // $ExpectType number
}
