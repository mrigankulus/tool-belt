appModule.directive('tokenTypeaheadMenu', tokenTypeaheadMenuDirective);

function tokenTypeaheadMenuDirective($filter) {
    return {
        restrict: 'E',
        templateUrl: 'events/child-views/token-typeahead-menu/tokenTypeaheadMenu.html',
        scope: {
            inputId: '=',
            starterTokenList: '='
        },
        link: link
    };

    function link($scope) {

        $scope.searchTokensTypeAhead = searchTokensTypeAhead;
        $scope.onSelectTokenFromTypeAhead = onSelectTokenFromTypeAhead;

        function searchTokensTypeAhead(term) {
            $scope.tokenSearchResults = $filter('filter')($scope.starterTokenList, term);
        }

        function onSelectTokenFromTypeAhead(item) {
            return '{{ ' + item.tokenName +' }}';
        }
    }
}