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

import dsaup2 = require( './index' );


// TESTS //

// The function returns a number...
{
	dsaup2( {}, new Int32Array( 1 ), 'standard', 4, 'LM', new Int32Array( 1 ), new Int32Array( 1 ), 0.0, new Float64Array( 4 ), 1, 1, 1, new Int32Array( 1 ), new Float64Array( 16 ), 4, new Float64Array( 8 ), 4, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 16 ), 4, new Float64Array( 12 ), new Int32Array( 3 ), new Float64Array( 12 ), 1 ); // $ExpectType number
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dsaup2(); // $ExpectError
}

// The ndarray method returns a number...
{
	dsaup2.ndarray( {}, new Int32Array( 1 ), 'standard', 4, 'LM', new Int32Array( 1 ), new Int32Array( 1 ), 0.0, new Float64Array( 4 ), 1, 0, 1, 1, 1, new Int32Array( 1 ), new Float64Array( 16 ), 1, 4, 0, new Float64Array( 8 ), 1, 4, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 12 ), 1, 0, new Int32Array( 3 ), 1, 0, new Float64Array( 12 ), 1, 0, 1 ); // $ExpectType number
}

// The compiler throws an error if the ndarray method is provided an unsupported number of arguments...
{
	dsaup2.ndarray(); // $ExpectError
}
