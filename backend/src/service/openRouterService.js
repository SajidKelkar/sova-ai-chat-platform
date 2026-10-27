import openRouter from "../config/openRouter.js";

export const generateAiResponse = async ({ model, messages }) => {
    const completion = await openRouter.chat.send({
        chatRequest: {
            model,
            messages
        }
    });

    const message = completion.choices?.[0]?.message;
    const content = message?.content ?? message?.refusal;
    const aiReply = typeof content === "string"
        ? content
        : Array.isArray(content)
            ? content
                .filter((part) => part?.type === "text" && typeof part.text === "string")
                .map((part) => part.text)
                .join("")
            : "";

    if (!aiReply.trim()) {
        throw new Error("OpenRouter returned an empty assistant response");
    }

    const promptTokens = completion.usage?.promptTokens ?? completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completionTokens ?? completion.usage?.completion_tokens ?? 0;
    const totalTokens = completion.usage?.totalTokens ?? completion.usage?.total_tokens ?? promptTokens + completionTokens;

    return {
        aiReply,
        model: typeof completion.model === "string" ? completion.model : model,
        usage: {
            promptTokens,
            completionTokens,
            totalTokens
        }
    };
};