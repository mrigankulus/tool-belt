var ourProtractor = require('our-protractor')

describe('The home page', function () {
    it('should have the correct title', function () {
        browser.get(ourProtractor.util.getAppUrl())
        expect(browser.getTitle()).toEqual('Dashboard | Dev Tool Belt')
    })
})
