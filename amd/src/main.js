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

define(['jquery', 'core/modal_factory', 'core/templates', 'core/notification'],
        function($, ModalFactory, Templates, Notification) {

    var wwwroot = M.cfg.wwwroot;


    var chooseview = function(data) {

        var src = '';
        if (data.manifest.alternate && data.manifest.entrypoint) {
            var alterpath = data.about + '/!/.alternate/' + data.manifest.entrypoint + '/';

            if (data.metadata.technical.format.match(/video/gi) ||
            data.metadata.technical.format.match(/audio/gi) ||
            data.metadata.technical.format.match(/image/gi)) {

                var name = data.manifest.alternate.find(e => /small/g.test(e))

                if (name) {
                    src = alterpath + name;
                } else {
                    name = data.manifest.alternate.find(e => /medium/g.test(e))
                    if (name) {
                        src = alterpath + name;
                    } else {
                        src = data.about + '/!/' + data.manifest.entrypoint;
                    }
                }
            } else {
                name = data.manifest.alternate.find(e => /thumb/g.test(e))
                if (name) {
                    src = alterpath + name;
                } else {
                    src = data.manifest.customicon;
                }
            }


        } else {
            if ('technical' in data.manifest && 'format' in data.manifest.technical &&
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

    /**
     * Initialise all for the block.
     *
     */
    var init = function(socialnetworks) {
        $('.block_boalist .one-resource').each(function(i, v) {
            var $resource = $(this);

            $resource.find('.panel-cover').on('click', function(e) {

                var modalresource = $resource.data('modal');

                if (modalresource) {
                    modalresource.show();
                    return;
                }

                var request = $.get($resource.data('about'))
                    .then(function( data, textStatus, jqXHR ) {

                        data.custom = {};
                        data.custom.preview = chooseview(data);
                        data.custom.type = (data.metadata.technical && data.metadata.technical.format) ?
                                                data.metadata.technical.format : '';
                        data.custom.score = 'avg' in data.social.score ?
                                                data.social.score.avg + '*' + data.social.score.count : 0;

                        $.each(socialnetworks, function(i, v) {
                            v.url = v.url.replace('{url}', encodeURI(data.about + '/!/'));
                            v.url = v.url.replace('{name}', data.metadata.general.title.none);
                        });

                        data.custom.socialnetworks = socialnetworks;

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
                            }

                            data.custom.alternates[data.custom.alternates.length] = one;
                        });

                        var template = Templates.render('block_boalist/viewresource', data)
                            .then(function(html, js) {
                                modalresource.setTitle(data.metadata.general.title.none);

                                var $html = $(html);

                                $html.find('[boa-act="rate"]').on('click', function() {
                                    var $rate = $(this);

                                    var params = { value: $rate.data('value') };

                                    $.post(data.about + '/scores', params, function(data) {})
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

                var clickedLink = $(e.currentTarget);
                ModalFactory.create({
                    body: request.promise()
                })
                .then(function(modal) {
                    modalresource = modal;
                    modal.getModal().addClass('block_boalist-modal');
                    modal.show();

                    $resource.data('modal', modalresource);
                });

            });
        });

    };

    return {
        init: init
    };
});
