import * as React from 'react';

import Manager from './Manager';

export declare interface Context {
  manager: Manager;
}

const { Consumer, Provider } = React.createContext<Context>(null);

export { Consumer, Provider };