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

import dlasq4 = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlasq4( '10', 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( true, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( false, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( null, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( undefined, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( [], 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( {}, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlasq4( 10, '10', 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, true, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, false, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, null, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, undefined, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, [], 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, {}, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlasq4( 10, 10, '10', 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, true, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, false, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, null, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, undefined, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, [], 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, {}, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlasq4( 10, 10, 10, '10', 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, true, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, false, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, null, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, undefined, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, [], 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, {}, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, '10', 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, true, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, false, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, null, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, undefined, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, [], 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, {}, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, '10', 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, true, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, false, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, null, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, undefined, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, [], 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, {}, 10, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, '10', 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, true, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, false, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, null, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, undefined, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, [], 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, {}, 10, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, '10', 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, true, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, false, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, null, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, undefined, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, [], 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, {}, 10, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, '10', 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, true, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, false, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, null, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, undefined, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, [], 10, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, {}, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, '10', 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, true, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, false, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, null, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, undefined, 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, [], 10, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, {}, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, '10', 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, true, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, false, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, null, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, undefined, 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, [], 10, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, {}, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, '10', 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, true, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, false, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, null, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, undefined, 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, [], 10, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, {}, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, '10', 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, true, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, false, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, null, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, undefined, 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, [], 10, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, '10', 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, true, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, false, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, null, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, undefined, 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, [], 10 ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifteenth argument of invalid type...
{
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, '10' ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, true ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, false ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, null ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, undefined ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, [] ); // $ExpectError
	dlasq4( 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlasq4(); // $ExpectError
	dlasq4( 10 ); // $ExpectError
}
