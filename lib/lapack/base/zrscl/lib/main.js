
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zrscl from './zrscl.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zrscl, 'ndarray', ndarray );


// EXPORTS //

export default zrscl;
