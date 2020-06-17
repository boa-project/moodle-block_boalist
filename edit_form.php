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
 * Form for editing block instances.
 *
 * @package   block_boalist
 * @copyright 2020 David Herney @ BambuCo
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Form for editing block instances.
 *
 * @copyright 2020 David Herney @ BambuCo
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_boalist_edit_form extends block_edit_form {
    protected function specific_definition($mform) {
        global $CFG;

        // Fields for editing HTML block title and contents.
        $mform->addElement('header', 'configheader', get_string('blocksettings', 'block'));

        $mform->addElement('text', 'config_title', get_string('customtitle', 'block_boalist'));
        $mform->setType('config_title', PARAM_TEXT);

        $mform->addElement('text', 'config_query', get_string('query', 'block_boalist'));
        $mform->setType('config_query', PARAM_TEXT);
        $mform->addHelpButton('config_query', 'query', 'block_boalist');

        $mform->addElement('text', 'config_size', get_string('resultssize', 'block_boalist'));
        $mform->setType('config_size', PARAM_INT);

        $mform->addElement('checkbox', 'config_showmore', get_string('showmore', 'block_boalist'));
    }
}
