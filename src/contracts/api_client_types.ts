export type DeployedProcessModelInfo = DeployedProcessModelInfo_Success | DeployedProcessModelInfo_Failure;

type DeployedProcessModelInfo_Success = {
  success: true;

  filename: string;
  processModelId: string;
};

type DeployedProcessModelInfo_Failure = {
  success: false;

  filename: string;
  processModelId: string;

  error: Error;
};

//

export type RemovedProcessModelInfo = RemovedProcessModelInfo_Success | RemovedProcessModelInfo_Failure;

type RemovedProcessModelInfo_Success = {
  success: true;

  processModelId: string;
};

type RemovedProcessModelInfo_Failure = {
  success: false;

  processModelId: string;

  error: Error;
};

//

export type StartedProcessModelInfo = StartedProcessModelInfo_Success | StartedProcessModelInfo_Failure;

type StartedProcessModelInfo_Success = {
  success: true;

  processModelId: string;
  startEventId: string;

  processInstanceId?: string;
  correlationId: string;
  startToken: any;
  endEventId?: string;
  endToken?: any;
};

type StartedProcessModelInfo_Failure = {
  success: false;

  processModelId: string;
  startEventId: string;

  error: Error;
};

//

export type StoppedProcessInstanceInfo = StoppedProcessInstanceInfo_Success | StoppedProcessInstanceInfo_Failure;

type StoppedProcessInstanceInfo_Success = {
  success: true;

  processInstanceId: string;
};

type StoppedProcessInstanceInfo_Failure = {
  success: false;

  processInstanceId: string;

  error: Error;
};

//

export type RetriedProcessInstanceInfo = RetriedProcessInstanceInfo_Success | RetriedProcessInstanceInfo_Failure;

type RetriedProcessInstanceInfo_Success = {
  success: true;

  processInstanceId: string;
};

type RetriedProcessInstanceInfo_Failure = {
  success: false;

  processInstanceId: string;

  error: Error;
};

//

export type FinishedUserTaskInfo = FinishedUserTaskInfoSuccess | FinishedUserTaskInfoFailure;

type FinishedUserTaskInfoSuccess = {
  success: true;

  flowNodeInstanceId: string;
  resultValues: any;
  payload?: any;
};

type FinishedUserTaskInfoFailure = {
  success: false;

  flowNodeInstanceId: string;

  error: Error;
};
