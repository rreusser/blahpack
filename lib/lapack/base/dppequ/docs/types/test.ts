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

import dppequ = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dppequ( 'upper', 10, new Float64Array( 25 ), new Float64Array( 25 ) );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dppequ( 10, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( true, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( null, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( [], 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( {}, 10, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dppequ( 'upper', '10', new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', true, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', false, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', null, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', undefined, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', [], new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', {}, new Float64Array( 25 ), new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dppequ( 'upper', 10, '10', new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', 10, true, new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', 10, null, new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', 10, [], new Float64Array( 25 ) ); // $ExpectError
	dppequ( 'upper', 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dppequ( 'upper', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dppequ( 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dppequ( 'upper', 10, new Float64Array( 25 ), true ); // $ExpectError
	dppequ( 'upper', 10, new Float64Array( 25 ), null ); // $ExpectError
	dppequ( 'upper', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dppequ( 'upper', 10, new Float64Array( 25 ), [] ); // $ExpectError
	dppequ( 'upper', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dppequ(); // $ExpectError
	dppequ( 'upper' ); // $ExpectError
}
