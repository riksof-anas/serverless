'use strict';

/**
 * @author Copyright RIKSOF (Private) Limited.
 *
 * @file Entry point to load all lambda functions or serverless.
 */
module.exports = {
  makeCall: require( './makeCall' ),
  pushNotification: require( './pushNotification' ),
  sendEmail: require( './sendEmail' ),
  sendSMS: require( './sendSMS' )
};