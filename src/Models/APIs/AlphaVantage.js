const { Configuration, OpenAIApi } = require('openai');

// Determine request type, if request type with dates, extract dates, form apiLink constructors, apiCall, summarizeApiCallData	


const orgId = process.env.ORG_ID;
const apiKey = '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';

const configuration = new Configuration({
    orgId: orgId,
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

export function AlphaVantage(query){

workflow(query).then(result => {
    console.log(result);
    });
      
    // this needs to be modified so that it is a conditional statement that checks the request type and then runs the function within the conditional statement. So, if the request type is one, I wan to have 
async function workflow(query) {
    console.log("AlphaVantage called with query:", query);
    console.log("Determining Request Type...");
    const requestType = await getRequestType(query);
    console.log("Extracting Info based on Request Type...");
    const subRequestType = await getSubRequestType(requestType, query);
    console.log("Sub Request Type:", subRequestType);
    const extractedInfo = await extractInfo(requestType, query);
    console.log("Extracting Sub Request Type Info...");
    const extractedSubInfo = await extractSubInfo( subRequestType, query);
    console.log("Forming API Links...");
    const apiLink = await formApiLink(requestType, subRequestType, extractedInfo, extractedSubInfo);
    console.log("API Link:", apiLink);
    console.log("Calling API...");
    const apiCallData = await callApi(apiLink);
    console.log("API Call:", apiCallData);
    console.log("Summarizing API Call Data...");
    const summarizedApiCallData = await summarizeApiCallData(requestType, subRequestType, apiCallData);
    console.log("Summarized API Call Data:", summarizedApiCallData);
    console.log("Returning Summarized API Call Data...");
    return summarizedApiCallData;
}   


   async function getRequestType(query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            View the query, determine the request type, return only the number associated with the request type 
            1. Core Stock APIS - Intraday, Daily, Weekly, Monthly, & Current Price.
            2. Alpha Intelligence - News & Sentiments, Winning Portfolios.
            3. Fundamental Data - Company Overview, Income Statement, Balance Sheet, Cash Flow, Earnings, Earnings Calendar, IPO Calendar
            4. Forex - Exchange Rates, Intraday, Daily, Weekly, Monthly
            5. Cryptocurrency - Intraday, Daily, Weekly, Monthly
            6. Commodities - Crude Oil(Brent), Natural Gas, Copper, Aluminum, Wheat, Corn, Cotton, Sugar, Coffee, Global Commodities Index
            7. Economic Indicators - Real GDP, Real GDP Per Capita, Treasury Yield, Federal Funds Interest Rate, CPI, Inflation, Retail Sales, Durable Goods Orders, Unemployment Rate, Nonfarm Payroll
            8. Technical Indicators - SMA, EMA, WMA, DEMA, TEMA, TRIMA, KAMA, MAMA, T3, MACD, MACDEXT, STOCH, STOCHF, RSI, STOCHRSI, WILLR, ADX, ADXR, APO, PPO, MOM, BOP, CCI, CMO, ROC, ROCR, AROON, AROONOSC, MFI, TRIX, ULTOSC, DX, MINUS_DI, PLUS_DI, MINUS_DM, PLUS_DM, BBANDS, MIDPOINT, MIDPRICE, SAR, TRANGE, ATR, NATR, AD, ADOSC, OBV, HT_TRENDLINE, HT_SINE, HT_TRENDMODE, HT_DCPERIOD, HT_DCPHASE, HT_PHASOR

            Here is the query: ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text;
    }
    // currently working on filling this out with the relevant data types in the docs for the different request types. // DONE
    // Then I have to figure out how to convert the variable requestType to an int. 
    // Then I have to figure out how to return the correct function based on the subRequestType.
    // Then I have to figure out how to extract the info based on the subRequestType. For example, subRequestType 1 is TIME_SERIES_INTRADAY, so I need to extract the date, time, and interval.
    // Then I have to write out the rest of the workflow, which involves extracting info, forming api links, calling apis, summarizing api call data, and returning summarized api call data.
    
    async function getSubRequestType(requestType, query) {
        switch (requestType) {
            case 1:
                return await coreStockAPIs(query);
                async function coreStockAPIs(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    })
                    return response.data.choices[0].text;
                }
            case 2:
                return await alphaIntelligence(query);
                async function alphaIntelligence(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }
            case 3:
                return await fundamentalData(query);
                async function fundamentalData(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }
            case 4:
                return await forex(query);
                async function forex(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }
            case 5:
                return await cryptocurrency(query);
                async function cryptocurrency(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }
            case 6:
                return await commodities(query);
                async function commodities(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }
            case 7:
                return await economicIndicators(query);
                async function economicIndicators(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }
            case 8:
                return await technicalIndicators(query);
                async function technicalIndicators(query){
                    const response = await openai.createCompletion({
                        engine: "text-davinci-003",
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
                    return response.data.choices[0].text;
                }

            default:
                return 'Invalid request type';
        }
    }
    
    async function extractInfo(requestType, query) {
        const response = await openai.createCompletion({
            engine: "text-davinci-003",
            prompt: `
            ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text;
    }

    async function extractSubInfo(subRequestType, query) {
        const response = await openai.createCompletion({
            engine: "text-davinci-003",
            prompt: `
            ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text;
    }

    async function formApiLink(requestType, extractedInfo) {
        const response = await openai.createCompletion({
            engine: "text-davinci-003",
            prompt: `
            ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text;       
    }

    async function callApi(apiLink) {
        const response = await openai.createCompletion({
            engine: "text-davinci-003",
            prompt: `
            ${query}
            `,
            max_tokens: 128,
            temperature: 0.5,

        })
        return response.data.choices[0].text;
    }
    async function summarizeApiCallData(requestType, apiCall) {

    }
}