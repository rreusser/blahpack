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

import ztrtrs = require( './index' );


// TESTS //

// The function returns a number...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztrtrs( 10, 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( true, 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( null, 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( undefined, 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( [], 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( {}, 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztrtrs( 'row-major', 10, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', true, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', null, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', undefined, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', [], 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', {}, 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 10, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', true, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', null, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', undefined, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', [], 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', {}, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	ztrtrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztrtrs(); // $ExpectError
	ztrtrs( 'row-major' ); // $ExpectError
}
