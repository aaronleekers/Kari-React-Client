import { Configuration, OpenAIApi } from 'openai';
import { AlphaVantage } from './APIs/AlphaVantage';
import { WallStreetBets } from './APIs/WallStreetBets';
import { StockSentimentAPI } from './APIs/StockSentimentAPI';
import { GFinance } from './APIs/GFinance';
import { Crowdsense } from './APIs/Crowdsense';
import { SECFilings } from './APIs/SECFilings';



// LAST LEFT OFF ON: Figuring out how to get the workflow to run in sequence without fucking up.

const orgId = process.env.ORG_ID;
const apiKey = "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";

const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

export function KariFinancialAnalyst(query) {

    workflow(query).then(result => {
        console.log(result);
        return workflow;
        });
    

    // maps possible requestTypes to an array of associated functions for callback. functions are below.
    const requestFunctions = {
        1: AlphaVantage, //
        2: WallStreetBets, //  
        3: StockSentimentAPI, //
        4: GFinance, //  
        5: Crowdsense, // 
        6: SECFilings, 
    }

    // overall workflow. Decides which sub-workflow to execute, executes it, then returns the response.
   async function workflow(query) {
        console.log("Step 1: gettingRecommendedDataSources")
        const requestType = await getRecommendedDataSources(query); // NOTE: this is a promise.
        console.log("Step 2 getting response from requested function:",requestType);
        const requestOutput = await requestFunctions[requestType](query);
        return requestOutput;
    }
    
    async function getRecommendedDataSources(query) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `
        You are an artifical financial advisor. Your job is to view the user's request and determine the data sources most relevant to the request.
        These data sources are different APIs that provide different types of data. You will need to determine which data source is most relevant to the user's request.

        Potential Options:
           | Name | Description | How to Query |
        1. | AlphaVantage | Stock Price Data, Alpha Intelligence, Company Fundamentals, Company Financial Statements, Forex, Commodities, Economic Indicators, Technical Indicators | Specific Questions |
        2. | WallStreetBets | Stocks & Sentiment by Reddit posts on popular finance subreddits | Vague Requests, Trending Info |
        3. | StockSentimentAPI | Sentiment Analyis & News Articles by ticker | Specific or Vague questions |
        4. | GFinance | General market screening, get info by category (winners, losers, active, etc.) | Vague Requests, Trending Info |
        5. | Crowdsense | Cryptocurrency Sentiment Analsyis by scraping social media & predicting future spikes | Specific or Vague questions |
        6. | SECFilings | SEC filings for a public company by ticker, including Manager Ownership, Insider Transactions, and Manager Holdings | Specific or Vague questions |

        Output: The number of the data source you think is most relevant to the user's request.
        Message: ${query}     
        `,
        max_tokens: 128,
        temperature: .5,
        stop: "/n",
    });
    const requestType = response.data.choices[0].text;
  const intRequest = parseInt(requestType.match(/\d+/)[0]);
  return intRequest;
}
}
