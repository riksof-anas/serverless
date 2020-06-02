'use strict';

/**
 * @author Copyright RIKSOF (Private) Limited.
 */
const { promisify } = require('bluebird');
const request = promisify( require( 'request' ) );

/**
 * Function to send sms using unifonic's web api.
 *
 * @param {any} env                             The environment variables.
 * @param {string} recipient                    The recipient id or phone number.
 * @param {string} message                      The message to be sent.
 *
 * @returns {Promise} The promisified response from http service.
 */
function sendSMS( env, recipient, message ) {
  return request({
    method: 'POST',
    url: 'https://api.unifonic.com/rest/Messages/Send',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'AppSid': env.AppSid,
      'SenderID': env.SenderID,
      'Recipient': recipient,
      'Body': message
    }).toString()
  }).catch( err => err );
}

/**
 * This function is the entry point for serverless function.
 *
 * @param {any} data                          Data passed to this function.
 * @param {any} context                       Client context. Unused.
 * @param {function} callback                 Callback function to pass back
 *                                            the response.
 *
 * @returns {undefined} None.
 */
module.exports.handler = function SendSMSHandler( data, context, callback ) {
  let p = [];

  if ( Array.isArray( data.current ) ) {
    for ( let i = 0; i < data.current.length; i++ ) {
      p[ i ] = sendSMS( data.env, data.current[ i ].to, data.current[ i ].message );
    }
    p = Promise.all( p );
  } else {
    p = sendSMS( data.env, data.current.to, data.current.message );
  }

  return p.then( function AfterSMSSent( result ) {
    if ( Array.isArray( result ) ) {
      let response = [];
      for( let i = 0; i < result.length; i++ ) {
        try {
          response[ i ] = JSON.parse( result[ i ].body );
        } catch ( err ) {
          response[ i ] = result[ i ].body;
        }
      }
      callback( null, response );
    } else {
      try {
        callback( null, JSON.parse( result.body ) );
      } catch ( err ) {
        callback( null, result.body );
      }        
    }
  }).catch( function OnSMSError( error ) {
    callback({
      status: error.status, statusText: error.statusText, message: error.message
    }, null );
  });
};