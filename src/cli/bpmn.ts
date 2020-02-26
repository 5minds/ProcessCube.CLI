import * as BpmnModdle from 'bpmn-moddle';

export async function getProcessModelIdFromBpmn(xml: string): Promise<string | null> {
  const definitions = await getDefinitionsFromBpmn(xml);
  const rootElements: Array<any> = definitions.rootElements;
  const processModel: any = rootElements.find((definition: any) => {
    return definition.$type === 'bpmn:Process';
  });

  return processModel?.id;
}

export async function getElementNameByIdFromBpmn(xml: string, id: string): Promise<string | null> {
  const flowElement = await getElementByIdFromBpmn(xml, id);

  return flowElement?.name;
}

async function getDefinitionsFromBpmn(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const moddle = new BpmnModdle();
    moddle.fromXML(xml, function(err, definitions) {
      if (err) {
        reject(err);
      }

      resolve(definitions);
    });
  });
}

async function getElementByIdFromBpmn(xml: string, id: string): Promise<any | null> {
  const definitions = await getDefinitionsFromBpmn(xml);
  const rootElements: Array<any> = definitions.rootElements;
  const processModel: any = rootElements.find((definition: any) => {
    return definition.$type === 'bpmn:Process';
  });

  // TODO: are there any other places through which we would have to iterate?
  return processModel.flowElements.find((flowElement) => flowElement.id === id);
}
