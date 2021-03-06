<template>
  <panel
    :id="'configuration' + $parent.$parent.index + index"
    :show="show"
    :index="index"
    :errors="errors"
    :canremove="index > 0"
    :cancopy="true"
    icon="fas fa-cogs"
    title="Configuration"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in errors.non_field_errors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <ul>
            <li>
              For more information on the different options, see the "Getting Started" guide in our
              <a href="https://lco.global/documentation/" target="_blank">
                Documentation section.
              </a>
            </li>
          </ul>

          <!-- TODO: Do not show if calibrations have been created -->

          <b-row v-show="configuration.type === 'SPECTRUM'" class="p-2">
            <b-col>
              <h3>Calibration frames</h3>
              <p>
                We recommend that you schedule calibration frames with a spectrum type configuration. Click <em>'Create calibration frames'</em> to
                add four calibration configurations to this request: one arc and one flat before and one arc and one flat after your spectrum.
              </p>
              <b-button variant="outline-info" block @click="generateCalibs">
                Create calibration frames
              </b-button>
            </b-col>
          </b-row>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-select
              v-if="!simpleInterface && datatype != 'SPECTRA' && guideModeOptions.length > 1"
              v-model="selectedImagerGuidingOption"
              label="Guiding"
              field="mode"
              desc="Guiding keeps the field stable during long exposures. If set to Optional, then guiding is
                    attempted but observations are carried out even if guiding fails. If set to On,
                    observations are aborted if guiding fails."
              :errors="{}"
              :options="guideModeOptions"
              @input="update"
            />
            <div v-if="!simpleInterface" class="configurationType">
              <custom-select
                v-model="configuration.type"
                label="Type"
                field="configuration_type"
                desc="Normally, all Instrument Configurations are executed once, sequentially. If set to
                      'Exposure Sequence', 'Spectrum Sequence' or 'NRES Spectrum Sequence', all
                      Instrument Configurations are repeated in a loop for a specified duration."
                :errors="errors.type"
                :options="configurationTypeOptions"
                @input="update"
              />
            </div>
            <div v-if="configuration.type.includes('REPEAT')" class="repeatDuration">
              <custom-field
                v-model="configuration.repeat_duration"
                label="Duration"
                field="repeat_duration"
                :errors="errors.repeat_duration"
                desc="Period (in seconds) over which to repeat Instrument Configurations. Clicking the
                      'Fill' button increases the duration to the longest interval over which the target
                      is visible in the observing window. This button is disabled until the entire
                      request has passed validation."
                @input="update"
              >
                <b-input-group-append slot="inline-input">
                  <b-button :disabled="durationData.duration > 0 ? false : true" @click="configurationFillDuration">
                    Fill
                  </b-button>
                </b-input-group-append>
              </custom-field>
            </div>
            <div v-if="acquireModeOptions.length > 1 && !simpleInterface && configuration.type !== 'LAMP_FLAT' && configuration.type !== 'ARC'">
              <custom-select
                v-model="configuration.acquisition_config.mode"
                label="Acquire Mode"
                field="acquire_mode"
                desc="The method for positioning the slit or pinhole. If Brightest Object is selected, the slit/pinhole is placed
                      on the brightest object near the target coordinates."
                :errors="{}"
                :options="acquireModeOptions"
                @input="update"
              />
              <custom-field
                v-for="field in requiredAcquireModeFields"
                :key="field"
                v-model="configuration.acquisition_config.extra_params[field]"
                :label="field | formatField"
                :errors="null"
                :desc="field | getFieldDescription"
                @input="updateAcquisitionConfigExtraParam($event, field)"
              />
            </div>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
    <instrument-config
      v-for="(instrumentconfig, idx) in configuration.instrument_configs"
      :key="idx"
      :index="idx"
      :instrumentconfig="instrumentconfig"
      :selectedinstrument="selectedinstrument"
      :parentshow="show"
      :datatype="datatype"
      :configuration-type="configuration.type"
      :show="show"
      :duration-data="getFromObject(durationData, ['instrument_configs', idx], { duration: 0 })"
      :available-instruments="availableInstruments"
      :errors="getFromObject(errors, ['instrument_configs', idx], {})"
      :simple-interface="simpleInterface"
      @remove="removeInstrumentConfiguration(idx)"
      @copy="addInstrumentConfiguration(idx)"
      @instrumentconfigupdate="instumentConfigurationUpdated"
    />
    <target
      :target="configuration.target"
      :datatype="datatype"
      :parentshow="show"
      :errors="getFromObject(errors, 'target', {})"
      :simple-interface="simpleInterface"
      :selectedinstrument="selectedinstrument"
      @targetupdate="targetUpdated"
    />
    <constraints
      v-if="!simpleInterface"
      :constraints="configuration.constraints"
      :parentshow="show"
      :errors="getFromObject(errors, 'constraints', {})"
      @constraintsupdate="constraintsUpdated"
    />
  </panel>
</template>
<script>
import _ from 'lodash';

import { collapseMixin } from '@/utils.js';
import Panel from '@/components/util/Panel.vue';
import CustomAlert from '@/components/util/CustomAlert.vue';
import CustomField from '@/components/util/CustomField.vue';
import CustomSelect from '@/components/util/CustomSelect.vue';
import InstrumentConfig from '@/components/InstrumentConfig.vue';
import Constraints from '@/components/Constraints.vue';
import Target from '@/components/Target.vue';

export default {
  components: {
    CustomField,
    CustomSelect,
    Panel,
    CustomAlert,
    InstrumentConfig,
    Constraints,
    Target
  },
  mixins: [collapseMixin],
  props: {
    configuration: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    selectedinstrument: {
      type: String,
      required: true
    },
    availableInstruments: {
      type: Object,
      required: true
    },
    datatype: {
      type: String,
      required: true
    },
    parentshow: {
      type: Boolean
    },
    durationData: {
      type: Object,
      required: true
    },
    simpleInterface: {
      type: Boolean
    }
  },
  data: function() {
    return {
      show: true,
      acquireHistory: {
        mode: '',
        extra_params: {}
      },
      selectedImagerGuidingOption: null,
      defaultGuidingOptional: true,
      /* The options that a user can choose from for guiding mode set two underlying fields in the
      configuration's guiding_config - `mode` and `optional`. Guide options ON, OFF, and OPTIONAL will
      always map to guiding_config fields as follows. */
      guidingConfigMappings: [
        {
          option: 'OFF',
          config: { mode: 'OFF', optional: false }
        },
        {
          option: 'ON',
          config: { mode: 'ON', optional: false }
        },
        {
          option: 'OPTIONAL',
          config: { mode: 'ON', optional: true }
        }
      ]
    };
  },
  computed: {
    configurationTypeOptions: function() {
      if (_.get(this.availableInstruments, this.selectedinstrument, {}).type === 'SPECTRA') {
        if (this.selectedinstrument.includes('NRES')) {
          return [
            { value: 'NRES_SPECTRUM', text: 'Spectrum' },
            { value: 'REPEAT_NRES_SPECTRUM', text: 'Spectrum Sequence' }
          ];
        } else {
          return [
            { value: 'SPECTRUM', text: 'Spectrum' },
            { value: 'REPEAT_SPECTRUM', text: 'Spectrum Sequence' },
            { value: 'LAMP_FLAT', text: 'Lamp Flat' },
            { value: 'ARC', text: 'Arc' }
          ];
        }
      } else {
        return [
          { value: 'EXPOSE', text: 'Exposure' },
          { value: 'REPEAT_EXPOSE', text: 'Exposure Sequence' }
        ];
      }
    },
    acquireModeOptions: function() {
      let options = [];
      if (this.availableInstruments[this.selectedinstrument]) {
        let requiredModeFields = [];
        let modes = this.availableInstruments[this.selectedinstrument].modes.acquisition.modes;
        for (let i in modes) {
          requiredModeFields = [];
          if ('extra_params' in modes[i].validation_schema) {
            for (let j in modes[i].validation_schema.extra_params.schema) {
              requiredModeFields.push(j);
            }
          }
          options.push({
            value: modes[i].code,
            text: modes[i].name,
            requiredFields: requiredModeFields
          });
        }
      }
      return options;
    },
    guideModeOptions: function() {
      let options = [];
      if (this.selectedinstrument in this.availableInstruments) {
        let modes = this.availableInstruments[this.selectedinstrument].modes.guiding.modes;
        if (this.selectedinstrument === '2M0-SCICAM-MUSCAT') {
          options = this.parseGuideModeOptions(modes, true, ['ON']);
        } else if (this.datatype === 'SPECTRA') {
          options = this.parseGuideModeOptions(modes, false, ['OFF']);
        } else {
          options = this.parseGuideModeOptions(modes, true, []);
        }
      }
      return options;
    },
    requiredAcquireModeFields: function() {
      for (let i in this.acquireModeOptions) {
        if (this.acquireModeOptions[i].value == this.configuration.acquisition_config.mode) {
          return this.acquireModeOptions[i].requiredFields;
        }
      }
      return [];
    }
  },
  watch: {
    selectedImagerGuidingOption: function(value) {
      this.setGuidingFields(value);
    },
    guideModeOptions: function() {
      // The selected guide mode for spectrographs is already updated elsewhere
      if (this.datatype !== 'SPECTRA') {
        let newGuideOption = this.getNewGuideOption(this.selectedImagerGuidingOption);
        let selectedGuideOptionChanged = this.selectedImagerGuidingOption !== newGuideOption;
        this.selectedImagerGuidingOption = newGuideOption;
        if (!selectedGuideOptionChanged) {
          // If the option did not change, the underlying fields may still have changed. Force an update.
          this.setGuidingFields(this.selectedImagerGuidingOption);
        }
      }
    },
    selectedinstrument: function(value) {
      if (this.configuration.instrument_type !== value) {
        if (this.datatype === 'SPECTRA') {
          // Need to set up spectrograph here because the instrument might have changed
          // from NRES to FLOYDS, which have different aquire modes and configuration types
          this.setupSpectrograph();
        }
        // The selected instrument is set in the request level in the UI, it is actually updated
        // in the request json here
        this.configuration.instrument_type = value;
        this.setupAcquireAndGuideFieldsForType(this.configuration.type);
        this.update();
      }
    },
    datatype: function(value) {
      if (value === 'SPECTRA') {
        this.setupSpectrograph();
      } else {
        this.setupImager();
      }
    },
    'configuration.acquisition_config.mode': function(newValue, oldValue) {
      if (oldValue !== 'OFF' && newValue !== 'OFF') {
        let oldExtraParams = this.configuration.acquisition_config.extra_params;
        if (newValue === this.acquireHistory.mode) {
          this.configuration.acquisition_config.extra_params = this.acquireHistory.extra_params;
        } else {
          this.configuration.acquisition_config.extra_params = {};
        }
        this.acquireHistory.mode = oldValue;
        this.acquireHistory.extra_params = oldExtraParams;
        this.update();
      }
    },
    'configuration.type': function(value) {
      this.setupAcquireAndGuideFieldsForType(value);
      if (!value.includes('REPEAT')) {
        this.configuration.repeat_duration = undefined;
      }
    }
  },
  created: function() {
    this.selectedImagerGuidingOption = this.getGuideOptionFromGuidingConfig(this.configuration.guiding_config);
    this.setupAcquireAndGuideFieldsForType(this.configuration.type);
  },
  methods: {
    update: function() {
      this.$emit('configurationupdated');
    },
    updateAcquisitionConfigExtraParam: function(value, field) {
      if (value === '') {
        // Remove the field if an empty value is entered because the validation
        // for required extra params only check if the field exists
        this.configuration.acquisition_config.extra_params[field] = undefined;
      }
      this.update();
    },
    configurationFillDuration: function() {
      this.$emit('configurationfillduration', this.index);
    },
    generateCalibs: function() {
      this.$emit('generateCalibs', this.index);
    },
    constraintsUpdated: function() {
      console.log('constraintsUpdated');
      this.update();
    },
    targetUpdated: function() {
      console.log('targetUpdated');
      this.update();
    },
    removeInstrumentConfiguration: function(idx) {
      this.configuration.instrument_configs.splice(idx, 1);
      this.update();
    },
    addInstrumentConfiguration: function(idx) {
      let newInstrumentConfiguration = JSON.parse(JSON.stringify(this.configuration.instrument_configs[idx]));
      this.configuration.instrument_configs.push(newInstrumentConfiguration);
      this.update();
    },
    instumentConfigurationUpdated: function() {
      console.log('instrumentconfigUpdated');
      this.update();
    },
    getGuidingConfigFromGuideOption: function(guidingOption) {
      // Return the guiding_config fields that map to the provided guiding option
      let guidingMode = guidingOption;
      let guidingOptional = this.defaultGuidingOptional;
      for (let guidingConfigMapping of this.guidingConfigMappings) {
        if (guidingConfigMapping.option === guidingOption) {
          guidingMode = guidingConfigMapping.config.mode;
          guidingOptional = guidingConfigMapping.config.optional;
          break;
        }
      }
      return { mode: guidingMode, optional: guidingOptional };
    },
    getGuideOptionFromGuidingConfig: function(guidingConfig) {
      // Return the guiding option from the provided guiding_config
      let guidingOption = guidingConfig.mode;
      for (let guidingConfigMapping of this.guidingConfigMappings) {
        if (guidingConfigMapping.config.mode === guidingConfig.mode && guidingConfigMapping.config.optional === guidingConfig.optional) {
          guidingOption = guidingConfigMapping.option;
          break;
        }
      }
      return guidingOption;
    },
    parseGuideModeOptions: function(modes, includeOptional, excludeModes) {
      /* Return the guiding options that will be presented to the user.
        `modes` - List of the instrument's guiding modes
        `includeOptional` - Boolean indicating whether to include the "OPTIONAL" guiding option
        `excludeModes` - List of guiding modes that should be excluded from the guiding options
      */
      let guideModeOptions = [];
      for (let mode of modes) {
        if (mode.code === 'ON' && includeOptional) {
          guideModeOptions.push({
            text: 'Optional',
            value: 'OPTIONAL'
          });
        }
        if (excludeModes.indexOf(mode.code) < 0) {
          let guidingConfig = this.getGuidingConfigFromGuideOption(mode.code);
          guideModeOptions.push({
            text: guidingConfig.optional ? 'Optional ' + mode.name : mode.name,
            value: mode.code
          });
        }
      }
      return guideModeOptions;
    },
    guideOptionExistsInCurrentGuideOptions: function(guideOption) {
      // Return whether the provided guide option value is available in the current list of guideModeOptions.
      let validOptions = _.filter(this.guideModeOptions, option => {
        return option.value === guideOption;
      });
      return validOptions.length > 0 ? true : false;
    },
    getGuideOptionsUsingDefaultGuideMode: function() {
      // Return a subset of the current guideModeOptions, including only those options that use the default guide mode.
      let defaultGuideMode = _.get(this.availableInstruments[this.selectedinstrument].modes.guiding, 'default');
      let guideOptionsWithDefaultMode = [];
      for (let guideOption of this.guideModeOptions) {
        let guidingConfig = this.getGuidingConfigFromGuideOption(guideOption.value);
        if (guidingConfig.mode === defaultGuideMode) {
          guideOptionsWithDefaultMode.push(guideOption);
        }
      }
      return guideOptionsWithDefaultMode;
    },
    getNewGuideOption: function(currentGuideOption) {
      // Return the value of a new guide option. A new valid guide option should always be found,
      // but if one is not found, return a reasonable fallback value.
      const fallbackGuideMode = 'OFF';
      let newGuideOption = fallbackGuideMode;
      if (this.guideOptionExistsInCurrentGuideOptions(currentGuideOption)) {
        newGuideOption = currentGuideOption;
      } else {
        let guideOptionsUsingDefaultGuideMode = this.getGuideOptionsUsingDefaultGuideMode();
        if (guideOptionsUsingDefaultGuideMode.length > 0) {
          newGuideOption = guideOptionsUsingDefaultGuideMode[0].value;
        } else {
          newGuideOption = _.get(this.guideModeOptions, [0, 'value'], fallbackGuideMode);
        }
      }
      return newGuideOption;
    },
    acquisitionModeIsAvailable: function(acquisitionMode, acquisitionExtraParams) {
      // In order for a mode to be available, its code as well as any extra params must match
      let modeMatches;
      for (let amo in this.acquireModeOptions) {
        if (acquisitionMode === this.acquireModeOptions[amo].value) {
          modeMatches = true;
          for (let aep in acquisitionExtraParams) {
            if (this.acquireModeOptions[amo].requiredFields.indexOf(aep) < 0) {
              modeMatches = false;
            }
          }
          if (modeMatches) {
            return true;
          }
        }
      }
      return false;
    },
    saveAcquireFields: function() {
      if (this.configuration.acquisition_config.mode !== 'OFF') {
        this.acquireHistory.mode = this.configuration.acquisition_config.mode;
        this.acquireHistory.extra_params = this.configuration.acquisition_config.extra_params;
      }
    },
    setAcquireFields: function() {
      if (this.acquisitionModeIsAvailable(this.configuration.acquisition_config.mode, this.configuration.acquisition_config.extra_params)) {
        // The mode that is already set works!
        return;
      }
      if (this.acquireModeOptions.length < 1 || this.simpleInterface) {
        // This case would happen for i.e. imagers that do not have any acquisition modes. Also
        // turn off acquisition for the simple interface since that interface only displays imager,
        // and should not be complicated.
        this.turnOffAcquisition();
        return;
      }
      let defaultMode = this.availableInstruments[this.selectedinstrument].modes.acquisition.default;
      if (this.acquisitionModeIsAvailable(this.acquireHistory.mode, this.acquireHistory.extra_params)) {
        this.configuration.acquisition_config.mode = this.acquireHistory.mode;
        this.configuration.acquisition_config.extra_params = this.acquireHistory.extra_params;
      } else if (defaultMode) {
        this.configuration.acquisition_config.mode = defaultMode;
        if (defaultMode === this.acquireHistory.mode) {
          this.configuration.acquisition_config.extra_params = this.acquireHistory.extra_params;
        } else {
          this.configuration.acquisition_config.extra_params = {};
        }
      } else if (this.acquireModeOptions.length > 0) {
        this.saveAcquireFields();
        this.configuration.acquisition_config.mode = this.acquireModeOptions[0].value;
        this.configuration.acquisition_config.extra_params = {};
      }
      this.update();
    },
    turnOffAcquisition: function() {
      this.saveAcquireFields();
      this.configuration.acquisition_config.mode = 'OFF';
      this.configuration.acquisition_config.extra_params = {};
      this.update();
    },
    setGuidingFields: function(guidingOption) {
      // Set the fields in the configuration's guiding_config based on the user's chosen
      // guiding option.
      let guidingConfig = this.getGuidingConfigFromGuideOption(guidingOption);
      this.configuration.guiding_config.optional = guidingConfig.optional;
      this.configuration.guiding_config.mode = guidingConfig.mode;
      this.update();
    },
    setupAcquireAndGuideFieldsForType: function(configurationType) {
      if (configurationType) {
        if (configurationType.includes('SPECTRUM')) {
          this.setGuidingFields('ON');
          this.setAcquireFields();
        } else if (configurationType == 'LAMP_FLAT' || configurationType == 'ARC') {
          this.setGuidingFields('OPTIONAL');
          this.turnOffAcquisition();
        } else if (configurationType.includes('EXPOSE')) {
          this.setGuidingFields(this.selectedImagerGuidingOption);
          this.setAcquireFields();
        }
      }
    },
    setupImager: function() {
      this.configuration.type = 'EXPOSE';
      this.update();
    },
    setupSpectrograph: function() {
      if (this.selectedinstrument.includes('NRES')) {
        this.configuration.type = 'NRES_SPECTRUM';
      } else {
        this.configuration.type = 'SPECTRUM';
      }
      this.update();
    },
    getFromObject(obj, path, defaultValue) {
      return _.get(obj, path, defaultValue);
    }
  }
};
</script>
