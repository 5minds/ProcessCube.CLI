import * as assert from 'assert';
import { execAsJson, execAsText } from './exec_as';
 
describe('atlas', () => {
 it('should work with JSON output', async () => {
   execAsText('login http://localhost:8000 --root');
 
   execAsJson('session-status');
 
   execAsJson('deploy-files fixtures/E-Mail-Adresse-Generieren.bpmn');

   execAsJson('deploy-files fixtures/FinalTokenTest.bpmn');

   const result1 = execAsJson('start-process-model E-Mail-Adresse-Generieren StartEvent_1mox3jl --input-values \'{"seconds": 1}\'');

   const result2 = execAsJson('start-process-model FinalTokenTest StartEvent_1mox3jl --input-values \'{"seconds": 1}\' --wait');

   const processInstanceIdFromResult1 = result1?.result[0]?.processInstanceId;
   console.log(JSON.stringify(processInstanceIdFromResult1));

   const token1 = processInstanceIdFromResult1?.result[0]?.token;
   console.log(JSON.stringify(token1));

   const processInstanceIdFromResult2 = result2?.result[0]?.processInstanceId;

   const token2 = processInstanceIdFromResult2?.result[0]?.myTestValue;

   assert.ok(token1 == token2, 'Expected');

   execAsText('logout');
   const session = execAsJson('session-status');
   assert.equal(session.accessToken, null);

 });
});
