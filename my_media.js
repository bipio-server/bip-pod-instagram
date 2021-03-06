/**
 *
 * The Bipio Instagram Pod
 * ---------------------------------------------------------------
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

function MyMedia() {}

MyMedia.prototype = {};

MyMedia.prototype.setup = function(channel, accountInfo, next) {
	this.pod.trackingStart(channel, accountInfo, true, next);
}

MyMedia.prototype.teardown = function(channel, accountInfo, next) {
	this.pod.trackingRemove(channel, accountInfo, next);
}

MyMedia.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
	  var pod = this.pod,
	  	$resource = this.$resource,
	    self = this,
	    dataDir = pod.getDataDir(channel, this.name);
	  pod.trackingGet(channel, function(err, since) {
	    if (err) {
	      next(err);
	    } else {
	      pod.trackingUpdate(channel, function(err, until) {
	        if (err) {
	          next(err);
	        } else {
	          self.invoke(imports, channel, sysImports, contentParts, function(err, photo) {
	            if (err) {
	              next(err);
	            } else {

								var fileName = photo.source.match(/\w*\.jpg/).shift(),
									outFile = dataDir + '/' + fileName;

								$resource._httpStreamToFile(
									photo.source,
									outFile,
									function(err, fileStruct) {
										if (err) {
											next(err);
										} else {
				              next(false, photo, { _files : [ fileStruct ] }, fileStruct.size);
										}
									}
								);
	            }
	          });
	        }
	      });
	    }
	  });
}

MyMedia.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod,
  log = this.$resource.log,
  opts = {},
  url = pod.getURL('users/' + pod.getUserId(sysImports) + '/media/recent', sysImports);

  pod.getDataDir(channel, this.name, function(err, dataDir) {
    pod._httpGet(url, function(err, media) {
      if (!err) {
        if (media.data && media.data.length > 0) {
          for (var i = 0; i < media.data.length; i++) {

            (function(media, contentParts, next) {
              var ptr, fName, outfile, ext;
              if ('image' === media.type) {
                ptr = media.images.standard_resolution.url;
              } else if ('video' === media.type) {
                ptr = media.videos.standard_resolution.url;
              } else {
            	  log('Unknown media type ' + media.type, channel, 'error');
                return;
              }

              // fetch media and push it onto contentparts
              if (ptr) {
                fName = ptr.split('/').pop();
                outfile = dataDir + fName;
                pod._httpStreamToFile(
                  ptr,
                  outfile,
                  function(err, exports, fileStruct) {
                    if (!err) {
                      exports.file_name = fName;
                      exports.caption = media.caption.text;
                      exports.filter = media.filter;
                      exports.media_url = ptr;
                    } else {
                      resource.log(err, channel);
                    }

                    if (contentParts && contentParts._files) {
                      contentParts._files.push(fileStruct)
                    } else {
                      contentParts = {
                        _files : [ fileStruct ]
                      }
                    }

                    next(err, exports, contentParts, fileStruct.size);
                  },
                  media,  // export
                  {       // file meta container
                    txId : sysImports.id,
                    localpath : outfile,
                    name : fName,
                    type : fName.split('.').pop(),
                    encoding : 'binary'
                  }
                );
              }
            })(media.data[i], contentParts, next);
          }
        }
      } else {
        next(err);
      }
    });
  });
}

// -----------------------------------------------------------------------------
module.exports = MyMedia;
