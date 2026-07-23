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

import ztfsm = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztfsm( 10, 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( true, 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( null, 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( undefined, 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( [], 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( {}, 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztfsm( 'no-transpose', 10, 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', true, 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', null, 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', undefined, 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', [], 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', {}, 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 10, 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', true, 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', null, 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', undefined, 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', [], 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', {}, 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 10, 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', true, 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', null, 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', undefined, 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', [], 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', {}, 'unit', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', true, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', null, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', undefined, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', [], 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', {}, 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', '10', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', true, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', false, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', null, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', undefined, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', [], 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', {}, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, '10', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, true, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, false, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, null, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, [], 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, {}, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, '10', new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, true, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, false, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, null, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, [], new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, {}, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, '10', new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, 10, new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, true, new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, null, new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, [], new Float64Array( 25 ) ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	ztfsm( 'no-transpose', 'left', 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztfsm(); // $ExpectError
	ztfsm( 'no-transpose' ); // $ExpectError
}
