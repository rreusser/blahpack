// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zheevr from './zheevr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zheevr, 'ndarray', ndarray );


// EXPORTS //

export default zheevr;
