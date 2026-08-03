// PASS — variant index.js: re-exports main.js's default, which carries the
// `.ndarray` property (attached in main.js), so ndarray stays reachable.
import main from './main.js';
export default main;
