// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlapmr from './zlapmr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlapmr, 'ndarray', ndarray );


// EXPORTS //

export default zlapmr;
