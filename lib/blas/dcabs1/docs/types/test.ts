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

import Complex128 = require( '@stdlib/complex/float64/ctor' );
import dcabs1 = require( './index' );


// TESTS //

// The function returns a number...
{
	dcabs1( new Complex128( 3.0, 4.0 ) ); // $ExpectType number
}

// The compiler throws an error if the function is provided a first argument which is not a complex number...
{
	dcabs1( 10 ); // $ExpectError
	dcabs1( '10' ); // $ExpectError
	dcabs1( true ); // $ExpectError
	dcabs1( false ); // $ExpectError
	dcabs1( null ); // $ExpectError
	dcabs1( undefined ); // $ExpectError
	dcabs1( [] ); // $ExpectError
	dcabs1( {} ); // $ExpectError
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dcabs1(); // $ExpectError
}
