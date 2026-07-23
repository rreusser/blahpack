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

import zppequ = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	zppequ( 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zppequ( 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( true, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( null, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( [], 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( {}, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zppequ( 'upper', '10', new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', true, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', false, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', null, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', undefined, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', [], new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', {}, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zppequ( 'upper', 10, '10', new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', 10, true, new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', 10, null, new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', 10, [], new Float64Array( 25 ) ); // $ExpectError
	zppequ( 'upper', 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zppequ( 'upper', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zppequ( 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zppequ( 'upper', 10, new Float64Array( 25 ), true ); // $ExpectError
	zppequ( 'upper', 10, new Float64Array( 25 ), null ); // $ExpectError
	zppequ( 'upper', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zppequ( 'upper', 10, new Float64Array( 25 ), [] ); // $ExpectError
	zppequ( 'upper', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zppequ(); // $ExpectError
	zppequ( 'upper' ); // $ExpectError
}
