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

import dlapmt = require( './index' );


// TESTS //

// The function returns void...
{
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType void
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlapmt( '10', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlapmt( true, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlapmt( true, 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlapmt( true, 10, 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlapmt( true, 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	dlapmt( true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlapmt(); // $ExpectError
	dlapmt( true ); // $ExpectError
}
