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

import dlabad = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dlabad( 10, 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlabad( '10', 10 ); // $ExpectError
	dlabad( true, 10 ); // $ExpectError
	dlabad( false, 10 ); // $ExpectError
	dlabad( null, 10 ); // $ExpectError
	dlabad( undefined, 10 ); // $ExpectError
	dlabad( [], 10 ); // $ExpectError
	dlabad( {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlabad( 10, '10' ); // $ExpectError
	dlabad( 10, true ); // $ExpectError
	dlabad( 10, false ); // $ExpectError
	dlabad( 10, null ); // $ExpectError
	dlabad( 10, undefined ); // $ExpectError
	dlabad( 10, [] ); // $ExpectError
	dlabad( 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlabad(); // $ExpectError
	dlabad( 10 ); // $ExpectError
}
