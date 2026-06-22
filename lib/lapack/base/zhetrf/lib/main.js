// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetrf from './zhetrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetrf, 'ndarray', ndarray );


// EXPORTS //

export default zhetrf;
