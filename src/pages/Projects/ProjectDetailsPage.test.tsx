import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// SEC-H3 regression guard: the webhook secret is write-only, so the value the
// server returns on regeneration is the only copy. The page must hand it to
// the webhook card, and only for the project it was generated for.

const state = vi.hoisted(() => ({
  projectId: 1,
  mutate: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: String(state.projectId) }),
}));

vi.mock("@/hooks/useDateFormatter", () => ({
  useDateFormatter: () => ({ formatDateTime: (v: string) => v }),
}));

vi.mock("@/contexts/RoleContext", () => ({
  useRole: () => ({ isViewer: false, canManageProjects: false }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

vi.mock("@/hooks/useDeployments", () => ({
  useDeployments: () => ({ data: [] }),
}));

vi.mock("@/hooks/useProjects", () => ({
  useProject: (id: number) => ({
    data: { Id: id, Name: `project-${id}`, IsActive: true, Config: {} },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useProjectStatistics: () => ({ data: null }),
  useUpdateProject: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteProject: () => ({ mutate: vi.fn(), isPending: false }),
  useDeployProject: () => ({ mutate: vi.fn(), isPending: false }),
  useRegenerateWebhook: () => ({ mutate: state.mutate, isPending: false }),
}));

vi.mock("@/components/Projects/DeploymentModal", () => ({ DeploymentModal: () => null }));
vi.mock("@/components/Projects/ProjectFormModal", () => ({ ProjectFormModal: () => null }));
vi.mock("@/components/Projects/SshKeyManagement", () => ({ SshKeyManagement: () => null }));
vi.mock("./components/EnvironmentVariablesCard", () => ({ default: () => null }));
vi.mock("./components/ProjectNotificationsCard", () => ({ default: () => null }));

vi.mock("./components", () => ({
  ProjectHeader: () => null,
  ProjectInfoCard: () => null,
  ProjectConfigCard: () => null,
  ProjectPipelineCard: () => null,
  ProjectStatsCard: () => null,
  ProjectDeploymentsTable: () => null,
  ProjectMembersCard: () => null,
  ProjectWebhookCard: (props: { revealedSecret?: string | null; onRegenerateWebhook: () => void }) => (
    <div>
      <button onClick={props.onRegenerateWebhook}>regenerate</button>
      <output data-testid="revealed">{props.revealedSecret ?? "none"}</output>
    </div>
  ),
}));

import { ProjectDetailsPage } from "./ProjectDetailsPage";

const openAccessTab = () => {
  fireEvent.click(screen.getByRole("tab", { name: /Access/i }));
};

describe("ProjectDetailsPage webhook secret (SEC-H3)", () => {
  beforeEach(() => {
    state.projectId = 1;
    state.mutate.mockReset();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("passes the regenerated secret to the webhook card", () => {
    state.mutate.mockImplementation((_id: number, opts: { onSuccess: (s: string) => void }) =>
      opts.onSuccess("whsec_new_value")
    );
    render(<ProjectDetailsPage />);
    openAccessTab();
    expect(screen.getByTestId("revealed")).toHaveTextContent("none");

    fireEvent.click(screen.getByText("regenerate"));

    expect(state.mutate).toHaveBeenCalledWith(1, expect.anything());
    expect(screen.getByTestId("revealed")).toHaveTextContent("whsec_new_value");
  });

  it("does not show one project's secret on another project's page", () => {
    state.mutate.mockImplementation((_id: number, opts: { onSuccess: (s: string) => void }) =>
      opts.onSuccess("whsec_project_one")
    );
    const { rerender } = render(<ProjectDetailsPage />);
    openAccessTab();
    fireEvent.click(screen.getByText("regenerate"));
    expect(screen.getByTestId("revealed")).toHaveTextContent("whsec_project_one");

    state.projectId = 2;
    rerender(<ProjectDetailsPage />);

    expect(screen.getByTestId("revealed")).toHaveTextContent("none");
  });
});
