require("dotenv").config();
import express, { Request, Response, RequestHandler } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
});

const app = express();
app.use(cors())
app.use(express.json())

async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error.status === 429 && i < maxRetries - 1) {
                const retryAfter = parseInt(error.headers['retry-after']) || Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            throw error;
        }
    }
}

const templateHandler: RequestHandler = async (req, res, next) => {
    try {
        const prompt = req.body.prompt;
        
        const response = await retryWithBackoff(() => anthropic.messages.create({
            messages: [{
                role: 'user', content: prompt
            }],
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 200,
            system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
        }));

        const answer = (response.content[0] as TextBlock).text;
        if (answer === "react") {
            res.json({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [reactBasePrompt]
            });
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [nodeBasePrompt]
            });
            return;
        }

        res.status(403).json({message: "You cant access this"});
    } catch (error: any) {
        console.error('Error in /template:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Internal server error',
            error: error.error
        });
    }
};

const chatHandler: RequestHandler = async (req, res, next) => {
    try {
        const messages = req.body.messages;
        
        // Validate messages
        if (!Array.isArray(messages)) {
            res.status(400).json({ message: "Messages must be an array" });
            return;
        }

        // Filter out empty messages and validate content
        const validMessages = messages.filter(msg => 
            msg && 
            typeof msg === 'object' && 
            msg.role && 
            msg.content && 
            msg.content.trim() !== ''
        );

        if (validMessages.length === 0) {
            res.status(400).json({ message: "No valid messages provided" });
            return;
        }

        const response = await retryWithBackoff(() => anthropic.messages.create({
            messages: validMessages,
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            system: getSystemPrompt()
        }));

        res.json({
            response: (response.content[0] as TextBlock)?.text
        });
    } catch (error: any) {
        console.error('Error in /chat:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Internal server error',
            error: error.error
        });
    }
};

app.post("/template", templateHandler);
app.post("/chat", chatHandler);

app.listen(3000);
