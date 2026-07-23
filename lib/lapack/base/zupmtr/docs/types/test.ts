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

import zupmtr = require( './index' );


// TESTS //

// The function returns a number...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zupmtr( 10, 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( true, 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( null, 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( undefined, 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( [], 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( {}, 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zupmtr( 'left', 10, 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', true, 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', null, 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', undefined, 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', [], 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', {}, 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zupmtr( 'left', 'upper', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', true, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', null, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', undefined, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', [], 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', {}, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', '10', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', true, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', false, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', null, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', [], 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, '10', new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, true, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, false, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, null, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, [], new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, {}, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, '10', new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, true, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, null, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, [], new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, {}, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), '10', 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), true, 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), null, 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), [], 10, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), '10', new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), true, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), false, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), null, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), undefined, new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), [], new Float64Array( 25 ) ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, '10' ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, 10 ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, true ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, null ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, undefined ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, [] ); // $ExpectError
	zupmtr( 'left', 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zupmtr(); // $ExpectError
	zupmtr( 'left' ); // $ExpectError
}
