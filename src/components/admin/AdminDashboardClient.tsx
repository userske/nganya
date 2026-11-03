"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Ticket,
  Vote,
  Settings,
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Camera,
  Download,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { updateEventSettingsAction, toggleCategoryStatusAction, voidVoteAction } from "@/app/actions/admin";
import { toast } from "sonner";

interface AdminDashboardClientProps {
  initialSettings: any;
  categories: any[];
  orders: any[];
  suspiciousIps: any[];
  auditLogs: any[];
  totalVotes: number;
}

export function AdminDashboardClient({
  initialSettings,
  categories,
  orders,
  suspiciousIps,
  auditLogs,
  totalVotes,
}: AdminDashboardClientProps) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [categoriesList, setCategoriesList] = useState(categories || []);
  const [categorySearch, setCategorySearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateEventSettingsAction({
        eventName: settings.event_name,
        tagline: settings.tagline,
        eventDate: settings.event_date,
        eventTime: settings.event_time,
        venueName: settings.venue_name,
        ticketSalesOpen: Boolean(settings.ticket_sales_open),
        resultsFrozen: Boolean(settings.results_frozen),
        votingOpensAt: settings.voting_opens_at,
        votingClosesAt: settings.voting_closes_at,
      });

      if (res.success) {
        toast.success("Event settings updated successfully!");
      } else {
        toast.error("Failed to update settings:", { description: res.error });
      }
    } catch {
      toast.error("Network error while saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleCategory = async (categoryId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, is_active: nextStatus } : c))
    );

    try {
      const res = await toggleCategoryStatusAction(categoryId, nextStatus);
      if (res.success) {
        toast.success(`Category ${nextStatus ? "activated" : "deactivated"}`);
      } else {
        toast.error("Failed to update category status");
      }
    } catch {
      toast.error("Network error while updating category status.");
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(`Database populated! Seeded ${json.categoriesCount} categories & ${json.nomineesCount} nominees.`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error("Failed to seed database", { description: json.error });
      }
    } catch {
      toast.error("Network error while seeding database");
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCategories = categoriesList.filter((c) =>
    (c.name || "").toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.group_name || "").toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredOrders = (orders || []).filter((o) =>
    (o.order_number || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.buyer_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.buyer_phone || "").toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Executive Operations Panel
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Awards Operations
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Real-time control over voting windows, ticket sales, categories, and gate admissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black font-bold h-11 px-5 rounded-xl shadow-lg">
            <Link href="/admin/scan">
              <Camera className="w-4 h-4 mr-2" />
              Door QR Scanner
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Verified Votes</span>
            <Vote className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalVotes.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Total Categories</span>
            <Trophy className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {categoriesList.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Ticket Orders</span>
            <Ticket className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {(orders || []).length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Flagged IP Clusters</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {(suspiciousIps || []).length}
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="settings" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Event Settings
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Categories & Nominees ({categoriesList.length})
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <Ticket className="w-3.5 h-3.5 mr-1.5" />
            Tickets & Orders
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Anti-Abuse Monitor
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <History className="w-3.5 h-3.5 mr-1.5" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Event Settings */}
        <TabsContent value="settings" className="mt-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm max-w-3xl">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b border-white/10">
              Event Configuration & Voting Controls
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Event Name</Label>
                  <Input
                    value={settings.event_name || ""}
                    onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Tagline</Label>
                  <Input
                    value={settings.tagline || ""}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Event Date</Label>
                  <Input
                    type="date"
                    value={settings.event_date || ""}
                    onChange={(e) => setSettings({ ...settings, event_date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Event Time</Label>
                  <Input
                    type="time"
                    value={settings.event_time || ""}
                    onChange={(e) => setSettings({ ...settings, event_time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs text-slate-300">Venue Name</Label>
                  <Input
                    value={settings.venue_name || ""}
                    onChange={(e) => setSettings({ ...settings, venue_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Ticket Sales Gate</div>
                    <div className="text-xs text-white/50">Allow attendees to purchase passes on /tickets</div>
                  </div>
                  <Switch
                    checked={Boolean(settings.ticket_sales_open)}
                    onCheckedChange={(checked) => setSettings({ ...settings, ticket_sales_open: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Freeze Public Results</div>
                    <div className="text-xs text-white/50">Lock leaderboard counts from updating publicly on /results</div>
                  </div>
                  <Switch
                    checked={Boolean(settings.results_frozen)}
                    onCheckedChange={(checked) => setSettings({ ...settings, results_frozen: checked })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingSettings}
                className="w-full bg-white hover:bg-white/90 text-black font-bold h-12 rounded-xl"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Tab 2: Categories */}
        <TabsContent value="categories" className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-xs text-slate-400">
                Showing {filteredCategories.length} categories
              </div>
              <Button
                size="sm"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-9 px-3.5 rounded-xl"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Seed Categories from JSON
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Group</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No categories found in database. Click &ldquo;Seed Categories from JSON&rdquo; above to populate all 61 categories.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white">{c.name}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{c.group_name || "Special"}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={c.is_active ? "default" : "secondary"}
                          className={c.is_active ? "bg-white/15 text-white border border-white/20 text-[10px]" : "bg-white/5 text-white/40 text-[10px]"}
                        >
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleCategory(c.id, c.is_active)}
                          className="text-xs text-white/70 hover:text-white"
                        >
                          {c.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Tickets & Orders */}
        <TabsContent value="tickets" className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by order ref, buyer name or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredOrders.length} orders
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Buyer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Qty / Total</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No ticket orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white font-mono">{o.order_number}</td>
                      <td className="p-3.5 text-white">{o.buyer_name}</td>
                      <td className="p-3.5 text-white/50">{o.buyer_phone}</td>
                      <td className="p-3.5 text-white">
                        {o.quantity} tkts • KES {Number(o.total_amount_kes).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          o.status === "confirmed" ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 4: Anti-Abuse */}
        <TabsContent value="security" className="mt-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2">
              Salted IP Cluster Monitoring
            </h2>
            <p className="text-xs text-white/50 mb-6 leading-relaxed">
              Kenya networks rely heavily on mobile carrier CGNAT (shared IP). The system logs salted hashes and flags clusters without blocking legitimate shared-network voters. Review clusters with unusually high activity below:
            </p>

            <div className="space-y-3">
              {(suspiciousIps || []).length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white/70 text-xs text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-white" />
                  No suspicious voting bursts or abnormal voter clusters detected.
                </div>
              ) : (
                suspiciousIps.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-white font-bold">IP Hash: {c.ip_hash.substring(0, 16)}...</span>
                      <span className="text-white/40 ml-4">{c.voters_count} accounts • {c.votes_count} votes</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-8 border-white/20 text-white hover:bg-white/10">
                      Flag / Review Cluster
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Audit Log */}
        <TabsContent value="audit" className="mt-6">
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {(auditLogs || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-white/40">
                      No admin actions logged yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white">{a.action}</td>
                      <td className="p-3.5 text-white">{a.entity_type} {a.entity_id ? `(#${a.entity_id})` : ""}</td>
                      <td className="p-3.5 text-white/40">{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
