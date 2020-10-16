<?php
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
 * Form for editing boalist block instances.
 *
 * @package   block_boalist
 * @copyright 2020 David Herney @ BambuCo
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

class block_boalist extends block_base {

    static $genericloaded = false;

    function init() {
        $this->title = get_string('pluginname', 'block_boalist');
    }

    function has_config() {
        return true;
    }

    function applicable_formats() {
        return array('all' => true);
    }

    function specialization() {
        if (isset($this->config->title)) {
            $this->title = $this->title = format_string($this->config->title, true, ['context' => $this->context]);
        } else {
            $this->title = get_string('newblocktitle', 'block_boalist');
        }
    }

    function instance_allow_multiple() {
        return true;
    }

    function get_content() {
        global $CFG, $OUTPUT;

        if ($this->content !== NULL) {
            return $this->content;
        }

        $this->content         =  new stdClass;
        $this->content->text   = '';
        $this->content->footer = '';

        if (empty($this->config->query)) {
            return $this->content;
        }

        $curl = new curl();
        $json = $curl->get($this->config->query);

        if (!$json) {
            $this->content->text   = '';
            debugging('Error in response for query: ' . $this->config->query);
            return $this->content;
        }

        try {
            $resources = json_decode($json);
        } catch (Exception $e) {
            $resources = null;
        }

        $html = '';
        if ($resources && is_array($resources)) {
            $i = 0;
            foreach ($resources as $resource) {
                $i++;
                if ($i > $this->config->size) {
                    break;
                }

                $html .= html_writer::start_tag('div', array('class' => 'one-resource', 'data-about' => $resource->about));

                $html .= html_writer::start_tag('div', array('class' => 'customicon-box'));
                $html .= html_writer::empty_tag('img', array('src' => $this->choosepreview($resource)));
                $html .= html_writer::end_tag('div');

                $html .= html_writer::start_tag('div', array('class' => 'panel-body'));
                $html .= html_writer::tag('label', $resource->metadata->general->title->none);
                $html .= html_writer::end_tag('div');

                $html .= html_writer::start_tag('div', array('class' => 'panel-foot'));

                // Info into foot panel.
                if (property_exists($resource->metadata, 'technical') &&
                        property_exists($resource->metadata->technical, 'format')) {
                    $html .= html_writer::start_tag('span', array('class' => 'social type'));
                    $html .= html_writer::tag('label', $resource->metadata->technical->format);
                    $html .= html_writer::end_tag('span');
                }

                $html .= html_writer::start_tag('span', array('class' => 'social views'));
                $html .= $OUTPUT->pix_icon('i/hide', get_string('views', 'block_boalist'));
                $html .= html_writer::tag('label', $resource->social->views);
                $html .= html_writer::end_tag('span');

                $score = is_object($resource->social->score) && property_exists($resource->social->score, 'avg') > 0 ?
                            $resource->social->score->avg . '/' . $resource->social->score->count : 0;
                $html .= html_writer::start_tag('span', array('class' => 'social score'));
                $html .= $OUTPUT->pix_icon('i/star', get_string('likes', 'block_boalist'));
                $html .= html_writer::tag('label', $score);
                $html .= html_writer::end_tag('span');

                $html .= html_writer::end_tag('div');

                // Cover to open action.
                $html .= html_writer::start_tag('div', array('class' => 'panel-cover'));
                $html .= $OUTPUT->pix_icon('i/preview', get_string('view'));
                $html .= html_writer::end_tag('div');

                $html .= html_writer::end_tag('div');
            }

            // Load one time if multiple instances be added in the page.
            if (!self::$genericloaded) {
                // Load templates and other general information.
                $renderable = new \block_boalist\output\main();
                $renderer = $this->page->get_renderer('block_boalist');

                $html .= $renderer->render($renderable);

                self::$genericloaded = true;
            }
        }

        $this->content->text = $html;

        return $this->content;
    }

    public function instance_can_be_docked() {
        return false;
    }

    private function choosepreview($item) {
        if (property_exists($item->manifest, 'alternate') && property_exists($item->manifest, 'entrypoint')) {
            $alterpath = $item->about . '/!/.alternate/' . $item->manifest->entrypoint;

            if (in_array('preview.png', $item->manifest->alternate)) {
                return $alterpath . '/preview.png';
            } else if (in_array('thumb.png', $item->manifest->alternate)) {
                return $alterpath . '/thumb.png';
            }
        }

        return $item->manifest->customicon . '?s=256';
    }

}
