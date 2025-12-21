import { useState, useCallback, useEffect } from "react";
import { FaDiscord } from "react-icons/fa";
import { X } from "lucide-react";

// Discord configuration for Jing Consult Support
const DISCORD_SERVER_ID = "1344858580519751775";
const DISCORD_CHANNEL_ID = "1442126237186396262"; // #jc-support channel
const DISCORD_WIDGET_JSON = `https://discordapp.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`;

// Widgetbot embed URL for actual channel chat
const WIDGETBOT_EMBED_URL = `https://e.widgetbot.io/channels/${DISCORD_SERVER_ID}/${DISCORD_CHANNEL_ID}`;

interface DiscordWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface WidgetData {
    name: string;
    presence_count: number;
}

export const DiscordWidgetModal = ({ isOpen, onClose }: DiscordWidgetModalProps) => {
    const [widgetData, setWidgetData] = useState<WidgetData | null>(null);

    // Fetch widget data for member count
    useEffect(() => {
        if (isOpen) {
            fetch(DISCORD_WIDGET_JSON)
                .then(res => res.json())
                .then(data => setWidgetData(data))
                .catch(() => setWidgetData(null));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const memberCount = widgetData?.presence_count ?? 0;

    return (
        <div
            data-jc-modal="discord"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-[420px] bg-[#313338] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#2b2d31]">
                    <div className="flex items-center gap-3">
                        <FaDiscord className="h-5 w-5 text-[#5865F2]" />
                        <span className="font-semibold text-white text-sm">#jc-support</span>
                        <span className="text-xs px-2 py-0.5 bg-[#23a559] rounded-full text-white">
                            {memberCount} online
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-[#3f4147] rounded-full transition-colors"
                    >
                        <X className="h-4 w-4 text-[#b5bac1]" />
                    </button>
                </div>

                {/* Widgetbot Live Chat */}
                <iframe
                    src={WIDGETBOT_EMBED_URL}
                    width="420"
                    height="500"
                    allowTransparency={true}
                    frameBorder="0"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-forms"
                    className="border-0 block bg-[#313338]"
                    title="JC Support Live Chat"
                />
            </div>
        </div>
    );
};

// Hook to manage Discord widget modal state
export const useDiscordWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openWidget = useCallback(() => setIsOpen(true), []);
    const closeWidget = useCallback(() => setIsOpen(false), []);

    return { isOpen, openWidget, closeWidget };
};

export default DiscordWidgetModal;


