import * as core from '@actions/core'
const lokalise = import('@lokalise/node-api')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const API_KEY: string = core.getInput('LOKALISE_API_KEY')
    const PROJECT_KEY: string = core.getInput('LOKALISE_PROJECT_KEY')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`API_KEY = ${API_KEY}`)
    core.debug(`PROJECT_KEY = ${PROJECT_KEY}`)

    const lokAPI = new (await lokalise).LokaliseApi({ apiKey: API_KEY })
    await lokAPI.files().download(PROJECT_KEY, {
      format: 'xlf',
      original_filenames: false,
      bundle_structure: 'frontend/src/i18n/messages.%LANG_ISO%.%FORMAT%',
      triggers: ['github']
    })
    // Set outputs for other workflow steps to use
    core.setOutput('result', "success")
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
