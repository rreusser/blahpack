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

import dlags2 = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dlags2( true, 10, 10, 10, 10, 10, 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlags2( '10', 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( null, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( undefined, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( [], 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( {}, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlags2( true, '10', 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, true, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, false, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, null, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, undefined, 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, [], 10, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, {}, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlags2( true, 10, '10', 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, true, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, false, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, null, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, undefined, 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, [], 10, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, {}, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlags2( true, 10, 10, '10', 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, true, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, false, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, null, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, undefined, 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, [], 10, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, {}, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlags2( true, 10, 10, 10, '10', 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, true, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, false, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, null, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, undefined, 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, [], 10, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlags2( true, 10, 10, 10, 10, '10', 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, true, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, false, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, null, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, undefined, 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, [], 10 ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlags2( true, 10, 10, 10, 10, 10, '10' ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, 10, true ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, 10, false ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, 10, null ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, 10, undefined ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, 10, [] ); // $ExpectError
	dlags2( true, 10, 10, 10, 10, 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlags2(); // $ExpectError
	dlags2( true ); // $ExpectError
}
