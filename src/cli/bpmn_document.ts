import * as BpmnModdle from 'bpmn-moddle';

export class BpmnDocument {
  private definitions: any;

  async loadXml(xml: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const moddle = new BpmnModdle();
      moddle.fromXML(xml, function(err, definitions) {
        if (err) {
          reject(err);
        }

        this.definitions = definitions;
        resolve();
      });
    });
  }

  getProcessModelId(): string | null {
    const rootElements: any[] = this.definitions.rootElements;
    const processModel: any = rootElements.find((definition: any) => {
      return definition.$type === 'bpmn:Process';
    });

    return processModel?.id;
  }

  getElementNameById(id: string): string | null {
    const flowElement = this.getElementById(id);

    return flowElement?.name;
  }

  private getElementById(id: string): any | null {
    const rootElements: any[] = this.definitions.rootElements;
    const processModel: any = rootElements.find((definition: any) => {
      return definition.$type === 'bpmn:Process';
    });

    // TODO: are there any other places through which we would have to iterate?
    return processModel.flowElements.find((flowElement) => flowElement.id === id);
  }
}
