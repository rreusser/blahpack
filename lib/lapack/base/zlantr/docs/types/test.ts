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

import zlantr = require( './index' );


// TESTS //

// The function returns a number...
{
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zlantr( 10, 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( true, 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( null, 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( undefined, 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( [], 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( {}, 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zlantr( 'no-transpose', 10, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', true, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', null, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', undefined, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', [], 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', {}, 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 'unit', '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 'unit', 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	zlantr( 'no-transpose', 'upper', 'unit', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zlantr(); // $ExpectError
	zlantr( 'no-transpose' ); // $ExpectError
}
