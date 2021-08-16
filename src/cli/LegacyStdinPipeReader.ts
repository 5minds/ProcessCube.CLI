import { Stdin } from '../cli';

export class LegacyStdinPipeReader {
  private pipedJson: any | null;

  private constructor(json: any | null) {
    this.pipedJson = json;
  }

  static async create(stdin: Stdin): Promise<LegacyStdinPipeReader> {
    const json = await stdin.getJson();
    const stdinPipeReader = new LegacyStdinPipeReader(json);

    return stdinPipeReader;
  }

  getPipedProcessInstanceIds(): string[] | null {
    if (this.pipedJson?.result_type === 'process-instances') {
      const pipedProcessInstances = this.pipedJson.result.map((item: any) => item.processInstanceId);

      return pipedProcessInstances;
    }

    return null;
  }

  getPipedProcessModelIds(): string[] | null {
    if (this.pipedJson?.result_type === 'process-models') {
      const pipedProcessModelIds = this.pipedJson.result.map((item: any) => item.id);

      return pipedProcessModelIds;
    }

    return null;
  }

  getPipedFlowNodeInstanceIds(): string[] | null {
    if (this.pipedJson?.result_type === 'user-tasks') {
      const pipedFlowNodeInstanceIds = this.pipedJson.result.map((item: any) => item.flowNodeInstanceId);

      return pipedFlowNodeInstanceIds;
    }

    return null;
  }

  getPipedProcessModelIdsInDeployedFiles(): string[] | null {
    if (this.pipedJson?.result_type === 'deployed-files') {
      const pipedProcessModelIds = this.pipedJson.result.map((item: any) => item.processModelId);

      return pipedProcessModelIds;
    }

    return null;
  }

  getPipedProcessModelIdsInProcessInstances(): string[] | null {
    if (this.pipedJson?.result_type === 'process-instances') {
      const pipedProcessModelIds = this.pipedJson.result.map((item: any) => item.processModelId);

      return pipedProcessModelIds;
    }

    return null;
  }
}
