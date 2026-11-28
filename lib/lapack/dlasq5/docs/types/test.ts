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

import dlasq5 = require( './index' );


// TESTS //

// The function returns a Float64Array...
{
	dlasq5( 10 ); // $ExpectType Float64Array
}

// The compiler throws an error if the function is provided a first argument which is not a number...
{
	dlasq5( '10' ); // $ExpectError
	dlasq5( true ); // $ExpectError
	dlasq5( false ); // $ExpectError
	dlasq5( null ); // $ExpectError
	dlasq5( undefined ); // $ExpectError
	dlasq5( [] ); // $ExpectError
	dlasq5( {} ); // $ExpectError
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dlasq5(); // $ExpectError
}
