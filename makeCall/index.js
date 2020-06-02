'use strict';

/**
 * @author Copyright RIKSOF (Private) Limited.
 */
const Twilio = require( 'twilio' );
const env = process.env;

const BAD_REQUEST = 400;

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
module.exports.handler = function SendCallHandler( data, context, callback ) {
  let client = new Twilio(
    env.accountSid ? env.accountSid : data.env.accountSid,
    env.authToken ? env.authToken : data.env.authToken
  );

  let p = [];

  if ( Array.isArray( data.current ) ) {
    for ( let i = 0; i < data.current.length; i++ ) {
      p[ i ] = makeCall( client, data.current[ i ] );
      p = Promise.all( p );
    }
  } else {
    p = makeCall( client, data.current );
  }

  return p.then( function AfterCallSent( message ) {
    callback( null, message );
  }).catch( function OnCallError( error ) {
    callback( error, null );
  });
};

function makeCall( client, current ) {
  // Initialize error as empty.
  let error = null;

  // Validate the param from constains value.
  if ( !current.from ) error = new Error('Please provide the sending phone number');

  // Validate the param to constains value.
  if ( !current.to ) error = new Error('Please provide the recipient phone numbers');

  // Validate the param url constains value.
  if ( !current.url ) error = new Error('Please provide a url for Call');

  // Validate the param message constains value.
  if ( !current.message ) error = new Error('Please provide a message for Call');
  
  return client.calls.create({
    url: current.url+encodeURI(current.message),
    to: current.to,
    from: current.from
  });
}
