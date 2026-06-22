// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetri3 from './zhetri_3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetri3, 'ndarray', ndarray );


// EXPORTS //

export default zhetri3;
