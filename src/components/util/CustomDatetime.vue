<template>
  <span>
    <b-form-group
      v-show="$parent.show"
      :id="field + '-datetimegroup-' + $parent.id"
      label-size="sm"
      label-align-sm="right"
      label-cols-sm="4"
      :label-for="field"
    >
      <template slot="label">
        {{ label }}
        <sup v-if="desc" v-b-tooltip="tooltipConfig" class="text-primary" :title="desc">
          ?
        </sup>
      </template>
      <VueCtkDateTimePicker
        :id="field + '-datetimefield-' + $parent.id"
        v-model="value"
        label=""
        :format="datetimeFormat"
        :formatted="datetimeFormat"
        :error="hasErrors"
        :no-header="true"
        :no-button-now="true"
        :no-button="true"
        @input="update($event)"
      />
      <span v-for="error in errors" :key="error" class="errors text-danger">
        {{ error }}
      </span>
    </b-form-group>
    <span v-show="!$parent.show" class="mr-4">
      {{ label }}: <strong>{{ value || '...' }}</strong>
    </span>
  </span>
</template>
<script>
import _ from 'lodash';
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';

import { datetimeFormat, tooltipConfig } from '@/utils.js';

export default {
  components: {
    VueCtkDateTimePicker
  },
  props: {
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    field: {
      type: String,
      default: function() {
        return _.kebabCase(this.label);
      }
    },
    errors: {
      validator: function(value) {
        return value === undefined || value === null || typeof value === 'object';
      },
      required: true
    },
    desc: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      tooltipConfig: tooltipConfig,
      datetimeFormat: datetimeFormat
    };
  },
  computed: {
    hasErrors: function() {
      return !_.isEmpty(this.errors);
    }
  },
  methods: {
    update: function(value) {
      this.$emit('input', value);
    }
  }
};
</script>
<style scoped>
@import '~vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
</style>
<style>
/*
   * Override the default ctk datetime picker styles to look like other
   * bootstrap 4 input fields, using scoped style does not work
   */
.date-time-picker .field .field-input {
  color: inherit !important;
  font-size: 0.875rem !important;
  padding-top: 0rem !important;
  font-family: inherit !important;
  height: 38px !important;
  min-height: 38px !important;
}
.date-time-picker span.errors {
  font-size: 90%;
}
</style>
