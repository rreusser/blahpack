// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zptts2 from './zptts2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zptts2, 'ndarray', ndarray );


// EXPORTS //

export default zptts2;
