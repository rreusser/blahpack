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

/// <reference types="@stdlib/types"/>

import { Complex128Array } from '@stdlib/types/array';

import zrot = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	zrot( 10, 10, 10, 10, 10, 10, 10 ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zrot( '10', 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( true, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( false, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( null, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( undefined, 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( [], 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( {}, 10, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zrot( 10, '10', 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, true, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, false, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, null, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, undefined, 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, [], 10, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, {}, 10, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zrot( 10, 10, '10', 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, true, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, false, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, null, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, undefined, 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, [], 10, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, {}, 10, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zrot( 10, 10, 10, '10', 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, true, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, false, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, null, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, undefined, 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, [], 10, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, {}, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zrot( 10, 10, 10, 10, '10', 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, true, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, false, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, null, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, undefined, 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, [], 10, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zrot( 10, 10, 10, 10, 10, '10', 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, true, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, false, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, null, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, undefined, 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, [], 10 ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zrot( 10, 10, 10, 10, 10, 10, '10' ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, 10, true ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, 10, false ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, 10, null ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, 10, undefined ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, 10, [] ); // $ExpectError
	zrot( 10, 10, 10, 10, 10, 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zrot(); // $ExpectError
	zrot( 10 ); // $ExpectError
}
