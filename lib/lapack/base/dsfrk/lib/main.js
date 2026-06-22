// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsfrk from './dsfrk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsfrk, 'ndarray', ndarray );


// EXPORTS //

export default dsfrk;
