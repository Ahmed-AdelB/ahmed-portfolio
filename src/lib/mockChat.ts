export async function getMockChatResponse(
  messages: { content: string }[],
): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();

  if (lastUserMessage.includes("skill")) {
    return "Ahmed's skills include Python, TypeScript, AI Security, and DevSecOps. He is also proficient with tools like Git, Docker, and Linux.";
  }

  if (lastUserMessage.includes("contact")) {
    return "You can contact Ahmed via email or LinkedIn. (Note: Real contact details would be provided here with the live API).";
  }

  if (
    lastUserMessage.includes("oss") ||
    lastUserMessage.includes("open source")
  ) {
    return "Ahmed has contributed to several Python projects and authored the 'github-reputation-toolkit'. He has over 7 PRs to major repositories.";
  }

  return "I am currently running in demo mode (no API key configured). I can tell you that Ahmed is an AI Security Researcher based in Ireland. Please add an ANTHROPIC_API_KEY to see my full capabilities!";
}
