import Vue from 'vue'
import PortsList from './components/PortsList.vue'

import axios from 'axios'

angular
  .module('buildbot_macports_custom_views')
  .config([
    'bbSettingsServiceProvider',
    bbSettingsServiceProvider => {
      bbSettingsServiceProvider.addSettingsGroup({
        name: 'PortsBuildsHistory',
        caption: 'Ports Builds History page related settings',
        items: [
          {
            type: 'integer',
            name: 'buildLimit',
            caption: 'Number of builds to fetch',
            default_value: 200
          },
          {
            type: 'integer',
            name: 'builderLimit',
            caption: 'Number of builders to fetch',
            default_value: 20000
          },
          {
            type: 'integer',
            name: 'pageSize',
            caption: 'Number of ports to display on one page',
            default_value: 100
          }
        ]
      })
    }
  ])
  .directive('portsDirective', [
    '$q',
    '$window',
    'dataService',
    'bbSettingsService',
    'resultsService',
    '$uibModal',
    '$timeout',
    '$location',
    (
      $q,
      $window,
      dataService,
      bbSettingsService,
      resultsService,
      $uibModal,
      $timeout,
      $location
    ) => {
      const settings = bbSettingsService.getSettingsGroup('PortsBuildsHistory')

      function link(scope, element, attrs) {
        // create an instance of the data accessor
        const dataAccessor = dataService.open().closeOnDestroy(scope)

        const builders = dataAccessor.getBuilders({
          limit: settings.builderLimit.value,
          order: '-builderid'
        })
        const builds = dataAccessor.getBuilds({
          limit: settings.buildLimit.value,
          order: '-started_at',
          property: '*'
        })
        const workers = dataAccessor.getWorkers({
          order: '-workerid'
        })

        const pageSize = settings.pageSize.value

        const ComponentClass = Vue.extend(PortsList)

        /**
         * TODO: Make data module compatible with Vue, so that collections
         * can be directly passed to Vue SFC. Right now we are creating new arrays
         * for different properties (builds, builders, etc), and appending items
         * to them and passing it as data to the component.
         */
        let buildsArray = [],
          buildersArray = [],
          workersArray = []

        builds.onNew = build => {
          axios
            .get(`${window.location.origin}/api/v2/builds/${build.buildid}`)
            .then(response => {
              buildsArray.push(response.data.builds[0])
            })
          data.builds = buildsArray
        }
        builders.onNew = builder => {
          axios
            .get(
              `${window.location.origin}/api/v2/builders/${builder.builderid}`
            )
            .then(response => {
              buildersArray.push(response.data.builders[0])
            })
          data.builders = buildersArray
        }
        workers.onNew = worker => {
          axios
            .get(`${window.location.origin}/api/v2/workers/${worker.workerid}`)
            .then(response => {
              workersArray.push(response.data.workers[0])
            })
          data.workers = workersArray
        }

        let data = {
          location: $location,
          builders: [],
          builds: [],
          workers: [],
          pageSize: pageSize
        }

        new ComponentClass({
          data: data,
          el: element.get(0)
        })

        data.scope = scope
      }

      return {
        link: link
      }
    }
  ])
