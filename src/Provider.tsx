import * as React from 'react';
import Registry from './Registry';
import Controller from './Controller';
import Model from './Model';

export const { Consumer, Provider } = React.createContext<Context | undefined>(undefined);

interface Context {
  model: Model;
  controller: Controller;
  registry: Registry;
}

class DragDropProvider extends React.PureComponent<{}, Context> {
  constructor(props: {}) {
    super(props);

    const model = new Model();
    const controller = new Controller(model);
    const registry = new Registry(model, controller);
    model.setRegistry(registry);

    this.state = {
      model,
      controller,
      registry,
    };
  }

  render() {
    return (
      <Provider value={this.state}>
        {this.props.children}
      </Provider>
    )
  }
}

export default DragDropProvider;
