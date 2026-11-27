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

import dsapps from './index';


// TESTS //

// The function returns void...
{
	dsapps( 5, 2, 1, new Float64Array( 1 ), 1, new Float64Array( 15 ), 5, new Float64Array( 6 ), 3, new Float64Array( 5 ), 1, new Float64Array( 9 ), 3, new Float64Array( 10 ), 1 ); // $ExpectType void
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dsapps(); // $ExpectError
}

// The ndarray method returns void...
{
	dsapps.ndarray( 5, 2, 1, new Float64Array( 1 ), 1, 0, new Float64Array( 15 ), 1, 5, 0, new Float64Array( 6 ), 1, 3, 0, new Float64Array( 5 ), 1, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 10 ), 1, 0 ); // $ExpectType void
}

// The compiler throws an error if the ndarray method is provided an unsupported number of arguments...
{
	dsapps.ndarray(); // $ExpectError
}
