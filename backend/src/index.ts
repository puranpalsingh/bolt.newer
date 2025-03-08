import * as dotenv from 'dotenv';
dotenv.config();

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

import { Anthropic } from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
    apiKey : CLAUDE_API_KEY,
});



async function main(){
    anthropic.messages.stream({
        messages: [{
            role : "user",
            content : "what is 2 + 2?"
        }],
        model : "claude-3-5-sonnet-20240620",
        max_tokens : 1024,
        temperature : 0,
    }).on("text", (text) => {
        console.log(text);
    });
    
}

main();
