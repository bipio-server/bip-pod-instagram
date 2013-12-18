/**
 * 
 * The Bipio Instagram Pod.
 * 
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2013 CloudSpark pty ltd http://www.cloudspark.com.au
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *  
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Pod = require('bip-pod'),
  request = require('request');
  
Instagram = new Pod({
  name : 'instagram',
  description : 'Instagram',
  description_long : 'Capture and Share the World\'s Moments. Instagram is a fast, beautiful and fun way to share your life with friends and family',
  /*
  dataSources : [ 
    require('./models/my_media'),
  ],*/
  authType : 'oauth',
  passportStrategy : require('passport-instagram').Strategy,
  config : {
    "oauth": {
      "clientID" : "",
      "clientSecret" : "",
      "callbackURL" : "", // eg: http://localhost:5000/rpc/oauth/instagram/cb
      "method" : "authenticate",
      "scopes": [
          "basic"
      ]
    }
  }
});

Instagram._apiURL = 'https://api.instagram.com/v1/';

Instagram.getUserId = function(sysImports) {
  return sysImports.auth.oauth.profile.data.id;  
}

Instagram.getURL = function(path, sysImports) {
  return this._apiURL + path + '?access_token=' + sysImports.auth.oauth.token;  
}


Instagram.add(require('./my_media.js'));


// -----------------------------------------------------------------------------
module.exports = Instagram;
