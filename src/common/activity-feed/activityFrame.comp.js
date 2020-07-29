appModule.component('activityFrame', {
    templateUrl: 'common/activity-feed/activityFrame.html',
    controller: ActivityFrameCtrl,
    bindings: {
        settings: '<'
    }
});

function ActivityFrameCtrl($sce, envExtended) {
  var vm = this

  vm.getIframeUrl = getIframeUrl

  init()

  function init() {
    if (!vm.settings) {
      return
    }

    iFrameResize({
        // log:true,
        heightCalculationMethod: 'documentElementScroll',
        resizeFrom: 'child',
        checkOrigin: false,
        initCallback: function (iframe) {
            // when the frame is ready
            iframe.contentWindow.postMessage({
                messageId: 'initFeedWithSettings',
                settings: vm.settings,
            }, 'https://wwt-activity-feed-frame.apps' + envExtended.getTargetEnvModifier() + '.wwt.com')
        }
    }, '#activityFeedFrame')
  }

  function getIframeUrl() {
    if (!vm.settings) {
      return
    }

    var url = '//wwt-activity-feed-frame.apps' + envExtended.getTargetEnvModifier() + '.wwt.com/resource-types/'
    url += vm.settings.typeId
    url += '/resources/'
    url += vm.settings.id
    url += '?fullSettingsMode=true'

    return $sce.trustAsResourceUrl(url)
  }
}
