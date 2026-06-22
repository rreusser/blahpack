// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlagtm from './zlagtm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlagtm, 'ndarray', ndarray );


// EXPORTS //

export default zlagtm;
