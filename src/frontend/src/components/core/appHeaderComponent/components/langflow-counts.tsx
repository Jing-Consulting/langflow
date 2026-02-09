import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import DiscordModal from "@/components/common/DiscordModal";

export const LangflowCounts = () => {
  const [showDiscordWidget, setShowDiscordWidget] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <ShadTooltip
          content="Contact JC Support"
          side="bottom"
          styleClasses="z-10"
        >
          <Button
            unstyled
            onClick={() => setShowDiscordWidget(true)}
            className="hit-area-hover flex items-center gap-2 rounded-md p-1 text-muted-foreground"
          >
            <div className="relative items-center rounded-md px-2 py-1 flex">
              <FaDiscord className="h-4 w-4" />
              <span className="text-xs font-semibold pl-2">
                Support
              </span>
            </div>
          </Button>
        </ShadTooltip>
      </div>

      {/* Discord Widget Modal */}
      <DiscordModal
        isOpen={showDiscordWidget}
        onClose={() => setShowDiscordWidget(false)}
      />
    </>
  );
};

export default LangflowCounts;


