// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Javascript to initialise the block.
 *
 * @package   block_boalist
 * @copyright 2020 David Herney @ BambuCo
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery', 'core/modal_factory', 'core/modal_events', 'core/templates'],
        function($, ModalFactory, ModalEvents, Templates) {

    var chooseview = function(data) {

        var src = '';

        // If it is a external resource.
        if (data.manifest.conexion_type && data.manifest.conexion_type == 'external') {
            $res = $('<iframe></iframe>');
            $res.attr('src', data.manifest.url);

            var $reslink = $('<p><a target="_blank"></a></p>');
            $reslink.find('a').attr('href', data.manifest.url).html(data.manifest.url);

            return $res.get(0).outerHTML + $reslink.get(0).outerHTML;
        }

        if (data.manifest.alternate && data.manifest.entrypoint) {
            var alternatebase;
            if (data.id.indexOf('/content/') >= 0) {
                alternatebase = data.id.substr(data.id.indexOf('/content/') + 9);
            } else {
                alternatebase = data.manifest.entrypoint;
            }

            var alterpath = data.about + '/!/.alternate/' + alternatebase + '/';

            if (data.metadata.technical.format.match(/video/gi) ||
            data.metadata.technical.format.match(/audio/gi) ||
            data.metadata.technical.format.match(/image/gi)) {

                var name = data.manifest.alternate.find(e => /small/g.test(e));

                if (name) {
                    src = alterpath + name;
                } else {
                    name = data.manifest.alternate.find(e => /medium/g.test(e));
                    if (name) {
                        src = alterpath + name;
                    } else {
                        src = data.about + '/!/' + data.manifest.entrypoint;
                    }
                }
            } else {
                name = data.manifest.alternate.find(e => /thumb/g.test(e));
                if (name) {
                    src = alterpath + name;
                } else {
                    src = data.manifest.customicon;
                }
            }


        } else {
            if ('technical' in data.metadata && 'format' in data.metadata.technical &&
                    (data.metadata.technical.format.match(/video/gi) ||
                     data.metadata.technical.format.match(/audio/gi) ||
                     data.metadata.technical.format.match(/image/gi))) {
                src = data.about + '/!/';
            } else {
                src = data.manifest.customicon;
            }
        }

        var $res;
        if (data.metadata.technical && data.metadata.technical.format) {
            if (data.metadata.technical.format.match(/video/gi)) {
                $res = $('<video controls><source></source></video>');
                $res.find('source').attr('src', src).attr('type', data.metadata.technical.format);

            } else if (data.metadata.technical.format.match(/audio/gi)) {
                $res = $('<audio controls><source></source></audio>');
                $res.find('source').attr('src', src).attr('type', data.metadata.technical.format);

            } else {
                $res = $('<img />');
                $res.attr('src', src).attr('alt', data.metadata.general.title.none);
            }

        }

        return $res.get(0).outerHTML;
    };

    var isdownloadable = function(data) {
        //ToDo: validate by content type.
        return !data.manifest.conexion_type || data.manifest.conexion_type != 'external';
    };

    /**
     * Initialise all for the block.
     *
     */
    var init = function(socialnetworks) {
        $('.block_boalist .one-resource').each(function() {
            var $resource = $(this);

            $resource.find('.panel-cover').on('click', function() {

                var modalresource = $resource.data('modal');

                if (modalresource) {
                    modalresource.show();
                    return;
                }

                var request = $.get($resource.data('about'))
                    .then(function( data ) {

                        data.custom = {};
                        data.custom.preview = chooseview(data);
                        data.custom.type = (data.metadata.technical && data.metadata.technical.format) ?
                                                data.metadata.technical.format : '';
                        data.custom.score = 'avg' in data.social.score ?
                                                data.social.score.avg + ' / ' + data.social.score.count : 0;
                        data.custom.downloadable = isdownloadable(data);

                        var socialnetworksitems = [];
                        $.each(socialnetworks, function(i, v) {
                            var url = v.url.replace('{url}', encodeURI(data.about + '/!/'));
                            url = url.replace('{name}', data.metadata.general.title.none);

                            var item = {};
                            item.url = url;
                            item.icon = v.icon;
                            socialnetworksitems.push(item);
                        });

                        data.custom.socialnetworks = socialnetworksitems;

                        data.custom.alternates = [];
                        $.each(data.manifest.alternate, function(i, alt) {
                            var str;
                            var strkey = 'alternate_' + alt.substring(0, alt.indexOf('.'));

                            if (strkey in M.str.block_boalist) {
                                str = M.str.block_boalist['alternate_' + alt.substring(0, alt.indexOf('.'))];
                            } else {
                                str = alt;
                            }

                            var one = {
                                "text": str,
                                "url": data.about + '/!/.alternate/' + data.manifest.entrypoint + '/' + alt
                            };

                            data.custom.alternates[data.custom.alternates.length] = one;
                        });

                        if (typeof(data.metadata.general.keywords.none) == 'object') {
                            data.metadata.general.keywords.none = data.metadata.general.keywords.none.join(', ');
                        }

                        var template = Templates.render('block_boalist/viewresource', data)
                            .then(function(html) {
                                modalresource.setTitle(data.metadata.general.title.none);

                                var $html = $(html);

                                $html.find('[boa-act="rate"]').on('click', function() {
                                    var $rate = $(this);

                                    var params = { value: $rate.data('value') };

                                    $.post(data.about + '/scores', params, function() {})
                                        .done(function() {
                                            $html.find('[boa-act="rate"]').removeClass('active').each(function(key, element) {
                                                var $element = $(element);

                                                if ($element.data('value') <= $rate.data('value')) {
                                                    $element.addClass('active');
                                                }
                                            });
                                        }
                                    );

                                });

                                return $html;
                            });

                        return template.promise();
                    }
                );

                ModalFactory.create({
                    body: request.promise()
                })
                .then(function(modal) {
                    modalresource = modal;
                    modal.getModal().addClass('block_boalist-modal');
                    modal.show();

                    var root = modal.getRoot();
                    root.on(ModalEvents.hidden, function() {

                        // Stop audio and video when close the window.
                        $(modal.getBody()).find('video').each(function() {
                            this.pause();
                        });

                        $(modal.getBody()).find('audio').each(function() {
                            this.pause();
                        });

                        $(modal.getBody()).find('iframe').each(function() {
                            let $iframe = $(this);
                            $iframe.attr('src', 'about:blank');
                            $resource.data('modal', null);
                        });
                    });

                    $resource.data('modal', modalresource);
                });

            });
        });

    };

    return {
        init: init
    };
});
