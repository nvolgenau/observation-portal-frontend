<template>
  <b-container class="my-4 mx-1">
    <b-row>
      <b-col>
        <h1>Network Contention</h1>
        <p>
          This plot shows the amount of telescope time requested by RA and instrument. Observations requested where contention is high are more likely
          to incur scheduling conflicts.
        </p>
        <p>This plot excludes moving targets.</p>
        <Contention :instruments="instruments" />
        <h1>Network Pressure</h1>
        <p>
          The pressure of a block is defined as its length divided by the total length of time during which it is visible. For each time bin, this
          value is further divided by the number of telescopes from which the block is visible during that time bin. An overall pressure of 1 (dashed
          line) means the network is perfectly subscribed on average (&gt; 1 is over-subscription, &lt; 1 is under-subscription).
        </p>
        <p>This plot excludes moving targets.</p>
        <Pressure :instruments="instruments" />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import $ from 'jquery';

import Contention from '@/components/Contention.vue';
import Pressure from '@/components/Pressure.vue';

export default {
  name: 'Tools',
  components: {
    Contention,
    Pressure
  },
  data: function() {
    return {
      instruments: []
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  created: function() {
    let that = this;
    $.getJSON(that.observationPortalApiUrl + '/api/instruments/', function(data) {
      for (let instrument_type in data) {
        that.instruments.push({ value: instrument_type, text: data[instrument_type].name });
      }
    });
  }
};
</script>
