interface Module {
    id: number;
    name: string;
    description: string;
    position: number | null;
    state: boolean;
    selected: boolean;
    [key: string]: any; 
  }
  