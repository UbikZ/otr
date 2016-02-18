'use strict';

const path = require('path');
const bluebird = require('bluebird');
const childProcess = bluebird.promisifyAll(require('child_process'));
const fs = require('fs');
const moment = require('moment');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const logger = require('../logger');

const UndefinedUrl = require('../errors/UndefinedUrl');
const NotFoundPdfFile = require('../errors/NotFoundPdfFile');
const UndefinedDownloadFile = require('../errors/UndefinedDownloadFile');
const UndefinedName = require('../errors/UndefinedName');

const config = require('../../../config');

/**
 * PDF Controller
 * - indexAction (disabled at the moment)
 * - renderAction
 * - downloadAction
 */
class PdfController extends AbstractController {
  /**
   * Return the correct binary path for phantomjs
   * - defaulting on server install
   * @private
   */
  static _getPhantomBinaryPath() {
    let binPath = '';
    try {
      binPath = require('phantomjs2').path;
    } catch (error) {
      binPath = config.bin.phantomjs;
    }
  }
  
  /**
   * Index Action
   * TODO: list all rendered files
   * @param   request
   * @param   response
   * @method  GET
   */
  static indexAction() {
    // todo
  }

  /**
   * Render Action
   * - Enable rendering for specific element
   * - Return a public link to get the file
   * @param   request
   * @param   response
   * @method  GET
   */
  static renderAction(request, response) {
    const data = request.query;
    let user = {}, filePath = '';

    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        let url, execArgs;
        if (!data.url) {
          throw new UndefinedUrl();
        }
        if (!data.name) {
          throw new UndefinedName();
        }

        filePath = config.path.export + '/' +
        data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() +
        moment().format('.YYYYMMDDHHmmSS') + '.pdf';
        url = request.protocol + '://' + request.get('host') + '/#' + data.url;
        execArgs = [require('../../../' + config.bin.phantomjsConfig).path, url, filePath, 1];

        return childProcess.execFileAsync(PdfController._getPhantomBinaryPath(), execArgs);
      })
      .then(result => {
        console.log(result);
        if (!fs.existsSync(filePath)) {
          throw new NotFoundPdfFile();
        }

        Http.sendResponse(request, response, 200, { fileName: path.basename(filePath) });
      })
      .catch(NotFoundPdfFile, () => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): pdf file not created'
        );
      })
      .catch(UndefinedName, () => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): rendered name (undefined)'
        );
      })
      .catch(UndefinedUrl, () => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): rendered url (undefined)'
        );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Error: renderer fail. Check logs.', err);
      })
    ;
  }
  
  /**
   * Download Action
   * - Return a stream & force the downloading
   * - Delete the file from the filesystem after downloading
   * TODO: improve the "unlink" to archive old renders
   * @param   request
   * @param   response
   * @method  GET
   */
  static downloadAction(request, response) {
    const data = request.query;
    let user = {}, finalPdfPath = '';

    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        finalPdfPath = config.path.export + '/' + data.fileName;
        if (!data.fileName) {
          throw new UndefinedDownloadFile();
        }
        if (!fs.existsSync(finalPdfPath)) {
          throw new NotFoundPdfFile();
        }

        // FIXME: promise instead of callbacks
        response.download(finalPdfPath, (err) => {
          if (err) {
            logger.error(err);
          } else {
            fs.unlink(config.path.export + '/' + data.fileName);
          }
        });
      })
      .catch(NotFoundPdfFile, () => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error: pdf file not found (' + finalPdfPath + ')'
        );
      })
      .catch(UndefinedDownloadFile, () => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): download file (none)'
        );
      })
      .catch(err => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Error: download fail. Check logs.', err);
      })
    ;
  }
}

module.exports = PdfController;

