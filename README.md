# Personal Finance App

This app is a personal finance tool that allows me to aggregate my US and UK financial accounts for budgeting and tax purposes.

The app is built with [React Native](https://reactnative.dev/), the [React Native Paper](https://reactnativepaper.com/) UI component library, [React Navigation](https://reactnavigation.org/), and [TanStack Query](https://tanstack.com/query/latest) (formally React Query). [Jest](https://jestjs.io/) is used for unit and integration testing and [Detox](https://wix.github.io/Detox/) is used for e2e testing.

## Requirements

Follow the [instructions](https://reactnative.dev/docs/environment-setup) from the React Native docs to setup the development environment in order to run this project locally.

In order to run the Detox e2e tests, follow the [getting started instructions](https://wix.github.io/Detox/docs/introduction/getting-started) from the Detox docs. Note that, on the [project setup](https://wix.github.io/Detox/docs/introduction/project-setup) page, only step 5 (building the app) might need to be followed in order for the tests to run locally.

## Cloning the project and starting the development server

Clone the repo by running `git clone git@github.com:dmontag23/bank-app.git`. Navigate into the cloned directory and run `npm i` to install all of the project dependencies, followed by `npm start` to start the development sever.

## Mock server

A mock server has been created in order to facilitate development and testing without the need to call external APIs.

To start the mock server, open a new terminal in the root directory of the project and run `npm run mock-server`. This will start the mock server on port `9091`.

To configure the app to use the mock server instead of the external APIs, replace the contents of `config.json` in the root of the repo with the contents of `config-mock-server.json`.

## Testing

To run the unit and integration tests, run `npm run test:unit`.

To run the e2e tests, run `export E2E_CONFIG=ios.sim.debug` to run the tests on IOS or `export E2E_CONFIG=android.att.debug` to run the tests on Android. Run `npm start` to start the development server. Choose the platform on which you want to run the tests from the metro menu. Then, in a separate terminal, run `npm run test:e2e`.

To run all of the tests for the project, follow the steps for the e2e tests outlined in the paragraph above, but run `npm test` instead of `npm run test:e2e`.

## Important Caveats

This project is purely a personal project to help me consolidate my finances while learning mobile development. As such, I currently do not intend to publish it on the App Store or grow the project.

Since I have an IPhone, I prioritize the IOS development flow, and while I try to ensure the app also works with Android every so often for practice, I cannot guarantee it will always run - or run well - on an Android device. There might also be code that is not "production ready" and some practices followed that I would not normally follow when working on a team, such as leaving TODO comments all over the codebase for things I want to improve, not keeping all tests green on master, etc.
