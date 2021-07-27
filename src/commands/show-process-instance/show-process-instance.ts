import chalk from 'chalk';
import moment from 'moment';

import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { loadAtlasSession } from '../../session/atlas_session';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../pc';
import { BpmnDocument } from '../../cli/bpmn_document';
import { sortProcessInstances } from '../list-process-instances/sorting';
import { logError, logJsonResult } from '../../cli/logging';
import { ApiClient, ProcessInstance, ProcessInstanceWithFlowNodeInstances } from '../../client/api_client';

export async function showProcessInstance(
  processInstanceOrCorrelationIds: string[],
  isCorrelation: boolean,
  showAllFields: boolean,
  outputFormat: string
): Promise<void> {
  const session = loadAtlasSession();
  if (session == null) {
    logError('No session found. Aborting.');
    return;
  }

  const apiClient = new ApiClient(session);

  let rawProcessInstances: ProcessInstance[] = [];
  if (isCorrelation) {
    rawProcessInstances = await apiClient.getAllProcessInstancesViaCorrelations(processInstanceOrCorrelationIds);
  } else {
    if (processInstanceOrCorrelationIds.length === 0) {
      const latestProcessInstance = await apiClient.getLatestProcessInstance();
      rawProcessInstances = [latestProcessInstance];
    } else {
      rawProcessInstances = await apiClient.getAllProcessInstancesViaIds(processInstanceOrCorrelationIds);
    }
  }

  const sortedProcssInstances = sortProcessInstances(rawProcessInstances, null, null, 'asc');
  const processInstancesWithTokens = await apiClient.addFlowNodeInstancesToProcessInstances(sortedProcssInstances);

  let resultProcessInstances: any[];
  if (showAllFields) {
    resultProcessInstances = mapToLong(processInstancesWithTokens);
  } else {
    resultProcessInstances = mapToShort(processInstancesWithTokens);
  }

  let resultJson = createResultJson('process-instances', resultProcessInstances);
  resultJson = addJsonPipingHintToResultJson(resultJson);

  switch (outputFormat) {
    case OUTPUT_FORMAT_JSON:
      logJsonResult(resultJson);
      break;
    case OUTPUT_FORMAT_TEXT:
      const multipleInstances = processInstancesWithTokens.length > 1;

      let index = 0;
      for (const processInstance of processInstancesWithTokens) {
        const showSeparator = multipleInstances && index > 0;
        await logProcessInstanceAsText(processInstance, showSeparator);
        index++;
      }

      break;
  }
}

async function logProcessInstanceAsText(
  processInstance: ProcessInstanceWithFlowNodeInstances,
  showSeparator: boolean = false
) {
  if (showSeparator) {
    console.log(chalk.cyan('---------------------------------- >8 ---------------------------------------------'));
  }
  console.log('');

  const parentHint =
    processInstance.parentProcessInstanceId == null ? 'no parent' : `parent ${processInstance.parentProcessInstanceId}`;

  console.log(
    'Model:     ',
    chalk.cyan(processInstance.processModelId),
    chalk.dim(`(Definition: ${processInstance.processDefinitionId})`)
  );
  console.log(
    'Instance:  ',
    chalk.magentaBright(`${processInstance.processInstanceId}`),
    chalk.dim(`(Correlation: ${processInstance.correlationId}, ${parentHint})`)
  );

  const createdAt = moment(processInstance.createdAt);
  const doneAt = getDoneAt(processInstance);
  const doneAtFormatted = doneAt == null ? '' : doneAt.format('YYYY-MM-DD hh:mm:ss');
  const durationInWords = doneAt == null ? '' : doneAt.from(processInstance.createdAt).replace('in ', 'took ');
  const durationHint = `(${durationInWords})`;

  console.log(
    'Created:   ',
    createdAt.format('YYYY-MM-DD hh:mm:ss'),
    chalk.dim(`(${moment(processInstance.createdAt).fromNow()})`)
  );
  console.log('Finished:  ', doneAtFormatted, chalk.dim(durationHint));
  console.log('User:      ', processInstance.ownerId);
  console.log('State:     ', stateToColoredString(processInstance.state));

  await logHistory(processInstance);

  logErrorIfAny(processInstance);
  console.log('');
}

async function logHistory(processInstance: ProcessInstanceWithFlowNodeInstances): Promise<void> {
  const flowNodeIds = getFlowNodeIdsInChronologicalOrder(processInstance);
  const firstToken = findToken(processInstance, flowNodeIds[0], 'onEnter');
  const lastTokenOnExit = findToken(processInstance, flowNodeIds[flowNodeIds.length - 1], 'onExit');
  const lastTokenOnEnter = findToken(processInstance, flowNodeIds[flowNodeIds.length - 1], 'onEnter');

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
    const suffix =
      index === lastIndex && processInstance.state === 'error' ? chalk.redBright(' [error, see below]') : '';
    console.log(`${prefix}"${name}" ${idHint}${suffix}`);
  });

  if (firstToken != null) {
    console.log('');
    console.log(
      'Input',
      chalk.cyanBright(`"${bpmnDocument.getElementNameById(firstToken.flowNodeId)}"`),
      chalk.dim(`(${firstToken.flowNodeId})`)
    );
    console.log('');
    printMultiLineString(JSON.stringify(firstToken.payload, null, 2), '    ');
  }

  if (processInstance.error != null) {
    console.log('');
    console.log(
      'Input',
      chalk.cyanBright(`"${bpmnDocument.getElementNameById(lastTokenOnEnter.flowNodeId)}"`),
      chalk.dim(`(${lastTokenOnEnter.flowNodeId})`)
    );
    console.log('');
    printMultiLineString(JSON.stringify(lastTokenOnEnter.payload, null, 2), '    ');
  }

  if (lastTokenOnExit != null) {
    console.log('');
    console.log(
      'Output',
      chalk.cyanBright(`"${bpmnDocument.getElementNameById(lastTokenOnExit.flowNodeId)}"`),
      chalk.dim(`(${lastTokenOnExit.flowNodeId})`)
    );
    console.log('');
    printMultiLineString(JSON.stringify(lastTokenOnExit.payload, null, 2), '    ');
  }
}

function getFlowNodeIdsInChronologicalOrder(processInstance: ProcessInstanceWithFlowNodeInstances): string[] {
  return processInstance.flowNodeInstances.reverse().map((x) => x.flowNodeId);
}

function logErrorIfAny(processInstance: ProcessInstanceWithFlowNodeInstances): void {
  if (processInstance.state === 'error') {
    // it seems error contains more info than is mentioned in the types
    const error = processInstance.error as any;
    console.log('');
    console.log('--- ERROR ----------------------------------------------------------------------');
    console.log('');
    console.log('Code:', error.code);
    console.log('Name:', error.name);
    console.log('');
    console.log(error.additionalInformation || 'No additional information.');
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

function findToken(
  processInstance: ProcessInstanceWithFlowNodeInstances,
  flowNodeId: string,
  tokenEventType: string
): any | null {
  const token = processInstance.flowNodeInstances[flowNodeId];
  if (token == null) {
    return null;
  }
  const tokenHistoryEntries = token.tokenHistoryEntries;

  return tokenHistoryEntries.find((entry) => entry.tokenEventType === tokenEventType);
}

function printMultiLineString(text: string | string[], linePrefix: string = ''): void {
  const lines = Array.isArray(text) ? text : text.split('\n');
  lines.forEach((line: string): void => console.log(`${linePrefix}${line}`));
}

function getDoneAt(processInstance: ProcessInstanceWithFlowNodeInstances): moment.Moment | null {
  return moment(processInstance.finishedAt);
}

function mapToLong(list: any): any[] {
  return list;
}

function mapToShort(list: any): any[] {
  return list.map((processInstance: any) => {
    const identity = { ...processInstance.identity, token: '...' };

    return { ...processInstance, xml: '...', identity: identity };
  });
}
