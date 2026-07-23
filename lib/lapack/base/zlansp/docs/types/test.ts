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

import zlansp = require( './index' );


// TESTS //

// The function returns a number...
{
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zlansp( 10, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( true, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( null, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( undefined, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( [], 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( {}, 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zlansp( 'no-transpose', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', true, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', null, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', [], 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zlansp( 'no-transpose', 'upper', '10', new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', true, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', false, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', null, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', undefined, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', [], new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', {}, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zlansp( 'no-transpose', 'upper', 10, '10', new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, true, new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, null, new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, [], new Float64Array( 25 ) ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), true ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), null ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), [] ); // $ExpectError
	zlansp( 'no-transpose', 'upper', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zlansp(); // $ExpectError
	zlansp( 'no-transpose' ); // $ExpectError
}
