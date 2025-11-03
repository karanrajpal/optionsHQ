'use client';

import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StrategyTab } from '@/components/StrategyTab';

export type AugmentedAlpacaOptionSnapshot = import('@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2').AlpacaOptionSnapshot & {
  expectedReturnPercentage?: number;
  expectedAnnualizedReturnPercentage?: number;
};

export type StrategyType = 'make-premiums' | 'leaps';
export default function Discover() {
  return (
    <main className="flex min-h-screen flex-col items-center p-7">
      <div className="w-full max-w-7xl space-y-2">
        <PageHeader header="Options Discovery" />
        <div className="space-y-2">
          <Tabs defaultValue="make-premiums" className="w-full">
            <TabsList>
              <TabsTrigger value="make-premiums">Make Premiums</TabsTrigger>
              <TabsTrigger value="leaps">LEAPS</TabsTrigger>
            </TabsList>
            <TabsContent value="make-premiums">
              <StrategyTab strategyType="make-premiums" />
            </TabsContent>
            <TabsContent value="leaps">
              <StrategyTab strategyType="leaps" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
