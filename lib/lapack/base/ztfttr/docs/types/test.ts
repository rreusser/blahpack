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

import ztfttr = require( './index' );


// TESTS //

// The function returns a number...
{
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztfttr( 10, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( true, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( null, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( undefined, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( [], 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( {}, 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztfttr( 'row-major', 10, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', true, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', null, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', undefined, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', [], 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', {}, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztfttr( 'row-major', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', true, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', null, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', [], 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztfttr( 'row-major', 'no-transpose', 'upper', '10', new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', true, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', false, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', null, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', [], new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', {}, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), '10', 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), true, 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), null, 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), undefined, 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), [], 10 ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), '10' ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), true ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), false ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), null ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), [] ); // $ExpectError
	ztfttr( 'row-major', 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztfttr(); // $ExpectError
	ztfttr( 'row-major' ); // $ExpectError
}
