
export function subscribeTo(eventType, contract, callback) {
  contract.events[eventType]()
    .on("data", (event) => {
      callback(event);
    })
    .on("error", console.error);
}

