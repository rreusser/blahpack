
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlacrm from './zlacrm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlacrm, 'ndarray', ndarray );


// EXPORTS //

export default zlacrm;
