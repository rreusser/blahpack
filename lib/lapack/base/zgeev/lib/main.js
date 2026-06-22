// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeev from './zgeev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeev, 'ndarray', ndarray );


// EXPORTS //

export default zgeev;
