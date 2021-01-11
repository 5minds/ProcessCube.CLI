import { DataModels as AtlasEngineDataModels, } from '@atlas-engine/atlas_engine_client';

import { ApiClient } from '../../client/api_client';
import { AtlasSession, loadAtlasSession } from '../../session/atlas_session';
import { addJsonPipingHintToResultJson, createResultJson } from '../../cli/result_json';
import { logJsonResult, logNoValidSessionError } from '../../cli/logging';
import { OUTPUT_FORMAT_JSON, OUTPUT_FORMAT_TEXT } from '../../atlas';
import { sortUserTasks } from '../list-process-instances/sorting';
 
export type FlowNodeInstance = AtlasEngineDataModels.FlowNodeInstances.FlowNodeInstance;
export type UserTask = AtlasEngineDataModels.FlowNodeInstances.UserTask;
 
export async function listUserTasks(
 pipedProcessInstanceIds: string[] | null,
 pipedProcessModelIds: string[] | null,
 filterByCorrelationId: string[],
 filterByProcessModelId: string[],
 rejectByProcessModelId: string[],
 filterByState: string[],
 rejectByState: string[],
 sortByProcessModelId: string,
 sortByState: string,
 limit: number,
 showAllFields: boolean,
 outputFormat: string
) {
 const session = loadAtlasSession();
 if (session == null) {
   logNoValidSessionError();
   return;
 }
 
 const userTasks = await getUserTasks(
   session,
   pipedProcessInstanceIds,
   pipedProcessModelIds,
   filterByCorrelationId,
   filterByProcessModelId,
   rejectByProcessModelId,
   filterByState,
   rejectByState,
   sortByProcessModelId,
   sortByState,
   limit
 );
 
 let resultUserTasks: any[];
 if (showAllFields) {
   resultUserTasks = mapToLong(userTasks);
 } else {
   resultUserTasks = mapToShort(userTasks);
 }
 
 let resultJson = createResultJson('user-tasks', resultUserTasks);
 resultJson = addJsonPipingHintToResultJson(resultJson);
 
 if (outputFormat === OUTPUT_FORMAT_JSON) {
   logJsonResult(resultJson);
 } else if (outputFormat === OUTPUT_FORMAT_TEXT) {
   console.table(userTasks, [
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
   filterByCorrelationId: string[],
   filterByProcessModelId: string[],
   rejectByProcessModelId: string[],
   filterByState: string[],
   rejectByState: string[],
   sortByProcessModelId: string,
   sortByState: string,
   limit: number
): Promise<UserTask[]> {
   const apiClient = new ApiClient(session);
 
   let allUserTasks = await apiClient.getAllUserTasks(
    filterByCorrelationId,
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
 allUserTasks = sortUserTasks(allUserTasks, sortByProcessModelId, sortByState);
 
 const userTasks = allUserTasks;
 
 if (limit != null && limit > 0) {
   return userTasks.slice(0, limit);
 }
 
 return userTasks;
}
 
function mapToLong(list: any): any[] {
 return list;
}
 
function mapToShort(list: any): any[] {
 return list.map((userTask: any) => {
   const identity = { ...userTask.identity, token: '...' };
 
   return { ...userTask, xml: '...', identity: identity };
 });
}
