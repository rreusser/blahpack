
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetri from './zhetri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetri, 'ndarray', ndarray );


// EXPORTS //

export default zhetri;
