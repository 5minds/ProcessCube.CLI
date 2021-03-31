import * as assert from 'assert';
import { execAsJson, execAsText } from './exec_as';
 
describe('atlas', () => {
 it('should work with JSON output', async () => {
   execAsText('login http://localhost:8000 --root');
 
   execAsJson('session-status');

   execAsJson('deploy-files fixtures/finalTokenTest.bpmn');

   const result = execAsJson('start-process-model finalTokenTest StartEvent_1mox3jl --wait');


   const correlationId = result?.result[0]?.correlationId;
   const processInstances = execAsJson(`list-process-instances --filter-by-correlation-id ${correlationId}`);

   const currentToken = filterByCorrelationId?.result[0]?.finalToken;

   const expectedToken = '{"myTestValue":"test"}';
   assert.deepEqual(currentToken, expectedToken);

   execAsText('logout');


 });
});
