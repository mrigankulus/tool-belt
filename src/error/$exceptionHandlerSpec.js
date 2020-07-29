describe('$exceptionHandler', function () {

    var log,
        instance,
        messenger,
        googleAnalytics;

    beforeEach(function () {
        module("dev-tool-belt");

        inject(function ($exceptionHandler, $log, _messenger_, _googleAnalytics_) {
            log = $log;
            messenger = fragrance.mock(_messenger_);
            googleAnalytics = fragrance.mock(_googleAnalytics_);
            instance = $exceptionHandler;
        });

    });

    it("should log the exception", inject(function () {
        instance("exception", "cause");
        expect(log.error.logs.length).toBe(1);
        expect(log.error.logs[0]).toEqual(["exception", "cause"]);
    }));

    it("should open an error message", inject(function (messenger) {
        instance("exception", "cause");
        expect(messenger.showError).toHaveBeenCalled();
    }));

    it("should track the error using Google Analytics", inject(function (googleAnalytics) {
        var exception = {
            message: 'message',
            stack: 'stack'
        };
        instance(exception);
        expect(googleAnalytics.trackEvent).toHaveBeenCalledWith("JavaScript Error", exception.message, exception.stack);
    }));
});
