import { Configuration, OpenAIApi } from 'openai';
import { AlphaVantage } from './APIs/AlphaVantage';
import { WallStreetBets } from './APIs/WallStreetBets';
import { StockSentimentAPI } from './APIs/StockSentimentAPI';
import { GFinance } from './APIs/GFinance';
import { Crowdsense } from './APIs/Crowdsense';
import { FinancialStatements } from './APIs/FinancialStatements';

const orgId = process.env.ORG_ID;
const apiKey = "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";

const configuration = new Configuration({
  orgId: orgId,
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export async function KariFinancialAnalyst(query) {
  /* This is a dictionary of functions that are called based on the output of the OpenAI API. */
  const requestFunctions = {
    1: AlphaVantage,
    2: WallStreetBets,
    3: StockSentimentAPI, // WORK ON 
    4: GFinance,
    5: Crowdsense, // WORK ON
    6: FinancialStatements, // WORK ON
  }

  /**
   * > The function `workflow` takes a query, and returns a response
   * @param query - the query string
   * @returns The response from the workflow function.
   */
  //async function workflow(query) {
  // console.log("KariFA-1: gettingRecommendedDataSources")
  // const requestType = await getDataSource(query);
  // console.log("KariFA-2 getting response from requested function:", requestType);
  // const requestOutput = await requestFunctions[requestType](query);
  // return requestOutput;
  // }

  // proposed new function
  async function workflow(query) {
    console.log("KFA-1: gettingVagueness")
    const vagueness = await getVagueness(query);
    console.log("Vagueness:", vagueness)
    if (vagueness < 5) {
      console.log("Hella vague bruh, trying to find some shit for you");
      const dataSources = await getDataSources(query);
      console.log("Okay we will do these sources:", dataSources);
      // this part will need to take the dataSources numbers,
      // and run the various functions associated with the datasources
      // and finally, it will put them all into an organized report.
      const data = await getData(query, dataSources);
      console.log(data);
      const report = await summarizeData(data);
      console.log(report);
      return report;
    } else if (vagueness > 5) {
      console.log("Thanks for the specific request, returning the exact thing u asked for")
      const dataSource = await getDataSource(query);
      console.log("I think it is this one:", dataSource);
      const requestOutput = await requestFunctions[dataSource](query);
      return requestOutput;
    }
  }

  async function getVagueness(query) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
        Instructions: This function determines the level of vagueness of a query related to obtaining financial information and insights, and rates it on a scale of 0 to 1. The function takes a query as input and returns a score.

        Examples:
        I: What is the current price of $TSLA? | O: 9 (very specific)
        I: What are the top five stocks on WSB? | O: 8 (fairly specific)
        I: What are the most active stocks today? | 0: 7 (somewhat vague)
        I: What are the loser stocks today? | O: 7 (somewhat vague)
        I: What are the most popular investments right now? | O: 4 (fairly vague)
        I: What is the latest insights in alternative data? | O: 3 (very vague)
        I: How is the stock market doing today? | O: 4 (fairly vague)
        I: What is the outlook for cryptocurrency? | O: 4 (fairly vague)
        I: Can you tell me about the latest economic trends? | O: 2 (very vague)
        I: How can I make money in the stock market? | O: 3 (very vague)
        I: What are some good investment opportunities? | O: 4 (fairly vague)

        Output only the number

        Query: ${query}
      `,
      max_tokens: 128,
    })
    const score = parseInt(response.data.choices[0].text);
    return score;
  };

  async function getDataSources(query) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
        You are an artifical financial advisor. Your job is to view the user's request and determine the data sources most relevant to the request.
        These data sources are different APIs that provide different types of data. You will need to determine which data sources are most relevant to the user's request.

        Potential Options:
           | Name | Description | How to Query |
        1. | AlphaVantage | Stock Price Data, Alpha Intelligence, Forex, Commodities, Economic Indicators, Technical Indicators | Specific Questions |
        2. | WallStreetBets | Stocks & Sentiment by Reddit posts on popular finance subreddits | Vague Requests, Trending Info |
        3. | StockSentimentAPI | Sentiment Analyis & News Articles by ticker | Specific or Vague questions |
        4. | GFinance | General market screening, get info by category (winners, losers, active, etc.) | Vague Requests, Trending Info, For overviews & Climate questions |
        5. | Crowdsense | Cryptocurrency Sentiment Analsyis by scraping social media & predicting future spikes | Specific or Vague questions |
        6. | FinancialStatements | SEC filings for a public company by ticker, including Manager Ownership, Insider Transactions, and Manager Holdings | Specific or Vague questions |

        Output: A list of datasources you think is most relevant to the user's request, separated by commas. Include number, name, and information about the datasource in the output. Choose up to 3.
        Message: ${query}
        `,
      max_tokens: 128,
      temperature: .5,
      stop: "/n",
    });
    return response.data.choices[0].text
  };

  async function getData(query, dataSource) {
    // this part will need to take the dataSources numbers,
    // and run the various functions associated with the datasources
    // and finally, it will put them all into an organized report.
  };

  async function summarizeData() {

  };

  /* This function is using the OpenAI API to determine which data source is most relevant to the
  user's request. */
  async function getDataSource(query) {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `
        You are an artifical financial advisor. Your job is to view the user's request and determine the data sources most relevant to the request.
        These data sources are different APIs that provide different types of data. You will need to determine which data source is most relevant to the user's request.

        Potential Options:
           | Name | Description | How to Query |
        1. | AlphaVantage | Stock Price Data, Alpha Intelligence, Forex, Commodities, Economic Indicators, Technical Indicators | Specific Questions |
        2. | WallStreetBets | Stocks & Sentiment by Reddit posts on popular finance subreddits | Vague Requests, Trending Info |
        3. | StockSentimentAPI | Sentiment Analyis & News Articles by ticker | Specific or Vague questions |
        4. | GFinance | General market screening, get info by category (winners, losers, active, etc.) | Vague Requests, Trending Info, For overviews & Climate questions |
        5. | Crowdsense | Cryptocurrency Sentiment Analsyis by scraping social media & predicting future spikes | Specific or Vague questions |
        6. | FinancialStatements | SEC filings for a public company by ticker, including Manager Ownership, Insider Transactions, and Manager Holdings | Specific or Vague questions |

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

  const response = await workflow(query);
  return response;
}
