import { Injectable } from '@angular/core';

import { Bucket } from '../classes/bucket';
import { Stream } from '../classes/stream';

import * as _ from "lodash";

//Import some test data.
import { TEST_BUCKETS_GROSS, TEST_BUCKETS_TAX, TEST_BUCKETS_NET, TEST_STREAMS } from '../presets/testensemble';

//The info interface holds a collection of primitive values shared between the service
//and the main application component.
export interface Info {
   month:number;                  //The current month of progressing.
   unallocatedIncome:number;      //The unallocated income, income which hasn't gone to any buckets.
   totalStreamsMonth:number;    //The total of all income streams for the month.
   totalStreamsAnnual:number;   //The total of all income streams for the year.
   totalStreams:number;           //The total of all income streams.
   grossBucketsTotalMonth:number;   //The total of all gross buckets for the month.
   grossBucketsTotalAnnual:number;  //The total of all gross buckets for the annual.
   grossBucketsTotal:number;          //The total of all gross buckets.
   taxBucketsTotalMonth:number;     //The total of all tax buckets for the month.
   taxBucketsTotalAnnual:number;    //The total of all tax buckets for the year.
   taxBucketsTotal:number;            //The total of all tax buckets.
   netBucketsTotalMonth:number;     //The total of all net buckets for the month.
   netBucketsTotalAnnual:number;    //The total of all net buckets for the year.
   netBucketsTotal:number;            //The total of all net buckets.
   investmentReturnsTotal:number;     //The total investment returns.
   investmentReturnsTotalMonth:number;  //The total investment returns for the month.
   debtBalanaceTotalMonth:number;    //Total debt for the current month.
   grossBucketsContributionPercentage:number; //The total contribution percentage of income going to the gross buckets.
   taxBucketsContributionPercentage:number; //The total contribution percentage of taxable income going to the tax buckets.
   netBucketsContributionPercentage:number; //The total contribution of net income going to the net buckets.
}

//This is a return value from the functions which process each bucket based on type.
//This allows the bucket to report back if it didn't contribute anything percentage-wise or amount-wise.
//For example, if a limit on the bucket had been reached, it's contribution amount and percentage would be
//zero, and the next bucket would absorb this percentage. This is the importance of the order of buckets.
interface ReturnValue {
  contributionPercentage:number;
  contributionAmount:number;
}

//The service class.
@Injectable()
export class EnsembleService {
  grossBuckets: Bucket[];         //Array of buckets of type 'gross'
  taxBuckets: Bucket[];           //Array of buckets of type 'tax'
  netBuckets: Bucket[];           //Array of buckets of type 'net'
  streams: Stream[];              //Array of income streams.
  info: Info;                     //The info interface.
  history: any[];

  //Initialize the above variables to either empty arrays or all zeroes.
  constructor(){
    this.grossBuckets = TEST_BUCKETS_GROSS;
    this.taxBuckets = TEST_BUCKETS_TAX;
    this.netBuckets = TEST_BUCKETS_NET;
    this.streams = TEST_STREAMS;
    /*this.grossBuckets = new Array<Bucket>();
    this.taxBuckets = new Array<Bucket>();
    this.netBuckets = new Array<Bucket>();
    this.streams = new Array<Stream>();*/
    this.history = new Array<any>();
    this.info =  {month: 0,
                  unallocatedIncome: 0,
                  totalStreamsMonth: 0,
                  totalStreamsAnnual: 0,
                  totalStreams: 0,
                  grossBucketsTotalMonth: 0,
                  grossBucketsTotalAnnual: 0,
                  grossBucketsTotal: 0,
                  taxBucketsTotalMonth: 0,
                  taxBucketsTotalAnnual: 0,
                  taxBucketsTotal: 0,
                  netBucketsTotalMonth: 0,
                  netBucketsTotalAnnual: 0,
                  netBucketsTotal: 0,
                  investmentReturnsTotal: 0,
                  investmentReturnsTotalMonth: 0,
                  debtBalanaceTotalMonth: 0,
                  grossBucketsContributionPercentage: 0,
                  taxBucketsContributionPercentage: 0,
                  netBucketsContributionPercentage: 0};
  }

  //Return the info interface.
  getGeneralInfo():Info{
    return this.info;
  }

  //Return the maximum contribution bound based on the type of buckets we're concerned with.
  getContributionPercentageBound(type:string): number{
    let bound:number = 0;

    //Based on the type, we get the total contribution percentage of all buckets in the group.
    //For example, if all the gross buckets made up 90% of the contribution pie, then a new buckets
    //would have a bound of only 10, no higher.
    this.getBuckets(type).forEach((item,index) => {
        bound += item.contribution;
    })

    return 100-bound;
  }

  //Return the array of buckets based on the provided type argument.
  getBuckets(type:string): Bucket[]{
    switch(type){
      case "gross":
        return this.grossBuckets;
      case "net":
        return this.netBuckets;
      default:
        return this.taxBuckets;
    }
  }

  //Return the array of streams.
  getStreams(): Stream[]{
    return this.streams;
  }

  //Add a new bucket to either array based on the provided type.
  addNewBucket(newBucket: Bucket, type:string): void{
    if(type == "gross")
      this.grossBuckets.push(newBucket);
    else if(type == "net")
      this.netBuckets.push(newBucket);
    else
      this.taxBuckets.push(newBucket);
  }

  //Add a new stream to the array of stream objects.
  addNewStream(newIncomeStream: Stream): void{
    this.streams.push(newIncomeStream);
  }

  //Switch indices between two buckets based on the direction we're moving (-1 for up, and 1 for down)
  moveBucket(index:number, direction:number, type:string): void{
    let tempBucket:Bucket = this.getBuckets(type)[index+direction];
    this.getBuckets(type)[index+direction] = this.getBuckets(type)[index];
    this.getBuckets(type)[index] = tempBucket;
  }

  //Actually update the total information based on the number of months we're traversing.
  updateEnsembleInformation(months:number){
    //For each month.
    for(let i:number = 0; i < months; i++){
      //Update the month value to reflect in the main application component and reset the month total for all income streams.
  	  this.info.month++;

      //Reset all statistics.
      this.resetInfoStatistics();

      //Go through each stream, calculate the income based on the provided lower and upper lowerLimit
      //Update the month/annual/total total for each income stream and calculate the total income for the month
      //which will be used for the distributions below.
      let totalMonthIncome:number = 0;
      this.streams.forEach((item,index) => {
    		let streamIncome:number = Math.floor(Math.random()*(item.upperLimit-item.lowerLimit+1)+item.lowerLimit);

        if(this.info.month%12 == 1)
          item.annualTotal = 0;

    		item.monthTotal = streamIncome
    		item.annualTotal 	+= streamIncome;
        item.total += streamIncome;
        totalMonthIncome += streamIncome;
      });
      //Define the return value to be used in the bucket processing functions.
      let returnValue:ReturnValue;
      //Set total gross contribution, and remainder percentage to zero since we haven't
      //processed any buckets yet.
  	  let remainderContributionPercentage:number = 0;
  	  let totalGrossContribution:number = 0;
      //For each bucket of type 'gross', update its information based on the method of the bucket.
      this.grossBuckets.forEach((item, index) => {
  		  if(item.method == "save")
  		    returnValue = this.updateSaveBucket(item, totalMonthIncome, remainderContributionPercentage);
  	    else
  		    returnValue = this.updateSpendBucket(item, totalMonthIncome, remainderContributionPercentage);

        this.info.grossBucketsTotalAnnual += item.annualTotal;
        //If the bucket had met a limit and thus is inactive, then set the remainder percentage to the prior
        //bucket's percentage so that the next bucket will take up that slice of the contribution pie.
        //Also, add to the total contribution amount based on the bucket's contribution.
  	    remainderContributionPercentage = returnValue.contributionPercentage;
  		  totalGrossContribution			    += returnValue.contributionAmount;
      });
      //Once we have distributed into the gross buckets, we approach the income, etc tax buckets.
      //and distribute into those before continuing to our net buckets.
      let totalTaxContribution:number = 0;
      totalMonthIncome = totalMonthIncome - totalGrossContribution;
      this.taxBuckets.forEach((item, index) => {
        returnValue = this.updateTaxBucket(item, totalMonthIncome);
        this.info.taxBucketsTotalAnnual += item.annualTotal;
        totalTaxContribution += returnValue.contributionAmount;
      });
      //After processing all gross and tax buckets, subtract the total contribution of all tax buckets from the total income amount and repeat
      //the above with the buckets of type 'net' and the new income amount.
  	  totalMonthIncome = totalMonthIncome - totalTaxContribution;
  	  let totalNetContribution:number = 0;
  	  remainderContributionPercentage = 0;
      this.netBuckets.forEach((item, index) => {
  		  if(item.method == "save")
  		    returnValue = this.updateSaveBucket(item, totalMonthIncome, remainderContributionPercentage);
  	    else
  		    returnValue = this.updateSpendBucket(item, totalMonthIncome, remainderContributionPercentage);

        this.info.netBucketsTotalAnnual += item.annualTotal;

        remainderContributionPercentage = returnValue.contributionPercentage;
    		totalNetContribution			    += returnValue.contributionAmount;
      });

      this.calculateInfoStatistics();
      //Once we have totaled the net buckets' contribution, subtract that amount from the total income amount and you have the unallocated income amount.
  	  this.info.unallocatedIncome += totalMonthIncome - totalNetContribution;

      this.addMonthToHistory();
	  }
  }

  addMonthToHistory():void{

      let monthProgress = {
        info:this.info,
        streams:this.streams,
        grossBuckets:this.grossBuckets,
        taxBuckets:this.taxBuckets,
        netBuckets:this.netBuckets
      }
      
      this.history.push(_.cloneDeep(monthProgress));
  }

  //Update the information of the 'save' method bucket based on its characteristics and income.
  updateSaveBucket(bucket:Bucket, income:number, remainderContributionPercentage:number):ReturnValue{
    //If we're in a new year, set the annual total amount and annual contribution total back to zero.
    if(this.info.month%12 == 1){
        bucket.annualTotal = 0;
        bucket.annualContributionTotal = 0;
    }
    //Intialize the investmentReturns value and ensure that the minimum has been met before calculating the possible returns.
  	let investmentReturns:number = 0;
    if(bucket.total >= bucket.investmentMin){
      let investmentReturnPercentage:number = Math.floor(Math.random()*(bucket.investmentReturnUpper-bucket.investmentReturnLower+1)+bucket.investmentReturnLower);
      bucket.investmentReturnPercentage = investmentReturnPercentage;
      investmentReturns = bucket.total*(investmentReturnPercentage/100);
      //Update the bucket-specific characteristics.
      bucket.monthInvestmentReturn = investmentReturns;
      bucket.returnsTotal += investmentReturns;
      //Update the application-wide statistics.
      this.info.investmentReturnsTotalMonth += investmentReturns;
      this.info.investmentReturnsTotal += investmentReturns;
    }
    //Default the surrendered contribution percentage to the remainder passed in the function args and the current bucket's contribution percentage,
    //if this bucket has no contributions, this value will be returned to the calling function where the value will be added to the next bucket's
    //contribution amount.
  	let surrenderedContributionPercentage:number 	 = (remainderContributionPercentage + bucket.contribution);
  	let totalContributedIncomeAmount:number        = 0;
    //For no contributions to be made to this bucket, the bucket's annual limit (if it has one) has been met. Otherwise,
    //no percentage is surrended by this bucket (even if the calculated contributed amount exceeds the annual limit).
  	if(bucket.annualContributionTotal <= bucket.annualContributionLimit || bucket.annualContributionLimit == 0){
  	  totalContributedIncomeAmount = income*(surrenderedContributionPercentage/100);
  	  surrenderedContributionPercentage = 0;
      //If the annual contribution limit (if it has one) is met from the above, simply take the difference based on the limit value and total contribution + annual total.
  	  if(bucket.annualContributionLimit != 0)
  	    totalContributedIncomeAmount = (totalContributedIncomeAmount > (bucket.annualContributionLimit-bucket.annualTotal) ? (bucket.annualContributionLimit-bucket.annualTotal) : totalContributedIncomeAmount);
  	}
    //Update the stats of the bucket based on the results of the above calculations.
    bucket.annualContributionTotal += totalContributedIncomeAmount;
  	bucket.monthTotal	=  (totalContributedIncomeAmount + investmentReturns);
  	bucket.annualTotal  += (totalContributedIncomeAmount + investmentReturns);
  	bucket.total		+= (totalContributedIncomeAmount + investmentReturns);
    //Return the values based on the above calculations.
  	let returnValue:ReturnValue = {contributionPercentage: surrenderedContributionPercentage, contributionAmount: totalContributedIncomeAmount};
  	return returnValue;
  }

  //Tax buckets are simple, just tax a percentage of the taxable income.
  updateTaxBucket(bucket:Bucket, income:number):ReturnValue{
    //If we're in a new year, set the annual total amount back to zero.
    if(this.info.month%12 == 1)
        bucket.annualTotal = 0;

    let totalContributedIncomeAmount:number = income * (bucket.contribution/100);
    //Update the stats of the bucket based on the results of the above calculations.
  	bucket.monthTotal	   =  totalContributedIncomeAmount;
  	bucket.annualTotal  += totalContributedIncomeAmount;
  	bucket.total		    += totalContributedIncomeAmount;
    //Return the values based on the above calculations.
    let returnValue:ReturnValue = {contributionPercentage: 0, contributionAmount: totalContributedIncomeAmount};
    return returnValue;
  }

  //Update the information of the 'spend' method bucket based on its characteristics and income.
  updateSpendBucket(bucket:Bucket, income:number, remainderContributionPercentage:number):ReturnValue{
    //If we're in a new year, set the annual total amount back to zero.
    if(this.info.month%12 == 1)
        bucket.annualTotal = 0;
    //Default the surrendered contribution percentage to the remainder passed in the function args and the current bucket's contribution percentage,
    //if this bucket has no contributions, this value will be returned to the calling function where the value will be added to the next bucket's
    //contribution amount.
  	let surrenderedContributionPercentage:number 	= (remainderContributionPercentage + bucket.contribution);
  	let totalContributedIncomeAmount:number 		= 0;
    //If the expense is recurring (taxes, budget expenses), then there is no limit to this bucket (like a decreasing debt balance). Calculate as normal.
  	if(bucket.expenseType == "recurring"){
  	  totalContributedIncomeAmount = 	income*(surrenderedContributionPercentage/100);
      surrenderedContributionPercentage = 0;
  	}
  	else if(bucket.debtBalance != 0){
      //There is a debt balance so then calculate the new debt balance from a month's progression (the interest added).
      bucket.debtBalance += bucket.debtBalance*(bucket.debtInterestRate/100);
      //Contribute up to the debt balance amount.
  	  totalContributedIncomeAmount = income*(surrenderedContributionPercentage/100);
  	  surrenderedContributionPercentage = 0;
  	  totalContributedIncomeAmount = (bucket.debtBalance-totalContributedIncomeAmount < 0 ? Math.abs(bucket.debtBalance-totalContributedIncomeAmount) : totalContributedIncomeAmount);

      bucket.debtBalance - totalContributedIncomeAmount;

      //Update the application-wide debt statistics for this month.
      this.info.debtBalanaceTotalMonth += bucket.debtBalance;
  	}

    //Update the statistics of the bucket.
  	bucket.monthTotal		=  totalContributedIncomeAmount;
  	bucket.annualTotal  += totalContributedIncomeAmount;
  	bucket.total			+= totalContributedIncomeAmount;

    //Return the values based on the above calculations.
    let returnValue:ReturnValue = {contributionPercentage: surrenderedContributionPercentage, contributionAmount: totalContributedIncomeAmount};

  	return returnValue;
  }

  //Reset the general statistics to zero.
  resetInfoStatistics():void{
    this.info.totalStreamsMonth = 0;
    this.info.totalStreamsAnnual = 0;
    this.info.totalStreams = 0;
    this.info.grossBucketsTotalMonth = 0;
    this.info.grossBucketsTotalAnnual = 0;
    this.info.grossBucketsTotal = 0;
    this.info.taxBucketsTotalMonth = 0;
    this.info.taxBucketsTotalAnnual = 0;
    this.info.taxBucketsTotal = 0;
    this.info.netBucketsTotalMonth = 0;
    this.info.netBucketsTotalAnnual = 0;
    this.info.netBucketsTotal = 0;
    this.info.investmentReturnsTotalMonth = 0;
    this.info.debtBalanaceTotalMonth = 0;
  }

  //Update the general statistics for the streams and buckets.
  calculateInfoStatistics():void{
    this.info.totalStreamsMonth = this.getItemsTotal("stream","month");
    this.info.totalStreamsAnnual = this.getItemsTotal("stream", "annual")
    this.info.totalStreams = this.getItemsTotal("stream", "total");
    this.info.grossBucketsTotalMonth = this.getItemsTotal("bucket", "month", "gross");
    this.info.grossBucketsTotalAnnual = this.getItemsTotal("bucket", "annual", "gross");
    this.info.grossBucketsTotal = this.getItemsTotal("bucket", "total", "gross");
    this.info.taxBucketsTotalMonth = this.getItemsTotal("bucket", "month", "taxes");
    this.info.taxBucketsTotalAnnual = this.getItemsTotal("bucket", "annual", "taxes");
    this.info.taxBucketsTotal = this.getItemsTotal("bucket", "total", "taxes");
    this.info.netBucketsTotalMonth = this.getItemsTotal("bucket", "month", "net");
    this.info.netBucketsTotalAnnual = this.getItemsTotal("bucket", "annual", "net");
    this.info.netBucketsTotal = this.getItemsTotal("bucket", "total", "net");
  }

  //Update the total contributions.
  updateBucketsContributionTotals():void{
    this.info.grossBucketsContributionPercentage = this.getItemsTotal("bucket", "contribution", "gross");
    this.info.taxBucketsContributionPercentage = this.getItemsTotal("bucket", "contribution", "taxes");
    this.info.netBucketsContributionPercentage = this.getItemsTotal("bucket", "contribution", "net");
  }

  //Compute the totals for a specific collection of objects (buckets (of a specific group) or streams) for a specific range (month, annual, total).
  getItemsTotal(object:string, range:string, type?:string):number{
    let objects:any = (object == "bucket" ? this.getBuckets(type) : this.getStreams());

    let total:number = 0;
    objects.forEach((item, index) => {
      if(range == "month")
        total += item.monthTotal;
      else if(range == "annual")
        total += item.annualTotal;
      else if(range == "total")
        total += item.total;
      else
        total += item.contribution;
    });
    return total;
  }

  //Transfer an amount before two buckets.
  transferBetweenBuckets(fromBucketID:string, toBucketID:string, amount:number):void{
    let fromBucket:Bucket = this.getBucketByID(fromBucketID);
    let toBucket:Bucket = this.getBucketByID(toBucketID);

    //Determine if the transfer amount affects the annual and month totals of the fromBucket.
    fromBucket.total -= amount;
    if(fromBucket.annualTotal > fromBucket.total)
      fromBucket.annualTotal = fromBucket.total;
    if(fromBucket.monthTotal > fromBucket.annualTotal)
      fromBucket.monthTotal = fromBucket.annualTotal;

    //Add the amount to all totals of the toBucket.
    toBucket.monthTotal += amount;
    toBucket.annualTotal += amount;
    toBucket.total  += amount;
  }

   modifyBucketTotal(bucketID:string, amount:number, method:string):void{
    let bucket:Bucket = this.getBucketByID(bucketID);
    amount = (method == "remove" ? -1 : 1)*amount;
    bucket.total += amount;

    //Propagate the changes throughout the bucket's total amount.
    if(bucket.annualTotal > bucket.total)
      bucket.annualTotal = bucket.total;
    if(bucket.monthTotal > bucket.total)
      bucket.monthTotal = bucket.total;

  }

  //Return bucket by ID.
  getBucketByID(ID:string):Bucket{
    for(let i:number = 0; i < this.grossBuckets.length; i++){
      if(this.grossBuckets[i].id == ID)
        return this.grossBuckets[i];
    }

    for(let i:number = 0; i < this.taxBuckets.length; i++){
      if(this.taxBuckets[i].id == ID)
        return this.taxBuckets[i];
    }

    for(let i:number = 0; i < this.netBuckets.length; i++){
      if(this.netBuckets[i].id == ID)
        return this.netBuckets[i];
    }
  }
}