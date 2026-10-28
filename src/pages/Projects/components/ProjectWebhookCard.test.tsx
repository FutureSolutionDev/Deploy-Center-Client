import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectWebhookCard } from "./ProjectWebhookCard";
import type { IProject } from "@/types";
import { HasSecret, IsMaskedSecret, SECRET_MASK } from "@/utils/secrets";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/contexts/RoleContext", () => ({
  useRole: () => ({ canManageProjects: true }),
}));

const project = {
  Id: 1,
  Name: "app",
  Secrets: { WebhookSecret: { HasValue: true } },
} as unknown as IProject;

describe("ProjectWebhookCard (SEC-H3 write-only secret)", () => {
  it("shows only whether the secret is set", () => {
    render(
      <ProjectWebhookCard
        project={project}
        onRegenerateWebhook={async () => undefined}
        onCopyToClipboard={() => undefined}
        regeneratingWebhook={false}
      />
    );
    expect(screen.getByDisplayValue("projects.secretSet")).toBeInTheDocument();
    expect(screen.queryByText("projects.webhookSecretShownOnce")).not.toBeInTheDocument();
  });

  it("reveals a freshly regenerated secret once", () => {
    render(
      <ProjectWebhookCard
        project={project}
        onRegenerateWebhook={async () => undefined}
        onCopyToClipboard={() => undefined}
        regeneratingWebhook={false}
        revealedSecret="new-secret-value"
      />
    );
    expect(screen.getByDisplayValue("new-secret-value")).toBeInTheDocument();
    expect(screen.getByText("projects.webhookSecretShownOnce")).toBeInTheDocument();
  });
});

describe("secrets helpers", () => {
  it("recognises the server mask and HasValue state", () => {
    expect(IsMaskedSecret(SECRET_MASK)).toBe(true);
    expect(IsMaskedSecret("plain")).toBe(false);
    expect(HasSecret({ X: { HasValue: false } }, "X", "legacy")).toBe(false);
    expect(HasSecret(undefined, "X", "legacy")).toBe(true);
    expect(HasSecret(undefined, "X", "")).toBe(false);
  });
});
