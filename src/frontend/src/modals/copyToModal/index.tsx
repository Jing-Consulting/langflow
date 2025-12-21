import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import useAlertStore from "@/stores/alertStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import type { FlowType } from "@/types/flow";
import { api } from "@/controllers/API/api";
import { getURL } from "@/controllers/API/helpers/constants";
import BaseModal from "../baseModal";

interface CopyToModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    sourceFlow: FlowType;
}

export default function CopyToModal({
    open,
    setOpen,
    sourceFlow,
}: CopyToModalProps) {
    const [flows, setFlows] = useState<FlowType[]>([]);
    const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [copying, setCopying] = useState(false);

    const setSuccessData = useAlertStore((state) => state.setSuccessData);
    const setErrorData = useAlertStore((state) => state.setErrorData);
    const refreshFlows = useFlowsManagerStore((state) => state.refreshFlows);

    // Fetch all flows when modal opens
    useEffect(() => {
        if (open) {
            fetchFlows();
        }
    }, [open]);

    const fetchFlows = async () => {
        setLoading(true);
        try {
            const { data } = await api.get<FlowType[]>(`${getURL("FLOWS")}/?get_all=true`);
            // Filter out the source flow and components
            const filteredFlows = data.filter(
                (f) => f.id !== sourceFlow.id && !f.is_component
            );
            setFlows(filteredFlows);
        } catch (error) {
            setErrorData({ title: "Failed to load flows" });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!selectedFlowId) return;

        setCopying(true);
        try {
            // Fetch source flow data
            const { data: sourceData } = await api.get<FlowType>(
                `${getURL("FLOWS")}/${sourceFlow.id}`
            );

            // Fetch destination flow data
            const { data: destData } = await api.get<FlowType>(
                `${getURL("FLOWS")}/${selectedFlowId}`
            );

            // Get source nodes and edges
            const sourceNodes = sourceData.data?.nodes || [];
            const sourceEdges = sourceData.data?.edges || [];

            // Get destination nodes and edges
            const destNodes = destData.data?.nodes || [];
            const destEdges = destData.data?.edges || [];

            // Calculate position offset to avoid overlap
            const maxX = destNodes.reduce((max, node) =>
                Math.max(max, (node.position?.x || 0) + 300), 0
            );
            const offsetX = maxX + 100;

            // Generate unique suffix for this copy operation
            const copyTimestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);

            // Create ID mapping for nodes (old ID -> new ID)
            const idMap: Record<string, string> = {};
            sourceNodes.forEach((node: any) => {
                idMap[node.id] = `${node.id}_copy_${copyTimestamp}_${randomSuffix}`;
            });

            // Deep copy source nodes with new IDs and offset positions
            const offsetSourceNodes = sourceNodes.map((node: any) => {
                // Deep copy the entire node to break all references
                const deepCopiedNode = JSON.parse(JSON.stringify(node));

                // Update the node ID
                deepCopiedNode.id = idMap[node.id];

                // Offset position
                deepCopiedNode.position = {
                    x: (node.position?.x || 0) + offsetX,
                    y: node.position?.y || 0,
                };

                // Update any internal references within node.data if they exist
                if (deepCopiedNode.data && deepCopiedNode.data.id) {
                    deepCopiedNode.data.id = deepCopiedNode.id;
                }

                return deepCopiedNode;
            });

            // Deep copy edges with updated source/target references
            const offsetSourceEdges = sourceEdges.map((edge: any) => {
                // Deep copy the edge
                const deepCopiedEdge = JSON.parse(JSON.stringify(edge));

                // Generate new unique edge ID
                deepCopiedEdge.id = `${edge.id}_copy_${copyTimestamp}_${randomSuffix}`;

                // Update source and target to point to new node IDs
                deepCopiedEdge.source = idMap[edge.source] || edge.source;
                deepCopiedEdge.target = idMap[edge.target] || edge.target;

                // Update sourceHandle and targetHandle if they contain node IDs
                if (deepCopiedEdge.sourceHandle && idMap[edge.source]) {
                    deepCopiedEdge.sourceHandle = deepCopiedEdge.sourceHandle.replace(
                        edge.source, idMap[edge.source]
                    );
                }
                if (deepCopiedEdge.targetHandle && idMap[edge.target]) {
                    deepCopiedEdge.targetHandle = deepCopiedEdge.targetHandle.replace(
                        edge.target, idMap[edge.target]
                    );
                }

                return deepCopiedEdge;
            });

            // Merge nodes and edges
            const mergedData = {
                ...destData.data,
                nodes: [...destNodes, ...offsetSourceNodes],
                edges: [...destEdges, ...offsetSourceEdges],
            };

            // Update destination flow
            await api.patch(`${getURL("FLOWS")}/${selectedFlowId}`, {
                data: mergedData,
            });

            setSuccessData({
                title: `Components copied to "${destData.name}" successfully`,
            });

            // Refresh flows list
            if (refreshFlows) {
                refreshFlows();
            }

            setOpen(false);
        } catch (error) {
            console.error("Copy failed:", error);
            setErrorData({ title: "Failed to copy components" });
        } finally {
            setCopying(false);
        }
    };

    // Filter flows by search term
    const filteredFlows = flows.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <BaseModal open={open} setOpen={setOpen} size="medium">
            <BaseModal.Header description={`Select a destination flow to copy components from "${sourceFlow.name}"`}>
                <span className="pr-2">Copy To</span>
                <ForwardedIconComponent
                    name="ArrowRightToLine"
                    className="h-6 w-6 text-foreground"
                />
            </BaseModal.Header>
            <BaseModal.Content>
                <div className="flex flex-col gap-4">
                    {/* Search input */}
                    <Input
                        placeholder="Search flows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />

                    {/* Flow list */}
                    <div className="max-h-[300px] min-h-[200px] overflow-y-auto rounded-md border">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                Loading flows...
                            </div>
                        ) : filteredFlows.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                No flows found
                            </div>
                        ) : (
                            filteredFlows.map((flow) => (
                                <div
                                    key={flow.id}
                                    onClick={() => setSelectedFlowId(flow.id)}
                                    className={`flex cursor-pointer items-center gap-3 border-b p-3 transition-colors last:border-b-0 hover:bg-muted/50 ${selectedFlowId === flow.id ? "bg-primary/10" : ""
                                        }`}
                                >
                                    <div
                                        className={`h-4 w-4 rounded-full border-2 ${selectedFlowId === flow.id
                                            ? "border-primary bg-primary"
                                            : "border-muted-foreground"
                                            }`}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{flow.name}</span>
                                        {flow.description && (
                                            <span className="text-sm text-muted-foreground">
                                                {flow.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </BaseModal.Content>
            <BaseModal.Footer>
                <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button
                    onClick={handleCopy}
                    disabled={!selectedFlowId || copying}
                    loading={copying}
                >
                    {copying ? "Copying..." : "Copy Components"}
                </Button>
            </BaseModal.Footer>
        </BaseModal>
    );
}
