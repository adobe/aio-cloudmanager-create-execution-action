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
const core = require('@actions/core')
const { initSdk } = require('./init')
const { REQUIRED } = require('./constants')

function executeAction () {
  return new Promise((resolve) => {
    const imsOrgId = core.getInput('imsOrgId', REQUIRED)
    const programId = core.getInput('programId', REQUIRED)
    const pipelineId = core.getInput('pipelineId', REQUIRED)

    initSdk(imsOrgId).then(sdk => {
      sdk.createExecution(programId, pipelineId)
        .then(execution => {
          core.info(`Started execution ID ${execution.id}`)
          core.setOutput('executionId', execution.id)
          core.setOutput('executionHref', execution.link('self') && `${sdk.baseUrl}${execution.link('self').href}`)
          resolve()
        })
        .catch(e => {
          core.setFailed(e)
          resolve()
        })
    }).catch(e => {
      core.setFailed(e)
      resolve()
    })
  })
}

module.exports = {
  executeAction,
}
