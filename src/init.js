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

const { context, getToken } = require('@adobe/aio-lib-ims')
const { CLI } = require('@adobe/aio-lib-ims/src/context')
const { init } = require('@adobe/aio-lib-cloudmanager')
const jwt = require('jsonwebtoken')
const { REQUIRED } = require('./constants')

const CONTEXT = 'aio-cloudmanager-github-actions'
const JWT_SCOPE = 'ent_cloudmgr_sdk'
const OAUTH_SCOPES = ['openid', 'AdobeID', 'read_organizations', 'additional_info.projectedProductContext', 'read_pc.dma_aem_ams']

async function initSdk (imsOrgId) {
  let apiKey
  let accessToken
  // try cli context first
  const contextData = await context.get(CLI)
  if (contextData && contextData.data) {
    core.info('using access token from CLI authentication context')
    accessToken = await getToken(CLI)
    // no need here to validate the token
    const decodedToken = jwt.decode(accessToken)
    if (!decodedToken) {
      throw new Error('Cannot decode token read from CLI authentication context')
    }
    apiKey = decodedToken.client_id
    if (!apiKey) {
      throw new Error('The decoded token from the CLI authentication context did not have a client_id')
    }
  } else {
    core.info('creating access token using provided configuration')

    const oauthEnabled = core.getInput('oauthEnabled', REQUIRED) === 'true'

    apiKey = core.getInput('clientId', REQUIRED)

    const clientSecret = core.getInput('clientSecret', REQUIRED)

    const techAccId = core.getInput('technicalAccountId', REQUIRED)

    const imsConfig = {
      client_id: apiKey,
      technical_account_id: techAccId,
      ims_org_id: imsOrgId,
    }

    if (!oauthEnabled) {
      const key = core.getInput('key', REQUIRED)

      imsConfig.client_secret = clientSecret
      imsConfig.private_key = key.toString()
      imsConfig.meta_scopes = [JWT_SCOPE]
    } else {
      const techAccEmail = core.getInput('technicalAccountEmail', REQUIRED)

      imsConfig.client_secrets = [clientSecret]
      imsConfig.technical_account_email = techAccEmail
      imsConfig.scopes = OAUTH_SCOPES
    }

    await context.set(CONTEXT, imsConfig, true)
    accessToken = await getToken(CONTEXT)
  }

  return await init(imsOrgId, apiKey, accessToken)
}

module.exports = {
  initSdk,
}
