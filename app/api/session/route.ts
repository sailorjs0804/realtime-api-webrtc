import { NextResponse } from 'next/server';

export async function POST() {
    try {
        if (!process.env.AZURE_OPENAI_API_KEY){
            throw new Error(`AZURE_OPENAI_API_KEY is not set`);

        }
        const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}/openai/realtimeapi/sessions?api-version=2025-04-01-preview`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: `${process.env.AZURE_DEPLOYMENT_NAME}`,
                voice: "alloy",
                modalities: ["audio", "text"],
                instructions:"Start conversation with the user by saying 'Hello, how can I help you today?' Use the available tools when relevant. After executing a tool, you will need to respond (create a subsequent conversation item) to the user sharing the function result or error. If you do not respond with additional message with function result, user will not know you successfully executed the tool. Speak and respond in the language of the user.",
                tool_choice: "auto",
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${JSON.stringify(response)}`);
        }

        const data = await response.json();

        // Return the JSON response to the client
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }


}
