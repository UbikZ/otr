'use strict';

/**
 *
 */
class AbstractController {
  /**
   *
   */
  constructor() {
    // Disable instance create from AbstractController
    if (new.target === AbstractController) {
      throw new TypeError('AbstractController can\'t not be constructed');
    }
  }
}

export default AbstractController;