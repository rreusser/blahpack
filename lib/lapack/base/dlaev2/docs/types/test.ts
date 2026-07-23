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

import dlaev2 = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dlaev2( 10, 10, 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlaev2( '10', 10, 10 ); // $ExpectError
	dlaev2( true, 10, 10 ); // $ExpectError
	dlaev2( false, 10, 10 ); // $ExpectError
	dlaev2( null, 10, 10 ); // $ExpectError
	dlaev2( undefined, 10, 10 ); // $ExpectError
	dlaev2( [], 10, 10 ); // $ExpectError
	dlaev2( {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlaev2( 10, '10', 10 ); // $ExpectError
	dlaev2( 10, true, 10 ); // $ExpectError
	dlaev2( 10, false, 10 ); // $ExpectError
	dlaev2( 10, null, 10 ); // $ExpectError
	dlaev2( 10, undefined, 10 ); // $ExpectError
	dlaev2( 10, [], 10 ); // $ExpectError
	dlaev2( 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlaev2( 10, 10, '10' ); // $ExpectError
	dlaev2( 10, 10, true ); // $ExpectError
	dlaev2( 10, 10, false ); // $ExpectError
	dlaev2( 10, 10, null ); // $ExpectError
	dlaev2( 10, 10, undefined ); // $ExpectError
	dlaev2( 10, 10, [] ); // $ExpectError
	dlaev2( 10, 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlaev2(); // $ExpectError
	dlaev2( 10 ); // $ExpectError
}
