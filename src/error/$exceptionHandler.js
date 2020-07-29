/*
 * Override Angular's default $exceptionHandler to pass on an event so that it can be displayed to the user
 */
appModule.factory("$exceptionHandler",
    function ($log, $injector, ERROR_MESSAGES) {
        return function $exceptionHandler(exception, cause) {
            /*
             * We have a problem with a circular dependency if we inject the messenger directly.  Instead,
             * use the $injector service.  Also: we have to put it in this function, not the enclosing function
             * to avoid the same circular dependency issue.
             */
            var messenger = $injector.get('messenger');
            $log.error.apply($log, arguments);

            // todo: ignoring a specific error for the messenger.
            // https://github.wwt.com/custom-apps/dev-tool-belt/issues/347
            // obvious todo here to fix the problem but it will
            // require digging through highcharts a bit. this will at least prevent
            // the entire page from blowing up.
            if (exception.message !== "Cannot read property 'stroke' of undefined") {
                var msg = ERROR_MESSAGES.APPLICATION_ERROR.message;
                messenger.showError(msg);
            }

            var googleAnalytics = $injector.get('googleAnalytics');
            googleAnalytics.trackEvent('JavaScript Error', exception.message, exception.stack);
        };
    }
);
