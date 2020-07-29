appModule.directive('keywordsTypeahead', keywordsTypeaheadDirective);

function keywordsTypeaheadDirective(assetState) {
    var template = '<ui-select multiple tagging tagging-label="" ng-model="keywordParentObject.keywords" sortable="true" title="Keywords">' +
                        '<ui-select-match placeholder="Add Keywords...">{{$item}}</ui-select-match>' +
                        '<ui-select-choices repeat="keyword in keywordParentObject.keywords | filter:$select.search">' +
                            '{{keyword}}' +
                        '</ui-select-choices>' +
                    '</ui-select>';

    return {
        restrict: 'E',
        template: template,
        scope: {
            // this object should have a "keywords" property on it
            // and that property will be used to store the keywords
            keywordParentObject: '='
        }
    };
}