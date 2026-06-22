// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetrs from './zhetrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetrs, 'ndarray', ndarray );


// EXPORTS //

export default zhetrs;
