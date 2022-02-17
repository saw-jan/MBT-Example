const { devices } = require('@playwright/test')

const config = {
  use: {
    headless: false,
    baseURL: 'http://localhost:3000',
  },
  testDir: './tests/specs',
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
}

module.exports = config
