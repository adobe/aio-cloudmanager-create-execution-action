<!--
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

[![Build Status](https://github.com/adobe/aio-cloudmanager-create-execution-action/workflows/Release/badge.svg?branch=main)](https://github.com/adobe/aio-cloudmanager-create-execution-action/actions?query=workflow%3A%22Release%22)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-cloudmanager-start-execution-action/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-cloudmanager-start-execution-action/)

# aio-cloudmanager-create-execution-action

GitHub action that starts a Cloud Manager pipeline execution

## Authentication

To use this action, you must create aan integration must be created in the [Adobe I/O Developer Console](https://console.adobe.io) which has the Cloud Manager service. See the [Cloud Manager API Documentation](https://www.adobe.io/experience-cloud/cloud-manager/guides/getting-started/create-api-integration/) for more information.

## Configuration

This action can be configured two different ways -- either in combination with [aio-apps-action](https://github.com/adobe/aio-apps-action) or standalone. The former would be appropriate if your workflow involved _other_ Adobe I/O integrations since the same access token could be used for multiple actions.

### Standalone usage

* `CLIENTID` - Client ID for the project in the I/O Developer Console
* `CLIENTSECRET` - Client Secret for the project in the I/O Developer Console
* `TECHNICALACCOUNTID` - Technical Account Email for the project in the I/O Developer Console
* `IMSORGID` - IMS Organization ID for the project in the I/O Developer Console
* `KEY` - Private key for the project in the I/O Developer Console
* `PROGRAMID` - Cloud Manager Program ID
* `PIPELINEID` - Cloud Manager Pipeline ID

```
- name: Create Execution
  uses: adobe/aio-cloudmanager-create-execution-action
  with:
    CLIENTID: ${{ secrets.CM_CLIENT_ID }}
    CLIENTSECRET: ${{ secrets.CM_CLIENT_SECRET }}
    TECHNICALACCOUNTID: ${{ secrets.CM_TA_EMAIL }}
    IMSORGID: ${{ secrets.CM_ORG_ID }}
    KEY: ${{ secrets.CM_PRIVATE_KEY }}
    PIPELINEID: ${{ secrets.CM_PIPELINE_ID }}
    PROGRAMID: ${{ secrets.CM_PROGRAM_ID }}
```

### Usage with aio-apps-action

1. Add a step which uses `adobe/aio-apps-action` providing these required inputs:

* `command` - set to `auth`
* `CLIENTID` - Client ID for the project in the I/O Developer Console
* `CLIENTSECRET` - Client Secret for the project in the I/O Developer Console
* `TECHNICALACCOUNTID` - Technical Account Email for the project in the I/O Developer Console
* `IMSORGID` - IMS Organization ID for the project in the I/O Developer Console
* `SCOPES` - set to `ent_cloudmgr_sdk` **at minimum**
* `KEY` - Private key for the project in the I/O Developer Console

For example:

```
- name: Auth
  uses: adobe/aio-apps-action@2.0.1
  with:
    command: auth
    CLIENTID: ${{ secrets.CM_CLIENT_ID }}
    CLIENTSECRET: ${{ secrets.CM_CLIENT_SECRET }}
    TECHNICALACCOUNTID: ${{ secrets.CM_TA_EMAIL }}
    IMSORGID: ${{ secrets.CM_ORG_ID }}
    SCOPES: 'ent_cloudmgr_sdk'
    KEY: ${{ secrets.CM_PRIVATE_KEY }}
```

2. Add a step which uses this action providing these required inputs:

* `PROGRAMID` - Cloud Manager Program ID
* `PIPELINEID` - Cloud Manager Pipeline ID
* `IMSORGID` - IMS Organization ID for the project in the I/O Developer Console

For example:

```
- name: Create Execution
  uses: adobe/aio-cloudmanager-create-execution-action
  with:
    PIPELINEID: ${{ secrets.CM_PIPELINE_ID }}
    PROGRAMID: ${{ secrets.CM_PROGRAM_ID }}
    IMSORGID: ${{ secrets.CM_ORG_ID }}
```

## Output

This action creates two outputs which can be referenced in later steps:

* `executionId` - the ID of the created execution
* `executionHref` - the URL of the created execution

## Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

