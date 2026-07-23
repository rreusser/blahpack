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

import dlatrs = require( './index' );


// TESTS //

// The function returns a number...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dlatrs( 10, 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( true, 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( null, 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( undefined, 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( [], 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( {}, 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dlatrs( 'row-major', 10, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', true, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', null, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', undefined, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', [], 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', {}, 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 10, 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', true, 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', null, 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', undefined, 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', [], 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', {}, 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 10, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', true, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', null, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', undefined, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', [], 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', {}, 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, '10', 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, true, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, null, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, undefined, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, [], 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, {}, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, '10', 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, true, 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, null, 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, undefined, 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, [], 10 ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	dlatrs( 'row-major', 'upper', 'no-transpose', 'unit', 'no-transpose', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dlatrs(); // $ExpectError
	dlatrs( 'row-major' ); // $ExpectError
}
