const { Configuration, OpenAIApi } = require('openai');
const orgId = "org-rnY9Z2LuVmBnRlAsfLipqzcf";
const apiKey = "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";

const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export async function WallStreetBets(query) {

    async function workflow(query) {
        console.log("Template called!");
        console.log("Step 1: gettingRequestType from query:", query)
        const requestType = await getRequestType(query); // STEP 1
        console.log("Step 2: processing requestType to int:", requestType);
        const firstDigit = requestType.replace(/\D/g, '')[0]; // STEP 2
        const extractedRequestType = parseInt(firstDigit); // STEP 2.5
        console.log("AV: Step 3: gettingSubRequestType from extractedRequestType & Query:", requestType, query);
        const subRequestType = await getSubRequestType(extractedRequestType, query); // STEP 3
        console.log("Step 4: extractingInfo from extractedRequestType & Query:", extractedRequestType, query);
        const extractedInfo = await extractInfo(extractedRequestType, query); // STEP 4
        console.log("Step 5: formingApiParams from extractedInfo and subRequestType:", extractedInfo, subRequestType);
        const apiParams = await formApiParams(subRequestType, extractedInfo) // STEP 5
        console.log("Making API Call with params:", apiParams)
        const apiCallData = await callApi(apiParams); // STEP 6
        console.log("Step 7: summarizingApiCallData with current date, requestType, subrequestType, apiCallData, and query:", requestType, subRequestType, apiCallData, query)
        const summarizedApiCallData = await summarizeApiCallData(requestType, subRequestType, apiCallData, query); // STEP 7
        console.log("Final Step: Return Summary", summarizedApiCallData);
        return summarizedApiCallData;
    }
    const response = await workflow(query);
    return response;
    // STEP 1
    async function getRequestType(query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `

            Here is the query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text.replace(/\D/g, '')[0];
    }
    // STEP 3: OPTIONAL 
    async function getSubRequestType(extractedRequestType, query) {
        if (extractedRequestType === 1) {
            try {
                let requestOne;
                requestOne = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `   

                    Query: ${query}
                    `,
                    max_tokens: 128,
                    temperature: 0.5,
                });
                console.log("requestOne:", requestOne);
                return requestOne.data.choices[0].text;
            } catch (error) {
                console.error("Error in createCompletion function:", error);
            }
        } else if (extractedRequestType === 2) {
            console.log("Case Three! Running now...");
            let requestFour;
            requestFour = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. Exchange Rates (CURRENCY_EXCHANGE_RATE)
            2. Intraday (FX_INTRADAY)
            3. Daily (FX_DAILY)
            4. Weekly (FX_WEEKLY)
            5. Monthly (FX_MONTHLY)
            
            Query: ${query}
            `,
                max_tokens: 128,
                temperature: 0.5,
            })
            return requestFour.data.choices[0].text;
        } else if (extractedRequestType === 3) {
            console.log("Case Three! Running now...");
            let requestFive;
            requestFive = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. Exhange Rates (CURRENCY_EXCHANGE_RATE)
            2. Intraday (CRYPTO_INTRADAY)
            3. Daily (CRYPTO_DAILY)
            4. Weekly (CRYPTO_WEEKLY)
            5. Monthly (CRYPTO_MONTHLY)

            Query: ${query}
            `,
                max_tokens: 128,
                temperature: 0.5,
            })
            return requestFive.data.choices[0].text;
        } else if (extractedRequestType === 4) {
            console.log("Case Four! Running now...");
            let requestSix;
            requestSix = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. Crude Oil, Brent (BRENT)
            2. Natural Gas (NATURAL_GAS)
            3. Copper (COPPER)
            4. Aluminum (ALUMINUM)
            5. Gold (GOLD)
            6. Wheat (WHEAT)
            7. Corn (CORN)
            8. Cotton (COTTON)
            9. Sugar (SUGAR)
            10. Coffee (COFFEE)
            11. Global Commodities Index (ALL_COMMODITIES)
    
            Query: ${query}
            `,
                max_tokens: 128,
                temperature: 0.5,
            })
            return requestSix.data.choices[0].text;
        } else {
            console.log("Invalid Request Type");
        }
    }
    // STEP 4
    async function extractInfo(extractedRequestType, query) {
        if (extractedRequestType === 1) {
            try {
                console.log("Extracting:")
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
 
                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (extractedRequestType === 2) {
            try {
                console.log("");
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
   
                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (extractedRequestType === 3) {
            try {
                console.log("");
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (extractedRequestType === 4) {
            console.log("");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Query: ${query}
                `,
                max_tokens: 128,
                temperature: 0.5
            })
            return response.data.choices[0].text;
        } else {
            console.log("Invalid Request Type");
        }
    }
    // STEP 5
    async function formApiParams(subRequestType, extractedInfo) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: Take in the function, and the extracted info, and format them like so:
            
            function=FUNCTION&extractedInfo1=EXTRACTEDINFO1&extractedInfo2=EXTRACTEDINFO2
            
            Example:
            
            function: TIME_SERIES_INTRADAY
            interval is 5min
            symbol = MSFT
            
            function=TIME_SERIES_INTRADAY&interval=5min&symbol=MSFT

            print out on one line.

            function: ${subRequestType}
            other info to extract: ${extractedInfo}
            `,
            max_tokens: 50,
            temperature: 0.5,
        })
        const formattedText = response.data.choices[0].text.trim();
        const functionIndex = formattedText.indexOf('function=');
        return formattedText.slice(functionIndex);
    }

    // STEP 6
    async function callApi(newApiParams) {
        const url = `https://alpha-vantage.p.rapidapi.com/query?${newApiParams}&datatype=json&output_size=compact`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '72afef0eebmsh11f76b0091d62b7p17626bjsnea279a0c36ba',
                'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
            }
        };
        const response = await fetch(url, options);
        const data = await response.text();
        console.log('Original data:', data);
        const trimmedData = data.replace(/\s/g, '').substring(0, 3000);
        console.log('Trimmed data:', trimmedData);
        return trimmedData;
    }

    // STEP 7
    async function summarizeApiCallData(requestType, subRequestType, apiCallData, query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: 

            DataSource: ${requestType},
            Request Type: ${subRequestType}
            Data to be summarized: ${apiCallData}
            Question to be asked associated with data: ${query}

            `,
            max_tokens: 450,
            temperature: 0.5

        })
        return response.data.choices[0].text;
    }
}
