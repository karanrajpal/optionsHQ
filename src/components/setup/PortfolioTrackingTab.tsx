"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useModulePreferences } from "@/context/ModulePreferencesProvider";
import { LuChartBar } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ConnectBroker from "../ConnectBroker";
import { useSnaptradeAccount } from "@/context/SnaptradeAccountsProvider";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { SiChase, SiRobinhood } from "react-icons/si";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export function PortfolioTrackingTab() {
  const { preferences, isLoading, updatePreferences } = useModulePreferences();
  const { accounts } = useSnaptradeAccount();
  const [isSaving, setIsSaving] = useState(false);

  const connectedBrokers = Array.from(new Set(Object.values(accounts).map(account => account.institution_name)));

  const handleToggle = async (checked: boolean) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await updatePreferences({ portfolio_tracking_enabled: checked });
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isEnabled = preferences?.portfolio_tracking_enabled ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <LuChartBar size={32} className="text-gray-700 dark:text-gray-300" />
        <div>
          <h2 className="text-2xl font-bold">Portfolio Tracking</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your portfolio tracking preferences including stocks, options, and performance monitoring.
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="space-y-6">
          {/* Enable Module Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Enable Module</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turn this module on or off
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isSaving || isLoading}
            />
          </div>

          {/* Add Broker Section */}
          <div className="border-t pt-6">
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-semibold">Broker Connections</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your brokerage accounts to track your portfolio
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-md font-medium">Connected Brokers</h4>
                {connectedBrokers.length > 0 ? (
                  connectedBrokers.map((broker) => (
                    <Item variant='outline' className="max-w-sm" key={broker}>
                      <ItemMedia>
                        {broker === 'Fidelity' && (<img src="/fidelity.png" alt="Fidelity Logo" className="w-6 h-6" />)}
                        {broker === 'Chase' && (<SiChase className="w-6 h-6" />)}
                        {broker === 'Robinhood' && (<SiRobinhood className="w-6 h-6" />)}
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{broker}</ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <Button variant="outline" size="sm" onClick={() => alert('Feature not ready')}>Disconnect</Button>
                      </ItemActions>
                    </Item>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No brokers connected.</p>
                )}
              </div>
              <Accordion type="single" collapsible className="max-w-sm">
                <AccordionItem value="snaptrade">
                  <AccordionTrigger>Add Broker</AccordionTrigger>
                  <AccordionContent>
                    <ConnectBroker enabled={isEnabled} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
