/**
 *
 * The Bipio Instagram Pod
 * ---------------------------------------------------------------
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2013 Michael Pearson https://github.com/mjpearson
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

function MyMedia(podConfig) {
  this.name = 'my_media';
  this.description = "Retrieve Your Media";
  this.description_long = "Retrieves your recently uploaded images and videos";
  this.trigger = true;
  this.singleton = true;
  this.auto = true;
  this.podConfig = podConfig;
}

MyMedia.prototype = {};

MyMedia.prototype.getSchema = function() {
  return {
    'config' : {
      properties : {
    }
    },
    'imports' : {
      properties : {
    }
    },
    'exports' : {
      properties : {
        'file_name' : {
          type : 'string',
          description : 'File Name'
        },
        'caption' : {
          type : 'string',
          description : 'Media Caption'
        },
        'filter' : {
          type : 'string',
          description : 'Filter Name'
        },
        'media_url' : {
          type : 'string',
          description : 'Media Standard Res URL'
        }
      }
    }
  }
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
