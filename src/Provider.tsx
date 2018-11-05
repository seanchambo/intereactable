import * as React from 'react';

import Manager from './Manager';
import { Provider as ContextProvider } from './Context';

export declare interface ProviderState {
  manager: Manager;
}

export declare interface ProviderProps {
  children: React.ReactNode;
}

class Provider extends React.Component<ProviderProps, ProviderState> {
  state: ProviderState = {
    manager: new Manager(),
  }

  render() {
    return (
      <ContextProvider value={this.state}>
        {this.props.children}
      </ContextProvider>
    )
  }
}

export default Provider;