export type AutomationAction = {
  id: string;
  label: string;
  params: string[];
};

const mockAutomationActions: AutomationAction[] = [
  {
    id: "send_email",
    label: "Send Email",
    params: ["to", "subject"],
  },
  {
    id: "generate_doc",
    label: "Generate Document",
    params: ["template", "recipient"],
  },
  {
    id: "create_account",
    label: "Create Account",
    params: ["system", "username"],
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAutomations(): Promise<AutomationAction[]> {
  await wait(300);
  return mockAutomationActions;
}
