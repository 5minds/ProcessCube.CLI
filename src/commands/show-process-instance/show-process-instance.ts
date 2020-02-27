import chalk from 'chalk';
import * as moment from 'moment';

import { DataModels } from '@process-engine/management_api_contracts';

import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { loadAtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { BpmnDocument } from '../../cli/bpmn_document';

type ProcessInstanceWithTokens = DataModels.Correlations.ProcessInstance & {
  tokens: DataModels.TokenHistory.TokenHistoryGroup;
};

export async function showProcessInstance(processInstanceIds: string[], options: any, format: string): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    console.log(chalk.red('No session found. Aborting.'));
    return;
  }
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const processInstances: ProcessInstanceWithTokens[] = [];
  for (const processInstanceId of processInstanceIds) {
    const rawProcessInstance = await managementApiClient.getProcessInstanceById(identity, processInstanceId);
    const tokens = await managementApiClient.getTokensForProcessInstance(identity, processInstanceId);
    const processInstance = { ...rawProcessInstance, tokens };

    processInstances.push(processInstance);
  }

  const resultJson = createResultJson('process-instances', processInstances);

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.dir(resultJson, { depth: null });
      break;
    case OUTPUT_FORMAT_TEXT:
      const multipleInstances = processInstances.length > 1;
      processInstances.forEach(async (processInstance, index) => {
        const showSeparator = multipleInstances && index > 0;
        await log(processInstance, showSeparator);
      });

      // console.table(processInstances, ['createdAt', 'finishedAt', 'processModelId', 'processInstanceId', 'state']);
      break;
  }
}

async function log(processInstance: ProcessInstanceWithTokens, showSeparator: boolean = false) {
  // console.dir(processInstance, { depth: null });
  if (showSeparator) {
    console.log(chalk.cyan('---------------------------------- >8 ---------------------------------------------'));
  }
  console.log('');

  const parentHint =
    processInstance.parentProcessInstanceId == null ? 'no parent' : `parent ${processInstance.parentProcessInstanceId}`;

  console.log(
    'Model:     ',
    chalk.cyan(processInstance.processModelId),
    chalk.dim(`(Definition: ${processInstance.processDefinitionName})`)
  );
  console.log(
    'Instance:  ',
    chalk.magentaBright(`${processInstance.processInstanceId}`),
    chalk.dim(`(Correlation: ${processInstance.correlationId}, ${parentHint})`)
  );

  const createdAt = moment(processInstance.createdAt);
  const doneAt = getDoneAt(processInstance);
  const durationInWords = doneAt.from(processInstance.createdAt).replace('in ', 'took ');
  const durationHint = `(${durationInWords})`;

  console.log(
    'Created:   ',
    createdAt.format('YYYY-MM-DD hh:mm:ss'),
    chalk.dim(`(${moment(processInstance.createdAt).fromNow()})`)
  );
  console.log('Finished:  ', doneAt.format('YYYY-MM-DD hh:mm:ss'), chalk.dim(durationHint));
  console.log('User:      ', processInstance.identity.userId);
  console.log('State:     ', stateToColoredString(processInstance.state));
  await logHistory(processInstance);
  logErrorIfAny(processInstance);
  console.log('');
}

async function logHistory(processInstance: ProcessInstanceWithTokens): Promise<void> {
  const flowNodeIds = Object.keys(processInstance.tokens).reverse();
  const firstToken = getToken(processInstance, flowNodeIds[0], 'onEnter');
  const lastTokenOnExit = getToken(processInstance, flowNodeIds[flowNodeIds.length - 1], 'onExit');
  const lastTokenOnEnter = getToken(processInstance, flowNodeIds[flowNodeIds.length - 1], 'onEnter');

  console.log('');
  console.log('--- HISTORY -----------------------------------------------------------------------');
  console.log('');
  console.log('Token history');
  console.log('');

  const bpmnDocument = new BpmnDocument();
  await bpmnDocument.loadXml(processInstance.xml);

  const lastIndex = flowNodeIds.length - 1;
  flowNodeIds.forEach(async (flowNodeId: string, index: number) => {
    const prefix = index === 0 ? '    ' : '    -> ';
    const name = bpmnDocument.getElementNameById(flowNodeId);
    const idHint = chalk.dim(`(${flowNodeId})`);
    const suffix = index === lastIndex && processInstance.error != null ? chalk.redBright(' [error, see below]') : '';
    console.log(`${prefix}"${name}" ${idHint}${suffix}`);
  });

  console.log('');
  console.log(
    'Input',
    chalk.cyanBright(`"${bpmnDocument.getElementNameById(firstToken.flowNodeId)}"`),
    chalk.dim(`(${firstToken.flowNodeId})`)
  );
  console.log('');
  printMultiLineString(JSON.stringify(firstToken.payload, null, 2), '    ');
  console.log('');

  if (processInstance.error != null) {
    console.log(
      'Input',
      chalk.cyanBright(`"${bpmnDocument.getElementNameById(lastTokenOnEnter.flowNodeId)}"`),
      chalk.dim(`(${lastTokenOnEnter.flowNodeId})`)
    );
    console.log('');
    printMultiLineString(JSON.stringify(lastTokenOnEnter.payload, null, 2), '    ');
    console.log('');
  }

  console.log(
    'Output',
    chalk.cyanBright(`"${bpmnDocument.getElementNameById(lastTokenOnExit.flowNodeId)}"`),
    chalk.dim(`(${lastTokenOnExit.flowNodeId})`)
  );
  console.log('');
  printMultiLineString(JSON.stringify(lastTokenOnExit.payload, null, 2), '    ');
}

function logErrorIfAny(processInstance: ProcessInstanceWithTokens): void {
  if (processInstance.error != null) {
    // it seems error contains more info than is mentioned in the types
    const error = processInstance.error as any;
    console.log('');
    console.log('--- ERROR ----------------------------------------------------------------------');
    console.log('');
    console.log('Code:', error.code);
    console.log('Name:', error.name);
    console.log('');
    console.log(error.additionalInformation);
    console.log('');
  }
}

function stateToColoredString(state: string): string {
  switch (state) {
    case 'error':
      return chalk.redBright(state);
    case 'finished':
      return chalk.bold(chalk.greenBright(state));
    case 'running':
      return chalk.green(state);
    default:
      return state;
  }
}

function getToken(processInstance: ProcessInstanceWithTokens, flowNodeId: string, tokenEventType: string): any | null {
  const tokenHistoryEntries = processInstance.tokens[flowNodeId].tokenHistoryEntries;

  return tokenHistoryEntries.find((entry) => entry.tokenEventType === tokenEventType);
}

function printMultiLineString(text: string | string[], linePrefix: string = ''): void {
  const lines = Array.isArray(text) ? text : text.split('\n');
  lines.forEach((line: string): void => console.log(`${linePrefix}${line}`));
}

function getDoneAt(processInstance: ProcessInstanceWithTokens): moment.Moment {
  const flowNodeIds = Object.keys(processInstance.tokens).reverse();

  const lastTokenOnExit =
    getToken(processInstance, flowNodeIds[flowNodeIds.length - 1], 'onExit') ||
    getToken(processInstance, flowNodeIds[flowNodeIds.length - 1], 'onEnter');

  return moment(lastTokenOnExit.createdAt);
}
