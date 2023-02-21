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
        console.log("WSB-1: formingApiParams");
        const apiParams = await formApiParams(query);
        console.log("WSB-2: Making API Call with params:", apiParams)
        const apiCallData = await callApi(apiParams);
        return apiCallData;
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
        const trimmedData = data.replace(/\s/g, '').substring(0, 3000);
        return trimmedData;
    }

}
