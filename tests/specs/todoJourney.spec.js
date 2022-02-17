const { test } = require('@playwright/test')
const TodoModel = require('../models/TodoJourney')

const testCases = TodoModel.getShortestPathPlans()

testCases.forEach((testCase) => {
  test.describe(testCase.description, () => {
    testCase.paths.forEach((path) => {
      test(path.description, async ({ page }) => {
        await page.goto('/')
        // Test execution
        await path.test(page)
      })
    })
  })
})
