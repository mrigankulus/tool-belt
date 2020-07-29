describe('httpErrorHandler', function () {

    var success,
        failure,
        instance,
        messenger,
        q;

    beforeEach(function () {
        module("dev-tool-belt");

        inject(function (httpErrorHandler, $rootScope, _$q_,  _messenger_) {
            messenger = fragrance.mock(_messenger_);
            q = _$q_;

            instance = httpErrorHandler;
            $rootScope.$digest();

            success = httpErrorHandler.response;
            failure = httpErrorHandler.responseError;
        });

    });

    it("success callback should return the response", inject(function () {
        var response = {};
        expect(success(response)).toBe(response);
    }));

    it("failure callback should return the response", inject(function () {
        var expected = {'a': 'thing'};
        var response = {};
        spyOn(q, 'reject').and.returnValue(expected);

        expect(failure(response)).toBe(expected);

        expect(q.reject).toHaveBeenCalledWith(response);
    }));

    it("failure callback open a message", inject(function () {
        var response = {};

        failure(response);

        expect(messenger.showError).toHaveBeenCalled();
    }));
});
