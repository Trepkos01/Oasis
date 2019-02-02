import { UUID } from 'angular2-uuid';

export class Bucket  {  id: string;
                        label: string;
                        type: string;
                        method: string;
                        contribution: number;
                        investmentMin: number;
                        investmentReturnLower: number;
                        investmentReturnUpper: number;
                        monthInvestmentReturn: number;
                        investmentReturnPercentage: number;
                        annualContributionLimit: number;
                        annualContributionTotal: number;
                        expenseType: string;
                        debtBalance: number;
                        debtInterestRate: number;
                        returnsTotal: number;
                        monthTotal: number;
                        annualTotal: number;
                        total: number;

                        constructor(label: string,
                                    type: string,
                                    method: string,
                                    contribution: number,
                                    investmentMin: number,
                                    investmentReturnLower: number,
                                    investmentReturnUpper: number,
                                    annualContributionLimit:number,
                                    expenseType: string,
                                    debtBalance: number,
                                    debtInterestRate: number
                        ){
                          this.id = UUID.UUID();
                          this.label = label;
                          this.type = type;
                          this.method  = method;
                          this.contribution = contribution;
                          this.investmentMin = investmentMin;
                          this.investmentReturnLower = investmentReturnLower;
                          this.investmentReturnUpper = investmentReturnUpper;
                          this.annualContributionLimit = annualContributionLimit;
                          this.annualContributionTotal = 0;
                          this.expenseType = expenseType;
                          this.debtBalance = debtBalance;
                          this.debtInterestRate = debtInterestRate;
                          this.monthInvestmentReturn = 0;
                          this.investmentReturnPercentage = 0;
                          this.returnsTotal = 0;
                          this.monthTotal = 0;
                          this.annualTotal = 0;
                          this.total = 0;
                        }
                      }