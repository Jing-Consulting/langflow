import { forwardRef, useEffect, useState } from "react";
import IconComponent from "@/components/common/genericIconComponent";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import useAlertStore from "@/stores/alertStore";
import useAuthStore from "@/stores/authStore";
import BaseModal from "../baseModal";
import { cn } from "@/utils/utils";

const V1_API_URL = "https://agents.jingconsult.online/api";

interface DeployToV1ModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    flowId: string;
    flowName: string;
}

interface V1Agent {
    id: number;
    name: string;
    description?: string;
    color?: string;
}

const DeployToV1Modal = forwardRef(
    (props: DeployToV1ModalProps, ref): JSX.Element => {
        const { open, setOpen, flowId, flowName } = props;
        const currentFlow = useFlowsManagerStore((state) => state.currentFlow);
        const setSuccessData = useAlertStore((state) => state.setSuccessData);
        const setErrorData = useAlertStore((state) => state.setErrorData);

        // Get Langflow access token - this will be verified by V1
        const accessToken = useAuthStore((state) => state.accessToken);

        const [loading, setLoading] = useState(false);
        const [deploying, setDeploying] = useState(false);
        const [agents, setAgents] = useState<V1Agent[]>([]);
        const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

        // Fetch custom agents from V1
        useEffect(() => {
            if (open) {
                fetchAgents();
            }
        }, [open]);

        const fetchAgents = async () => {
            setLoading(true);
            try {
                if (!accessToken) {
                    setErrorData({ title: "Not authenticated", list: ["Please login first"] });
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${V1_API_URL}/langflow/custom-agents`, {
                    headers: {
                        "X-Langflow-Token": accessToken,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Show all agents returned by backend (backend handles filtering by user role)
                    setAgents(data || []);
                } else if (response.status === 401) {
                    setErrorData({ title: "Authentication expired", list: ["Please re-login to V1"] });
                } else {
                    setErrorData({ title: "Failed to load agents", list: [await response.text()] });
                }
            } catch (error) {
                console.error("Error fetching agents:", error);
                setErrorData({ title: "Failed to load agents", list: [String(error)] });
            }
            setLoading(false);
        };

        const handleDeploy = async () => {
            if (!selectedAgentId || !currentFlow) {
                setErrorData({ title: "Please select an agent" });
                return;
            }

            setDeploying(true);
            try {
                // Get flow data
                const flowData = {
                    nodes: currentFlow.data?.nodes || [],
                    edges: currentFlow.data?.edges || [],
                    name: currentFlow.name,
                    description: currentFlow.description
                };

                const response = await fetch(`${V1_API_URL}/langflow/deploy`, {
                    method: "POST",
                    headers: {
                        "X-Langflow-Token": accessToken || "",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        flow_id: flowId,
                        agent_id: selectedAgentId,
                        flow_data: flowData,
                        deploy_message: `Deployed from MACP-AB: ${flowName}`
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    setSuccessData({
                        title: "Flow Deployed Successfully! 🚀",
                        list: [`${result.message}`]
                    });
                    setOpen(false);
                } else {
                    const errorText = await response.text();
                    setErrorData({ title: "Deployment failed", list: [errorText] });
                }
            } catch (error) {
                console.error("Error deploying:", error);
                setErrorData({ title: "Deployment failed", list: [String(error)] });
            }
            setDeploying(false);
        };

        return (
            <BaseModal
                size="medium"
                open={open}
                setOpen={setOpen}
                onSubmit={handleDeploy}
            >
                <BaseModal.Header description="Deploy this flow to a V1 custom agent">
                    <span className="pr-2">Deploy to V1 Agent</span>
                    <IconComponent
                        name="Rocket"
                        className="h-6 w-6 pl-1 text-foreground"
                        aria-hidden="true"
                    />
                </BaseModal.Header>
                <BaseModal.Content>
                    <div className="flex flex-col gap-4">
                        <div className="text-sm text-muted-foreground">
                            Select a custom agent to deploy this flow to. The flow will be executed
                            when users chat with this agent in V1.
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <IconComponent name="Loader2" className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading agents...</span>
                            </div>
                        ) : agents.length === 0 ? (
                            <div className="rounded-md border border-dashed p-6 text-center">
                                <IconComponent name="AlertCircle" className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    No custom agents found. Create a custom agent in V1 first.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {agents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        onClick={() => setSelectedAgentId(agent.id)}
                                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${selectedAgentId === agent.id
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-4 w-4 rounded-full"
                                                style={{ backgroundColor: agent.color || "#6366f1" }}
                                            />
                                            <div>
                                                <div className="font-medium">{agent.name}</div>
                                                {agent.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {agent.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </BaseModal.Content>

                <BaseModal.Footer
                    submit={{
                        label: deploying ? "Deploying..." : "Deploy",
                        loading: deploying,
                        disabled: !selectedAgentId || deploying,
                        dataTestId: "modal-deploy-v1-button",
                    }}
                />
            </BaseModal>
        );
    },
);

export default DeployToV1Modal;
