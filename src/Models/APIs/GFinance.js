/**
 * AlphaVantage takes in a query, determines the request type, determines the subRequestType, extracts
 * the necessary information, forms the apiParams, calls the api, and summarizes the apiCallData
 * @param query - the query that the user is asking
 */

const { Configuration, OpenAIApi } = require('openai');

const orgId = "org-rnY9Z2LuVmBnRlAsfLipqzcf";
const apiKey = "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";

const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export async function GFinance(query) {

    async function workflow(query) {
        console.log("GF-1: extracting api params from info:", query);
        const apiParams = await formApiParams(query)
        console.log("GF-2: Making API Call with params:", apiParams)
        const apiCallData = await callApi(apiParams);
        console.log(apiCallData);
        return apiCallData;
    }
    const response = await workflow(query);
    return response;

    async function formApiParams(query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: view the query, and determine which of the options is closest to the request. 

            Options:
                indexes (All stock indexes)
                most-active (Most active stocks of the day)
                gainers (Stocks that gained the most during the day)
                losers (Stocks that lost the most during the day)
                climate-leaders (Stocks that are sustainable investments)
                cryptocurrencies (Cryptocurrencies)
                currencies (Currencies)


            Output: the word associated with the option you chose. all lowercase

            Query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        const formattedText = response.data.choices[0].text.trim();
        return formattedText;
    }

    // STEP 6
    async function callApi(apiParams) {
        const url = `https://g-finance.p.rapidapi.com/market-trends/?t=${apiParams}&s=en&gl=US`
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '72afef0eebmsh11f76b0091d62b7p17626bjsnea279a0c36ba',
                'X-RapidAPI-Host': 'g-finance.p.rapidapi.com'
            }
        };
        const response = await fetch(url, options);
        const data = await response.text();
        const trimmedData = data.replace(/\s/g, '').substring(0, 3000);
        return trimmedData;
    };

}