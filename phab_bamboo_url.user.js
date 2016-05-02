// ==UserScript==
// @name         Bamboo Build Link
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Appends the Bamboo Build URL after the "Walter, Please build tintin"
// @author       Tyler
// @match        http://phabricator.marlinspike.hq.getpebble.com/D*
// @match        http://bamboo.marlinspike.hq.getpebble.com/browse/*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==
/* jshint -W097 */
'use strict';

function append_link_to_phabricator() {
    var build_links = $('a:contains(": Walter, Please build")');

    // Check to make sure the link exists on the page
    if (build_links.length <= 0) {
        return;
    }

    var build_link = $(build_links[0]);
    if (build_link.text().includes('tintin')) {
        append_link_to_phabricator_project(build_link, 'http://bamboo.marlinspike.hq.getpebble.com/browse/TT-PHAB-')
    } else if (build_link.text().includes('iOS')) {
        append_link_to_phabricator_project(build_link, 'http://bamboo.marlinspike.hq.getpebble.com/browse/IOS-PHAB-')
    }
}

function append_link_to_phabricator_project(build_link, search_url) {
    var build_link_container = build_link.parent();
    var build_url = build_link.attr('href');

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

        // Append a Restart link if the build link icon is red (ie. it failed)
        if (build_link_container.find("span").filter(".red").length > 0) {
            build_link_container.append(" - ");

            var rebuild_url = build_url.replace("/build/", "/build/restart/");
            $('<a>', {
                text: 'Restart',
                title: 'Restart Build',
                href: rebuild_url,
            }).appendTo(build_link_container);
        }
    }});
}

function append_link_to_bamboo() {
    var revision = $('div.variables-container td.name:contains("revision") + td.value');

    if (revision.length == 0) {
        return;
    }

    var revision_number = revision.text()
    revision.html($('<a>', {
        text: revision_number,
        title: 'Phabricator D' + revision_number,
        href: 'http://phabricator.marlinspike.hq.getpebble.com/D' + revision_number,
        target: '_blank',
    }));
}

if (window.location.href.includes('phabricator')) {
    append_link_to_phabricator();
} else if (window.location.href.includes('bamboo')) {
    append_link_to_bamboo();
}
