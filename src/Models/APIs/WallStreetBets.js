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
        console.log("WSB called!");
        console.log("WSB-1: formingApiParams");
        const apiParams = await formApiParams(query);
        console.log("WSB-2: Making API Call with params:", apiParams)
        const apiCallData = await callApi(apiParams);
        console.log("WSB-3: Summarizing...")
        const summarizedApiCallData = await summarizeApiCallData(apiCallData, query); // STEP 7
        console.log("Final Step: Return Summary", summarizedApiCallData);
        return summarizedApiCallData;
    }
    const response = await workflow(query);
    return response;


    async function formApiParams(extractedInfo) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: Take in the query, and extract the time sentiment suggested, and format it like so:
            
            date=today            
            
            Possible Outputs:
            date=today
            date=yesterday
            date=this_week
            date=last_week
            date=this_month
            date=last_month

            example:
            query: What are the trending tocks for the last week?
            output: date=last_week

            extractedInfo: ${extractedInfo}
            `,
            max_tokens: 128,
            temperature: 0.5,
        })
        const formattedText = response.data.choices[0].text.trim();
        const functionIndex = formattedText.indexOf('date=');
        return formattedText.slice(functionIndex);
    }

    async function callApi(newApiParams) {
        const url = `https://wallstreetbets.p.rapidapi.com/?${newApiParams}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '72afef0eebmsh11f76b0091d62b7p17626bjsnea279a0c36ba',
                'X-RapidAPI-Host': 'wallstreetbets.p.rapidapi.com'
            }
        };
        const response = await fetch(url, options);
        const data = await response.text();
        console.log('Original data:', data);
        const trimmedData = data.replace(/\s/g, '').substring(0, 3000);
        console.log('Trimmed data:', trimmedData);
        return trimmedData;
    }

    async function summarizeApiCallData(apiCallData, query) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Instructions: 

            Data to be summarized: ${apiCallData}
            Question to be asked associated with data: ${query}

            `,
            max_tokens: 500,
            temperature: 0.5

        })
        return response.data.choices[0].text;
    }
}
