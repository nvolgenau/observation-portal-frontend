<template>
  <div class="row">
    <div class="col-md-12">
      <h1>Help</h1>
      <p>The Observation Portal is your access point to Las Cumbres Observatory's global network of telescopes.</p>
      <p>Registered users can:</p>
      <ul class="list-unstyled help-list">
        <li>
          <i class="fa fa-users fa-2x fa-fw" aria-hidden="true"></i>
          <span>
            <router-link :to="{name: 'apply'}">Write and submit proposals</router-link>and manage the membership of their research teams.
          </span>
        </li>
        <li>
          <i class="fab fa-wpexplorer fa-2x fa-fw" aria-hidden="true"></i>
          <span>
            <router-link :to="{name: 'create'}">Plan, compose, and submit observation requests</router-link>for approved proposals.
          </span>
        </li>
        <li>
          <i class="fa fa-check fa-2x fa-fw" aria-hidden="true"></i>
          <span>
            <router-link :to="{name: 'home'}">Track the status</router-link>of submitted requests.
          </span>
        </li>
        <li>
          <i class="fas fa-cloud-download-alt fa-2x fa-fw" aria-hidden="true"></i>
          <span>
            Identify and
            <router-link :to="{name: 'apply'}">download data from completed observations.</router-link>
          </span>
        </li>
        <li>
          <i class="far fa-clock fa-2x fa-fw" aria-hidden="true"></i>
          <span>
            <router-link :to="{name: 'proposals'}">Monitor the hours used by approved proposals.</router-link>
          </span>
        </li>
        <li>
          <i class="fa fa-question fa-2x fa-fw" aria-hidden="true"></i>
          <span>
            <a
              href="mailto:science-support@lco.global"
            >Report problems, ask questions, and make suggestions.</a>
          </span>
        </li>
      </ul>
      <p>
        If you are a new user of this Observation Portal, we strongly recommend that you read the
        <a
          href="https://lco.global/documents/450/GettingStartedontheLCONetwork.latest.pdf"
        >"Getting Started on the LCO Global Telescope Network" Guide.</a>
      </p>
      <p>
        If you are a new user of the LCO network, information about the
        <a href="https://lco.global/observatory/telescopes">telescopes</a>,
        <a href="https://lco.global/observatory/instruments">instruments</a>,
        <a href="http://lcogt.net/observatory/data">data handling and quality</a>,
        <a href="https://lco.global/observatory/scheduling">scheduling</a> and other technical aspects of the network is available on the
        <a href="https://lco.global/observatory/">observatory</a> pages.
      </p>
      <p>
        For citing Las Cumbres Observatory please review
        <a
          title="data use"
          href="https://lco.global/observatory/termsofservice/#data-use"
        >Data Use and Acknowledgements</a>.
      </p>
      <h3>Minimum Requirements</h3>
      <p>
        The following are the minimum versions of browsers required to use the observation portal. All other
        browsers/versions are supported on a best-effort basis.
      </p>
      <ul class="list-unstyled">
        <li>
          Google Chrome/Chromium:
          <strong>56+</strong>
        </li>
        <li>
          Mozilla Firefox:
          <strong>46+</strong>
        </li>
        <li>
          Apple Safari:
          <strong>11.1+</strong>
        </li>
        <li>
          Microsoft Edge:
          <strong>17+</strong>
        </li>
        <li>
          Internet Explorer:
          <strong>10+</strong> (minimal support)
        </li>
      </ul>
      <p>
        If you require additional support, you may contact science support at
        <a href="mailto:science-support@lco.global">science-support@lco.global</a>.
        For inquiries about particular observation requests, please include the tracking and request numbers in your email.
      </p>
      <a
        href="mailto:science-support@lco.global"
        class="btn btn-outline-secondary"
      >Email Science Support</a>
    </div>
  </div>
</template>