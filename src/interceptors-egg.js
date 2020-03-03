const EMPTY = [];

function newMultiInterceptors(tools, processAll, name) {
  const multiInterceptors = Object.create(null);

  tools.tool(name, (type, interceptor) => {
    if (tools.isHatched)
      throw new Error(
        `illegal state exception, ${name} cannot be used once is hatched`
      );

    if (!multiInterceptors[type]) multiInterceptors[type] = [];
    multiInterceptors[type].push(interceptor);
  });

  return action => {
    const interceptors = multiInterceptors[action.type] || EMPTY;
    const { breeds } = tools;
    return processAll(interceptors, breeds, action);
  };
}

function runAll(interceptors, breeds, action) {
  for (let i = 0; i < interceptors.length; i += 1) {
    interceptors[i](breeds, action);
  }
}

function filterAll(interceptors, breeds, action) {
  let succeed = true;
  for (let i = 0; i < interceptors.length && succeed; i += 1) {
    succeed = interceptors[i](breeds, action);
  }

  return succeed;
}

export default function interceptorsEgg(tools) {
  const { addMiddleware } = tools;

  const filterAction = newMultiInterceptors(tools, filterAll, 'filterAction');
  const decorateAction = newMultiInterceptors(tools, runAll, 'decorateAction');
  const afterAction = newMultiInterceptors(tools, runAll, 'afterAction');

  addMiddleware(_ => next => action => {
    const succeed = filterAction(action);
    if (!succeed) return;

    decorateAction(action);
    next(action);
    afterAction(action);
  });
}
