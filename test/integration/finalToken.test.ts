import * as assert from 'assert';
import { execAsJson, execAsText } from './exec_as';
 
describe('atlas', () => {
 it('should work with JSON output', async () => {
   execAsText('login http://localhost:8000 --root');
 
   execAsJson('session-status');

   execAsJson('deploy-files fixtures/finalTokenTest.bpmn');

   const result = execAsJson('start-process-model finalTokenTest StartEvent_1mox3jl --input-values \'{"seconds": 1}\' --wait');

   //const processInstanceId = result?.result[0]?.processInstanceId;

   const correlationId = result?.result[0]?.correlationId;
   const filterByCorrelationId = execAsJson(`list-process-instances --filter-by-correlation-id ${correlationId}`);

   const currentToken = filterByCorrelationId?.result[0]?.finalToken;

   const expectedToken = '{"myTestValue":"test"}';
   assert.ok(currentToken, expectedToken,);

   execAsText('logout');

   const session = execAsJson('session-status');
   assert.equal(session.accessToken, null);

 });
});
