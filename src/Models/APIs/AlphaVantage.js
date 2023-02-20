/**
 * AlphaVantage takes in a query, determines the request type, determines the subRequestType, extracts
 * the necessary information, forms the apiParams, calls the api, and summarizes the apiCallData
 * @param query - the query that the user is asking
 */

const { Configuration, OpenAIApi } = require('openai');


// to do: move these to env variables
// 2. Make summary better


const orgId = "org-rnY9Z2LuVmBnRlAsfLipqzcf";
const apiKey = "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";

const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export async function AlphaVantage(query) {

    async function workflow(query) {
        console.log("AV-1: extracting requestType")
        const requestType = await getRequestType(query); // STEP 1
        console.log("AV-2: extracting subRequestType from requestType:", requestType);
        const subRequestType = await getSubRequestType(requestType, query); // STEP 3
        console.log("AV-3: extracting info");
        const extractedInfo = await extractInfo(requestType, query); // STEP 4
        console.log("AV-4: extracting api params from info:", extractedInfo);
        const apiParams = await formApiParams(subRequestType, extractedInfo) // STEP 5
        console.log("AV-5: Making API Call with params:", apiParams)
        const apiCallData = await callApi(apiParams); // STEP 6
        console.log("AV-5.5:", apiCallData);
        console.log("AV-6: Summarizing...");
        const summarizedApiCallData = await summarizeApiCallData(requestType, subRequestType, apiCallData, query); // STEP 7
        console.log("AV: Return Summary", summarizedApiCallData);
        return apiCallData;
    }
    const response = await workflow(query);
    return response;
    // STEP 1
    async function getRequestType(query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `

           Your task is to classify a given query into one of the following four categories:

            1. Core Stock APIS - Intraday, Daily, Weekly, Monthly, & Current Price (just stock prices)
            2. Forex - Fiat Exchange Rates, Intraday, Daily, Weekly, Monthly (just exchange rates)
            3. Cryptocurrency - Crypto Exchange Rates, Intraday, Daily, Weekly, Monthly (just exchange rates, but for crypto)
            4. Technical Indicators - SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3, MACD, MACDEXT, STOCH, STOCHF, RSI, STOCHRSI, WILLR, ADX, ADXR, APO, PPO, MOM, BOP, CCI, CMO, ROC, ROCR, AROON, AROONOSC, MFI, TRIX, ULTOSC, DX, MINUS_DI, PLUS_DI, MINUS_DM, PLUS_DM, BBANDS, MIDPOINT, MIDPRICE, SAR, TRANGE, ATR, NATR, AD, ADOSC, OBV, HT_TRENDLINE, HT_SINE, HT_TRENDMODE, HT_DCPERIOD, HT_DCPHASE, HT_PHASOR (technical indicators)

            Your program should be able to determine the request type based on the given query and output only the number that is associated with the relevant category.

            Here are some examples of the types of questions your program should be able to classify:

            - What is the current price of $TSLA? (1)
            - What are intraday prices for $TSLA? (1)
            - What are daily prices for $TSLA? (1)
            - What are weekly prices for $TSLA? (1)
            - What are monthly prices for $TSLA? (1)
            - What is the current exchange rate for $USD to $CAD? (2)
            - What is the intraday exchange rate for $USD to $CAD? (2)
            - What are daily exchange rates for $USD to $CAD? (2)
            - What are weekly exchange rates for $USD to $CAD? (2)
            - What are monthly exchange rates for $USD to $CAD? (2)
            - What is the current exchange rate for $BTC to $USD? (3)
            - What is the SMA for $TSLA? (4)

            Your program should be able to classify all of these queries accurately and output only the number that is associated with the relevant category. Good luck!

            Query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        const firstDigit = response.data.choices[0].text.replace(/\D/g, '')[0];
        const requestType = parseInt(firstDigit);
        return requestType;
    }
    // STEP 3 
    async function getSubRequestType(requestType, query) {
        if (requestType === 1) {
            try {
                let requestOne;
                requestOne = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
                    Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query. 
                    Return: The item in the parenthesis that corresponds to the subRequestType.
                    1. Intraday (TIME_SERIES_INTRADAY)
                    2. Daily (TIME_SERIES_DAILY)
                    3. Weekly (TIME_SERIES_WEEKLY)
                    4. Monthly (TIME_SERIES_MONTHLY)
                    5. Current Price (GLOBAL_QUOTE)
            
                    Query: ${query}
                    `,
                    max_tokens: 128,
                    temperature: 0.5,
                });
                return requestOne.data.choices[0].text;
            } catch (error) {
                console.error("Error in createCompletion function:", error);
            }
        } else if (requestType === 2) {
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
        } else if (requestType === 3) {
            let requestFive;
            requestFive = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. Exhange Rates (CURRENCY_EXCHANGE_RATE)
            
            Query: ${query}
            `,
                max_tokens: 128,
                temperature: 0.5,
            })
            return requestFive.data.choices[0].text;
        } else if (requestType === 4) {
            let requestEight;
            requestEight = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. SMA (SMA)
            2. EMA (EMA)
            3. WMA (WMA)
            4. DEMA (DEMA)
            5. TEMA (TEMA)
            6. TRIMA (TRIMA)
            7. KAMA (KAMA)
            8. MAMA (MAMA)
            9. T3 (T3)
            10. MACD (MACD)
            11. MACDEXT (MACDEXT)
            12. STOCH (STOCH)
            13. STOCHF (STOCHF)
            14. RSI (RSI)
            15. STOCHRSI (STOCHRSI)
            16. WILLR (WILLR)
            17. ADX (ADX)
            18. ADXR (ADXR)
            19. APO (APO)
            20. PPO (PPO)
            21. MOM (MOM)
            22. BOP (BOP)
            23. CCI (CCI)
            24. CMO (CMO)
            25. ROC (ROC)
            26. ROCR (ROCR)
            27. AROON (AROON)
            28. AROONOSC (AROONOSC)
            29. MFI (MFI)
            30. TRIX (TRIX)
            31. ULTOSC (ULTOSC)
            32. DX (DX)
            33. MINUS_DI (MINUS_DI)
            34. PLUS_DI (PLUS_DI)
            35. MINUS_DM (MINUS_DM)
            36. PLUS_DM (PLUS_DM)
            37. BBANDS (BBANDS)
            38. MIDPOINT (MIDPOINT)
            39. MIDPRICE (MIDPRICE)
            40. SAR (SAR)
            41. TRANGE (TRANGE)
            42. ATR (ATR)
            43. NATR (NATR)
            44. AD (AD)
            45. ADOSC (ADOSC)
            46. OBV (OBV)
            47. HT_TRENDLINE (HT_TRENDLINE)
            48. HT_SINE (HT_SINE)
            49. HT_TRENDMODE (HT_TRENDMODE)
            50. HT_DCPERIOD (HT_DCPERIOD)
            51. HT_DCPHASE (HT_DCPHASE)
            52. HT_PHASOR (HT_PHASOR)

            Query: ${query}
            `,
                max_tokens: 128,
                temperature: 0.5,
            })
            return requestEight.data.choices[0].text;
        } else {
            console.log("Invalid Request Type!")
        }
    }

    // STEP 4
    async function extractInfo(requestType, query, subRequestType) {
        if (requestType === 1) { // extract stockName, interval 
            try {
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
                Instructions: View the query, and extract the stock ticker symbol from it. View subRequestType: ${subRequestType}, if it is TIME_SERIES_INTRADAY, extract the interval as well, if no interval, set it to 30min. If it is not TIME_SERIES_INTRADAY, do not extract an interval.
                Defaults if N/A: symbol: AAPL
                Return: The output prefaced by the label and a colon. (symbol: AAPL)

                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (requestType === 2) { // extract fromCurrency, extract toCurrency, if only one currency, make it a USD pair. 
            try {
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
                Instructions: extract the currency pair from this request. If there is only one currency, compare it against USD. view ${subRequestType}, if it is FX_INTRADAY, extract the interval as well, if no interval, set it to 30min.
                Continued instructions: if the subRequestType is FX_ followed by anything, output the currency pairs as "from_symbol" and "to_symbol". If the subRequestType is CURRENCY_EXCHANGE_RATE, output the currency pairs as "from_currency" and "to_currency".
                Output: from_symbol (unless subRequestType is CURRENCY_EXCHANGE_RATE, then it is from_currency): extracted currency in request, to_symbol(unless subRequestType is CURRENCY_EXCHANGE_RATE, then it is to_currency): extracted currency in request or USD if N/A, interval (if subRequestType is INTRADAY): extracted interval in request or 30min if N/A.
                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (requestType === 3) { // extract fromCurrency, extract toCurrency, if only one currency, make it a USD pair. 
            try {
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
                Instructions: extract the currency pair from the Query. If there is only one currency, compare it against USD.
                Output: from_currency: extracted currency in request, to_currency: extracted currency in request or USD if N/A.
                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (requestType === 4) { // extract stockName, extract interval, time_period, series_type
            try {
                let response;
                response = await openai.createCompletion({
                    model: "text-davinci-003",
                    prompt: `
                Instructions: View the query, and extract the stock ticker symbol from it. Also, extract the time interval, time_period, and series type. (series_type can be close, open, high, low)
                Defaults if N/a: symbol: AAPL interval: daily, time_period: 200, series_type: open
                Return: The output prefaced by the label and a colon. (symbol: AAPL, interval: daily, time_period: 60, series_type: open )
                Query: ${query}
                `,
                    max_tokens: 128,
                    temperature: 0.5
                })
                return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
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

            order of organization
            1. function
            2. interval (if interval is present)
            3. everything else

            lowercase operators

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
        const trimmedData = data.replace(/\s/g, '').substring(0, 3000);
        return trimmedData;
    }


    // STEP 7
    async function summarizeApiCallData(requestType, subRequestType, apiCallData, query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
                Instructions:

                Summarize the following data in a clear and concise format:

                Data Source: ${requestType}
                Sub-Request Type: ${subRequestType}
                Data: ${apiCallData}
                Answer the following question based on the data:

                ${query}

                Your summary should include the most important insights 
                from the data, presented in a way that is easy to understand. 
                Be sure to include any key statistics or trends that are relevant 
                to the question being asked. Avoid including irrelevant or extraneous 
                information, and focus on presenting the most important data in a way 
                that supports your answer.
            `,
            max_tokens: 450,
            temperature: 0.5

        })
        return response.data.choices[0].text;
    }

}