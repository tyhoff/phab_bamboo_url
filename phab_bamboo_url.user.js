// ==UserScript==
// @name         Bamboo Build Link
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Appends the Bamboo Build URL after the "Walter, Please build tintin"
// @author       Tyler
// @match        http://phabricator.marlinspike.hq.getpebble.com/D*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

function append_link() {
    var build_links = $('a:contains(": Walter, Please build tintin")');

    // Check to make sure the link exists on the page
    if (build_links <= 0) {
        return;
    }

    var build_link = build_links[0];
    var build_link_container = $(build_link).parent();
    var build_url = build_link.href;

    var search_url = "http://bamboo.marlinspike.hq.getpebble.com/browse/TT-PHAB-"
    $.ajax({url: build_url, success: function(result){
        var index = result.search(search_url);
        // Check to make sure the link exists on the page
        if (index < 0) {
            return;
        }

        // Bump result string to the exact start of the Bamboo Build Id, parse,
        // then assemble the link
        result = result.substring(index + search_url.length);
        var bamboo_id = parseInt(result);
        var bamboo_url = search_url + bamboo_id;

        // Add a bit of non linked text after the normal link
        build_link_container.append(" - ");

        // Append a new link after the normal one with with the destination of `bamboo_url`
        $('<a>',{
            text: 'Bamboo URL',
            title: 'Bamboo Build URL',
            href: bamboo_url,
            target: '_blank',
        }).appendTo(build_link_container);
    }});
}

append_link();
