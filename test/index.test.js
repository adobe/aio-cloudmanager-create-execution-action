/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { context, getToken } = require('@adobe/aio-lib-ims')
const { init, generateNewMock } = require('@adobe/aio-lib-cloudmanager')
const core = require('@actions/core')
const { setDecodedToken, resetDecodedToken } = require('jsonwebtoken')

const { executeAction } = require('../src/action')

const emptyContext = (name) => {
  return {
    name,
  }
}

const EMPTY_CLI_CONTEXT = emptyContext('cli')

const POSITIVE_CLI_CONTEXT = {
  ...EMPTY_CLI_CONTEXT,
  data: {},
}

let mockSdk

beforeEach(() => {
  mockSdk = generateNewMock()
  resetDecodedToken()
})

test('test using cli auth', async () => {
  const input = {
    imsOrgId: 'abc@AdobeOrg',
    programId: '1',
    pipelineId: '2',
  }

  core.getInput = jest.fn(name => input[name])
  context.get = jest.fn(name => name === 'cli' ? POSITIVE_CLI_CONTEXT : emptyContext(name))

  await executeAction()
  expect(getToken).toHaveBeenCalledWith('cli')
  expect(init).toHaveBeenCalledWith('abc@AdobeOrg', 'fake-client-id', 'fake-token')
  expect(core.info).toHaveBeenCalledWith('Started execution ID execution1')
  expect(core.setOutput).toHaveBeenNthCalledWith(1, 'executionId', 'execution1')
  expect(core.setOutput).toHaveBeenNthCalledWith(2, 'executionHref', 'https://cloudmanager.adobe.io/program/1/pipeline/2/execution/3')
})

test('test using cli auth - failed', async () => {
  const input = {
    imsOrgId: 'abc@AdobeOrg',
    programId: '1',
    pipelineId: '2',
  }

  core.getInput = jest.fn(name => input[name])
  context.get = jest.fn(name => name === 'cli' ? POSITIVE_CLI_CONTEXT : emptyContext(name))

  mockSdk.createExecution = jest.fn(() => {
    return new Promise((resolve, reject) => reject(new Error('unable to start execution')))
  })

  await executeAction()
  expect(getToken).toHaveBeenCalledWith('cli')
  expect(init).toHaveBeenCalledWith('abc@AdobeOrg', 'fake-client-id', 'fake-token')
  expect(core.setFailed).toHaveBeenCalledWith(new Error('unable to start execution'))
})

test('test using cli auth - cannot decode token', async () => {
  setDecodedToken(null)
  const input = {
    imsOrgId: 'abc@AdobeOrg',
    programId: '1',
    pipelineId: '2',
  }

  core.getInput = jest.fn(name => input[name])
  context.get = jest.fn(name => name === 'cli' ? POSITIVE_CLI_CONTEXT : emptyContext(name))

  await executeAction()
  expect(getToken).toHaveBeenCalledWith('cli')
  expect(init).not.toHaveBeenCalledWith()
  expect(core.setFailed).toHaveBeenCalledWith(new Error('Cannot decode token read from CLI authentication context'))
})

test('test using cli auth - missing client_id', async () => {
  setDecodedToken({})
  const input = {
    imsOrgId: 'abc@AdobeOrg',
    programId: '1',
    pipelineId: '2',
  }

  core.getInput = jest.fn(name => input[name])
  context.get = jest.fn(name => name === 'cli' ? POSITIVE_CLI_CONTEXT : emptyContext(name))

  await executeAction()
  expect(getToken).toHaveBeenCalledWith('cli')
  expect(init).not.toHaveBeenCalledWith()
  expect(core.setFailed).toHaveBeenCalledWith(new Error('The decoded token from the CLI authentication context did not have a client_id'))
})

test('test using provided config auth - JWT', async () => {
  const input = {
    imsOrgId: 'abc@AdobeOrg',
    programId: '1',
    pipelineId: '2',
    key: 'test-key',
    clientId: 'test-clientid',
    clientSecret: 'test-clientSecret',
    technicalAccountId: 'test-technicalAccountId',
  }

  core.getInput = jest.fn(name => input[name])
  context.get = jest.fn(name => name === 'aio-cloudmanager-github-actions' ? 'fake-token' : undefined)

  await executeAction()
  expect(context.get).toHaveBeenCalledWith('cli')
  expect(context.set).toHaveBeenCalledWith('aio-cloudmanager-github-actions', {
    client_id: 'test-clientid',
    client_secret: 'test-clientSecret',
    technical_account_id: 'test-technicalAccountId',
    ims_org_id: 'abc@AdobeOrg',
    private_key: 'test-key',
    meta_scopes: [
      'ent_cloudmgr_sdk',
    ],
  }, true)
  expect(getToken).toHaveBeenCalledWith('aio-cloudmanager-github-actions')
})

test('test using provided config auth - OAuth', async () => {
  const input = {
    imsOrgId: 'abc@AdobeOrg',
    programId: '1',
    pipelineId: '2',
    clientId: 'test-clientid',
    clientSecret: 'test-clientSecret',
    technicalAccountId: 'test-technicalAccountId',
    technicalAccountEmail: 'test-technicalAccountEmail',
    oauthEnabled: 'true',
  }

  core.getInput = jest.fn(name => input[name])
  context.get = jest.fn(name => name === 'aio-cloudmanager-github-actions' ? 'fake-token' : undefined)

  await executeAction()
  expect(context.get).toHaveBeenCalledWith('cli')
  expect(context.set).toHaveBeenCalledWith('aio-cloudmanager-github-actions', {
    client_id: 'test-clientid',
    client_secrets: ['test-clientSecret'],
    technical_account_id: 'test-technicalAccountId',
    technical_account_email: 'test-technicalAccountEmail',
    ims_org_id: 'abc@AdobeOrg',
    scopes: [
      'openid',
      'AdobeID',
      'read_organizations',
      'additional_info.projectedProductContext',
      'read_pc.dma_aem_ams',
    ],
  }, true)
  expect(getToken).toHaveBeenCalledWith('aio-cloudmanager-github-actions')
})
