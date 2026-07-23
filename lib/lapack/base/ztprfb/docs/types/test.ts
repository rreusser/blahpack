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

import ztprfb = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztprfb( 10, 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( true, 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( null, 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( undefined, 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( [], 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( {}, 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztprfb( 'row-major', 10, 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', true, 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', null, 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', undefined, 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', [], 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', {}, 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztprfb( 'row-major', 'left', 10, 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', true, 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', null, 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', undefined, 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', [], 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', {}, 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 10, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', true, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', null, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', undefined, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', [], 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', {}, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', true, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', null, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', undefined, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', [], 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', {}, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', '10', 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', true, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', false, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', null, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', undefined, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', [], 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', {}, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, '10', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, false, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifteenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixteenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventeenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighteenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a nineteenth argument of invalid type...
{
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	ztprfb( 'row-major', 'left', 'no-transpose', 'no-transpose', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztprfb(); // $ExpectError
	ztprfb( 'row-major' ); // $ExpectError
}
