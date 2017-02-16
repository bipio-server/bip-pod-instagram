/**
 *
 * The Bipio Instagram Pod.
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Pod = require('bip-pod'),
  request = require('request');

Instagram = new Pod();

Instagram._apiURL = 'https://api.instagram.com/v1/';

Instagram.profileReprOAuth = function(profile) {
	return profile.data.username;
}

Instagram.getUserId = function(sysImports) {
  var uid;

  try {
    uid = sysImports.auth.oauth.user_id || JSON.parse(sysImports.auth.oauth.profile).data.id;
  } catch (e) {
    return null;
  }
  return uid;
}

Instagram.getURL = function(path, sysImports) {
  return this._apiURL + path + '?access_token=' + sysImports.auth.oauth.access_token;
}

// -----------------------------------------------------------------------------
module.exports = Instagram;
