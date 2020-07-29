/*
 * Listen for HTTP errors and broadcast an 'http-error' event so that we can display at least a rudimentary
 * error message to the user.
 */
appModule.factory("httpErrorHandler",
    function ($rootScope, $q, ERROR_MESSAGES, messenger) {
        return {
            response: function success(response) {
                return response;
            },
            responseError: function error(response) {
                if (response.config.headers.ignoreErrors || response.config.willHandleErrors) {
                    return $q.reject(response);
                }

                var msg = '';

                // todo: how do we handle 404s?
                if (response.status === 404) {
                    return $q.reject(response);
                }

                if (response.status === 417 || response.status === 400) {
                    messenger.showMessage({
                        title: response.statusText,
                        content: response.data.message,
                        isDismissable: true
                    });

                    return $q.reject(response);
                }

                if (response.status === 500) {
                    msg = ERROR_MESSAGES.HTTP_500.message;
                } else if (response.status === 403) {
                    messenger.showMessage({
                        title: 'Insufficient Permissions',
                        content: ERROR_MESSAGES.HTTP_403.message,
                        isDismissable: true
                    });

                    return $q.reject(response);
                } else {
                    msg = ERROR_MESSAGES.HTTP_UNEXPECTED.message;
                }
                messenger.showError(msg);

                return $q.reject(response);
            }
        };
    }
);
