const { createMachine, assign } = require('xstate')
const { createModel } = require('@xstate/test')
const { expect } = require('@playwright/test')

const TodoMachine = createMachine({
  id: 'todo',
  context: {
    todo: '',
  },
  initial: 'emptyTask',
  // system states
  states: {
    emptyTask: {
      on: {
        ADD_TASK: {
          target: 'someTasks',
          cond: (_, e) => e.value !== '',
          actions: assign({
            todo: (_, e) => e.value,
          }),
        },
      },
      meta: {
        // state assertion
        test: async (page, { context }) => {
          expect(await page.locator('#empty-todo')).toBeVisible()
          await expect(
            page.locator(`//span[text()='${context.todo}']`)
          ).not.toBeVisible()
        },
      },
      type: 'final',
    },
    // compound/nested state
    someTasks: {
      on: {
        DELETE_TASK: 'emptyTask',
      },
      initial: 'unchecked',
      states: {
        unchecked: {
          on: {
            TOGGLE_CHECKBOX: 'checked',
          },
          meta: {
            test: async (page, { context }) => {
              await expect(page.locator('#txt0')).toHaveText(context.todo)
              await expect(page.locator('#check0')).not.toBeChecked()
            },
          },
        },
        checked: {
          on: {
            TOGGLE_CHECKBOX: 'unchecked',
          },
          meta: {
            test: async (page) => {
              await expect(page.locator('#check0')).toBeChecked()
              await expect(page.locator('#txt0')).toHaveCSS(
                'text-decoration',
                'line-through solid rgb(0, 0, 0)'
              )
            },
          },
        },
      },
    },
  },
})

// test model
const TodoModel = createModel(TodoMachine).withEvents({
  ADD_TASK: {
    exec: async (page, e) => {
      await page.fill('#input-todo', e.value)
      if (e.actionType === 'keypress') {
        await page.keyboard.press('Enter')
      } else {
        await page.click('#add')
      }
    },
    cases: [
      { value: 'Make coffee' },
      { value: '' },
      { value: 'Make tea', actionType: 'keypress' },
    ],
  },
  DELETE_TASK: async (page) => {
    await page.locator('#l0').hover()
    await page.click('#btn0')
  },
  TOGGLE_CHECKBOX: async (page) => {
    await page.click("#l0 input[type='checkbox']")
  },
})

module.exports = TodoModel
