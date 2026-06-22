// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgesc2 from './dgesc2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgesc2, 'ndarray', ndarray );


// EXPORTS //

export default dgesc2;
