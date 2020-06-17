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
 * Class containing renderers for the block.
 *
 * @package   block_boalist
 * @copyright 2020 David Herney @ BambuCo
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace block_boalist\output;
defined('MOODLE_INTERNAL') || die();

use renderable;
use renderer_base;
use templatable;

/**
 * Class containing data for the block.
 *
 * @copyright 2020 David Herney @ BambuCo
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class main implements renderable, templatable {

    /**
     * Export this data so it can be used as the context for a mustache template.
     *
     * @param \renderer_base $output
     * @return array Context variables for the template
     */
    public function export_for_template(renderer_base $output) {
        global $OUTPUT, $PAGE;

        $networks = get_config('block_boalist', 'networks');

        $networkslist = explode("\n", $networks);

        $socialnetworks = array();
        foreach ($networkslist as $one) {

            $row = explode('|', $one);

            if (count($row) >= 2) {
                $network = new \stdClass();
                $network->icon = trim($row[0]);
                $network->url = trim($row[1]);
                $socialnetworks[] = $network;
            }

        }

        $PAGE->requires->string_for_js('alternate_small', 'block_boalist');
        $PAGE->requires->string_for_js('alternate_medium', 'block_boalist');
        $PAGE->requires->string_for_js('alternate_hight', 'block_boalist');
        $PAGE->requires->string_for_js('alternate_preview', 'block_boalist');
        $PAGE->requires->string_for_js('alternate_thumb', 'block_boalist');

        $defaultvariables = [
            'loadingimg' => $OUTPUT->pix_icon('i/loading', get_string('loadinghelp')),
            'socialnetworks' => $socialnetworks
        ];

        return $defaultvariables;
    }
}
