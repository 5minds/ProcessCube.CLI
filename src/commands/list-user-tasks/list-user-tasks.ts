import { DataModels as AtlasEngineDataModels, } from '@atlas-engine/atlas_engine_client';

import { ApiClient } from '../../client/api_client';
import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { sortProcessInstances } from '../list-process-instances/sorting';
 
export type FlowNodeInstance = AtlasEngineDataModels.FlowNodeInstances.FlowNodeInstance;
export type UserTask = AtlasEngineDataModels.FlowNodeInstances.UserTask;
 
export async function listUserTasks(
 pipedProcessInstanceIds: string[] | null,
 pipedProcessModelIds: string[] | null,
 processModelId: string[],
 filterByProcessModelId: string[],
 rejectByProcessModelId: string[],
 filterByState: string[],
 rejectByState: string[],
 sortByProcessModelId: string,
 sortByState: string,
 sortByCreatedAt: string,
 limit: number,
 showAllFields: boolean,
 outputFormat: string
) {
 const session = loadAtlasSession();
 if (session == null) {
   logNoValidSessionError();
   return;
 }
 
 const flowNodeInstances = await getUserTasks(
   session,
   pipedProcessInstanceIds,
   pipedProcessModelIds,
   processModelId,
   filterByProcessModelId,
   rejectByProcessModelId,
   filterByState,
   rejectByState,
   sortByProcessModelId,
   sortByState,
   sortByCreatedAt,
   limit
 );
 
 let resultProcessInstances: any[];
 if (showAllFields) {
   resultProcessInstances = mapToLong(flowNodeInstances);
 } else {
   resultProcessInstances = mapToShort(flowNodeInstances);
 }
 
 let resultJson = createResultJson('user-tasks', resultProcessInstances);
 resultJson = addJsonPipingHintToResultJson(resultJson);
 
 if (outputFormat === OUTPUT_FORMAT_JSON) {
   logJsonResult(resultJson);
 } else if (outputFormat === OUTPUT_FORMAT_TEXT) {
   console.table(flowNodeInstances, [
       'createdAt',
       'finishedAt',
       'processModelId',
       'processInstanceId',
       'state',
       'correlationId'
     ]);
   }
}
 
async function getUserTasks(
   session: AtlasSession,
   pipedProcessInstanceIds: string[] | null,
   pipedProcessModelIds: string[] | null,
   processModelId: string[],
   filterByProcessModelId: string[],
   rejectByProcessModelId: string[],
   filterByState: string[],
   rejectByState: string[],
   sortByProcessModelId: string,
   sortByState: string,
   sortByCreatedAt: string,
   limit: number
): Promise<FlowNodeInstance[]> {
   const apiClient = new ApiClient(session);
 
   let allUserTasks = await apiClient.getAllUserTasks(
       processModelId,
       filterByProcessModelId,
       rejectByProcessModelId,
       filterByState,
       rejectByState
   );
 
 if (pipedProcessInstanceIds != null) {
     allUserTasks = allUserTasks.filter((processInstance: any) =>
     pipedProcessInstanceIds.includes(processInstance.processInstanceId)
   );
 }
 
 if (pipedProcessModelIds != null) {
     allUserTasks = allUserTasks.filter((processInstance: any) =>
     pipedProcessModelIds.includes(processInstance.processModelId)
   );
 }
 
 allUserTasks = sortProcessInstances(allUserTasks, sortByProcessModelId, sortByState, sortByCreatedAt);
 
 const flowNodeInstances = allUserTasks;
 
 if (limit != null && limit > 0) {
   return flowNodeInstances.slice(0, limit);
 }
 
 return flowNodeInstances;
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
