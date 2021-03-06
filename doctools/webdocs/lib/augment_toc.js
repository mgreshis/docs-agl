// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

"use strict";

var fs   = require("fs");
var path = require("path");

var yaml = require("js-yaml");
var argv = require('minimist')(process.argv.slice(2));

var util = require("./misc_helpers");

// constants
var DEFAULT_PREFIX     = "";
var VERBOSE_BY_DEFAULT = false;

// globals
var verbose = VERBOSE_BY_DEFAULT;

// helpers
function augmentEntry(originalEntry, prefix) {
    var augmentedEntry = {};

    // skip entries that have no URI
    if (!originalEntry.url) {
        return originalEntry;
    }

    // get the path to the file to which this entry points
    var filePath = path.join(prefix, originalEntry.url).replace('.html', '.md');
    // skip entries that don't point to a valid file
    if (!fs.existsSync(filePath)) {
        console.warn("WARNING! Possible 404 in ToC: \"" + filePath + "\"");
        return originalEntry;
    }

	if (verbose) console.log("     * augmentToc:",filePath);

    // read in the referenced file and get its front matter
    var fileContents      = fs.readFileSync(filePath).toString();
    var frontMatterString = util.getFrontMatterString(fileContents);
    var frontMatter       = yaml.load(frontMatterString);

    augmentedEntry.name = decideOnName(originalEntry, frontMatter);
    augmentedEntry.url  = originalEntry.url;

    if (frontMatter && frontMatter.description) {
        augmentedEntry.description = frontMatter.description;
    }

    return augmentedEntry;
}

function decideOnName(originalEntry, frontMatter) {

    // raise a warning for old-style ToC entry names
    if (originalEntry.name && verbose === true) {
        console.warn("'name' property will be ignored");
    }

	if (!frontMatter)
		return originalEntry.name;

    // error out if there is no name
    if (!frontMatter.toc_title && !frontMatter.title) {
        throw Error("can't find out name for ToC entry");
    }

    // use entry's name, and if it's not defined use the front matter name
    return frontMatter.toc_title || frontMatter.title;
}

// public API
function augmentToc(originalToc, prefix) {

    var augmentedToc = [];

    if (typeof prefix === "undefined") {
        throw new Error("missing prefix for ToC");
    }

    // go through all original entries
	if (originalToc.children) { 
		for (var i = 0; i < originalToc.children.length; i++) {
			var originalEntry  = originalToc.children[i];
			var augmentedEntry = {};
			
			if (!originalEntry) {
				console.log ("  * Empty entry in Toc File (ignored) !!!");
				continue;
			}

			// recurse for entries with children, replacing their children with
			// their augmented equivalents
			if (originalEntry.children) {

				if (typeof originalEntry.name === "undefined") {
					throw new Error("entries with children must have a name");
				}

				augmentedEntry.name     = originalEntry.name;
				augmentedEntry.children = augmentToc(originalEntry, prefix);

			// replace regular entries with their augmented equivalents
			} else {
				augmentedEntry = augmentEntry(originalEntry, prefix);
			}

			augmentedToc.push(augmentedEntry);
		}
	}

    return augmentedToc;
}

module.exports = {
    augmentToc:    augmentToc,
};
