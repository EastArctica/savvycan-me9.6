interface CanInterface {
  sendFrame: (
    bus: number,
    id: number,
    length: number,
    data: number[]
  ) => void;
  clearFilters: () => void;
  setFilter: (id: number, mask: number, bus: number) => void;
}

interface HostInterface {
  addParameter: (variable: string) => void;
  setTickInterval: (interval: number) => void;
  log: (log: string) => void;
}

declare var can: CanInterface;
declare var host: HostInterface;
