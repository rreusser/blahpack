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

import izmax1 = require( './index' );


// TESTS //

// The function returns a Float64Array...
{
	izmax1( 10 ); // $ExpectType Float64Array
}

// The compiler throws an error if the function is provided a first argument which is not a number...
{
	izmax1( '10' ); // $ExpectError
	izmax1( true ); // $ExpectError
	izmax1( false ); // $ExpectError
	izmax1( null ); // $ExpectError
	izmax1( undefined ); // $ExpectError
	izmax1( [] ); // $ExpectError
	izmax1( {} ); // $ExpectError
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	izmax1(); // $ExpectError
}
