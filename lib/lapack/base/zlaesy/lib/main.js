// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaesy from './zlaesy.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaesy, 'ndarray', ndarray );


// EXPORTS //

export default zlaesy;
