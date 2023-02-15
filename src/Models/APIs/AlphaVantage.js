/**
 * AlphaVantage takes in a query, determines the request type, determines the subRequestType, extracts
 * the necessary information, forms the apiParams, calls the api, and summarizes the apiCallData
 * @param query - the query that the user is asking
 */

const { Configuration, OpenAIApi } = require('openai');

// Determine request type, if request type with dates, extract dates, form apiLink constructors, apiCall, summarizeApiCallData	

const orgId = "org-rnY9Z2LuVmBnRlAsfLipqzcf";
const apiKey = "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";

const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export function AlphaVantage(query){

workflow(query).then(result => {
    console.log(result);
    return workflow;
    });

async function workflow(query) {
    console.log("AlphaVantage called!");
    console.log("Step 1: gettingRequestType from query:", query)
    const requestType = await getRequestType(query); // STEP 1
    console.log("Step 2: processing requestType to int:", requestType);
    const firstDigit = requestType.replace(/\D/g, '')[0]; // STEP 2
    const extractedRequestType = parseInt(firstDigit); // STEP 2.5
    console.log("Step 3: gettingSubRequestType from extractedRequestType & Query:", requestType, query);
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

    // STEP 1
   async function getRequestType(query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            View the query, determine the request type, and output the whole line associated with the query, starting with the number.
            (1) Core Stock APIS - Intraday, Daily, Weekly, Monthly, & Current Price.
            (2) Alpha Intelligence - News & Sentiments, Winning Portfolios.
            (3) Fundamental Data - Company Overview, Income Statement, Balance Sheet, Cash Flow, Earnings, Earnings Calendar, IPO Calendar
            (4) Forex - Exchange Rates, Intraday, Daily, Weekly, Monthly
            (5) Cryptocurrency - Intraday, Daily, Weekly, Monthly
            (6) Commodities - Crude Oil(Brent), Natural Gas, Copper, Aluminum, Wheat, Corn, Cotton, Sugar, Coffee, Global Commodities Index
            (7) Economic Indicators - Real GDP, Real GDP Per Capita, Treasury Yield, Federal Funds Interest Rate, CPI, Inflation, Retail Sales, Durable Goods Orders, Unemployment Rate, Nonfarm Payroll
            (8) Technical Indicators - SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3, MACD, MACDEXT, STOCH, STOCHF, RSI, STOCHRSI, WILLR, ADX, ADXR, APO, PPO, MOM, BOP, CCI, CMO, ROC, ROCR, AROON, AROONOSC, MFI, TRIX, ULTOSC, DX, MINUS_DI, PLUS_DI, MINUS_DM, PLUS_DM, BBANDS, MIDPOINT, MIDPRICE, SAR, TRANGE, ATR, NATR, AD, ADOSC, OBV, HT_TRENDLINE, HT_SINE, HT_TRENDMODE, HT_DCPERIOD, HT_DCPHASE, HT_PHASOR

            Here is the query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text.replace(/\D/g, '')[0];
    }
    // STEP 3 
    async function getSubRequestType(extractedRequestType, query) {
        if (extractedRequestType === 1) {
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
                console.log("requestOne:", requestOne);
                return requestOne.data.choices[0].text;
            } catch (error) {
                console.error("Error in createCompletion function:", error);
            }     
        } else if (extractedRequestType === 2) {
        console.log("Case Two! Running now...");
        let requestTwo;
        requestTwo = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. News & Sentiments (NEWS_SENTIMENT)
            2. Winning Portfolios (TOURNAMENT_PORTFOLIO)

            Query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        console.log(requestTwo);
        return requestTwo.data.choices[0].text;
        } else if (extractedRequestType === 3) {
        console.log("Request Type 3! Running now...");
        let requestThree;
        requestThree = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. Company Overview (OVERVIEW)
            2. Income Statement (INCOME_STATEMENT)
            3. Balance Sheet (BALANCE_SHEET)
            4. Cash Flow (CASH_FLOW)
            5. Earnings (EARNINGS)
            6. IPO Calendar (IPO_CALENDAR)

            Query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,
        })
        return requestThree.data.choices[0].text;  
        } else if (extractedRequestType === 4) {
        console.log("Case Four! Running now...");
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
        } else if (extractedRequestType === 5) {
        console.log("Case Five! Running now...");
        let requestFive;
        requestFive =  await openai.createCompletion({
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
        } else if (extractedRequestType === 6) {
        console.log("Case Six! Running now...");
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
        } else if (extractedRequestType === 7) {
        console.log("Case Seven! Running now...");
        let requestSeven;
        requestSeven = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: View the query, and determine the subRequestType, which is the option that most closely matches the query.
            Return: The item in the parenthesis that corresponds to the subRequestType.
            1. REAL GDP (REAL_GDP)
            2. REAL GDP PER CAPITA (REAL_GDP_PER_CAPITA)
            3. TREASURY YIELD (TREASURY_YIELD)
            4. FEDERAL FUNDS RATE (FEDERAL_FUNDS_RATE)
            5. CPI (CPI)
            6. Inflation (INFLATION)
            7. Retail Sales (RETAIL_SALES)
            8. Durable Goods Orders (DURABLES)
            9. Unemployment Rate (UNEMPLOYMENT)
            10. NONFARM PAYROLLS (NONFARM_PAYROLL)

            Query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,
        })
        return requestSeven.data.choices[0].text;
        } else if (extractedRequestType === 8) {
        console.log("Case Eight! Running now...");
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
    async function extractInfo(extractedRequestType, query) {
        if (extractedRequestType === 1) { // extract stockName, interval 
            try {
            console.log("Extracting stockName & Interval!")
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: View the query, and extract the stock ticker symbol from it, and the interval period (1min, 5min, 15min, 30min, 60min)
                Defaults if N/A: symbol: AAPL, interval: 30min

                Return: The output prefaced by the label and a colon. (symbol: AAPL, interval: 30min);

                Query: ${query}
                `,
                max_tokens: 128,
                temperature: 0.5
            })
            return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (extractedRequestType === 2) { // extract stockName, unless winning portfolios, then no extraction.
            try {
            console.log("Extracting stockName, unless user chose winning portfolios!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: View the query, and extract the stock ticker symbol from it. If the request is mentioning winning portfolios, return the word "winning-portfolios"
                Defaults if N/a: symbol: AAPL
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
        } else if (extractedRequestType === 3) { // extract stockName
            try {
            console.log("Extracting stockName!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: View the query, and extract the stock ticker symbol from it. 
                Defaults if N/a: symbol: AAPL
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
        } else if (extractedRequestType === 4) { // extract fromCurrency, extract toCurrency, if only one currency, make it a USD pair. 
            try {
                console.log("Extracting fromCurrency, toCurrency!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: extract the currency pair from this request. If there is only one currency, compare it against USD.
                Output: fromCurrency: extracted currency in request, toCurrency: extracted currency in request or USD if N/A.
                Query: ${query}
                `,
                max_tokens: 128,
                temperature: 0.5
            })
            return response.data.choices[0].text;
            } catch (error) {
                console.error(error);
            }
        } else if (extractedRequestType === 5) { // extract fromCurrency, extract toCurrency, if only one currency, make it a USD pair. 
            try {
                console.log("Extracting fromCurrency, toCurrency!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: extract the currency pair from this request. If there is only one currency, compare it against USD.
                Output: fromCurrency: extracted currency in request, toCurrency: extracted currency in request or USD if N/A.
                Query: ${query}
                Context: There might be cryptocurrency pairs in this mix.
                `,
                max_tokens: 128,
                temperature: 0.5
            })
            return response.data.choices[0].text;
        } catch (error) {
            console.error(error);
        }
        } else if (extractedRequestType === 6) {  // extract interval if present
            try { 
                console.log("Extracting interval if present!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: extract the time interval if present in this query. If not present, return "monthly"
                Possible time intervals: daily, weekly, monthly
                Query: ${query}
                `,
                max_tokens: 128,
                temperature: 0.5
            })
            return response.data.choices[0].text;
        } catch (error) {
            console.error(error);
        }
        } else if (extractedRequestType === 7) { // extract interval if present
            try {
                console.log("Extracting interval if present!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: extract the time interval if present in this query. If not present, return "monthly"
                Possible time intervals: daily, weekly, monthly
                Query: ${query}
                `,
                max_tokens: 128,
                temperature: 0.5
            })
            return response.data.choices[0].text;
        } catch (error) {
            console.error(error);
        }
        } else if (extractedRequestType === 8) { // extract stockName, extract interval, time_period, series_type
            try {
                console.log("Extracting stockName, interval, time_period, and series_type!");
            let response;
            response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `
                Instructions: View the query, and extract the stock ticker symbol from it. Also, extract the time interval, time_period, and series type.
                Defaults if N/a: symbol: AAPL time_interval: daily, time_period: 200, series_type: open
                Return: The output prefaced by the label and a colon. (symbol: AAPL, time_interval: daily, time_period: 200, series_type: open )
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