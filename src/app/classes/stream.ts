export class Stream { public label: string;
    public lowerLimit: number;
    public upperLimit: number;
    public monthTotal: number;
    public annualTotal: number;
    public total: number;

    constructor(label: string, lowerLimit: number, upperLimit: number) {
                        this.label = label;
                        this.lowerLimit = lowerLimit;
                        this.upperLimit = upperLimit;
                        this.monthTotal = 0;
                        this.annualTotal = 0;
                        this.total = 0;
    }
  }
