import chalk from 'chalk';
import * as moment from 'moment';

import { DataModels } from '@process-engine/management_api_contracts';

import { createResultJson } from '../../cli/result_json';
import { getIdentityAndManagementApiClient } from '../../client/management_api_client';
import { loadAtlasSession, AtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { BpmnDocument } from '../../cli/bpmn_document';
import { sortProcessInstances } from '../list-process-instances/sorting';
import { logError } from '../../cli/logging';

type ProcessInstance = DataModels.Correlations.ProcessInstance;
type ProcessInstanceWithTokens = ProcessInstance & {
  tokens: DataModels.TokenHistory.TokenHistoryGroup;
};

export async function showProcessInstance(
  processInstanceOrCorrelationIds: string[],
  isCorrelation: boolean,
  format: string
): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  let rawProcessInstances: ProcessInstance[] = [];
  if (isCorrelation) {
    rawProcessInstances = await getAllProcessInstancesViaCorrelations(session, processInstanceOrCorrelationIds);
  } else {
    rawProcessInstances = await getAllProcessInstancesViaIds(session, processInstanceOrCorrelationIds);
  }

  const sortedProcssInstances = sortProcessInstances(rawProcessInstances, null, null, 'asc');

  const processInstancesWithTokens = await getProcessInstanceWithTokens(session, sortedProcssInstances);

  const resultJson = createResultJson('process-instances', processInstancesWithTokens);

  switch (format) {
    case OUTPUT_FORMAT_JSON:
      console.dir(resultJson, { depth: null });
      break;
    case OUTPUT_FORMAT_TEXT:
      const multipleInstances = processInstancesWithTokens.length > 1;

      let index = 0;
      for (const processInstance of processInstancesWithTokens) {
        const showSeparator = multipleInstances && index > 0;
        await log(processInstance, showSeparator);
        index++;
      }

      // console.table(processInstances, ['createdAt', 'finishedAt', 'processModelId', 'processInstanceId', 'state']);
      break;
  }
}

async function getProcessInstanceWithTokens(
  session: AtlasSession,
  rawProcessInstances: ProcessInstance[]
): Promise<ProcessInstanceWithTokens[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  const processInstancesWithTokens: ProcessInstanceWithTokens[] = [];
  for (const rawProcessInstance of rawProcessInstances) {
    const tokens = await managementApiClient.getTokensForProcessInstance(
      identity,
      rawProcessInstance.processInstanceId
    );
    const processInstance = { ...rawProcessInstance, tokens };

    processInstancesWithTokens.push(processInstance);
  }

  return processInstancesWithTokens;
}

async function getAllProcessInstancesViaCorrelations(
  session: AtlasSession,
  correlationIds: string[]
): Promise<ProcessInstance[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  let allProcessInstances = [];
  for (const correlationId of correlationIds) {
    const result = await managementApiClient.getProcessInstancesForCorrelation(identity, correlationId);
    allProcessInstances = allProcessInstances.concat(result.processInstances);
  }

  return allProcessInstances;
}

async function getAllProcessInstancesViaIds(
  session: AtlasSession,
  processInstanceIds: string[]
): Promise<ProcessInstance[]> {
  const { identity, managementApiClient } = getIdentityAndManagementApiClient(session);

  let allProcessInstances = [];
  for (const processInstanceId of processInstanceIds) {
    const rawProcessInstance = await managementApiClient.getProcessInstanceById(identity, processInstanceId);
    allProcessInstances.push(rawProcessInstance);
  }

  return allProcessInstances;
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
