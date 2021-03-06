const module = angular.module('buildbot_macports_custom_views', [
  'ui.router',
  'ui.bootstrap',
  'ui.bootstrap.popover',
  'ngAnimate',
  'guanlecoja.ui',
  'bbData'
])

module
  .config([
    '$stateProvider',
    'glMenuServiceProvider',
    'bbSettingsServiceProvider',
    'config',
    (
      $stateProvider,
      glMenuServiceProvider,
      bbSettingsServiceProvider,
      config
    ) => {
      let group
      const groups = []

      const pages = [
        ['Changes', '<changes-directive></changes-directive>', 'changeslist'],
        [
          'Filter Builds',
          '<filter-builds-directive></filter-builds-directive>',
          'filterbuilds'
        ],
        ['Ports Build History', '<ports-directive></ports-directive>', 'ports']
      ]

      for (let i of pages) {
        group = {
          name: i[0],
          template: i[1],
          url: i[2],
          items: []
        }
        groups.push(group)

        const groupForProvider = {
          name: group.name,
          caption: group.name,
          icon: group.name,
          order: group.name.length
        }
        glMenuServiceProvider.addGroup(groupForProvider)
      }

      for (group of Array.from(groups)) {
        const state = {
          template: group.template,
          name: group.name,
          url: `/${group.url}?id`,
          data: {
            group: group.name,
            caption: group.name
          },
          reloadOnSearch: false
        }

        $stateProvider.state(state)
      }
    }
  ])
  .config([
    '$locationProvider',
    function($locationProvider) {
      $locationProvider.hashPrefix('')
    }
  ])

module.run([
  '$rootScope',
  '$location',
  function($rootScope, $location) {
    $rootScope.location = $location
  }
])

require('./changes.directive.js')
require('./filter_builds.directive.js')
require('./ports.directive.js')
