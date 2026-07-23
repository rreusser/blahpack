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

import dlaisnan = require( './index' );


// TESTS //

// The function returns a boolean...
{
	dlaisnan( 10, 10 ); // $ExpectType boolean
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlaisnan( '10', 10 ); // $ExpectError
	dlaisnan( true, 10 ); // $ExpectError
	dlaisnan( false, 10 ); // $ExpectError
	dlaisnan( null, 10 ); // $ExpectError
	dlaisnan( undefined, 10 ); // $ExpectError
	dlaisnan( [], 10 ); // $ExpectError
	dlaisnan( {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlaisnan( 10, '10' ); // $ExpectError
	dlaisnan( 10, true ); // $ExpectError
	dlaisnan( 10, false ); // $ExpectError
	dlaisnan( 10, null ); // $ExpectError
	dlaisnan( 10, undefined ); // $ExpectError
	dlaisnan( 10, [] ); // $ExpectError
	dlaisnan( 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlaisnan(); // $ExpectError
	dlaisnan( 10 ); // $ExpectError
}
