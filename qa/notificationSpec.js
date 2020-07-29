var ourProtractor = require('our-protractor')

var date = Date()
var dateTime = Date.now()
var eventTypeTitle = 'protractor-test-' + dateTime

describe('Setup', function () {

  it('should navigate to /event-types', function () {
    browser.get(ourProtractor.util.getAppUrl() + '/event-types')
    expect(browser.getTitle()).toEqual('Event Types | Dev Tool Belt')
  })

  it('Add New Event Type button opens slider ', function () {
    var slideOut = element(by.css('[ng-if="EventTypes.isAddEventTypeForm"]'))
    expect(slideOut.isDisplayed, false)

    element(by.css('[auto-focus="#eventTypeTitle"]')).click()
    expect(slideOut.isDisplayed, true)
  })

  it('Should create a new Resource Type', function () {
    var slideOut = element(by.css('ng-if="NewEventType.isAddResourceTypeForm"]'))
    expect(slideOut.isDisplayed, false)

    element(by.css('[auto-focus="#resourceTypeTitle"]')).click()
    expect(slideOut.isDisplayed, true)

    element(by.id('resourceTypeTitle')).sendKeys(eventTypeTitle)
    expect(element(by.model('NewResourceType.new.id')), eventTypeTitle)

    element(by.model('NewResourceType.new.description')).sendKeys('Protractor test on ' + date)

    element(by.css('form[name="newResourceTypeForm"]')).submit()
  })

  it('Should populate fields and continue', function () {
    element(by.id('eventTypeTitle')).sendKeys(eventTypeTitle)
    expect(element(by.model('NewEventType.new.id')), eventTypeTitle)

    element(by.model('NewEventType.new.description')).sendKeys('Protractor test on ' + date)

    element(by.css('form[name="newEventTypePrimaryForm"]')).submit()

    element(by.model('NewEventType.new.amqpExchange')).evaluate("NewEventType.new.amqpExchange = 'protractor-test';")

    element(by.css('form[name="newEventTypeSecondaryForm"]')).submit()
  })

})

describe('Craft notification', function () {
  it('Should now be on event page', function () {
    expect(browser.getLocationAbsUrl())
      .toBe('/event-types/' + eventTypeTitle + '/compose')
  })

  it('Should add small message', function () {
    element(by.model('EventTypeCompose.smallContentTemplate.content'))
      .sendKeys('This is a protractor test on ' + date)
  })

  it('Should add email message', function () {
    element(by.model('EventTypeCompose.emailContentTemplate.subject'))
      .sendKeys('Protractor test')

    element(by.model('EventTypeCompose.emailContentTemplate.content'))
      .sendKeys('This is a protractor test on ' + date)
  })

  it('Should save', function () {
    element(by.css('[ng-click="EventTypeCompose.update()"]')).click()
    browser.waitForAngular()
  })

})

describe('Playground', function () {
  browser.sleep(10000) // Quick pause to allow backend processes to complete

  it('Should navigate to the Playground', function () {
    browser.get(ourProtractor.util.getAppUrl() + '/event-types/' + eventTypeTitle + '/playground')

    expect(browser.getLocationAbsUrl())
      .toBe('/event-types/' + eventTypeTitle + '/playground')
  })

  it('Should send a sample notification', function () {
    element(by.model('token.value')).sendKeys('testing')

    element(by.css('form[name="testNotificationForm"] > section > .form-actions > section > button')).click()
    browser.waitForAngular()
  })

})

describe('Activity', function () {

  it('Should navigate to the Playground', function () {
    browser.sleep(10000) // sleep for 10s as we wait for the notification to be created
    browser.get(ourProtractor.util.getAppUrl() + '/event-types/' + eventTypeTitle + '/activity/list')

    expect(browser.getLocationAbsUrl())
      .toBe('/event-types/' + eventTypeTitle + '/activity/list')
  })

  it('Should have one notification', function () {
    browser.waitForAngular()
    expect(element.all(by.css('.card-outer')).count()).toBe(1)
    cleanup()
  })

})

function cleanup() {
  browser.get(ourProtractor.util.getAppUrl() + '/resource-types/' + eventTypeTitle + '/settings')
  browser.waitForAngular()

  element(by.css('[ng-click="ResourceTypeSettings.deleteResourceType()"]')).click()
  browser.sleep(2000)

  element(by.css('.messenger-btn-group > button:nth-child(2)')).click()
  browser.waitForAngular()
}
