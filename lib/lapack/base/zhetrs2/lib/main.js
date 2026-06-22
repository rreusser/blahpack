// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetrs2 from './zhetrs2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetrs2, 'ndarray', ndarray );


// EXPORTS //

export default zhetrs2;
